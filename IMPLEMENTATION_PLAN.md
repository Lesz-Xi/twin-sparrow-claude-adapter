# Twin-Sparrow Claude Adapter — Implementation / Integration Plan

Date: 2026-07-06  
Project folder: `/Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter`  
Source architecture report: `/Users/lesz/.twin-sparrow/agent/memory/Caveman Architecture/Twin-Sparrow Architecture/Twin-Sparrow-Claude-Token-Efficient-Architecture.md`  
Related Caveman report: `/Users/lesz/.twin-sparrow/agent/memory/Caveman Architecture/Caveman-Claude-Architecture-Report.md`  
Claim boundary: implementation planning and architecture inference. Claude plugin runtime behavior must still be validated against live Claude Code plugin execution.

---

## Direct Answer

Build this as a **separate, repo-ready Claude plugin project** whose first job is not to replicate all of Twin-Sparrow, but to prove the capsule architecture:

> Claude receives a tiny Twin contract at session start, then a compact per-turn capsule containing only the active companion, task arc, working state, skill gate, source mode, artifact gate, and token-economics metadata that matter for the current prompt.

The implementation should advance in narrow verified phases. Do not start with memory retrieval, MCP tooling, or full doctrine hydration. Start with the smallest host adapter that proves the central invariant:

> **Twin-Sparrow presence without full prompt replay.**

---

## Task Header

Task Type: Implementation / Architecture Plan  
Goal: Create a structured phased plan for implementing the Twin-Sparrow Claude Adapter as a separate folder inside `/Users/lesz/Developer/Twin-Sparrow/`, suitable for becoming its own repo later.  
Relevant Context:
- Caveman source research report
- Twin-Sparrow Claude token-efficient architecture report
- Current Twin-Sparrow repo primitives: companion routing, working state, skill routing, memory categories, admission/artifact state, compaction, extension surfaces
Known Constraints:
- Do not clone Caveman as a style-compression project.
- Preserve Twin-Sparrow’s operating graph as structured runtime state, not prompt sludge.
- Keep token overhead measurable.
- Use safe local state handling.
- Make this folder separable into its own repository later.
Expected Artifact: This implementation plan saved under `twin-sparrow-claude-adapter/`.  
Claim Boundary: B/C — source-grounded architecture inference plus forward implementation recommendations.  
Verification Requirement: Each phase must define acceptance checks and tests.  
Mode: Strict.

---

## Phase TODO Ledger

- [x] Phase 0 — Architecture synthesis and project planning
  status: done / verified
- [x] Phase 1 — Repo-ready skeleton and Claude plugin minimum
  status: done / verified
- [x] Phase 2 — Safe state ledger and capsule schema
  status: done / verified initial slice
- [x] Phase 3 — SessionStart tiny Twin contract
  status: done / verified initial slice
- [x] Phase 4 — UserPromptSubmit turn router
  status: done / verified initial source and artifact slice
- [x] Phase 5 — Companion continuity capsule
  status: done / verified parity expansion slice
- [x] Phase 6 — Working-state capsule
  status: done / verified initial full-field slice
- [x] Phase 7 — Skill gate hydration
  status: done / verified initial allowlisted full-hydration slice
- [x] Phase 8 — Source grounding capsule
  status: done / verified initial missing-source slice
- [x] Phase 9 — Artifact review capsule
  status: done / verified initial approval-gate slice
- [x] Phase 10 — Token economics / Honest Numbers
  status: done / verified initial estimates-only slice
- [ ] Phase 11 — Claude live validation and installer path
  status: smoke-test protocol prepared / live Claude behavior still unvalidated
- [ ] Phase 12 — Extract into independent repository
  status: later

---

## Implementation Progress Log

### 2026-07-06 — Initial runnable adapter skeleton

Implemented:

- repo-ready TypeScript project skeleton;
- Claude plugin manifest with SessionStart and UserPromptSubmit hooks pointing at built JS;
- Tiny Twin Contract renderer;
- safe state schema and state store;
- append-only JSONL session ledger;
- companion router with explicit override, acknowledgment continuity, distress, urgency, and scored routing;
- prompt classifier;
- UserPromptSubmit turn router;
- compact capsule bundle containing companion, working state, and skill gates;
- minimal skill gates for `pearl-representation`, `think-different`, and `oppus-reasoning-contract`;
- Node test fixtures and local tests.

Verification:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter && npm run test
```

Result: 8 tests passed.

Remaining debt:

- Phase 4 router still needs artifact behavior.
- Phase 5 companion router needs fuller parity with Twin-Sparrow routing doctrine.
- Phase 7 skill hydration needs allowlisted full-body hydration and more skill coverage.

### 2026-07-06 — Source grounding and richer working state

Implemented:

- expanded state schema with source pointers, source status, active files, established facts, pending actions, and verification requirements;
- source-grounding capsule with explicit missing-source blocking instruction;
- turn-router source detection from prompt text and hook payload source arrays;
- repo-source mode when a read/retrieved file source is admitted;
- metadata-only source pointers from file paths mentioned in prompts;
- richer working-state capsule rendering active files, facts, pending actions, and verification;
- tests for missing-source prompts, read source payloads, file-path source pointers, and implementation verification requirements.

Verification:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter && npm run test
```

Result: 11 tests passed.

Remaining debt:

- Phase 4 router needs artifact-review state transitions.
- Phase 7 needs allowlisted full skill hydration rather than compact gate summaries only.
- Phase 10 token metrics are not implemented yet.

### 2026-07-06 — Artifact review capsule and approval gate

Implemented:

- artifact-review capsule with pending artifact list, approval-required action gate, and pasted-artifact evaluation rule;
- artifact state transitions from artifact-evaluation prompts;
- hook payload artifact admission preserving explicit artifact paths;
- prompt path artifact extraction for plans/specs/diffs/reviews/reports;
- pending artifact review merge/dedup by path;
- working-state facts, pending actions, verification requirements, and next-step updates when artifact review is active;
- capsule bundle integration for artifact review;
- tests for artifact prompt indexing and explicit artifact payload path preservation.

Verification:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter && npm run test
```

Result: 13 tests passed.

Remaining debt:

- Phase 5 companion router needs fuller parity with Twin-Sparrow routing doctrine.
- Phase 7 needs allowlisted full skill hydration rather than compact gate summaries only.
- Phase 10 token metrics are not implemented yet.
- Phase 11 live Claude validation remains blocked until local adapter behavior is stable.

### 2026-07-06 — Token economics and Honest Numbers

Implemented:

- token estimator using local `chars_div_4_rounded_up` approximation;
- capsule metrics shape with `estimatesOnly: true` and `claimedSavings: false`;
- token-economics capsule that explicitly refuses savings claims;
- capsule bundle metrics for every emitted bundle;
- SessionStart and UserPromptSubmit ledger entries now include capsule metrics;
- token-economics prompt classification;
- `docs/HONEST_NUMBERS.md` documenting what is estimated, what is not measured, and what claims are forbidden;
- tests proving token-economics output avoids unmeasured savings claims and records estimates-only metrics in the ledger.

Verification:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter && npm run test
```

Result: 14 tests passed.

Remaining debt:

- Phase 5 companion router needs fuller parity with Twin-Sparrow routing doctrine.
- Phase 7 needs allowlisted full skill hydration rather than compact gate summaries only.
- Phase 11 live Claude validation remains blocked until companion/skill local phases pass.

### 2026-07-06 — Allowlisted full skill hydration

Implemented:

- allowlisted skill registry with safe skill-name validation;
- default skill root resolution via `TWIN_SPARROW_SKILL_ROOT` or `~/.twin-sparrow/agent/skills`;
- full skill-body hydration with path containment checks, symlink refusal, regular-file requirement, and file-size cap;
- compact skill gate remains default for `/represent`, `think-different`, and `oppus-reasoning-contract`;
- explicit full-hydration detection for phrases such as `hydrate full skill`, `full skill`, `full body`, and `/skill:<name>`;
- state now carries skill hydration records with hydrated/blocked status;
- skill capsule renders full `<skill ...>` body only when hydration succeeds;
- unknown or unallowlisted full-skill requests fail closed with an explicit blocked reason;
- tests proving compact `/represent` does not hydrate by default, explicit full `/represent` hydrates from an allowlisted fixture root, and unknown full skill fails closed.

Verification:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter && npm run test
```

Result: 16 tests passed.

Remaining debt:

- Phase 5 companion router needs fuller parity with Twin-Sparrow routing doctrine.
- Phase 11 live Claude validation remains blocked until companion local parity and smoke-test docs are ready.

### 2026-07-06 — Companion router parity expansion

Implemented:

- companion state now tracks consecutive turns for the active orientation;
- companion state now carries check-in metadata with `required`, `reason`, and `message`;
- companion capsule renders consecutive-turn count and check-in requirement;
- immediate closure prompts preserve the companion that carried the active arc;
- weak new-arc signals preserve continuity when no different intent is present;
- clear new-arc execution signals can switch from Solaris to Atoman;
- 10+ consecutive Atoman turns trigger a softening check-in;
- 10+ consecutive Solaris turns trigger a concrete-path check-in;
- tests cover closure continuity, new-arc switching, weak new-arc preservation, Atoman streak check-in, and Solaris stalled check-in.

Verification:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter && npm run test
```

Result: 21 tests passed.

Remaining debt:

- Phase 11 live Claude validation remains blocked until smoke-test docs and command behavior are ready.
- Phase 12 repo extraction remains later.

### 2026-07-06 — `/twin-status` read-only operator command

Implemented:

- `src/commands/twin-status.ts` command handler and CLI entrypoint;
- read-only status renderer for current adapter state;
- status output includes companion, certainty, signal, continuity, check-in, task arc, goal, task type, next step, active files, skills, skill hydration, source grounding, sources, pending artifacts, last capsule classes, and warnings;
- JSON stdin support for `{ "statePath": "..." }` so tests and future Claude command wiring can target a specific state file;
- `npm run twin:status` script pointing at the built command;
- `commands/twin-status.md` now documents the executable target and read-only boundary;
- package exports include the command handler;
- tests cover handler output, missing-state safe default behavior, and built CLI execution with a `statePath` payload.

Verification:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter && npm run test
```

Result: 24 tests passed.

Compatibility note added later: observed Claude Code plugin layout keeps metadata in `.claude-plugin/plugin.json` and hooks in `hooks/hooks.json`; adapter now follows that shape and verifies it in tests.

Remaining debt:

- Phase 11 live Claude validation now needs smoke-test docs and real Claude hook/command behavior validation.
- Phase 12 repo extraction remains later.

### 2026-07-06 — Phase 11 live Claude smoke-test protocol

Implemented:

- `docs/CLAUDE_SMOKE_TEST.md` live validation protocol;
- explicit claim boundary: local tests pass, live Claude behavior remains unvalidated;
- manual executable preflight for SessionStart, UserPromptSubmit, and `/twin-status` target;
- live smoke tests for plugin/session hook load, UserPromptSubmit capsule injection, companion acknowledgment continuity, compact `/represent`, explicit full skill hydration, unknown skill fail-closed behavior, source-grounding fail-closed behavior, artifact review gating, token-economics honesty, and operator status;
- evidence preservation checklist for Claude version, Node version, adapter snapshot, state file, ledger, environment, stdout/stderr, and observed Claude behavior;
- pass/fail summary template;
- promotion rule forbidding live-success and token-savings claims until observed evidence exists.

Verification:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter && npm run test
```

Result: 25 tests passed.

Remaining debt:

- Run the live Claude smoke test.
- Phase 12 repo extraction remains later.

---

## Assumption Register

| # | Assumption | Classification | Impact if Wrong | Mitigation |
|---|---|---|---|---|
| 1 | Claude Code plugin manifests can register SessionStart and UserPromptSubmit hooks as Caveman uses them. | Supported by Caveman source report; not live-validated here. | Plugin hook implementation may fail or require API adjustment. | Keep hook layer isolated; add live validation phase before repo extraction. |
| 2 | Hook stdout / JSON additionalContext can influence Claude prompt context. | Supported by Caveman report. | Capsule injection path may need different formatting. | Build fixture tests first, then live Claude smoke test. |
| 3 | Twin-Sparrow behavior can be represented as compact capsules without full prompt replay. | Plausible and supported by existing Twin primitives. | Under-injection may cause drift. | Start with hard-stop Tiny Contract + status-visible active capsules + tests. |
| 4 | Companion continuity can be implemented locally without access to full Twin runtime. | Plausible. | Routing may diverge from current Twin-Sparrow behavior. | Port minimal routing rules, preserve schema compatibility, later integrate shared package. |
| 5 | A separate folder inside the monorepo is enough for later repo extraction. | Supported by user instruction. | Imports from monorepo may create extraction friction. | Keep Phase 1 dependency-light; avoid deep monorepo imports until extraction decision. |
| 6 | Token savings should be measured, not asserted. | Supported by Caveman honest-numbers lesson. | Overclaiming would mislead design decisions. | Add Phase 10 metrics before declaring success. |

---

## Fundamental Structure

The irreducible system problem is:

> Given a Claude Code session and a user prompt, determine the smallest faithful Twin-Sparrow runtime slice needed for the next model turn, inject that slice safely, update local continuity state, and make the active state visible to the operator.

Everything else is secondary.

This means the core function is not a prompt template. It is:

```ts
buildTurnCapsule(input: ClaudeHookEvent, state: TwinAdapterState): CapsuleBundle
```

Where `CapsuleBundle` is selected from:

- Tiny Twin Contract
- Companion Continuity Capsule
- Working State Capsule
- Skill Gate Capsule
- Source Grounding Capsule
- Memory Capsule, later
- Artifact Review Capsule
- Token Economics Capsule

---

# Project Shape

## Initial folder layout

```text
twin-sparrow-claude-adapter/
  README.md
  IMPLEMENTATION_PLAN.md
  package.json
  tsconfig.json
  .gitignore
  .claude-plugin/
    plugin.json
  src/
    hooks/
      twin-session-start.ts
      twin-turn-router.ts
    capsules/
      tiny-twin-contract.ts
      companion-capsule.ts
      working-state-capsule.ts
      skill-gate-capsule.ts
      source-grounding-capsule.ts
      artifact-capsule.ts
      token-economics-capsule.ts
      capsule-bundle.ts
    state/
      schema.ts
      safe-state-store.ts
      ledger.ts
    routing/
      prompt-classifier.ts
      companion-router.ts
      capsule-selector.ts
    skills/
      skill-index.ts
      skill-slicer.ts
    commands/
      twin-status.md
      solaris.md
      atoman.md
      twin-skill.md
      twin-source.md
      twin-plan.md
    metrics/
      token-ledger.ts
    security/
      path-policy.ts
      json-guards.ts
    index.ts
  tests/
    hooks/
      session-start.test.ts
      turn-router.test.ts
    state/
      safe-state-store.test.ts
    routing/
      companion-router.test.ts
      capsule-selector.test.ts
    skills/
      skill-slicer.test.ts
    fixtures/
      claude-hook-events.ts
  docs/
    HONEST_NUMBERS.md
    CAPSULES.md
    CLAUDE_PLUGIN_VALIDATION.md
```

## Extraction principle

Until this becomes a standalone repo:

- keep code inside `twin-sparrow-claude-adapter/`;
- do not modify unrelated Twin-Sparrow packages unless explicitly approved;
- avoid imports from `packages/coding-agent` in Phase 1–2;
- copy only small protocol ideas, not monorepo internals;
- document every planned integration point.

Later, once stable, choose between:

1. fully standalone plugin repo;
2. monorepo package published as `@twin-sparrow/claude-adapter`;
3. hybrid: standalone Claude plugin depending on a small shared `@twin-sparrow/runtime-protocol` package.

---

# Phase Plan

## Phase 0 — Architecture synthesis and project planning

Status: done / verifying

### Goal

Create the architecture direction and implementation plan.

### Deliverables

- Architecture synthesis report.
- This implementation plan.
- Project folder created.

### Acceptance checks

- Report exists at the memory path.
- Plan exists inside `/Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter/`.
- Plan includes TODO ledger and phase acceptance checks.

### Verification

Manual file existence and line/content check.

---

## Phase 1 — Repo-ready skeleton and Claude plugin minimum

Status: current

### Goal

Create the minimal standalone TypeScript project shell and Claude plugin manifest.

### Deliverables

- `package.json`
- `tsconfig.json`
- `.gitignore`
- `.claude-plugin/plugin.json`
- `src/index.ts`
- `src/hooks/twin-session-start.ts`
- `src/hooks/twin-turn-router.ts`
- `tests/fixtures/claude-hook-events.ts`

### Implementation notes

Use Node 20+ and TypeScript. Keep dependencies minimal:

- `typescript`
- `tsx` for dev execution, if needed
- `vitest` or Node test runner
- `zod` only if schema validation benefits outweigh dependency cost

Initial scripts:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "check": "npm run build && npm test"
  }
}
```

### Acceptance checks

- `npm run build` passes.
- Test runner executes at least one fixture test.
- Plugin manifest points to built hook files, not source `.ts` files, unless runtime intentionally uses `tsx`.
- No dependency on parent monorepo packages yet.

### Production implication

A minimal skeleton keeps extraction easy and avoids early coupling to internal Twin-Sparrow packages.

---

## Phase 2 — Safe state ledger and capsule schema

Status: next

### Goal

Implement the local structured state object that replaces Caveman’s single mode flag.

### Deliverables

- `src/state/schema.ts`
- `src/state/safe-state-store.ts`
- `src/state/ledger.ts`
- tests for safe read/write

### State objects

Minimum schema:

```ts
export interface TwinAdapterState {
  readonly version: 1;
  readonly updatedAt: string;
  readonly session: {
    readonly id: string;
    readonly arcId: string;
    readonly phase: "exploring" | "planning" | "implementing" | "verifying" | "closing";
  };
  readonly companion: {
    readonly orientation: "solaris" | "atoman" | "blended";
    readonly certainty: "low" | "medium" | "high";
    readonly signal: string;
    readonly preservedContinuity: boolean;
    readonly turnCount: number;
  };
  readonly skills: {
    readonly active: readonly string[];
  };
  readonly sourceGrounding: {
    readonly mode: "none" | "metadata-only" | "repo-source" | "browser-source" | "missing-source";
    readonly required: boolean;
  };
  readonly artifacts: {
    readonly pendingReview: readonly ArtifactPointer[];
  };
}
```

### Security requirements

- Refuse symlink state files.
- Cap maximum state file size before reading.
- Validate JSON shape.
- Use atomic writes: write temp file, fsync if practical, rename.
- Keep append-only JSONL ledger for transitions.
- Never store API keys or secrets.

### Acceptance checks

- Reading missing state returns safe default.
- Malformed state recovers safely and logs warning.
- Symlink state path is refused.
- Oversized state path is refused.
- Atomic write produces valid JSON.
- Ledger appends one valid JSON object per line.

### Production implication

State safety matters because Claude hooks execute automatically. Tiny local files can become exfiltration or injection surfaces if path handling is loose.

---

## Phase 3 — SessionStart tiny Twin contract

Status: later

### Goal

On Claude session start, inject only the stable minimal Twin contract.

### Deliverables

- `src/capsules/tiny-twin-contract.ts`
- `src/hooks/twin-session-start.ts`
- `tests/hooks/session-start.test.ts`

### Tiny contract contents

Include:

- Solaris/Atoman are one companion through two activations.
- Truth before flourish.
- Fact / inference / hypothesis distinction.
- Ask only when ambiguity blocks execution.
- Source-grounding rule for current page/source-dependent tasks.
- Skills are enforcement gates when invoked.
- Keep responses useful and grounded.
- Do not replay full Twin doctrine unless the task requires it.

Exclude:

- full doctrine stack;
- full Chief grounding layer;
- full skill catalog;
- memory bodies;
- long philosophical framing.

### Acceptance checks

- SessionStart emits deterministic contract text.
- Contract stays under target token/character budget.
- Contract includes hard-stop rules.
- Contract does not include unrelated full doctrine bodies.

### Production implication

This is the safety anchor. It must be small enough to remain cheap and strong enough to prevent obvious drift.

---

## Phase 4 — UserPromptSubmit turn router

Status: later

### Goal

Parse Claude prompt events, classify the prompt, update state, and emit the correct compact capsule bundle.

### Deliverables

- `src/routing/prompt-classifier.ts`
- `src/routing/capsule-selector.ts`
- `src/hooks/twin-turn-router.ts`
- `tests/hooks/turn-router.test.ts`

### Prompt classifications

Minimum labels:

- acknowledgment
- continuation
- execution
- exploration
- implementation
- architecture
- representation
- source-grounded
- artifact-evaluation
- skill-invocation
- closure

### Acceptance checks

- Short acknowledgments preserve companion continuity.
- New tasks can start a new arc.
- Explicit `Solaris mode` / `Atoman mode` overrides state.
- Source-dependent prompts select Source Grounding Capsule.
- `/represent` selects Skill Gate Capsule.
- Output JSON matches Claude hook expectation from Caveman pattern.

### Production implication

The turn router is the heart of token savings. It prevents blanket injection.

---

## Phase 5 — Companion continuity capsule

Status: later

### Goal

Preserve Solaris/Atoman routing across Claude turns without replaying the full runtime doctrine.

### Deliverables

- `src/routing/companion-router.ts`
- `src/capsules/companion-capsule.ts`
- tests for companion routing

### Routing rules

Minimum rules:

1. Explicit override wins.
2. Distress / overwhelm routes Solaris.
3. Urgency / direct execution routes Atoman.
4. Short acknowledgments inherit current companion.
5. Completion does not release companion until closure completes.
6. Weak signal preserves continuity.

### Acceptance checks

- `thanks`, `perfect`, `continue`, `okay` preserve current companion.
- `Solaris mode` sets Solaris.
- `Atoman mode` sets Atoman.
- `urgent`, `ship it`, `do it now` route Atoman.
- `overwhelmed`, `spiraling`, `distressed` route Solaris.
- Closure turns do not flip companion unexpectedly.

### Production implication

Companion continuity is user-visible. Wrong routing makes Twin-Sparrow feel unstable even if the content is technically correct.

---

## Phase 6 — Working-state capsule

Status: later

### Goal

Carry the active task arc in compact structured form.

### Deliverables

- `src/capsules/working-state-capsule.ts`
- `src/state/working-state.ts`
- tests for state update and rendering

### Minimum fields

- goal
- task type
- active files
- established facts
- open questions
- pending actions
- verification requirements
- next step

### Acceptance checks

- Multi-turn tasks preserve goal and next step.
- Active file list stays bounded.
- Established facts are deduplicated.
- Pending actions can be marked completed.
- Capsule remains under target budget.

### Production implication

This replaces transcript replay. If it works, Claude can resume without seeing the entire conversation.

---

## Phase 7 — Skill gate hydration

Status: later

### Goal

Inject skill enforcement only when invoked or materially required.

### Deliverables

- `src/skills/skill-index.ts`
- `src/skills/skill-slicer.ts`
- `src/capsules/skill-gate-capsule.ts`
- `src/commands/twin-skill.md`
- skill tests

### Hydration levels

1. `none` — no skill capsule.
2. `gate` — compact enforcement requirements only.
3. `summary` — gate plus workflow summary.
4. `full` — full skill body when exact protocol is required.

### Initial supported skills

- `pearl-representation` / `/represent`
- `think-different`
- `oppus-reasoning-contract`
- `architect-review`
- `expert-engineer`

### Acceptance checks

- `/represent` includes raw/current/alternative/operations/invariants/search/recommendation/verification.
- `think-different` includes default representation, better representation, real object, cuts, integrations, tradeoff, next move.
- Routine code fix does not inject product-representation skills.
- Unknown skill fails closed.
- Skill file paths are allowlisted.

### Production implication

This prevents skill cosplay and avoids the cost of full skill bodies on every turn.

---

## Phase 8 — Source grounding capsule

Status: later

### Goal

Preserve source-grounding discipline without dumping full source bodies by default.

### Deliverables

- `src/capsules/source-grounding-capsule.ts`
- `src/context/source-registry.ts`
- `src/commands/twin-source.md`
- source tests

### Source states

- `none`
- `metadata-only`
- `read`
- `retrieved`
- `failed`
- `missing-required`

### Acceptance checks

- Current-browser/article prompts require actual source text, not metadata alone.
- Repo/file questions include file path and read status.
- Large sources are represented by pointer + excerpt, not full body.
- Missing source produces an explicit block or conceptual-label instruction.

### Production implication

This is a trust boundary. It prevents Claude from hallucinating source-grounded answers from titles, URLs, or stale memory.

---

## Phase 9 — Artifact review capsule

Status: later

### Goal

Represent consequential plans, specs, reports, and diffs as reviewable artifacts with approval state.

### Deliverables

- `src/capsules/artifact-capsule.ts`
- `src/artifacts/artifact-index.ts`
- `src/commands/twin-plan.md`
- artifact tests

### Artifact fields

- id
- type: plan / spec / diff / review / report / raw_output
- path
- source
- approvalState
- lifecycle
- actionGate
- preview

### Acceptance checks

- Created plan/report is indexed.
- Pending review appears in `/twin-status`.
- Action gate can block implementation until approval.
- Artifact path is preserved exactly.

### Production implication

This keeps human approval part of the system boundary, not a conversational afterthought.

---

## Phase 10 — Token economics / Honest Numbers

Status: later

### Goal

Measure whether the adapter actually reduces token waste.

### Deliverables

- `docs/HONEST_NUMBERS.md`
- `src/metrics/token-ledger.ts`
- `src/capsules/token-economics-capsule.ts`
- `src/commands/twin-stats.md`
- metrics tests

### Metrics

Track if available:

- capsule character estimate;
- approximate token estimate;
- full prompt baseline estimate;
- skill hydration size;
- source hydration size;
- memory hydration size;
- net-positive / net-negative turn classification.

### Acceptance checks

- Metrics never claim unmeasured savings.
- Token ledger distinguishes estimated from measured numbers.
- Full doctrine baseline is documented.
- Net-negative cases are visible.

### Production implication

This is how we avoid building a beautiful system that secretly costs more tokens than manual use.

---

## Phase 11 — Claude live validation and installer path

Status: blocked until local phases pass

### Goal

Validate actual Claude Code plugin behavior and create install path.

### Deliverables

- `docs/CLAUDE_PLUGIN_VALIDATION.md`
- live smoke test notes
- install script or documented manual install
- plugin package readiness checklist

### Validation checklist

- Claude detects plugin manifest.
- SessionStart hook fires.
- UserPromptSubmit hook fires.
- Hook output appears in model context.
- JSON additionalContext shape is accepted.
- Slash commands are discoverable.
- State dir resolves correctly under Claude runtime.
- Plugin uninstall leaves no unsafe residue.

### Acceptance checks

- One live Claude session confirms visible capsule behavior.
- `/twin-status` reflects actual state.
- Disabling plugin disables injection.
- No duplicate hook firing.

### Production implication

Until this phase passes, all Claude plugin behavior remains partially inferred from Caveman evidence.

---

## Phase 12 — Extract into independent repository

Status: later

### Goal

Make this folder independently commit/push-ready.

### Deliverables

- standalone `README.md`
- cleaned `package.json`
- license decision
- CI workflow
- release checklist
- dependency audit
- git remote setup, if Chief approves

### Extraction checks

- No parent-relative imports.
- No dependency on uncommitted monorepo state.
- Tests pass from inside folder.
- Docs explain relationship to Twin-Sparrow core.
- Secrets are not included.
- `.env.local` ignored.

### Production implication

A clean repo boundary protects the plugin from monorepo churn and makes public/private release decisions easier.

---

# Integration Strategy with Existing Twin-Sparrow

## Short-term: protocol copy, not code coupling

In early phases, copy small protocol concepts into the adapter:

- companion orientation enum;
- task arc phase enum;
- capsule schema;
- skill hydration levels;
- source status enum;
- artifact approval states.

Do not import internal files from `packages/coding-agent` until the boundary is proven.

## Medium-term: shared protocol package

If duplication becomes risky, extract a small shared package:

```text
@twin-sparrow/runtime-protocol
  companion types
  task arc types
  capsule schemas
  artifact state types
  source grounding types
```

The Claude adapter can depend on this without importing the whole coding agent.

## Long-term: host adapter family

Claude plugin becomes one host adapter among others:

```text
Twin Runtime Protocol
  → Twin-Sparrow TUI
  → Claude Code plugin
  → MCP context server
  → future app connectors
```

This preserves the real architecture: Twin-Sparrow is not Claude-specific. Claude is one host surface.

---

# Verification Plan

## Unit tests

Required for:

- state schema validation;
- safe state read/write;
- symlink refusal;
- prompt classification;
- companion routing;
- capsule selection;
- capsule rendering;
- skill hydration;
- source grounding trigger;
- artifact indexing;
- token estimate classification.

## Fixture tests

Use fake Claude hook payloads:

- SessionStart event
- UserPromptSubmit ordinary prompt
- UserPromptSubmit `/represent`
- UserPromptSubmit source-dependent prompt
- UserPromptSubmit acknowledgment
- UserPromptSubmit explicit companion override

## Integration smoke tests

Before live Claude:

```bash
cat tests/fixtures/user-prompt-submit.json | node dist/hooks/twin-turn-router.js
```

Check:

- valid JSON output;
- expected capsule text;
- state updated;
- ledger appended.

## Live Claude tests

Only after local tests pass:

- install plugin manually;
- start Claude session;
- inspect whether Tiny Twin Contract affects behavior;
- submit `/twin-status`;
- submit continuation prompt;
- submit `/represent` prompt;
- verify capsule behavior and no duplicate hooks.

---

# First Implementation Cut

The first commit should be intentionally small:

```text
feat: add claude adapter planning skeleton
```

Files:

- `README.md`
- `IMPLEMENTATION_PLAN.md`
- `package.json`
- `tsconfig.json`
- `.gitignore`
- `.claude-plugin/plugin.json`
- `src/hooks/twin-session-start.ts`
- `src/hooks/twin-turn-router.ts`
- `src/capsules/tiny-twin-contract.ts`
- `src/state/schema.ts`
- `tests/hooks/session-start.test.ts`

Do not include:

- memory retrieval;
- MCP server;
- full skill hydration;
- installer;
- token stats beyond basic size estimate;
- deep Twin monorepo imports.

---

# Recommended Immediate Next Move

Implement Phase 1 and the smallest slice of Phase 2:

1. Create project skeleton.
2. Add plugin manifest.
3. Add Tiny Twin Contract renderer.
4. Add safe default state schema.
5. Add one SessionStart fixture test.
6. Run local build/test.

This proves the folder can stand alone before we touch live Claude integration.

---

# Boundaries

## Established

- Caveman uses Claude plugin hooks and compact reinforcement according to the Caveman research report.
- Twin-Sparrow already has conceptual/runtime primitives for companion routing, working state, skills, memory categories, admission/artifact state, compaction, and extensions.
- The requested plan should live inside `/Users/lesz/Developer/Twin-Sparrow/` in a separate project folder.

## Inferred

- A thin Claude adapter can reuse Caveman’s host-hook pattern while preserving Twin-Sparrow’s richer operating graph.
- Capsule injection should reduce token waste relative to full prompt replay.
- A standalone folder is the lowest-friction path to later repo extraction.

## Hypothetical

- Exact Claude plugin hook output format and command registration behavior may differ from Caveman evidence depending on current Claude Code version.
- Token savings magnitude is unknown until measured.
- Some Twin-Sparrow internals may later be worth extracting into a shared package.

## Remaining uncertain

- Current live Claude Code plugin API behavior.
- Whether Claude exposes enough status/command UI for all desired command surfaces.
- Whether plugin distribution should be public, private, or local-only.
- Whether this should become a separate repo or a workspace package first.
