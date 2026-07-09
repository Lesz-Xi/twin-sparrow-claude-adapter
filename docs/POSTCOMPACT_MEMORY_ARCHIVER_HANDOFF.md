# Handoff — PostCompact Memory Archiver

> **Owner:** Chief · **Companion:** Solaris (design) → Atoman (build)
> **Status:** built locally — live Claude/Codex `PostCompact` payload validation still pending
> **Origin:** Chief asked whether `/compact` can save its context summary to
> `~/.twin-sparrow/agent/memory`. Answer: not via `/compact`, but yes via a
> `PostCompact` hook — which fits this adapter's existing hook pipeline.

---

## 1. The question being handed off

> Build a hook that automatically writes every compaction summary to
> `~/.twin-sparrow/agent/memory`, on both Claude Code and Codex?
> And: write into a **`compaction-log/` subfolder** (recommended) or straight
> into the **vault root**?

The architecture is now implemented locally. This doc remains as the design handoff and claim-boundary note for live validation.

## 2. Why `/compact` alone cannot do it (verified)

Confirmed against the official Claude Code docs (via the claude-code-guide agent):

- **`/compact [instructions]`** — the optional instructions **only steer the
  content/focus** of the generated summary. Compaction is a *pure internal
  summarization step*: it does **not** execute tools or write files. So there is
  no way to make `/compact` itself persist anything. **[Fact]**
- The summary is written **only** into the session transcript JSONL
  (`~/.claude/projects/<project>/<session-id>.jsonl`), whose entry format is
  internal and version-unstable — not safe to parse directly. **[Fact]**

## 3. The supported mechanism: the `PostCompact` hook

Claude Code fires **`PostCompact`** *after* compaction. Documented stdin schema:

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../<session-id>.jsonl",
  "cwd": "/Users/...",
  "hook_event_name": "PostCompact",
  "trigger": "manual",            // "manual" (/compact) or "auto" (context full)
  "compact_summary": "Summary of the compacted conversation..."
}
```

- **`compact_summary`** carries the **generated summary text itself** (not a
  path) — the one hook that receives compacted content. **[Fact]**
- **`trigger`** = `"manual"` | `"auto"`. **[Fact]**
- PostCompact has **no decision control** — informational only; ideal for
  archiving/logging. **[Fact]**

**[Hypothesis] Codex parity.** Codex's event list includes `PreCompact` /
`PostCompact`, but the exact Codex `PostCompact` field names are **not yet
verified** against a live capture. Extract tolerantly (accept `compact_summary`
plus camelCase/aliased fallbacks) and flag Codex as unproven until a real
payload is captured — same discipline as the `tool_response` R1 item already
tracked in `LIVE_HOOK_VALIDATION.md`.

## 4. Proposed design (fits the existing architecture)

The adapter already has: a host port (`src/host/`), a ledger
(`src/state/ledger.ts`), safe file-write discipline
(`src/state/safe-state-store.ts`), and `resolveHost()` host selection. This
feature reuses all of it.

| Piece | Change |
|-------|--------|
| `src/host/host-port.ts` | Add `extractCompactSummary(payload) -> CompactSummarySignal` to `AgentHostPort`, alongside the existing `extractToolObservations` / `extractStop` / `extractSessionStart`. New type: `CompactSummarySignal { summary: string; trigger: "manual" \| "auto" \| "unknown"; sessionId?: string }` |
| `src/host/hooks-json-host.ts` | Implement `extractCompactSummary` once in the shared factory (both hosts inherit it). Read `compact_summary` (+ tolerant aliases: `compactSummary`, `summary`), `trigger`, `session_id`. |
| `src/memory/compaction-archive.ts` | Builds the archive **filename** and **markdown body** from `{ summary, trigger, sessionId, now }`; performs dedicated safe no-overwrite archive writes with byte caps and symlink refusal. |
| `src/hooks/twin-postcompact-archiver.ts` | Entry hook: `host.parsePayload` → `host.extractCompactSummary` → resolve target dir → safe-write the file → append a `compaction_archived` ledger event. Empty/whitespace summary = no-op. Archive failures append `compaction_archive_failed` when possible and never block (PostCompact has no decision control). |
| `hooks/hooks.json` | Wire `PostCompact` → `twin-postcompact-archiver.js` (Claude). |
| `codex/hooks.json` | Wire `PostCompact` → same compiled hook (Codex), `TWIN_SPARROW_HOST=codex`. |
| `tests/hooks/postcompact-archiver.test.ts` (new) | Fixtures for manual/auto; assert file written with correct header+body, `compaction_archived` ledger event, empty-summary no-op, host tag correct. |

### Target directory resolution

```
TWIN_SPARROW_MEMORY_DIR  (env override)
  ↓ default
~/.twin-sparrow/agent/memory/compaction-log/     ← recommended (see §5)
```

Filename (sortable, collision-safe, no path traversal):
`compaction-<ISO8601-with-colons-replaced>-<trigger>.md`
e.g. `compaction-2026-07-08T00-42-11Z-auto.md`

File body:
```markdown
---
kind: "compaction-summary"
host: "claude"          # or "codex"
trigger: "auto"         # or "manual" / "unknown"
session_id: "abc123"
archived_at: "2026-07-08T00:42:11Z"
---

<compact_summary text verbatim>
```

Safety: `mkdir -p` the target with `0700`; refuse symlinked target paths;
sanitize the timestamp into the filename (no user text in the path); never
overwrite (`wx`, with short collision counter); cap written bytes with a sane
max; quote frontmatter metadata. The archive writer is separate from state-store
semantics because immutable log files have different safety requirements than the
single JSON state file.

### Ledger event

```json
{ "type": "compaction_archived", "at": "<now>",
  "details": { "host": "claude", "trigger": "auto", "path": "<file>", "bytes": 1234, "sessionId": "abc123" } }
```

This also becomes **telemetry**: how often compaction fires, manual vs auto, per host.

## 5. The open decision (Chief's call)

**Where do the archived summaries land?**

- **Option A — `compaction-log/` subfolder (recommended).** The memory dir is a
  live **Obsidian vault** (~70 curated entries + `.obsidian/`). Raw, frequent,
  auto-generated compaction dumps in the root would bury the curated notes and
  clutter the graph. A subfolder keeps them archived-but-separate, still
  searchable in Obsidian.
- **Option B — vault root.** Summaries appear as first-class notes immediately.
  Simpler, but noisier; auto-compaction can fire often, so the root fills with
  machine output.

Either way, `TWIN_SPARROW_MEMORY_DIR` lets Chief redirect without a code change.

## 6. Preconditions & caveats

- **[Precondition] Suite is currently expected to pass at 86/86** after this
  local implementation slice. If the count changes, trust the latest `npm run
  check` output over this note.
- **[Caveat] Codex `PostCompact` field names unverified** — build tolerant,
  mark Codex leg unproven in `LIVE_HOOK_VALIDATION.md`, capture one live Codex
  `PostCompact` payload before trusting it.
- **[Caveat] Restart required** — new hook events in `hooks.json` /
  `codex/hooks.json` are only read when the host reloads the plugin/hook config.
- **[Non-goal] No summary rewriting.** The archiver persists what the host
  produced; it does not re-summarize or edit. Steering summary *content* is
  still done with `/compact <instructions>` at call time.

## 7. Acceptance criteria

1. `npm run check` green, including new archiver tests and manifest drift guards.
2. A manual-trigger `PostCompact` payload writes a correctly-headed `.md` under
   the resolved dir and appends a `compaction_archived` ledger event.
3. An auto-trigger payload does the same with `trigger: auto`.
4. Empty/whitespace `compact_summary` writes nothing and logs nothing.
5. `TWIN_SPARROW_MEMORY_DIR` override is honored.
6. End-to-end: the compiled hook, run via stdin with a Claude-shaped payload,
   produces the file (mirrors how the verification hooks were smoke-tested).
7. `LIVE_HOOK_VALIDATION.md` updated with Claude and Codex `PostCompact` open items.

## 8. One-line framing

> `/compact` decides *what* to remember; this hook decides *that it is kept* —
> turning a disposable in-context summary into a durable entry in Chief's own memory.
