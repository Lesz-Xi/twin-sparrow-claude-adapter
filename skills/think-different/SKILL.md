---
name: think-different
description: >
  Converge product, design, strategy, interface, platform, feature-set, and experience questions into a coherent Twin-Sparrow product decision. Use when the work requires identifying the user-visible transformation, escaping an inherited category, finding product soul, integrating fragmented paths, making a necessary cut, or testing whether a concept is coherent rather than feature-stacked. Produces a reviewable decision with representation, evidence, tradeoff, acceptance test, and next move.
---

# Think Different: Product Convergence

## Purpose

Turn a fragmented product idea into one coherent, reviewable decision about:

- the user-visible transformation
- the representation that makes it possible
- the real object being designed
- what belongs in one path
- what must be cut
- what the decision costs
- how the decision will be tested

The skill changes the representation of a product problem before adding machinery. It starts with the experience the user should gain, works backward into interface and system consequences, and converges on one decision that can reject otherwise attractive features.

This is a Twin-Sparrow product-convergence protocol. It is not a persona skill, a Steve Jobs imitation skill, a generic brainstorming method, or a substitute for implementation and architecture review.

## Product soul

> Turn feature pressure into one testable product decision organized around the user's lived transformation.

If a response does not help include, exclude, integrate, or test something, it has not converged.

## Enforcement gate

Before using this skill, verify all applicable conditions:

1. **Product-representation task**
   - The user is asking about product, design, strategy, interface, platform, feature set, positioning, workflow, or experience coherence.

2. **Representation matters**
   - The inherited category, product boundary, feature framing, or user journey may be obscuring the real operation.
   - If the user only needs implementation, debugging, formatting, or factual lookup, do not activate this skill unless reframing is explicitly requested.

3. **Enough context to converge**
   - The user, burden, desired change, and decision surface are sufficiently clear.
   - If one missing criterion blocks a responsible reframe, ask the smallest necessary question and stop.

4. **No persona imitation**
   - Do not imitate Steve Jobs's voice, temperament, biography, charisma, cruelty, rhetoric, or stagecraft.

5. **Evidence boundary respected**
   - Distinguish fact, inference, and hypothesis when the distinction affects the decision.
   - Do not turn historical anecdotes, aesthetic preference, or product mythology into evidence.

6. **Cut required when coherence requires it**
   - A substantial reframe must identify what should be removed, hidden, delayed, rejected, or kept separate.
   - Do not invent a cut merely to satisfy the format; explain when the current boundary is already correct.

7. **Tradeoff required**
   - Every recommended representation must name what it hides, worsens, excludes, risks, or makes more expensive.

8. **Decision must be testable**
   - End with an observable acceptance test and one concrete next move.

## Doctrine boundaries

This skill owns:

- the customer-visible transformation
- product soul
- category collapse or preservation
- focus and cuts
- user-benefiting integration
- convergence on one product decision
- product-level tradeoffs and acceptance criteria

This skill does not absorb adjacent Twin-Sparrow doctrines:

- **`pearl-representation`** owns representation-critical analysis of invariants, encodings, causal structure, search reduction, and operation fit.
- **`twin-sparrow-taste`** owns Twin-Sparrow identity and truth-bearing judgment about hierarchy, pacing, atmosphere, provenance, trust, and cognitive load.
- **Architecture and engineering skills** own implementation design, correctness, reliability, security, and code quality.
- **Research skills** own literature search, source synthesis, and evidence adjudication.

Invoke or hand off to an adjacent skill only when its enforcement gate is materially met. Do not reproduce all neighboring doctrine inside this skill.

## Twin-Sparrow infrastructure gate

When the product concerns an agent, cognitive workspace, research environment, or long-running human–AI system, consider four independent primitives:

1. **Context infrastructure**
   - Use when raw sources, logs, transcripts, or tool output would otherwise become prompt or interface mass.
   - Prefer indexed retrieval and evidence rehydration over transcript replay.

2. **Bounded delegation**
   - Use when separate roles need distinct tools, context, output contracts, or escalation rules.
   - Do not represent every internal step as another visible agent.

3. **Categorized memory**
   - Use when facts, preferences, corrections, failures, conventions, procedures, or sessions must persist differently.
   - Memory is context, not authority; current evidence and user correction outrank recall.

4. **Reviewable planning**
   - Use when human annotation or approval can materially change a consequential plan, specification, diff, or agent output.
   - Make the decision inspectable rather than burying it in disposable conversation.

Apply only the primitives that reduce burden or improve judgment. Never collapse them into a generic `agent state`, assistant panel, or feature bundle.

## Convergence protocol

Use the smallest sequence that can produce a responsible decision. Do not mechanically expand every step when a compact verdict is enough.

### 1. Name the inherited representation

Identify the category currently controlling the design.

Ask:

- What does the team or market assume this product is?
- Which feature list, interface convention, metric, or industry boundary follows from that assumption?
- What does this representation make easy to see, and what does it hide?

Examples:

- “AI notes app”
- “observability dashboard”
- “chatbot with tools”
- “CRM plus calendar plus email”

### 2. Name the lived transformation

Describe the change in the user's world without naming product machinery.

Ask:

- What becomes possible, easier, safer, clearer, or more trustworthy?
- What uncertainty, repetition, or coordination burden disappears?
- Where does the current product make the user serve the system?

A valid transformation is observable enough to test. “A magical experience” is not a transformation.

### 3. Identify the real object of design

Determine what is actually being shaped:

- loop
- operation
- decision
- trust relation
- protocol
- source object
- creative act
- review surface
- instrument
- platform baseline

Rename the object when the inherited product category is wrong.

### 4. Make the representation decision

Choose the representation that makes the desired user operation natural while preserving necessary control and distinctions.

Ask:

- What should become the primary object on the screen or in the workflow?
- What operation should become cheap and obvious?
- Which invariants must remain visible?
- What search, translation, or coordination can disappear?

If this step requires substantial invariant analysis, causal encoding, or processor-fit reasoning, invoke `pearl-representation` rather than approximating it loosely.

### 5. Define product soul

Write one sentence naming the user-visible transformation and decision boundary.

A product-soul statement must:

- describe a change for the user
- guide inclusion and exclusion
- reject at least one plausible feature or behavior
- avoid unsupported superiority claims

Good shape:

> A private research instrument that turns scattered evidence into one inspectable next hypothesis.

Bad shape:

> The smartest and most magical research platform ever built.

### 6. Choose operations

Apply only the operations that materially improve the decision.

#### Collapse the category

Collapse categories only when one simplifying primitive makes the combined experience easier.

- Good: three tools become one review loop.
- Failure: feature pile-up relabeled as integration.

#### Make machinery recede

Remove infrastructure burden from the user's primary path while preserving necessary agency, provenance, interoperability, repairability, and auditability.

- Good: replace configuration-first onboarding with one truthful first action.
- Failure: hide controls the user needs to understand failure or regain agency.

#### Integrate the lived path

Join parts when the user experiences them as one end-to-end outcome and the boundary creates avoidable drag.

- Good: capture, interpretation, and accountable action become one inspectable path.
- Failure: integration primarily increases vendor control or lock-in.

#### Raise the baseline

Turn a burden every user repeatedly rebuilds into a stable capability, interface primitive, API, template, or invariant.

- Good: make provenance a default property of generated claims.
- Failure: impose a costly platform before the repeated need is established.

#### Use focus negatively

Remove attractive options that weaken the central experience, even when they are individually defensible.

- Good: defer a secondary user type that breaks the primary loop.
- Failure: confuse personal taste, impatience, or minimalism with strategy.

#### Preserve a boundary

Do not collapse or integrate when separation protects trust, control, specialization, reversibility, or comprehension.

- Good: keep durable memory separate from current evidence.
- Failure: assume every boundary is fragmentation.

#### Use taste operationally

Apply taste only where form changes comprehension, trust, provenance, pacing, or cognitive load.

- Good: make uncertainty legible through hierarchy and interaction.
- Failure: use beautiful obscurity to hide missing evidence or controls.

If taste becomes a central product-identity decision, invoke `twin-sparrow-taste`.

### 7. Name cuts and integrations

State the consequence of the representation.

Cuts may include:

- features
- modes
- panels
- user types
- configuration
- exposed machinery
- premature platform capabilities
- duplicated paths

Integrations may include:

- steps the user experiences as one operation
- evidence with the claim it supports
- plan with review and approval
- action with provenance and reversibility

Every integration needs a user-burden argument. Every cut needs a coherence argument.

### 8. State infrastructure consequences

For agent and cognitive-workspace products, name only the relevant consequences across context, delegation, memory, and reviewable planning.

Keep these primitives separate. A product decision may require one, several, or none of them.

### 9. Mark evidence and uncertainty

When stakes or uncertainty warrant it, label consequential claims:

- **Fact** — supported by current evidence
- **Inference** — best explanation of available evidence
- **Hypothesis** — plausible product claim requiring a test

Do not let a vivid product story outrun evidence.

### 10. State the tradeoff

Name what the new representation makes harder, less visible, excluded, or more costly.

Common tradeoffs:

- lock-in
- loss of expert control
- reduced flexibility
- migration cost
- operational load
- delayed secondary use cases
- adoption friction
- pricing pressure
- hidden failure modes
- dependence on memory or automation
- increased provenance burden

A representation with no acknowledged tradeoff is incomplete.

### 11. Define the acceptance test

Name the observable result that would support or falsify the decision.

Prefer behavioral evidence:

- Can a target user complete the central loop without switching modes?
- Can they identify the evidence behind a consequential claim?
- Does the new path reduce time, search, corrections, or abandoned work?
- Can the product-soul statement consistently reject proposed features?

Avoid acceptance tests that merely confirm implementation exists.

### 12. Give one next move

Choose one concrete artifact or experiment:

- prototype one central loop
- create a decision artifact
- run a user test
- remove one mode behind a feature flag
- map one end-to-end path
- compare two representations against the acceptance test

Do not end with a backlog disguised as a next step.

## Decision artifact

Use this full structure when the decision is substantial:

```md
## Inherited representation
...

## Lived transformation
...

## Real object of design
...

## Representation decision
...

## Product soul
...

## Operations applied
- ...

## Cuts
- ...

## Integrations
- ...

## Infrastructure consequences
- Context: ...
- Delegation: ...
- Memory: ...
- Reviewable planning: ...

## Evidence status
- Fact: ...
- Inference: ...
- Hypothesis: ...

## Tradeoff
...

## Acceptance test
...

## Next move
...
```

Omit empty infrastructure and evidence categories rather than manufacturing content.

## Quick verdict

For narrow evaluations, compress to:

```md
Verdict: ...
Why:
- ...
Product soul: ...
Main cut: ...
Tradeoff: ...
Acceptance test: ...
Next move: ...
```

## Implementation handoff

When the decision is ready to build, add:

```md
## Product decision
...

## Interface consequence
...

## Data / system consequence
...

## Preserved controls and provenance
...

## Acceptance check
...
```

This handoff defines product intent. It does not replace architecture review, implementation planning, tests, or verification.

## Historical source boundary

Historical product material may inform an operation, but it does not govern Twin-Sparrow doctrine.

Optional provenance vault:

`/Users/lesz/.twin-sparrow/agent/memory/Representation/Steve Jobs`

Currently safe source groups:

- 1984 Macintosh Boston Computer Society transcript
- 1988 NeXT introduction transcript
- 1997 WWDC transcript
- 2001 iPod Apple press release
- 2007 iPhone timestamped transcript

Do not use these as verified doctrine unless separately sourced:

- “bicycle for our minds” exact quote
- Apple II kitchen/living-room wording
- Catmull/Pixar “Steve didn’t interfere” wording
- exact 2001 Digital Hub keynote wording
- exact 2008 App Store revenue wording
- iPad exact third-category wording without a primary timestamp
- Folklore.org claims without story-level URLs

When historical accuracy matters, load the relevant vault note before citing it. Otherwise use the operations without historical quotation or personality attribution.

Current evidence, the user's lived context, and Twin-Sparrow's operating doctrine outrank historical analogy.

## Quality bar

A strong response must:

1. identify the inherited representation
2. name the user's lived transformation
3. identify the real object of design
4. make an explicit representation decision
5. define product soul in a way that can reject features
6. apply only relevant operations
7. name a cut or explain why preserving the boundary is correct
8. justify each integration through reduced user burden
9. keep context, delegation, memory, and planning distinct when they apply
10. distinguish evidence from inference and hypothesis when stakes warrant it
11. state at least one tradeoff
12. define an observable acceptance test
13. give one concrete next move

## Failure modes

Reject outputs that:

- imitate Steve Jobs or use historical mythology as authority
- praise simplicity without identifying what changes or disappears
- add features before identifying the lived transformation
- collapse categories without a simplifying primitive
- integrate parts for vendor benefit rather than user benefit
- hide machinery by destroying agency, provenance, or reversibility
- collapse context, delegation, memory, and planning into generic agent state
- duplicate `pearl-representation` or `twin-sparrow-taste` instead of respecting their boundaries
- produce product-soul slogans with no exclusion power
- treat aesthetic coherence as evidence
- state no tradeoff
- use implementation completion as the only acceptance test
- end with multiple speculative initiatives instead of one next move

## Verification prompts

Use these prompts to test the skill:

1. **Cluttered AI notes app**
   - Prompt: “Use `/think-different` on this AI notes app: chat, folders, graph view, meeting recorder, task manager, PDF reader, and daily journal.”
   - Expected: reframes the feature bundle into one lived loop, cuts at least two modes or features, identifies the real object, names cognitive-load or lock-in risk, and defines a behavioral test.

2. **Developer operations product**
   - Prompt: “Reframe this developer tool from a feature list into product soul: logs, traces, deploys, feature flags, alerts, rollback, and cost graphs.”
   - Expected: replaces dashboard sprawl with a coherent operational loop, integrates only steps experienced as one path, preserves necessary controls, and proposes one prototype.

3. **Category-collapse audit**
   - Prompt: “Is this integrated or merely feature-stacked? It combines calendar, CRM, email, analytics, and an AI assistant for freelancers.”
   - Expected: tests for a simplifying primitive, distinguishes user-benefiting integration from vendor bundling, names what should remain separate, and states an adoption or lock-in tradeoff.

4. **Twin-Sparrow cognitive workspace**
   - Prompt: “Design one Twin-Sparrow surface that combines context, memory, sub-agents, and plans.”
   - Expected: rejects a generic all-in-one dashboard, keeps the four infrastructure primitives distinct, organizes them around one operator judgment, invokes adjacent doctrine only if materially required, and creates a reviewable acceptance test.

5. **Boundary preservation**
   - Prompt: “Combine durable memory and current web evidence into one confidence score.”
   - Expected: resists unjustified collapse, explains why current evidence outranks memory, preserves provenance, and proposes a representation that keeps the distinction legible.

6. **Near-miss non-trigger**
   - Prompt: “Fix this TypeScript error in my React component.”
   - Expected: does not activate this skill unless product or interface reframing is explicitly requested.
