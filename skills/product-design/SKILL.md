---
name: product-design
description: >
  Western product-design discipline for stunning, high-production landing and product pages, grounded in Dieter Rams functionalism: value clarity, function-first hierarchy, product narrative, proof, conversion logic, and systematic components. Use for landing page craft, product page design, value-proposition structure, hero and section architecture, feature-to-benefit translation, conversion-aware layout, and functionalist design execution. Composes with japanese-design (surface/atmosphere) and think-different (representation), without replacing them.
---

# Product Design

## Purpose

Design and build high-production landing and product pages using Western product-design discipline.

Where `japanese-design` answers *how the page feels* and `think-different` answers *what the page is*, this skill answers *what the page does*: it makes the product's value legible, ordered, persuasive, and actionable.

The spine is Dieter Rams functionalism: good design makes a product understandable, honest, useful, and as minimal as possible. Function owns the structure. Aesthetics serve comprehension, never decorate over it.

## Relationship to other skills

This skill is a sibling, not a replacement.

- `think-different` → representation. What is this page really? (run first when the concept is ambiguous)
- `product-design` → function. What must the page communicate, prove, and make the user do?
- `japanese-design` → surface. How does it feel: ma, shibui, wabi-sabi, typography, motion, material.
- `web-design` → craft. How the page is built: grid systems, motion engineering, reveal techniques, and page assembly. It executes this skill's structure and japanese-design's surface; it never reorders the value spine or demotes the primary action.

### Composition rule (load-bearing)

When this skill and `japanese-design` conflict:

- **Function and clarity win on structure.** Information hierarchy, value order, proof placement, and the primary action are decided by product-design.
- **Japanese doctrine wins on surface.** Spacing rhythm, type voice, restraint, motion character, and material feel are decided by japanese-design.

Never let conversion pressure destroy restraint, and never let restraint hide the product's value or bury the primary action. If the two genuinely collide, surface the tradeoff instead of silently picking one.

## Typography, motion, and animation handoff

Product-design decides what typography, motion, and animation must accomplish:

- clarify hierarchy
- guide attention through the value spine
- support proof and comprehension
- make the primary action legible
- reduce cognitive load
- pace the argument from promise to action
- reveal state, causality, and interaction consequence

`japanese-design` decides how typography, motion, and animation should feel:

- type voice, font atmosphere, restraint, and editorial rhythm
- ma-driven spacing and scroll pacing
- shibui hover states and quiet interaction feedback
- animation timing, easing, inertia, and reduced-motion behavior
- material transitions, photographic sequencing, and surface tactility

When typography is needed, load `japanese-design` typography guidance. When motion or animation is needed, load `japanese-design` motion doctrine. Do not invent a separate Western motion language unless the user explicitly asks.

Product-design may require a heading to be stronger, a CTA to be more visible, a proof block to appear earlier, or an interaction to reveal causality. But `japanese-design` determines the letterform, weight, spacing, easing, restraint, and material expression used to satisfy that requirement.

## Enforcement gate

Before using this skill, verify:

1. **Page-craft task** — the user wants a landing page, product page, value section, hero, or conversion-aware layout designed or critiqued.
2. **Not pure implementation** — if the user only needs a CSS fix, token application, or copy nit, execute directly without this skill.
3. **Function before decoration** — every section must justify itself by what the user understands or does, not by visual impulse.
4. **Honesty constraint** — no fake scarcity, fabricated proof, manipulative dark patterns, or claims the product cannot back. Persuasion must be truthful.
5. **Tradeoff required** — name what each structural choice costs: attention, length, restraint, load, or focus.

If the product's value or audience is too vague to structure, ask the smallest necessary clarification and stop.

## Rams principles, operationalized

Use these as engineering filters, not slogans.

1. **Good design is innovative** — but innovation serves the user's job, not novelty for its own sake.
2. **Makes a product useful** — every section advances understanding, trust, or action.
3. **Is aesthetic** — beauty supports comprehension; this is where japanese-design surface enters.
4. **Makes a product understandable** — the page should be self-explanatory; the user never has to decode it.
5. **Is unobtrusive** — the design is a neutral frame for the product, not a competing performance.
6. **Is honest** — no overpromise, no manufactured urgency, no proof theater.
7. **Is long-lasting** — avoid trend-chasing effects that date the page in a year.
8. **Thorough to the last detail** — captions, states, empty states, and micro-copy all earn their place.
9. **Environmentally/operationally friendly** — performance, weight, and accessibility are design constraints, not afterthoughts.
10. **As little design as possible** — when in doubt, remove. Concentrate on the essential.

## Landing page value spine

A strong page is a single ordered argument, not a stack of sections. Default spine:

1. **Promise** — the one transformation the product delivers, stated plainly above the fold.
2. **Clarity** — what it is, in one breath, so the promise is believable.
3. **Proof** — evidence the promise is real: demonstration, metrics, logos, testimonials, or live artifact.
4. **Mechanism** — how it works, only deep enough to make the promise credible.
5. **Value translation** — features expressed as user outcomes, never raw feature lists.
6. **Objection handling** — the top one or two reasons a user hesitates, answered directly.
7. **Action** — one primary, unmistakable next step, repeated where the user is ready to act.

Not every page needs all seven. But the *order of conviction* — promise, believe, prove, act — must hold.

## Workflow

1. **Establish the product job**
   - Who is the user, and what job are they hiring this product to do?
   - What transformation does the page promise?

2. **Define the value spine**
   - Reduce the product to one primary promise.
   - Order the supporting argument: clarity, proof, mechanism, value, objections, action.

3. **Architect sections from the spine**
   - Each section maps to one job in the argument.
   - Reject any section that does not advance promise, proof, or action.

4. **Translate features to outcomes**
   - For each feature, write the user-visible benefit.
   - Cut features that do not change the user's decision.

5. **Design the component system**
   - Define a small, consistent set: hero, proof block, feature pairing, demonstration, CTA.
   - Reuse before inventing. Systematic over bespoke.

6. **Place the primary action**
   - One dominant CTA. Secondary actions must not compete visually.
   - Repeat the primary action only where conviction is high enough to act.

7. **Apply the Japanese surface layer**
   - Hand spacing rhythm, type voice, restraint, material, motion, and animation character to `japanese-design`.
   - Keep structure decided here; keep feel decided there.
   - Use the typography, motion, and animation handoff when hierarchy or interaction needs a stronger functional role.

8. **Cut and state the tradeoff**
   - Remove the weakest section and the weakest feature claim.
   - Name what the chosen structure costs.

9. **Give the next build move**
   - One concrete implementation or prototype step that tests the page's central argument.

## Output format

Default format:

```md
## Product job
## Value spine
## Section architecture
## Feature-to-outcome translation
## Component system
## Primary action
## Japanese surface layer
## Cuts
## Risk / tradeoff
## Next build move
```

For quick critique, compress to:

```md
Verdict: ...
Why:
- ...
Value spine: ...
Main cut: ...
Risk: ...
Next move: ...
```

For build handoff, add:

```md
## Layout consequence
## Component consequence
## Motion / interaction consequence (defer character to japanese-design)
## Acceptance check
```

## Quality bar

A good response must:

1. state the product job and one primary promise
2. order the page as an argument, not a section stack
3. translate features into user outcomes
4. define a small reusable component system
5. place exactly one dominant primary action
6. delegate surface/atmosphere to japanese-design rather than re-deciding it
7. cut at least one section or claim
8. name a real tradeoff
9. give a concrete next build move

A bad response:

- stacks sections with no argument order
- lists features without user outcomes
- uses multiple competing CTAs
- relies on manipulative urgency or fake proof
- decorates instead of clarifying
- duplicates japanese-design surface decisions and contradicts them
- ignores performance, accessibility, or honesty
- omits the tradeoff

## Verification

Use these prompts to evaluate the skill:

1. **Thin landing page**
   - Prompt: "Use `/product-design` on a landing page that only has a hero, a feature grid, and a footer."
   - Expected: builds a value spine, adds proof and objection handling, translates features to outcomes, sets one primary CTA, delegates feel to japanese-design, names a cut and a tradeoff.

2. **Feature-list product page**
   - Prompt: "Restructure this product page: it lists 12 features with icons and no narrative."
   - Expected: reduces to one promise, orders an argument, converts features to outcomes, proposes a small component system, cuts low-value features.

3. **Conflict resolution with japanese-design**
   - Prompt: "Conversion wants a loud sticky CTA bar; the Japanese design wants restraint. Resolve it."
   - Expected: applies the composition rule — function owns the action's presence and placement, japanese-design owns its visual character — and names the tradeoff rather than silently overriding one side.

4. **Near-miss non-trigger**
   - Prompt: "Fix the button hover color token on this page."
   - Expected: skill should not trigger; execute directly as a small implementation fix.
