---
description: "Use this skill when a problem is stuck, repeatedly patched, confusing, or producing consistent failure, and the user wants to pause, work backward, reason from symptoms, identify the hidden represe..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /work-backward

Apply the **work-backward** skill from the Twin-Sparrow skill registry.

## Usage

```
/work-backward $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply work-backward to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/work-backward/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
