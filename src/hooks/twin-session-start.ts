import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { renderSessionStartBundle } from "../capsules/capsule-bundle.js";
import { TINY_TWIN_CONTRACT_CAPSULE_CLASS } from "../capsules/tiny-twin-contract.js";
import { appendLedgerEvent, resolveDefaultLedgerPath } from "../state/ledger.js";
import { readTwinAdapterState, resolveDefaultStatePath, writeTwinAdapterState } from "../state/safe-state-store.js";

export interface SessionStartOptions {
  readonly statePath?: string;
  readonly now?: string;
  readonly sessionId?: string;
  readonly arcId?: string;
}

export interface SessionStartResult {
  readonly output: string;
  readonly warnings: readonly string[];
}

export function handleSessionStart(options: SessionStartOptions = {}): SessionStartResult {
  const statePath = options.statePath ?? resolveDefaultStatePath();
  const now = options.now ?? new Date().toISOString();
  const read = readTwinAdapterState(statePath);
  const arcId = options.arcId ?? randomUUID();
  const state = {
    ...read.state,
    updatedAt: now,
    session: {
      ...read.state.session,
      ...(options.sessionId ? { id: options.sessionId } : {}),
      arcId,
    },
    lastCapsuleClasses: [TINY_TWIN_CONTRACT_CAPSULE_CLASS],
  };
  const bundle = renderSessionStartBundle();
  writeTwinAdapterState(state, statePath);
  appendLedgerEvent(
    {
      type: "session_start",
      at: now,
      details: { sessionId: state.session.id, arcId, capsuleClasses: state.lastCapsuleClasses, capsuleMetrics: bundle.metrics },
    },
    resolveDefaultLedgerPath(statePath),
  );
  return { output: bundle.additionalContext, warnings: read.warnings };
}

function isMainModule(metaUrl: string): boolean {
  return process.argv[1] === fileURLToPath(metaUrl);
}

if (isMainModule(import.meta.url)) {
  const result = handleSessionStart();
  if (result.warnings.length > 0) {
    process.stderr.write(`${result.warnings.join("\n")}\n`);
  }
  process.stdout.write(`${result.output}\n`);
}
