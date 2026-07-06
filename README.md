# Twin-Sparrow Claude Adapter

Token-efficient Claude Code adapter for Twin-Sparrow.

## Purpose

This project exists to let Claude use Twin-Sparrow’s architecture without replaying the full Twin-Sparrow doctrine, memory, skills, source context, and working state on every turn.

The core representation is:

```text
Claude hook event
→ local Twin adapter state
→ selected runtime capsules
→ compact additionalContext injection
→ state / token ledger update
```

## Product soul

Twin-Sparrow should feel present inside Claude while Claude receives only the smallest faithful runtime slice needed for the current turn.

## Current status

Initial runnable adapter skeleton implemented.

Implemented:

- Claude plugin metadata manifest and `hooks/hooks.json`
- SessionStart tiny Twin contract
- UserPromptSubmit turn router
- safe JSON state store
- append-only JSONL session ledger
- companion continuity capsule with closure ownership, weak/new-arc preservation, and 10-turn check-ins
- working-state capsule with active files, facts, pending actions, and verification
- source-grounding capsule with missing-source blocking
- artifact-review capsule with approval-required action gate
- token-economics capsule with estimates-only metrics
- minimal skill gate capsule
- allowlisted full skill hydration with fail-closed unknown skill behavior
- read-only `/twin-status` operator command target
- Node test fixtures
- `docs/HONEST_NUMBERS.md`
- `docs/CLAUDE_SMOKE_TEST.md`

Verify locally:

```bash
npm run test
```

Current verification: 25 tests passing.

## Next implementation slice

1. Run Phase 11 live Claude smoke test from `docs/CLAUDE_SMOKE_TEST.md`.
2. Record pass/fail evidence without claiming token savings.
3. Fix any hook/manifest/command wiring issues discovered live.
4. Prepare Phase 12 repo-extraction checklist after live validation.

## Boundary

This folder is intentionally separate so it can become its own repository later. Early phases should avoid deep imports from the parent Twin-Sparrow monorepo unless explicitly approved.
