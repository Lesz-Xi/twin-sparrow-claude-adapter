# /twin-status

Show the active Twin-Sparrow Claude Adapter state:

- active companion
- current task arc phase
- active skill gates
- source-grounding mode
- pending artifact review count
- last capsule classes emitted

This command is an operator trust surface, not decoration.

Executable target after build:

```bash
node dist/src/commands/twin-status.js
```

Optional test/input form:

```bash
echo '{"statePath":"/path/to/state.json"}' | node dist/src/commands/twin-status.js
```

The command is read-only: it reports state and warnings, but does not mutate adapter state.
