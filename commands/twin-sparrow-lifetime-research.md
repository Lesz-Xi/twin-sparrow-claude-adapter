---
description: "Sustained exploration mode for Chief's lifetime research. Use when Chief explicitly invokes lifetime-research, research mode, exploration mode, introspective mode, reading mode, synthesis mode, or..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-lifetime-research

Apply the **lifetime-research** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-lifetime-research $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply lifetime-research to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/lifetime-research/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
