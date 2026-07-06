---
description: "Enter deep-structure learning mode for books, PDFs, passages, theories, symbols, dreams, religions, scientific concepts, philosophical ideas, and long-arc research. Use when the user invokes /deep-..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /deep-structure-learning

Apply the **deep-structure-learning** skill from the Twin-Sparrow skill registry.

## Usage

```
/deep-structure-learning $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply deep-structure-learning to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/deep-structure-learning/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
