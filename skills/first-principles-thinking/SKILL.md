---
name: first-principles-thinking
description: >
  Use first-principles reasoning to decompose problems to fundamentals, challenge assumptions, and rebuild solutions from constraints.
---

# FPT-SKILL.md — First-Principles Thinking Skill

## Purpose
This skill is for rigorous problem decomposition, architecture redesign, and strategic or technical reasoning under real constraints. It is designed to help an AI agent or human reason from what must be true rather than from precedent, analogy, branding, or industry habit.

This skill is not for motivational framing, personality worship, intuition-only decision-making, or replacing empirical validation with confidence. It does not assume public claims by founders, executives, or firms are true unless supported by evidence, mechanism, and external verification.

## Core Definition
First-Principles Thinking is a disciplined method for:
- Identifying inherited assumptions.
- Decomposing a system into fundamental constraints.
- Separating physical, causal, mathematical, economic, and institutional constraints.
- Rebuilding from what must be true rather than what is conventionally done.
- Testing the rebuilt model against evidence and reality.

In operational terms, the skill asks:
- What is actually constrained?
- What is only historically customary?
- What mechanism produces the current outcome?
- What alternative design becomes possible if false assumptions are removed?
- What evidence would confirm or falsify the rebuilt model?

## When to Use This Skill
Use this skill when the task requires escaping inherited assumptions or redesigning a system from fundamentals.

Typical use cases:
- Engineering design.
- Product strategy.
- Research planning.
- Startup strategy.
- Cost reduction.
- Architecture decisions.
- Scientific or technical problem-solving.
- Breaking out of industry assumptions.
- Diagnosing why a system is expensive, slow, fragile, or stagnant.
- Distinguishing physical limits from organizational habit.
- Reframing a problem whose current solutions appear locked into local optima.

## When Not to Use This Skill
Do not use this skill when the cost of deep decomposition exceeds the value of the answer.

Warnings:
- When speed matters more than rigor.
- When the problem is already well-solved and only standard execution is needed.
- When empirical data is missing and cannot be gathered, approximated, or stress-tested.
- When the user only needs execution of a known path.
- When first-principles reasoning would become over-analysis.
- When the domain is so safety-critical that redesign without institutional knowledge would be reckless.
- When regulatory, human, organizational, or safety constraints are being dismissed as “mere convention” without evidence.
- When analogy or heuristics are sufficient because the environment is stable and the stakes are low.

## Inputs Required
Before running this skill, collect the following inputs:
- Problem statement.
- Current assumption or inherited practice.
- Known constraints.
- Available evidence.
- Success criteria.
- Risk tolerance.
- Domain boundaries.
- What can be tested or measured.

Preferred optional inputs:
- Baseline metrics, such as cost, speed, reliability, quality, throughput, error rate, or adoption.
- Existing architecture or process map.
- Known failure history.
- Stakeholder constraints.
- Regulatory environment.
- Time horizon and capital or resource limits.

## Reasoning Protocol
Follow this sequence strictly.

1. **State the problem precisely.**
   - Write the problem in a way that does not smuggle in the current solution.
   - Good: “How can payload reach orbit at lower cost per launch?”
   - Bad: “How can expendable rockets be made slightly cheaper?”

2. **Identify inherited assumptions.**
   - List all explicit and implicit beliefs shaping the current solution.
   - Include technical assumptions, business assumptions, workflow assumptions, and cultural assumptions.

3. **Classify each assumption.**
   Use one of the following labels:
   - Physical constraint.
   - Causal constraint.
   - Mathematical constraint.
   - Economic constraint.
   - Regulatory constraint.
   - Organizational constraint.
   - Historical convention.
   - Market belief.
   - Preference or taste.
   - Unknown.

4. **Decompose the system into fundamentals.**
   - Break the system into components, interfaces, resources, and mechanisms.
   - Analyze materials, energy, information, labor, capital, time, logistics, incentives, and failure dependencies.
   - Ask what each part contributes and what function it actually serves.

5. **Identify what must be true.**
   - Extract irreducible requirements.
   - These may come from physics, mathematics, causal dependencies, legal constraints, safety limits, or core user requirements.
   - Mark each with evidence quality.

6. **Identify what is merely customary.**
   - Detect inherited practices that persist because they are familiar, not necessary.
   - Ask whether the convention is a true constraint, a coordination artifact, a compliance requirement, or legacy inertia.

7. **Rebuild the solution from constraints.**
   - Construct a new model using only validated constraints and required functions.
   - Remove unjustified parts, steps, interfaces, or assumptions.
   - Re-express the design in terms of mechanism, not slogan.

8. **Generate alternative designs or strategies.**
   - Produce at least two to four alternatives.
   - Vary architecture, sequencing, sourcing, interface design, or business model where relevant.
   - Do not stop at the first plausible solution.

9. **Compare alternatives by constraint fit.**
   Evaluate each option by:
   - Physical feasibility.
   - Causal plausibility.
   - Mathematical consistency.
   - Economic viability.
   - Manufacturability or implementability.
   - Organizational burden.
   - Regulatory exposure.
   - Testability.
   - Reversibility.

10. **Define tests, simulations, prototypes, or evidence checks.**
   - Specify the smallest empirical action that meaningfully tests the rebuilt model.
   - Prefer falsifiable checks over confirmatory theater.
   - Use simulation when physics is understood, prototyping when interfaces are uncertain, and live trials when operational reality is the key unknown.

11. **Identify failure modes.**
   - List technical, economic, regulatory, social, organizational, and integration failures.
   - Include second-order effects and subsystem interactions.
   - Ask what could work locally yet fail at the whole-system level.

12. **Decide the smallest next action that can test the rebuilt model.**
   - The next move should reduce uncertainty, not merely advance activity.
   - It should be specific, measurable, and decision-relevant.

## Verification Gates
Every major output must pass these gates.

### Evidence Gate
What evidence supports each claim?
- Cite direct measurements, credible external sources, experiments, technical analyses, or verified operational results.
- Distinguish primary source claims from externally validated facts.

### Constraint Gate
Which constraints are real versus assumed?
- For each constraint, state whether it is physical, causal, mathematical, economic, regulatory, organizational, or merely inherited.
- Do not collapse social or legal constraints into “fake” constraints; they are real if they bind action.

### Causal Gate
What mechanism explains the expected outcome?
- State the causal chain explicitly.
- If the mechanism is unknown, label the claim a hypothesis, not a conclusion.

### Feasibility Gate
Can this be built, tested, or measured?
- Check whether the proposed path is implementable with available resources, capability, and time.
- A theoretically valid idea that cannot be built or tested remains incomplete.

### Risk Gate
What could fail technically, economically, legally, socially, or organizationally?
- Include quality, safety, labor, governance, timeline, and reputational failure modes.
- Account for system coupling and interface failures.

### Reality Gate
What result would falsify the current model?
- Define disconfirming evidence before acting.
- If no possible result could disprove the model, the reasoning is not disciplined enough.

## Claim Discipline
Label every major claim using one of these categories:
- **Fact** — directly supported by credible evidence.
- **Assumption** — treated as true for reasoning purposes but not yet verified.
- **Constraint** — a binding limit on feasible action.
- **Inference** — a reasoned interpretation drawn from evidence.
- **Hypothesis** — a testable proposed explanation or design claim.
- **Tested conclusion** — a claim supported by direct experiment, implementation, or observed results.
- **Open uncertainty** — an unresolved issue or missing variable.

Minimum discipline rules:
- Never present an assumption as a fact.
- Never present analogy as proof.
- Never present a founder or company statement as validated truth without external support.
- Never present a prototype result as proof of scalable success.
- Never present a local optimization as a system-level win without checking whole-system effects.

## Output Format
Use this exact structure when producing an analysis.

### First-Principles Analysis
**Problem:**  
**Inherited assumptions:**  
**Fundamental constraints:**  
**What must be true:**  
**What is merely conventional:**  
**Rebuilt model:**  
**Options generated:**  
**Recommended next move:**  
**Verification plan:**  
**Failure modes:**  
**Residual uncertainty:**  

## Examples

### 1. Engineering Example Inspired by SpaceX
**Problem:** Launch costs are too high for broad access to space.

**Inherited assumption:** Rockets must be extremely expensive and mostly disposable.

**Decomposition:**
- Materials.
- Manufacturing.
- Engine design.
- Launch operations.
- Supply chain.
- Reliability requirements.
- Reusability.

**Rebuilt path:**
- Treat expendability as a convention, not a law of physics.
- Reduce supplier and interface overhead through vertical integration where bottlenecks dominate.
- Design reusable boosters if recovery and refurbishment economics beat rebuild economics.
- Use iterative testing to expose real failure modes.

**Mechanism:** If major hardware can be recovered, reflown, and inspected at acceptable reliability, fixed hardware costs can be amortized across missions rather than paid once per launch.

**Caution:** Reusability only works if refurbishment burden, operational cadence, and safety qualification support the economic model.

### 2. Product/Manufacturing Example Inspired by Tesla
**Problem:** Electric vehicles are perceived as low-range, niche, and undesirable.

**Inherited assumption:** EVs must trade off desirability, range, and performance.

**Decomposition:**
- Battery cost.
- Cell chemistry.
- Pack architecture.
- Drive performance.
- Charging access.
- Software.
- Manufacturing scale.
- Distribution model.

**Rebuilt path:**
- Attack battery cost through scale, process learning, and architecture decisions.
- Design the vehicle as a software-defined system, not just a hardware product.
- Build charging infrastructure if network absence is a binding adoption constraint.
- Position around performance and usability, not only environmental virtue.

**Mechanism:** If battery cost declines with scale and learning while charging and software improve user experience, EVs can move from niche compromise to competitive mainstream product.

**Caution:** Product-level first principles do not remove manufacturing bottlenecks, quality-control problems, labor strain, or regulatory scrutiny.

### 3. Research Example
**Problem:** A field relies on a dominant metric that may not capture the target phenomenon.

**Inherited assumption:** The standard metric is a sufficient proxy for the underlying construct.

**Decomposition:**
- Construct validity.
- Measurement error.
- Causal mechanism.
- Alternative explanations.
- Sampling bias.
- External validity.

**Rebuilt path:**
- Re-derive the research question from the underlying mechanism, not from the inherited metric.
- Define a sharper hypothesis.
- Introduce alternative measures and explicit falsification criteria.
- Separate explanatory adequacy from convention-driven publishing norms.

**Mechanism:** Better causal alignment between construct, measurement, and hypothesis improves explanatory power and reduces false confidence in proxy metrics.

**Caution:** A better theory can still fail if it is under-measured, underpowered, or operationally infeasible.

### 4. Strategy Example
**Problem:** An industry assumes incumbents define the feasible business model.

**Inherited assumption:** Existing distribution, pricing, and service structures define what is commercially possible.

**Decomposition:**
- Customer need.
- Cost structure.
- Bottlenecks.
- Distribution.
- Regulation.
- Switching costs.
- Capability requirements.
- Time to learn.

**Rebuilt path:**
- Identify which parts of the incumbent model are genuine requirements versus legacy coordination artifacts.
- Reconstruct the business model around the true bottlenecks and willingness to pay.
- Design a narrow initial wedge where the alternative model is testable and economically coherent.

**Mechanism:** When incumbents carry legacy overhead or outdated interfaces, a redesigned model can serve the same need with different economics and faster learning loops.

**Caution:** Strategic novelty without operational capability collapses under execution reality.

## Common Failure Modes
- Mistaking personal confidence for first principles.
- Ignoring empirical evidence.
- Dismissing human, regulatory, or organizational constraints as fake.
- Over-reducing complex systems.
- Treating analogy as proof.
- Skipping verification.
- Using “first principles” as branding.
- Optimizing one subsystem while damaging the whole system.
- Confusing “novel” with “true.”
- Confusing “possible” with “practical.”
- Rebuilding from an incomplete causal model.
- Mistaking cost decomposition for full system understanding.
- Scaling before failure modes are understood.
- Forgetting that institutional knowledge sometimes encodes real failure history.

## Relationship to Other Methods
First-Principles Thinking can integrate with several adjacent methods, but it is not identical to any of them.

- **Analogical reasoning:** Uses similarity to prior cases. Faster, but inherits the constraint set of the reference case. FPT asks whether the reference case is fundamentally necessary.
- **Root-cause analysis:** Traces why a failure happened. Useful for diagnosis. FPT is broader and generative; it can redesign the system before or after failure.
- **Systems engineering:** Manages components, interfaces, requirements, and tradeoffs in complex systems. Highly complementary. FPT helps question inherited architectures; systems engineering helps implement and validate them.
- **Design thinking:** Centers user needs, experience, and desirability. Useful for product fit. FPT goes deeper into physical, causal, and structural constraints.
- **Lean startup:** Emphasizes fast iteration and testing under uncertainty. Useful for market learning. FPT adds stronger mechanism-level decomposition before iteration.
- **Causal reasoning:** Focuses on mechanisms that produce outcomes. This is a core ingredient of FPT, but FPT also includes constraint decomposition and reconstruction.
- **Engineering optimization:** Finds the best solution within defined constraints. FPT asks whether the constraints themselves are correctly defined.

Use these methods together when appropriate:
- FPT to question the problem frame.
- Systems engineering to manage complexity.
- Root-cause analysis to diagnose failures.
- Optimization to improve within validated constraints.
- Lean experimentation to test uncertain assumptions quickly.
- Design thinking to ensure the rebuilt system remains humanly usable.

## Musk / SpaceX / Tesla Pattern Extraction
Use the cases only as mechanism-rich examples of how the skill can operate under industrial conditions.

Reusable pattern:
- Challenge inherited assumptions.
- Decompose cost and performance drivers.
- Separate physics from convention.
- Vertically integrate where interfaces are bottlenecks.
- Prototype and test aggressively.
- Use failure as feedback.
- Rebuild around fundamental constraints.
- Scale after learning.

Operational lessons extracted from those cases:
- Cost reduction often comes from redesigning architecture and interfaces, not merely negotiating prices.
- Vertical integration is useful when supplier interfaces hide cost, slow learning, or block design iteration.
- Rapid iteration is valuable only when paired with strong mechanism-level reasoning and disciplined feedback.
- Physical testing is mandatory because first-pass models are incomplete.
- Ambitious redesign can create quality, safety, labor, timeline, and governance risks if execution outruns understanding.
- First-principles reasoning does not eliminate the need for institutional knowledge, operational discipline, or compliance reality.
- Reality testing is mandatory.

## Final Operating Principle
Do not ask first what others do. Ask what must be true, what is actually constrained, what can be rebuilt, and what evidence would prove or disprove the rebuilt model.
