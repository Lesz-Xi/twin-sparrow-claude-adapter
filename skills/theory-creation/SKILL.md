---
name: theory-creation
description: >
  Dual-mode skill for creating novel explanatory frameworks. Scaffold Mode (human-led): the skill structures the thinker's process through representation audit, constraint mapping, alternative generation, literature synthesis, and falsification pressure. Protocol Mode (agent-led): the agent runs the full theory-creation loop autonomously as a co-theorist, producing candidate theories with literature synthesis, constraint traces, and falsification logs. Every Protocol Mode eval/run must begin with literature research and synthesize the research before theory generation. Activates on: /theory-creation, "create a theory", "build an explanatory framework", "generate a theory", "theory building", "I need a new framework", "explain this phenomenon from scratch", "construct a model", "formulate a theory", "theory convergence", plus contexts where the user is trying to explain something that existing frameworks don't handle or is stuck in a representation that won't yield.
---

# Theory Creation

## Purpose

Create novel explanatory frameworks through structured representational transformation.

This skill operationalizes the finding that theory creation is not a generative act of unconstrained imagination, but a process of successive representational shifts under tightening constraints — where what changes is not just what the theorist knows, but how the problem is encoded. It provides two modes with a hard boundary between them.

---

## HARD GATES — Mode Boundaries

These boundaries are non-negotiable. Violating them is a skill failure.

### GATE 1: Entry Gate

| Condition | Action |
|-----------|--------|
| User explicitly invokes `/theory-creation` or clear theory-creation intent | Enter skill. Determine mode. |
| Intent is ambiguous between theory-creation and routine analysis | Ask: "Do you want a theory (novel explanatory framework), or an analysis (evaluation within an existing framework)?" |
| User clearly wants analysis, not theory creation | Do not use this skill. Use pearl-representation or oppus-reasoning-contract instead. |

### GATE 2: Mode Selection Gate

| Condition | Action |
|-----------|--------|
| User says "scaffold mode", "coach me", "walk me through", "I want to think" | Enter SCAFFOLD MODE. Agent is coach, not theorist. |
| User says "protocol mode", "run the protocol", "agent-led", "autonomous", "you do it" | Enter PROTOCOL MODE. Agent is co-theorist. |
| User provides no mode signal | Default to SCAFFOLD MODE. Never assume agent-led without explicit signal. |
| Mid-session mode switch requested | STOP the current mode cleanly. Summarize state. Then enter the new mode from its entry point. Do not blur modes. |

### GATE 3: Scaffold → Protocol Transition Gate

The agent MUST NOT theorize, propose candidate theories, or generate alternative representations in Scaffold Mode unless explicitly asked. In Scaffold Mode, the agent's only outputs are questions, constraints, surface-hidden-invariants, and structured prompts.

If the agent breaks this gate, it has left Scaffold Mode without authorization.

### GATE 4: Protocol → Claim Gate

In Protocol Mode, before outputting any theory, the agent MUST run the FULL convergence check (Step 7 of Protocol Mode). If the constraint set does not force a unique survivor, the agent MUST report "underdetermined" and list the remaining degrees of freedom. It MUST NOT claim convergence when the constraint set is loose.

### GATE 5: Falsification Gate (Both Modes)

No theory output — in either mode — without at least ONE specific, falsifiable prediction. "Falsifiable" means: names a measurement or observation that, if it came out differently, would kill the theory. Vague predictions ("future research will confirm") are gate failures.

### GATE 6: Safety Gate

Do not generate theories that:
- Conceal their speculative status from the user
- Claim certainty where the constraint set is loose
- Are designed to deceive, exploit, or cause harm
- Bypass consent or authorization
- Impersonate established scientific consensus

### GATE 7: Literature Research Synthesis Gate

Every Protocol Mode run and every Protocol Mode eval MUST perform literature research before candidate theory generation.

Minimum requirement:
- Use `literature-search-arxiv` when the domain is scientific, mathematical, computational, AI/ML, physics, statistics, or otherwise arXiv-relevant
- Use another appropriate research path only when arXiv is clearly the wrong corpus
- Synthesize the literature, do not merely list papers
- Extract: existing frameworks, known constraints, anomalies, open problems, measurement methods, and falsification standards
- Feed the synthesis into Step 3 (Constraint Map) and Step 6 (Falsification Pass)

If literature research is skipped, unsynthesized, or treated as citation decoration, the run is invalid. STOP and perform research synthesis before continuing.

---

## SCAFFOLD MODE — Human-Led Theory Creation

The agent is a structured coach. It asks. The human theorizes. The agent never generates candidate theories unless explicitly asked.

### Scaffold Workflow

Run these phases sequentially. Do not skip. Do not race ahead. Do not offer analysis the user hasn't asked for.

#### Phase 1: Raw Situation

Ask:
- What phenomenon are you trying to explain?
- State it without any theoretical language. Just the observations.

Do not let the user smuggle in their current encoding. If they say "I'm trying to explain quantum gravity," ask: "What observations would a theory of quantum gravity need to account for?" Push to the pre-theoretic.

#### Phase 2: Current Representation Audit

Ask:
- How are you currently encoding this problem?
- What are the objects? The relations? The operations?
- What does this representation make easy to see?
- What does it make invisible?
- When did you adopt this representation? Was it chosen or inherited?

Label the representation: isomorphic (information-preserving) or homomorphic (lossy/abstracting).

#### Phase 3: Constraint Map

Ask the user to list constraints in three categories:

| Category | Definition | Prompt |
|----------|-----------|--------|
| Inherited | What the domain requires | "What does existing knowledge say MUST be true?" |
| Discovered | What evidence demands | "What data can you not contradict?" |
| Self-imposed | What you demand of yourself | "What aesthetic or methodological commitments are you unwilling to relax?" |

Then ask: "Which of your self-imposed constraints might be aesthetic commitments masquerading as logical necessities?" This is the Copernicus trap question.

#### Phase 4: Falsification Graveyard

Ask:
- What conjectures have you already considered and rejected?
- What killed each one?
- Did any die because of an aesthetic constraint, not an empirical one?
- What survived, and what property do the survivors share?

If the user has no graveyard, ask: "What's the simplest thing that would kill your current best idea? If nothing can kill it, it's not a theory — it's a belief."

#### Phase 5: Alternative Representation Generation

Prompt the user to generate at least 3 alternative encodings of the problem. For each, ask:
- What becomes visible that was hidden?
- What operations become cheap?
- What invariants emerge?
- What becomes invisible that was visible?

Push for variety: isomorphic vs. homomorphic, geometric vs. algebraic, discrete vs. continuous, causal vs. statistical.

#### Phase 6: Constraint Tightening

For the most promising representation, ask:
- How many degrees of freedom remain?
- What additional constraint would eliminate one?
- Is your constraint set tight enough to force a unique solution?
- If not: what's missing? More data? A different formalism? Relaxation of an aesthetic constraint?

#### Phase 7: Convergence Check

Ask:
- Does the surviving theory make at least one specific, falsifiable prediction?
- What measurement or observation would kill it?
- What does it predict that existing frameworks get wrong?

#### Phase 8: Axiomatic Closure

If the constraint set is tight and the theory survives falsification pressure:
- Ask the user to state the theory as a set of minimal claims
- Ask: "What would you name the central concept, and why?"
- Ask: "What remains underdetermined? Be honest."

If the constraint set is NOT tight, return to Phase 5.

### Scaffold Mode Anti-Patterns

- Agent proposes a theory instead of asking the next question
- Agent accepts "it feels right" as constraint tightening
- Agent lets the user skip the falsification graveyard
- Agent lets the user stay in one representation without generating alternatives
- Agent fails to flag aesthetic constraints masquerading as physical ones

---

## PROTOCOL MODE — Agent-Led Theory Creation

The agent is a co-theorist. It runs the full loop autonomously. The human provides the problem, direction, data, and final judgment.

### Protocol Entry Gate (HARD STOP)

Before entering Protocol Mode, confirm:
1. The problem domain is understood
2. Available data / observations / constraints are identified
3. The literature research path is identified (`literature-search-arxiv` by default for arXiv-relevant domains)
4. The user understands the agent will generate candidate theories that may be wrong
5. The user accepts co-theorist role (direction, judgment calls, final convergence call)

If any of these is unclear, ask the smallest necessary question and stop until confirmed.

### Protocol Workflow

Run this loop. Do not skip steps.

```
STEP 0 — LITERATURE RESEARCH SYNTHESIS (HARD GATE)
Perform literature research before theory generation.
Default to `literature-search-arxiv` for arXiv-relevant domains.
Synthesize the research into:
- Existing frameworks
- Known constraints
- Anomalies and open problems
- Measurement methods
- Falsification standards
- Gaps where a new theory could matter
Do not proceed until the synthesis is complete.

STEP 1 — RAW SITUATION
State the phenomenon in representation-neutral terms.
Strip all theoretical language. Pure observations.

STEP 2 — CURRENT REPRESENTATION
Identify the default encoding. Objects. Relations. Operations. Blind spots.
Label isomorphic vs. homomorphic.

STEP 3 — CONSTRAINT MAP
┌──────────────┬──────────────────────────────────┐
│ Inherited    │ What existing knowledge requires  │
│ Discovered   │ What evidence cannot be violated  │
│ Self-imposed │ What the agent/domain demands     │
└──────────────┴──────────────────────────────────┘
Flag aesthetic constraints that might not be logical necessities.

STEP 4 — ALTERNATIVE GENERATION
Generate at least 3 alternative encodings.
For each: operations cheap, invariants exposed, blind spots, transformation cost.
Use Pearl representation protocol as sub-routine.

STEP 5 — CANDIDATE GENERATION
Within each viable encoding, generate candidate frameworks.
Each candidate must be: internally consistent, constraint-respecting,
and distinguishable from other candidates by at least one prediction.

STEP 6 — FALSIFICATION PASS
For each candidate: what would kill it?
Kill every candidate that:
- Violates an inherited constraint
- Contradicts discovered evidence
- Is internally inconsistent
- Makes no falsifiable prediction
Document each death in the graveyard.

STEP 7 — CONVERGENCE CHECK (HARD GATE)
┌──────────────────────────────────────────────────────┐
│ Is the constraint set tight enough to force          │
│ a unique survivor?                                   │
│                                                      │
│ YES → Proceed to Step 8                              │
│ NO  → Report underdetermination. List remaining      │
│       degrees of freedom. Return to Step 4 or 3.     │
│       DO NOT claim convergence on a loose set.       │
└──────────────────────────────────────────────────────┘

STEP 8 — AXIOMATIC CLOSURE
Output the theory with full provenance.
```

### Protocol Output Contract

Every theory output must include, at minimum:

```markdown
## Theory: [Name]

### Core Claims
[Minimal set of claims. Number them.]

### Literature Research Synthesis
[Sources searched, key papers/frameworks found, constraints extracted, anomalies/open problems identified, and how the synthesis shaped the candidate theory. This is synthesis, not a bibliography dump.]

### Representation-Shift History
[Every encoding traversed, what each made visible, what each obscured]

### Constraint Trace
- Inherited: [list]
- Discovered: [list]
- Self-imposed: [list]
- Key tightening moment: [what constraint eliminated the last alternative]

### Falsification Log (Graveyard)
| Candidate | Date Killed | Killing Condition |
|-----------|------------|-------------------|
| ...       | ...        | ...               |

### Falsifiable Prediction
[At least one specific, measurable claim.
 Include: measurement method, expected value, what value would kill the theory]

### Remaining Underdetermination
[Honest accounting of what the constraint set did NOT force]

### Relationship to Existing Frameworks
[What this theory preserves. What it rejects. What it extends.]
```

### Protocol Mode Anti-Patterns

- Skipping the literature research synthesis gate before theory generation
- Skipping the convergence gate (claiming convergence on a loose constraint set)
- Generating only one alternative encoding (minimum 3)
- Killing candidates without documenting the killing condition
- Outputting a theory without a falsifiable prediction
- Treating aesthetic preference as constraint tightening
- Failing to flag when the cycle should return to Step 4 vs. Step 3
- Claiming certainty where the constraint set underdetermines

---

## State Machine — The Theory-Creation Engine

This is the operationalized version of the state machine from the seven-case analysis. Use it as the internal model driving both modes.

| State | Cognitive Operation | Trigger → Next State | Detection Signal |
|-------|-------------------|---------------------|------------------|
| **S0: Inherited Representation** | Standard problem-solving within prevailing encoding | Persistent anomaly that the encoding can't resolve → S1 | "This doesn't fit the current framework" |
| **S1: Analogical Projection** | Importing operations from adjacent domains | Analogy breaks under constraint pressure → S2 | "The analogy works for X but fails for Y" |
| **S2: Constraint Overload** | Accumulating conflicting demands | Fatal contradiction discovered → S3 | "These two requirements are mutually exclusive in the current encoding" |
| **S3: Representational Shift** | Re-encoding objects, relations, assumptions | New operations become cheap → S4 | "In this new encoding, what was impossible is now trivial" |
| **S4: Constraint Tightening** | Forcing the new encoding against evidence | Degrees of freedom reach zero → S5 | "Only one framework satisfies all constraints" |
| **S5: Axiomatic Closure** | Theory becomes structurally inevitable | Publication / output | "The theory is the unique survivor of the constraint set" |

### State Detection Rules (Protocol Mode Only)

- S0 → S1: User reports anomaly or the agent detects that the current encoding can't generate a required prediction
- S1 → S2: At least two constraints conflict AND the current encoding can't resolve both
- S2 → S3: At least one alternative encoding makes the conflict vanish
- S3 → S4: The new encoding generates at least one testable prediction the old encoding couldn't
- S4 → S5: All candidates except one are killed by falsification pass

---

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| **literature-search-arxiv** | Required default research path for arXiv-relevant Protocol Mode runs and evals. Its output must be synthesized into existing frameworks, constraints, anomalies, measurement methods, and falsification standards before theory generation. |
| **pearl-representation** | Sub-routine. Used at Step 4 (Alternative Generation) in Protocol Mode and Phase 5 in Scaffold Mode. Theory-creation is the arc; Pearl is the per-shift analysis. |
| **first-principles-thinking** | Identifies fundamental constraints. Feeds Step 3 (Constraint Map). Use FPT when the constraint set is unclear or mixed with convention. |
| **oppus-reasoning-contract** | Enforces claim discipline throughout. Use Oppus to audit whether the theory's claims are properly labeled (fact/inference/hypothesis). |
| **work-backward** | Use when the theory-creation loop stalls. Work-backward diagnoses whether the blockage is a representation problem, a missing constraint, or an aesthetic attachment. |
| **crucible-doctrine** | The theory may need causal model design. Use Crucible to build the SCM if the theory is causal in structure. |

---

## Claim Discipline

Label claims explicitly when their status is ambiguous or high-stakes:

- **[Fact]** — directly observable or established by credible source
- **[Inference]** — reasoned from evidence
- **[Hypothesis]** — proposed but unverified
- **[Constraint]** — binding limit on feasible theory choices
- **[Conjecture]** — candidate killed during falsification pass
- **[Survivor]** — candidate still alive after falsification

Do not present a hypothesis as a fact. Do not call a loose constraint set "tight."

---

## Verification

### For Scaffold Mode

Qualitative review criteria:
- Did the agent ask the Phase questions in order without skipping?
- Did the agent refuse to generate candidate theories unless explicitly asked?
- Did the agent flag aesthetic constraints masquerading as logical ones?
- Did the agent push for at least one falsifiable prediction before closure?

### For Protocol Mode

A Protocol Mode eval is invalid unless it performs literature research first and synthesizes that research into the output. For arXiv-relevant domains, use `literature-search-arxiv` by default. The eval must verify that the literature synthesis affected the constraint map, falsification pass, and remaining underdetermination.

Realistic eval prompts:

**Eval 1 — Domain theory in formalized space**
```
Prompt: "Using /theory-creation protocol mode, generate a theory about why
certain sorting algorithms degrade on nearly-sorted data in ways that
Big-O analysis doesn't predict."
Expected output: Full output contract, including literature research synthesis
from relevant algorithm analysis / adaptive sorting literature. Falsifiable
prediction about specific input distributions and measured runtime deviations.
```

**Eval 2 — Synthetic theory**
```
Prompt: "/theory-creation --protocol. The phenomenon: information
propagation in social networks shows phase-transition behavior
similar to thermodynamic systems. Generate a synthetic theory
connecting these domains."
Expected output: Literature research synthesis from relevant network science,
information diffusion, and statistical physics sources. Representation-shift
history showing how thermodynamic encoding maps onto network encoding. At
least one falsifiable prediction about critical thresholds.
```

**Eval 3 — Negative theory**
```
Prompt: "/theory-creation --protocol. Can a purely feedforward neural
network with fewer than N parameters learn a function that requires
exponential representational capacity? Generate a negative theory."
Expected output: Literature research synthesis from relevant approximation
theory, circuit complexity, and neural network expressivity sources. Formal
constraint map. Proof that constraint set forbids the capability. Clear
statement of boundary conditions.
```

---

## Anti-Patterns (Cross-Mode)

- **Research bypass**: running Protocol Mode or evals without literature research synthesis
- **Citation decoration**: listing papers without extracting constraints, anomalies, measurement methods, and falsification standards
- **Aesthetic piracy**: treating a beautiful representation as true without falsification pressure
- **Premature closure**: declaring convergence before the constraint set is tight
- **Graveyard avoidance**: not tracking killed conjectures
- **Representation monogamy**: staying in one encoding too long
- **The Copernican trap**: shifting representations to preserve an aesthetic constraint, not to satisfy evidence
- **Mode bleed**: scaffold drifting into protocol or vice versa without explicit gate
- **Constraint laundering**: treating self-imposed aesthetic constraints as if they were inherited or discovered
- **Phantom convergence**: claiming the theory is "forced" when alternatives exist but haven't been generated

---

## Final Operating Principle

Theory creation is source-grounded representational transformation under tightening constraints with active falsification pressure within a bounded cognitive workspace.

The skill does not guarantee a correct theory. It guarantees that if a theory survives the full protocol, it has survived more pressure than most theories ever face — and if it dies, the graveyard tells you exactly why.
