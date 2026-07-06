import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("twin-status command doc exposes cwd-safe executable targets", () => {
  const commandDoc = readFileSync("commands/twin-status.md", "utf8");

  assert.match(commandDoc, /npm run twin:status/);
  assert.match(commandDoc, /node dist\/src\/commands\/twin-status\.js/);
  assert.match(commandDoc, /node twin-sparrow-claude-adapter\/dist\/src\/commands\/twin-status\.js/);
  assert.match(commandDoc, /slash-command availability depends on the Claude surface/);
});
