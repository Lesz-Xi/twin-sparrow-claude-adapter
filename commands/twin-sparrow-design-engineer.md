---
description: "Composite design-engineering skill combining japanese-design and expert-engineer for design-language matching, component architecture, design-system frontend work, accessibility, performance, and p..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-design-engineer

Apply the **design-engineer** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-design-engineer $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply design-engineer to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/design-engineer/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
