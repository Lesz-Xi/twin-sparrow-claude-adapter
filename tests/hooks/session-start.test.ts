import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { handleSessionStart } from "../../src/hooks/twin-session-start.js";

function tempStatePath(): string {
  return join(mkdtempSync(join(tmpdir(), "twin-claude-session-")), "state.json");
}

test("SessionStart emits the tiny Twin contract and writes state", () => {
  const statePath = tempStatePath();
  const result = handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  assert.match(result.output, /TWIN-SPARROW TINY CONTRACT/);
  assert.match(result.output, /Truth before flourish/);
  assert.match(result.output, /Do not replay the full Twin doctrine/);
  const state = JSON.parse(readFileSync(statePath, "utf8")) as { lastCapsuleClasses?: readonly string[] };
  assert.deepEqual(state.lastCapsuleClasses, ["tiny-twin-contract"]);
});
