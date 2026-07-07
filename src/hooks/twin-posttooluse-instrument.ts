import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { resolveHost } from "../host/index.js";
import { handleBashVerificationBatch, classifyToolResponse } from "./verification-instrument-core.js";
import { renderVerificationReceipt } from "./verification-receipt.js";
import type { TwinAdapterState } from "../state/schema.js";

export { classifyToolResponse };

export interface PostToolUseResult {
  readonly outputJson: Record<string, unknown>;
  readonly state: TwinAdapterState | null;
  readonly warnings: readonly string[];
}

export interface PostToolUseOptions {
  readonly statePath?: string;
  readonly now?: string;
}

export function handlePostToolUse(rawInput: string, options: PostToolUseOptions = {}): PostToolUseResult {
  const host = resolveHost();
  const observations = host.extractBashObservations(host.parsePayload(rawInput));
  if (observations.length === 0) {
    return { outputJson: {}, state: null, warnings: [] };
  }

  const result = handleBashVerificationBatch(observations, options);
  return {
    outputJson: renderVerificationReceipt(host, "PostToolUse", result.closed),
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
