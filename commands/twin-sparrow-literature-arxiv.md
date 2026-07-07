---
description: "Search, retrieve, and synthesize arXiv and research literature for Chief's research questions. Use when Chief asks for literature search, arXiv papers, related work, paper discovery, recent researc..."
argument-hint: "<task, question, or artifact to apply this skill to>"
---

# /twin-sparrow-literature-arxiv

Apply the **literature-arxiv** skill from the Twin-Sparrow skill registry.

## Usage

```
/twin-sparrow-literature-arxiv $ARGUMENTS
```

If arguments are given, treat them as the task, question, or artifact this skill should apply to.
If no arguments are given, ask Chief what to apply literature-arxiv to, or apply it to the most recent
relevant context in this conversation.

## Skill Reference

Full skill body: `skills/literature-arxiv/SKILL.md`

Load that skill file and follow its enforcement gate exactly before answering. Do not skip the
gate because this command wrapper is short — the wrapper only routes to the skill, it does not
replace it.
