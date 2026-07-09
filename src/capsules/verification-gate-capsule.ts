import type { TwinAdapterState, VerificationCategory } from "../state/schema.js";

export type { VerificationCategory };

export const VERIFICATION_GATE_CAPSULE_CLASS = "verification-gate";

const CATEGORY_PATTERNS: ReadonlyArray<readonly [VerificationCategory, readonly RegExp[]]> = [
  ["test", [/\btests?\b/i, /\bvitest\b/i, /\bjest\b/i, /node --test/i]],
  ["lint", [/\blint\b/i, /\bbiome\b/i, /\beslint\b/i]],
  ["type", [/\btsc\b/i, /\btype-?check\b/i]],
  ["build", [/\bbuild\b/i]],
  ["source", [/\bsource\b/i, /\bgrounded claims?\b/i]],
  ["artifact", [/\bartifact\b/i, /\bapproval\b/i]],
];

const TEST_RUNNERS = new Set(["test", "t", "vitest", "jest"]);
const LINT_RUNNERS = new Set(["lint", "eslint", "biome"]);
const TYPE_RUNNERS = new Set(["typecheck", "type-check", "types", "tsc"]);
const BUILD_RUNNERS = new Set(["build"]);
const PACKAGE_RUNNERS = new Set(["npm", "yarn", "pnpm", "bun"]);
const ENV_ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

function stripShellQuotes(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function tokenizeCommand(segment: string): readonly string[] {
  const matches = segment.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
  return matches.map(stripShellQuotes);
}

function commandSegments(command: string): readonly string[] {
  return command
    .split(/\s*(?:&&|\|\||;)\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function categoryFromRunnerName(value: string | undefined): VerificationCategory | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (TEST_RUNNERS.has(normalized) || normalized.includes("test")) return "test";
  if (LINT_RUNNERS.has(normalized) || normalized.includes("lint")) return "lint";
  if (TYPE_RUNNERS.has(normalized) || normalized.includes("typecheck") || normalized.includes("type-check")) return "type";
  if (BUILD_RUNNERS.has(normalized)) return "build";
  return null;
}

function categoryFromTokens(tokens: readonly string[]): VerificationCategory | null {
  let index = 0;
  while (ENV_ASSIGNMENT.test(tokens[index] ?? "")) index += 1;
  const runner = tokens[index]?.toLowerCase();
  if (!runner) return null;

  if (PACKAGE_RUNNERS.has(runner)) {
    const firstArg = tokens[index + 1]?.toLowerCase();
    if (!firstArg) return null;
    if (firstArg === "run" || firstArg === "run-script" || firstArg === "exec" || firstArg === "x") {
      return categoryFromRunnerName(tokens[index + 2]);
    }
    return categoryFromRunnerName(firstArg);
  }

  if (runner === "npx") return categoryFromRunnerName(tokens[index + 1]);
  if (runner === "make") return categoryFromRunnerName(tokens[index + 1]);
  if (runner === "cargo") return categoryFromRunnerName(tokens[index + 1]);
  if (runner === "go") return categoryFromRunnerName(tokens[index + 1]);
  if (runner === "node" && tokens[index + 1] === "--test") return "test";
  return categoryFromRunnerName(runner);
}

/** Pure: category tag for an obligation text; intentionally broad because human obligations are prose. */
export function verificationCategory(text: string): VerificationCategory | null {
  for (const [category, patterns] of CATEGORY_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) return category;
  }
  return null;
}

/** Pure: category tag for an executed shell command; intentionally narrow to avoid false closes. */
export function verificationCommandCategory(command: string): VerificationCategory | null {
  for (const segment of commandSegments(command)) {
    const category = categoryFromTokens(tokenizeCommand(segment));
    if (category) return category;
  }
  return null;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Pure: returns the list of blocking obligations not yet satisfied. */
export function openObligations(state: TwinAdapterState): readonly string[] {
  const obligations = state.workingState.verification.obligations;
  if (obligations.length > 0) {
    return obligations
      .filter((obligation) => obligation.closurePolicy === "block_stop" && (obligation.status === "open" || obligation.status === "stale"))
      .map((obligation) => obligation.reason);
  }

  const done = new Set(state.workingState.verification.completed.map(normalize));
  return state.workingState.verification.required.filter((required) => !done.has(normalize(required)));
}

/** Pure: should the Stop gate block this turn's closure? */
export function shouldBlockClose(state: TwinAdapterState): boolean {
  return openObligations(state).length > 0;
}

/** Human-readable reason handed back to Claude on block. */
export function renderVerificationBlockReason(state: TwinAdapterState): string {
  const open = openObligations(state);
  return [
    "Twin-Sparrow verification gate: this turn cannot close — proof obligations are unmet.",
    "Unverified:",
    ...open.map((obligation) => `- ${obligation}`),
    "Resolve each by running the relevant check (test/lint/typecheck/build) and confirming it passes,",
    "or explicitly downgrade the obligation if it no longer applies, then finish.",
  ].join("\n");
}
