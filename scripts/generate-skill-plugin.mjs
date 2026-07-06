#!/usr/bin/env node
// Generates the native Claude plugin surface (skills/<name>/SKILL.md and
// commands/<name>.md) from the single source of truth in
// src/skills/skill-registry.ts (compiled to dist/src/skills/skill-registry.js).
//
// Why this exists: Claude Code's MCP connector (claude-skills) can *search*
// skill files, but the Plugins panel / Slash-command picker only discovers
// skills through this repo's own .claude-plugin layout:
//   skills/<name>/SKILL.md   -> counted in Plugins > Skills
//   commands/<name>.md       -> shown in the Slash-command picker
//
// Run: node scripts/generate-skill-plugin.mjs [--check]
//   (no flag) writes/updates skills/ and commands/
//   --check   verifies committed output matches what would be generated,
//             exits 1 on drift without writing anything

import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const SKILLS_OUT_DIR = join(REPO_ROOT, "skills");
const COMMANDS_OUT_DIR = join(REPO_ROOT, "commands");

// Skills intentionally excluded from the native Claude plugin surface.
// These remain available through the adapter's internal hydration allowlist
// (src/skills/skill-registry.ts) but are not exposed as public slash
// commands or plugin skills.
const PLUGIN_EXCLUDED_SKILLS = new Set(["masa-dual-core-personas"]);

// Native command files already owned by this repo (not skill-generated).
const RESERVED_COMMAND_NAMES = new Set(["solaris", "atoman", "twin-status"]);

async function loadRegistry() {
  const distPath = join(REPO_ROOT, "dist", "src", "skills", "skill-registry.js");
  if (!existsSync(distPath)) {
    console.error(`[generate-skill-plugin] missing build output: ${distPath}`);
    console.error(`[generate-skill-plugin] run "npm run build" first.`);
    process.exit(1);
  }
  return import(distPath);
}

function resolveSkillSourceRoot() {
  return process.env.TWIN_SPARROW_SKILL_ROOT ?? join(homedir(), ".twin-sparrow", "agent", "skills");
}

function readResolvedSkillMarkdown(root, name) {
  const resolvedRoot = resolve(root);
  const candidate = resolve(resolvedRoot, name, "SKILL.md");
  if (!candidate.startsWith(`${resolvedRoot}/`)) {
    throw new Error(`skill path escaped root for ${name}: ${candidate}`);
  }
  if (!existsSync(candidate)) {
    throw new Error(`missing SKILL.md for allowlisted skill ${name}: ${candidate}`);
  }
  // Resolve symlinks (many local skills are symlinked into a sibling repo)
  // so the plugin surface contains real, portable file content rather than
  // a dangling link that would break once copied/packaged.
  const real = realpathSync(candidate);
  const stat = lstatSync(real);
  if (!stat.isFile()) {
    throw new Error(`resolved skill path is not a regular file for ${name}: ${real}`);
  }
  return readFileSync(real, "utf8");
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { name: null, description: null };
  const block = match[1];
  const nameMatch = block.match(/^name:\s*(.+)$/m);
  const name = nameMatch ? nameMatch[1].trim() : null;

  const descIndex = block.indexOf("description:");
  if (descIndex === -1) return { name, description: null };

  const after = block.slice(descIndex + "description:".length);
  const lines = after.split("\n");
  const firstLine = (lines[0] ?? "").trim();

  let description;
  if (firstLine === ">" || firstLine === "|" || firstLine === "") {
    const collected = [];
    for (let i = 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (line === undefined) break;
      if (line.startsWith(" ") || line.trim() === "") {
        collected.push(line.trim());
      } else {
        break;
      }
    }
    description = collected.join(" ").replace(/\s+/g, " ").trim();
  } else {
    description = firstLine.replace(/^["']|["']$/g, "");
  }
  return { name, description: description || null };
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function yamlQuote(text) {
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildCommandMarkdown(name, description) {
  const shortDescription = truncate(description ?? `Apply the ${name} skill.`, 200);
  return `---
description: ${yamlQuote(shortDescription)}
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /${name}

Apply the **${name}** skill from the Twin-Sparrow skill registry.

## Usage

\`\`\`
/${name} $ARGUMENTS
\`\`\`

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply ${name} to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: \`skills/${name}/SKILL.md\`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
`;
}

function computePlan(allowlistedSkills) {
  const skillRoot = resolveSkillSourceRoot();
  const publicSkills = allowlistedSkills.filter((name) => !PLUGIN_EXCLUDED_SKILLS.has(name));

  return publicSkills.map((name) => {
    if (RESERVED_COMMAND_NAMES.has(name)) {
      throw new Error(`skill name "${name}" collides with a reserved native command name`);
    }
    const content = readResolvedSkillMarkdown(skillRoot, name);
    const { description } = parseFrontmatter(content);
    if (!description) {
      throw new Error(`could not extract a description for skill ${name}; refusing to generate an empty command`);
    }
    return {
      name,
      skillMarkdownPath: join(SKILLS_OUT_DIR, name, "SKILL.md"),
      skillMarkdownContent: content,
      commandMarkdownPath: join(COMMANDS_OUT_DIR, `${name}.md`),
      commandMarkdownContent: buildCommandMarkdown(name, description),
    };
  });
}

function readDirNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function runCheck(plan) {
  const problems = [];

  for (const item of plan) {
    if (!existsSync(item.skillMarkdownPath)) {
      problems.push(`missing generated skill file: skills/${item.name}/SKILL.md`);
    } else if (readFileSync(item.skillMarkdownPath, "utf8") !== item.skillMarkdownContent) {
      problems.push(`out of date skill file (source changed): skills/${item.name}/SKILL.md`);
    }

    if (!existsSync(item.commandMarkdownPath)) {
      problems.push(`missing generated command file: commands/${item.name}.md`);
    } else if (readFileSync(item.commandMarkdownPath, "utf8") !== item.commandMarkdownContent) {
      problems.push(`out of date command file: commands/${item.name}.md`);
    }
  }

  const expectedSkillNames = new Set(plan.map((item) => item.name));
  for (const entry of readDirNames(SKILLS_OUT_DIR)) {
    if (!expectedSkillNames.has(entry)) {
      problems.push(`stale generated skill directory not in current allowlist: skills/${entry}`);
    }
  }

  if (problems.length > 0) {
    console.error("[generate-skill-plugin] drift detected between skill-registry.ts and the generated plugin surface:");
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error('[generate-skill-plugin] run "node scripts/generate-skill-plugin.mjs" to regenerate.');
    process.exit(1);
  }

  console.log(`[generate-skill-plugin] OK: ${plan.length} public skill(s) match the generated plugin surface.`);
}

function runWrite(plan) {
  const expectedSkillNames = new Set(plan.map((item) => item.name));
  for (const entry of readDirNames(SKILLS_OUT_DIR)) {
    if (!expectedSkillNames.has(entry)) {
      rmSync(join(SKILLS_OUT_DIR, entry), { recursive: true, force: true });
      console.log(`[generate-skill-plugin] removed stale skill directory: skills/${entry}`);
    }
  }

  for (const item of plan) {
    mkdirSync(dirname(item.skillMarkdownPath), { recursive: true });
    writeFileSync(item.skillMarkdownPath, item.skillMarkdownContent, "utf8");

    mkdirSync(dirname(item.commandMarkdownPath), { recursive: true });
    writeFileSync(item.commandMarkdownPath, item.commandMarkdownContent, "utf8");
  }

  console.log(`[generate-skill-plugin] wrote ${plan.length} skill(s) to skills/ and commands/.`);
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");

  const registry = await loadRegistry();
  const allowlistedSkills = registry.ALLOWLISTED_SKILLS;
  if (!Array.isArray(allowlistedSkills)) {
    console.error("[generate-skill-plugin] ALLOWLISTED_SKILLS export not found or not an array in skill-registry.js");
    process.exit(1);
  }

  const plan = computePlan(allowlistedSkills);

  if (checkOnly) {
    runCheck(plan);
  } else {
    runWrite(plan);
  }
}

main().catch((error) => {
  console.error(`[generate-skill-plugin] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
