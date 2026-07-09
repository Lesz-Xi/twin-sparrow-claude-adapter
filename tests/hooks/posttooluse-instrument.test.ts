import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { verificationCommandCategory } from "../../src/capsules/verification-gate-capsule.js";
import { handlePostToolBatch } from "../../src/hooks/twin-posttoolbatch-instrument.js";
import { classifyToolResponse, classifyToolResponseForCategory, handlePostToolUse } from "../../src/hooks/twin-posttooluse-instrument.js";
import { handleStop } from "../../src/hooks/twin-verification-gate.js";
import { createDefaultState, createVerificationState } from "../../src/state/schema.js";
import { readTwinAdapterState, writeTwinAdapterState } from "../../src/state/safe-state-store.js";
import {
  bashFailureResponse,
  bashSuccessResponse,
  documentedBashFailureResponse,
  documentedBashSuccessResponse,
  postToolBatchFixture,
  postToolUseBashFixture,
  postToolUseNonBashFixture,
  stopHookFixture,
} from "../fixtures/claude-hook-events.js";

function tempStatePath(): string {
  return join(mkdtempSync(join(tmpdir(), "twin-claude-instrument-")), "state.json");
}

function seedObligations(statePath: string, required: readonly string[], completed: readonly string[] = []): void {
  const base = createDefaultState({ now: "2026-07-06T00:00:00.000Z", sessionId: "test-session" });
  writeTwinAdapterState(
    {
      ...base,
      workingState: { ...base.workingState, verification: createVerificationState({ required, completed, now: "2026-07-06T00:00:00.000Z" }) },
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

test("documented PostToolUse text response closes a category-matched obligation", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  const result = handlePostToolUse(postToolUseBashFixture("npm test", documentedBashSuccessResponse), {
    statePath,
    now: "2026-07-06T02:00:00.000Z",
  });
  assert.deepEqual(result.state?.workingState.verification.completed, ["Run local tests after code changes."]);
  assert.equal(result.state?.workingState.verification.obligations[0]?.status, "closed");
  assert.equal(result.state?.workingState.verification.evidence[0]?.verdict, "pass");
  assert.equal(result.state?.workingState.verification.evidence[0]?.host, "claude");
  assert.equal(result.state?.workingState.verification.evidence[0]?.rawShape, "documented-text");
  assert.equal(ledgerEvents(statePath).at(-1)?.type, "verification_obligation_closed");
  assert.equal(result.outputJson.hookSpecificOutput && (result.outputJson.hookSpecificOutput as { hookEventName?: unknown }).hookEventName, "PostToolUse");
});

test("legacy transcript-derived success shape still closes as a fallback", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  const result = handlePostToolUse(postToolUseBashFixture("npm test", bashSuccessResponse), {
    statePath,
    now: "2026-07-06T02:00:30.000Z",
  });
  assert.deepEqual(result.state?.workingState.verification.completed, ["Run local tests after code changes."]);
});

test("category-matched string success closes an obligation with string evidence", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  const result = handlePostToolUse(postToolUseBashFixture("npm test", "PASS tests/hooks/verification-gate.test.ts\nall tests passed"), {
    statePath,
    now: "2026-07-06T02:00:45.000Z",
  });
  assert.deepEqual(result.state?.workingState.verification.completed, ["Run local tests after code changes."]);
  assert.equal(result.state?.workingState.verification.evidence[0]?.verdict, "pass");
  assert.equal(result.state?.workingState.verification.evidence[0]?.rawShape, "string");
});

test("passing lint command does not close a test obligation (category mismatch)", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  handlePostToolUse(postToolUseBashFixture("npm run lint", documentedBashSuccessResponse), {
    statePath,
    now: "2026-07-06T02:01:00.000Z",
  });
  const read = readTwinAdapterState(statePath);
  assert.deepEqual(read.state.workingState.verification.completed, []);
});

test("failing documented test command logs a caught error and closes nothing", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  handlePostToolUse(postToolUseBashFixture("npm test", documentedBashFailureResponse), {
    statePath,
    now: "2026-07-06T02:02:00.000Z",
  });
  const read = readTwinAdapterState(statePath);
  assert.deepEqual(read.state.workingState.verification.completed, []);
  const last = ledgerEvents(statePath).at(-1);
  assert.equal(last?.type, "verification_caught_error");
  assert.equal(last?.details?.category, "test");
});

test("non-Bash non-mutating tools are a no-op", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  const result = handlePostToolUse(postToolUseNonBashFixture("Read"), { statePath, now: "2026-07-06T02:03:00.000Z" });
  assert.equal(result.state, null);
  assert.deepEqual(ledgerEvents(statePath), []);
  const read = readTwinAdapterState(statePath);
  assert.deepEqual(read.state.workingState.verification.completed, []);
});

test("mutation tool marks prior code verification stale and Stop blocks", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."], ["Run local tests after code changes."]);

  const result = handlePostToolUse(postToolUseNonBashFixture("Edit"), { statePath, now: "2026-07-06T02:03:15.000Z" });

  assert.equal(result.state?.workingState.verification.mutationSeq, 1);
  assert.equal(result.state?.workingState.verification.obligations[0]?.status, "stale");
  assert.deepEqual(result.state?.workingState.verification.completed, []);
  assert.equal(ledgerEvents(statePath).at(-1)?.type, "verification_obligation_stale");

  const stopped = handleStop(stopHookFixture(false), { statePath, now: "2026-07-06T02:03:20.000Z" });
  assert.equal(stopped.outputJson.decision, "block");
  assert.match(String(stopped.outputJson.reason), /Run local tests after code changes\./);
});

test("mutating Bash command marks prior code verification stale", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."], ["Run local tests after code changes."]);

  const result = handlePostToolUse(postToolUseBashFixture("apply_patch <<'PATCH'\n*** Begin Patch\n*** End Patch\nPATCH", { type: "text", text: "Done" }), {
    statePath,
    now: "2026-07-06T02:03:30.000Z",
  });

  assert.equal(result.state?.workingState.verification.mutationSeq, 1);
  assert.equal(result.state?.workingState.verification.obligations[0]?.status, "stale");
  assert.deepEqual(result.state?.workingState.verification.completed, []);
});

test("ambiguous tool response records unknown evidence but neither closes nor logs", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  handlePostToolUse(postToolUseBashFixture("npm test", "some plain output"), {
    statePath,
    now: "2026-07-06T02:04:00.000Z",
  });
  const read = readTwinAdapterState(statePath);
  assert.deepEqual(read.state.workingState.verification.completed, []);
  assert.equal(read.state.workingState.verification.obligations[0]?.status, "open");
  assert.equal(read.state.workingState.verification.evidence[0]?.verdict, "unknown");
  assert.equal(read.state.workingState.verification.evidence[0]?.rawShape, "string");
  assert.deepEqual(ledgerEvents(statePath), []);
});

test("non-runner commands do not close obligations just because a category word appears", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  handlePostToolUse(postToolUseBashFixture("ls -la src/tests", documentedBashSuccessResponse), {
    statePath,
    now: "2026-07-06T02:04:30.000Z",
  });
  handlePostToolUse(postToolUseBashFixture("grep -r lint src", documentedBashSuccessResponse), {
    statePath,
    now: "2026-07-06T02:04:45.000Z",
  });
  const read = readTwinAdapterState(statePath);
  assert.deepEqual(read.state.workingState.verification.completed, []);
  assert.deepEqual(ledgerEvents(statePath), []);
});

test("PostToolBatch closes obligations with one aggregate state update", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes.", "Run local lint after code changes."]);
  const result = handlePostToolBatch(
    postToolBatchFixture([
      { toolName: "Read", response: { type: "text", text: "file" } },
      { toolName: "Bash", command: "npm test", response: documentedBashSuccessResponse },
      { toolName: "Bash", command: "npm run lint", response: { type: "text", text: "lint clean" } },
    ]),
    { statePath, now: "2026-07-06T02:05:00.000Z" },
  );
  assert.deepEqual(result.state?.workingState.verification.completed, ["Run local tests after code changes.", "Run local lint after code changes."]);
  assert.equal(result.outputJson.hookSpecificOutput && (result.outputJson.hookSpecificOutput as { hookEventName?: unknown }).hookEventName, "PostToolBatch");
});

test("PostToolBatch preserves mutation-before-verification ordering", () => {
  const statePath = tempStatePath();
  seedObligations(statePath, ["Run local tests after code changes."]);
  const result = handlePostToolBatch(
    postToolBatchFixture([
      { toolName: "Edit", response: { success: true } },
      { toolName: "Bash", command: "npm test", response: documentedBashSuccessResponse },
    ]),
    { statePath, now: "2026-07-06T02:05:30.000Z" },
  );

  assert.equal(result.state?.workingState.verification.mutationSeq, 1);
  assert.equal(result.state?.workingState.verification.evidence[0]?.observedAtMutationSeq, 1);
  assert.equal(result.state?.workingState.verification.obligations[0]?.status, "closed");
  assert.deepEqual(result.state?.workingState.verification.completed, ["Run local tests after code changes."]);
});

test("verificationCommandCategory is narrow for shell commands", () => {
  assert.equal(verificationCommandCategory("npm test"), "test");
  assert.equal(verificationCommandCategory("pnpm run typecheck"), "type");
  assert.equal(verificationCommandCategory("npm run build"), "build");
  assert.equal(verificationCommandCategory("ls src/tests"), null);
  assert.equal(verificationCommandCategory("grep -r lint src"), null);
  assert.equal(verificationCommandCategory("docker build ."), null);
});

test("classifyToolResponse supports documented hook shape and legacy fallback shape", () => {
  assert.equal(classifyToolResponse(documentedBashSuccessResponse), "pass");
  assert.equal(classifyToolResponse(documentedBashFailureResponse), "fail");
  assert.equal(classifyToolResponse(bashSuccessResponse), "pass");
  assert.equal(classifyToolResponse(bashFailureResponse), "fail");
  assert.equal(classifyToolResponse("Error: Exit code 128\ndetails"), "fail");
  assert.equal(classifyToolResponse("PASS tests/foo.test.ts\nall tests passed"), "unknown");
  assert.equal(classifyToolResponseForCategory("PASS tests/foo.test.ts\nall tests passed", "test"), "pass");
  assert.equal(classifyToolResponseForCategory("plain output with no stable pass signal", "test"), "unknown");
  assert.equal(classifyToolResponse({ exitCode: 0 }), "pass");
  assert.equal(classifyToolResponse({ exitCode: 2 }), "fail");
  assert.equal(classifyToolResponse({ stdout: "ok", interrupted: true }), "fail");
  assert.equal(classifyToolResponse({ stdout: "ok" }), "unknown");
  assert.equal(classifyToolResponse(undefined), "unknown");
});
