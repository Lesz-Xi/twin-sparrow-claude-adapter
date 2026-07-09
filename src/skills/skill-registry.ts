import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

export const MAX_SKILL_BODY_BYTES = 128 * 1024;

export const ALLOWLISTED_SKILLS = [
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
] as const;

export type AllowlistedSkillName = (typeof ALLOWLISTED_SKILLS)[number];
export type SkillHydrationMode = "full";
export type SkillHydrationStatus = "hydrated" | "blocked";

export interface SkillHydrationRecord {
  readonly name: string;
  readonly mode: SkillHydrationMode;
  readonly status: SkillHydrationStatus;
  readonly path?: string;
  readonly content?: string;
  readonly reason?: string;
}

export interface SkillHydrationOptions {
  readonly skillRoot?: string;
  readonly env?: NodeJS.ProcessEnv;
}

const ALLOWLIST = new Set<string>(ALLOWLISTED_SKILLS);

export function resolveDefaultSkillRoot(env: NodeJS.ProcessEnv = process.env): string {
  return env.TWIN_SPARROW_SKILL_ROOT ?? join(homedir(), ".twin-sparrow", "agent", "skills");
}

export function isAllowlistedSkillName(name: string): name is AllowlistedSkillName {
  return ALLOWLIST.has(name);
}

function isSafeSkillName(name: string): boolean {
  return /^[a-z0-9-]+$/.test(name) && !name.startsWith("-") && !name.endsWith("-") && !name.includes("--");
}

function blocked(name: string, reason: string): SkillHydrationRecord {
  return { name, mode: "full", status: "blocked", reason };
}

export function hydrateSkillBody(name: string, options: SkillHydrationOptions = {}): SkillHydrationRecord {
  if (!isSafeSkillName(name)) {
    return blocked(name, "skill name is not a safe lowercase hyphen identifier");
  }
  if (!isAllowlistedSkillName(name)) {
    return blocked(name, "skill is not allowlisted for full hydration");
  }

  const root = resolve(options.skillRoot ?? resolveDefaultSkillRoot(options.env));
  const candidate = resolve(root, name, "SKILL.md");

  if (!candidate.startsWith(`${root}/`)) {
    return blocked(name, "resolved skill path escaped the allowlisted skill root");
  }
  if (!existsSync(candidate)) {
    return blocked(name, `allowlisted skill file is missing: ${candidate}`);
  }

  const linkStat = lstatSync(candidate);
  if (linkStat.isSymbolicLink()) {
    return blocked(name, `refusing symlink skill file: ${candidate}`);
  }
  if (!linkStat.isFile()) {
    return blocked(name, `skill path is not a regular file: ${candidate}`);
  }

  const fileStat = statSync(candidate);
  if (fileStat.size > MAX_SKILL_BODY_BYTES) {
    return blocked(name, `skill file exceeds ${MAX_SKILL_BODY_BYTES} bytes: ${candidate}`);
  }

  const realRoot = realpathSync(root);
  const realCandidate = realpathSync(candidate);
  if (!realCandidate.startsWith(`${realRoot}/`)) {
    return blocked(name, "real skill path escaped the allowlisted skill root");
  }

  return {
    name,
    mode: "full",
    status: "hydrated",
    path: realCandidate,
    content: readFileSync(realCandidate, "utf8"),
  };
}
