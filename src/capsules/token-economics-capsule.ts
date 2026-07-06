import type { CapsuleMetrics } from "../metrics/token-estimator.js";

export const TOKEN_ECONOMICS_CAPSULE_CLASS = "token-economics";

export function renderTokenEconomicsCapsule(metrics: CapsuleMetrics): string {
  return [
    "━━━ TWIN-SPARROW TOKEN ECONOMICS CAPSULE ━━━",
    `Capsule characters: ${metrics.characterCount}`,
    `Estimated tokens: ${metrics.estimatedTokens}`,
    `Estimate method: ${metrics.estimateMethod}`,
    "Savings claim: none. These are local estimates only, not measured Claude billing or context-usage numbers.",
    "Honesty rule: do not claim token savings until measured against a full-prompt baseline.",
    "━━━ END TWIN-SPARROW TOKEN ECONOMICS CAPSULE ━━━",
  ].join("\n");
}
