export type CompanionOrientation = "solaris" | "atoman" | "blended";
export type CompanionCertainty = "low" | "medium" | "high";
export type TaskArcPhase = "exploring" | "planning" | "implementing" | "verifying" | "closing";
export type SourceGroundingMode = "none" | "metadata-only" | "repo-source" | "browser-source" | "missing-source";
export type SourceStatus = "metadata-only" | "read" | "retrieved" | "failed" | "missing-required";
export type ArtifactType = "plan" | "spec" | "diff" | "review" | "report" | "raw_output" | "unknown";
export type ApprovalState = "not_required" | "required" | "approved" | "approved_with_notes" | "rejected" | "blocked";
export type SkillHydrationStatus = "hydrated" | "blocked";
export type CompanionCheckInReason = "none" | "atoman_streak" | "solaris_stalled";

export interface CompanionCheckInState {
  readonly required: boolean;
  readonly reason: CompanionCheckInReason;
  readonly message: string;
}

export interface SkillHydrationState {
  readonly name: string;
  readonly mode: "full";
  readonly status: SkillHydrationStatus;
  readonly path?: string;
  readonly content?: string;
  readonly reason?: string;
}

export interface SourcePointer {
  readonly id: string;
  readonly kind: "file" | "url" | "browser" | "unknown";
  readonly label: string;
  readonly location: string;
  readonly status: SourceStatus;
}

export interface WorkingStateActiveFile {
  readonly path: string;
  readonly status: "reading" | "editing" | "verifying" | "done";
}

export interface WorkingStateVerification {
  readonly required: readonly string[];
  readonly completed: readonly string[];
}

export interface ArtifactPointer {
  readonly id: string;
  readonly type: ArtifactType;
  readonly path: string;
  readonly approvalState: ApprovalState;
}

export interface TwinAdapterState {
  readonly version: 1;
  readonly updatedAt: string;
  readonly session: {
    readonly id: string;
    readonly arcId: string;
    readonly phase: TaskArcPhase;
  };
  readonly companion: {
    readonly orientation: CompanionOrientation;
    readonly certainty: CompanionCertainty;
    readonly signal: string;
    readonly preservedContinuity: boolean;
    readonly turnCount: number;
    readonly consecutiveTurns: number;
    readonly checkIn: CompanionCheckInState;
  };
  readonly skills: {
    readonly active: readonly string[];
    readonly hydration: readonly SkillHydrationState[];
  };
  readonly sourceGrounding: {
    readonly mode: SourceGroundingMode;
    readonly required: boolean;
    readonly sources: readonly SourcePointer[];
  };
  readonly workingState: {
    readonly goal: string;
    readonly taskType: "analysis" | "implementation" | "debug" | "review" | "docs";
    readonly activeFiles: readonly WorkingStateActiveFile[];
    readonly establishedFacts: readonly string[];
    readonly pendingActions: readonly string[];
    readonly verification: WorkingStateVerification;
    readonly nextStep: string;
  };
  readonly artifacts: {
    readonly pendingReview: readonly ArtifactPointer[];
  };
  readonly lastCapsuleClasses: readonly string[];
}

export interface ParseStateResult {
  readonly ok: boolean;
  readonly state: TwinAdapterState;
  readonly warnings: readonly string[];
}

const ORIENTATIONS = new Set<CompanionOrientation>(["solaris", "atoman", "blended"]);
const CERTAINTIES = new Set<CompanionCertainty>(["low", "medium", "high"]);
const PHASES = new Set<TaskArcPhase>(["exploring", "planning", "implementing", "verifying", "closing"]);
const SOURCE_MODES = new Set<SourceGroundingMode>(["none", "metadata-only", "repo-source", "browser-source", "missing-source"]);
const SOURCE_STATUSES = new Set<SourceStatus>(["metadata-only", "read", "retrieved", "failed", "missing-required"]);
const FILE_STATUSES = new Set<WorkingStateActiveFile["status"]>(["reading", "editing", "verifying", "done"]);
const TASK_TYPES = new Set<TwinAdapterState["workingState"]["taskType"]>(["analysis", "implementation", "debug", "review", "docs"]);
const ARTIFACT_TYPES = new Set<ArtifactType>(["plan", "spec", "diff", "review", "report", "raw_output", "unknown"]);
const APPROVAL_STATES = new Set<ApprovalState>(["not_required", "required", "approved", "approved_with_notes", "rejected", "blocked"]);
const SOURCE_KINDS = new Set<SourcePointer["kind"]>(["file", "url", "browser", "unknown"]);
const SKILL_HYDRATION_STATUSES = new Set<SkillHydrationStatus>(["hydrated", "blocked"]);
const COMPANION_CHECK_IN_REASONS = new Set<CompanionCheckInReason>(["none", "atoman_streak", "solaris_stalled"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function enumValue<T extends string>(value: unknown, allowed: ReadonlySet<T>, fallback: T): T {
  return typeof value === "string" && allowed.has(value as T) ? (value as T) : fallback;
}

function stringArray(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function companionCheckIn(value: unknown, fallback: CompanionCheckInState): CompanionCheckInState {
  if (!isRecord(value)) return fallback;
  return {
    required: booleanValue(value.required, fallback.required),
    reason: enumValue(value.reason, COMPANION_CHECK_IN_REASONS, fallback.reason),
    message: stringValue(value.message, fallback.message),
  };
}

function skillHydrationStates(value: unknown): readonly SkillHydrationState[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): SkillHydrationState[] => {
    if (!isRecord(item) || typeof item.name !== "string") return [];
    const record: SkillHydrationState = {
      name: item.name,
      mode: "full",
      status: enumValue(item.status, SKILL_HYDRATION_STATUSES, "blocked"),
      ...(typeof item.path === "string" ? { path: item.path } : {}),
      ...(typeof item.content === "string" ? { content: item.content } : {}),
      ...(typeof item.reason === "string" ? { reason: item.reason } : {}),
    };
    return [record];
  });
}

function sourcePointers(value: unknown): readonly SourcePointer[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): SourcePointer[] => {
    if (!isRecord(item)) return [];
    const id = item.id;
    const label = item.label;
    const location = item.location;
    if (typeof id !== "string" || typeof label !== "string" || typeof location !== "string") return [];
    return [
      {
        id,
        kind: enumValue(item.kind, SOURCE_KINDS, "unknown"),
        label,
        location,
        status: enumValue(item.status, SOURCE_STATUSES, "metadata-only"),
      },
    ];
  });
}

function activeFiles(value: unknown): readonly WorkingStateActiveFile[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): WorkingStateActiveFile[] => {
    if (!isRecord(item) || typeof item.path !== "string") return [];
    return [
      {
        path: item.path,
        status: enumValue(item.status, FILE_STATUSES, "reading"),
      },
    ];
  });
}

function verification(value: unknown, fallback: WorkingStateVerification): WorkingStateVerification {
  if (!isRecord(value)) return fallback;
  return {
    required: stringArray(value.required),
    completed: stringArray(value.completed),
  };
}

function artifactPointers(value: unknown): readonly ArtifactPointer[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ArtifactPointer[] => {
    if (!isRecord(item)) return [];
    const id = item.id;
    const path = item.path;
    if (typeof id !== "string" || typeof path !== "string") return [];
    return [
      {
        id,
        type: enumValue(item.type, ARTIFACT_TYPES, "unknown"),
        path,
        approvalState: enumValue(item.approvalState, APPROVAL_STATES, "required"),
      },
    ];
  });
}

export function createDefaultState(input: { readonly now?: string; readonly sessionId?: string } = {}): TwinAdapterState {
  const now = input.now ?? new Date().toISOString();
  const sessionId = input.sessionId ?? "local-claude-session";
  return {
    version: 1,
    updatedAt: now,
    session: {
      id: sessionId,
      arcId: "initial-arc",
      phase: "planning",
    },
    companion: {
      orientation: "atoman",
      certainty: "medium",
      signal: "default",
      preservedContinuity: false,
      turnCount: 0,
      consecutiveTurns: 0,
      checkIn: {
        required: false,
        reason: "none",
        message: "",
      },
    },
    skills: {
      active: [],
      hydration: [],
    },
    sourceGrounding: {
      mode: "none",
      required: false,
      sources: [],
    },
    workingState: {
      goal: "Use Twin-Sparrow inside Claude with compact runtime capsules.",
      taskType: "implementation",
      activeFiles: [],
      establishedFacts: [],
      pendingActions: ["Build the minimal Claude adapter skeleton."],
      verification: {
        required: [],
        completed: [],
      },
      nextStep: "Build the minimal Claude adapter skeleton.",
    },
    artifacts: {
      pendingReview: [],
    },
    lastCapsuleClasses: [],
  };
}

export function parseTwinAdapterState(value: unknown, fallback: TwinAdapterState = createDefaultState()): ParseStateResult {
  const warnings: string[] = [];
  if (!isRecord(value)) {
    return { ok: false, state: fallback, warnings: ["state was not a JSON object"] };
  }

  if (value.version !== 1) {
    warnings.push("state version was missing or unsupported; preserving compatible fields only");
  }

  const session = isRecord(value.session) ? value.session : {};
  const companion = isRecord(value.companion) ? value.companion : {};
  const skills = isRecord(value.skills) ? value.skills : {};
  const sourceGrounding = isRecord(value.sourceGrounding) ? value.sourceGrounding : {};
  const workingState = isRecord(value.workingState) ? value.workingState : {};
  const artifacts = isRecord(value.artifacts) ? value.artifacts : {};

  return {
    ok: warnings.length === 0,
    warnings,
    state: {
      version: 1,
      updatedAt: stringValue(value.updatedAt, fallback.updatedAt),
      session: {
        id: stringValue(session.id, fallback.session.id),
        arcId: stringValue(session.arcId, fallback.session.arcId),
        phase: enumValue(session.phase, PHASES, fallback.session.phase),
      },
      companion: {
        orientation: enumValue(companion.orientation, ORIENTATIONS, fallback.companion.orientation),
        certainty: enumValue(companion.certainty, CERTAINTIES, fallback.companion.certainty),
        signal: stringValue(companion.signal, fallback.companion.signal),
        preservedContinuity: booleanValue(companion.preservedContinuity, fallback.companion.preservedContinuity),
        turnCount: numberValue(companion.turnCount, fallback.companion.turnCount),
        consecutiveTurns: numberValue(companion.consecutiveTurns, fallback.companion.consecutiveTurns),
        checkIn: companionCheckIn(companion.checkIn, fallback.companion.checkIn),
      },
      skills: {
        active: stringArray(skills.active),
        hydration: skillHydrationStates(skills.hydration),
      },
      sourceGrounding: {
        mode: enumValue(sourceGrounding.mode, SOURCE_MODES, fallback.sourceGrounding.mode),
        required: booleanValue(sourceGrounding.required, fallback.sourceGrounding.required),
        sources: sourcePointers(sourceGrounding.sources),
      },
      workingState: {
        goal: stringValue(workingState.goal, fallback.workingState.goal),
        taskType: enumValue(workingState.taskType, TASK_TYPES, fallback.workingState.taskType),
        activeFiles: activeFiles(workingState.activeFiles),
        establishedFacts: stringArray(workingState.establishedFacts),
        pendingActions: stringArray(workingState.pendingActions),
        verification: verification(workingState.verification, fallback.workingState.verification),
        nextStep: stringValue(workingState.nextStep, fallback.workingState.nextStep),
      },
      artifacts: {
        pendingReview: artifactPointers(artifacts.pendingReview),
      },
      lastCapsuleClasses: stringArray(value.lastCapsuleClasses),
    },
  };
}
