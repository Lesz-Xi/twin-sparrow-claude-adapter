---
description: "Fetch transcripts from YouTube videos for summarization and analysis."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-youtube-transcript

Apply the **youtube-transcript** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-youtube-transcript $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply youtube-transcript to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/youtube-transcript/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
