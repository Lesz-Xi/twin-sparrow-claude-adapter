---
name: literature-arxiv
description: >
  Search, retrieve, and synthesize arXiv and research literature for Chief's research questions. Use when Chief asks for literature search, arXiv papers, related work, paper discovery, recent research, source-backed synthesis, bibliography candidates, or evidence for a theory before writing or implementation. Produces grounded research notes with citations and claim-status discipline; does not draft full LaTeX papers unless composed with create-paper.
---

# Literature arXiv

## Purpose

Find and synthesize research literature without turning search results into fake certainty.

This skill is for discovering papers, reading abstracts or available full text, extracting the causal/technical structure of a research area, and producing source-backed notes Chief can use for theory work, product research, or later paper writing.

It is not a generic web-summary mode and not a manuscript generator. For writing a `.tex` paper, compose afterward with `create-paper`.

## Enforcement gate

Every run must satisfy these gates:

1. **Question gate** — identify the actual research question, not only the keywords.
2. **Source gate** — distinguish searched/found metadata from actually read source text.
3. **Claim-status gate** — mark claims as source claim, inference, hypothesis, contradiction, or open question when stakes matter.
4. **Coverage gate** — state whether the result is a quick scout, targeted bibliography, or deeper literature synthesis.
5. **Recency gate** — when the user asks for recent work, include the date range or say if no date filter was applied.
6. **No citation laundering** — do not present a title/abstract/search result as if the full paper was read.
7. **Next-use gate** — end with how the literature should be used next: read deeply, compare, reject, cite, test, or feed into theory/paper creation.

If web access, arXiv access, PDF access, or full-text access is unavailable, say so explicitly and offer a bounded alternative.

## Default workflow

### 1. Reconstruct the research target

Extract:

- research question
- domain and neighboring terms
- required recency, if any
- whether Chief wants breadth or depth
- whether the output should be bibliography, synthesis, critique, or reading plan

Ask only if ambiguity blocks search quality.

### 2. Search with representation discipline

Prefer queries that encode the mechanism, not only the label.

Examples:

- Bad: `world model AI`
- Better: `arXiv papers latent world models planning representation learning uncertainty model-based reinforcement learning 2023 2026`

- Bad: `causal discovery LLM`
- Better: `papers large language models causal discovery structural causal models intervention reasoning benchmarks`

### 3. Triage sources

For each candidate, track:

- title
- authors if available
- venue/date or arXiv id if available
- URL
- why it matters for the question
- whether only metadata/abstract was seen or full text was read

Prefer primary sources over blog summaries. Use secondary sources only for orientation.

### 4. Read selectively

When full text is available, inspect the parts that matter:

- abstract and introduction for problem framing
- method/model section for mechanism
- experiments/evaluation for evidence
- limitations/discussion for boundaries
- related work for citation graph

Do not pretend to have read sections that were not inspected.

### 5. Synthesize, do not pile up

A good output should reduce search, not increase it.

Organize by one of these shapes:

- **Map of positions** — what camps or approaches exist
- **Mechanism table** — method, representation, operation made easy, limitation
- **Evidence ladder** — strong evidence, weak evidence, speculative claims
- **Citation path** — start here, then read these branches
- **Theory pressure** — which papers support, challenge, or reframe Chief's hypothesis

### 6. Preserve provenance

Every nontrivial source-backed claim should be traceable to a source. Include URLs or arXiv IDs when available.

Use this claim language:

- `Source claim:` what the paper says
- `Inference:` what follows from connecting sources
- `Hypothesis:` plausible but not established
- `Open question:` important uncertainty not resolved by the read set

## Output formats

Choose the smallest useful output.

### Quick scout

Use when Chief wants orientation fast.

```text
Research question: ...
Search scope: quick scout / metadata + abstracts / date range if any

Best leads:
1. Title — why it matters — source status
2. ...

Pattern emerging:
...

Next read:
...
```

### Targeted bibliography

Use when Chief needs papers to read or cite.

```text
Research question: ...
Selection criteria: ...

Core papers:
- Title, authors, date, URL/arXiv — why it belongs

Adjacent papers:
- ...

Reject/deprioritize:
- ... — why

Next use:
...
```

### Literature synthesis

Use when Chief needs understanding, not just a list.

```text
Research question: ...
Source basis: what was searched/read

Synthesis:
...

Mechanism map:
- Approach A: representation / operation / evidence / limitation
- Approach B: ...

Tensions:
...

Implications for Chief's theory/work:
...

Next move:
...
```

## Composition rules

- Compose with `deep-structure-learning` when Chief wants the deep structure of one or more papers.
- Compose with `theory-creation` when the literature search is the first stage of building a new explanatory framework.
- Compose with `create-paper` only after a grounded source base exists and Chief wants a manuscript.
- Compose with `oppus-reasoning-contract` for strict claim audits or high-stakes evidence review.
- Compose with `youtube-transcript` only when the relevant source is a video/podcast rather than a paper.

## Hard stops

Do not:

- invent citations
- cite papers that were not found or supplied
- claim full-paper knowledge from title/abstract only
- flatten contradictory results into consensus
- use search-result snippets as proof
- write a LaTeX paper unless Chief explicitly asks for paper creation

## Default next move

If Chief invokes this skill without a specific query, ask:

> What research question should the literature search answer, and do you want a quick scout, targeted bibliography, or deeper synthesis?
