---
name: rigorous-audit
description: >
  Composite rigorous audit skill applying oppus-reasoning-contract in Strict mode with code-quality-skill to find overclaims, assumptions, quality risks, smells, verification gaps, and prioritized fixes.
---

# Rigorous Audit

This is a composite skill. Apply **both** `oppus-reasoning-contract` (Strict mode by default) and `code-quality-skill` concurrently.

## Load Instructions

Before proceeding, read both source skills:

1. Read `oppus-reasoning-contract` — set adapter mode to **Strict**, enforce claim boundary discipline, surface and classify all assumptions
2. Read `code-quality-skill` — apply its full review pipeline: correctness → security → concurrency → errors → API → performance → style

Execute reasoned auditing: every finding must be claimed at the correct epistemic level.

## Execution Protocol

### Phase 1: Audit Scope Definition (oppus Stage 1)

- Task Type: **Audit**
- Mode: **Strict** (default for audits — per escalation rules)
- Define: what is being audited, what the success criteria are, what artifacts are in scope
- Define: what is **out** of scope (prevents scope creep and false closure)

### Phase 2: Assumption Register (oppus Stages 2–3)

For this audit, surface:
- Assumptions in the spec/contract/PRD being audited
- Assumptions in the code implementing the spec
- Assumptions in the test suite (what it covers, what it doesn't)
- Assumptions in your review approach

Classify each: Supported / Plausible / Weak / Unknown.

### Phase 3: Overclaim Detection (oppus claim boundary system)

Scan the artifacts for claims that exceed their evidence level:
- Level C (Hypothetical) claims stated as Level A (Descriptive) facts
- Design decisions presented as proven solutions
- Performance guarantees without benchmarks
- Security claims without vulnerability testing
- Capability claims without formal or empirical verification

For each overclaim found: document the claim, the evidence that supports it, and the level it should actually be at.

### Phase 4: Quality Audit (code-quality-skill pipeline)

Execute the full review priority order:

1. **Correctness & Data Integrity** — Invalid states, nullability, partial data, retries, idempotency, ordering
2. **Security & Trust Boundaries** — Input validation, auth, secrets, tenancy, authorization
3. **Concurrency, Ordering, Lifecycle** — Race conditions, temporal coupling, resource lifecycle, shutdown semantics
4. **Error Handling & Observability** — Failure propagation, error context, logging, telemetry, retry behavior
5. **API Clarity & Maintainability** — Naming, contracts, modularity, change affinity, accidental complexity
6. **Performance & Resource Usage** — Hot paths, allocation, query efficiency, connection management
7. **Style & Consistency** — Naming, formatting, lint compliance (lowest priority)

Each finding must include its claim level: Fact / Inference / Hypothesis.

### Phase 5: Smell Detection (code-quality-skill heuristics)

Apply the language-agnostic smell checklist:
- Functions that mix parsing, validation, mutation, I/O, and presentation
- Boolean flags that create many execution modes
- Shared mutable state without clear ownership
- Duplicate business rules implemented in multiple places
- Hidden temporal coupling between calls
- Catch-all utility layers that erase domain meaning
- Comments explaining confusing code that should instead be simplified
- Tests that only mirror current implementation details

### Phase 6: Verify (oppus Stage 6)

Before concluding:
- Are findings severity-ordered, not alphabetized by file or type?
- Are there findings at all? If none, that is likely an audit failure, not a perfect system
- Are any findings hiding weak assumptions behind confident language?
- Is every finding backed by a specific file, line, or artifact reference?
- Is the uncertainty visible, not buried in caveats?

### Phase 7: State Boundaries (oppus Stage 7)

Clearly separate:
- **Established** — bugs and issues directly observable in code
- **Inferred** — systemic risks reasoned from code patterns
- **Hypothetical** — potential failure modes under untested conditions
- **Uncertain** — gaps that cannot be resolved from available artifacts (may require additional context, runtime data, or domain knowledge)

## Output Format

```
## Audit Report

### Scope
- Artifacts Reviewed: [files, specs, docs]
- Out of Scope: [what was not reviewed and why]
- Mode: Strict

### Assumption Register
| # | Assumption | Classification | Audit Impact if Wrong |
|---|-----------|----------------|----------------------|

### Overclaim Findings
| # | Claim in Artifact | Actual Evidence Level | Correct Level |
|---|-------------------|----------------------|---------------|

### Quality Findings (severity-ordered)

#### [Critical/High/Medium/Low] File:line — Description
- **Source**: [which quality layer]
- **Claim Level**: [Fact/Inference/Hypothesis]
- **What**: Description
- **Why**: Production impact
- **Fix Direction**: Minimal change

### Code Smells Detected
- [List with file references]

### Verification Notes
- Checked: [what was verified]
- Not Checked: [what could not be verified and why]
- Requires Human Judgment: [findings needing domain knowledge or runtime evidence]

### Recommended Actions (prioritized)
1. [Immediate — critical defect or security risk]
2. [Short-term — high-impact quality improvements]
3. [Medium-term — structural improvements]
```

## When to Use

- Spec or contract review before implementation
- Overclaim scan: checking documentation, PRDs, or RFCs for inflated claims
- Compliance review: checking code against regulatory or policy requirements
- Pre-release quality gate with reasoning discipline
- Reviewing a vendor's or third party's claims about their system
- Auditing test coverage and identifying false confidence from test suites
- Post-incident: did our code match our stated invariants?

## Anti-Patterns

- Finding zero weaknesses (audit failure per oppus anti-pattern #7)
- Treating linter compliance as proof of correctness or quality
- Using "this looks good" as a finding (it is not — say what is good and why)
- Auditing only the code without checking the spec it implements
- Allowing polished prose in specs to substitute for formal correctness
- Adding severity labels to every finding as "Medium" (severity inflation obscures real risk)
- Ritual compliance: filling out the template without doing the cognitive work
