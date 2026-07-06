---
name: deep-audit
description: >
  Composite deep audit skill combining expert-engineer, code-quality-skill, and oppus-reasoning-contract for strict implementation, architecture, correctness, maintainability, and overclaim review.
---

# Deep Audit

This is a composite skill. Apply **all three** skills concurrently: `expert-engineer`, `code-quality-skill`, and `oppus-reasoning-contract`.

## 🔒 MANDATORY ENFORCEMENT GATE

**You MUST follow this protocol before addressing the user's request. Do not skip any step. Do not collapse steps. Do not proceed to the task until all phases below are completed and written in your output.**

### Step 1: Acknowledge (write this exact line in your output)
```
[deep-audit] Protocol engaged. Source skills required: expert-engineer, code-quality-skill, oppus-reasoning-contract.
```

### Step 2: Load Source Skills
Read the full `SKILL.md` for each source skill before continuing:
- `expert-engineer/SKILL.md` — apply role-based workflows and engineering heuristics
- `code-quality-skill/SKILL.md` — apply quality pipeline and review standards
- `oppus-reasoning-contract/SKILL.md` — enforce reasoning discipline, assumption surfacing, and claim boundaries

### Step 3: Execute Phases 1–5 (from Execution Protocol below)
Complete ALL phases in order. Write each phase's output before moving to the next layer. Do not merge or combine phases.

### Step 4: Only After All Complete
After writing the full output from all 5 phases, you may then address the specific user request.

---

## Execution Protocol

### Phase 1: Problem Definition (oppus-reasoning-contract)

Classify the task (Research / Analysis / Implementation / Formal / Audit) and set the adapter mode (default: Strict). Define what success looks like and what the expected artifact is.

### Phase 2: Multi-Layer Analysis

Run these layers concurrently. Each finding must be tagged with its source skill.

| Layer | Source Skill | Scope |
|-------|-------------|-------|
| Root cause analysis | expert-engineer (Debug) | Crashes, hangs, races, data corruption |
| Architecture review | expert-engineer (Backend) | API contracts, DB design, distributed hazards |
| Type system review | expert-engineer (TypeScript) | Generics, type safety, `any` usage, narrowing |
| Security audit | expert-engineer (Security) | OWASP Top 10, threat modeling, secret handling |
| Correctness | code-quality-skill | Invalid states, nullability, edge cases, invariants |
| Complexity | code-quality-skill | Accidental complexity, cohesion, abstraction cost |
| Error handling | both | Failure propagation, observability, retry semantics |
| Testing gaps | code-quality-skill | Missing coverage on bug-costly paths |

### Phase 3: Assumption Surfacing (oppus-reasoning-contract)

For every material assumption underlying your findings, classify it: Supported / Plausible / Weak / Unknown. Weak or Unknown assumptions that drive critical findings must be flagged for verification.

### Phase 4: Claim Boundary Enforcement (oppus-reasoning-contract)

Label conclusions by level:
- **[Fact]** — directly observable in the code/context
- **[Inference]** — reasoned from evidence
- **[Hypothesis]** — possible but unverified
- **[Recommendation]** — suggested action

Do not make Level D (formal/causal sufficiency) claims without explicit evidence.

### Phase 5: Findings Assembly

Merge findings from all layers. Remove duplicates. Order by production severity, not by source skill.

## Output Format

```
## Executive Summary
[Brief assessment of overall risk and key findings]

## Findings (severity-ordered)

### [Critical/High/Medium/Low] File:line — Description
- **Source**: [skill name(s)]
- **What**: What the issue is
- **Why**: Production impact
- **Assumption**: [Supported/Plausible/Weak/Unknown]
- **Claim Level**: [Fact/Inference/Hypothesis]
- **Fix Direction**: Minimal change

## Verification Notes
- What was checked
- What could not be checked
- What requires human verification

## Recommended Actions (prioritized)
1. [Immediate — critical risk mitigation]
2. [Short-term — high-impact improvements]
3. [Medium-term — structural improvements]
```

## When to Use

- Security audits before external review
- Architecture reviews of core system components
- Production-critical deployments
- Post-incident root cause analysis
- Compliance or regulatory reviews
- Reviews of new code patterns before adoption at scale
