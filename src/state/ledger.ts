import { appendFileSync, existsSync, lstatSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { resolveDefaultStatePath } from "./safe-state-store.js";

export const MAX_LEDGER_BYTES = 1024 * 1024;

export interface LedgerEvent {
  readonly type: string;
  readonly at: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export function resolveDefaultLedgerPath(statePath: string = resolveDefaultStatePath()): string {
  return join(dirname(statePath), "session-ledger.jsonl");
}

function assertSafeLedgerPath(path: string): void {
  if (!existsSync(path)) return;
  const linkStat = lstatSync(path);
  if (linkStat.isSymbolicLink()) {
    throw new Error(`Refusing to use symlink ledger path: ${path}`);
  }
  if (!linkStat.isFile()) {
    throw new Error(`Ledger path exists but is not a regular file: ${path}`);
  }
  const fileStat = statSync(path);
  if (fileStat.size > MAX_LEDGER_BYTES) {
    throw new Error(`Ledger file exceeds ${MAX_LEDGER_BYTES} bytes: ${path}`);
  }
}

export function appendLedgerEvent(event: LedgerEvent, path: string = resolveDefaultLedgerPath()): void {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  assertSafeLedgerPath(path);
  appendFileSync(path, `${JSON.stringify(event)}\n`, { encoding: "utf8", mode: 0o600 });
}
