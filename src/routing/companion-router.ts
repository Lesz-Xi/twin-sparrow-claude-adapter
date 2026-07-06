import type { CompanionCertainty, CompanionOrientation, TwinAdapterState } from "../state/schema.js";

export type CompanionRoutingSignal =
  | "explicit_override"
  | "distress"
  | "urgency"
  | "acknowledgment_continuity"
  | "closure_continuity"
  | "continuation"
  | "new_arc"
  | "scored"
  | "default";

export interface CompanionRoutingDecision {
  readonly orientation: CompanionOrientation;
  readonly certainty: CompanionCertainty;
  readonly signal: CompanionRoutingSignal;
  readonly preservedContinuity: boolean;
}

const ACKNOWLEDGMENTS = new Set([
  "continue",
  "cool",
  "got it",
  "great",
  "nice",
  "ok",
  "okay",
  "perfect",
  "proceed",
  "sounds good",
  "sure",
  "thank you",
  "thanks",
  "yes",
  "yep",
]);

const DISTRESS = [/\boverwhelm(?:ed|ing)?\b/i, /\bdistress(?:ed)?\b/i, /\banxious\b/i, /\bflood(?:ed|ing)?\b/i, /\bspiral(?:ing)?\b/i];
const URGENCY = [/\burgent\b/i, /\basap\b/i, /\bright now\b/i, /\bimmediately\b/i, /\bship it\b/i, /\bdo it now\b/i];
const SOLARIS = [/\bexplor(?:e|ing|ation)\b/i, /\bmeaning\b/i, /\bphilosoph(?:y|ical)\b/i, /\breflect(?:ion|ive)?\b/i, /\bunderstand\b/i, /\bwhy\b/i];
const ATOMAN = [/\bimplement(?:ation|ing)?\b/i, /\bdebug(?:ging)?\b/i, /\bfix(?:ing|ed)?\b/i, /\bverify\b/i, /\btest(?:ing)?\b/i, /\bexecute\b/i, /\bconcrete\b/i];
const NEW_ARC = [/\bnew (?:task|question|issue|topic|arc)\b/i, /\bsomething else\b/i, /\bswitch(?:ing)? gears\b/i, /\bunrelated\b/i];
const CLOSURE = [/\bwe(?:'re| are) done\b/i, /\bdone for now\b/i, /\bwrap(?:ped)? up\b/i, /\bclose this\b/i, /\bwait for my next instruction\b/i];

function hasAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function count(text: string, patterns: readonly RegExp[]): number {
  return patterns.reduce((score, pattern) => score + (pattern.test(text) ? 1 : 0), 0);
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[.!?,]/g, " ").replace(/\s+/g, " ").trim();
}

function explicitOverride(text: string): CompanionOrientation | null {
  if (/\bsolaris\s+mode\b|\bsola\s+mode\b/i.test(text)) return "solaris";
  if (/\batoman\s+mode\b|\bato\s+mode\b/i.test(text)) return "atoman";
  return null;
}

export function routeCompanion(promptText: string, current: CompanionOrientation = "atoman"): CompanionRoutingDecision {
  const override = explicitOverride(promptText);
  if (override) {
    return { orientation: override, certainty: "high", signal: "explicit_override", preservedContinuity: false };
  }

  const normalized = normalize(promptText);
  if (ACKNOWLEDGMENTS.has(normalized)) {
    return { orientation: current, certainty: "high", signal: "acknowledgment_continuity", preservedContinuity: true };
  }

  if (hasAny(promptText, CLOSURE)) {
    return { orientation: current, certainty: "high", signal: "closure_continuity", preservedContinuity: true };
  }

  if (hasAny(promptText, DISTRESS)) {
    return { orientation: "solaris", certainty: "high", signal: "distress", preservedContinuity: false };
  }

  if (hasAny(promptText, URGENCY)) {
    return { orientation: "atoman", certainty: "high", signal: "urgency", preservedContinuity: false };
  }

  if (!hasAny(promptText, NEW_ARC) && normalized.startsWith("continue")) {
    return { orientation: current, certainty: "high", signal: "continuation", preservedContinuity: true };
  }

  const solarisScore = count(promptText, SOLARIS);
  const atomanScore = count(promptText, ATOMAN);
  if (solarisScore > atomanScore) {
    return { orientation: "solaris", certainty: solarisScore - atomanScore > 1 ? "high" : "medium", signal: "scored", preservedContinuity: false };
  }
  if (atomanScore > solarisScore) {
    return { orientation: "atoman", certainty: atomanScore - solarisScore > 1 ? "high" : "medium", signal: "scored", preservedContinuity: false };
  }

  return { orientation: current, certainty: "medium", signal: hasAny(promptText, NEW_ARC) ? "new_arc" : "default", preservedContinuity: true };
}

function buildCheckIn(orientation: CompanionRoutingDecision["orientation"], consecutiveTurns: number): TwinAdapterState["companion"]["checkIn"] {
  if (orientation === "atoman" && consecutiveTurns >= 10) {
    return {
      required: true,
      reason: "atoman_streak",
      message: "Pace check: 10+ Atoman turns. Ask whether to soften the edge before continuing.",
    };
  }
  if (orientation === "solaris" && consecutiveTurns >= 10) {
    return {
      required: true,
      reason: "solaris_stalled",
      message: "Progress check: 10+ Solaris turns. Ask whether to cut a concrete path now.",
    };
  }
  return { required: false, reason: "none", message: "" };
}

export function applyCompanionDecision(state: TwinAdapterState, decision: CompanionRoutingDecision, now: string): TwinAdapterState {
  const consecutiveTurns = decision.orientation === state.companion.orientation ? state.companion.consecutiveTurns + 1 : 1;
  return {
    ...state,
    updatedAt: now,
    companion: {
      orientation: decision.orientation,
      certainty: decision.certainty,
      signal: decision.signal,
      preservedContinuity: decision.preservedContinuity,
      turnCount: state.companion.turnCount + 1,
      consecutiveTurns,
      checkIn: buildCheckIn(decision.orientation, consecutiveTurns),
    },
  };
}
