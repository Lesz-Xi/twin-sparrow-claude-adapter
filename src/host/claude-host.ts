import { createHooksJsonHost } from "./hooks-json-host.js";

/**
 * Claude Code host adapter.
 *
 * Claude Code and Codex CLI converged on the same hooks.json contract, so the
 * Claude host is the shared implementation with no overrides. See hooks-json-host.ts.
 */
export const claudeHost = createHooksJsonHost("claude");
