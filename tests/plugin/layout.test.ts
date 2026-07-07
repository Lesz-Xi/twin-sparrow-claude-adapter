import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("Claude plugin layout keeps metadata and hooks in observed Claude Code shape", () => {
  const plugin = JSON.parse(readFileSync(".claude-plugin/plugin.json", "utf8")) as {
    readonly name?: string;
    readonly version?: string;
    readonly hooks?: unknown;
  };
  const hooks = JSON.parse(readFileSync("hooks/hooks.json", "utf8")) as {
    readonly hooks?: {
      readonly SessionStart?: readonly unknown[];
      readonly UserPromptSubmit?: readonly unknown[];
      readonly PostToolUse?: readonly unknown[];
      readonly PostToolBatch?: readonly unknown[];
      readonly Stop?: readonly unknown[];
    };
  };

  assert.equal(plugin.name, "twin-sparrow");
  assert.equal(plugin.version, "0.0.0");
  assert.equal(plugin.hooks, undefined);
  assert.ok(Array.isArray(hooks.hooks?.SessionStart));
  assert.ok(Array.isArray(hooks.hooks?.UserPromptSubmit));
  assert.equal(hooks.hooks?.PostToolUse, undefined);
  assert.ok(Array.isArray(hooks.hooks?.PostToolBatch));
  assert.ok(Array.isArray(hooks.hooks?.Stop));
  assert.match(JSON.stringify(hooks), /twin-session-start\.js/);
  assert.match(JSON.stringify(hooks), /twin-turn-router\.js/);
  assert.match(JSON.stringify(hooks), /twin-posttoolbatch-instrument\.js/);
  assert.match(JSON.stringify(hooks), /twin-verification-gate\.js/);
});
