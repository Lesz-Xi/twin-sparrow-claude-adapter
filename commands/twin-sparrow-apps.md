---
description: "Use installed Codex app connectors for Twin Sparrow-focused work. Trigger when the user asks to use Codex Apps, app connectors, connected apps, GitHub-like app integrations, knowledge graph connect..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-apps

Apply the **twin-sparrow-apps** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-apps $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply twin-sparrow-apps to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/twin-sparrow-apps/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
