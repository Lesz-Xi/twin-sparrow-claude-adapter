import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { handleSessionStart } from "../../src/hooks/twin-session-start.js";
import { handleUserPromptSubmit } from "../../src/hooks/twin-turn-router.js";
import { nestedUserPromptSubmitFixture, userPromptSubmitFixture, userPromptSubmitWithArtifactsFixture, userPromptSubmitWithSourcesFixture } from "../fixtures/claude-hook-events.js";

function tempStatePath(): string {
  return join(mkdtempSync(join(tmpdir(), "twin-claude-turn-")), "state.json");
}

function tempSkillRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "twin-claude-skills-"));
  const pearlDir = join(root, "pearl-representation");
  mkdirSync(pearlDir, { recursive: true });
  writeFileSync(
    join(pearlDir, "SKILL.md"),
    [
      "---",
      "name: pearl-representation",
      "description: Fixture Pearl representation skill.",
      "---",
      "# /represent — Fixture Pearl Representation Skill",
      "Full fixture body for representation analysis.",
    ].join("\n"),
  );
  return root;
}

test("UserPromptSubmit emits companion and working-state capsules", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  const result = handleUserPromptSubmit(userPromptSubmitFixture("Implement the next phase"), {
    statePath,
    now: "2026-07-06T00:01:00.000Z",
  });
  assert.equal(result.outputJson.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /COMPANION CAPSULE/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /WORKING STATE CAPSULE/);
  assert.equal(result.state.companion.orientation, "atoman");
  assert.equal(result.state.workingState.taskType, "implementation");
  assert.deepEqual(result.state.workingState.verification.required, ["Run local tests after code changes."]);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Verification mutation seq: 0/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /open \/ blocking \/ test: Run local tests after code changes\./);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Latest verification evidence: none/);
});

test("acknowledgments preserve companion continuity", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  handleUserPromptSubmit(userPromptSubmitFixture("Solaris mode"), { statePath, now: "2026-07-06T00:01:00.000Z" });
  const result = handleUserPromptSubmit(userPromptSubmitFixture("thanks"), { statePath, now: "2026-07-06T00:02:00.000Z" });
  assert.equal(result.state.companion.orientation, "solaris");
  assert.equal(result.state.companion.preservedContinuity, true);
});

test("immediate closure preserves the companion that carried the arc", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  handleUserPromptSubmit(userPromptSubmitFixture("Solaris mode"), { statePath, now: "2026-07-06T00:01:00.000Z" });
  const result = handleUserPromptSubmit(userPromptSubmitFixture("we're done, thanks"), { statePath, now: "2026-07-06T00:02:00.000Z" });
  assert.equal(result.state.companion.orientation, "solaris");
  assert.equal(result.state.companion.signal, "closure_continuity");
  assert.equal(result.state.companion.preservedContinuity, true);
  assert.equal(result.state.session.phase, "closing");
});

test("clear new arc with execution intent can switch companion", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  handleUserPromptSubmit(userPromptSubmitFixture("Solaris mode"), { statePath, now: "2026-07-06T00:01:00.000Z" });
  const result = handleUserPromptSubmit(userPromptSubmitFixture("New task: implement the companion router parity expansion"), {
    statePath,
    now: "2026-07-06T00:02:00.000Z",
  });
  assert.equal(result.state.companion.orientation, "atoman");
  assert.equal(result.state.companion.preservedContinuity, false);
  assert.equal(result.state.companion.consecutiveTurns, 1);
});

test("weak new-arc signal without different intent preserves continuity", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  handleUserPromptSubmit(userPromptSubmitFixture("Solaris mode"), { statePath, now: "2026-07-06T00:01:00.000Z" });
  const result = handleUserPromptSubmit(userPromptSubmitFixture("new question"), { statePath, now: "2026-07-06T00:02:00.000Z" });
  assert.equal(result.state.companion.orientation, "solaris");
  assert.equal(result.state.companion.signal, "new_arc");
  assert.equal(result.state.companion.preservedContinuity, true);
});

test("10 consecutive Atoman turns require a softening check-in", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  let result = handleUserPromptSubmit(userPromptSubmitFixture("Implement slice 1"), { statePath, now: "2026-07-06T00:01:00.000Z" });
  for (let index = 2; index <= 10; index += 1) {
    result = handleUserPromptSubmit(userPromptSubmitFixture(`Implement slice ${index}`), { statePath, now: `2026-07-06T00:${String(index).padStart(2, "0")}:00.000Z` });
  }
  assert.equal(result.state.companion.orientation, "atoman");
  assert.equal(result.state.companion.consecutiveTurns, 10);
  assert.equal(result.state.companion.checkIn.required, true);
  assert.equal(result.state.companion.checkIn.reason, "atoman_streak");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Check-in required: yes \/ atoman_streak/);
});

test("10 consecutive Solaris turns require a concrete-path check-in", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });
  let result = handleUserPromptSubmit(userPromptSubmitFixture("Why does this architecture matter?"), { statePath, now: "2026-07-06T00:01:00.000Z" });
  for (let index = 2; index <= 10; index += 1) {
    result = handleUserPromptSubmit(userPromptSubmitFixture(`Why does this representation matter ${index}?`), { statePath, now: `2026-07-06T00:${String(index).padStart(2, "0")}:00.000Z` });
  }
  assert.equal(result.state.companion.orientation, "solaris");
  assert.equal(result.state.companion.consecutiveTurns, 10);
  assert.equal(result.state.companion.checkIn.required, true);
  assert.equal(result.state.companion.checkIn.reason, "solaris_stalled");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Check-in required: yes \/ solaris_stalled/);
});

test("namespaced Solaris slash command treats trailing text as payload, not visible routing content", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });

  const result = handleUserPromptSubmit(userPromptSubmitFixture("/twin-sparrow:solaris Hey, Chief"), {
    statePath,
    now: "2026-07-06T00:02:30.000Z",
  });

  assert.equal(result.state.companion.orientation, "solaris");
  assert.equal(result.state.companion.signal, "explicit_override");
  assert.equal(result.state.workingState.goal, "Hey, Chief");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /\/twin-sparrow:solaris is routing metadata/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /User payload after command: "Hey, Chief"/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Do not narrate the solaris switch/);
});

test("bare Atoman slash command activates mode without exposing command text as goal", () => {
  const statePath = tempStatePath();
  handleSessionStart({ statePath, now: "2026-07-06T00:00:00.000Z" });

  const result = handleUserPromptSubmit(userPromptSubmitFixture("/atoman"), {
    statePath,
    now: "2026-07-06T00:02:45.000Z",
  });

  assert.equal(result.state.companion.orientation, "atoman");
  assert.equal(result.state.companion.signal, "explicit_override");
  assert.equal(result.state.workingState.goal, "atoman mode");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Do not narrate the atoman switch/);
});

test("/represent prompt activates the Pearl skill gate capsule", () => {
  const statePath = tempStatePath();
  const result = handleUserPromptSubmit(nestedUserPromptSubmitFixture("Use /represent on this adapter architecture"), {
    statePath,
    now: "2026-07-06T00:03:00.000Z",
  });
  assert.deepEqual(result.state.skills.active, ["pearl-representation"]);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /SKILL GATE CAPSULE/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /raw situation, current representation/);
  assert.doesNotMatch(result.outputJson.hookSpecificOutput.additionalContext, /<skill name="pearl-representation"/);
});

test("explicit full skill hydration loads allowlisted skill body", () => {
  const statePath = tempStatePath();
  const skillRoot = tempSkillRoot();
  const result = handleUserPromptSubmit(userPromptSubmitFixture("Hydrate full skill /represent for this architecture task"), {
    statePath,
    skillRoot,
    now: "2026-07-06T00:03:30.000Z",
  });
  assert.deepEqual(result.state.skills.active, ["pearl-representation"]);
  assert.equal(result.state.skills.hydration[0]?.status, "hydrated");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Full hydration loaded for pearl-representation/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /<skill name="pearl-representation"/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Fixture Pearl Representation Skill/);
});

test("unknown full skill hydration fails closed", () => {
  const statePath = tempStatePath();
  const skillRoot = tempSkillRoot();
  const result = handleUserPromptSubmit(userPromptSubmitFixture("Hydrate full skill unknown-skill"), {
    statePath,
    skillRoot,
    now: "2026-07-06T00:03:45.000Z",
  });
  assert.equal(result.state.skills.active[0], "unknown-skill");
  assert.equal(result.state.skills.hydration[0]?.status, "blocked");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Full hydration blocked for unknown-skill/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /not allowlisted/);
});

test("source-dependent prompt emits missing-source grounding capsule", () => {
  const statePath = tempStatePath();
  const result = handleUserPromptSubmit(userPromptSubmitFixture("Thoughts on the current browser page?"), {
    statePath,
    now: "2026-07-06T00:04:00.000Z",
  });
  assert.equal(result.state.sourceGrounding.required, true);
  assert.equal(result.state.sourceGrounding.mode, "missing-source");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /SOURCE GROUNDING CAPSULE/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /do not give a source-grounded answer from metadata alone/i);
});

test("read source payload allows repo-source grounding", () => {
  const statePath = tempStatePath();
  const result = handleUserPromptSubmit(
    userPromptSubmitWithSourcesFixture("Review this repo file source", [
      {
        id: "file-1",
        kind: "file",
        label: "README",
        location: "/tmp/README.md",
        status: "read",
      },
    ]),
    { statePath, now: "2026-07-06T00:05:00.000Z" },
  );
  assert.equal(result.state.sourceGrounding.mode, "repo-source");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /README \(file, read\): \/tmp\/README.md/);
});

test("prompt file paths become active files and metadata-only source pointers", () => {
  const statePath = tempStatePath();
  const result = handleUserPromptSubmit(userPromptSubmitFixture("Review source file /Users/lesz/project/src/index.ts"), {
    statePath,
    now: "2026-07-06T00:06:00.000Z",
  });
  assert.equal(result.state.workingState.activeFiles[0]?.path, "/Users/lesz/project/src/index.ts");
  assert.equal(result.state.sourceGrounding.sources[0]?.status, "metadata-only");
  assert.equal(result.state.sourceGrounding.mode, "missing-source");
});

test("artifact prompt creates pending review artifact and capsule", () => {
  const statePath = tempStatePath();
  const result = handleUserPromptSubmit(userPromptSubmitFixture("Review this implementation plan /tmp/IMPLEMENTATION_PLAN.md"), {
    statePath,
    now: "2026-07-06T00:07:00.000Z",
  });
  assert.equal(result.state.artifacts.pendingReview[0]?.path, "/tmp/IMPLEMENTATION_PLAN.md");
  assert.equal(result.state.artifacts.pendingReview[0]?.type, "plan");
  assert.equal(result.state.artifacts.pendingReview[0]?.approvalState, "required");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /ARTIFACT REVIEW CAPSULE/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Action gate:/);
  assert.deepEqual(result.state.workingState.verification.required, ["Run local tests after code changes.", "Confirm artifact path and approval state before action."]);
});

test("artifact payload preserves explicit artifact path", () => {
  const statePath = tempStatePath();
  const result = handleUserPromptSubmit(
    userPromptSubmitWithArtifactsFixture("Evaluate this diff artifact", [
      {
        id: "diff-1",
        type: "diff",
        path: "/tmp/changes.diff",
      },
    ]),
    { statePath, now: "2026-07-06T00:08:00.000Z" },
  );
  assert.equal(result.state.artifacts.pendingReview[0]?.id, "diff-1");
  assert.equal(result.state.artifacts.pendingReview[0]?.path, "/tmp/changes.diff");
  assert.equal(result.state.artifacts.pendingReview[0]?.approvalState, "required");
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /diff-1 \(diff, required\): \/tmp\/changes.diff/);
});

test("token-economics prompt emits estimates without savings claims", () => {
  const statePath = tempStatePath();
  const result = handleUserPromptSubmit(userPromptSubmitFixture("Show token overhead and honest numbers for this capsule"), {
    statePath,
    now: "2026-07-06T00:09:00.000Z",
  });
  assert.ok(result.state.lastCapsuleClasses.includes("token-economics"));
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /TOKEN ECONOMICS CAPSULE/);
  assert.match(result.outputJson.hookSpecificOutput.additionalContext, /Savings claim: none/);
  assert.doesNotMatch(result.outputJson.hookSpecificOutput.additionalContext, /saves \d+%/i);

  const ledger = readFileSync(join(dirname(statePath), "session-ledger.jsonl"), "utf8").trim().split("\n");
  const last = JSON.parse(ledger.at(-1) ?? "{}") as { details?: { capsuleMetrics?: { estimatesOnly?: boolean; claimedSavings?: boolean } } };
  assert.equal(last.details?.capsuleMetrics?.estimatesOnly, true);
  assert.equal(last.details?.capsuleMetrics?.claimedSavings, false);
});

test("everyday English plan/why/file words do not trigger surprise gates", () => {
  const statePath = tempStatePath();
  const planResult = handleUserPromptSubmit(userPromptSubmitFixture("let me plan the day"), { statePath, now: "2026-07-06T00:09:30.000Z" });
  assert.equal(planResult.state.session.phase, "planning");
  assert.deepEqual(planResult.state.artifacts.pendingReview, []);
  assert.deepEqual(planResult.state.workingState.verification.required, []);

  const whyResult = handleUserPromptSubmit(userPromptSubmitFixture("why does this fail?"), { statePath, now: "2026-07-06T00:09:40.000Z" });
  assert.equal(whyResult.state.companion.orientation, "atoman");

  const fileResult = handleUserPromptSubmit(userPromptSubmitFixture("this file thing feels weird"), { statePath, now: "2026-07-06T00:09:50.000Z" });
  assert.equal(fileResult.state.sourceGrounding.required, false);
});

test("turn router persists JSON state", () => {
  const statePath = tempStatePath();
  handleUserPromptSubmit(userPromptSubmitFixture("Atoman mode"), { statePath, now: "2026-07-06T00:10:00.000Z" });
  const state = JSON.parse(readFileSync(statePath, "utf8")) as { companion?: { orientation?: string } };
  assert.equal(state.companion?.orientation, "atoman");
});
