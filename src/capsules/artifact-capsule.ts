import type { ArtifactPointer, TwinAdapterState } from "../state/schema.js";

export const ARTIFACT_REVIEW_CAPSULE_CLASS = "artifact-review";

function formatArtifact(artifact: ArtifactPointer): string {
  return `- ${artifact.id} (${artifact.type}, ${artifact.approvalState}): ${artifact.path}`;
}

export function renderArtifactCapsule(state: TwinAdapterState): string {
  if (state.artifacts.pendingReview.length === 0) {
    return "";
  }

  return [
    "━━━ TWIN-SPARROW ARTIFACT REVIEW CAPSULE ━━━",
    "Pending review artifacts:",
    ...state.artifacts.pendingReview.map(formatArtifact),
    "Action gate: do not treat plans, specs, diffs, reports, or reviews as approved implementation authority until Chief approval is explicit.",
    "Review rule: evaluate pasted or referenced agent artifacts by default; do not merely mirror them unless Chief asks for rewriting or summarization-only.",
    "━━━ END TWIN-SPARROW ARTIFACT REVIEW CAPSULE ━━━",
  ].join("\n");
}
