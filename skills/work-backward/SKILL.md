---
name: work-backward
description: >
  Use this skill when a problem is stuck, repeatedly patched, confusing, or producing consistent failure, and the user wants to pause, work backward, reason from symptoms, identify the hidden representation, or find the answer already latent in the evidence. Trigger on phrases like "work backward", "pause and work backward", "we may already have the answer", "stop patching", "why does this keep happening", "consistent problem", or when debugging, design, product, research, or life reasoning shows repeated forward motion without causal convergence.
---

# Work Backward

## Purpose

Turn repeated failure into the right representation.

This skill is a reasoning brake. It stops premature forward motion when the agent or user is patching symptoms, adding features, debating surface options, or gathering more information while the decisive evidence may already be present.

The core move is:

> Stop adding motion. Re-read the failure. Identify the representation that makes the observed facts inevitable.

Use this skill to reason backward from a stubborn symptom, contradiction, desired end-state, or invariant until the hidden structure becomes visible enough to guide one concrete next move.

## Enforcement gate

Before using this skill, verify:

1. **Stuckness or repeated motion exists** — there is a recurring failure, repeated patching, persistent confusion, contradictory evidence, or a sense that the current approach is not converging.
2. **Evidence already exists** — there are symptoms, attempts, observations, constraints, logs, screenshots, user reactions, or lived facts to re-weight. If there is no evidence yet, gather the smallest missing observation first.
3. **Representation is likely wrong or incomplete** — the problem may not be lack of effort, but a bad frame, hidden invariant, wrong object of design, or underweighted fact.
4. **Not mere delay** — do not invoke this skill to avoid an obvious implementation step, simple factual lookup, or already-diagnosed fix.
5. **Action resumes after reframing** — the output must end with one concrete next move derived from the backward reasoning.

If the exact failure or available evidence is unclear, ask the smallest necessary clarification and stop.

## When to use

Use this skill when the user says or implies:

- "work backward"
- "pause"
- "we may already have the answer"
- "the answer is in the evidence"
- "stop patching"
- "why does this keep happening?"
- "consistent problem"
- "this keeps failing"
- "we are missing the frame"
- "what representation makes this make sense?"

Also use when the agent notices:

- multiple fixes have failed without changing the failure pattern
- the same symptom returns under different implementations
- the proposed next step is just another patch on the same representation
- design/product debate is circling because the real object of design is unnamed
- research notes contain enough evidence, but no organizing frame
- debugging has many facts but no causal compression

## When not to use

Do not use this skill when:

- the user asks for a simple implementation and the cause is already known
- the task is only formatting, summarization, or factual lookup
- the problem lacks observations and needs basic evidence collection first
- the user explicitly wants free ideation rather than diagnosis
- invoking a pause would add ceremony without improving the next move

## Workflow

### 1. Freeze forward motion

Name the motion that should stop.

Examples:

- "Stop patching overlay behavior."
- "Stop adding more dashboard widgets."
- "Stop debating names before the product loop is clear."
- "Stop collecting more sources until the existing contradiction is explained."

The freeze is temporary. It prevents wasted motion while the representation is repaired.

### 2. Name the exact failure

State the symptom in concrete terms.

Prefer observable language:

- what breaks
- where it breaks
- when it breaks
- what remains true despite attempted fixes
- what the user expected instead

Avoid vague labels like "the architecture is bad" or "the product is unclear" unless they are unpacked into observable failure.

### 3. List the facts already known

Inventory the evidence without interpreting it too early.

Include:

- symptoms
- attempted fixes
- constraints
- invariants
- user preferences
- screenshots/logs/tool results
- design or system facts
- what native or successful patterns avoid doing

Mark uncertainty plainly. Do not inflate guesses into facts.

### 4. Find the underweighted fact

Ask which known fact has not been given enough causal weight.

Useful prompts:

- Which fact keeps appearing but we treat as incidental?
- Which failure is too large to be explained by the current frame?
- Which constraint would make the failed attempts obviously doomed?
- Which native pattern is the system quietly teaching us?
- What would have to be true for all observed facts to be unsurprising?

### 5. Identify the bad forward frame

Name the representation that has been driving failed motion.

Examples:

- "This is an overlay placement problem."
- "This is a feature selection problem."
- "This is a naming problem."
- "This is a need-more-information problem."
- "This is a styling issue."

Then explain why that frame fails to account for the evidence.

### 6. Derive the backward representation

State the better representation: the frame that makes the observed facts coherent.

A good backward representation:

- explains the recurring symptom
- makes failed fixes look predictably insufficient
- names the real object of design or causal structure
- reduces the search space
- points toward a different class of next move

Use this sentence form when helpful:

> The problem is not [forward frame]. The problem is [backward representation].

### 7. Convert representation into one move

Resume action only after the frame changes.

The next move should be:

- concrete
- smaller than a full rebuild when possible
- different in kind from the failed patch loop
- directly implied by the new representation

Examples:

- change compositing architecture rather than tuning overlay behavior
- test the product loop rather than adding another feature
- remove the confusing affordance rather than explaining it better
- inspect the invariant rather than collecting unrelated logs

## Output format

Default format:

```md
## Freeze
Stop doing: ...

## Exact failure
...

## Facts already known
- ...

## Underweighted fact
...

## Bad forward frame
...

## Backward representation
...

## Causal explanation
...

## Next move
...
```

Compact format for quick decisions:

```md
Verdict: pause and work backward.
Known facts:
- ...
Bad frame: ...
Better frame: ...
Stop doing: ...
Next move: ...
```

Implementation handoff format:

```md
## Product / system decision
...

## Architecture consequence
...

## What to remove or stop patching
...

## Acceptance check
...
```

## Example: iTerm sidecar failure

Known facts:

- iTerm's terminal area is a Metal/GPU render surface.
- Overlay-style sidecars caused blanking, input loss, and layout collapse.
- The whole pane went black, not only the overlapped strip.
- Native iTerm patterns avoid floating rich views over that surface.

Bad forward frame:

> Find a better overlay implementation.

Backward representation:

> The terminal surface is sacred; the sidecar must live in a different compositing tree.

Causal explanation:

The symptom was too broad to treat as a minor overlay bug. The failure pattern suggested a compositing boundary violation. The native patterns were not incidental; they were evidence about what the terminal surface can safely tolerate.

Next move:

> Stop patching overlay behavior. Change the layout/compositing architecture.

## Relationship to nearby skills

- `think-different` reframes product or experience categories.
- `first-principles-thinking` decomposes a problem to fundamental constraints.
- `pearl-representation` evaluates encodings by what operations they make natural.
- `work-backward` activates when stubborn symptoms and existing evidence indicate the current frame is wrong.

This skill can compose with those skills, but it should remain narrower: stuckness, evidence re-weighting, hidden representation, then one concrete next move.

## Quality bar

A good response using this skill must:

1. stop a specific unproductive forward motion
2. name the exact failure or symptom
3. list known facts before reframing
4. identify at least one underweighted fact
5. name the bad forward frame
6. propose a better representation that explains the evidence
7. produce one concrete next move
8. avoid vague motivational language

A bad response:

- says "work backward" but keeps brainstorming randomly
- treats the skill as generic creativity advice
- invents facts not present in the evidence
- delays obvious action without improving the representation
- produces a poetic frame with no operational consequence
- ignores the failure pattern and merely summarizes the situation

## Safety and boundaries

Do not use this skill to rationalize harmful, deceptive, unauthorized, or destructive action.

When applied to security, production, medical, legal, financial, or other high-stakes contexts:

- distinguish facts from hypotheses
- preserve auditability
- ask for authorization and scope when needed
- prefer safe diagnostic steps before invasive action
- do not suppress uncertainty for narrative elegance

## Verification

Use these prompts to evaluate the skill:

1. **Debugging patch loop**
   - Prompt: "This UI overlay keeps causing blank screens even after z-index, opacity, and mount timing fixes. Work backward."
   - Expected: freezes overlay patching, lists symptoms and attempted fixes, identifies compositing or rendering-boundary hypothesis, names a better representation, gives one architecture-level next move.

2. **Product feature pile-up**
   - Prompt: "Our AI notebook has chat, folders, graph view, daily journal, tasks, and PDF search, but users still feel lost. Work backward from the failure."
   - Expected: freezes feature addition, identifies user lostness as the exact failure, lists existing product facts, reframes around the missing loop or decision object, cuts at least one feature path, gives one prototype next move.

3. **Research synthesis stall**
   - Prompt: "I have many notes about emotion, decision-making, and selfhood, but the synthesis keeps feeling scattered. Maybe the answer is already in the evidence."
   - Expected: pauses more source gathering, names the scattered synthesis failure, identifies underweighted repeated concepts, proposes a representation that organizes the notes, gives one writing or mapping move.

4. **Near-miss non-trigger**
   - Prompt: "Fix this TypeScript error: Type 'string | undefined' is not assignable to type 'string'."
   - Expected: do not use this skill unless the error recurs after failed fixes or the user explicitly asks to work backward.
