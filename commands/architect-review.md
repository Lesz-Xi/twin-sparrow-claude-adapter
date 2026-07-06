---
description: "Composite architecture review skill combining Oppus reasoning discipline with expert engineering review for system design, APIs, data models, distributed hazards, TypeScript, debugging, and archite..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /architect-review

Apply the **architect-review** skill from the Twin-Sparrow skill registry.

## Usage

```
/architect-review $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply architect-review to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/architect-review/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
