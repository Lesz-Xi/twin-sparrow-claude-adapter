import { mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultState } from "../../src/state/schema.js";
import { assertSafeStatePath, readTwinAdapterState, writeTwinAdapterState } from "../../src/state/safe-state-store.js";

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), "twin-claude-state-"));
}

test("missing state returns a safe default", () => {
  const result = readTwinAdapterState(join(tempDir(), "state.json"));
  assert.equal(result.state.version, 1);
  assert.equal(result.state.companion.orientation, "atoman");
});

test("state write and read round trips", () => {
  const path = join(tempDir(), "state.json");
  const state = createDefaultState({ now: "2026-07-06T00:00:00.000Z", sessionId: "test-session" });
  writeTwinAdapterState(state, path);
  const result = readTwinAdapterState(path);
  assert.equal(result.state.session.id, "test-session");
});

test("symlink state path is refused", () => {
  const dir = tempDir();
  const target = join(dir, "target.json");
  const link = join(dir, "state.json");
  writeFileSync(target, "{}\n");
  symlinkSync(target, link);
  assert.throws(() => assertSafeStatePath(link), /symlink state path/);
});
