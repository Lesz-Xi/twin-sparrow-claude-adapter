---
name: code-quality-skill
description: >
  Review, refactor, and harden code for correctness, maintainability, testability, and operational safety across TypeScript, JavaScript, Python, backend, frontend, and tooling code.
---

# Code Quality Skill

Treat quality as reduction of future failure, not stylistic purity. Optimize for correctness first, then maintainability, then elegance.

## 🔒 ENFORCEMENT GATE

**Do not jump to task answers without first writing your review scope determination.**

1. Write `[code-quality-skill] Review priority: [highest priority from Review Priorities list]` before any analysis.
2. Apply the Review Priorities in order — do not skip to style before checking correctness.
3. Use the Review Output Format defined in this file.

---

## Operating Rules

- Understand the code's purpose and runtime constraints before judging style.
- Prefer concrete findings over generalized best-practice language.
- Keep working code simple unless there is a demonstrated reason to generalize.
- Improve the smallest surface that materially reduces risk.
- Preserve external contracts unless the task explicitly permits a breaking change.
- Distinguish fact, inference, and hypothesis when assessing a code path.

## Review Priorities

Check in this order:

1. Correctness and data integrity
2. Security and trust boundaries
3. Concurrency, ordering, and lifecycle hazards
4. Error handling and observability
5. API clarity and maintainability
6. Performance and resource usage
7. Style and consistency

## Core Heuristics

### Correctness

- Make invalid states hard to represent.
- Encode assumptions in types, schemas, guards, and tests.
- Prefer explicit contracts over hidden coupling.
- Treat edge cases as part of the feature, not optional cleanup.
- Verify nullability, partial data, retries, idempotency, and ordering assumptions.

### Complexity

- Remove branches, indirection, and abstractions that do not earn their cost.
- Collapse accidental complexity before introducing new helpers or patterns.
- Prefer one clear path over many configurable paths.
- Keep modules cohesive and responsibilities legible.

### Naming and Structure

- Use names that reveal role, constraints, and side effects.
- Separate orchestration from computation.
- Keep pure logic isolated from I/O when practical.
- Group code by change affinity, not by arbitrary taxonomy.

### Data Boundaries

- Validate external input at boundaries.
- Normalize data once, near ingestion.
- Avoid passing loosely shaped objects deep into the system.
- Convert implicit conventions into explicit types or schemas.

## Error Handling Standards

- Fail loudly for programmer errors; fail gracefully for expected operational errors.
- Preserve useful causal context when wrapping errors.
- Do not swallow exceptions without a deliberate reason and telemetry path.
- Return actionable messages at system boundaries and internal precision inside logs or traces.
- Make retry behavior explicit. Hidden retries create confusing failure modes.

## Testing Standards

- Test behavior, contracts, and regressions, not implementation trivia.
- Add tests when fixing bugs, changing invariants, or refactoring risky logic.
- Prefer narrow, high-signal tests over snapshot sprawl.
- Cover:
  - happy path
  - edge cases
  - failure path
  - boundary conditions
- If a bug would be expensive in production, create the smallest durable test that would have caught it.

## Refactoring Workflow

1. Identify the real problem:
   - bug risk
   - unreadable flow
   - duplicated logic
   - brittle API
   - missing validation
2. Preserve current behavior with tests or direct verification when risk is non-trivial.
3. Make one coherent structural improvement at a time.
4. Re-run tests or targeted validation after each meaningful step.
5. Stop once the code is materially safer and easier to reason about.

## Language-Agnostic Smells

- Functions that mix parsing, validation, mutation, I/O, and presentation
- Boolean flags that create many execution modes
- Shared mutable state without clear ownership
- Duplicate business rules implemented in multiple places
- Hidden temporal coupling between calls
- Catch-all utility layers that erase domain meaning
- Comments explaining confusing code that should instead be simplified
- Tests that only mirror current implementation details

## TypeScript and JavaScript Guidance

- Prefer explicit types at boundaries and inferred types within well-shaped local logic.
- Avoid `any` unless it is a temporary boundary with a clear narrowing step.
- Use discriminated unions for real state machines.
- Prefer immutable updates unless there is a measured performance reason not to.
- Be careful with async sequencing, stale closures, and mixed sync/async error paths.
- Keep runtime validation in place even when compile-time types exist for external input.

## Frontend Quality Guidance

- Keep state ownership explicit and effect usage minimal.
- Verify accessibility, interaction states, and rendering fallbacks.
- Avoid UI abstractions that hide simple behavior behind many props.
- Fix rerender and performance issues structurally before memoizing.

## Backend and Systems Guidance

- Make side effects, retries, and transactional boundaries obvious.
- Validate authorization, tenancy, and input assumptions early.
- Protect invariants at write paths, not just read paths.
- Ensure logs, metrics, or traces can explain production failures.

## Review Output Format

When using this skill for review, produce:

1. Findings first, ordered by severity
2. File and line references where possible
3. Why the issue matters in production terms
4. The minimal fix direction
5. Residual uncertainty or missing evidence

If there are no material findings, say so explicitly and note any remaining test gaps or assumptions.

## Anti-Patterns

- Refactoring for aesthetics while increasing risk
- Adding abstraction before repetition or volatility is proven
- Replacing precise domain logic with generic helpers
- Using tests as a substitute for reasoning about invariants
- Treating linter compliance as proof of quality
- Hiding uncertainty behind confident language

## Output Expectations

When using this skill:

- Prioritize defects and risk over style commentary.
- Make code easier to understand locally.
- Add or recommend targeted validation.
- Preserve working behavior unless change is justified.
- State tradeoffs clearly when quality dimensions conflict.
