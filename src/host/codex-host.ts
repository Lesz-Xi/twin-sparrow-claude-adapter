import { createHooksJsonHost } from "./hooks-json-host.js";

/**
 * Codex CLI host adapter.
 *
 * Per https://developers.openai.com/codex/hooks the Codex hook contract is,
 * for every field Twin-Sparrow consumes, identical to Claude Code's:
 *
 *   stdin common:      session_id, cwd, hook_event_name, model, permission_mode
 *   UserPromptSubmit:  prompt                                    (+ turn_id)
 *   PostToolUse:       tool_name, tool_input, tool_response      (+ tool_use_id, turn_id)
 *   Stop:              stop_hook_active, session_id              (+ last_assistant_message, turn_id)
 *   SessionStart:      source, session_id
 *   context inject:    { hookSpecificOutput: { hookEventName, additionalContext } }
 *   block decision:    { decision: "block", reason }
 *
 * So the Codex host is the shared hooks.json implementation with no overrides today.
 *
 * [Hypothesis] The one field whose inner shape is not yet empirically confirmed
 * is the Bash `tool_response` payload. classifyToolResponse (verification-instrument-core)
 * is already tolerant of every shape seen so far — {type,text} | {stdout,stderr} |
 * string | {exitCode} | {success} — which is the safety net until a live Codex
 * capture confirms it (mirrors audit finding R1). When a genuine divergence is
 * found, pass a targeted override here; do NOT fork the parser.
 */
export const codexHost = createHooksJsonHost("codex");
