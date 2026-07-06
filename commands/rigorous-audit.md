---
description: "Composite rigorous audit skill applying oppus-reasoning-contract in Strict mode with code-quality-skill to find overclaims, assumptions, quality risks, smells, verification gaps, and prioritized fi..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /rigorous-audit

Apply the **rigorous-audit** skill from the Twin-Sparrow skill registry.

## Usage

```
/rigorous-audit $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply rigorous-audit to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/rigorous-audit/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
