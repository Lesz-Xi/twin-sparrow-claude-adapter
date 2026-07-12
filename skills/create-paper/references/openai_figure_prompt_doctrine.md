# OpenAI Figure Prompt Doctrine

Use this doctrine when generating original figures through the OpenAI Image API for Chief's papers.

## Core Principle

Generated figures must be paper arguments, not decorative images.

## Default Anti-Slop Prompt

```txt
Create an original figure for a serious research paper.

Non-negotiable visual doctrine:
- Argument-first, not decorative.
- Minimal, publication-quality, white or near-white background.
- Clear mechanism, relations, directionality, and hierarchy.
- No stock AI clichés: no glowing brains, robot hands, neon circuits, cyberpunk clutter, random particles, lens flares, or vague futuristic imagery.
- No invented equations, fake citations, fake UI, fake axis numbers, or fake author names.
- Avoid text inside the image unless explicitly requested. If labels are needed, use short simple labels only; exact labels will be added in LaTeX/TikZ/caption.
- Preserve conceptual fidelity over visual drama.
- Prefer clean diagrammatic composition, restrained color, high whitespace, and legible structure.
```

## Figure Brief Requirements

Every figure brief should include:

```txt
Title:
Paper section:
Explanatory job:
Core mechanism:
Entities:
Relations / arrows:
What must be visually emphasized:
What must be excluded:
Caption thesis:
Preferred representation: TikZ / Mermaid / Python / OpenAI Image API
```

## Routing Rule

```txt
Exact diagram / labels / math / axes / causal graph / architecture -> TikZ, Mermaid, or Python.
Conceptual visual / metaphor / atmosphere / non-layout-critical explanatory image -> OpenAI Image API.
```

## Why

The audit of Ilya, Pearl, and LeCun figures showed that most research figures are exact reasoning artifacts: plots, tables, architectures, causal diagrams, equations, and timelines. OpenAI Image API is useful for original conceptual figures, but not as the default for precise scientific diagrams.
