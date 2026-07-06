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

export function classifyPrompt(promptText: string): readonly PromptClassification[] {
  const text = promptText.toLowerCase();
  const labels: PromptClassification[] = [];

  if (ACK.test(promptText.trim())) labels.push("acknowledgment");
  if (/^continue\b|\bkeep going\b|\bproceed\b/.test(text)) labels.push("continuation");
  if (/\b(do it|ship it|execute|implement|build|fix|debug|verify|test)\b/.test(text)) labels.push("execution");
  if (/\bimplement|build|wire|integrate|code\b/.test(text)) labels.push("implementation");
  if (/\barchitecture|system design|plugin|hook|runtime|adapter\b/.test(text)) labels.push("architecture");
  if (/\b\/represent\b|\brepresentation\b|\bproduct soul\b|\bthink-different\b/.test(text)) labels.push("representation");
  if (/\bsource|article|browser|current page|url|repo|file\b/.test(text)) labels.push("source-grounded");
  if (/\b(plan|spec|diff|review|proposal|artifact)\b/.test(text)) labels.push("artifact-evaluation");
  if (/\b\/represent\b|\bthink-different\b|\boppus-reasoning-contract\b|\bskill\b/.test(text)) labels.push("skill-invocation");
  if (/\btoken|tokens|cost|overhead|economics|honest numbers|context budget\b/.test(text)) labels.push("token-economics");
  if (/\bdone\b|\bwe're done\b|\bwait for my next instruction\b/.test(text)) labels.push("closure");
  if (/\bexplore|why|meaning|understand|reflect\b/.test(text)) labels.push("exploration");

  return Array.from(new Set(labels));
}

export function requiresSourceGrounding(labels: readonly PromptClassification[]): boolean {
  return labels.includes("source-grounded");
}
