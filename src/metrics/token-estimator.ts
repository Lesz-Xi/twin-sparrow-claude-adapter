export interface CapsuleMetrics {
  readonly characterCount: number;
  readonly estimatedTokens: number;
  readonly estimateMethod: "chars_div_4_rounded_up";
  readonly estimatesOnly: true;
  readonly claimedSavings: false;
}

export function estimateTokensFromText(text: string): number {
  if (text.length === 0) return 0;
  return Math.ceil(text.length / 4);
}

export function measureCapsuleText(text: string): CapsuleMetrics {
  return {
    characterCount: text.length,
    estimatedTokens: estimateTokensFromText(text),
    estimateMethod: "chars_div_4_rounded_up",
    estimatesOnly: true,
    claimedSavings: false,
  };
}
