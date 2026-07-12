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

import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
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

// Every generated slash command is prefixed with this so both surfaces Claude
// Code auto-registers (bare `/twin-sparrow-foo` and namespaced
// `/twin-sparrow:twin-sparrow-foo`) read as unambiguously ours in the picker —
// no bare `/foo` entries that could collide with other plugins or read as
// unqualified. Skills whose canonical name already starts with the prefix are
// not double-prefixed.
const COMMAND_PREFIX = "twin-sparrow-";

function toCommandName(skillName) {
  return skillName.startsWith(COMMAND_PREFIX) ? skillName : `${COMMAND_PREFIX}${skillName}`;
}

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

// Supporting-content subdirectories that ship alongside a skill's SKILL.md.
// Deliberately narrow: only curated reference material is carried into the
// plugin surface. Build/runtime junk (node_modules, dist, scripts, __pycache__,
// requirements.txt, *.pyc) is never a skill "asset" and stays out.
const SKILL_ASSET_DIRS = ["references"];

// Collect the curated supporting files (references/**) for a skill so the
// generated plugin surface is self-contained. Returns [{ relPath, outPath,
// content }]; dotfiles are skipped. Symlinks are resolved so real, portable
// bytes land in the surface rather than dangling links.
function collectSkillAssets(root, name) {
  const resolvedRoot = resolve(root);
  const skillDir = resolve(resolvedRoot, name);
  if (skillDir !== resolvedRoot && !skillDir.startsWith(`${resolvedRoot}/`)) {
    throw new Error(`skill path escaped root for ${name}: ${skillDir}`);
  }
  if (!existsSync(skillDir)) return [];
  const realSkillDir = realpathSync(skillDir);
  const assets = [];
  const walk = (absDir, relDir) => {
    for (const entry of readdirSync(absDir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue; // skip .DS_Store and other dotfiles
      const abs = join(absDir, entry.name);
      const rel = relDir ? join(relDir, entry.name) : entry.name;
      const stat = statSync(abs); // follows symlinks
      if (stat.isDirectory()) {
        walk(abs, rel);
      } else if (stat.isFile()) {
        assets.push({
          relPath: rel,
          outPath: join(SKILLS_OUT_DIR, name, rel),
          content: readFileSync(realpathSync(abs)),
        });
      }
    }
  };
  for (const assetDir of SKILL_ASSET_DIRS) {
    const abs = join(realSkillDir, assetDir);
    if (existsSync(abs) && statSync(abs).isDirectory()) walk(abs, assetDir);
  }
  return assets;
}

// List every file (relative path) under a generated skill's output directory,
// so runWrite can prune stale references and runCheck can flag extras.
function listFilesRecursive(dir, relBase = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = relBase ? join(relBase, entry.name) : entry.name;
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(join(dir, entry.name), rel));
    } else if (entry.isFile()) {
      out.push(rel);
    }
  }
  return out;
}

// Remove empty subdirectories left behind after pruning stale reference files.
// Never removes the skill root itself, only now-empty descendants.
function pruneEmptyDirs(root) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = join(root, entry.name);
    pruneEmptyDirs(child);
    if (readdirSync(child).length === 0) rmSync(child, { recursive: true, force: true });
  }
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

function buildCommandMarkdown(commandName, skillName, description) {
  const shortDescription = truncate(description ?? `Apply the ${skillName} skill.`, 200);
  return `---
description: ${yamlQuote(shortDescription)}
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /${commandName}

Apply the **${skillName}** skill from the Twin-Sparrow skill registry.

## Usage

\`\`\`
/${commandName} $ARGUMENTS
\`\`\`

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply ${skillName} to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: \`skills/${skillName}/SKILL.md\`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
`;
}

function computePlan(allowlistedSkills) {
  const skillRoot = resolveSkillSourceRoot();
  const publicSkills = allowlistedSkills.filter((name) => !PLUGIN_EXCLUDED_SKILLS.has(name));

  return publicSkills.map((name) => {
    const commandName = toCommandName(name);
    if (RESERVED_COMMAND_NAMES.has(commandName)) {
      throw new Error(`generated command name "${commandName}" collides with a reserved native command name`);
    }
    const content = readResolvedSkillMarkdown(skillRoot, name);
    const { description } = parseFrontmatter(content);
    if (!description) {
      throw new Error(`could not extract a description for skill ${name}; refusing to generate an empty command`);
    }
    return {
      name,
      commandName,
      skillMarkdownPath: join(SKILLS_OUT_DIR, name, "SKILL.md"),
      skillMarkdownContent: content,
      assets: collectSkillAssets(skillRoot, name),
      commandMarkdownPath: join(COMMANDS_OUT_DIR, `${commandName}.md`),
      commandMarkdownContent: buildCommandMarkdown(commandName, name, description),
    };
  });
}

function readDirNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function readFileNames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

function staleCommandFiles(plan) {
  const expected = new Set(plan.map((item) => `${item.commandName}.md`));
  return readFileNames(COMMANDS_OUT_DIR).filter((entry) => {
    if (!entry.endsWith(".md")) return false;
    const base = entry.slice(0, -".md".length);
    if (RESERVED_COMMAND_NAMES.has(base)) return false;
    return !expected.has(entry);
  });
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

    for (const asset of item.assets) {
      if (!existsSync(asset.outPath)) {
        problems.push(`missing generated reference file: skills/${item.name}/${asset.relPath}`);
      } else if (!readFileSync(asset.outPath).equals(asset.content)) {
        problems.push(`out of date reference file (source changed): skills/${item.name}/${asset.relPath}`);
      }
    }

    const expectedAssetPaths = new Set(["SKILL.md", ...item.assets.map((asset) => asset.relPath)]);
    for (const rel of listFilesRecursive(join(SKILLS_OUT_DIR, item.name))) {
      if (!expectedAssetPaths.has(rel)) {
        problems.push(`stale generated reference file not in source: skills/${item.name}/${rel}`);
      }
    }
  }

  const expectedSkillNames = new Set(plan.map((item) => item.name));
  for (const entry of readDirNames(SKILLS_OUT_DIR)) {
    if (!expectedSkillNames.has(entry)) {
      problems.push(`stale generated skill directory not in current allowlist: skills/${entry}`);
    }
  }

  for (const entry of staleCommandFiles(plan)) {
    problems.push(`stale generated command file not in current allowlist: commands/${entry}`);
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

  for (const entry of staleCommandFiles(plan)) {
    rmSync(join(COMMANDS_OUT_DIR, entry), { force: true });
    console.log(`[generate-skill-plugin] removed stale command file: commands/${entry}`);
  }

  let assetCount = 0;
  for (const item of plan) {
    mkdirSync(dirname(item.skillMarkdownPath), { recursive: true });
    writeFileSync(item.skillMarkdownPath, item.skillMarkdownContent, "utf8");

    for (const asset of item.assets) {
      mkdirSync(dirname(asset.outPath), { recursive: true });
      writeFileSync(asset.outPath, asset.content);
      assetCount += 1;
    }

    // Prune reference files that no longer exist in the source skill.
    const outSkillDir = join(SKILLS_OUT_DIR, item.name);
    const expectedAssetPaths = new Set(["SKILL.md", ...item.assets.map((asset) => asset.relPath)]);
    for (const rel of listFilesRecursive(outSkillDir)) {
      if (!expectedAssetPaths.has(rel)) {
        rmSync(join(outSkillDir, rel), { force: true });
        console.log(`[generate-skill-plugin] removed stale reference file: skills/${item.name}/${rel}`);
      }
    }
    pruneEmptyDirs(outSkillDir);

    mkdirSync(dirname(item.commandMarkdownPath), { recursive: true });
    writeFileSync(item.commandMarkdownPath, item.commandMarkdownContent, "utf8");
  }

  console.log(`[generate-skill-plugin] wrote ${plan.length} skill(s) (${assetCount} reference file(s)) to skills/ and commands/.`);
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
