import { openObligations, verificationCategory, verificationCommandCategory, type VerificationCategory } from "../capsules/verification-gate-capsule.js";
import { appendLedgerEvent, resolveDefaultLedgerPath } from "../state/ledger.js";
import { resolveDefaultStatePath, updateTwinAdapterState } from "../state/safe-state-store.js";
import type { TwinAdapterState } from "../state/schema.js";

export type ToolResponseVerdict = "pass" | "fail" | "unknown";

export interface BashToolObservation {
  readonly command: string;
  readonly response: unknown;
}

export interface VerificationInstrumentOptions {
  readonly statePath?: string;
  readonly now?: string;
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

function matchingOpenObligations(state: TwinAdapterState, categories: ReadonlySet<VerificationCategory>): readonly string[] {
  return openObligations(state).filter((obligation) => {
    const category = verificationCategory(obligation);
    return category !== null && categories.has(category);
  });
}

export function handleBashVerificationBatch(
  observations: readonly BashToolObservation[],
  options: VerificationInstrumentOptions = {},
): VerificationInstrumentResult {
  const statePath = options.statePath ?? resolveDefaultStatePath();
  const now = options.now ?? new Date().toISOString();
  const ledgerPath = resolveDefaultLedgerPath(statePath);
  const passedByCategory = new Map<VerificationCategory, readonly string[]>();
  let caughtErrors = 0;
  let observedVerificationCommands = 0;

  for (const observation of observations) {
    const category = verificationCommandCategory(observation.command);
    if (!category) continue;
    observedVerificationCommands += 1;
    const verdict = classifyToolResponse(observation.response);
    if (verdict === "fail") {
      caughtErrors += 1;
      appendLedgerEvent(
        { type: "verification_caught_error", at: now, details: { category, command: observation.command } },
        ledgerPath,
      );
      continue;
    }
    if (verdict !== "pass") continue;
    passedByCategory.set(category, [...(passedByCategory.get(category) ?? []), observation.command]);
  }

  if (passedByCategory.size === 0) {
    return { state: null, warnings: [], closed: [], caughtErrors, observedVerificationCommands };
  }

  let closed: readonly string[] = [];
  const categories = new Set(passedByCategory.keys());
  const updated = updateTwinAdapterState((state) => {
    closed = matchingOpenObligations(state, categories);
    if (closed.length === 0) return state;
    return {
      ...state,
      updatedAt: now,
      workingState: {
        ...state.workingState,
        verification: {
          required: state.workingState.verification.required,
          completed: [...state.workingState.verification.completed, ...closed],
        },
      },
    };
  }, statePath);

  if (closed.length > 0) {
    for (const [category, commands] of passedByCategory) {
      const categoryClosed = closed.filter((obligation) => verificationCategory(obligation) === category);
      if (categoryClosed.length === 0) continue;
      appendLedgerEvent(
        { type: "verification_obligation_closed", at: now, details: { category, commands, closed: categoryClosed } },
        ledgerPath,
      );
    }
  }

  return { state: updated.state, warnings: updated.warnings, closed, caughtErrors, observedVerificationCommands };
}
