import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { handleBashVerificationBatch, classifyToolResponse, type BashToolObservation } from "./verification-instrument-core.js";
import type { TwinAdapterState } from "../state/schema.js";

export { classifyToolResponse };

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function observationFromInput(hookInput: PostToolUseInput): BashToolObservation | null {
  if (hookInput.tool_name !== "Bash") return null;
  const command = hookInput.tool_input?.command;
  if (!command) return null;
  return { command, response: hookInput.tool_response };
}

function outputJsonForClosed(closed: readonly string[]): Record<string, unknown> {
  if (closed.length === 0) return {};
  return {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: `Twin-Sparrow verification receipt: closed ${closed.length} obligation(s): ${closed.join("; ")}`,
    },
  };
}

export function handlePostToolUse(rawInput: string, options: PostToolUseOptions = {}): PostToolUseResult {
  const observation = observationFromInput(parseInput(rawInput));
  if (!observation) {
    return { outputJson: {}, state: null, warnings: [] };
  }

  const result = handleBashVerificationBatch([observation], options);
  return {
    outputJson: outputJsonForClosed(result.closed),
    state: result.state,
    warnings: result.warnings,
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
  const result = handlePostToolUse(raw);
  if (result.warnings.length > 0) {
    process.stderr.write(`${result.warnings.join("\n")}\n`);
  }
  process.stdout.write(`${JSON.stringify(result.outputJson)}\n`);
}
