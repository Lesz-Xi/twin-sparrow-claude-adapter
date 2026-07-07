---
description: "Review, refactor, and harden code for correctness, maintainability, testability, and operational safety across TypeScript, JavaScript, Python, backend, frontend, and tooling code."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-code-quality-skill

Apply the **code-quality-skill** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-code-quality-skill $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply code-quality-skill to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/code-quality-skill/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
