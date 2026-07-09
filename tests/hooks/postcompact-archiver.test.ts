import { existsSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { handlePostCompact } from "../../src/hooks/twin-postcompact-archiver.js";
import { postCompactFixture } from "../fixtures/claude-hook-events.js";

function tempDir(label: string): string {
  return mkdtempSync(join(tmpdir(), label));
}

function tempStatePath(): string {
  return join(tempDir("twin-postcompact-state-"), "state.json");
}

function ledgerEvents(statePath: string): ReadonlyArray<{ readonly type?: string; readonly details?: Record<string, unknown> }> {
  const ledgerPath = join(statePath, "..", "session-ledger.jsonl");
  if (!existsSync(ledgerPath)) return [];
  return readFileSync(ledgerPath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { readonly type?: string; readonly details?: Record<string, unknown> });
}

test("PostCompact archives a manual Claude summary with metadata and ledger receipt", () => {
  const statePath = tempStatePath();
  const memoryDir = tempDir("twin-postcompact-memory-");
  const result = handlePostCompact(postCompactFixture("Line one\nLine two", "manual"), {
    statePath,
    memoryDir,
    now: "2026-07-09T12:00:00.000Z",
    env: { TWIN_SPARROW_HOST: "claude" },
  });

  assert.equal(result.archived, true);
  assert.equal(result.warnings.length, 0);
  assert.ok(result.path?.startsWith(memoryDir));
  assert.equal(basename(result.path ?? ""), "compaction-2026-07-09T12-00-00-000Z-manual.md");

  const body = readFileSync(result.path ?? "", "utf8");
  assert.match(body, /kind: "compaction-summary"/);
  assert.match(body, /host: "claude"/);
  assert.match(body, /trigger: "manual"/);
  assert.match(body, /session_id: "test-session"/);
  assert.match(body, /archived_at: "2026-07-09T12:00:00.000Z"/);
  assert.ok(body.endsWith("Line one\nLine two\n"));

  const event = ledgerEvents(statePath).at(-1);
  assert.equal(event?.type, "compaction_archived");
  assert.equal(event?.details?.host, "claude");
  assert.equal(event?.details?.trigger, "manual");
  assert.equal(event?.details?.path, result.path);
  assert.equal(event?.details?.sessionId, "test-session");
  assert.equal(event?.details?.bytes, result.bytes);
});

test("PostCompact honors TWIN_SPARROW_MEMORY_DIR and Codex host tagging", () => {
  const statePath = tempStatePath();
  const memoryDir = tempDir("twin-postcompact-env-memory-");
  const result = handlePostCompact(postCompactFixture("Codex summary", "auto"), {
    statePath,
    now: "2026-07-09T12:01:00.000Z",
    env: { TWIN_SPARROW_HOST: "codex", TWIN_SPARROW_MEMORY_DIR: memoryDir },
  });

  assert.equal(result.archived, true);
  assert.ok(result.path?.startsWith(memoryDir));
  const body = readFileSync(result.path ?? "", "utf8");
  assert.match(body, /host: "codex"/);
  assert.match(body, /trigger: "auto"/);
  const event = ledgerEvents(statePath).at(-1);
  assert.equal(event?.details?.host, "codex");
});

test("PostCompact empty summary is a no-op", () => {
  const statePath = tempStatePath();
  const memoryDir = tempDir("twin-postcompact-empty-");
  const result = handlePostCompact(postCompactFixture("   \n\t", "manual"), {
    statePath,
    memoryDir,
    now: "2026-07-09T12:02:00.000Z",
  });

  assert.equal(result.archived, false);
  assert.deepEqual(readdirSync(memoryDir), []);
  assert.deepEqual(ledgerEvents(statePath), []);
});

test("PostCompact never overwrites an existing archive filename", () => {
  const statePath = tempStatePath();
  const memoryDir = tempDir("twin-postcompact-collision-");
  const existing = join(memoryDir, "compaction-2026-07-09T12-03-00-000Z-manual.md");
  writeFileSync(existing, "existing", { encoding: "utf8" });

  const result = handlePostCompact(postCompactFixture("Collision summary", "manual"), {
    statePath,
    memoryDir,
    now: "2026-07-09T12:03:00.000Z",
  });

  assert.equal(result.archived, true);
  assert.equal(basename(result.path ?? ""), "compaction-2026-07-09T12-03-00-000Z-manual-1.md");
  assert.equal(readFileSync(existing, "utf8"), "existing");
});

test("PostCompact archive failures are ledgered without blocking", () => {
  const statePath = tempStatePath();
  const notDirectory = join(tempDir("twin-postcompact-bad-target-"), "not-a-dir");
  writeFileSync(notDirectory, "file", { encoding: "utf8" });

  const result = handlePostCompact(postCompactFixture("Cannot archive", "manual"), {
    statePath,
    memoryDir: notDirectory,
    now: "2026-07-09T12:04:00.000Z",
  });

  assert.equal(result.archived, false);
  assert.equal(result.outputJson.constructor, Object);
  assert.match(result.warnings.join("\n"), /failed to archive compaction summary/);
  const event = ledgerEvents(statePath).at(-1);
  assert.equal(event?.type, "compaction_archive_failed");
  assert.equal(event?.details?.trigger, "manual");
  assert.match(String(event?.details?.reason), /not a directory/);
});

test("PostCompact refuses a symlink archive directory", () => {
  const statePath = tempStatePath();
  const parent = tempDir("twin-postcompact-symlink-");
  const realTarget = join(parent, "real");
  const symlinkTarget = join(parent, "link");
  symlinkSync(realTarget, symlinkTarget, "dir");

  const result = handlePostCompact(postCompactFixture("Symlink summary", "manual"), {
    statePath,
    memoryDir: symlinkTarget,
    now: "2026-07-09T12:05:00.000Z",
  });

  assert.equal(result.archived, false);
  assert.match(result.warnings.join("\n"), /symlink archive path|symlink archive directory/);
  const event = ledgerEvents(statePath).at(-1);
  assert.equal(event?.type, "compaction_archive_failed");
});
