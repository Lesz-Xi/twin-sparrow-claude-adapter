export function userPromptSubmitFixture(prompt: string): string {
  return JSON.stringify({
    hookEventName: "UserPromptSubmit",
    prompt,
  });
}

export function nestedUserPromptSubmitFixture(prompt: string): string {
  return JSON.stringify({
    hookEventName: "UserPromptSubmit",
    hookInput: {
      userPrompt: prompt,
    },
  });
}

export function userPromptSubmitWithSourcesFixture(
  prompt: string,
  sources: ReadonlyArray<{
    readonly id: string;
    readonly kind: "file" | "url" | "browser" | "unknown";
    readonly label: string;
    readonly location: string;
    readonly status: "metadata-only" | "read" | "retrieved" | "failed" | "missing-required";
  }>,
): string {
  return JSON.stringify({
    hookEventName: "UserPromptSubmit",
    prompt,
    sources,
  });
}

export function userPromptSubmitWithArtifactsFixture(
  prompt: string,
  artifacts: ReadonlyArray<{
    readonly id: string;
    readonly type: "plan" | "spec" | "diff" | "review" | "report" | "raw_output" | "unknown";
    readonly path: string;
  }>,
): string {
  return JSON.stringify({
    hookEventName: "UserPromptSubmit",
    prompt,
    artifacts,
  });
}
