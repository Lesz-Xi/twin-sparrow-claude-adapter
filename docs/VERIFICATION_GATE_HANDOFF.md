# Handoff — Verification Gate MVP (the "catch" layer)

> **Owner:** Chief · **Companion:** Solaris (design) → Atoman (build)
> **Status:** ready to build · **Est. size:** ~2 hooks + 1 capsule + hooks.json + tests (one reviewable PR)
> **Provenance:** falls out of *Experiment 01 — Loop-Economics*
> (`~/.twin-sparrow/agent/memory/Yt Transcribe/Naval & YC Combinator/Experiment-01-Loop-Economics/`).

---

## 1. Why this exists (one paragraph)

Experiment 01 turned the Naval-vs-Daniel argument into one metric — **cost per _successful_ task** — and found the decisive lever is **not** which model you route to; it's **whether the loop catches its own errors** (the eval-gate catch rate). With no catch, the sweep showed the loop losing ~2.7× because uncaught errors compound. The Claude adapter today has **only prospective gates** (source-grounding, artifact-review, verification-required) that *tell Claude to be careful* on `UserPromptSubmit` — and **no retrospective catch** that checks whether the turn was actually right before it closes. This MVP adds the missing catch. It realizes **Solaris = the controller that holds claims to proof** as a real mechanism, and mirrors the coding-agent's `proof-obligations/` + `truth-engine.ts` one layer up.

## 2. The gap, in the adapter's own types

- `src/state/schema.ts` already defines the proof-obligation ledger:
  ```ts
  workingState.verification: { readonly required: readonly string[]; readonly completed: readonly string[] }
  ```
  and `session.phase: "exploring" | "planning" | "implementing" | "verifying" | "closing"`.
- `src/capsules/working-state-capsule.ts` only **renders** `required`/`completed` as text.
- `hooks/hooks.json` wires only `SessionStart` and `UserPromptSubmit` — **both pre-turn**.
- `src/hooks/twin-turn-router.ts` emits only `hookSpecificOutput.additionalContext` — **never a `decision: block`.**

Net: `verification.completed` is **never written**, and nothing enforces `required ⊆ completed`. Catch rate ≈ 0.

## 3. Design (MVP scope)

Two cooperating hooks close the loop; one capsule explains the block. **Keep it conservative — a false _pass_ is the expensive failure (lets a wrong turn through); a false _block_ is merely annoying and is hard-bounded so it degrades to a warning.**

```
UserPromptSubmit (exists)  → turn-router opens obligations into verification.required (already happens via classifier/phase)
PostToolUse      (NEW)     → instrument: on unambiguous pass evidence, append to verification.completed; on failure, log a caught error
Stop             (NEW)     → gate: if phase ∈ {verifying, closing} AND required ⊄ completed AND not already looping → decision:"block"
```

- **`PostToolUse` = the instrument (the catch).** Ground truth lives here: exit codes, test/lint/type/build results. It is the only thing that writes `verification.completed`, and it writes **only** on explicit success signals. Never fabricates.
- **`Stop` = the enforcement.** Refuses to end a turn with open obligations, and hands Claude a precise reason. Bounded against infinite loops (see §6).

### Why both are in the MVP
Within a single user turn there is **no** second `UserPromptSubmit`; a `Stop` block makes Claude continue in the *same* turn. So a Stop gate alone could never clear (nothing writes `completed`). The `PostToolUse` instrument is what lets the gate clear from evidence within the turn. They are minimal *together*.

## 4. Build plan (file by file)

All new code follows existing idioms: ESM `.js` import specifiers, `readonly` interfaces, a `handleX(options)` pure-ish core + `isMainModule(import.meta.url)` entrypoint that reads stdin and writes JSON to stdout. Use `tests/hooks/turn-router.test.ts` and `src/hooks/twin-session-start.ts` as templates.

### 4.1 `src/capsules/verification-gate-capsule.ts` (NEW)
Small render function + exported class constant, matching `source-grounding-capsule.ts`.

```ts
import type { TwinAdapterState } from "../state/schema.js";

export const VERIFICATION_GATE_CAPSULE_CLASS = "verification-gate";

/** Pure: returns the list of required obligations not yet in completed. */
export function openObligations(state: TwinAdapterState): readonly string[] {
  const done = new Set(state.workingState.verification.completed.map((s) => s.trim().toLowerCase()));
  return state.workingState.verification.required.filter((r) => !done.has(r.trim().toLowerCase()));
}

/** Pure: should the Stop gate block this turn's closure? */
export function shouldBlockClose(state: TwinAdapterState): boolean {
  const gating = state.session.phase === "verifying" || state.session.phase === "closing";
  return gating && openObligations(state).length > 0;
}

/** Human-readable reason handed back to Claude on block. */
export function renderVerificationBlockReason(state: TwinAdapterState): string {
  const open = openObligations(state);
  return [
    "Twin-Sparrow verification gate: this turn cannot close — proof obligations are unmet.",
    "Unverified:",
    ...open.map((o) => `- ${o}`),
    "Resolve each by running the relevant check (test/lint/typecheck/build) and confirming it passes,",
    "or explicitly downgrade the obligation if it no longer applies, then finish.",
  ].join("\n");
}
```

### 4.2 `src/hooks/twin-verification-gate.ts` (NEW — the `Stop` hook)
```ts
import { fileURLToPath } from "node:url";
import { renderVerificationBlockReason, shouldBlockClose, openObligations } from "../capsules/verification-gate-capsule.js";
import { appendLedgerEvent, resolveDefaultLedgerPath } from "../state/ledger.js";
import { readTwinAdapterState, resolveDefaultStatePath, updateTwinAdapterState } from "../state/safe-state-store.js";

export interface StopHookInput {
  readonly stop_hook_active?: boolean; // Claude Code: true when already continuing from a prior Stop block
  readonly session_id?: string;
}
export interface StopResult {
  readonly outputJson: Record<string, unknown>; // {} = allow close; {decision:"block", reason} = continue
  readonly warnings: readonly string[];
}

const MAX_BLOCKS_PER_ARC = 2; // hard bound → degrade to warning, never infinite-loop

export function handleStop(rawInput: string, opts: { statePath?: string; now?: string } = {}): StopResult {
  const statePath = opts.statePath ?? resolveDefaultStatePath();
  const now = opts.now ?? new Date().toISOString();
  const input = safeParse(rawInput) as StopHookInput;
  const read = readTwinAdapterState(statePath);

  // Guard 1: Claude is already looping from our block → do NOT block again.
  if (input.stop_hook_active) {
    return { outputJson: {}, warnings: read.warnings };
  }
  if (!shouldBlockClose(read.state)) {
    return { outputJson: {}, warnings: read.warnings };
  }

  // Guard 2: hard cap on blocks per arc (counter lives in the ledger; see §6).
  const priorBlocks = countArcBlocks(resolveDefaultLedgerPath(statePath), read.state.session.arcId);
  if (priorBlocks >= MAX_BLOCKS_PER_ARC) {
    appendLedgerEvent(
      { type: "verification_gate_warn", at: now,
        details: { arcId: read.state.session.arcId, open: openObligations(read.state) } },
      resolveDefaultLedgerPath(statePath),
    );
    return { outputJson: {}, warnings: [...read.warnings, "verification-gate: max blocks reached, downgraded to warning"] };
  }

  const reason = renderVerificationBlockReason(read.state);
  appendLedgerEvent(
    { type: "verification_gate_block", at: now,
      details: { arcId: read.state.session.arcId, open: openObligations(read.state) } },
    resolveDefaultLedgerPath(statePath),
  );
  return { outputJson: { decision: "block", reason }, warnings: read.warnings };
}

// safeParse / countArcBlocks helpers + isMainModule entrypoint (stdin → JSON stdout) as in twin-turn-router.ts
```

### 4.3 `src/hooks/twin-posttooluse-instrument.ts` (NEW — the `PostToolUse` hook)
Writes `verification.completed` **only** on unambiguous success; logs caught errors on failure. No blocking.

```ts
export interface PostToolUseInput {
  readonly tool_name?: string;            // e.g. "Bash"
  readonly tool_input?: { command?: string };
  readonly tool_response?: { exitCode?: number; stdout?: string; stderr?: string; error?: string };
}

const VERIFY_PATTERNS = [/\btest\b/i, /\bvitest\b/i, /\bjest\b/i, /node --test/i, /\blint\b/i, /biome/i, /tsc\b/i, /typecheck/i, /\bbuild\b/i];

/** Category tag so a passing `lint` doesn't close a `tests pass` obligation. Returns null if not a verification command. */
export function verificationCategory(cmd: string): "test" | "lint" | "type" | "build" | null { /* keyword map */ }

export function handlePostToolUse(rawInput: string, opts: { statePath?: string; now?: string } = {}) {
  // Parse; only act on tool_name === "Bash" with a command matching VERIFY_PATTERNS.
  // On exit 0 + category C: append a completed marker "<C>: <command>" IF an open obligation shares category C.
  //   → prefer NOT to close when no category match (false-block > false-pass).
  // On exit != 0: appendLedgerEvent { type:"verification_caught_error", details:{category, command} }.
  // Always exit 0 with {} (never blocks). Update state via updateTwinAdapterState.
}
```

> **Matching rule (conservative):** only close an obligation whose text shares the command's category (`test`/`lint`/`type`/`build`). If no category match, **do not** close — a false pass is worse than an extra block. Per-obligation string matching is a Phase-2 refinement.

### 4.4 `hooks/hooks.json` (EDIT — add two entries)
```jsonc
"PostToolUse": [
  { "matcher": "Bash",
    "hooks": [ { "type": "command",
      "command": "node \"${CLAUDE_PLUGIN_ROOT}/dist/src/hooks/twin-posttooluse-instrument.js\"",
      "timeout": 5, "statusMessage": "Twin-Sparrow verification instrument..." } ] }
],
"Stop": [
  { "hooks": [ { "type": "command",
    "command": "node \"${CLAUDE_PLUGIN_ROOT}/dist/src/hooks/twin-verification-gate.js\"",
    "timeout": 5, "statusMessage": "Twin-Sparrow verification gate..." } ] }
]
```
Verify field names (`matcher`, `Stop`, `PostToolUse`) against the installed Claude Code version — see §7.

### 4.5 Ledger event types (EDIT `src/state/ledger.ts` `LedgerEvent`)
Add `verification_gate_block`, `verification_gate_warn`, `verification_caught_error` to the event `type` union. These three events are also the **catch-rate telemetry** for validating Experiment 01 against real usage later.

## 5. Tests (mirror `tests/hooks/*`, add fixtures)

`tests/hooks/verification-gate.test.ts`:
1. phase `implementing`, open obligations → **allow** (gate only fires in verifying/closing).
2. phase `closing`, `required=["tests pass"]`, `completed=[]` → **block** with reason naming "tests pass".
3. phase `closing`, `required ⊆ completed` → **allow**.
4. `stop_hook_active: true` → **allow** (loop guard), even with open obligations.
5. `MAX_BLOCKS_PER_ARC` reached → **allow** + warning + `verification_gate_warn` ledger event.

`tests/hooks/posttooluse-instrument.test.ts`:
6. Bash `npm test` exit 0, open obligation "tests pass" → appends completed marker (category match).
7. Bash `npm run lint` exit 0, open obligation "tests pass" → does **not** close (category mismatch).
8. Bash `npm test` exit 1 → no close, logs `verification_caught_error`.
9. Non-Bash tool → no-op.

Add hook-event fixtures to `tests/fixtures/claude-hook-events.ts`. Run `npm run check` (build + `node --test`) — must be green.

## 6. Risks & guards (the part that matters)

| Risk | Guard |
|------|-------|
| **Infinite Stop-block loop** | Honor `stop_hook_active` (Guard 1) — never block when already looping. |
| **User trapped by a stubborn obligation** | `MAX_BLOCKS_PER_ARC = 2`, counted from ledger; then downgrade to warning (Guard 2). |
| **False pass (lets a broken turn close)** | Instrument closes obligations **only** on exit 0 **and** category match; prefers not to close. |
| **Over-eager gating** | Gate fires **only** in `verifying`/`closing` phases, not during `implementing`. |
| **State bloat / concurrent writes** | Use `updateTwinAdapterState` (read-modify-write); `MAX_STATE_BYTES` (64 KB) already enforced. |
| **Hook latency** | `timeout: 5`s like existing hooks; all logic is local, no model calls. |

## 7. Assumptions to verify before/while building
- **Claude Code hook contract** (`Stop` → `{decision:"block", reason}`; `stop_hook_active`; `PostToolUse` → `tool_name`/`tool_input`/`tool_response`; `matcher`). Confirm against the installed CLI version; adjust field names if they differ. Do not assume — check.
- **Who sets `session.phase` to verifying/closing.** Confirm the turn-router/classifier already advances the arc; if not, add minimal phase advancement (out-of-scope note below).
- **Who populates `verification.required`.** Confirm the classifier opens obligations for debug/implementation tasks; if it doesn't yet, the gate is inert until it does (thread this in a follow-up).

## 8. Acceptance criteria
- `npm run check` green (build + all tests incl. the 9 new ones).
- With a debug task in `closing` phase and an unmet obligation, Claude receives a block with a precise reason and cannot close until a real passing check is observed.
- `stop_hook_active` and `MAX_BLOCKS_PER_ARC` both demonstrably prevent loops (tests 4–5).
- Ledger shows `verification_gate_block` / `verification_caught_error` events after a manual run.
- Add a manual walk-through to `docs/CLAUDE_SMOKE_TEST.md` (its existing format): open obligation → block → run tests → PostToolUse closes it → clean close.

## 9. Out of scope (Phase 2+)
- Per-obligation string matching (beyond category tags).
- Transcript-aware completion-claim detection ("done/fixed/passing" in Claude's prose via `transcript_path`).
- **Catch-rate metric** exported from the ledger → feeds real numbers back into `loop-economics.mjs`, replacing the priors (closes the loop with Experiment 01).
- Controller/body model routing itself (that's the coding-agent layer, `step-role.ts`) — this handoff builds the *gate*, which the experiment showed is the higher-value half.

## 10. One-line framing for the reviewer
> This PR doesn't make Twin-Sparrow smarter or cheaper. It makes it able to **know when it was wrong** — the one asset the experiment showed is scarce, buildable, and un-distillable, and the thing that makes everything cheap around it safe to use.
