import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { ARTIFACT_REVIEW_CAPSULE_CLASS } from "../capsules/artifact-capsule.js";
import { renderCapsuleBundle } from "../capsules/capsule-bundle.js";
import { COMPANION_CAPSULE_CLASS } from "../capsules/companion-capsule.js";
import { resolveFullSkillHydrationRequests, resolveSkillGates, SKILL_GATE_CAPSULE_CLASS } from "../capsules/skill-gate-capsule.js";
import { SOURCE_GROUNDING_CAPSULE_CLASS } from "../capsules/source-grounding-capsule.js";
import { TOKEN_ECONOMICS_CAPSULE_CLASS } from "../capsules/token-economics-capsule.js";
import { WORKING_STATE_CAPSULE_CLASS } from "../capsules/working-state-capsule.js";
import { classifyPrompt, requiresSourceGrounding, type PromptClassification } from "../routing/prompt-classifier.js";
import { applyCompanionDecision, routeCompanion } from "../routing/companion-router.js";
import { hydrateSkillBody } from "../skills/skill-registry.js";
import { appendLedgerEvent, resolveDefaultLedgerPath } from "../state/ledger.js";
import { readTwinAdapterState, resolveDefaultStatePath, writeTwinAdapterState } from "../state/safe-state-store.js";
import type { ArtifactPointer, ArtifactType, SourceGroundingMode, SourcePointer, SourceStatus, TwinAdapterState, WorkingStateActiveFile } from "../state/schema.js";

export interface TurnRouterOptions {
  readonly statePath?: string;
  readonly now?: string;
  readonly skillRoot?: string;
}

export interface TurnRouterResult {
  readonly outputJson: {
    readonly hookSpecificOutput: {
      readonly additionalContext: string;
    };
  };
  readonly state: TwinAdapterState;
  readonly warnings: readonly string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nestedString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (typeof value === "string") return value;
  if (isRecord(value)) {
    const text = value.text;
    if (typeof text === "string") return text;
  }
  return null;
}

export function extractPromptText(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (!isRecord(payload)) return "";
  for (const key of ["prompt", "userPrompt", "message", "text", "input"] as const) {
    const value = nestedString(payload, key);
    if (value) return value;
  }
  const hookInput = payload.hookInput;
  if (isRecord(hookInput)) {
    for (const key of ["prompt", "userPrompt", "message", "text", "input"] as const) {
      const value = nestedString(hookInput, key);
      if (value) return value;
    }
  }
  return "";
}

function parsePayload(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return trimmed;
  }
}

function inferTaskType(labels: readonly PromptClassification[]): TwinAdapterState["workingState"]["taskType"] {
  if (labels.includes("implementation")) return "implementation";
  if (labels.includes("artifact-evaluation")) return "review";
  if (labels.includes("architecture") || labels.includes("representation")) return "analysis";
  return "analysis";
}

function inferPhase(labels: readonly PromptClassification[]): TwinAdapterState["session"]["phase"] {
  if (labels.includes("closure")) return "closing";
  if (labels.includes("implementation") || labels.includes("execution")) return "implementing";
  if (labels.includes("artifact-evaluation")) return "verifying";
  if (labels.includes("exploration")) return "exploring";
  return "planning";
}

function unique(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function extractPathCandidates(promptText: string): readonly string[] {
  const matches = promptText.match(/(?:~|\.|\/)?(?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+(?:\.[A-Za-z0-9]+)?/g) ?? [];
  return unique(matches).slice(0, 8);
}

function deriveActiveFiles(promptText: string, labels: readonly PromptClassification[], prior: readonly WorkingStateActiveFile[]): readonly WorkingStateActiveFile[] {
  const status: WorkingStateActiveFile["status"] = labels.includes("implementation") ? "editing" : labels.includes("artifact-evaluation") ? "verifying" : "reading";
  const extracted = extractPathCandidates(promptText).map((path): WorkingStateActiveFile => ({ path, status }));
  const combined = [...extracted, ...prior];
  const byPath = new Map<string, WorkingStateActiveFile>();
  for (const file of combined) {
    if (!byPath.has(file.path)) byPath.set(file.path, file);
  }
  return Array.from(byPath.values()).slice(0, 12);
}

function sourceStatusFromValue(value: unknown): SourceStatus {
  if (value === "read" || value === "retrieved" || value === "failed" || value === "missing-required" || value === "metadata-only") return value;
  return "metadata-only";
}

function sourceKindFromValue(value: unknown): SourcePointer["kind"] {
  if (value === "file" || value === "url" || value === "browser" || value === "unknown") return value;
  return "unknown";
}

function sourcePointersFromPayload(payload: unknown): readonly SourcePointer[] {
  if (!isRecord(payload)) return [];
  const rawSources = payload.sources ?? (isRecord(payload.hookInput) ? payload.hookInput.sources : undefined);
  if (!Array.isArray(rawSources)) return [];
  return rawSources.flatMap((source, index): SourcePointer[] => {
    if (!isRecord(source)) return [];
    const location = typeof source.location === "string" ? source.location : typeof source.path === "string" ? source.path : typeof source.url === "string" ? source.url : "";
    if (!location) return [];
    const label = typeof source.label === "string" ? source.label : location;
    return [
      {
        id: typeof source.id === "string" ? source.id : `source-${index + 1}`,
        kind: sourceKindFromValue(source.kind),
        label,
        location,
        status: sourceStatusFromValue(source.status),
      },
    ];
  });
}

function sourcePointersFromPrompt(promptText: string): readonly SourcePointer[] {
  return extractPathCandidates(promptText).map((path, index): SourcePointer => ({
    id: `prompt-path-${index + 1}`,
    kind: "file",
    label: path,
    location: path,
    status: "metadata-only",
  }));
}

function hasGroundedSource(sources: readonly SourcePointer[]): boolean {
  return sources.some((source) => source.status === "read" || source.status === "retrieved");
}

function inferSourceMode(sourceRequired: boolean, sources: readonly SourcePointer[]): SourceGroundingMode {
  if (!sourceRequired) return "none";
  if (!hasGroundedSource(sources)) return "missing-source";
  if (sources.some((source) => source.kind === "browser")) return "browser-source";
  if (sources.some((source) => source.kind === "file")) return "repo-source";
  return "metadata-only";
}

function inferArtifactType(promptText: string): ArtifactType {
  const text = promptText.toLowerCase();
  if (/\bplan\b/.test(text)) return "plan";
  if (/\bspec\b/.test(text)) return "spec";
  if (/\bdiff\b/.test(text)) return "diff";
  if (/\breview\b/.test(text)) return "review";
  if (/\breport\b/.test(text)) return "report";
  if (/\braw output\b|\btool output\b/.test(text)) return "raw_output";
  return "unknown";
}

function artifactPointersFromPayload(payload: unknown): readonly ArtifactPointer[] {
  if (!isRecord(payload)) return [];
  const rawArtifacts = payload.artifacts ?? (isRecord(payload.hookInput) ? payload.hookInput.artifacts : undefined);
  if (!Array.isArray(rawArtifacts)) return [];
  return rawArtifacts.flatMap((artifact, index): ArtifactPointer[] => {
    if (!isRecord(artifact)) return [];
    const path = typeof artifact.path === "string" ? artifact.path : typeof artifact.location === "string" ? artifact.location : "";
    if (!path) return [];
    return [
      {
        id: typeof artifact.id === "string" ? artifact.id : `artifact-${index + 1}`,
        type: typeof artifact.type === "string" ? inferArtifactType(artifact.type) : "unknown",
        path,
        approvalState: "required",
      },
    ];
  });
}

function artifactPointersFromPrompt(promptText: string, labels: readonly PromptClassification[]): readonly ArtifactPointer[] {
  if (!labels.includes("artifact-evaluation")) return [];
  const paths = extractPathCandidates(promptText);
  if (paths.length > 0) {
    return paths.map((path, index): ArtifactPointer => ({
      id: `prompt-artifact-${index + 1}`,
      type: inferArtifactType(promptText),
      path,
      approvalState: "required",
    }));
  }
  return [
    {
      id: "prompt-artifact-1",
      type: inferArtifactType(promptText),
      path: "inline-prompt-artifact://current-turn",
      approvalState: "required",
    },
  ];
}

function mergeArtifacts(prior: readonly ArtifactPointer[], next: readonly ArtifactPointer[]): readonly ArtifactPointer[] {
  const byPath = new Map<string, ArtifactPointer>();
  for (const artifact of [...next, ...prior]) {
    if (!byPath.has(artifact.path)) byPath.set(artifact.path, artifact);
  }
  return Array.from(byPath.values()).slice(0, 12);
}

function buildEstablishedFacts(labels: readonly PromptClassification[], activeSkills: readonly string[], sourceRequired: boolean, artifactCount: number): readonly string[] {
  const facts: string[] = [];
  if (labels.length > 0) facts.push(`Prompt classifications: ${labels.join(", ")}.`);
  if (activeSkills.length > 0) facts.push(`Active skill gates: ${activeSkills.join(", ")}.`);
  if (sourceRequired) facts.push("This turn requires source-grounding discipline.");
  if (artifactCount > 0) facts.push(`${artifactCount} artifact(s) require review before implementation authority.`);
  return facts;
}

function buildPendingActions(activeSkills: readonly string[], sourceRequired: boolean, artifactCount: number): readonly string[] {
  const actions = [activeSkills.length > 0 ? "Apply active skill gate before answering." : "Answer with compact Twin-Sparrow runtime context."];
  if (sourceRequired) actions.push("Do not answer as source-grounded until admitted source text is available.");
  if (artifactCount > 0) actions.push("Evaluate artifact and require explicit approval before treating it as implementation authority.");
  return actions;
}

function buildVerification(labels: readonly PromptClassification[], sourceRequired: boolean, artifactCount: number): TwinAdapterState["workingState"]["verification"] {
  const required: string[] = [];
  if (labels.includes("implementation")) required.push("Run local tests after code changes.");
  if (sourceRequired) required.push("Verify source text is admitted before grounded claims.");
  if (labels.includes("artifact-evaluation") || artifactCount > 0) required.push("Confirm artifact path and approval state before action.");
  return { required, completed: [] };
}

export function handleUserPromptSubmit(rawPayload: string, options: TurnRouterOptions = {}): TurnRouterResult {
  const statePath = options.statePath ?? resolveDefaultStatePath();
  const now = options.now ?? new Date().toISOString();
  const payload = parsePayload(rawPayload);
  const promptText = extractPromptText(payload);
  const labels = classifyPrompt(promptText);
  const read = readTwinAdapterState(statePath);
  const decision = routeCompanion(promptText, read.state.companion.orientation);
  const fullHydrationRequests = resolveFullSkillHydrationRequests(promptText);
  const hydrationOptions = options.skillRoot ? { skillRoot: options.skillRoot } : {};
  const hydrationRecords = fullHydrationRequests.map((name) => hydrateSkillBody(name, hydrationOptions));
  const activeSkills = unique([...resolveSkillGates(promptText), ...fullHydrationRequests]);
  const sourceRequired = requiresSourceGrounding(labels);
  const sources = sourceRequired ? [...sourcePointersFromPayload(payload), ...sourcePointersFromPrompt(promptText)].slice(0, 8) : [];
  const sourceMode = inferSourceMode(sourceRequired, sources);
  const newArtifacts = [...artifactPointersFromPayload(payload), ...artifactPointersFromPrompt(promptText, labels)];
  const pendingReview = mergeArtifacts(read.state.artifacts.pendingReview, newArtifacts);
  const artifactReviewRequired = pendingReview.length > 0;
  const tokenEconomicsRequested = labels.includes("token-economics");
  const capsuleClasses = [
    COMPANION_CAPSULE_CLASS,
    WORKING_STATE_CAPSULE_CLASS,
    ...(sourceRequired ? [SOURCE_GROUNDING_CAPSULE_CLASS] : []),
    ...(artifactReviewRequired ? [ARTIFACT_REVIEW_CAPSULE_CLASS] : []),
    ...(activeSkills.length > 0 ? [SKILL_GATE_CAPSULE_CLASS] : []),
    ...(tokenEconomicsRequested ? [TOKEN_ECONOMICS_CAPSULE_CLASS] : []),
  ];

  const routed = applyCompanionDecision(read.state, decision, now);
  const updated: TwinAdapterState = {
    ...routed,
    session: {
      ...routed.session,
      phase: inferPhase(labels),
    },
    skills: { active: activeSkills, hydration: hydrationRecords },
    sourceGrounding: {
      mode: sourceMode,
      required: sourceRequired,
      sources,
    },
    workingState: {
      goal: promptText ? promptText.slice(0, 240) : routed.workingState.goal,
      taskType: inferTaskType(labels),
      activeFiles: deriveActiveFiles(promptText, labels, routed.workingState.activeFiles),
      establishedFacts: buildEstablishedFacts(labels, activeSkills, sourceRequired, pendingReview.length),
      pendingActions: buildPendingActions(activeSkills, sourceRequired, pendingReview.length),
      verification: buildVerification(labels, sourceRequired, pendingReview.length),
      nextStep: activeSkills.length > 0 ? "Apply active skill gate with compact capsule." : artifactReviewRequired ? "Evaluate artifact and keep approval gate visible." : sourceRequired ? "Acquire or verify source text before grounded answer." : "Answer with compact Twin-Sparrow runtime context.",
    },
    artifacts: {
      pendingReview,
    },
    lastCapsuleClasses: capsuleClasses,
  };

  const bundle = renderCapsuleBundle(updated);
  writeTwinAdapterState(updated, statePath);
  appendLedgerEvent(
    {
      type: "user_prompt_submit",
      at: now,
      details: {
        labels,
        companion: updated.companion.orientation,
        capsuleClasses: bundle.classes,
        activeSkills,
        skillHydration: hydrationRecords.map((record) => ({ name: record.name, status: record.status, path: record.path, reason: record.reason })),
        sourceRequired,
        sourceMode,
        artifactCount: pendingReview.length,
        capsuleMetrics: bundle.metrics,
      },
    },
    resolveDefaultLedgerPath(statePath),
  );

  return {
    outputJson: {
      hookSpecificOutput: {
        additionalContext: bundle.additionalContext,
      },
    },
    state: updated,
    warnings: read.warnings,
  };
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of input) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function isMainModule(metaUrl: string): boolean {
  return process.argv[1] === fileURLToPath(metaUrl);
}

if (isMainModule(import.meta.url)) {
  const raw = await readStdin();
  const result = handleUserPromptSubmit(raw);
  if (result.warnings.length > 0) {
    process.stderr.write(`${result.warnings.join("\n")}\n`);
  }
  process.stdout.write(`${JSON.stringify(result.outputJson)}\n`);
}
