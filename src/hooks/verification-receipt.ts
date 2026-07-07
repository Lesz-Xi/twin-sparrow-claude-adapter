import type { AgentHostPort } from "../host/host-port.js";

/**
 * Render the host output for a verification instrument (PostToolUse / PostToolBatch).
 * Returns an empty object when nothing was closed, so the hook stays silent unless
 * it has an actual receipt to inject. The receipt text is host-neutral; the host
 * decides how to wrap it.
 */
export function renderVerificationReceipt(
  host: AgentHostPort,
  event: "PostToolUse" | "PostToolBatch",
  closed: readonly string[],
): Record<string, unknown> {
  if (closed.length === 0) return {};
  return {
    ...host.renderContext(
      event,
      `Twin-Sparrow verification receipt: closed ${closed.length} obligation(s): ${closed.join("; ")}`,
    ),
  };
}
