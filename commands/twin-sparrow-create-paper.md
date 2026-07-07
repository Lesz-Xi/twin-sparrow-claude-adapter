---
description: "Create LaTeX research papers from Chief's literature research context, templates, figures, and theory notes. Use when the user asks for /create-paper, a paper draft, LaTeX paper, arXiv-style writeu..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-create-paper

Apply the **create-paper** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-create-paper $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply create-paper to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/create-paper/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
