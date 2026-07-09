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

test("legacy string verification state migrates to structured obligations", () => {
  const path = join(tempDir(), "state.json");
  const state = createDefaultState({ now: "2026-07-06T00:00:00.000Z", sessionId: "test-session" });
  writeFileSync(
    path,
    JSON.stringify({
      ...state,
      workingState: {
        ...state.workingState,
        verification: {
          required: ["Run local tests after code changes.", "Run local lint after code changes."],
          completed: ["Run local tests after code changes."],
        },
      },
    }),
  );

  const result = readTwinAdapterState(path);
  assert.deepEqual(result.state.workingState.verification.required, ["Run local tests after code changes.", "Run local lint after code changes."]);
  assert.deepEqual(result.state.workingState.verification.completed, ["Run local tests after code changes."]);
  assert.equal(result.state.workingState.verification.mutationSeq, 0);
  assert.equal(result.state.workingState.verification.obligations.length, 2);
  assert.equal(result.state.workingState.verification.obligations[0]?.status, "closed");
  assert.equal(result.state.workingState.verification.obligations[0]?.category, "test");
  assert.equal(result.state.workingState.verification.obligations[1]?.status, "open");
  assert.equal(result.state.workingState.verification.obligations[1]?.category, "lint");
  assert.equal(result.state.workingState.verification.evidence[0]?.rawShape, "legacy-state");
});

test("symlink state path is refused", () => {
  const dir = tempDir();
  const target = join(dir, "target.json");
  const link = join(dir, "state.json");
  writeFileSync(target, "{}\n");
  symlinkSync(target, link);
  assert.throws(() => assertSafeStatePath(link), /symlink state path/);
});
