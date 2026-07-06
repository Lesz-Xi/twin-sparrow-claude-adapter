---
name: design-engineer
description: >
  Composite design-engineering skill combining japanese-design and expert-engineer for design-language matching, component architecture, design-system frontend work, accessibility, performance, and production implementation.
---

# Design Engineer

This is a composite skill. Apply **both** `japanese-design` and `expert-engineer` together.

## Activation Boundary

Use this composite only when the task actually requires design-language matching, component architecture, or design-system-level frontend work.

Do **not** invoke this composite for minor polish that merely wires existing UI to existing tokens, CSS variables, labels, copy, foreground/background values, or other already-established visual rules. In those cases, skip `japanese-design`, avoid the reference-selection gate, and execute directly as a small engineering change.

Examples that stay outside this skill:

- "make workspace/operator/engine follow Main View Foreground"
- "small token plumbing polish"
- "replace accent color with existing foreground token"
- "minor label color fix"

## 🔒 MANDATORY ENFORCEMENT GATE

**You MUST follow this protocol before addressing the user's request. Do not skip any step. Do not collapse steps. Do not proceed to the task until all phases below are completed and written in your output.**

### Step 1: Acknowledge (write this exact line in your output)
```
[design-engineer] Protocol engaged. Source skills required: japanese-design, expert-engineer.
```

### Step 2: Load Source Skills
Read the full `SKILL.md` for each source skill before continuing:
- `japanese-design/SKILL.md` — extract the relevant design corpus, identify the matching design reference, apply its language
- `expert-engineer/SKILL.md` — apply its Full-Stack and TypeScript roles to ensure production-quality implementation

### Step 3: Execute Workflow
Apply the Combined Workflow (below) in the exact order listed. Write each layer's output before proceeding to the next.

### Step 4: Only After All Complete
After writing the full output from all workflow layers and the final formatted design review, you may then address the specific user request.

---

## Combined Workflow

Apply layers in this order:

1. **Design Language** (from japanese-design) — Match the aesthetic, layout philosophy, component patterns, and interaction model from the chosen reference
2. **Component Architecture** (from expert-engineer Full-Stack) — State ownership, data-fetching boundaries, layer separation
3. **Styling System** (from japanese-design) — Token system, spacing scale, typography, color semantics, motion/transition patterns
4. **Type Safety** (from expert-engineer TypeScript) — Props interfaces, discriminated unions for component states, eliminate implicit types
5. **Accessibility** (from both skills) — Semantic HTML, keyboard navigation, focus management, ARIA where needed
6. **Performance** (from expert-engineer Full-Stack) — Render optimization, data fetching strategy, bundle impact
7. **Error States** (from both skills) — Loading skeletons, error boundaries, empty states, retry flows — all designed, not just coded

## Output Format

```
## Design Direction
- Reference: [which design language is being applied]
- Rationale: [why this reference matches the task]
- Visual changes: [what changes in layout, typography, color, spacing, interaction]

## Component Architecture
- State model: [what state lives where]
- Data flow: [how data moves through components]
- Interfaces: [key TypeScript types]

## Implementation Steps
1.
2.
3.

## Tradeoffs
| Decision | Option A | Option B | Rationale |
```

## When to Use

- Building new UI components with a specific design language
- Restyling existing components to match a new design system
- Frontend architecture that must be both beautiful and maintainable
- Component library development
- Design-to-code handoff assistance
