import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { handleTwinStatus } from "../../src/commands/twin-status.js";
import { handleSessionStart } from "../../src/hooks/twin-session-start.js";
import { handleUserPromptSubmit } from "../../src/hooks/twin-turn-router.js";
import { userPromptSubmitFixture } from "../fixtures/claude-hook-events.js";

function tempStatePath(): string {
  return join(mkdtempSync(join(tmpdir(), "twin-claude-status-")), "state.json");
}

test("twin-status renders current adapter state without mutation", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  handleUserPromptSubmit(userPromptSubmitFixture("Hydrate full skill unknown-skill"), {
    statePath,
    now: "2026-07-06T00:01:00.000Z",
  });

  const result = handleTwinStatus({ statePath });

  assert.match(result.output, /TWIN-SPARROW STATUS/);
  assert.match(result.output, /Companion: atoman/);
  assert.match(result.output, /Phase: planning/);
  assert.match(result.output, /Active skills: unknown-skill/);
  assert.match(result.output, /Skill hydration: unknown-skill:blocked/);
  assert.match(result.output, /Last capsule classes: companion-continuity, working-state, skill-gate/);
  assert.equal(result.state.skills.hydration[0]?.status, "blocked");
});

test("twin-status safely reports default state when state file is missing", () => {
  const statePath = tempStatePath();
  const result = handleTwinStatus({ statePath });

  assert.match(result.output, /TWIN-SPARROW STATUS/);
  assert.match(result.output, /Companion: atoman/);
  assert.match(result.output, /Active skills: none/);
  assert.match(result.output, /Warnings: none/);
});

test("twin-status CLI accepts a statePath JSON payload", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  handleUserPromptSubmit(userPromptSubmitFixture("Solaris mode"), {
    statePath,
    now: "2026-07-06T00:01:00.000Z",
  });

  const output = execFileSync(process.execPath, ["dist/src/commands/twin-status.js"], {
    cwd: process.cwd(),
    input: JSON.stringify({ statePath }),
    encoding: "utf8",
  });

  assert.match(output, /TWIN-SPARROW STATUS/);
  assert.match(output, /Companion: solaris/);
  assert.match(output, /Companion signal: explicit_override/);
});
