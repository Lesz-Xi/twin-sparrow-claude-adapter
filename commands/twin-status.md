---
description: "Show the active Twin-Sparrow companion, arc phase, skill gates, and source-grounding state (read-only)."
---

# /twin-status

Show the active Twin-Sparrow Claude Adapter state:

- active companion
- current task arc phase
- active skill gates
- source-grounding mode
- pending artifact review count
- last capsule classes emitted

This command is an operator trust surface, not decoration.

Native slash-command availability depends on the Claude surface. If `/twin-status` or `/twin-sparrow:twin-status` is not recognized, run the executable target instead.

Executable target after build, from the adapter repo root:

```bash
npm run twin:status
```

Equivalent direct target, from the adapter repo root:

```bash
node dist/src/commands/twin-status.js
```

Direct target from the parent `Twin-Sparrow` workspace root:

```bash
node twin-sparrow-claude-adapter/dist/src/commands/twin-status.js
```

Optional test/input form from the adapter repo root:

```bash
echo '{"statePath":"/path/to/state.json"}' | node dist/src/commands/twin-status.js
```

The command is read-only: it reports state and warnings, but does not mutate adapter state.
