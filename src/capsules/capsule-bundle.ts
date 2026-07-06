import { renderArtifactCapsule } from "./artifact-capsule.js";
import { renderCompanionCapsule } from "./companion-capsule.js";
import { renderSkillGateCapsule } from "./skill-gate-capsule.js";
import { renderSourceGroundingCapsule } from "./source-grounding-capsule.js";
import { renderTinyTwinContract } from "./tiny-twin-contract.js";
import { renderTokenEconomicsCapsule, TOKEN_ECONOMICS_CAPSULE_CLASS } from "./token-economics-capsule.js";
import { renderWorkingStateCapsule } from "./working-state-capsule.js";
import { measureCapsuleText, type CapsuleMetrics } from "../metrics/token-estimator.js";
import type { TwinAdapterState } from "../state/schema.js";

export interface CapsuleBundle {
  readonly classes: readonly string[];
  readonly additionalContext: string;
  readonly metrics: CapsuleMetrics;
}

export function renderCapsuleBundle(state: TwinAdapterState): CapsuleBundle {
  const baseSections = [
    renderCompanionCapsule(state),
    renderWorkingStateCapsule(state),
    renderSourceGroundingCapsule(state),
    renderArtifactCapsule(state),
    renderSkillGateCapsule(state.skills.active, state.skills.hydration),
  ].filter((section) => section.trim().length > 0);
  const baseContext = baseSections.join("\n\n");
  const baseMetrics = measureCapsuleText(baseContext);
  const sections = state.lastCapsuleClasses.includes(TOKEN_ECONOMICS_CAPSULE_CLASS)
    ? [...baseSections, renderTokenEconomicsCapsule(baseMetrics)]
    : baseSections;
  const additionalContext = sections.join("\n\n");
  return {
    classes: state.lastCapsuleClasses,
    additionalContext,
    metrics: measureCapsuleText(additionalContext),
  };
}

export function renderSessionStartBundle(): CapsuleBundle {
  const additionalContext = renderTinyTwinContract();
  return {
    classes: ["tiny-twin-contract"],
    additionalContext,
    metrics: measureCapsuleText(additionalContext),
  };
}
