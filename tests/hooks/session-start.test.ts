import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { handleSessionStart, handleSessionStartPayload } from "../../src/hooks/twin-session-start.js";

function tempStatePath(): string {
  return join(mkdtempSync(join(tmpdir(), "twin-claude-session-")), "state.json");
}

function ledgerEvents(statePath: string): ReadonlyArray<{ type?: string; details?: Record<string, unknown> }> {
  const ledgerPath = join(statePath, "..");
  const resolved = join(ledgerPath, "session-ledger.jsonl");
  if (!existsSync(resolved)) return [];
  return readFileSync(resolved, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { type?: string; details?: Record<string, unknown> });
}

test("SessionStart emits the tiny Twin contract, rotates arcId, and writes state", () => {
  const statePath = tempStatePath();
  const result = handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z", arcId: "arc-test-1" });
  assert.match(result.output, /TWIN-SPARROW TINY CONTRACT/);
  assert.match(result.output, /Truth before flourish/);
  assert.match(result.output, /Do not replay the full Twin doctrine/);
  const state = JSON.parse(readFileSync(statePath, "utf8")) as { session?: { arcId?: string }; lastCapsuleClasses?: readonly string[] };
  assert.equal(state.session?.arcId, "arc-test-1");
  assert.deepEqual(state.lastCapsuleClasses, ["tiny-twin-contract"]);
});

test("SessionStart admits host stdin session metadata", () => {
  const statePath = tempStatePath();
  const result = handleSessionStartPayload(JSON.stringify({ hook_event_name: "SessionStart", session_id: "live-session-1", source: "startup" }), {
    statePath,
    now: "2026-07-06T00:00:30.000Z",
    arcId: "arc-test-2",
  });

  assert.match(result.output, /TWIN-SPARROW TINY CONTRACT/);
  const state = JSON.parse(readFileSync(statePath, "utf8")) as { session?: { id?: string; arcId?: string } };
  assert.equal(state.session?.id, "live-session-1");
  assert.equal(state.session?.arcId, "arc-test-2");
  const last = ledgerEvents(statePath).at(-1);
  assert.equal(last?.type, "session_start");
  assert.equal(last?.details?.source, "startup");
});
