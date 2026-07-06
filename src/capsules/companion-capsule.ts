import type { TwinAdapterState } from "../state/schema.js";

export const COMPANION_CAPSULE_CLASS = "companion-continuity";

export function renderCompanionCapsule(state: TwinAdapterState): string {
  return [
    "━━━ TWIN-SPARROW COMPANION CAPSULE ━━━",
    `Orientation: ${state.companion.orientation}`,
    `Certainty: ${state.companion.certainty}`,
    `Signal: ${state.companion.signal}`,
    `Preserved continuity: ${state.companion.preservedContinuity ? "yes" : "no"}`,
    `Consecutive ${state.companion.orientation} turns: ${state.companion.consecutiveTurns}`,
    `Check-in required: ${state.companion.checkIn.required ? "yes" : "no"}${state.companion.checkIn.required ? ` / ${state.companion.checkIn.reason}: ${state.companion.checkIn.message}` : ""}`,
    `Task arc: ${state.session.arcId} / ${state.session.phase}`,
    "Continuity rule: preserve current companion on acknowledgments, immediate closure, and weak signals; switch only on explicit override, distress, urgency, or clear new arc with different intent.",
    "━━━ END TWIN-SPARROW COMPANION CAPSULE ━━━",
  ].join("\n");
}
