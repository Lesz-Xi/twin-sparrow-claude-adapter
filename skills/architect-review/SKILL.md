---
name: architect-review
description: >
  Composite architecture review skill combining Oppus reasoning discipline with expert engineering review for system design, APIs, data models, distributed hazards, TypeScript, debugging, and architecture tradeoff analysis.
---

# Architect Review

This is a composite skill. Apply **both** `oppus-reasoning-contract` (Standard or Strict mode) and `expert-engineer` (Backend + TypeScript + Debug roles) concurrently.

## 🔒 MANDATORY ENFORCEMENT GATE

**You MUST follow this protocol before addressing the user's request. Do not skip any step. Do not collapse steps. Do not proceed to the task until all phases below are completed and written in your output.**

### Step 1: Acknowledge (write this exact line in your output)
```
[architect-review] Protocol engaged. Source skills required: oppus-reasoning-contract, expert-engineer.
```

### Step 2: Load Source Skills
Read the full `SKILL.md` for each source skill before continuing:
- `oppus-reasoning-contract/SKILL.md` — for reasoning discipline, assumption classification, claim boundaries
- `expert-engineer/SKILL.md` — for backend architecture, distributed systems, TypeScript, and debug roles

### Step 3: Execute Phases 1–6 (from the Execution Protocol below)
Complete ALL phases in order. Write each phase's output before moving to the next. You may not merge or combine phases.

### Step 4: Only After All Complete
After writing the full output from all 6 phases, you may then address the specific user request. If the user's request IS the architecture review, the protocol output IS the answer.

---

## Execution Protocol

### Phase 1: Problem Definition (oppus-reasoning-contract, Stage 1)

- Classify the task (typically: **Analysis** or **Formal**)
- State what is being asked, what kind of review this is, what success looks like
- Set adapter mode: **Strict** for architecture; escalate to Strict if the decision affects production topology, data model, or public API contracts

### Phase 2: Assumption Extraction & Classification (Stages 2–3)

Identify every assumption the architecture makes. Sources:
- Claims in the design docs or specs
- Implicit assumptions in the codebase structure
- Assumptions in your own analytical approach
- Dependencies on external systems, data volumes, concurrency models

Classify each: Supported / Plausible / Weak / Unknown. Weak or Unknown assumptions that drive conclusions must be flagged.

### Phase 3: Fundamentals Reduction (Stage 4)

Strip away:
- Inherited framing from the original design (it may be biased or wrong)
- Analogies that smuggle assumptions ("it's like X, so we do Y")
- Complexity that is accidental (legacy, cargo-cult patterns, premature generalization)
- Technology choices conflated with requirements

State the **irreducible problem structure**: what must this system actually do, in minimal terms?

### Phase 4: Multi-Dimension Analysis (expert-engineer roles)

Apply these layers concurrently to the architecture:

| Dimension | Source | What to Check |
|-----------|--------|---------------|
| API Contract | Backend Engineering | Naming, versioning, idempotency, pagination, error models, breaking changes |
| Data Model | Backend Engineering | Schema design, relationship integrity, migration safety, query patterns, indexing strategy |
| Distributed Hazards | Backend Engineering | Network partitions, clock skew, split brain, consistency models, backpressure, event ordering |
| Type System | TypeScript Specialist | Boundary types, API-to-client type mapping, discriminated unions for state, `any` elimination |
| Root Cause Resilience | Debug Engineering | Failure modes, observability, debuggability under production conditions |
| Complexity | Code Structure | Abstraction cost, cohesion, coupling, accidental indirection |

### Phase 5: Rebuild & Verify (Stages 5–6)

Produce the architecture assessment working upward from the fundamentals and within stated constraints. Every finding must trace to:
- A specific piece of evidence in the artifacts
- An explicit assumption (classified at Phase 2)
- A stated constraint

Check before concluding:
- No unsupported leaps
- No technology evangelism disguised as analysis
- No dismissal of valid alternatives without tradeoff comparison
- No hidden assumptions driving conclusions

### Phase 6: State Boundaries (Stage 7)

Explicitly distinguish:
- What is **established** (observable in artifacts)
- What is **inferred** (reasoned from evidence)
- What is **hypothetical** (possible but unverified)
- What **remains uncertain** (cannot be resolved without more information)

## Output Format

```
## Architecture Assessment

### Context
- Task Type: [Analysis / Formal]
- Adapter Mode: [Standard / Strict]
- System Scope: [what parts of the system this covers]

### Assumption Register
| # | Assumption | Classification | Impact if Wrong |
|---|-----------|----------------|-----------------|

### Findings (severity-ordered)

#### [Critical/High/Medium/Low] — Finding Title
- **Dimension**: [which analysis layer]
- **Claim Level**: [Fact/Inference/Hypothesis]
- **Evidence**: [where in the code/docs this was found]
- **Why it matters**: Production/system impact
- **Tradeoff Analysis**: [compare to at least one alternative]

### Fundamental Structure
[The irreducible problem statement, stripped of narrative]

### Recommendations (prioritized)
1. [Immediate — risk mitigation]
2. [Short-term — structural improvements]
3. [Medium-term — design refinements]

### Uncertainties
- [What cannot be resolved from available artifacts]
- [What requires additional information or prototyping]
```

## When to Use

- System architecture review before implementation
- Design doc review for new services or major refactors
- API design validation before public release
- Technology stack evaluation for a new project
- Scalability assessment of existing architecture
- Migration planning between architectures (monolith → services, DB migration, etc.)
- First-principles analysis of a problem domain before design begins

## Anti-Patterns

- Technology-first analysis ("we should use X because X is popular")
- Dismissing alternatives without comparing concrete tradeoffs
- Treating architecture diagrams as if they were implementation reality
- Reviewing only the happy path, ignoring failure modes
- Finding only strengths (audit failure — see oppus anti-pattern #7)
- Formality theater: applying reasoning headers without doing actual analysis
- Overclaiming: asserting "X is the right architecture" when evidence only supports "X satisfies the stated constraints, with these tradeoffs"
