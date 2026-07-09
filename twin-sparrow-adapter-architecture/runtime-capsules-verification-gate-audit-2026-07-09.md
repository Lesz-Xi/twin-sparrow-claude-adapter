# Twin-Sparrow Adapter Architecture Audit — Runtime Capsules + Verification Gate

Date: 2026-07-09  
Workspace: `/Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter`  
Scope: runtime capsules, Claude Code/Codex host adapters, verification instrument, Stop verification gate  
Result: **architecture direction is right; current verification gate is not yet fundamentally trustworthy in the default implementation path.**

[architect-review] Protocol engaged. Source skills required: oppus-reasoning-contract, expert-engineer.  
[deep-audit] Protocol engaged. Source skills required: expert-engineer, code-quality-skill, oppus-reasoning-contract.  
[expert-engineer] Active roles: Senior Backend Engineer, TypeScript Specialist, Expert Debugger, Security Auditor, Code Reviewer, DevOps Engineer.  
[code-quality-skill] Review priority: Correctness and data integrity.  
[literature-arxiv] Coverage: targeted literature synthesis, not exhaustive survey. Recency filter used for search: 2022-01-01 onward for agent verification / self-verification literature. Source basis distinguishes metadata/search snippets from source text actually fetched/read.

---

## 1. Executive verdict

The adapter has the right **representation**:

- keep host-specific hook contracts at the edge;
- normalize host events into a small internal port;
- inject compact runtime capsules rather than prompt-stuffing the whole operating graph;
- track obligations in state instead of trusting the model to remember them;
- use post-tool evidence and Stop-time blocking as an external control loop.

That shape is aligned with current agent-verification research and with the documented capabilities of Claude Code / Codex hooks.

But the current implementation has a serious gating flaw:

> An implementation prompt opens a test obligation, but leaves `session.phase = "implementing"`; `handleStop()` only blocks when `shouldBlockClose()` says the phase is closable. In local simulation, the Stop hook returned `{}` — allow — while `Run local tests after code changes.` was still open.

So the verification gate works as a **component** under seeded closing/verifying states, but does **not yet work fundamentally as a live end-of-turn enforcement gate for the default code-change path**.

Short version:

| Question | Verdict |
|---|---|
| Do local build/tests pass? | **Yes.** `npm test` passes: 71/71. |
| Are capsules locally generated and injected in documented output shapes? | **Mostly yes locally.** UserPromptSubmit/Stop render the documented JSON shape; SessionStart outputs plain context. |
| Does this prove Claude Code/Codex live injection works? | **No.** Live host smoke validation is still unproven. Existing docs correctly warn against overclaiming. |
| Is the architecture direction sound? | **Yes.** Strong host-port/capsule/gate representation. |
| Is the verification gate currently reliable enough to trust? | **No.** It can allow closure with unmet obligations in the normal implementation phase. |
| Is this the “best possible” architecture? | **Not yet.** The best direction is present; the current gate needs an evidence ledger and stricter Stop semantics. |

---

## 2. Evidence base

### Repo artifacts inspected

Key files inspected during the audit:

- `README.md`
- `package.json`
- `hooks/hooks.json`
- `codex/hooks.json`
- `docs/VERIFICATION_GATE_HANDOFF.md`
- `docs/CLAUDE_SMOKE_TEST.md`
- `docs/HONEST_NUMBERS.md`
- `src/host/host-port.ts`
- `src/host/hooks-json-host.ts`
- `src/host/claude-host.ts`
- `src/host/codex-host.ts`
- `src/host/index.ts`
- `src/capsules/capsule-bundle.ts`
- `src/capsules/verification-gate-capsule.ts`
- `src/hooks/twin-session-start.ts`
- `src/hooks/twin-turn-router.ts`
- `src/hooks/twin-posttoolbatch-instrument.ts`
- `src/hooks/twin-posttooluse-instrument.ts`
- `src/hooks/twin-verification-gate.ts`
- `src/hooks/verification-instrument-core.ts`
- `src/routing/prompt-classifier.ts`
- `src/state/schema.ts`
- `src/state/safe-state-store.ts`
- `src/state/ledger.ts`
- relevant tests under `tests/hooks/`, `tests/host/`, `tests/skills/`, `tests/state/`, and fixtures.

### Verification command run

```bash
npm test
```

Result:

```text
# tests 71
# pass 71
# fail 0
# duration_ms 247.079167
```

This establishes that the current local TypeScript build and test suite pass. It does **not** establish live Claude Code or Codex runtime injection.

### Manual gate simulation run during audit

An isolated state path was used to simulate the essential live path:

1. `SessionStart`
2. `UserPromptSubmit` with an implementation prompt
3. `Stop` without any verification command

Observed state before Stop:

```json
{
  "phase": "implementing",
  "required": [
    "Run local tests after code changes."
  ],
  "completed": []
}
```

Observed Stop output:

```json
{}
```

That is an allow decision, not a block. This is the most important finding in the audit.

A second local probe used a plausible Claude `PostToolBatch` string result for a passing test run:

```json
{
  "tool_response": "PASS tests/foo.test.ts\nall checks passed"
}
```

Observed verification state afterward:

```json
{
  "required": ["Run local tests after code changes."],
  "completed": []
}
```

So string success evidence does not currently close the obligation.

### Image limitation

Chief requested evaluation of an image if accessible. No image payload or readable image file was available in the current tool context after compaction. Therefore this audit makes **no image-based claim**. If the screenshot is reattached, it should be evaluated as separate evidence.

---

## 3. External source / literature synthesis

### 3.1 Hook systems: what the product APIs support

Public hook documentation for Claude Code and Codex supports the broad idea of this adapter:

- hook handlers can run at lifecycle events such as SessionStart, UserPromptSubmit, PostToolUse/PostToolBatch, and Stop;
- UserPromptSubmit / SessionStart-style hooks can add context into the model’s turn;
- Stop hooks can decide whether to allow completion or block/continue;
- post-tool hooks can observe tool execution and record external evidence.

The adapter’s design matches that ecosystem: context injection at entry points, evidence capture after tools, and a Stop-time control gate.

Important boundary: API documentation supports the **possibility** of this architecture. It does not prove this repo’s live installation is wired correctly on the user’s machine or that each host emits exactly the response payload shapes expected by the current parser.

### 3.2 Agent verification literature: what the research supports

The research trend is clear: reliable tool-using agents need external feedback, executable tests, and verifier loops. Prompt-only self-discipline is weak.

Relevant papers and patterns:

1. **Reflexion: Language Agents with Verbal Reinforcement Learning** — Shinn et al., NeurIPS 2023.  
   Reflexion shows that agents can improve by converting environmental feedback into verbal memory used in future decisions. It supports the broad pattern of recording failures and carrying corrective context forward. It does **not** prove that any particular Stop gate is correct.

2. **ReAct-style agents and feedback loops** — ReAct and follow-on work show the value of interleaving reasoning and action, with tool observations changing subsequent behavior. Twin-Sparrow’s post-tool instrumentation follows this general control-loop pattern.

3. **ReVeal: Self-Evolving Code Agents via Iterative Generation-Verification** — recent arXiv work around code agents using iterative generation and verification. The relevance is architectural: generation and verification should be separated, and executable feedback should drive improvement. The adapter’s idea is aligned; the current implementation still needs stricter evidence semantics.

4. **RISE / repository-level iterative self-evolution patterns** — recent code-agent work emphasizes repository-level tests and iterative correction rather than isolated answer generation. This supports Twin-Sparrow’s instinct that the gate should be repo-state-aware, not merely prompt-style guidance.

Research-backed conclusion:

> Runtime capsules plus verifier gates are directionally correct. The stronger literature-supported object is not “a prompt reminder to test”; it is an evidence ledger that ties code mutation, test execution, outcome, and closure permission into one causal chain.

The current implementation has the right representation, but its evidence chain is still too weak.

---

## 4. Architecture strengths

### 4.1 Good host-boundary representation

The code has a clean host seam:

- `HostPort`
- `ClaudeHost`
- `CodexHost`
- shared `hooks-json-host` logic
- `resolveHost()` selected by `TWIN_SPARROW_HOST`

This is the right cut. Claude and Codex should not pollute the core capsule/gate logic. The repo mostly keeps host quirks at the edge.

### 4.2 Capsules are the right injection unit

`capsule-bundle.ts` renders compact classes such as:

- companion capsule;
- working-state capsule;
- source-grounding capsule;
- artifact-review capsule;
- skill-gate capsule;
- token-economics capsule.

This avoids replaying the whole operating graph into every prompt. Architecturally, this matches the Twin-Sparrow primitive of **context infrastructure** rather than prompt mass.

### 4.3 Verification obligations exist outside the model’s memory

The adapter stores verification requirements in durable JSON state. This is better than telling the assistant “remember to run tests.” Externalized state is the correct primitive for enforcement.

### 4.4 Post-tool instrumentation is the right place to close obligations

`verification-instrument-core.ts` classifies Bash commands and tool responses, then closes matching open obligations by category. That is the correct control-loop shape: evidence should come from tools, not model prose.

### 4.5 Loop protection exists

`MAX_BLOCKS_PER_ARC = 2` and `stop_hook_active` handling avoid infinite Stop-hook traps. That is a humane and operationally necessary guard.

### 4.6 Local tests are broad for current abstractions

The suite covers:

- host resolution;
- Claude/Codex payload parsing;
- UserPromptSubmit capsule emission;
- companion continuity;
- source-grounding and artifact-review capsules;
- verification response classification;
- Stop blocking in seeded closing/verifying states;
- Codex hook manifest shape;
- skill registry drift.

That is a solid local safety net for the current design.

---

## 5. Critical and high-risk findings

### Finding 1 — Critical: default implementation turns can close with unmet verification

Evidence:

- `inferPhase()` sets implementation prompts to `"implementing"`:

```ts
if (labels.includes("implementation") || labels.includes("execution")) return "implementing";
```

- `buildVerification()` opens a test obligation for implementation prompts:

```ts
if (labels.includes("implementation")) required.push("Run local tests after code changes.");
```

- `handleStop()` only blocks when `shouldBlockClose(read.state)` is true.
- Local simulation showed Stop output `{}` while required verification remained open and completed verification was empty.

Interpretation:

The verification gate currently enforces a seeded closing/verifying condition, not the normal implementation turn lifecycle. The adapter can tell the model “Run local tests after code changes,” but then allow the same turn to finish without tests.

Why this matters:

This breaks the core claim of a verification gate. The practical risk is that the assistant can make code changes, skip tests, and still close the response.

Recommended fix:

Introduce structured obligations with a closure policy:

```ts
type VerificationObligation = {
  readonly id: string;
  readonly category: "test" | "lint" | "build" | "source" | "artifact";
  readonly reason: string;
  readonly openedAt: string;
  readonly status: "open" | "closed";
  readonly closurePolicy: "block_stop" | "advisory";
  readonly openedAfterMutationSeq: number;
  readonly closedBy?: {
    readonly command: string;
    readonly observedAt: string;
    readonly host: "claude" | "codex";
    readonly evidenceShape: string;
  };
};
```

Then make Stop block on any `closurePolicy: "block_stop"` obligation that remains open, independent of whether the session phase is currently `implementing`.

Minimum failing test to add:

```text
SessionStart → UserPromptSubmit("implement code change") → Stop
Expected: Stop blocks with open test obligation.
```

### Finding 2 — High: Claude PostToolBatch string success likely does not close obligations

Evidence:

`classifyToolResponse()` currently treats strings as failure-only / unknown:

```ts
if (typeof response === "string") {
  if (hasFailureSignal(response)) return "fail";
  return "unknown";
}
```

Manual probe:

```json
"tool_response": "PASS tests/foo.test.ts\nall checks passed"
```

did not close `Run local tests after code changes.`

Why this matters:

Claude `PostToolBatch` responses are often serialized content rather than neat structured objects. If passing Bash output arrives as a string, the adapter safely refuses to infer pass — good for avoiding false positives, bad for actually clearing the gate.

Recommended fix:

Use host-specific normalizers before classification:

```ts
type NormalizedToolResult =
  | { readonly kind: "pass"; readonly evidence: string }
  | { readonly kind: "fail"; readonly evidence: string }
  | { readonly kind: "unknown"; readonly evidence: string };
```

For string responses, only recognize pass when both conditions hold:

1. the command category is known (`test`, `lint`, `build`);
2. category-specific success patterns are present and failure patterns absent.

Examples:

- test pass: `\b(pass|passed|all tests passed|0 failed|failures: 0)\b`
- TypeScript/lint pass: `Found 0 errors`, `0 errors`, clean exit code if available
- build pass: command-specific completion markers, or exit code if host supplies it

Do **not** treat arbitrary text as pass.

### Finding 3 — High: verification completions are not invalidated by later mutations

Current state uses:

```ts
verification: {
  required: readonly string[];
  completed: readonly string[];
}
```

This is too weak. If the assistant runs tests, then edits code again, completed verification remains completed unless a new UserPromptSubmit resets it. There is no mutation sequence, file-change generation, or post-pass invalidation.

Why this matters:

The safety property needed is not “a test passed sometime during the arc.” It is:

> The required verification passed after the relevant code changes.

Recommended fix:

Track mutation events and verification evidence with ordering:

```ts
state.mutations.lastCodeMutationSeq
state.verification.obligations[n].openedAfterMutationSeq
state.verification.obligations[n].closedAtMutationSeq
```

If any `Edit`, `Write`, `MultiEdit`, or mutation-capable Bash command occurs after a test pass, reopen or stale-mark the relevant test/build obligations.

### Finding 4 — High: SessionStart ignores stdin host payload

Evidence:

`handleSessionStart()` supports `sessionId` only through options:

```ts
export function handleSessionStart(options: SessionStartOptions = {}): SessionStartResult
```

The CLI main path calls:

```ts
const result = handleSessionStart();
```

It never reads stdin, never calls `host.parsePayload()`, and never uses `extractSessionStart()` even though `hooks-json-host.ts` implements it.

Why this matters:

Live Claude/Codex session IDs and source metadata are not admitted at SessionStart. The adapter still rotates `arcId`, so it works at a basic level, but host/session correlation is incomplete.

Recommended fix:

Make SessionStart follow the same host-port path as UserPromptSubmit and Stop:

```ts
const rawInput = await readStdin();
const host = resolveHost();
const signal = host.extractSessionStart(host.parsePayload(rawInput));
handleSessionStart({ sessionId: signal.sessionId });
```

Add live-shape fixtures for Claude and Codex SessionStart.

### Finding 5 — Medium/high: tests prove local components, not live host behavior

Existing tests are useful, but they do not prove:

- Claude Code live-injects the returned `additionalContext` into the model;
- Codex injects the same way;
- Stop blocks are honored by both hosts in the installed configuration;
- Codex Bash `tool_response` inner payload shape matches parser assumptions;
- Claude `PostToolBatch` success evidence is in a recognized shape.

The repo’s docs already acknowledge this. `docs/CLAUDE_SMOKE_TEST.md` correctly says local tests/build are not enough to claim live Claude injection.

Recommended fix:

Create a `docs/LIVE_HOOK_VALIDATION.md` or update the existing smoke-test doc with a hard acceptance matrix:

| Host | Event | Expected observation | Status |
|---|---|---|---|
| Claude | SessionStart | tiny contract appears in model-accessible context | unverified/verified |
| Claude | UserPromptSubmit | capsule visible to model | unverified/verified |
| Claude | PostToolBatch | passing/failing Bash output normalized | unverified/verified |
| Claude | Stop | open obligation blocks completion | unverified/verified |
| Codex | same | same | unverified/verified |

### Finding 6 — Medium: category-level closure is too coarse

A passing `npm test` closes all open `test` category obligations. That is acceptable for a minimal adapter, but it cannot distinguish:

- unit tests vs integration tests;
- changed package scope;
- lint vs typecheck vs test coverage;
- command pass before/after mutation;
- partial test command vs full required command.

Recommended fix:

Each obligation should carry acceptable command patterns and scope:

```ts
acceptableCommands: readonly VerificationCommandPattern[];
scope: "repo" | "package" | "file";
```

This prevents a narrow passing command from satisfying a broad obligation accidentally.

### Finding 7 — Medium: shell command hooks are workable, but typed command/args would be safer

Current manifests use shell strings such as:

```json
"command": "node \"${CLAUDE_PLUGIN_ROOT}/dist/src/hooks/twin-turn-router.js\""
```

This is probably fine in current Unix-like contexts, but safer hook runners prefer stable executable + args boundaries where supported. The current shell form increases quoting/environment fragility.

Recommended fix:

If host docs permit structured command forms, use executable/args. If not, keep shell strings but add tests/docs for paths with spaces and missing env vars.

---

## 6. Claim-boundary table

| Claim | Status | Evidence |
|---|---:|---|
| Local TypeScript build passes | Established | `npm test` includes `npm run build`, all pass |
| Local test suite passes | Established | 71/71 tests passing |
| Host-neutral port exists | Established | `src/host/*` inspected |
| Claude and Codex manifests are present | Established | `hooks/hooks.json`, `codex/hooks.json` inspected |
| UserPromptSubmit emits capsules locally | Established | tests + code inspection |
| Stop gate can block when state is seeded as closing/verifying with open obligations | Established | tests inspect seeded states |
| Default implementation prompt opens test obligation | Established | code + local simulation |
| Default implementation prompt is allowed to close with open obligation | Established | local manual simulation |
| Claude live context injection works | Unproven | docs warn; no live smoke evidence in audit |
| Codex live context injection works | Unproven | no live smoke evidence in audit |
| Real token savings are measured | Unproven | `docs/HONEST_NUMBERS.md` says estimates only |
| Verification gate is formally correct | False / not established | heuristic phase/category/string-state design |
| Architecture is directionally aligned with research | Supported inference | literature synthesis + code structure |

---

## 7. What the current architecture really is

The inherited category might be “hook adapter.” The real object of design is stronger:

> A host-neutral cognitive control layer that turns prompts, tool evidence, and closure attempts into a small state machine of context, obligations, and admissible completion.

That is the right object.

The current implementation still represents verification as:

```text
required strings - completed strings
```

The better representation is:

```text
mutation ledger + structured obligations + host-normalized evidence + stop closure policy
```

This changes the operation from “did we ever run something test-like?” to:

> “Is there admissible verification evidence after the relevant mutation, for this obligation, from this host, before the assistant is allowed to close?”

That is the central representation shift needed.

Cut required:

- Cut the idea that `session.phase` alone determines gate enforcement.
- Cut string-only verification state as the source of truth.
- Cut “any category-matched passing command closes the obligation” for consequential code changes.

Tradeoff:

- The system becomes more stateful and slightly more complex.
- But it gains the exact property the product claims: evidence-grounded closure.

---

## 8. Recommended fix plan

### Phase 1 — make the gate real

1. Add an end-to-end failing test:

```text
UserPromptSubmit implementation → Stop blocks if required verification is open.
```

2. Change Stop enforcement so code-change obligations with `block_stop` semantics block regardless of `session.phase`.

3. Keep loop guards (`stop_hook_active`, max block count), but ensure the first Stop attempt after an implementation task blocks if tests are open.

### Phase 2 — normalize host evidence

1. Parse SessionStart stdin through `HostPort`.
2. Add Claude and Codex fixture files copied from actual hook payloads.
3. Add parser tests for:
   - Claude PostToolBatch string success;
   - Claude PostToolBatch string failure;
   - Codex PostToolUse documented success;
   - Codex PostToolUse nonzero Bash/failure;
   - unknown shape stays unknown.

### Phase 3 — replace string verification with an evidence ledger

Replace:

```ts
verification: { required: string[]; completed: string[] }
```

with structured obligations and evidence events.

Minimum schema:

```ts
interface VerificationState {
  readonly obligations: readonly VerificationObligation[];
  readonly evidence: readonly VerificationEvidence[];
  readonly mutationSeq: number;
}
```

Each evidence record should include:

- command;
- category;
- verdict;
- host;
- observedAt;
- rawShape summary;
- mutation sequence at time of evidence.

### Phase 4 — invalidate after mutation

1. Observe mutation-capable tools.
2. Increment `mutationSeq` after edits/writes/apply_patch and mutating Bash commands.
3. Mark verification evidence stale if a later mutation occurs.
4. Reopen relevant obligations or require re-verification at Stop.

### Phase 5 — live smoke validation

Run an explicit host matrix:

- Claude Code:
  - SessionStart context visible.
  - UserPromptSubmit capsule visible.
  - PostToolBatch captures pass/fail.
  - Stop block is honored.
- Codex:
  - same four checks, using `PostToolUse` instead of `PostToolBatch`.

Only after this should docs say live capsules/gates work.

---

## 9. Final architecture judgment

The adapter is **not broken in concept**. It is actually built around the right primitives:

- context as capsules;
- memory/state as a ledger;
- host adapters at the edge;
- verification as external evidence;
- Stop hooks as a closure control point.

That is the correct product direction and it is research-aligned.

But the current verification gate is **under-enforcing** in the most important path. Passing local tests currently means “the tested pieces behave as specified,” not “the live adapter prevents unverified code-change closure.”

Best concise verdict:

> Keep the architecture. Do not yet trust the verification gate. Upgrade the state model from string obligations to evidence-ledger obligations, make Stop block open code-change obligations independent of phase, parse real host payloads, and live-smoke both Claude and Codex before making production claims.

