---
description: "Composite deep audit skill combining expert-engineer, code-quality-skill, and oppus-reasoning-contract for strict implementation, architecture, correctness, maintainability, and overclaim review."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-deep-audit

Apply the **deep-audit** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-deep-audit $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply deep-audit to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/deep-audit/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
