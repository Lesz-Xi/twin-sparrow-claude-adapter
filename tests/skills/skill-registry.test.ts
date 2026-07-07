import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { ALLOWLISTED_SKILLS, hydrateSkillBody, resolveDefaultSkillRoot } from "../../src/skills/skill-registry.js";

function tempSkillRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "twin-skill-registry-"));
  const skillDir = join(root, "youtube-transcript");
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, "SKILL.md"), "# YouTube Transcript\n\nFixture skill body.");
  return root;
}

test("allowlisted skills include the Twin-Sparrow local skill inventory", () => {
  const expected = [
    "architect-review",
    "code-quality-skill",
    "create-paper",
    "crucible-doctrine",
    "deep-audit",
    "deep-structure-learning",
    "design-engineer",
    "expert-engineer",
    "expert-review",
    "first-principles-thinking",
    "japanese-design",
    "lifetime-research",
    "literature-arxiv",
    "masa-dual-core-personas",
    "oppus-reasoning-contract",
    "pearl-representation",
    "product-design",
    "rigorous-audit",
    "sequential-thinking",
    "theory-creation",
    "think-different",
    "twin-sparrow-apps",
    "twin-sparrow-computer-use",
    "twin-sparrow-taste",
    "work-backward",
    "youtube-transcript",
  ];

  assert.deepEqual([...ALLOWLISTED_SKILLS], expected);
});

test("default skill root contains every allowlisted skill file", () => {
  const root = resolveDefaultSkillRoot();
  const missing = ALLOWLISTED_SKILLS.filter((name) => !existsSync(join(root, name, "SKILL.md")));

  assert.deepEqual(missing, []);
});

test("newly allowlisted Twin skills can hydrate from an explicit root", () => {
  const root = tempSkillRoot();
  const result = hydrateSkillBody("youtube-transcript", { skillRoot: root });

  assert.equal(result.status, "hydrated");
  assert.equal(result.name, "youtube-transcript");
  assert.match(result.content ?? "", /Fixture skill body/);
});

test("unknown skill names still fail closed", () => {
  const root = tempSkillRoot();
  const result = hydrateSkillBody("not-a-real-skill", { skillRoot: root });

  assert.equal(result.status, "blocked");
  assert.match(result.reason ?? "", /not allowlisted/);
});
