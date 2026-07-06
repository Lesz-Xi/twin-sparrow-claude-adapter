---
description: "Enforce disciplined reasoning structure for research, architecture, audit, spec review, implementation planning, evidence evaluation, and tasks requiring explicit assumptions and claim boundaries."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /oppus-reasoning-contract

Apply the **oppus-reasoning-contract** skill from the Twin-Sparrow skill registry.

## Usage

```
/oppus-reasoning-contract $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply oppus-reasoning-contract to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/oppus-reasoning-contract/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
