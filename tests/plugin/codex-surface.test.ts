import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { renderTinyTwinContract } from "../../src/capsules/tiny-twin-contract.js";

// Tests run from the repo root (npm test), so source-tree artifacts resolve from cwd —
// import.meta.url would point into dist/, where codex/ does not exist.
const CODEX_DIR = join(process.cwd(), "codex");

interface HookLeaf {
  readonly type?: string;
  readonly command?: string;
  readonly timeout?: number;
}
interface HookGroup {
  readonly matcher?: string;
  readonly hooks?: readonly HookLeaf[];
}
interface HooksJson {
  readonly hooks?: Record<string, readonly HookGroup[]>;
}

function readCodexHooks(): HooksJson {
  return JSON.parse(readFileSync(join(CODEX_DIR, "hooks.json"), "utf8")) as HooksJson;
}

function commandsFor(hooks: HooksJson, event: string): readonly string[] {
  return (hooks.hooks?.[event] ?? []).flatMap((group) => (group.hooks ?? []).map((leaf) => leaf.command ?? ""));
}

test("codex/hooks.json wires the four Codex-supported events", () => {
  const hooks = readCodexHooks();
  const events = Object.keys(hooks.hooks ?? {}).sort();
  assert.deepEqual(events, ["PostToolUse", "SessionStart", "Stop", "UserPromptSubmit"]);
});

test("codex/hooks.json uses PostToolUse (not PostToolBatch, which Codex lacks)", () => {
  const hooks = readCodexHooks();
  assert.ok(hooks.hooks?.PostToolUse, "expected a PostToolUse entry");
  assert.ok(!hooks.hooks?.PostToolBatch, "Codex has no PostToolBatch event");
  const postTool = commandsFor(hooks, "PostToolUse");
  assert.ok(postTool.every((c) => c.includes("twin-posttooluse-instrument.js")));
});

test("every codex hook selects the codex host and the adapter root", () => {
  const hooks = readCodexHooks();
  const allCommands = Object.keys(hooks.hooks ?? {}).flatMap((event) => commandsFor(hooks, event));
  assert.equal(allCommands.length, 4);
  for (const command of allCommands) {
    assert.match(command, /TWIN_SPARROW_HOST=codex/, `host env missing in: ${command}`);
    assert.match(command, /\$\{TWIN_SPARROW_ADAPTER_ROOT\}/, `adapter root missing in: ${command}`);
    assert.match(command, /^TWIN_SPARROW_HOST=codex node /, `command should be a node invocation: ${command}`);
  }
});

test("codex hooks point at compiled dist hooks that exist", () => {
  const hooks = readCodexHooks();
  const expected: Record<string, string> = {
    SessionStart: "dist/src/hooks/twin-session-start.js",
    UserPromptSubmit: "dist/src/hooks/twin-turn-router.js",
    PostToolUse: "dist/src/hooks/twin-posttooluse-instrument.js",
    Stop: "dist/src/hooks/twin-verification-gate.js",
  };
  for (const [event, rel] of Object.entries(expected)) {
    const commands = commandsFor(hooks, event);
    assert.ok(commands.some((c) => c.includes(rel)), `${event} should invoke ${rel}`);
  }
});

test("codex/AGENTS.md embeds the current tiny contract verbatim (drift guard)", () => {
  const agents = readFileSync(join(CODEX_DIR, "AGENTS.md"), "utf8");
  assert.ok(agents.includes(renderTinyTwinContract()), "AGENTS.md is out of sync with renderTinyTwinContract()");
});
