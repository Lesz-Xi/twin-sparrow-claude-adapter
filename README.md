<p align="center">
  <img src="assets/cover.png" alt="Twin-Sparrow Claude Adapter" width="100%">
</p>

<h1 align="center">Twin-Sparrow Claude Adapter</h1>

<p align="center">
  Token-efficient Claude Code adapter for Twin-Sparrow —
  one companion, two activations (<strong>Solaris</strong> &amp; <strong>Atoman</strong>).
</p>

---

## Purpose

This project lets Claude use Twin-Sparrow’s architecture **without replaying the full Twin-Sparrow doctrine, memory, skills, source context, and working state on every turn**.

Instead of one heavy system prompt, each turn injects only the smallest faithful runtime slice needed:

```text
Claude hook event
→ local Twin adapter state
→ selected runtime capsules
→ compact additionalContext injection
→ state / token ledger update
```

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
| **Verification gate** | Blocks same-turn closure on unmet proof obligations; obligations close only when a runner-shaped verification command reports pass evidence |

## Current status

Initial runnable adapter skeleton implemented — the runtime plumbing and every capsule above are in place:

- Claude plugin metadata manifest and `hooks/hooks.json`
- `SessionStart` tiny Twin contract and `UserPromptSubmit` turn router
- `PostToolBatch` verification instrument and `Stop` verification gate — the retrospective
  "catch" layer: same-turn obligations close only on runner-shaped pass evidence, and closure is blocked
  until they do (loop-bounded — see [docs/VERIFICATION_GATE_HANDOFF.md](docs/VERIFICATION_GATE_HANDOFF.md))
- safe JSON state store and append-only JSONL session ledger
- six runtime capsules from [Capabilities](#capabilities-at-a-glance); the verification gate is a Stop-hook/runtime catch layer, not a per-turn capsule
- read-only `/twin-status` operator command target
- Node test fixtures (56 passing), `docs/HONEST_NUMBERS.md`, and `docs/CLAUDE_SMOKE_TEST.md`

Verify locally:

```bash
npm run test
```

> New or changed hooks in `hooks/hooks.json` are only read when Claude Desktop / Claude Code
> loads the plugin — restart after pulling changes that touch hook wiring.

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
   (verification gate catch layer).
2. Record pass/fail evidence without claiming token savings.
3. Fix any hook/manifest/command wiring issues discovered live.
4. Export a real catch-rate metric from the ledger (`verification_gate_block` /
   `verification_caught_error`) once live data exists.
5. Prepare a repo-extraction checklist after live validation.

## Boundary

This folder is intentionally separate so it can become its own repository later. Early phases should avoid deep imports from the parent Twin-Sparrow monorepo unless explicitly approved.
