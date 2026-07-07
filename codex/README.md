# Twin-Sparrow — Codex CLI wiring

This directory makes the adapter runnable under **Codex CLI**, alongside the
Claude Code wiring in `../hooks/hooks.json`. Both hosts drive the *same* compiled
hooks in `dist/`; only the host adapter (`src/host/codex-host.ts`) and this
`hooks.json` differ.

## What differs from the Claude wiring

| | Claude Code | Codex CLI |
|---|---|---|
| Verification instrument | `PostToolBatch` (one write per batch) | **`PostToolUse`** — Codex has no `PostToolBatch` event |
| Plugin root | `${CLAUDE_PLUGIN_ROOT}` | `${TWIN_SPARROW_ADAPTER_ROOT}` (you set it; no built-in var) |
| Host selection | default | `TWIN_SPARROW_HOST=codex` (prefixed in each command) |
| First-turn contract | `SessionStart` hook | `AGENTS.md` (plus the `SessionStart` hook) |

Event names (`SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop`) and the
`{hookSpecificOutput.additionalContext}` / `{decision:"block",reason}` output
shapes are identical to Claude — verified against a live `~/.codex/hooks.json`.

## Setup

1. **Build** the adapter so `dist/` exists:
   ```bash
   npm run build
   ```

2. **Enable hooks** in `~/.codex/config.toml`:
   ```toml
   [features]
   codex_hooks = true
   ```

3. **Point Codex at this repo.** Add the absolute path under the shell env policy
   so `${TWIN_SPARROW_ADAPTER_ROOT}` resolves inside hook commands:
   ```toml
   [shell_environment_policy.set]
   TWIN_SPARROW_ADAPTER_ROOT = "/absolute/path/to/twin-sparrow-claude-adapter"
   ```

4. **Install the hooks.** Codex reads `~/.codex/hooks.json`. **Merge** the four
   entries from `codex/hooks.json` into your existing `~/.codex/hooks.json`
   (append to each event's array — Codex runs every hook in a group; do not
   overwrite hooks other tools installed). Codex will prompt to trust the new
   hooks on first run (it records a `trusted_hash` under `[hooks.state]`).

5. **Install the tiny contract.** Copy `codex/AGENTS.md`'s contract block into the
   project's `AGENTS.md` (or `~/.codex/AGENTS.md`). Codex injects it on the first
   turn — the equivalent of the Claude `SessionStart` capsule.

## Verify it is live

```bash
# Point at an isolated state file if you like:
export TWIN_SPARROW_CLAUDE_STATE="$HOME/.twin-sparrow/codex-state/state.json"

# After sending one prompt in a Codex session, the ledger should show a
# user_prompt_submit event; after a passing `npm test`, a verification_obligation_closed.
tail -3 "$(dirname "$TWIN_SPARROW_CLAUDE_STATE")/session-ledger.jsonl"
```

## Open verification (do before trusting obligation-closing)

**[Hypothesis]** Codex's Bash `tool_response` inner shape is not yet confirmed
against a live capture. `classifyToolResponse` already tolerates every shape seen
so far (`{type,text}` | `{stdout,stderr}` | string | `{exitCode}` | `{success}`),
which is the safety net — but capture one real Codex `PostToolUse` payload and
confirm before relying on the verification gate under Codex. This mirrors audit
finding R1. When a genuine divergence appears, add a targeted override in
`src/host/codex-host.ts`; do not fork the parser.
