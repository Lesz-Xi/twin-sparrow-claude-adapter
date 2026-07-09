import type { TwinAdapterState, WorkingStateActiveFile } from "../state/schema.js";
import { formatVerificationSummary } from "../state/verification-format.js";

export const WORKING_STATE_CAPSULE_CLASS = "working-state";

function formatList(label: string, items: readonly string[]): string[] {
  if (items.length === 0) return [`${label}: none`];
  return [`${label}:`, ...items.map((item) => `- ${item}`)];
}

function formatActiveFiles(files: readonly WorkingStateActiveFile[]): string[] {
  if (files.length === 0) return ["Active files: none"];
  return ["Active files:", ...files.map((file) => `- ${file.path} [${file.status}]`)];
}

export function renderWorkingStateCapsule(state: TwinAdapterState): string {
  return [
    "━━━ TWIN-SPARROW WORKING STATE CAPSULE ━━━",
    `Goal: ${state.workingState.goal}`,
    `Task type: ${state.workingState.taskType}`,
    ...formatActiveFiles(state.workingState.activeFiles),
    ...formatList("Established facts", state.workingState.establishedFacts),
    ...formatList("Pending actions", state.workingState.pendingActions),
    ...formatVerificationSummary(state.workingState.verification),
    `Next step: ${state.workingState.nextStep}`,
    `Source grounding: ${state.sourceGrounding.mode}${state.sourceGrounding.required ? " / required" : ""}`,
    `Pending artifact reviews: ${state.artifacts.pendingReview.length}`,
    "━━━ END TWIN-SPARROW WORKING STATE CAPSULE ━━━",
  ].join("\n");
}
