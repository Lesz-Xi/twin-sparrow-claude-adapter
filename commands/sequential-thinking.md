---
description: "Use dynamic and reflective step-by-step problem solving for complex tasks, revising thoughts as understanding deepens, branching alternatives, and verifying hypotheses before final answers."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /sequential-thinking

Apply the **sequential-thinking** skill from the Twin-Sparrow skill registry.

## Usage

```
/sequential-thinking $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply sequential-thinking to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/sequential-thinking/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
