import { stdin as input } from "node:process";
import { fileURLToPath } from "node:url";
import { resolveHost } from "../host/index.js";
import { appendLedgerEvent, resolveDefaultLedgerPath } from "../state/ledger.js";
import { resolveDefaultStatePath } from "../state/safe-state-store.js";
import { writeCompactionArchive } from "../memory/compaction-archive.js";

export interface PostCompactArchiveOptions {
  readonly statePath?: string;
  readonly memoryDir?: string;
  readonly now?: string;
  readonly env?: NodeJS.ProcessEnv;
}

export interface PostCompactArchiveResult {
  readonly outputJson: Record<string, unknown>;
  readonly archived: boolean;
  readonly path?: string;
  readonly bytes?: number;
  readonly warnings: readonly string[];
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function appendLedgerSafely(
  statePath: string,
  event: {
    readonly type: string;
    readonly at: string;
    readonly details?: Readonly<Record<string, unknown>>;
  },
): readonly string[] {
  try {
    appendLedgerEvent(event, resolveDefaultLedgerPath(statePath));
    return [];
  } catch (error) {
    return [`failed to append compaction ledger event: ${errorMessage(error)}`];
  }
}

export function handlePostCompact(rawInput: string, options: PostCompactArchiveOptions = {}): PostCompactArchiveResult {
  const env = options.env ?? process.env;
  const host = resolveHost(env);
  const signal = host.extractCompactSummary(host.parsePayload(rawInput));
  if (!signal || signal.summary.trim().length === 0) {
    return { outputJson: {}, archived: false, warnings: [] };
  }

  const now = options.now ?? new Date().toISOString();
  const statePath = options.statePath ?? resolveDefaultStatePath(env);

  try {
    const archived = writeCompactionArchive(
      {
        summary: signal.summary,
        trigger: signal.trigger,
        host: host.id,
        ...(signal.sessionId ? { sessionId: signal.sessionId } : {}),
        archivedAt: now,
      },
      { ...(options.memoryDir ? { directory: options.memoryDir } : {}), env },
    );
    const ledgerWarnings = appendLedgerSafely(statePath, {
      type: "compaction_archived",
      at: now,
      details: {
        host: host.id,
        trigger: signal.trigger,
        path: archived.path,
        bytes: archived.bytes,
        ...(signal.sessionId ? { sessionId: signal.sessionId } : {}),
      },
    });
    return { outputJson: {}, archived: true, path: archived.path, bytes: archived.bytes, warnings: ledgerWarnings };
  } catch (error) {
    const reason = errorMessage(error);
    const ledgerWarnings = appendLedgerSafely(statePath, {
      type: "compaction_archive_failed",
      at: now,
      details: {
        host: host.id,
        trigger: signal.trigger,
        reason,
        ...(signal.sessionId ? { sessionId: signal.sessionId } : {}),
      },
    });
    return { outputJson: {}, archived: false, warnings: [`failed to archive compaction summary: ${reason}`, ...ledgerWarnings] };
  }
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
  const result = handlePostCompact(raw);
  if (result.warnings.length > 0) {
    process.stderr.write(`${result.warnings.join("\n")}\n`);
  }
  process.stdout.write(`${JSON.stringify(result.outputJson)}\n`);
}
