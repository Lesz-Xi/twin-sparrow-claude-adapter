---
name: sequential-thinking
description: >
  Use dynamic and reflective step-by-step problem solving for complex tasks, revising thoughts as understanding deepens, branching alternatives, and verifying hypotheses before final answers.
---

# Sequential Thinking

A dual-mode skill for dynamic and reflective problem-solving. It guides the agent to break complex 
problems into manageable steps, revise thoughts as understanding deepens, branch into alternative 
paths, and verify solution hypotheses before delivering a final answer.

## 🔒 ENFORCEMENT GATE

**Do not provide a final answer until you have performed a Sequential Thinking cycle.**

1. **Trigger Analysis:** Assess the complexity of the task.
2. **Mode Selection:** 
   - If the problem is complex but linear: Use **Internal Mode** (Reasoning Block).
   - If the problem is non-linear, requires branching/reverting, or needs multiple hypotheses: Use **MCP Mode**.
3. **Execution:** Follow the selected process to generate a verified solution.
4. **Verification:** Only proceed to the final answer *after* the thinking cycle marks `nextThoughtNeeded` as false.

---

## Mode 1: Internal Reasoning (Fast, Structured)

Use this mode for complex problems that can be solved via a structured thought chain without external tool overhead.
Perform this reasoning block *before* any action.

### Thinking Protocol

Use the following mental structure for your analysis:

- **thought**: The current thinking step.
- **thoughtNumber**: Current step in sequence.
- **totalThoughts**: Estimated steps needed (adjustable).
- **nextThoughtNeeded**: Boolean; set to false ONLY when you have a verified answer.
- **isRevision**: Boolean; mark if this step revises a previous thought.

### Execution Rules

1. **Start with a hypothesis.**
2. **Break the problem down** into distinct analytical steps.
3. **Verify each step** against the problem constraints.
4. **Recurse/Branch** if a step is invalid:
   - *Revision:* Explicitly state "revising thought [X]..." and provide the new logic.
   - *Branching:* Explicitly state "branching from thought [X]..." to explore alternatives.
5. **Final Verification:** Ensure the chain of thought leads to the conclusion without gaps.

---

## Mode 2: MCP Tool Escalation (Deep, Explicit)

Use this mode when the problem space is ambiguous, requires backtracking, or involves multiple conflicting hypotheses.
Invoke the MCP `sequential-thinking` tool explicitly.

### Tool Inputs (when using MCP)

When calling the tool, maintain the structure from the SPEC:

| Parameter | Type | Description |
|-----------|------|-------------|
| `thought` | string | The current reasoning step. |
| `nextThoughtNeeded` | boolean | True if more thinking is required. |
| `thoughtNumber` | integer | Current step number. |
| `totalThoughts` | integer | Current estimate of total steps (adjustable). |
| `isRevision` | boolean | True if this step revises a previous thought. |
| `revisesThought` | integer | If revision, which thought is being reconsidered. |
| `branchFromThought` | integer | If branching, the branching point. |
| `branchId` | string | Identifier for the current branch. |
| `needsMoreThoughts` | boolean | True if reaching end but realizing more are needed. |

### Execution Flow

1. **Estimate Scope:** Start with `totalThoughts: 5-10` (adjust dynamically).
2. **Step-by-Step Analysis:** Call the tool for each thought step.
3. **Hypothesis Generation:** Use a thought step to propose a solution.
4. **Hypothesis Verification:** Use subsequent thought steps to verify/refute.
5. **Course Correction:** If a hypothesis fails, use `isRevision` or branching to pivot.
6. **Conclusion:** Set `nextThoughtNeeded: false` ONLY when a verified answer is reached.

---

## Output Conventions

- **Explicit State Tracking:** In Internal Mode, prefix reasoning steps clearly (e.g., `Thought 1: [Analysis]`) so the user sees the logic flow.
- **No Skipping:** Do not jump to the conclusion without completing the full cycle.
- **Adaptive Scope:** If you realize you need more thoughts, increase `totalThoughts` explicitly.
- **Final Answer:** The final output must be a single, clear answer derived from the thinking process.
