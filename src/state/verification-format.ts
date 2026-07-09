import type { WorkingStateVerification } from "./schema.js";

function limitLines(lines: readonly string[], limit: number, omittedLabel: string): readonly string[] {
  if (lines.length <= limit) return lines;
  return [...lines.slice(0, limit), `- … ${lines.length - limit} more ${omittedLabel}`];
}

function commandLabel(command: string): string {
  const compact = command.replace(/\s+/g, " ").trim();
  if (!compact) return "unknown command";
  return compact.length > 80 ? `${compact.slice(0, 77)}...` : compact;
}

function formatObligationLine(obligation: WorkingStateVerification["obligations"][number]): string {
  const policy = obligation.closurePolicy === "block_stop" ? "blocking" : "advisory";
  return `- ${obligation.status} / ${policy} / ${obligation.category}: ${obligation.reason}`;
}

export function formatVerificationSummary(verification: WorkingStateVerification): readonly string[] {
  const obligations = verification.obligations;
  const latestEvidence = verification.evidence.at(-1);

  const lines: string[] = [`Verification mutation seq: ${verification.mutationSeq}`];

  if (obligations.length === 0) {
    lines.push("Verification obligations: none");
  } else {
    lines.push("Verification obligations:", ...limitLines(obligations.map(formatObligationLine), 6, "obligation(s)"));
  }

  if (!latestEvidence) {
    lines.push("Latest verification evidence: none");
  } else {
    lines.push(
      `Latest verification evidence: ${latestEvidence.verdict} / ${latestEvidence.category} / mutation ${latestEvidence.observedAtMutationSeq} / ${latestEvidence.host}:${latestEvidence.rawShape} / ${commandLabel(latestEvidence.command)}`,
    );
  }

  return lines;
}
