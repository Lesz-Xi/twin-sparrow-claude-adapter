export type PromptClassification =
  | "acknowledgment"
  | "continuation"
  | "execution"
  | "exploration"
  | "implementation"
  | "architecture"
  | "representation"
  | "source-grounded"
  | "artifact-evaluation"
  | "skill-invocation"
  | "token-economics"
  | "closure";

const ACK = /^(thanks|thank you|ok|okay|cool|nice|great|perfect|got it|yes|yep|sounds good)$/i;
const DEBUG_FAILURE = /\b(fail|failed|fails|failing|error|bug|debug|broken|stack trace|exception)\b/;
const ARTIFACT_REVIEW = /\b(review|evaluate|audit|check|inspect)\s+(?:this\s+|the\s+|my\s+|our\s+)?(?:implementation\s+)?(plan|spec|diff|review|proposal|artifact|report)\b/;
const ARTIFACT_PATH = /\b(plan|spec|diff|review|proposal|artifact|report)\b[^\n]*(?:~|\.|\/)?(?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+/;
const SOURCE_FILE_PATH = /\b(?:source\s+)?file\b[^\n]*(?:~|\.|\/)?(?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+/;

export function classifyPrompt(promptText: string): readonly PromptClassification[] {
  const text = promptText.toLowerCase();
  const labels: PromptClassification[] = [];

  if (ACK.test(promptText.trim())) labels.push("acknowledgment");
  if (/^continue\b|\bkeep going\b|\bproceed\b/.test(text)) labels.push("continuation");
  if (/\b(do it|ship it|execute|implement|build|fix|debug|verify|test)\b/.test(text)) labels.push("execution");
  if (/\bimplement|build|wire|integrate|code\b/.test(text)) labels.push("implementation");
  if (/\barchitecture|system design|plugin|hook|runtime|adapter\b/.test(text)) labels.push("architecture");
  if (/\b\/represent\b|\brepresentation\b|\bproduct soul\b|\bthink-different\b/.test(text)) labels.push("representation");
  if (/\bsource|article|browser|current page|url|repo\b/.test(text) || SOURCE_FILE_PATH.test(text)) labels.push("source-grounded");
  if (ARTIFACT_REVIEW.test(text) || ARTIFACT_PATH.test(text)) labels.push("artifact-evaluation");
  if (/\b\/represent\b|\bthink-different\b|\boppus-reasoning-contract\b|\bskill\b/.test(text)) labels.push("skill-invocation");
  if (/\btoken|tokens|cost|overhead|economics|honest numbers|context budget\b/.test(text)) labels.push("token-economics");
  if (/\bdone\b|\bwe're done\b|\bwait for my next instruction\b/.test(text)) labels.push("closure");
  if (/\b(explore|meaning|understand|reflect)\b/.test(text) || (/\bwhy\b/.test(text) && !DEBUG_FAILURE.test(text))) labels.push("exploration");

  return Array.from(new Set(labels));
}

export function requiresSourceGrounding(labels: readonly PromptClassification[]): boolean {
  return labels.includes("source-grounded");
}
