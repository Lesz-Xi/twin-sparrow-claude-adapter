import type { BashToolObservation, ToolObservation } from "../hooks/verification-instrument-core.js";

/**
 * The single seam between Twin-Sparrow's host-neutral core and a specific agent
 * runtime (Claude Code, Codex CLI, ...). Everything a host varies — the shape of
 * the stdin hook payload and the shape of the stdout decision/context output —
 * lives behind this port. Core hook logic, capsules, routing, and state never
 * see raw host JSON; they consume the normalized values produced here.
 *
 * Adding a second host is: implement this interface once, register it in
 * ./index.ts, and point that host's hooks.json at the same compiled hooks.
 */

export type HostId = "claude" | "codex";

/** Normalized Stop-event signal, host-agnostic. */
export interface StopSignal {
  readonly stopHookActive: boolean;
  readonly sessionId?: string;
}

/** Normalized SessionStart signal, host-agnostic. */
export interface SessionStartSignal {
  readonly sessionId?: string;
  readonly source?: string;
}

export type CompactTrigger = "manual" | "auto" | "unknown";

/** Normalized PostCompact signal, host-agnostic. */
export interface CompactSummarySignal {
  readonly summary: string;
  readonly trigger: CompactTrigger;
  readonly sessionId?: string;
}

/** A host-neutral turn decision the core produces; the host renders it to wire JSON. */
export type TwinDecision =
  | { readonly kind: "allow" }
  | { readonly kind: "block"; readonly reason: string };

/** Lifecycle events that carry an injected-context payload. */
export type HostContextEvent = "UserPromptSubmit" | "PostToolUse" | "PostToolBatch" | "SessionStart";

/** The wire shape a host emits to inject additional context for a given event. */
export interface ContextOutput<E extends HostContextEvent> {
  readonly hookSpecificOutput: {
    readonly hookEventName: E;
    readonly additionalContext: string;
  };
}

export interface AgentHostPort {
  readonly id: HostId;

  /** Parse a raw stdin hook payload into a generic object (host-tolerant JSON). */
  parsePayload(raw: string): unknown;

  /** Extract the user prompt text from a UserPromptSubmit payload. */
  extractPrompt(payload: unknown): string;

  /** Extract all tool observations from a PostToolUse or PostToolBatch payload. */
  extractToolObservations(payload: unknown): readonly ToolObservation[];

  /** Extract Bash tool observations from a PostToolUse or PostToolBatch payload. */
  extractBashObservations(payload: unknown): readonly BashToolObservation[];

  /** Extract the normalized Stop signal (loop guard + session id). */
  extractStop(payload: unknown): StopSignal;

  /** Extract the normalized SessionStart signal (session id + start source). */
  extractSessionStart(payload: unknown): SessionStartSignal;

  /** Extract the normalized PostCompact signal (summary + trigger + session id). */
  extractCompactSummary(payload: unknown): CompactSummarySignal | null;

  /** Render a context-injection output for the given lifecycle event. */
  renderContext<E extends HostContextEvent>(event: E, additionalContext: string): ContextOutput<E>;

  /** Render an allow/block turn decision (Stop gate, PostTool receipts). */
  renderDecision(decision: TwinDecision): Record<string, unknown>;
}
