import type { BashToolObservation, ToolObservation } from "../hooks/verification-instrument-core.js";
import type {
  AgentHostPort,
  ContextOutput,
  HostContextEvent,
  HostId,
  SessionStartSignal,
  StopSignal,
  TwinDecision,
} from "./host-port.js";

// Shared implementation of the "hooks.json" hook contract that Claude Code and
// Codex CLI both use:
//   stdin  -> one JSON object per hook event
//   stdout -> { hookSpecificOutput: { hookEventName, additionalContext } } to inject context
//          -> { decision: "block", reason } to block a Stop / PostTool result
//
// Both hosts are instances of this factory. A host that genuinely diverges on a
// field passes a targeted override to createHooksJsonHost — it never forks the
// whole parser.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ---- payload parsing ---------------------------------------------------------

function parsePayload(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return trimmed;
  }
}

// ---- UserPromptSubmit --------------------------------------------------------

const PROMPT_KEYS = ["prompt", "userPrompt", "message", "text", "input"] as const;

function nestedString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  if (typeof value === "string") return value;
  if (isRecord(value)) {
    const text = value.text;
    if (typeof text === "string") return text;
  }
  return null;
}

function extractPrompt(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (!isRecord(payload)) return "";
  for (const key of PROMPT_KEYS) {
    const value = nestedString(payload, key);
    if (value) return value;
  }
  const hookInput = payload.hookInput;
  if (isRecord(hookInput)) {
    for (const key of PROMPT_KEYS) {
      const value = nestedString(hookInput, key);
      if (value) return value;
    }
  }
  return "";
}

// ---- PostToolUse / PostToolBatch observations --------------------------------

function stringField(record: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return null;
}

function recordField(record: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> | null {
  for (const key of keys) {
    const value = record[key];
    if (isRecord(value)) return value;
  }
  return null;
}

function valueField(record: Record<string, unknown>, keys: readonly string[]): unknown {
  for (const key of keys) {
    if (key in record) return record[key];
  }
  return undefined;
}

function observationFromRecord(record: Record<string, unknown>): ToolObservation | null {
  const toolName = stringField(record, ["tool_name", "toolName", "name"]);
  if (!toolName) return null;

  const inputRecord = recordField(record, ["tool_input", "toolInput", "input"]);
  const command = inputRecord ? stringField(inputRecord, ["command"]) : null;

  return {
    toolName,
    ...(command ? { command } : {}),
    response: valueField(record, ["tool_response", "toolResponse", "response", "tool_result", "toolResult", "result"]),
  };
}

function collectObservations(value: unknown, depth = 0): readonly ToolObservation[] {
  if (depth > 8) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectObservations(item, depth + 1));
  }
  if (!isRecord(value)) return [];

  const observation = observationFromRecord(value);
  if (observation) return [observation];

  return Object.values(value).flatMap((item) => collectObservations(item, depth + 1));
}

function extractToolObservations(payload: unknown): readonly ToolObservation[] {
  return collectObservations(payload);
}

function extractBashObservations(payload: unknown): readonly BashToolObservation[] {
  return collectObservations(payload).flatMap((observation): BashToolObservation[] => {
    if (observation.toolName !== "Bash" || !observation.command) return [];
    return [{ command: observation.command, response: observation.response, toolName: "Bash" }];
  });
}

// ---- Stop --------------------------------------------------------------------

function extractStop(payload: unknown): StopSignal {
  if (!isRecord(payload)) return { stopHookActive: false };
  return {
    stopHookActive: payload.stop_hook_active === true,
    ...(typeof payload.session_id === "string" ? { sessionId: payload.session_id } : {}),
  };
}

// ---- SessionStart ------------------------------------------------------------

function extractSessionStart(payload: unknown): SessionStartSignal {
  if (!isRecord(payload)) return {};
  return {
    ...(typeof payload.session_id === "string" ? { sessionId: payload.session_id } : {}),
    ...(typeof payload.source === "string" ? { source: payload.source } : {}),
  };
}

// ---- output rendering --------------------------------------------------------

function renderContext<E extends HostContextEvent>(event: E, additionalContext: string): ContextOutput<E> {
  return { hookSpecificOutput: { hookEventName: event, additionalContext } };
}

function renderDecision(decision: TwinDecision): Record<string, unknown> {
  if (decision.kind === "block") {
    return { decision: "block", reason: decision.reason };
  }
  return {};
}

/**
 * Build a hooks.json-contract host. `overrides` lets a specific host replace an
 * individual method when it genuinely diverges; `id` always wins so an override
 * cannot mislabel the host.
 */
export function createHooksJsonHost(id: HostId, overrides: Partial<AgentHostPort> = {}): AgentHostPort {
  const base: AgentHostPort = {
    id,
    parsePayload,
    extractPrompt,
    extractToolObservations,
    extractBashObservations,
    extractStop,
    extractSessionStart,
    renderContext,
    renderDecision,
  };
  return { ...base, ...overrides, id };
}
