import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createDefaultState, parseTwinAdapterState, type TwinAdapterState } from "./schema.js";

export const MAX_STATE_BYTES = 64 * 1024;

export interface StateReadResult {
  readonly state: TwinAdapterState;
  readonly warnings: readonly string[];
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

export function updateTwinAdapterState(
  updater: (state: TwinAdapterState) => TwinAdapterState,
  path: string = resolveDefaultStatePath(),
): StateReadResult {
  const read = readTwinAdapterState(path);
  const updated = updater(read.state);
  writeTwinAdapterState(updated, path);
  return { state: updated, warnings: read.warnings };
}
