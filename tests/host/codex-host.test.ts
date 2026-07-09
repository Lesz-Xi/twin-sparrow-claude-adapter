import test from "node:test";
import assert from "node:assert/strict";
import { claudeHost, codexHost, resolveHost } from "../../src/host/index.js";
import {
  documentedBashSuccessResponse,
  postToolUseBashFixture,
  stopHookFixture,
  userPromptSubmitFixture,
} from "../fixtures/claude-hook-events.js";

// Payloads shaped with the documented Codex field names
// (https://developers.openai.com/codex/hooks).
function codexUserPromptSubmit(prompt: string): string {
  return JSON.stringify({ hook_event_name: "UserPromptSubmit", session_id: "s", turn_id: "t", prompt });
}
function codexPostToolUse(command: string, response: unknown): string {
  return JSON.stringify({
    hook_event_name: "PostToolUse",
    session_id: "s",
    turn_id: "t",
    tool_name: "Bash",
    tool_use_id: "u",
    tool_input: { command },
    tool_response: response,
  });
}
function codexStop(active: boolean): string {
  return JSON.stringify({
    hook_event_name: "Stop",
    session_id: "s",
    turn_id: "t",
    stop_hook_active: active,
    last_assistant_message: "done",
  });
}

function codexPostCompact(summary: string): string {
  return JSON.stringify({
    hook_event_name: "PostCompact",
    session_id: "s",
    turn_id: "t",
    trigger: "manual",
    compact_summary: summary,
  });
}

test("resolveHost selects the Codex host when requested", () => {
  assert.equal(resolveHost({ TWIN_SPARROW_HOST: "codex" }).id, "codex");
});

test("Codex host parses the documented Codex payload shapes", () => {
  assert.equal(codexHost.extractPrompt(codexHost.parsePayload(codexUserPromptSubmit("do it"))), "do it");

  const observations = codexHost.extractBashObservations(
    codexHost.parsePayload(codexPostToolUse("npm test", documentedBashSuccessResponse)),
  );
  assert.equal(observations.length, 1);
  assert.equal(observations[0]?.command, "npm test");

  assert.deepEqual(codexHost.extractStop(codexHost.parsePayload(codexStop(true))), {
    stopHookActive: true,
    sessionId: "s",
  });
  assert.deepEqual(codexHost.extractSessionStart(codexHost.parsePayload(JSON.stringify({ source: "startup", session_id: "s" }))), {
    sessionId: "s",
    source: "startup",
  });

  assert.deepEqual(codexHost.extractCompactSummary(codexHost.parsePayload(codexPostCompact("codex compact"))), {
    summary: "codex compact",
    trigger: "manual",
    sessionId: "s",
  });
});

test("Codex and Claude hosts produce identical normalized output for shared shapes", () => {
  const prompt = userPromptSubmitFixture("shared prompt");
  assert.equal(
    codexHost.extractPrompt(codexHost.parsePayload(prompt)),
    claudeHost.extractPrompt(claudeHost.parsePayload(prompt)),
  );

  const ptu = postToolUseBashFixture("npm test", documentedBashSuccessResponse);
  assert.deepEqual(
    codexHost.extractBashObservations(codexHost.parsePayload(ptu)),
    claudeHost.extractBashObservations(claudeHost.parsePayload(ptu)),
  );

  const stop = stopHookFixture(false);
  assert.deepEqual(
    codexHost.extractStop(codexHost.parsePayload(stop)),
    claudeHost.extractStop(claudeHost.parsePayload(stop)),
  );

  assert.deepEqual(codexHost.renderContext("PostToolUse", "x"), claudeHost.renderContext("PostToolUse", "x"));
  assert.deepEqual(
    codexHost.renderDecision({ kind: "block", reason: "r" }),
    claudeHost.renderDecision({ kind: "block", reason: "r" }),
  );
});
