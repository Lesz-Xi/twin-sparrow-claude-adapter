# Claude Live Smoke Test — Twin-Sparrow Claude Adapter

Date: 2026-07-06  
Status: **unvalidated in live Claude**

## Purpose

This document defines the first live Claude validation protocol for the Twin-Sparrow Claude Adapter.

Local TypeScript behavior is test-covered. Live Claude behavior is not yet proven.

The smoke test must answer four questions:

1. Does Claude execute the plugin hooks from `hooks/hooks.json` after loading `.claude-plugin/plugin.json` metadata?
2. Does `additionalContext` from hook stdout actually enter Claude's model context?
3. Does local adapter state persist across a real Claude session?
4. Can the operator inspect adapter state through `/twin-status` or the executable status target?

Until those are observed, do **not** claim that the adapter works in live Claude.

---

## Claim boundary

Allowed now:

> The adapter passes local build/test verification and exposes hook/command executables for live validation.

Not allowed yet:

> Claude Code successfully loads this plugin.

Not allowed yet:

> Claude receives Twin-Sparrow capsules through `additionalContext`.

Not allowed yet:

> The adapter saves tokens in live Claude.

Not allowed yet:

> `/twin-status` is registered as a native Claude slash command.

Those claims require evidence from the smoke test below.

---

## Prerequisites

From the adapter root:

```bash
cd /Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter
npm run test
```

Expected local result:

```text
24 tests passing
0 failures
```

Build artifacts expected after test/build:

```text
dist/src/hooks/twin-session-start.js
dist/src/hooks/twin-turn-router.js
dist/src/commands/twin-status.js
```

Plugin metadata manifest expected at:

```text
.claude-plugin/plugin.json
```

Hook manifest expected at:

```text
hooks/hooks.json
```

Default adapter state path:

```text
~/.claude/twin-sparrow/state.json
```

Optional isolated smoke-test state path:

```bash
export TWIN_SPARROW_CLAUDE_STATE="/tmp/twin-sparrow-claude-smoke/state.json"
```

Optional full skill root override:

```bash
export TWIN_SPARROW_SKILL_ROOT="$HOME/.twin-sparrow/agent/skills"
```

---

## Manual preflight: executable targets

Run these before opening Claude.

### 1. SessionStart executable

```bash
node dist/src/hooks/twin-session-start.js
```

Expected evidence:

- stdout contains `TWIN-SPARROW TINY CONTRACT`
- state file exists at `TWIN_SPARROW_CLAUDE_STATE` or default path
- `lastCapsuleClasses` includes `tiny-twin-contract`

Failure interpretation:

- command missing → build artifact or manifest target mismatch
- no state write → state path or filesystem safety issue
- stderr warning → inspect before live Claude run

### 2. UserPromptSubmit executable

```bash
echo '{"hookEventName":"UserPromptSubmit","prompt":"Implement the next phase"}' \
  | node dist/src/hooks/twin-turn-router.js
```

Expected evidence:

- stdout is JSON
- JSON contains `hookSpecificOutput.additionalContext`
- additional context contains:
  - `TWIN-SPARROW COMPANION CAPSULE`
  - `TWIN-SPARROW WORKING STATE CAPSULE`
- state companion orientation is `atoman`
- ledger file exists beside state:
  - `session-ledger.jsonl`

Failure interpretation:

- invalid JSON stdout → Claude hook ingestion may fail
- missing `additionalContext` → adapter output contract mismatch
- no ledger → state directory/write issue

### 3. `/twin-status` executable target

```bash
node dist/src/commands/twin-status.js
```

Expected evidence:

- stdout contains `TWIN-SPARROW STATUS`
- output reports current companion, phase, active skills, source grounding, pending artifacts, and last capsule classes
- command does not mutate state

Optional explicit state path:

```bash
echo '{"statePath":"/tmp/twin-sparrow-claude-smoke/state.json"}' \
  | node dist/src/commands/twin-status.js
```

Failure interpretation:

- missing status output → command target mismatch
- changed state after status → violation; status must remain read-only

---

## Live Claude smoke-test sequence

Run this only after manual preflight passes.

### Test 1 — Plugin/session hook loads

Action:

1. Start Claude Code with the adapter plugin available through the intended plugin-install/load path.
2. Begin a new session in a small disposable project or the adapter root.

Expected evidence:

- Claude invokes SessionStart hook.
- State file is created or updated.
- State contains:

```json
"lastCapsuleClasses": ["tiny-twin-contract"]
```

Pass condition:

- Hook execution is observed and state reflects the tiny contract.

Fail condition:

- No state file update.
- Claude does not appear to execute the manifest hook.
- Hook path resolution fails.

Record:

```text
SessionStart: pass/fail
Evidence path:
Observed stdout/stderr if visible:
Notes:
```

---

### Test 2 — UserPromptSubmit injects companion and working-state capsules

Prompt in Claude:

```text
Implement a tiny no-op validation step for this adapter.
```

Expected evidence in state:

```json
"companion": {
  "orientation": "atoman"
},
"lastCapsuleClasses": [
  "companion-continuity",
  "working-state"
]
```

Expected evidence in Claude behavior:

- Claude should behave as if it received execution-oriented Twin-Sparrow context.
- If Claude exposes hook context/logs, additional context should include:
  - `TWIN-SPARROW COMPANION CAPSULE`
  - `TWIN-SPARROW WORKING STATE CAPSULE`

Pass condition:

- State updates on prompt submit and capsule classes match expected selection.

Fail condition:

- State does not update.
- Additional context is ignored or malformed.
- Claude behavior shows no trace of injected constraints when logs indicate injection succeeded.

Record:

```text
UserPromptSubmit basic capsule: pass/fail
State path:
Ledger event:
Observed Claude behavior:
Notes:
```

---

### Test 3 — Companion continuity survives acknowledgment

Prompt sequence:

```text
Solaris mode
```

Then:

```text
thanks
```

Expected state after second prompt:

```json
"companion": {
  "orientation": "solaris",
  "signal": "acknowledgment_continuity",
  "preservedContinuity": true
}
```

Pass condition:

- `thanks` preserves Solaris rather than rerouting from scratch.

Fail condition:

- acknowledgment flips companion without strong switch reason.

Record:

```text
Acknowledgment continuity: pass/fail
State excerpt:
Notes:
```

---

### Test 4 — `/represent` compact skill gate, no full hydration by default

Prompt in Claude:

```text
Use /represent on this adapter architecture.
```

Expected state:

```json
"skills": {
  "active": ["pearl-representation"],
  "hydration": []
}
```

Expected capsule evidence:

- `TWIN-SPARROW SKILL GATE CAPSULE`
- compact Pearl gate requirements
- no full `<skill name="pearl-representation" ...>` body unless explicitly requested

Pass condition:

- compact gate activates without full body replay.

Fail condition:

- skill is not activated.
- full skill body hydrates without explicit full-hydration request.

Record:

```text
/represent compact gate: pass/fail
State excerpt:
Additional context/log evidence:
Notes:
```

---

### Test 5 — Explicit full skill hydration succeeds or fails closed

Prompt in Claude:

```text
Hydrate full skill /represent for this architecture task.
```

Expected state if skill root is available:

```json
"skills": {
  "active": ["pearl-representation"],
  "hydration": [
    {
      "name": "pearl-representation",
      "status": "hydrated"
    }
  ]
}
```

Expected state if skill root is unavailable/misconfigured:

```json
"status": "blocked"
```

Pass condition:

- approved skill hydrates from allowlisted root, or fails closed with explicit blocked reason.

Fail condition:

- unknown path is trusted.
- symlink or unsafe path is accepted.
- failure is silent.

Record:

```text
Full skill hydration: pass/fail
Skill root:
State excerpt:
Blocked reason, if any:
Notes:
```

---

### Test 6 — Unknown full skill fails closed

Prompt in Claude:

```text
Hydrate full skill unknown-skill
```

Expected state:

```json
"skills": {
  "active": ["unknown-skill"],
  "hydration": [
    {
      "name": "unknown-skill",
      "status": "blocked",
      "reason": "skill is not allowlisted for full hydration"
    }
  ]
}
```

Pass condition:

- unknown skill is visible but blocked.

Fail condition:

- unknown skill hydrates.
- unknown skill disappears silently.

Record:

```text
Unknown skill fail-closed: pass/fail
State excerpt:
Notes:
```

---

### Test 7 — Source-grounded prompt blocks without admitted source text

Prompt in Claude:

```text
Thoughts on the current browser page?
```

Expected state:

```json
"sourceGrounding": {
  "mode": "missing-source",
  "required": true
}
```

Expected capsule evidence:

- `TWIN-SPARROW SOURCE GROUNDING CAPSULE`
- instruction not to answer source-grounded from metadata alone

Pass condition:

- Claude should ask for/require source text or clearly label conceptual answer.

Fail condition:

- Claude answers as if it has read the page when no source text was admitted.

Record:

```text
Source grounding fail-closed: pass/fail
State excerpt:
Observed Claude behavior:
Notes:
```

---

### Test 8 — Artifact review gate activates

Prompt in Claude:

```text
Review this implementation plan /tmp/IMPLEMENTATION_PLAN.md
```

Expected state:

```json
"artifacts": {
  "pendingReview": [
    {
      "type": "plan",
      "approvalState": "required"
    }
  ]
}
```

Expected capsule evidence:

- `TWIN-SPARROW ARTIFACT REVIEW CAPSULE`
- approval-required action gate
- pasted/proposed artifacts should be evaluated, not blindly mirrored

Pass condition:

- pending artifact is visible and action-gated.

Fail condition:

- artifact is treated as approved implementation authority.
- pending artifact state is not recorded.

Record:

```text
Artifact review gate: pass/fail
State excerpt:
Observed Claude behavior:
Notes:
```

---

### Test 9 — Token economics remains estimates-only

Prompt in Claude:

```text
Show token overhead and honest numbers for this capsule.
```

Expected state/ledger evidence:

- `lastCapsuleClasses` includes `token-economics`
- ledger event has:

```json
"capsuleMetrics": {
  "estimatesOnly": true,
  "claimedSavings": false
}
```

Expected Claude behavior:

- no percentage savings claim
- no claim that adapter is cheaper than full prompt replay

Pass condition:

- estimates-only boundary is preserved.

Fail condition:

- Claude claims measured savings without benchmark evidence.

Record:

```text
Token economics honesty: pass/fail
Ledger excerpt:
Observed Claude behavior:
Notes:
```

---

### Test 10 — Operator status surface

If native slash command registration is available, try:

```text
/twin-status
```

If native slash command registration is not available, run executable target:

```bash
node dist/src/commands/twin-status.js
```

Expected evidence:

- status output reports current state
- status is read-only
- output is suitable for operator inspection

Pass condition:

- either native command or executable target exposes correct status.

Fail condition:

- no status surface exists during live validation.
- status mutates state.

Record:

```text
Operator status: pass/fail
Invocation method: native slash / executable
State before hash/mtime:
State after hash/mtime:
Notes:
```

---

## Evidence to preserve

For each live run, preserve:

- plugin load/install method
- Claude Code version
- Node version
- adapter commit or folder snapshot
- environment variables used
- state file path
- `state.json` after each test
- `session-ledger.jsonl`
- visible Claude behavior notes
- stderr/stdout logs if available

Suggested evidence folder:

```text
docs/smoke-evidence/YYYY-MM-DD-live-claude/
```

Do not commit sensitive Claude logs if they contain secrets, private prompts, tokens, or unrelated workspace content.

---

## Pass/fail summary template

```text
Date:
Claude Code version:
Node version:
Adapter path:
State path:
Skill root:

[ ] Test 1 — SessionStart hook loads
[ ] Test 2 — UserPromptSubmit capsules inject
[ ] Test 3 — Companion acknowledgment continuity
[ ] Test 4 — /represent compact gate
[ ] Test 5 — explicit full skill hydration
[ ] Test 6 — unknown skill fail-closed
[ ] Test 7 — source grounding fail-closed
[ ] Test 8 — artifact review gate
[ ] Test 9 — token economics honesty
[ ] Test 10 — operator status surface

Overall result: pass / partial / fail
Blocking failures:
Non-blocking observations:
Next fix:
```

---

## Promotion rule

Only after the smoke test passes may the project status move from:

```text
live Claude behavior unvalidated
```

to:

```text
live Claude initial smoke test passed
```

Even then, token savings remain unclaimed until a separate benchmark compares actual Claude usage against a defined full-prompt baseline.
