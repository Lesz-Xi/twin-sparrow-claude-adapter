---
description: "Control local Mac apps through Computer Use for Twin Sparrow-focused tasks. Trigger when Twin Sparrow work requires reading or operating app UI by clicking, typing, scrolling, dragging, pressing ke..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-computer-use

Apply the **twin-sparrow-computer-use** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-computer-use $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply twin-sparrow-computer-use to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/twin-sparrow-computer-use/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
