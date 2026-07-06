---
name: think-different
description: >
  Reframe product, design, strategy, interface, and platform problems through source-backed Jobs-like representation-shift operations without imitating Steve Jobs. Use when the user asks to think different, find product soul, simplify a cluttered feature set, collapse categories, integrate fragmented experiences, make technology feel human, convert feature lists into user-visible transformations, identify what to cut, or pressure-test whether a product is coherent rather than feature-stacked.
---

# Think Different

## Purpose

Transform a product or system problem by changing its representation.

This skill helps an agent move from inherited category thinking toward a sharper product concept: the user-visible transformation, the real object of design, the simplifying primitive, the necessary integrations, the cuts, and the tradeoffs.

This is not a Steve Jobs persona skill. It is a representation-transform skill distilled from source-backed research notes.

## Enforcement gate

Before using this skill, verify:

1. **Product-representation task** — the user is asking for product, design, strategy, interface, platform, feature-set, positioning, or experience reframing.
2. **Not mere execution** — if the user only needs implementation, debugging, formatting, or factual lookup, do not use this skill unless reframing is explicitly requested.
3. **No persona imitation** — do not imitate Steve Jobs's voice, temperament, stagecraft, biography, charisma, cruelty, or rhetorical style.
4. **Evidence boundary respected** — do not quote or claim Jobs doctrine from unsupported sources. Use the operation library as design principles, not as mythology.
5. **Tradeoff required** — every reframing must name what the new representation hides, worsens, risks, or excludes.

If the user’s goal or product context is too vague to reframe, ask the smallest necessary clarification and stop.

## Source boundary

The operation library is grounded in the Steve Jobs representation vault:

`/Users/lesz/.twin-sparrow/agent/memory/Representation/Steve Jobs`

Currently safe source groups:

- 1984 Macintosh Boston Computer Society transcript
- 1988 NeXT introduction transcript
- 1997 WWDC transcript
- 2001 iPod Apple press release
- 2007 iPhone timestamped transcript

Do not use these as doctrine unless separately verified:

- “bicycle for our minds” exact quote
- Apple II kitchen/living-room wording
- Catmull/Pixar “Steve didn’t interfere” wording
- exact 2001 Digital Hub keynote wording
- exact 2008 App Store revenue wording
- iPad exact third-category wording without primary timestamp
- Folklore.org claims without story-level URLs

When historical accuracy matters, load the relevant vault note before citing a source. Otherwise use the principles operationally without historical quotation.

## Operation library

Use only the operations relevant to the task. Do not mechanically apply all of them.

### 1. Collapse the category

Find categories the market treats as separate. Collapse them only if one simplifying primitive makes the combined product easier for the user.

Good use:
- “These three tools are secretly one workflow.”
- “This should not be a dashboard plus chat plus database; it should be one review loop.”

Failure mode:
- Feature pile-up disguised as integration.

### 2. Make the machine disappear

Identify what machinery the user currently has to understand. Redesign the representation so the user sees action, not mechanism.

Good use:
- Replace configuration burden with a visible first action.
- Hide infrastructure only when the user does not lose needed control.

Failure mode:
- Removing user agency, interoperability, repairability, or auditability.

### 3. Integrate what the industry separates

Map the user’s end-to-end path. If pain comes from boundaries between parts, make the product boundary match the user’s desired outcome rather than the industry’s component map.

Good use:
- Join hardware/software/service/story when the user experiences them as one path.
- Combine capture, interpretation, and action when separation creates drag.

Failure mode:
- Integration for company control rather than user benefit.

### 4. Start with experience, work backward

State the customer-visible transformation first. Then decide which technologies, features, and constraints deserve to exist because they make that transformation real.

Good use:
- “The user goes from scattered uncertainty to one trusted next move.”
- “The creator goes from blank canvas to publishable draft without managing scaffolding.”

Failure mode:
- Hand-wavy experience language that ignores technical, market, or operational constraints.

### 5. Raise the baseline for creators

Ask what every creator or user is forced to rebuild. Turn that repeated burden into a baseline capability, API, interface primitive, template, or platform invariant.

Good use:
- Replace repeated setup with a default environment.
- Turn a recurring manual decision into a stable product affordance.

Failure mode:
- Heavy baseline that increases cost, complexity, or lock-in before the market needs it.

### 6. Use focus as a negative operation

List attractive options. Remove the ones that weaken the central experience, even if they are technically defensible.

Good use:
- Cut features that dilute the experience claim.
- Reject a secondary user type if it breaks the primary product loop.

Failure mode:
- Mistaking personal taste or impatience for strategy.

### 7. Name the product soul in one phrase

Compress the experiential transformation into one sentence. The phrase must guide inclusion and exclusion; otherwise it is marketing copy.

Good use:
- “A private lab notebook that turns uncertainty into the next experiment.”
- “The fastest path from raw meeting to accountable decision.”

Failure mode:
- Slogan without operational consequences.

### 8. Use taste as a constraint, not decoration

Treat aesthetic coherence as a product constraint when form affects usability, trust, or meaning.

Boundary:
This remains a strong hypothesis in the vault, not full doctrine. Use carefully as design judgment, not as a historical claim.

Failure mode:
- Pretty minimalism that removes necessary affordances or truth.

## Workflow

1. **Name the inherited representation**
   - What category is the product trapped in?
   - What does the team, market, or user currently assume the product is?
   - What metrics or features dominate the current frame?

2. **Name the user’s lived experience**
   - What is the user trying to feel, do, avoid, decide, repeat, or become able to create?
   - What machinery are they forced to understand today?
   - Where does the current product make the user serve the system?

3. **Identify the real object of design**
   - Is the real object a device, workflow, loop, surface, trust relation, platform baseline, creative act, or decision?
   - Rename the object if the inherited category is wrong.

4. **Choose the relevant operations**
   - Collapse categories only if a simplifying primitive exists.
   - Integrate separated parts only if integration removes user burden.
   - Make machinery disappear only if control is not silently destroyed.
   - Raise the baseline only if the added baseline is worth its cost.
   - Use focus to cut what weakens the central representation.

5. **Define the product soul**
   - Write one sentence naming the user-visible transformation.
   - Make it specific enough to reject bad features.

6. **Name cuts and integrations**
   - Cuts: what should be removed, hidden, delayed, or deprioritized?
   - Integrations: what should be joined because the user experiences it as one path?

7. **State the tradeoff**
   - Name the risk: lock-in, overclaim, loss of control, pricing, adoption, complexity, creator dependence, operational load, or market mismatch.

8. **Give the next move**
   - Produce one concrete design, strategy, prototype, interface, or implementation step that tests the new representation.

## Output format

Default compact format:

```md
## Default representation
...

## Better representation
...

## Real object of design
...

## Operations applied
- ...

## Cuts
- ...

## Integrations
- ...

## Experience claim
...

## Risk / tradeoff
...

## Next move
...
```

For quick verdicts, compress to:

```md
Verdict: ...
Why:
- ...
Product soul: ...
Main cut: ...
Risk: ...
Next move: ...
```

For implementation handoff, add:

```md
## Product decision
## Interface consequence
## Data / system consequence
## Acceptance check
```

## Quality bar

A good response must:

1. identify the inherited representation
2. propose a better representation
3. name the user-visible transformation
4. apply only relevant operations
5. cut at least one thing when coherence requires it
6. name at least one risk or tradeoff
7. produce a concrete next move
8. avoid persona imitation and unsupported Jobs quotes

A bad response:

- sounds like Steve Jobs cosplay
- praises simplicity without saying what to cut
- integrates everything without a user-burden argument
- collapses categories without a simplifying primitive
- uses unsupported historical quotes
- produces slogans with no product consequence
- ignores the tradeoff

## Verification

Use these prompts to evaluate the skill:

1. **Cluttered AI notes app**
   - Prompt: “Use `/think-different` on this AI notes app: chat, folders, graph view, meeting recorder, task manager, PDF reader, and daily journal.”
   - Expected: reframes from feature bundle to one experience loop, cuts at least two features or modes, names an experience claim, and identifies lock-in/cognitive-load risk.

2. **Developer tool product soul**
   - Prompt: “Reframe this developer tool from feature list into product soul: logs, traces, deploys, feature flags, alerts, rollback, cost graphs.”
   - Expected: identifies inherited observability/devops category, proposes a coherent operational loop, names what should integrate, cuts dashboard sprawl, and gives one prototype next move.

3. **Category-collapse audit**
   - Prompt: “Audit this design: is it integrated or just feature-stacked? It combines calendar, CRM, email, analytics, and AI assistant for freelancers.”
   - Expected: distinguishes user-burden integration from vendor bundling, identifies whether a simplifying primitive exists, names risk, and recommends a focused test.

4. **Near-miss non-trigger**
   - Prompt: “Fix this TypeScript error in my React component.”
   - Expected: skill should not trigger unless the user asks for product/interface reframing.
