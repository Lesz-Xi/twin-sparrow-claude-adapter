---
description: "Use Judea Pearl-style representation analysis to re-encode a problem, expose invariants, make operations natural, and reduce search."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /pearl-representation

Apply the **pearl-representation** skill from the Twin-Sparrow skill registry.

## Usage

```
/pearl-representation $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply pearl-representation to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/pearl-representation/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
