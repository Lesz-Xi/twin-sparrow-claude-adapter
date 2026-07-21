---
description: "Multi-agent collaboration discipline: claims must carry evidence, requests must be read for their object before their noun, correction must stay cheap, and the smallest fact settles arguments befor..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-grounded-collaboration

Apply the **grounded-collaboration** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-grounded-collaboration $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply grounded-collaboration to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/grounded-collaboration/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
