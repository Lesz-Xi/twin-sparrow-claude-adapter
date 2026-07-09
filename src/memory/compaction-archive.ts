import { existsSync, lstatSync, mkdirSync, writeFileSync, type Stats } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import type { CompactTrigger, HostId } from "../host/host-port.js";

export const MAX_COMPACTION_ARCHIVE_BYTES = 256 * 1024;
export const MAX_COMPACTION_FILENAME_COLLISIONS = 100;

export interface CompactionArchiveInput {
  readonly summary: string;
  readonly trigger: CompactTrigger;
  readonly host: HostId;
  readonly sessionId?: string;
  readonly archivedAt: string;
}

export interface CompactionArchiveWriteOptions {
  readonly directory?: string;
  readonly env?: NodeJS.ProcessEnv;
  readonly maxBytes?: number;
}

export interface CompactionArchiveWriteResult {
  readonly path: string;
  readonly bytes: number;
}

export function resolveDefaultCompactionArchiveDir(env: NodeJS.ProcessEnv = process.env): string {
  return env.TWIN_SPARROW_MEMORY_DIR ?? join(homedir(), ".twin-sparrow", "agent", "memory", "compaction-log");
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

export function buildCompactionArchiveBody(input: CompactionArchiveInput): string {
  const frontmatter = [
    "---",
    `kind: ${yamlString("compaction-summary")}`,
    `host: ${yamlString(input.host)}`,
    `trigger: ${yamlString(input.trigger)}`,
    ...(input.sessionId ? [`session_id: ${yamlString(input.sessionId)}`] : []),
    `archived_at: ${yamlString(input.archivedAt)}`,
    "---",
    "",
  ];
  return `${frontmatter.join("\n")}${input.summary}\n`;
}

function archiveBytes(body: string): number {
  return Buffer.byteLength(body, "utf8");
}

function isErrno(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { readonly code?: unknown }).code === code;
}

function lstatIfPresent(path: string): Stats | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if (isErrno(error, "ENOENT")) return null;
    throw error;
  }
}

function assertNoSymlinkAtExistingPath(path: string): void {
  const absolute = isAbsolute(path) ? path : resolve(path);
  let cursor = absolute;
  const seen = new Set<string>();

  while (!seen.has(cursor)) {
    seen.add(cursor);
    const stat = lstatIfPresent(cursor);
    if (stat) {
      if (stat.isSymbolicLink()) {
        throw new Error(`Refusing to use symlink archive path: ${cursor}`);
      }
      break;
    }
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
}

function ensureSafeArchiveDirectory(directory: string): void {
  assertNoSymlinkAtExistingPath(directory);
  if (existsSync(directory)) {
    const stat = lstatSync(directory);
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to use symlink archive directory: ${directory}`);
    }
    if (!stat.isDirectory()) {
      throw new Error(`Archive path exists but is not a directory: ${directory}`);
    }
    return;
  }
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = lstatSync(directory);
  if (stat.isSymbolicLink()) {
    throw new Error(`Refusing to use symlink archive directory: ${directory}`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`Archive path exists but is not a directory: ${directory}`);
  }
}

export function compactionArchiveFilename(archivedAt: string, trigger: CompactTrigger, collision = 0): string {
  const safeTimestamp = archivedAt.replace(/[^0-9A-Za-z-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const suffix = collision > 0 ? `-${collision}` : "";
  return `compaction-${safeTimestamp}-${trigger}${suffix}.md`;
}

export function writeCompactionArchive(
  input: CompactionArchiveInput,
  options: CompactionArchiveWriteOptions = {},
): CompactionArchiveWriteResult {
  const directory = options.directory ?? resolveDefaultCompactionArchiveDir(options.env);
  const body = buildCompactionArchiveBody(input);
  const bytes = archiveBytes(body);
  const maxBytes = options.maxBytes ?? MAX_COMPACTION_ARCHIVE_BYTES;
  if (bytes > maxBytes) {
    throw new Error(`Compaction archive exceeds ${maxBytes} bytes`);
  }

  ensureSafeArchiveDirectory(directory);

  for (let collision = 0; collision <= MAX_COMPACTION_FILENAME_COLLISIONS; collision += 1) {
    const path = join(directory, compactionArchiveFilename(input.archivedAt, input.trigger, collision));
    try {
      writeFileSync(path, body, { encoding: "utf8", mode: 0o600, flag: "wx" });
      return { path, bytes };
    } catch (error) {
      if (isErrno(error, "EEXIST")) continue;
      throw error;
    }
  }

  throw new Error(`Unable to allocate unique compaction archive filename after ${MAX_COMPACTION_FILENAME_COLLISIONS} retries`);
}
