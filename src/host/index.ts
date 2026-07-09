import { claudeHost } from "./claude-host.js";
import { codexHost } from "./codex-host.js";
import type { AgentHostPort, HostId } from "./host-port.js";

// Registry of implemented hosts.
const HOSTS: Partial<Record<HostId, AgentHostPort>> = {
  claude: claudeHost,
  codex: codexHost,
};

/**
 * Resolve the active host adapter.
 *
 * Defaults to Claude. Set TWIN_SPARROW_HOST to select another registered host;
 * an unknown or not-yet-implemented value falls back to Claude rather than
 * failing the hook, so a misconfigured env never silences the adapter.
 */
export function resolveHost(env: NodeJS.ProcessEnv = process.env): AgentHostPort {
  const requested = env.TWIN_SPARROW_HOST as HostId | undefined;
  if (requested && HOSTS[requested]) {
    return HOSTS[requested] as AgentHostPort;
  }
  return claudeHost;
}

export { claudeHost, codexHost };
export type {
  AgentHostPort,
  CompactSummarySignal,
  CompactTrigger,
  HostId,
  SessionStartSignal,
  StopSignal,
  TwinDecision,
} from "./host-port.js";
