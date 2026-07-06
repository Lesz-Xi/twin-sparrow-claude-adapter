---
description: "Multi-domain engineering skill covering backend, frontend, TypeScript, debugging, architecture, performance, testing, code review, developer tooling, and production-quality implementation."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /expert-engineer

Apply the **expert-engineer** skill from the Twin-Sparrow skill registry.

## Usage

```
/expert-engineer $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply expert-engineer to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/expert-engineer/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
