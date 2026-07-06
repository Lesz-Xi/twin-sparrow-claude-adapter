---
description: "Use first-principles reasoning to decompose problems to fundamentals, challenge assumptions, and rebuild solutions from constraints."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /first-principles-thinking

Apply the **first-principles-thinking** skill from the Twin-Sparrow skill registry.

## Usage

```
/first-principles-thinking $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply first-principles-thinking to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/first-principles-thinking/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
