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

export function stopHookFixture(stopHookActive: boolean): string {
  return JSON.stringify({
    hookEventName: "Stop",
    session_id: "test-session",
    stop_hook_active: stopHookActive,
  });
}

export function postToolUseBashFixture(command: string, toolResponse: unknown): string {
  return JSON.stringify({
    hookEventName: "PostToolUse",
    tool_name: "Bash",
    tool_input: { command },
    tool_response: toolResponse,
  });
}

export function postToolUseNonBashFixture(toolName: string): string {
  return JSON.stringify({
    hookEventName: "PostToolUse",
    tool_name: toolName,
    tool_input: { file_path: "/tmp/example.ts" },
    tool_response: { success: true },
  });
}

export const bashSuccessResponse = {
  stdout: "all checks passed",
  stderr: "",
  interrupted: false,
  isImage: false,
} as const;

export const bashFailureResponse = "Error: Exit code 1\n1 failing test";

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
