import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { ALLOWLISTED_SKILLS } from "../../src/skills/skill-registry.js";

const PLUGIN_EXCLUDED_SKILLS = new Set(["masa-dual-core-personas"]);
const RESERVED_COMMAND_NAMES = new Set(["solaris", "atoman", "twin-status"]);
const COMMAND_PREFIX = "twin-sparrow-";

function expectedPublicSkills(): readonly string[] {
  return ALLOWLISTED_SKILLS.filter((name) => !PLUGIN_EXCLUDED_SKILLS.has(name));
}

function commandNameFor(skillName: string): string {
  return skillName.startsWith(COMMAND_PREFIX) ? skillName : `${COMMAND_PREFIX}${skillName}`;
}

test("generated plugin surface has no drift against skill-registry.ts", () => {
  // Uses the already-built dist/ output (npm test runs build first), so this
  // exercises the same generator path used to produce the committed files.
  execFileSync(process.execPath, ["scripts/generate-skill-plugin.mjs", "--check"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
});

test("every allowlisted public skill has a generated SKILL.md and command wrapper", () => {
  const publicSkills = expectedPublicSkills();
  assert.ok(publicSkills.length > 0);

  for (const name of publicSkills) {
    const commandName = commandNameFor(name);
    const skillPath = `skills/${name}/SKILL.md`;
    const commandPath = `commands/${commandName}.md`;

    assert.ok(existsSync(skillPath), `missing ${skillPath}`);
    assert.ok(existsSync(commandPath), `missing ${commandPath}`);

    const skillContent = readFileSync(skillPath, "utf8");
    assert.match(skillContent, /^---\n/, `${skillPath} should start with YAML frontmatter`);
    assert.match(skillContent, new RegExp(`name:\\s*${name}\\b`), `${skillPath} frontmatter name should match ${name}`);

    const commandContent = readFileSync(commandPath, "utf8");
    assert.match(commandContent, /^---\ndescription:/, `${commandPath} should start with YAML frontmatter description`);
    assert.match(commandContent, new RegExp(`# /${commandName}\\b`), `${commandPath} heading should be /${commandName}`);
    assert.match(commandContent, new RegExp(`skills/${name}/SKILL\\.md`), `${commandPath} should reference skills/${name}/SKILL.md`);
  }
});

test("masa-dual-core-personas is allowlisted internally but excluded from the public plugin surface", () => {
  assert.ok(ALLOWLISTED_SKILLS.includes("masa-dual-core-personas"), "expected internal allowlist to still include masa-dual-core-personas");
  assert.equal(existsSync("skills/masa-dual-core-personas"), false);
  assert.equal(existsSync(`commands/${commandNameFor("masa-dual-core-personas")}.md`), false);
});

test("generated skill directories exactly match the current public allowlist (no stale entries)", () => {
  const expected = new Set(expectedPublicSkills());
  const actual = readdirSync("skills", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const name of actual) {
    assert.ok(expected.has(name), `unexpected generated skill directory not in current allowlist: skills/${name}`);
  }
  for (const name of expected) {
    assert.ok(actual.includes(name), `expected generated skill directory missing: skills/${name}`);
  }
});

test("generated command names never collide with reserved native commands", () => {
  for (const name of expectedPublicSkills()) {
    const commandName = commandNameFor(name);
    assert.equal(RESERVED_COMMAND_NAMES.has(commandName), false, `generated command "${commandName}" collides with a reserved command name`);
  }
});
