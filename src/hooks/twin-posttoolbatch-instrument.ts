import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { handleBashVerificationBatch, type BashToolObservation } from "./verification-instrument-core.js";
import type { TwinAdapterState } from "../state/schema.js";

export interface PostToolBatchResult {
  readonly outputJson: Record<string, unknown>;
  readonly state: TwinAdapterState | null;
  readonly warnings: readonly string[];
}

export interface PostToolBatchOptions {
  readonly statePath?: string;
  readonly now?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return null;
}

function recordField(record: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> | null {
  for (const key of keys) {
    const value = record[key];
    if (isRecord(value)) return value;
  }
  return null;
}

function valueField(record: Record<string, unknown>, keys: readonly string[]): unknown {
  for (const key of keys) {
    if (key in record) return record[key];
  }
  return undefined;
}

function observationFromRecord(record: Record<string, unknown>): BashToolObservation | null {
  const toolName = stringField(record, ["tool_name", "toolName", "name"]);
  if (toolName !== "Bash") return null;

  const inputRecord = recordField(record, ["tool_input", "toolInput", "input"]);
  const command = inputRecord ? stringField(inputRecord, ["command"]) : null;
  if (!command) return null;

  return {
    command,
    response: valueField(record, ["tool_response", "toolResponse", "response", "tool_result", "toolResult", "result"]),
  };
}

function collectObservations(value: unknown, depth = 0): readonly BashToolObservation[] {
  if (depth > 8) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectObservations(item, depth + 1));
  }
  if (!isRecord(value)) return [];

  const observation = observationFromRecord(value);
  if (observation) return [observation];

  return Object.values(value).flatMap((item) => collectObservations(item, depth + 1));
}

function parseInput(raw: string): readonly BashToolObservation[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    return collectObservations(JSON.parse(trimmed) as unknown);
  } catch {
    return [];
  }
}

function outputJsonForClosed(closed: readonly string[]): Record<string, unknown> {
  if (closed.length === 0) return {};
  return {
    hookSpecificOutput: {
      hookEventName: "PostToolBatch",
      additionalContext: `Twin-Sparrow verification receipt: closed ${closed.length} obligation(s): ${closed.join("; ")}`,
    },
  };
}

export function handlePostToolBatch(rawInput: string, options: PostToolBatchOptions = {}): PostToolBatchResult {
  const observations = parseInput(rawInput);
  if (observations.length === 0) {
    return { outputJson: {}, state: null, warnings: [] };
  }

  const result = handleBashVerificationBatch(observations, options);
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
  const result = handlePostToolBatch(raw);
  if (result.warnings.length > 0) {
    process.stderr.write(`${result.warnings.join("\n")}\n`);
  }
  process.stdout.write(`${JSON.stringify(result.outputJson)}\n`);
}
