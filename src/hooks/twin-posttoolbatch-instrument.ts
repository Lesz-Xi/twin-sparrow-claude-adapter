import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { resolveHost } from "../host/index.js";
import { handleBashVerificationBatch } from "./verification-instrument-core.js";
import { renderVerificationReceipt } from "./verification-receipt.js";
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

export function handlePostToolBatch(rawInput: string, options: PostToolBatchOptions = {}): PostToolBatchResult {
  const host = resolveHost();
  const observations = host.extractToolObservations(host.parsePayload(rawInput));
  if (observations.length === 0) {
    return { outputJson: {}, state: null, warnings: [] };
  }

  const result = handleBashVerificationBatch(observations, { ...options, hostId: host.id });
  return {
    outputJson: renderVerificationReceipt(host, "PostToolBatch", result.closed),
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
