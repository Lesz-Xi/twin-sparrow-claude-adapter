import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { readTwinAdapterState, resolveDefaultStatePath } from "../state/safe-state-store.js";
import type { TwinAdapterState } from "../state/schema.js";

export interface TwinStatusOptions {
  readonly statePath?: string;
}

export interface TwinStatusResult {
  readonly output: string;
  readonly state: TwinAdapterState;
  readonly warnings: readonly string[];
}

function formatList(values: readonly string[], empty: string): string {
  return values.length > 0 ? values.join(", ") : empty;
}

export function renderTwinStatus(state: TwinAdapterState, warnings: readonly string[] = []): string {
  const activeSkills = formatList(state.skills.active, "none");
  const hydration = state.skills.hydration.map((record) => `${record.name}:${record.status}`);
  const capsuleClasses = formatList(state.lastCapsuleClasses, "none");
  const pendingArtifacts = state.artifacts.pendingReview.length;
  const activeFiles = state.workingState.activeFiles.map((file) => `${file.path} [${file.status}]`);
  const sources = state.sourceGrounding.sources.map((source) => `${source.label} (${source.kind}, ${source.status}): ${source.location}`);

  return [
    "━━━ TWIN-SPARROW STATUS ━━━",
    `Updated: ${state.updatedAt}`,
    `Session: ${state.session.id}`,
    `Arc: ${state.session.arcId}`,
    `Phase: ${state.session.phase}`,
    `Companion: ${state.companion.orientation}`,
    `Companion certainty: ${state.companion.certainty}`,
    `Companion signal: ${state.companion.signal}`,
    `Preserved continuity: ${state.companion.preservedContinuity ? "yes" : "no"}`,
    `Consecutive ${state.companion.orientation} turns: ${state.companion.consecutiveTurns}`,
    `Check-in: ${state.companion.checkIn.required ? `${state.companion.checkIn.reason} — ${state.companion.checkIn.message}` : "none"}`,
    `Goal: ${state.workingState.goal}`,
    `Task type: ${state.workingState.taskType}`,
    `Next step: ${state.workingState.nextStep}`,
    `Active files: ${formatList(activeFiles, "none")}`,
    `Active skills: ${activeSkills}`,
    `Skill hydration: ${formatList(hydration, "none")}`,
    `Source grounding: ${state.sourceGrounding.mode}${state.sourceGrounding.required ? " / required" : " / not required"}`,
    `Sources: ${formatList(sources, "none")}`,
    `Pending artifact reviews: ${pendingArtifacts}`,
    `Last capsule classes: ${capsuleClasses}`,
    `Warnings: ${formatList(warnings, "none")}`,
    "━━━ END TWIN-SPARROW STATUS ━━━",
  ].join("\n");
}

export function handleTwinStatus(options: TwinStatusOptions = {}): TwinStatusResult {
  const statePath = options.statePath ?? resolveDefaultStatePath();
  const read = readTwinAdapterState(statePath);
  return {
    output: renderTwinStatus(read.state, read.warnings),
    state: read.state,
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

function extractStatePath(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) && "statePath" in parsed) {
      const value = (parsed as { readonly statePath?: unknown }).statePath;
      return typeof value === "string" ? value : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function isMainModule(metaUrl: string): boolean {
  return process.argv[1] === fileURLToPath(metaUrl);
}

if (isMainModule(import.meta.url)) {
  const raw = await readStdin();
  const statePath = extractStatePath(raw);
  const result = statePath ? handleTwinStatus({ statePath }) : handleTwinStatus();
  process.stdout.write(`${result.output}\n`);
}
