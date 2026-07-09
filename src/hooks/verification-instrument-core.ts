import { openObligations, verificationCategory, verificationCommandCategory } from "../capsules/verification-gate-capsule.js";
import type { HostId } from "../host/host-port.js";
import { appendLedgerEvent, resolveDefaultLedgerPath } from "../state/ledger.js";
import { resolveDefaultStatePath, updateTwinAdapterState } from "../state/safe-state-store.js";
import type { TwinAdapterState, VerificationCategory, VerificationEvidence, VerificationEvidenceHost, VerificationObligation, VerificationVerdict } from "../state/schema.js";

export type ToolResponseVerdict = VerificationVerdict;

export interface ToolObservation {
  readonly toolName?: string;
  readonly command?: string;
  readonly response: unknown;
}

export interface BashToolObservation extends ToolObservation {
  readonly command: string;
}

export interface VerificationInstrumentOptions {
  readonly statePath?: string;
  readonly now?: string;
  readonly hostId?: HostId;
}

export interface VerificationInstrumentResult {
  readonly state: TwinAdapterState | null;
  readonly warnings: readonly string[];
  readonly closed: readonly string[];
  readonly caughtErrors: number;
  readonly observedVerificationCommands: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasFailureSignal(text: string): boolean {
  return (
    /^\s*Error\b/im.test(text) ||
    /exit code [1-9]\d*/i.test(text) ||
    /^\s*(FAIL|FAILED|ERROR)\b/im.test(text) ||
    /\b[1-9]\d*\s+(failed|failing|failures?)\b/i.test(text) ||
    /\b(failed|failing)\s+[1-9]\d*\b/i.test(text)
  );
}

function hasPassSignal(text: string, category: VerificationCategory): boolean {
  switch (category) {
    case "test":
      return /^\s*PASS\b/im.test(text) || /\ball tests passed\b/i.test(text) || /\btests?\s+passed\b/i.test(text) || /\b0\s+failed\b/i.test(text);
    case "lint":
      return /\blint\s+(clean|passed|ok)\b/i.test(text) || /\b0\s+(errors?|warnings?)\b/i.test(text) || /\bno\s+lint\s+errors?\b/i.test(text);
    case "type":
      return /\bfound\s+0\s+errors?\b/i.test(text) || /\btype-?check\s+(passed|ok)\b/i.test(text) || /\btsc\s+(passed|ok)\b/i.test(text);
    case "build":
      return /\bbuild\s+(passed|complete|completed|succeeded|success(?:ful)?)\b/i.test(text) || /\bcompiled\s+successfully\b/i.test(text);
    case "source":
    case "artifact":
      return false;
  }
}

function compactIdPart(value: string): string {
  const compact = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return compact ? compact.slice(0, 48) : "evidence";
}

function rawShape(response: unknown): string {
  if (typeof response === "string") return "string";
  if (!isRecord(response)) return "unknown";
  if (response.type === "text" && typeof response.text === "string") return "documented-text";
  if (typeof response.stdout === "string") return "legacy-object";
  if (typeof response.exitCode === "number" || typeof response.exit_code === "number") return "exit-code-object";
  if (response.success === true) return "success-object";
  if (response.is_error === true || typeof response.error === "string") return "error-object";
  return "object";
}

function responseSummary(response: unknown): string {
  let text = "";
  if (typeof response === "string") text = response;
  if (isRecord(response)) {
    if (typeof response.text === "string") text = response.text;
    else if (typeof response.stdout === "string") text = `${response.stdout}\n${typeof response.stderr === "string" ? response.stderr : ""}`;
    else if (typeof response.error === "string") text = response.error;
    else if (typeof response.exitCode === "number") text = `exitCode=${response.exitCode}`;
    else if (typeof response.exit_code === "number") text = `exit_code=${response.exit_code}`;
    else if (response.success === true) text = "success=true";
  }
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact) return rawShape(response);
  return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
}

/**
 * Verdict from Claude Code Bash hook responses.
 *
 * Documented hook shape is `{ type: "text", text: "..." }`.
 * Older transcript-derived fixtures used `{ stdout, stderr, interrupted }` or a failure string.
 * Keep the legacy path for regression coverage, but treat ambiguous values as unknown.
 */
export function classifyToolResponse(response: unknown): ToolResponseVerdict {
  if (typeof response === "string") {
    if (hasFailureSignal(response)) return "fail";
    return "unknown";
  }
  if (!isRecord(response)) return "unknown";

  const exitCode = response.exitCode ?? response.exit_code;
  if (typeof exitCode === "number") return exitCode === 0 ? "pass" : "fail";
  if (response.is_error === true || response.interrupted === true || typeof response.error === "string") return "fail";
  if (response.success === true) return "pass";

  if (response.type === "text" && typeof response.text === "string") {
    return hasFailureSignal(response.text) ? "fail" : "pass";
  }

  if (typeof response.stdout === "string" && response.interrupted === false && !("error" in response) && !("is_error" in response)) {
    const stderr = typeof response.stderr === "string" ? response.stderr : "";
    return hasFailureSignal(`${response.stdout}\n${stderr}`) ? "fail" : "pass";
  }

  return "unknown";
}

export function classifyToolResponseForCategory(response: unknown, category: VerificationCategory): ToolResponseVerdict {
  const verdict = classifyToolResponse(response);
  if (verdict !== "unknown" || typeof response !== "string") return verdict;
  if (hasFailureSignal(response)) return "fail";
  return hasPassSignal(response, category) ? "pass" : "unknown";
}

function makeEvidence(input: {
  readonly category: VerificationCategory;
  readonly verdict: VerificationVerdict;
  readonly command: string;
  readonly response: unknown;
  readonly host: VerificationEvidenceHost;
  readonly now: string;
  readonly mutationSeq: number;
  readonly index: number;
}): VerificationEvidence {
  return {
    id: `ev-${Date.parse(input.now) || 0}-${input.index + 1}-${input.category}-${compactIdPart(input.command)}`,
    category: input.category,
    verdict: input.verdict,
    command: input.command,
    host: input.host,
    observedAt: input.now,
    observedAtMutationSeq: input.mutationSeq,
    rawShape: rawShape(input.response),
    summary: responseSummary(input.response),
  };
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

const CODE_VERIFICATION_CATEGORIES = new Set<VerificationCategory>(["test", "lint", "type", "build"]);
const MUTATION_TOOL_NAMES = new Set(["Edit", "MultiEdit", "Write", "NotebookEdit"]);

function isBashObservation(observation: ToolObservation): observation is BashToolObservation {
  return (!observation.toolName || observation.toolName === "Bash") && typeof observation.command === "string";
}

function isMutatingBashCommand(command: string): boolean {
  return (
    /\bapply_patch\b/.test(command) ||
    /(^|\s)(cat|printf|echo)\b[\s\S]*\s>\s*[^&|;]/.test(command) ||
    /\b(sed\s+-i|perl\s+-pi)\b/.test(command) ||
    /\b(rm|mv|cp|touch|mkdir)\b\s+/.test(command) ||
    /\b(npm|pnpm|yarn|bun)\s+(install|add|remove|update)\b/.test(command) ||
    /\b(npm|pnpm|yarn|bun)\s+run\s+[^\s]*(generate|codegen|write|sync)[^\s]*/.test(command)
  );
}

function observationVerdict(observation: ToolObservation): VerificationVerdict {
  return classifyToolResponse(observation.response);
}

function isMutationObservation(observation: ToolObservation): boolean {
  const verdict = observationVerdict(observation);
  if (verdict === "fail") return false;
  if (observation.toolName && MUTATION_TOOL_NAMES.has(observation.toolName)) return true;
  return isBashObservation(observation) && isMutatingBashCommand(observation.command);
}

function markClosedCodeObligationsStale(obligations: readonly VerificationObligation[]): readonly VerificationObligation[] {
  return obligations.map((obligation) => {
    if (obligation.status !== "closed" || !CODE_VERIFICATION_CATEGORIES.has(obligation.category)) return obligation;
    return { ...obligation, status: "stale" as const };
  });
}

function closeMatchingObligations(input: {
  readonly obligations: readonly VerificationObligation[];
  readonly category: VerificationCategory;
  readonly evidenceId: string;
}): { readonly obligations: readonly VerificationObligation[]; readonly closed: readonly string[] } {
  const closed: string[] = [];
  const obligations = input.obligations.map((obligation) => {
    if (obligation.category !== input.category || obligation.closurePolicy !== "block_stop" || (obligation.status !== "open" && obligation.status !== "stale")) {
      return obligation;
    }
    closed.push(obligation.reason);
    return { ...obligation, status: "closed" as const, closedByEvidenceId: input.evidenceId };
  });
  return { obligations, closed };
}

function mirrorRequired(obligations: readonly VerificationObligation[], fallback: readonly string[]): readonly string[] {
  return obligations.length > 0 ? obligations.map((obligation) => obligation.reason) : fallback;
}

function mirrorCompleted(obligations: readonly VerificationObligation[]): readonly string[] {
  return obligations.filter((obligation) => obligation.status === "closed").map((obligation) => obligation.reason);
}

export function handleBashVerificationBatch(
  observations: readonly ToolObservation[],
  options: VerificationInstrumentOptions = {},
): VerificationInstrumentResult {
  const statePath = options.statePath ?? resolveDefaultStatePath();
  const now = options.now ?? new Date().toISOString();
  const host: VerificationEvidenceHost = options.hostId ?? "claude";
  const ledgerPath = resolveDefaultLedgerPath(statePath);
  const closureEvents = new Map<VerificationCategory, { commands: string[]; closed: string[]; evidenceId: string }>();
  let caughtErrors = 0;
  let observedVerificationCommands = 0;
  let evidenceIndex = 0;
  let mutationObserved = false;

  for (const observation of observations) {
    if (isMutationObservation(observation)) mutationObserved = true;
    if (!isBashObservation(observation)) continue;
    const category = verificationCommandCategory(observation.command);
    if (!category) continue;
    observedVerificationCommands += 1;
    const verdict = classifyToolResponseForCategory(observation.response, category);
    if (verdict === "fail") {
      caughtErrors += 1;
      const evidenceId = `ev-${Date.parse(now) || 0}-${evidenceIndex + 1}-${category}-${compactIdPart(observation.command)}`;
      appendLedgerEvent(
        { type: "verification_caught_error", at: now, details: { category, command: observation.command, evidenceId } },
        ledgerPath,
      );
    }
    evidenceIndex += 1;
  }

  if (!mutationObserved && observedVerificationCommands === 0) {
    return { state: null, warnings: [], closed: [], caughtErrors, observedVerificationCommands };
  }

  let allClosed: readonly string[] = [];
  let staleReasons: readonly string[] = [];
  const updated = updateTwinAdapterState((state) => {
    let mutationSeq = state.workingState.verification.mutationSeq;
    let obligations = state.workingState.verification.obligations;
    const evidence: VerificationEvidence[] = [];
    const closed: string[] = [];
    let index = 0;

    for (const observation of observations) {
      if (isMutationObservation(observation)) {
        mutationSeq += 1;
        const before = obligations;
        obligations = markClosedCodeObligationsStale(obligations);
        staleReasons = uniqueStrings([
          ...staleReasons,
          ...obligations.flatMap((obligation, obligationIndex) => (before[obligationIndex]?.status === "closed" && obligation.status === "stale" ? [obligation.reason] : [])),
        ]);
      }

      if (!isBashObservation(observation)) continue;
      const category = verificationCommandCategory(observation.command);
      if (!category) continue;
      const verdict = classifyToolResponseForCategory(observation.response, category);
      const observedEvidence = makeEvidence({
        category,
        verdict,
        command: observation.command,
        response: observation.response,
        host,
        now,
        mutationSeq,
        index,
      });
      evidence.push(observedEvidence);
      index += 1;

      if (verdict !== "pass") continue;
      const result = closeMatchingObligations({ obligations, category, evidenceId: observedEvidence.id });
      obligations = result.obligations;
      if (result.closed.length === 0) continue;
      closed.push(...result.closed);
      const existing = closureEvents.get(category);
      closureEvents.set(category, {
        commands: [...(existing?.commands ?? []), observation.command],
        closed: [...(existing?.closed ?? []), ...result.closed],
        evidenceId: existing?.evidenceId ?? observedEvidence.id,
      });
    }

    allClosed = uniqueStrings(closed);

    return {
      ...state,
      updatedAt: now,
      workingState: {
        ...state.workingState,
        verification: {
          ...state.workingState.verification,
          required: mirrorRequired(obligations, state.workingState.verification.required),
          completed: mirrorCompleted(obligations),
          mutationSeq,
          obligations,
          evidence: [...state.workingState.verification.evidence, ...evidence],
        },
      },
    };
  }, statePath);

  for (const [category, event] of closureEvents) {
    appendLedgerEvent(
      { type: "verification_obligation_closed", at: now, details: { category, commands: uniqueStrings(event.commands), closed: uniqueStrings(event.closed), evidenceId: event.evidenceId } },
      ledgerPath,
    );
  }

  if (staleReasons.length > 0) {
    appendLedgerEvent(
      { type: "verification_obligation_stale", at: now, details: { stale: staleReasons, mutationSeq: updated.state.workingState.verification.mutationSeq } },
      ledgerPath,
    );
  }

  return { state: updated.state, warnings: updated.warnings, closed: allClosed, caughtErrors, observedVerificationCommands };
}
