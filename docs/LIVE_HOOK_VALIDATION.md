# Live Hook Validation Matrix — Claude Code + Codex CLI

Date: 2026-07-09  
Status: **local simulated hooks pass; live host validation still required**

## Purpose

This document is the claim boundary for Twin-Sparrow runtime capsules and the verification gate.

Local tests prove adapter logic against fixtures and simulated hook payloads. They do **not** prove that Claude Code or Codex CLI, as installed on a machine, actually:

- loads the hook manifests;
- injects `hookSpecificOutput.additionalContext` into model context;
- honors `Stop` block decisions;
- emits Bash/tool result payloads in exactly the shapes the adapter normalizes;
- observes non-Bash mutation tools in the events configured for that host.

Until live evidence is recorded here or in an evidence folder, public claims must stay local/simulated.

---

## Claim levels

| Claim | Allowed now? | Evidence required |
|---|---:|---|
| Local TypeScript build passes | yes | `npm run check` output |
| Local simulated hook tests pass | yes | `npm run check` output |
| Claude Code receives runtime capsules live | no | Claude live smoke Test 1–2 |
| Claude Code honors Stop blocking live | no | Claude live smoke Test 11 |
| Codex CLI receives runtime capsules live | no | Codex live matrix below |
| Codex CLI honors Stop blocking live | no | Codex live matrix below |
| Codex non-Bash mutation invalidation works live | no | Codex PostToolUse capture for mutation tools or manifest update |
| Token savings are measured | no | Separate benchmark against defined full-prompt baseline |

---

## Local baseline required before live runs

Run from adapter root:

```bash
npm run check
```

Expected current local baseline:

```text
# tests 79
# pass 79
# fail 0
```

If this fails, do not run live validation as a success claim. Fix local behavior first.

---

## Claude Code live matrix

| Event / surface | Expected live evidence | Status | Evidence path / notes |
|---|---|---:|---|
| Plugin load | Claude loads `.claude-plugin/plugin.json` and `hooks/hooks.json` without path errors | unverified | |
| `SessionStart` | state `lastCapsuleClasses: ["tiny-twin-contract"]`; host `session_id` admitted when provided | unverified | |
| `UserPromptSubmit` | state updates; `COMPANION` + `WORKING STATE` capsules enter additional context | unverified | |
| Skill gate | `/represent` prompt emits compact Pearl gate, not full body unless requested | unverified | |
| Source grounding | current-page prompt creates `missing-source` capsule and prevents source-grounded answer | unverified | |
| Artifact review | pasted/proposed artifact creates pending review gate | unverified | |
| Verification evidence | `PostToolBatch` records pass/fail/unknown evidence for Bash verification commands | unverified | |
| Mutation invalidation | `PostToolBatch` sees mutation tools or mutating Bash commands; later mutations stale code verification | unverified | |
| `Stop` gate | open/stale blocking obligations block close; `stop_hook_active` and max-block guard prevent loops | unverified | |
| Status | `/twin-status` or executable target renders structured verification state read-only | unverified | |

---

## Codex CLI live matrix

| Event / surface | Expected live evidence | Status | Evidence path / notes |
|---|---|---:|---|
| Hook config load | Codex trusts and runs merged `~/.codex/hooks.json` entries | unverified | |
| `SessionStart` | adapter state updates through `TWIN_SPARROW_HOST=codex` hook | unverified | |
| `UserPromptSubmit` | Codex receives compact capsules through `additionalContext` | unverified | |
| Bash verification evidence | `PostToolUse` Bash payload shape is captured and classified correctly | unverified | |
| Non-Bash mutation observation | Codex either emits non-Bash mutation tools to configured hooks, or limitation is confirmed | unverified | Current `codex/hooks.json` uses Bash matcher for PostToolUse. |
| Mutating Bash invalidation | `apply_patch` or equivalent mutating Bash command increments `mutationSeq` and stales prior code verification | unverified | |
| `Stop` gate | open/stale blocking obligations block close and loop guards work | unverified | |
| Status | executable `twin-status` renders structured verification state for Codex state path | unverified | |

Codex-specific boundary:

> Because the current Codex manifest wires `PostToolUse` with `matcher: "^Bash$"`, live non-Bash mutation invalidation is not proven for Codex. Mutating Bash invalidation can work, but Edit/Write-style tool invalidation requires either broader hook wiring or live confirmation that Codex emits those tools to a configured hook.

---

## Evidence folder convention

Use one folder per live validation run:

```text
docs/smoke-evidence/YYYY-MM-DD-<host>-<short-label>/
```

Suggested contents:

```text
README.md                    # summary, versions, pass/fail
state-before.json
state-after-sessionstart.json
state-after-userprompt.json
state-after-verification.json
session-ledger.jsonl
hook-stdout-stderr-notes.md
payload-captures-redacted.md
screenshots-redacted/        # optional
```

Do not commit secrets, API keys, private prompts, tokens, unrelated workspace content, or unredacted proprietary logs.

---

## Promotion rule

The README may only say a host is live-validated after the relevant matrix rows have evidence.

Allowed wording before evidence:

> The adapter passes local simulated hook tests and provides live validation procedures for Claude Code and Codex CLI.

Allowed wording after evidence:

> Claude Code initial live smoke validation passed on YYYY-MM-DD for commit `<sha>`.

Still not allowed without benchmark:

> The adapter saves tokens in live Claude/Codex.

Token savings require a separate measured baseline.
