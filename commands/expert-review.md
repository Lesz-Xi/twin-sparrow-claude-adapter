---
description: "Combined engineering review applying expert-engineer and code-quality-skill simultaneously. Use for code reviews, PR audits, refactoring sessions, and architectural assessments where both multi-dom..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /expert-review

Apply the **expert-review** skill from the Twin-Sparrow skill registry.

## Usage

```
/expert-review $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply expert-review to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/expert-review/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
