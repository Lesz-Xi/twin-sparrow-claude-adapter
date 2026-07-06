import type { TwinAdapterState } from "../state/schema.js";

export const VERIFICATION_GATE_CAPSULE_CLASS = "verification-gate";

export type VerificationCategory = "test" | "lint" | "type" | "build";

const CATEGORY_PATTERNS: ReadonlyArray<readonly [VerificationCategory, readonly RegExp[]]> = [
  ["test", [/\btests?\b/i, /\bvitest\b/i, /\bjest\b/i, /node --test/i]],
  ["lint", [/\blint\b/i, /\bbiome\b/i, /\beslint\b/i]],
  ["type", [/\btsc\b/i, /\btype-?check\b/i]],
  ["build", [/\bbuild\b/i]],
];

/** Pure: category tag for a verification command or obligation text; null when it is not verification-shaped. */
export function verificationCategory(text: string): VerificationCategory | null {
  for (const [category, patterns] of CATEGORY_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) return category;
  }
  return null;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/** Pure: returns the list of required obligations not yet in completed. */
export function openObligations(state: TwinAdapterState): readonly string[] {
  const done = new Set(state.workingState.verification.completed.map(normalize));
  return state.workingState.verification.required.filter((required) => !done.has(normalize(required)));
}

/** Pure: should the Stop gate block this turn's closure? */
export function shouldBlockClose(state: TwinAdapterState): boolean {
  const gating = state.session.phase === "verifying" || state.session.phase === "closing";
  return gating && openObligations(state).length > 0;
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
