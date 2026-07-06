import type { SourcePointer, TwinAdapterState } from "../state/schema.js";

export const SOURCE_GROUNDING_CAPSULE_CLASS = "source-grounding";

function formatSource(source: SourcePointer): string {
  return `- ${source.label} (${source.kind}, ${source.status}): ${source.location}`;
}

export function renderSourceGroundingCapsule(state: TwinAdapterState): string {
  if (!state.sourceGrounding.required && state.sourceGrounding.mode === "none") {
    return "";
  }

  const sources = state.sourceGrounding.sources.length > 0
    ? state.sourceGrounding.sources.map(formatSource)
    : ["- no admitted source body or pointer available"];

  const groundingRule = state.sourceGrounding.mode === "missing-source"
    ? "Grounding rule: do not give a source-grounded answer from metadata alone. State what source text is missing, or clearly label the answer conceptual."
    : "Grounding rule: use only admitted source evidence for source-grounded claims; mark inference separately.";

  return [
    "━━━ TWIN-SPARROW SOURCE GROUNDING CAPSULE ━━━",
    `Mode: ${state.sourceGrounding.mode}`,
    `Required: ${state.sourceGrounding.required ? "yes" : "no"}`,
    "Sources:",
    ...sources,
    groundingRule,
    "━━━ END TWIN-SPARROW SOURCE GROUNDING CAPSULE ━━━",
  ].join("\n");
}
