---
name: pearl-representation
description: >
  Use Judea Pearl-style representation analysis to re-encode a problem, expose invariants, make operations natural, and reduce search.
---

# /represent — Pearl Representation Skill

## Purpose

This skill operationalizes Judea Pearl's core doctrine from *The Mystery of Problem Representations* (1972) as a repeatable reasoning protocol.

Pearl's central claim: a problem is not only its external facts. A problem is also the **representation** through which a solver sees it. A representation is not a neutral wrapper — it changes what can be noticed, what operations are cheap, what invariants become visible, and whether a solution appears difficult or obvious.

This skill is not for passive summary, jargon decoration, or shallow metaphor. It is for actively transforming how a problem is encoded so that reasoning and action become more powerful.

---

## Core Definition

The Pearl representation loop:

```txt
raw situation → representation → operations made natural → invariants exposed → search reduced
```

In operational terms, the skill asks:

1. **What is the raw situation**, stated without smuggling in the current encoding?
2. **What representation is currently applied** (implicitly or explicitly)?
3. **What operations does this representation make natural or expensive?**
4. **What invariants does this representation expose or hide?**
5. **What search paths does it open or close?**
6. **What alternative representation would better fit the problem, the processor, and the goal?**

---

## When to Use This Skill

Use when the encoding of a problem matters as much as the content.

Concrete triggers:

- Architecture design (system, UI, data, cognitive workspace)
- Causal model design (Crucible / SCM work)
- AI system evaluation (what does this system's representation make easy/hard?)
- Interface critique (what does this screen/panel make visible/hidden?)
- Skill or protocol design (what should this skill force into view?)
- Strategy reframing (what if the problem is re-encoded?)
- Debugging stalled reasoning ("we've been stuck because we're encoding this wrong")
- Evaluating whether a model, abstraction, or summary is faithful to the task
- Designing a new cognitive operation or agent capability
- Any task where Pearl's criteria — processor fit, search reduction, invariant exposure — are the right lens

### When NOT to Use

- Routine execution that needs no representation change
- Simple factual lookup
- Tasks where speed matters more than encoding analysis
- Problems already well-solved in their current representation
- Casual conversation

---

## Enforcement Gate

Every output must include **at minimum**:

1. **Raw situation** — stated without the current representation
2. **Current representation identified** — what encoding is in use (implicit or explicit)
3. **At least one alternative representation** — isomorphic or homomorphic
4. **Operations analysis** — what each representation makes natural or expensive
5. **At least one invariant** — exposed or hidden by each representation
6. **Search-reduction judgment** — which representation reduces unnecessary search
7. **Recommendation** — which representation to use, and for what goal

If any of these seven elements is missing, the skill has not been applied. A representation critique without an alternative is incomplete. An alternative without an invariant analysis is decoration.

---

## Protocol

### Stage 1 — State the raw situation

Restate the problem in a form that does **not** smuggle in the current encoding.

Good: "A user needs to understand the dependency chain of a failing deployment."
Bad: "The dashboard should show a pipeline graph."

Good: "A reasoning agent needs to track which claims depend on which assumptions."
Bad: "We need a provenance tree."

The raw situation should be representation-neutral.

### Stage 2 — Identify the current representation

What encoding is currently in use?

Ask:

- What counts as an object?
- What counts as a relation?
- What distinctions are preserved?
- What distinctions are collapsed?
- What operations are built in?
- What is made visible? Hidden?
- Is this representation isomorphic (information-preserving) or homomorphic (lossy/abstracting)?

Label the representation type:

| Type | Meaning |
|------|---------|
| **Isomorphic** | One-to-one mapping. Information-preserving. Changes operational accessibility but not information content. |
| **Homomorphic** | Lossy abstraction. Many source states → fewer representational categories. Useful when discarded detail is task-irrelevant. Dangerous when it is not. |

### Stage 3 — Generate alternative representations

Produce at least 2–3 alternatives. Vary:

- Isomorphic vs. homomorphic
- What becomes visible vs. hidden
- What operations become cheap vs. expensive
- Graph vs. table vs. sequence vs. causal model vs. invariant-based vs. operational

Do not stop at the first plausible alternative.

### Stage 4 — Evaluate each representation

For each representation, answer:

| Criterion | Question |
|-----------|----------|
| **Operations cheap** | What moves does this representation make natural? |
| **Operations expensive** | What moves become harder? |
| **Invariants exposed** | What stable properties become visible? |
| **Invariants hidden** | What stable properties disappear from view? |
| **Search reduced** | What unnecessary exploration is collapsed or removed? |
| **Processor fit** | Does this representation align with how the solver (human, agent, system) actually operates? |
| **Distinctions preserved** | Does this representation keep separate what must be kept separate? |
| **Distinctions collapsed** | What useful differences are lost? |
| **Transformation cost** | What does it cost to encode the problem this way? |

### Stage 5 — Judge by Pearl's criteria

Apply Pearl's checklist. A representation is strong when it:

1. Preserves task-relevant distinctions
2. Discards task-irrelevant detail
3. Makes important relations explicit
4. Matches the processor's operations
5. Reduces search burden
6. Reveals invariants
7. Factorizes the problem (breaks entangled operations into separable ones)

### Stage 6 — Recommend

Name:

- **Best representation for the stated goal**
- **What is gained** compared to the current/default
- **What is lost** (honesty about tradeoffs)
- **When to switch representations** (trigger conditions)

### Stage 7 — Define verification

How would you test that the recommended representation actually improves reasoning, action, or system behavior?

Prefer falsifiable checks. If the representation is for a human cognitive workspace, test with a concrete scenario. If for a system, test with a boundary case. If for an AI agent, test whether the agent makes better decisions under the new encoding.

---

## Output Format

Use this structure when producing analysis.

### Representation Analysis

**Raw situation:**
**Current representation:**
**Current representation type:** (isomorphic / homomorphic)
**What the current representation does well:**
**What the current representation hides or makes expensive:**

**Alternative 1:**
- Type: (isomorphic / homomorphic)
- Operations cheap:
- Operations expensive:
- Invariants exposed:
- Invariants hidden:
- Search reduced:
- Transformation cost:

**Alternative 2:**
- Type:
- Operations cheap:
- Operations expensive:
- Invariants exposed:
- Invariants hidden:
- Search reduced:
- Transformation cost:

*(Repeat for additional alternatives)*

**Evaluation matrix:**

| Criterion | Current | Alt 1 | Alt 2 | ... |
|-----------|---------|-------|-------|-----|
| Task-relevant distinctions preserved | | | | |
| Task-irrelevant detail discarded | | | | |
| Important relations explicit | | | | |
| Processor fit | | | | |
| Search reduction | | | | |
| Invariants visible | | | | |
| Factorization | | | | |
| Transformation cost | | | | |

**Recommendation:**

**What is gained:**
**What is lost:**
**When to switch:**
**Verification:**

---

## Claim Discipline

Label claims explicitly when their status is ambiguous or high-stakes:

- **[Fact]** — directly observable or established by credible source
- **[Inference]** — reasoned from evidence
- **[Hypothesis]** — proposed but unverified representation claim
- **[Constraint]** — binding limit on feasible representation choices
- **[Recommendation]** — suggested encoding choice

Do not present an untested representation as proven. Do not confuse elegance with correctness.

---

## Depth Levels

### Quick

- Identify current representation
- Generate one alternative
- Brief operations/invariant analysis
- Short recommendation

Use for rapid reframing during active work.

### Strict (default)

- Full protocol: raw situation → current → 2+ alternatives → evaluation matrix → recommendation → verification
- Isomorphic/homomorphic classification
- Pearl criteria checklist applied

Use for architecture, system design, or any task where encoding choice has downstream consequences.

### Max

- Everything in Strict
- At least 3 alternatives
- Causal analysis (what mechanisms does each representation imply?)
- Relationship to adjacent skills (first-principles-thinking, oppus-reasoning-contract)
- Historical precedent or Pearl paper reference where relevant
- Failure-mode analysis (what errors does each representation invite?)

Use for foundational architecture, skill design, Crucible causal modeling, or when the stakes of wrong encoding are high.

---

## Relationship to Other Skills

### first-principles-thinking

FPT decomposes constraints; this skill asks how to **encode** them. They are natural pairs:

- FPT: "What must be true? What is merely conventional?"
- Pearl: "What representation makes the true constraints visible and the conventions obviously discardable?"

Use FPT first to identify constraints, then `/represent` to design the encoding.

### oppus-reasoning-contract

Oppus enforces reasoning discipline. Pearl representation can be applied as one component of an Oppus analysis — specifically as a way to audit whether the reasoning's representational assumptions are sound.

### crucible-doctrine

Crucible designs causal interfaces. Pearl representation is the theoretical foundation for Crucible's interface design choices. Every Crucible screen, panel, or cognitive tool is a representation choice. This skill is the method for auditing and designing those choices.

---

## Anti-Patterns

- Naming a representation without analyzing what operations it makes natural
- Offering only one alternative (the skill requires at least one)
- Recommending a representation because it is elegant, without checking processor fit
- Collapsing isomorphic and homomorphic transformations into "it's just different"
- Claiming a representation is "better" without naming what is lost
- Applying heavy representation analysis to trivial encoding choices
- Using "representation" as a synonym for "description" or "summary"
- Treating a representation as universally good without specifying the goal and processor

---

## Examples

### Example 1 — Agent memory representation

**Raw situation:** An AI agent needs to carry forward context across sessions without losing what matters.

**Current representation:** Narrative journal — chronological prose log of turns, actions, and summaries.

**Analysis:** The narrative journal is homomorphic (lossy). It discards exact tool outputs and precise dependency structure. It preserves chronology and human readability but makes dependency tracing expensive.

**Alternative 1 — Structured artifact graph (isomorphic):** Nodes for actions, decisions, facts, uncertainties. Edges for dependencies, provenance, and temporal ordering.

- Operations cheap: dependency tracing, fact validity checking, contradiction detection
- Invariants exposed: provenance chains, unresolved uncertainties
- Transformation cost: high (requires structured encoding at each turn)

**Alternative 2 — Causal belief state (homomorphic):** A compact model of what the agent believes, why, and with what confidence. Discards raw tool outputs.

- Operations cheap: decision-making under uncertainty, explanation generation
- Invariants exposed: belief stability, evidence quality
- Search reduced: eliminates replay of raw transcripts

**Recommendation:** Structured artifact graph for reproducibility and debugging; causal belief state for fast decision-making. Use both: graph as ground truth, belief state as working model.

### Example 2 — Crucible interface representation

**Raw situation:** A user needs to understand the causal structure of a system and intervene.

**Current representation:** Flat property panel with input fields.

**Analysis:** Flat panels hide causal relations. The user must mentally reconstruct how variables depend on each other. Operations natural: editing single values. Operations expensive: tracing intervention effects.

**Alternative — Causal graph with do-calculus intervention nodes:** Nodes represent variables. Directed edges represent causal influence. Intervention points allow the user to set variables and see propagated effects.

- Operations cheap: intervention reasoning, counterfactual exploration
- Invariants exposed: Markov boundaries, causal sufficiency, confounding structure
- Search reduced: eliminates the cognitive burden of mentally tracking dependency chains

**Recommendation:** Causal graph for causal reasoning tasks. Flat panel for quick single-value edits. Context decides.

---

## Final Operating Principle

Do not accept the first encoding of a problem.

Ask what representation is in use.
Ask what it makes easy and what it hides.
Generate alternatives.
Evaluate by operations, invariants, search, and processor fit.
Recommend the representation that makes the real problem tractable.

The right representation can collapse search, expose invariants, and turn an impossible-looking problem into a solvable one. The wrong representation can make a simple problem look intractable. Most reasoning failures are not failures of intelligence — they are failures of encoding.
