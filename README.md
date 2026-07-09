<p align="center">
  <img src="./assets/cover.png" alt="Twin-Sparrow Agent Adapter cover — two sparrows on a quiet monochrome branch" width="1000">
</p>

<h1 align="center">Twin-Sparrow Agent Adapter</h1>

<p align="center">
  Token-efficient agent adapter for Twin-Sparrow —
  one companion, two activations (<strong>Solaris</strong> &amp; <strong>Atoman</strong>) —
  running under Claude Code and Codex CLI from one host-neutral core.
</p>

---

## Purpose

This project lets an agent CLI use Twin-Sparrow’s architecture **without replaying the full Twin-Sparrow doctrine, memory, skills, source context, and working state on every turn**.

Instead of one heavy system prompt, each turn injects only the smallest faithful runtime slice needed:

```text
Agent hook event (Claude Code or Codex CLI)
→ host adapter normalizes the wire payload
→ local Twin adapter state
→ selected runtime capsules
→ compact additionalContext injection
→ state / token ledger update
```

The hook I/O logic and the Twin-Sparrow capsule/state/routing core are split by a
host port (`src/host/`) — see [Multi-host architecture](#multi-host-architecture-claude-code--codex-cli) below.

## Product soul

Twin-Sparrow should feel present inside Claude while Claude receives only the smallest faithful runtime slice needed for the current turn.

## Capabilities at a glance

| Area | What it does |
|------|--------------|
| **Companion continuity** | Closure ownership, weak/new-arc preservation, 10-turn check-ins |
| **Working state** | Tracks active files, facts, pending actions, and verification |
| **Source grounding** | Blocks answers that require missing source content |
| **Artifact review** | Approval-required gate for consequential actions |
| **Token economics** | Estimates-only ledger — no unproven savings claims |
| **Skill gates** | Fail-closed hydration of the allowlisted Twin-Sparrow skill inventory |
| **Verification gate** | Blocks same-turn closure on open/stale proof obligations; obligations close only when runner-shaped verification commands report pass evidence; later mutations stale prior code verification |
| **Compaction archive** | Archives `PostCompact` summaries as raw markdown logs under `compaction-log/`, with safe no-overwrite writes and ledger receipts |
| **Multi-host core** | Hook I/O normalized behind a host port; the same compiled core runs under Claude Code and Codex CLI |

## Current status

Initial runnable adapter skeleton implemented — the runtime plumbing and every capsule above are in place:

- Claude plugin metadata manifest and `hooks/hooks.json`
- `SessionStart` tiny Twin contract and `UserPromptSubmit` turn router
- `PostToolBatch` (Claude) / `PostToolUse` (Codex) verification instrument and `Stop` verification gate —
  the retrospective "catch" layer: same-turn obligations close only on runner-shaped pass evidence, and
  closure is blocked until they do; later mutations stale prior code verification (loop-bounded — see [docs/VERIFICATION_GATE_HANDOFF.md](docs/VERIFICATION_GATE_HANDOFF.md))
- `PostCompact` compaction archiver — persists host-produced compact summaries verbatim as raw memory logs under
  `~/.twin-sparrow/agent/memory/compaction-log/` by default, or `TWIN_SPARROW_MEMORY_DIR` when overridden
- `src/host/` — a host port (`AgentHostPort`) that normalizes hook payloads and output rendering;
  `claudeHost` and `codexHost` are both thin instances of the shared hooks.json-contract implementation
  (see [Multi-host architecture](#multi-host-architecture-claude-code--codex-cli))
- safe JSON state store and append-only JSONL session ledger
- six runtime capsules from [Capabilities](#capabilities-at-a-glance); the verification gate is a Stop-hook/runtime catch layer, not a per-turn capsule
- read-only `/twin-status` operator command target
- Node test fixtures (86 passing), `docs/HONEST_NUMBERS.md`, `docs/CLAUDE_SMOKE_TEST.md`, and `docs/LIVE_HOOK_VALIDATION.md`

Verify locally:

```bash
npm run test
```

> New or changed hooks in `hooks/hooks.json` (or `codex/hooks.json`) are only read when the host
> app loads the plugin/hook config — restart Claude Code/Desktop or Codex CLI after pulling changes
> that touch hook wiring.

## Multi-host architecture (Claude Code + Codex CLI)

Twin-Sparrow's capsules, state, and routing logic are host-neutral (`src/capsules/`,
`src/routing/`, `src/state/`, `src/skills/`). Only the hook wire format — how a payload
arrives on stdin and how context/decisions are rendered back — is host-specific, and that
seam is isolated in `src/host/`:

- **`src/host/host-port.ts`** — the `AgentHostPort` interface every host implements
  (parse payload, extract prompt/tool observations/Bash observations/Stop/SessionStart/PostCompact signals, render context/decision).
- **`src/host/hooks-json-host.ts`** — the shared implementation of the `hooks.json` contract
  (JSON on stdin, `{hookSpecificOutput.additionalContext}` / `{decision:"block",reason}` on stdout)
  that Claude Code and Codex CLI both use.
- **`src/host/claude-host.ts`** / **`src/host/codex-host.ts`** — thin instances of that shared
  implementation. Neither forks the parser; a host only overrides a method if its wire format
  genuinely diverges.
- **`src/host/index.ts`** — `resolveHost()` picks the host via `TWIN_SPARROW_HOST` (`claude` default,
  `codex` selects the Codex host; an unknown value falls back to Claude rather than failing silently).

**Claude Code** wiring is `hooks/hooks.json` (as documented above). **Codex CLI** wiring lives in
[`codex/`](codex/) — see [codex/README.md](codex/README.md) for setup (enabling `codex_hooks`,
pointing `TWIN_SPARROW_ADAPTER_ROOT` at this repo, merging `codex/hooks.json` into
`~/.codex/hooks.json`, and installing `codex/AGENTS.md`'s tiny contract). Codex has no
`PostToolBatch` event, so its verification instrument runs per-tool on `PostToolUse` instead.

**Open verification**: local simulated hook tests pass, but live host behavior is not yet fully validated.
The remaining claim boundary is tracked in [docs/LIVE_HOOK_VALIDATION.md](docs/LIVE_HOOK_VALIDATION.md).
Three Codex details especially require live evidence before relying on production claims: the inner shape of
Codex's Bash `tool_response` payload, whether non-Bash mutation tools are observable with the current
`PostToolUse` hook matcher, and the live `PostCompact` payload shape. See
[codex/README.md](codex/README.md#open-verification-do-before-trusting-obligation-closing).

## Claude Desktop MCP launcher

Claude Desktop's Developer → Local MCP servers panel may show `claude-skills` as failed with `Server disconnected` when it is launched through a bare GUI-environment command such as:

```text
/Users/lesz/.local/bin/uv tool run claude-skills-mcp
```

The adapter repo carries a stable launcher for that boundary:

```text
scripts/claude-skills-mcp-launcher.sh
```

Recommended Claude Desktop config entry:

```json
"claude-skills": {
  "command": "/bin/bash",
  "args": [
    "/Users/lesz/Developer/Twin-Sparrow/twin-sparrow-claude-adapter/scripts/claude-skills-mcp-launcher.sh"
  ]
}
```

The launcher uses an explicit `uvx --from claude-skills-mcp claude-skills-mcp` boundary, restores a GUI-safe `PATH`, sets `PYTHONUNBUFFERED=1`, defaults `UV_PYTHON=3.12` for Python dependency stability, and passes `config/claude-skills-mcp.json` so Claude Skills MCP loads both `~/.claude/skills` and `~/.twin-sparrow/agent/skills`.

## Native plugin skills and slash commands

The MCP connector above only makes skills *searchable* through tool calls. It does **not** make
them appear in Claude's Plugins panel or Slash-command picker. That surface is a separate,
Anthropic-native mechanism: Claude Code auto-discovers `skills/<name>/SKILL.md` and
`commands/<name>.md` directly from this plugin's root (the same `.claude-plugin` package that
already provides `/solaris`, `/atoman`, and `/twin-status`).

To expose the Twin-Sparrow skill inventory there too, `skills/` and `commands/` are **generated**
from the single source of truth in `src/skills/skill-registry.ts` — never hand-edited:

```bash
npm run skills:generate   # regenerate skills/ and commands/ after editing skill-registry.ts
npm run skills:check      # verify no drift (used in tests, safe to run in CI)
```

Rules encoded by the generator:

- every name in `ALLOWLISTED_SKILLS` becomes a public `skills/<name>/SKILL.md` and a
  `commands/twin-sparrow-<name>.md`, **except** `masa-dual-core-personas`, which stays
  internal-only (available to the adapter's hydration allowlist, not exposed as a public
  slash command)
- generated commands are always prefixed with `twin-sparrow-` so both surfaces Claude Code
  auto-registers (bare `/twin-sparrow-<name>` and namespaced `/twin-sparrow:twin-sparrow-<name>`)
  read as unambiguously ours in the slash-command picker — no bare `/<name>` entries that could
  collide with other plugins or read as unqualified. Skills whose canonical name already
  starts with `twin-sparrow-` are not double-prefixed
- symlinked skill sources are resolved to real file content before being written, so the
  generated plugin package never ships a dangling symlink
- generated command names may never collide with the reserved native commands
  (`solaris`, `atoman`, `twin-status`)

Restart Claude Desktop / Claude Code after regenerating so it reloads the plugin's command and
skill list.

If the plugin was installed from the local marketplace, remember that Claude caches installed
plugins by marketplace/plugin version. After changing generated `skills/` or `commands/`, bump the
versions in `package.json`, `.claude-plugin/plugin.json`, and `.claude-plugin/marketplace.json`,
push the repo, update the installed marketplace clone, then restart Claude so it installs the new
versioned plugin cache. A restart alone may keep serving the old cached version.

## Next implementation slice

1. Run the live Claude smoke test from `docs/CLAUDE_SMOKE_TEST.md`, including Test 11
   (verification gate catch layer with mutation staling).
2. Complete the host matrix in `docs/LIVE_HOOK_VALIDATION.md` for Claude Code and Codex CLI.
3. Capture a real Codex CLI `PostToolUse` payload and confirm the Bash `tool_response`
   shape against `classifyToolResponse`; also confirm whether non-Bash mutation tools are observable.
4. Record pass/fail evidence without claiming token savings.
5. Fix any hook/manifest/command wiring issues discovered live, on either host.
6. Export a real catch-rate metric from the ledger (`verification_gate_block` /
   `verification_caught_error`) once live data exists.
7. Prepare a repo-extraction checklist after live validation.

## Boundary

This folder is intentionally separate so it can become its own repository later. Early phases should avoid deep imports from the parent Twin-Sparrow monorepo unless explicitly approved.
