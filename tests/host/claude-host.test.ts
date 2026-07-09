import test from "node:test";
import assert from "node:assert/strict";
import { claudeHost, resolveHost } from "../../src/host/index.js";
import {
  documentedBashSuccessResponse,
  postCompactFixture,
  postToolBatchFixture,
  postToolUseBashFixture,
  stopHookFixture,
  userPromptSubmitFixture,
  nestedUserPromptSubmitFixture,
} from "../fixtures/claude-hook-events.js";

test("resolveHost defaults to the Claude host", () => {
  assert.equal(resolveHost({}).id, "claude");
  assert.equal(resolveHost({ TWIN_SPARROW_HOST: "claude" }).id, "claude");
});

test("resolveHost falls back to Claude for an unknown host value", () => {
  assert.equal(resolveHost({ TWIN_SPARROW_HOST: "nonsense" }).id, "claude");
});

test("Claude host extracts the prompt from flat and nested payloads", () => {
  assert.equal(claudeHost.extractPrompt(claudeHost.parsePayload(userPromptSubmitFixture("do the thing"))), "do the thing");
  assert.equal(claudeHost.extractPrompt(claudeHost.parsePayload(nestedUserPromptSubmitFixture("nested thing"))), "nested thing");
  assert.equal(claudeHost.extractPrompt(claudeHost.parsePayload("")), "");
  assert.equal(claudeHost.extractPrompt("bare string prompt"), "bare string prompt");
});

test("Claude host extracts a single Bash observation from a PostToolUse payload", () => {
  const observations = claudeHost.extractBashObservations(
    claudeHost.parsePayload(postToolUseBashFixture("npm test", documentedBashSuccessResponse)),
  );
  assert.equal(observations.length, 1);
  assert.equal(observations[0]?.command, "npm test");
  assert.deepEqual(observations[0]?.response, documentedBashSuccessResponse);
});

test("Claude host collects only Bash observations from a mixed batch", () => {
  const observations = claudeHost.extractBashObservations(
    claudeHost.parsePayload(
      postToolBatchFixture([
        { toolName: "Read", response: { type: "text", text: "file" } },
        { toolName: "Bash", command: "npm test", response: documentedBashSuccessResponse },
        { toolName: "Bash", command: "npm run lint", response: { type: "text", text: "clean" } },
      ]),
    ),
  );
  assert.deepEqual(
    observations.map((o) => o.command),
    ["npm test", "npm run lint"],
  );
});

test("Claude host normalizes PostCompact summaries", () => {
  assert.deepEqual(claudeHost.extractCompactSummary(claudeHost.parsePayload(postCompactFixture("compact body", "manual"))), {
    summary: "compact body",
    trigger: "manual",
    sessionId: "test-session",
  });
  assert.deepEqual(
    claudeHost.extractCompactSummary(
      claudeHost.parsePayload(JSON.stringify({ compactSummary: "camel body", sessionId: "camel-session", trigger: "auto" })),
    ),
    {
      summary: "camel body",
      trigger: "auto",
      sessionId: "camel-session",
    },
  );
  assert.deepEqual(claudeHost.extractCompactSummary(claudeHost.parsePayload(JSON.stringify({ compact_summary: "x", trigger: "other" }))), {
    summary: "x",
    trigger: "unknown",
  });
  assert.equal(claudeHost.extractCompactSummary(claudeHost.parsePayload(JSON.stringify({ trigger: "manual" }))), null);
});

test("Claude host normalizes the Stop signal", () => {
  assert.deepEqual(claudeHost.extractStop(claudeHost.parsePayload(stopHookFixture(true))), {
    stopHookActive: true,
    sessionId: "test-session",
  });
  assert.deepEqual(claudeHost.extractStop(claudeHost.parsePayload(stopHookFixture(false))), {
    stopHookActive: false,
    sessionId: "test-session",
  });
  assert.deepEqual(claudeHost.extractStop(claudeHost.parsePayload("")), { stopHookActive: false });
});

test("Claude host renders context and decisions in the documented wire shape", () => {
  assert.deepEqual(claudeHost.renderContext("UserPromptSubmit", "ctx"), {
    hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: "ctx" },
  });
  assert.deepEqual(claudeHost.renderDecision({ kind: "allow" }), {});
  assert.deepEqual(claudeHost.renderDecision({ kind: "block", reason: "unmet" }), {
    decision: "block",
    reason: "unmet",
  });
});
