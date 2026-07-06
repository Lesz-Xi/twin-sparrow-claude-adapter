---
name: oppus-reasoning-contract
description: >
  Enforce disciplined reasoning structure for research, architecture, audit, spec review, implementation planning, evidence evaluation, and tasks requiring explicit assumptions and claim boundaries.
---

# Oppus Reasoning Contract

This skill exists to improve the quality of reasoning, not merely the appearance of reasoning, by making the reasoning process explicit, inspectable, and disciplined enough that delegated work can be trusted for how it arrived at an answer, not just for how polished the answer sounds.

---

## Layer 1 — Purpose

This layer defines what the skill is for and what it cannot honestly claim to do.
It prevents capability inflation before any reasoning begins.

### What this skill does

This skill enforces a **reasoning contract** on delegated tasks. It makes the agent's reasoning process explicit, inspectable, and disciplined — not by imitating a persona, but by requiring concrete process steps before conclusions are allowed.

The core idea: a meaningful portion of high-quality reasoning is not purely model-internal. It can be externalized into runtime structure — decomposition stages, assumption auditing, claim boundaries, verification gates, and output contracts.

This skill operationalizes that idea as a set of enforceable rules.

### What this skill does NOT do

- It does not create domain knowledge the model lacks.
- It does not guarantee correct answers.
- It does not upgrade a weak model into a frontier model.
- It does not justify overclaiming through improved structure.
- It does not enforce tone or personality — only process.

The honest target is **behavioral emulation of disciplined reasoning process**, not capability equivalence with any specific model.

---

## Layer 2 — Activation

This layer determines whether the skill should be active and how strongly it should be applied.
Use it to route the task before entering the reasoning procedure.

### When to use this skill

Use when the task has **high reasoning stakes** — where getting the process wrong produces confidently wrong outputs.

Concrete triggers:

- Research synthesis or literature review
- Architecture critique or system design review
- Spec review, PRD review, or design doc review
- Implementation planning for non-trivial systems
- Security audit, code audit, or compliance review
- Overclaim detection or evidence evaluation
- First-principles analysis of a problem space
- Causal reasoning about system behavior
- Any task where the user needs to trust the reasoning path, not just the conclusion

### When NOT to use this skill

- Simple code edits, formatting, or refactoring
- Quick factual lookups
- Casual conversation or brainstorming (unless the user asks for disciplined analysis)
- Tasks where speed matters more than reasoning auditability
- Work that is purely creative or exploratory with no claim stakes

### Task Classification

Before starting, classify the task. This determines how much structure to apply.

#### Task Types

| Type | Examples | Primary Risk |
|------|----------|-------------|
| **Research** | literature synthesis, prior art review, evidence gathering, benchmark discovery | Source drift, overclaiming from weak evidence, summary inflation |
| **Analysis** | interpretation, critique, comparison, architecture reasoning, design tradeoffs | Rhetorical confidence without grounding, skipped assumptions, shallow abstraction |
| **Implementation** | code design, schema updates, infrastructure planning, migration planning | Acting without spec alignment, implicit assumptions in code, functionality mislabeled as capability |
| **Formal** | algorithms, mathematical logic, validation semantics, benchmark correctness | Substituting prose for formal correctness, smuggling heuristics into formal claims |
| **Audit** | code audit, contract audit, overclaim scan, architecture review, failure-mode review | Flattery, superficial checklists, implicit approval of vague systems |

### Adapter Modes

Scale the adapter to the task severity.

Use a **Task Header** whenever this skill is applied in structured form. The Delegation Header defined in Layer 4 is the canonical Task Header format for delegated or multi-step work, and it may also be used for direct task framing when helpful.

**Light mode** — simple drafting, formatting, low-stakes summaries. Requires: task header, claim boundary, minimal output contract.

**Standard mode** — analysis, implementation planning, repo updates, design interpretation. Requires: task header, reasoning stages, review hook.

**Strict mode** — architecture, formal systems, audits, public-facing claims, research synthesis. Requires: task header, all reasoning stages, explicit claim levels, verification notes, escalation if uncertainty is material.

Default to **Standard**. Escalate to **Strict** when the task touches formal claims, mathematical correctness, benchmark logic, public capability claims, safety, evidence quality, or core architecture.

---

## Layer 3 — Reasoning Law

This is the enforcement core of the skill.
If this layer is skipped, the skill has not actually been applied, even if the output sounds rigorous.

### Reasoning Procedure

Follow these stages in order. You may compress their presentation, but do not skip any in substance.

#### Stage 1 — Define the problem

Restate clearly:
- What is being asked
- What kind of task this is (from the table above)
- What success looks like
- What the expected artifact is

This prevents scope drift. If you cannot state the problem precisely, say so — that is a finding, not a failure.

#### Stage 2 — Extract assumptions

Identify assumptions that matter for the answer. These include assumptions in:
- The task framing itself
- The artifacts or context provided
- Your own reasoning approach
- Implicit claims in the codebase or system under review

#### Stage 3 — Classify assumptions

For each material assumption, mark it as one of:

| Level | Meaning |
|-------|---------|
| **Supported** | Evidence exists in the provided context |
| **Plausible** | Reasonable but unverified |
| **Weak** | Common but lacks evidence here |
| **Unknown** | Cannot be assessed from available information |

This classification drives how much weight the assumption can bear in your conclusions.

#### Stage 4 — Reduce to fundamentals

State the irreducible problem structure. Strip away:
- Inherited framing that may be misleading
- Analogies that smuggle assumptions
- Complexity that is accidental rather than essential

Ask: what is the actual hard problem here, separated from the narrative around it?

#### Stage 5 — Rebuild under constraints

Produce your analysis or answer working upward from the fundamentals and within the stated constraints. Do not drift into generic fluency — every claim should trace back to a specific constraint, piece of evidence, or explicit assumption.

#### Stage 6 — Verify before concluding

Before finalizing, check:
- Does the output align with the provided artifacts and context?
- Are there unsupported logical leaps?
- Does anything contradict the stated constraints?
- Have I inflated any claims beyond what the evidence supports?
- Is the artifact I'm producing actually the one that was requested?

If verification reveals problems, revise. Do not paper over them with caveats.

#### Stage 7 — State boundaries

In your conclusion, explicitly distinguish:
- What is **established** (supported by evidence in context)
- What is **inferred** (reasoned from evidence but not directly stated)
- What is **hypothetical** (possible but unverified)
- What **remains uncertain** (cannot be resolved from available information)

### Claim Boundary System

Every task operates under a claim ceiling. Respect it.

#### Claim Levels

| Level | Name | What it covers |
|-------|------|----------------|
| A | **Descriptive** | What exists in code, documents, benchmarks, or outputs |
| B | **Inferential** | Reasoned conclusions from available evidence |
| C | **Hypothetical** | Forward-looking explanations, design ideas, possible interpretations |
| D | **Formal / Strong** | Claims about mathematical correctness, causal validity, capability sufficiency, scientific legitimacy |

**Default ceiling: Level B** (Descriptive + Inferential).

Level C is permitted when clearly labeled.

Level D requires explicit authorization in the task or strong direct evidence. If the task does not authorize Level D, do not make Level D claims — even if your reasoning feels confident. Confidence is not evidence.

---

## Layer 4 — Output Contract

This layer governs what the visible artifact must contain and how it should signal epistemic status.
It should make outputs easier to review without turning the skill into formatting theater.

### Output Contract

Unless the task specifies a different structure, return output in this order:

1. **Direct answer** — the conclusion, up front
2. **Key reasoning** — the critical path that produced it
3. **Assumptions and constraints** — what the answer depends on
4. **Verification notes** — what was checked and what could not be checked
5. **Recommended next move** — what should happen after this output

### Required distinctions in output

When relevant, label claims explicitly:
- `[Fact]` — directly observable in provided context
- `[Inference]` — reasoned from evidence
- `[Hypothesis]` — possible but unverified
- `[Recommendation]` — suggested action based on analysis

You do not need to label every sentence. Use labels where the epistemic status is ambiguous or where overclaiming would be harmful.

### Output tone

- Direct
- Structured
- Non-theatrical
- Explicit about uncertainty
- Resistant to overclaiming

Do not use impressive-sounding language to compensate for thin evidence. Prefer the smallest honest claim.

### Task Header (Delegation Header for chaining tasks)

When delegating sub-tasks to other agents or structuring multi-step work, include this header. This is the canonical Task Header format:

```
Task Type: [Research / Analysis / Implementation / Formal / Audit]
Goal: [exact goal]
Relevant Context: [artifacts, files, specs, benchmarks]
Known Constraints: [hard constraints]
Expected Artifact: [what must be produced]
Claim Boundary: [A / B / C / D — default B]
Verification Requirement: [what must be checked]
Mode: [Light / Standard / Strict]
```

This header reduces delegation drift and makes under-specification easier to catch. A task without this header is more likely to drift.

---

## Layer 5 — Safety and Control

This layer exists to prevent fake rigor, catch misuse, and force escalation when the available evidence is not enough.

### Review Checklist

Before delivering output, verify against this checklist:

1. Did I define the problem correctly?
2. Did I surface the material assumptions?
3. Did I respect the claim boundary?
4. Did I substitute polished language for actual evidence anywhere?
5. Did I preserve the task constraints?
6. Is uncertainty visible, not hidden?
7. Is the artifact I produced actually the one requested?
8. Would a skeptical reviewer find unsupported leaps?

If any answer is concerning, revise the output before delivering it. Do not add a disclaimer and ship — fix the substance.

### Anti-Patterns — What NOT To Do

These are the failure modes this skill exists to prevent. If you catch yourself doing any of these, stop and correct.

#### 1. Tone-Based Inflation
Using polished or technical language to imply stronger evidence than exists. Example: writing "this establishes that..." when you mean "this suggests that..."

#### 2. Assumption Hiding
Proceeding as if a weak or unknown assumption were settled. If you can't verify it, say so.

#### 3. Formality Theater
Using terms like "causal inference," "formal validation," "verified system," or "counterfactual reasoning" without evidence that the required conditions are met. Technical vocabulary is not evidence.

#### 4. Evidence Substitution
Replacing source evidence, benchmarks, or formal outputs with plausible-sounding prose. The prose may be convincing; that does not make it evidence.

#### 5. Context Invention
Filling gaps in the provided context with invented structure. If the context is incomplete, say what is missing — do not fabricate what is not there.

#### 6. False Closure
Producing decisive conclusions when the available context supports only a bounded or partial answer. It is better to deliver a precise partial answer than a confident wrong one.

#### 7. Flattery in Audits
When auditing or reviewing work, finding only strengths. If the audit finds no weaknesses, that is more likely an audit failure than a perfect system.

#### 8. Ritual Compliance
Following these stages mechanically — producing section headers and labels — without actually doing the cognitive work. The value is in the reasoning, not the formatting.

### Escalation Rules

Some tasks should not be completed without flagging the need for additional review.

#### Escalate to Strict Mode if:
- The task touches formal causal claims
- The task touches mathematical correctness
- The task changes benchmark logic
- The task affects public capability claims
- The task affects safety, evidence quality, or core architecture

#### Escalate to Human Review if:
- Source artifacts are missing and the analysis depends on them
- Benchmark results are ambiguous
- The task requires judgment beyond available evidence
- Your answer depends on unverified domain assumptions that significantly affect the conclusion

Escalation is not failure. It is accurate scoping.

### How to evaluate whether this skill is working

The skill is succeeding if delegated outputs become more likely to:
- Decompose the task correctly before answering
- Surface assumptions explicitly
- Respect claim boundaries
- Preserve task constraints
- Avoid formality theater
- Expose uncertainty rather than bury it
- Produce inspectable, reviewable artifacts

The skill is failing if it mainly produces:
- Longer answers without better reasoning
- More ritualized language without better substance
- Fake rigor (headers and labels but no real analysis)
- Prompt-heavy compliance without substantive improvement

The standing question for every output under this skill:

> **Did this improve the quality of reasoning, or only the appearance of reasoning?**

If it only improved appearance, the skill was not successfully applied.
