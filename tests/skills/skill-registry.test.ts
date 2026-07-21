import { existsSync, mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
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
    "deep-audit",
    "deep-structure-learning",
    "design-engineer",
    "expert-engineer",
    "expert-review",
    "first-principles-thinking",
    "grounded-collaboration",
    "grounded-writing",
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
    "web-design",
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

// Existence is not loadability: the suite asserted every allowlisted skill's
// file was present while `hydrateSkillBody` refused 19 of them, because the
// skill root links out to the authoring repo. Assert the outcome callers
// actually depend on.
test("every allowlisted skill hydrates from the default root", () => {
  const blockedSkills = ALLOWLISTED_SKILLS.map((name) => hydrateSkillBody(name)).filter(
    (record) => record.status !== "hydrated",
  );

  assert.deepEqual(
    blockedSkills.map((record) => `${record.name}: ${record.reason}`),
    [],
  );
});

test("a symlinked skill directory hydrates", () => {
  const root = tempSkillRoot();
  const authored = mkdtempSync(join(tmpdir(), "twin-skill-authored-"));
  const authoredSkill = join(authored, "web-design");
  mkdirSync(authoredSkill, { recursive: true });
  writeFileSync(join(authoredSkill, "SKILL.md"), "# Web Design\n\nAuthored elsewhere, linked in.");
  symlinkSync(authoredSkill, join(root, "web-design"));

  const result = hydrateSkillBody("web-design", { skillRoot: root });

  assert.equal(result.status, "hydrated");
  assert.match(result.content ?? "", /Authored elsewhere, linked in/);
});

test("a symlinked skill file is still refused", () => {
  const root = tempSkillRoot();
  const elsewhere = mkdtempSync(join(tmpdir(), "twin-skill-elsewhere-"));
  const secret = join(elsewhere, "SKILL.md");
  writeFileSync(secret, "# Not a skill\n\nRedirected body.");
  const skillDir = join(root, "web-design");
  mkdirSync(skillDir, { recursive: true });
  symlinkSync(secret, join(skillDir, "SKILL.md"));

  const result = hydrateSkillBody("web-design", { skillRoot: root });

  assert.equal(result.status, "blocked");
  assert.match(result.reason ?? "", /refusing symlink skill file/);
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
