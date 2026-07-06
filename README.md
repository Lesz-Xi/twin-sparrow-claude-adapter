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
- allowlisted full skill hydration for the local Twin-Sparrow skill inventory with fail-closed unknown skill behavior
- read-only `/twin-status` operator command target
- Node test fixtures
- `docs/HONEST_NUMBERS.md`
- `docs/CLAUDE_SMOKE_TEST.md`

Verify locally:

```bash
npm run test
```

Current verification: run `npm run test` in this folder.

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

- every name in `ALLOWLISTED_SKILLS` becomes a public `skills/<name>/SKILL.md` and
  `commands/<name>.md`, **except** `masa-dual-core-personas`, which stays internal-only
  (available to the adapter's hydration allowlist, not exposed as a public slash command)
- symlinked skill sources are resolved to real file content before being written, so the
  generated plugin package never ships a dangling symlink
- generated command names may never collide with the reserved native commands
  (`solaris`, `atoman`, `twin-status`)

Restart Claude Desktop / Claude Code after regenerating so it reloads the plugin's command and
skill list.

## Next implementation slice

1. Run Phase 11 live Claude smoke test from `docs/CLAUDE_SMOKE_TEST.md`.
2. Record pass/fail evidence without claiming token savings.
3. Fix any hook/manifest/command wiring issues discovered live.
4. Prepare Phase 12 repo-extraction checklist after live validation.

## Boundary

This folder is intentionally separate so it can become its own repository later. Early phases should avoid deep imports from the parent Twin-Sparrow monorepo unless explicitly approved.
