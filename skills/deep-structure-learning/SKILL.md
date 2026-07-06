---
name: deep-structure-learning
description: >
  Enter deep-structure learning mode for books, PDFs, passages, theories, symbols,
  dreams, religions, scientific concepts, philosophical ideas, and long-arc research.
  Use when the user invokes /deep-structure-learning, asks to learn the deep structure
  of an idea, wants a living schematic for a book or uploaded PDF, asks to connect new
  reading notes to prior schemas, or wants conceptual architecture rather than a summary.
---

# Deep Structure Learning

## Purpose

Help Chief learn the underlying architecture of an idea instead of producing a flat summary.

This skill treats books, PDFs, passages, symbols, theories, dreams, and research questions as living conceptual systems. The goal is to expose deep structure: governing representations, symbolic motifs, causal mechanisms, conceptual invariants, tensions, missing elements, cross-links, and future reading anchors.

Use this skill to create or extend durable schematics that make later learning easier.

## Enforcement gate

Before proceeding, satisfy this gate:

1. **Learning object is identifiable** — a book, PDF, passage, chapter, concept, theory, dream, symbol, or research topic is named or inferable.
2. **Mode is structural, not summary-only** — the user wants architecture, meaning, links, mechanisms, motifs, or a living schematic.
3. **Evidence boundary is clear** — distinguish text-grounded claims from interpretation, hypothesis, symbolic meaning, and personal resonance.
4. **Copyright boundary is clean** — do not reproduce large copyrighted passages. Quote only short excerpts when necessary; prefer paraphrase, schematic, and analysis.
5. **Storage target is clear when writing files** — if creating a memory artifact, use the user-specified folder; otherwise ask the smallest necessary question.
6. **PDF handling is grounded** — if the task requires extracting from a PDF, load the `pdf` skill and verify the file exists before making source-grounded claims.

If a gate is blocked, ask the smallest necessary question and stop.

## Core stance

Be Solaris-led unless the user asks for direct implementation.

- Slow down enough to preserve meaning.
- Do not flatten symbolic material into generic explanation.
- Do not drift into vague mysticism.
- Keep rationality alive: fact, inference, hypothesis, and meaning-frame must remain distinct.
- Treat the user's reading life as cumulative: every new note should be attachable to an existing or newly created node.

## Workflow

### 1. Identify the learning object

Capture:

```txt
Object type: book / PDF / passage / chapter / theory / symbol / dream / concept / research topic
Source path or citation:
Current focus:
User's question:
Desired output: explanation / schematic / cross-link / reading protocol / memory artifact
Storage target, if any:
```

If the user provides a PDF path, verify it exists. If extracting text is needed, load `pdf` and use bounded extraction around relevant pages, chapters, or table of contents first.

### 2. Establish claim discipline

Use these labels when stakes matter:

- **[Text]** directly supported by the source text.
- **[Fact]** externally established or bibliographically grounded.
- **[Inference]** reasonable synthesis from text/facts.
- **[Hypothesis]** possible but unverified interpretation.
- **[Meaning-frame]** symbolic, philosophical, spiritual, Jungian, religious, or contemplative reading.
- **[Chief-link]** personal resonance or connection to Chief's life/research; meaningful, not proof.
- **[Caution]** boundary against overclaim, projection, anachronism, or unsupported metaphysics.

### 3. Build the deep structure map

For a book or long PDF, create a living schematic with this architecture:

```md
# <Title> — Living Schematic

Created:
Source:
Purpose:

## 0. Use rule
How future notes should be attached.

## 1. Root thesis
The deepest organizing claim or movement.

## 2. Master architecture
Table of chapters/sections: surface subject, deeper operation, symbolic or conceptual function.

## 3. Deep concept graph
Named nodes with text anchors, core idea, meaning, and use.

## 4. Chapter-by-chapter schematic
For each chapter: surface, deep function, key anchors, questions.

## 5. Symbol / mechanism / concept index
Reusable motifs and mechanisms.

## 6. Cross-links
Connections to existing memories, theories, dreams, or research lines.

## 7. Reading workflow
How Chief should mark passages and send notes.

## 8. Open questions
Questions that should guide future reading.

## 9. Current best synthesis
Compact, revisable understanding.
```

For a short passage, produce:

```md
## Deep reading
- Literal claim:
- Hidden structure:
- Key terms:
- Conceptual mechanism:
- Symbolic / philosophical meaning:
- What this connects to:
- What to watch for later:
```

### 4. Link new notes to existing schematics

When Chief brings a new passage or insight, attach it to existing nodes instead of treating it as isolated.

Use this attachment format:

```txt
Book / source:
Location:
Passage or note:
Primary node:
Secondary nodes:
Literal context:
Deep structure:
Related symbols / mechanisms:
Connection to prior memory:
Chief-link:
Open question:
```

If no existing node fits, create a new node and explain why it is structurally distinct.

### 5. Handle PDFs and future uploaded books

When Chief uploads or names a PDF:

1. Verify file existence and metadata when available.
2. Extract table of contents or first structural pages before attempting a full schematic.
3. Use chapter/section boundaries when available.
4. Build a schematic from structure first, then refine with details as Chief reads.
5. Do not claim full coverage if only part of the PDF was inspected.
6. Save durable schematics only when asked or when a storage target is already clear.
7. Keep schematics source-linked so future notes can be grounded.

If OCR or text extraction fails, report the limitation and propose the next clean extraction step.

### 6. Search for the real representation

For every deep-structure task, identify the inherited representation and the better one.

Example:

```txt
Inherited representation: this is a book summary.
Better representation: this is a living conceptual map for attaching future reading.
Cut: do not summarize every detail.
Tradeoff: the schematic is initially incomplete but remains usable and expandable.
```

Name at least one cut and one tradeoff for substantial schematics.

### 7. Preserve personal meaning without overclaim

When linking to Chief's life, dreams, symbols, or synchronicities:

- Honor the lived meaning.
- Do not declare external causation without evidence.
- Ask what operation the symbol performs in Chief's learning.
- Track whether the symbol clarifies, intensifies, distorts, or grounds the inquiry.
- If using Jungian language, treat it as a lens unless source evidence supports stronger claims.

## Output formats

### Quick explanation

Use when Chief asks what a passage means:

```md
The deep implication is: ...

Why:
- ...

Structure:
- Literal layer:
- Psychological / conceptual layer:
- Symbolic layer:
- Chief-link:

Watch for this later: ...
```

### Living schematic report

Use after creating or updating a file:

```md
What changed
- ...

What this means
- ...

Verification
- ...

Next reasonable move
- ...
```

### Note attachment report

Use when linking a new reading note:

```md
Attached to:
- Primary node: ...
- Secondary nodes: ...

Why it belongs there:
- ...

New question opened:
- ...
```

## Verification

For file creation or update:

- Verify the target file exists by reading the beginning of it.
- Confirm the source path or source description is recorded.
- Confirm the artifact includes a future-note attachment workflow.
- Confirm text-grounded claims are not mixed with symbolic interpretation without labels.

For conceptual answers:

- The answer should reveal structure, not merely paraphrase.
- The answer should name what the idea connects to.
- The answer should preserve uncertainty where appropriate.

## Eval prompts

Use these as realistic checks:

1. `Use /deep-structure-learning on this uploaded PDF of a philosophy book. Create a living schematic in my memory folder so future notes can attach to it.`
   - Expected: verifies PDF, extracts structure, creates a source-linked schematic, avoids overquoting, includes note attachment workflow.

2. `I'm reading Jung and this passage struck me: "..." What is the deep structure here?`
   - Expected: explains literal, psychological, symbolic, and Chief-link layers while distinguishing text from interpretation.

3. `Attach this new dream note to the Jung schematic and the Trinity/3 memory.`
   - Expected: identifies primary/secondary nodes, explains why, preserves meaning without claiming proof of external causation.

## Boundaries

Do not:

- Produce long copyrighted excerpts.
- Pretend to have read an entire PDF if only a section was inspected.
- Turn symbolism into deterministic prophecy.
- Reduce deep reading to generic chapter summaries.
- Create files in unclear locations without asking.
- Treat the user's personal resonance as clinical diagnosis.

Do:

- Build reusable maps.
- Keep source grounding visible.
- Preserve symbolic depth.
- Make future learning easier.
- Let the schematic evolve as Chief reads.
