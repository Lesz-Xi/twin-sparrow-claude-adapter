# Twin-Sparrow — Codex CLI wiring

This directory makes the adapter runnable under **Codex CLI**, alongside the
Claude Code wiring in `../hooks/hooks.json`. Both hosts drive the *same* compiled
hooks in `dist/`; only the host adapter (`src/host/codex-host.ts`) and this
`hooks.json` differ.

## What differs from the Claude wiring

| | Claude Code | Codex CLI |
|---|---|---|
| Verification instrument | `PostToolBatch` (one write per batch) | **`PostToolUse`** — Codex has no `PostToolBatch` event |
| Compaction archive | `PostCompact` | `PostCompact` through the same archiver, with Codex live payload shape still unverified |
| Plugin root | `${CLAUDE_PLUGIN_ROOT}` | `${TWIN_SPARROW_ADAPTER_ROOT}` (you set it; no built-in var) |
| Host selection | default | `TWIN_SPARROW_HOST=codex` (prefixed in each command) |
| First-turn contract | `SessionStart` hook | `AGENTS.md` (plus the `SessionStart` hook) |

Event names (`SessionStart`, `UserPromptSubmit`, `PostToolUse`, `PostCompact`, `Stop`) use the
same local hooks.json-contract parser. Local simulated tests pass; live Codex validation remains tracked in
`../docs/LIVE_HOOK_VALIDATION.md`.

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

4. **Install the hooks.** Codex reads `~/.codex/hooks.json`. **Merge** the five
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
against a live capture. `classifyToolResponse` / `classifyToolResponseForCategory`
already tolerate every shape seen so far (`{type,text}` | `{stdout,stderr}` |
string | `{exitCode}` | `{success}`), which is the safety net — but capture one
real Codex `PostToolUse` payload and confirm before relying on the verification
gate under Codex. This mirrors audit finding R1. When a genuine divergence
appears, add a targeted override in `src/host/codex-host.ts`; do not fork the
parser.

**[Hypothesis]** Non-Bash mutation invalidation is also not yet live-proven under
Codex. The current `codex/hooks.json` wires `PostToolUse` with `matcher: "^Bash$"`,
so mutating Bash commands can be observed, but Edit/Write-style tool observations
may not reach the adapter. To trust stale-verification enforcement under Codex,
either broaden the hook wiring if Codex supports it, or capture live evidence that
non-Bash mutation tools are delivered to a configured hook.

**[Hypothesis]** Codex `PostCompact` is wired locally, but the live payload field
names are not yet captured. The parser accepts `compact_summary`, `compactSummary`,
and `summary`; capture one real Codex `PostCompact` payload before promoting this
from local/simulated support to live-validated support.

Track these items in `../docs/LIVE_HOOK_VALIDATION.md` before promoting Codex from
local/simulated support to live-validated support.
