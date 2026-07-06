import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { openObligations, verificationCategory, type VerificationCategory } from "../capsules/verification-gate-capsule.js";
import { appendLedgerEvent, resolveDefaultLedgerPath } from "../state/ledger.js";
import { resolveDefaultStatePath, updateTwinAdapterState } from "../state/safe-state-store.js";
import type { TwinAdapterState } from "../state/schema.js";

export interface PostToolUseInput {
  readonly tool_name?: string;
  readonly tool_input?: { readonly command?: string };
  readonly tool_response?: unknown;
}

export interface PostToolUseResult {
  readonly outputJson: Record<string, unknown>;
  readonly state: TwinAdapterState | null;
  readonly warnings: readonly string[];
}

export interface PostToolUseOptions {
  readonly statePath?: string;
  readonly now?: string;
}

export type ToolResponseVerdict = "pass" | "fail" | "unknown";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Verdict from observed Claude Code Bash tool responses:
 * success arrives as a record `{stdout, stderr, interrupted, ...}` (no exit code field);
 * failure arrives as a string `"Error: Exit code N\n..."` or a record carrying error markers.
 * Anything ambiguous is "unknown" — a false pass is the expensive failure, so never guess.
 */
export function classifyToolResponse(response: unknown): ToolResponseVerdict {
  if (typeof response === "string") {
    if (/^Error\b/i.test(response.trim()) || /exit code [1-9]\d*/i.test(response)) return "fail";
    return "unknown";
  }
  if (!isRecord(response)) return "unknown";
  const exitCode = response.exitCode ?? response.exit_code;
  if (typeof exitCode === "number") return exitCode === 0 ? "pass" : "fail";
  if (response.is_error === true || response.interrupted === true || typeof response.error === "string") return "fail";
  if (response.success === true) return "pass";
  if (typeof response.stdout === "string" && response.interrupted === false && !("error" in response) && !("is_error" in response)) {
    return "pass";
  }
  return "unknown";
}

function parseInput(raw: string): PostToolUseInput {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!isRecord(parsed)) return {};
    const toolInput = isRecord(parsed.tool_input) ? parsed.tool_input : {};
    return {
      ...(typeof parsed.tool_name === "string" ? { tool_name: parsed.tool_name } : {}),
      tool_input: { ...(typeof toolInput.command === "string" ? { command: toolInput.command } : {}) },
      tool_response: parsed.tool_response,
    };
  } catch {
    return {};
  }
}

function matchingOpenObligations(state: TwinAdapterState, category: VerificationCategory): readonly string[] {
  return openObligations(state).filter((obligation) => verificationCategory(obligation) === category);
}

export function handlePostToolUse(rawInput: string, options: PostToolUseOptions = {}): PostToolUseResult {
  const statePath = options.statePath ?? resolveDefaultStatePath();
  const now = options.now ?? new Date().toISOString();
  const hookInput = parseInput(rawInput);

  if (hookInput.tool_name !== "Bash") {
    return { outputJson: {}, state: null, warnings: [] };
  }
  const command = hookInput.tool_input?.command ?? "";
  const category = verificationCategory(command);
  if (!category) {
    return { outputJson: {}, state: null, warnings: [] };
  }

  const verdict = classifyToolResponse(hookInput.tool_response);
  const ledgerPath = resolveDefaultLedgerPath(statePath);

  if (verdict === "fail") {
    appendLedgerEvent(
      { type: "verification_caught_error", at: now, details: { category, command } },
      ledgerPath,
    );
    return { outputJson: {}, state: null, warnings: [] };
  }
  if (verdict !== "pass") {
    return { outputJson: {}, state: null, warnings: [] };
  }

  // Explicit pass: close only obligations sharing this command's category — never guess wider.
  let closed: readonly string[] = [];
  const updated = updateTwinAdapterState((state) => {
    closed = matchingOpenObligations(state, category);
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
    appendLedgerEvent(
      { type: "verification_obligation_closed", at: now, details: { category, command, closed } },
      ledgerPath,
    );
  }
  return { outputJson: {}, state: updated.state, warnings: updated.warnings };
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
  const result = handlePostToolUse(raw);
  if (result.warnings.length > 0) {
    process.stderr.write(`${result.warnings.join("\n")}\n`);
  }
  process.stdout.write(`${JSON.stringify(result.outputJson)}\n`);
}
