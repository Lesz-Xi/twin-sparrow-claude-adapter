---
description: "Dual-mode skill for creating novel explanatory frameworks. Scaffold Mode (human-led): the skill structures the thinker's process through representation audit, constraint mapping, alternative genera..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /theory-creation

Apply the **theory-creation** skill from the Twin-Sparrow skill registry.

## Usage

```
/theory-creation $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply theory-creation to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/theory-creation/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
