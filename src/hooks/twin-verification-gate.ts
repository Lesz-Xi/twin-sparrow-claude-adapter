import { existsSync, readFileSync } from "node:fs";
import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { openObligations, renderVerificationBlockReason, shouldBlockClose } from "../capsules/verification-gate-capsule.js";
import { appendLedgerEvent, resolveDefaultLedgerPath } from "../state/ledger.js";
import { readTwinAdapterState, resolveDefaultStatePath } from "../state/safe-state-store.js";

export interface StopHookInput {
  readonly stop_hook_active?: boolean;
  readonly session_id?: string;
}

export interface StopResult {
  readonly outputJson: Record<string, unknown>;
  readonly warnings: readonly string[];
}

export interface StopHookOptions {
  readonly statePath?: string;
  readonly now?: string;
}

export const MAX_BLOCKS_PER_ARC = 2;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeParse(raw: string): StopHookInput {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!isRecord(parsed)) return {};
    return {
      ...(typeof parsed.stop_hook_active === "boolean" ? { stop_hook_active: parsed.stop_hook_active } : {}),
      ...(typeof parsed.session_id === "string" ? { session_id: parsed.session_id } : {}),
    };
  } catch {
    return {};
  }
}

export function countArcBlocks(ledgerPath: string, arcId: string): number {
  if (!existsSync(ledgerPath)) return 0;
  try {
    const lines = readFileSync(ledgerPath, "utf8").split("\n");
    let count = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const event: unknown = JSON.parse(trimmed);
        if (!isRecord(event) || event.type !== "verification_gate_block") continue;
        const details = event.details;
        if (isRecord(details) && details.arcId === arcId) count += 1;
      } catch {
        continue;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

export function handleStop(rawInput: string, options: StopHookOptions = {}): StopResult {
  const statePath = options.statePath ?? resolveDefaultStatePath();
  const now = options.now ?? new Date().toISOString();
  const hookInput = safeParse(rawInput);
  const read = readTwinAdapterState(statePath);

  // Guard 1: Claude is already continuing from a prior Stop block; never block again.
  if (hookInput.stop_hook_active) {
    return { outputJson: {}, warnings: read.warnings };
  }
  if (!shouldBlockClose(read.state)) {
    return { outputJson: {}, warnings: read.warnings };
  }

  const ledgerPath = resolveDefaultLedgerPath(statePath);
  const open = openObligations(read.state);

  // Guard 2: hard cap on blocks per arc; degrade to a warning instead of trapping the user.
  const priorBlocks = countArcBlocks(ledgerPath, read.state.session.arcId);
  if (priorBlocks >= MAX_BLOCKS_PER_ARC) {
    appendLedgerEvent(
      { type: "verification_gate_warn", at: now, details: { arcId: read.state.session.arcId, open } },
      ledgerPath,
    );
    return {
      outputJson: {},
      warnings: [...read.warnings, "verification-gate: max blocks reached for this arc, downgraded to warning"],
    };
  }

  appendLedgerEvent(
    { type: "verification_gate_block", at: now, details: { arcId: read.state.session.arcId, open } },
    ledgerPath,
  );
  return {
    outputJson: { decision: "block", reason: renderVerificationBlockReason(read.state) },
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
  const result = handleStop(raw);
  if (result.warnings.length > 0) {
    process.stderr.write(`${result.warnings.join("\n")}\n`);
  }
  process.stdout.write(`${JSON.stringify(result.outputJson)}\n`);
}
