import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { handleStop, MAX_BLOCKS_PER_ARC } from "../../src/hooks/twin-verification-gate.js";
import { handlePostToolUse } from "../../src/hooks/twin-posttooluse-instrument.js";
import { handleUserPromptSubmit } from "../../src/hooks/twin-turn-router.js";
import { createDefaultState, createVerificationState, type TaskArcPhase } from "../../src/state/schema.js";
import { readTwinAdapterState, writeTwinAdapterState } from "../../src/state/safe-state-store.js";
import { documentedBashSuccessResponse, postToolUseBashFixture, stopHookFixture, userPromptSubmitFixture } from "../fixtures/claude-hook-events.js";

function tempStatePath(): string {
  return join(mkdtempSync(join(tmpdir(), "twin-claude-gate-")), "state.json");
}

function seedState(statePath: string, phase: TaskArcPhase, required: readonly string[], completed: readonly string[]): void {
  const base = createDefaultState({ now: "2026-07-06T00:00:00.000Z", sessionId: "test-session" });
  writeTwinAdapterState(
    {
      ...base,
      session: { ...base.session, phase },
      workingState: {
        ...base.workingState,
        verification: createVerificationState({ required, completed, now: "2026-07-06T00:00:00.000Z" }),
      },
    },
    statePath,
  );
}

function ledgerEvents(statePath: string): ReadonlyArray<{ type?: string; details?: Record<string, unknown> }> {
  const ledgerPath = join(dirname(statePath), "session-ledger.jsonl");
  if (!existsSync(ledgerPath)) return [];
  return readFileSync(ledgerPath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { type?: string; details?: Record<string, unknown> });
}

test("gate blocks close during implementing phase with unmet obligation", () => {
  const statePath = tempStatePath();
  seedState(statePath, "implementing", ["tests pass"], []);
  const result = handleStop(stopHookFixture(false), { statePath, now: "2026-07-06T01:00:00.000Z" });
  assert.equal(result.outputJson.decision, "block");
  assert.match(String(result.outputJson.reason), /proof obligations are unmet/);
  assert.match(String(result.outputJson.reason), /tests pass/);
  assert.equal(ledgerEvents(statePath).at(-1)?.type, "verification_gate_block");
});

test("implementation prompt opens a blocking test obligation before Stop", () => {
  const statePath = tempStatePath();
  handleUserPromptSubmit(userPromptSubmitFixture("Implement a small code change"), { statePath, now: "2026-07-06T01:00:30.000Z" });

  const state = readTwinAdapterState(statePath).state;
  assert.equal(state.session.phase, "implementing");
  assert.deepEqual(state.workingState.verification.required, ["Run local tests after code changes."]);
  assert.deepEqual(state.workingState.verification.completed, []);

  const result = handleStop(stopHookFixture(false), { statePath, now: "2026-07-06T01:00:45.000Z" });
  assert.equal(result.outputJson.decision, "block");
  assert.match(String(result.outputJson.reason), /Run local tests after code changes\./);
});

test("gate blocks close in closing phase with unmet obligation and names it", () => {
  const statePath = tempStatePath();
  seedState(statePath, "closing", ["tests pass"], []);
  const result = handleStop(stopHookFixture(false), { statePath, now: "2026-07-06T01:01:00.000Z" });
  assert.equal(result.outputJson.decision, "block");
  assert.match(String(result.outputJson.reason), /proof obligations are unmet/);
  assert.match(String(result.outputJson.reason), /tests pass/);
  assert.equal(ledgerEvents(statePath).at(-1)?.type, "verification_gate_block");
});

test("gate allows close when required is a subset of completed", () => {
  const statePath = tempStatePath();
  seedState(statePath, "closing", ["tests pass"], ["Tests pass"]);
  const result = handleStop(stopHookFixture(false), { statePath, now: "2026-07-06T01:02:00.000Z" });
  assert.deepEqual(result.outputJson, {});
});

test("stop_hook_active loop guard allows close even with open obligations", () => {
  const statePath = tempStatePath();
  seedState(statePath, "closing", ["tests pass"], []);
  const result = handleStop(stopHookFixture(true), { statePath, now: "2026-07-06T01:03:00.000Z" });
  assert.deepEqual(result.outputJson, {});
});

test("max blocks per arc degrades to warning with ledger event", () => {
  const statePath = tempStatePath();
  seedState(statePath, "closing", ["tests pass"], []);
  for (let index = 0; index < MAX_BLOCKS_PER_ARC; index += 1) {
    const blocked = handleStop(stopHookFixture(false), { statePath, now: `2026-07-06T01:0${4 + index}:00.000Z` });
    assert.equal(blocked.outputJson.decision, "block");
  }
  const degraded = handleStop(stopHookFixture(false), { statePath, now: "2026-07-06T01:06:00.000Z" });
  assert.deepEqual(degraded.outputJson, {});
  assert.ok(degraded.warnings.some((warning) => warning.includes("downgraded to warning")));
  assert.equal(ledgerEvents(statePath).at(-1)?.type, "verification_gate_warn");
});

test("instrument pass evidence clears the gate within the same turn", () => {
  const statePath = tempStatePath();
  seedState(statePath, "closing", ["Run local tests after code changes."], []);
  const blocked = handleStop(stopHookFixture(false), { statePath, now: "2026-07-06T01:07:00.000Z" });
  assert.equal(blocked.outputJson.decision, "block");

  handlePostToolUse(postToolUseBashFixture("npm test", documentedBashSuccessResponse), { statePath, now: "2026-07-06T01:08:00.000Z" });

  const cleared = handleStop(stopHookFixture(false), { statePath, now: "2026-07-06T01:09:00.000Z" });
  assert.deepEqual(cleared.outputJson, {});
});
