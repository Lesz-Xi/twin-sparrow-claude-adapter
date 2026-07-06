---
name: expert-review
description: >
  Combined engineering review applying expert-engineer and code-quality-skill simultaneously.
  Use for code reviews, PR audits, refactoring sessions, and architectural assessments where both
  multi-domain engineering analysis and code quality enforcement are needed.
---

# Expert Review

This is a composite skill. Apply **both** `expert-engineer` and `code-quality-skill` together.

## 🔒 MANDATORY ENFORCEMENT GATE

**You MUST follow this protocol before addressing the user's request. Do not skip any step. Do not collapse steps. Do not proceed to the task until all phases below are completed and written in your output.**

### Step 1: Acknowledge (write this exact line in your output)
```
[expert-review] Protocol engaged. Source skills required: expert-engineer, code-quality-skill.
```

### Step 2: Load Source Skills
Read the full `SKILL.md` for each source skill before continuing:
- `expert-engineer/SKILL.md` — for role-based workflows (debugger, TypeScript, security, backend, etc.)
- `code-quality-skill/SKILL.md` — for quality review pipeline, anti-patterns, and output format

### Step 3: Execute Workflow
Apply the Combined Workflow (below) in the exact order listed. Write findings from each layer before proceeding to the next. Do not merge layers.

### Step 4: Only After All Complete
After writing the full output from all workflow layers and the final formatted review, you may then address the specific user request.

---

## Combined Workflow

Apply layers in this order:

1. **Correctness & Root Cause** (from expert-engineer's Debug role) — Does the code work? Are there races, edge cases, or silent failures?
2. **Correctness & Data Integrity** (from code-quality-skill top priority) — Are invalid states representable? Are nullability and partial data handled?
3. **Security & Trust Boundaries** (layered check — both skills cover this) — Input validation, auth, secrets, OWASP Top 10, authorization enforcement.
4. **Complexity & Structure** (from code-quality-skill heuristics) — Remove accidental complexity, enforce cohesion, eliminate duplication.
5. **Type Safety** (from expert-engineer's TypeScript role) — Generics, discriminated unions, eliminate `any`, enforce boundaries.
6. **Error Handling & Observability** (both skills) — Fail loudly, preserve causal context, return actionable messages.
7. **Testing Coverage** (from code-quality-skill) — Behavior, contracts, regressions. Not implementation trivia.
8. **Refactoring Direction** (from both skills) — Smallest structural improvement that reduces risk most. Preserve behavior.

## Output Format

```
## Critical Findings (severity-ordered)

### [Critical/High/Medium/Low] File:line — Description
- **Source**: [expert-engineer | code-quality-skill | both]
- **What**: Description of the issue
- **Why**: Production impact
- **Fix**: Minimal change direction

## Strengths

## Open Questions

## Recommended Actions (prioritized)
1. 
2. 
3. 
```

## When to Use

- PR reviews before merge
- Pre-release code audits
- Architecture review of a new module
- Refactoring planning for a large component
- Security-focused code review
- Post-incident code analysis
