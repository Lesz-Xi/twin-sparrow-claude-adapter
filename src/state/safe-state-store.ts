import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createDefaultState, parseTwinAdapterState, type TwinAdapterState } from "./schema.js";

export const MAX_STATE_BYTES = 64 * 1024;
export const STATE_LOCK_TIMEOUT_MS = 250;

export interface StateReadResult {
  readonly state: TwinAdapterState;
  readonly warnings: readonly string[];
}

interface LockResult {
  readonly acquired: boolean;
  readonly warnings: readonly string[];
  readonly release: () => void;
}

export function resolveDefaultStatePath(env: NodeJS.ProcessEnv = process.env): string {
  return env.TWIN_SPARROW_CLAUDE_STATE ?? join(homedir(), ".claude", "twin-sparrow", "state.json");
}

export function assertSafeStatePath(path: string): void {
  if (!existsSync(path)) return;
  const linkStat = lstatSync(path);
  if (linkStat.isSymbolicLink()) {
    throw new Error(`Refusing to use symlink state path: ${path}`);
  }
  if (!linkStat.isFile()) {
    throw new Error(`State path exists but is not a regular file: ${path}`);
  }
  const fileStat = statSync(path);
  if (fileStat.size > MAX_STATE_BYTES) {
    throw new Error(`State file exceeds ${MAX_STATE_BYTES} bytes: ${path}`);
  }
}

export function readTwinAdapterState(path: string = resolveDefaultStatePath()): StateReadResult {
  const fallback = createDefaultState();
  if (!existsSync(path)) {
    return { state: fallback, warnings: [] };
  }
  assertSafeStatePath(path);
  try {
    const raw = readFileSync(path, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return parseTwinAdapterState(parsed, fallback);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { state: fallback, warnings: [`failed to read state; using default: ${message}`] };
  }
}

export function writeTwinAdapterState(state: TwinAdapterState, path: string = resolveDefaultStatePath()): void {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  assertSafeStatePath(path);
  const payload = `${JSON.stringify(state, null, 2)}\n`;
  const tempPath = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, payload, { encoding: "utf8", mode: 0o600 });
  renameSync(tempPath, path);
}

function sleepSync(milliseconds: number): void {
  const signal = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(signal, 0, 0, milliseconds);
}

function lockErrorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { readonly code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

function acquireStateLock(path: string, timeoutMs = STATE_LOCK_TIMEOUT_MS): LockResult {
  const lockPath = `${path}.lock`;
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    try {
      mkdirSync(lockPath, { mode: 0o700 });
      let released = false;
      return {
        acquired: true,
        warnings: [],
        release: () => {
          if (released) return;
          released = true;
          rmSync(lockPath, { recursive: true, force: true });
        },
      };
    } catch (error) {
      if (lockErrorCode(error) !== "EEXIST") {
        const message = error instanceof Error ? error.message : String(error);
        return {
          acquired: false,
          warnings: [`state lock unavailable; continuing without lock: ${message}`],
          release: () => undefined,
        };
      }
      sleepSync(10);
    }
  }

  return {
    acquired: false,
    warnings: [`state lock timeout after ${timeoutMs}ms; continuing without lock`],
    release: () => undefined,
  };
}

export function updateTwinAdapterState(
  updater: (state: TwinAdapterState) => TwinAdapterState,
  path: string = resolveDefaultStatePath(),
): StateReadResult {
  const lock = acquireStateLock(path);
  try {
    const read = readTwinAdapterState(path);
    const updated = updater(read.state);
    writeTwinAdapterState(updated, path);
    return { state: updated, warnings: [...lock.warnings, ...read.warnings] };
  } finally {
    lock.release();
  }
}
