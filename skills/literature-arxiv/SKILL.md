---
name: literature-arxiv
description: >
  Conduct disciplined scientific literature research across arXiv, journals, DOI pages, and primary research sources. Use when the user asks for arXiv paper discovery, journal literature review, prior-art scans, research synthesis, paper comparison, bibliography building, or evidence-grounded summaries of scientific publications.
---

# Literature arXiv

Use this skill to turn a research question into a source-grounded literature pass. The goal is not to produce a fluent overview first; the goal is to find the strongest primary sources, separate evidence from interpretation, and synthesize only what the sources can support.

## Research Workflow

1. Define the research question.
   - Restate the topic, scope, field, timeframe, and expected output.
   - Identify whether the user needs discovery, synthesis, comparison, critique, or a bibliography.
   - Name any constraints such as venue, year range, methods, datasets, or author groups.

2. Build search queries.
   - Create two to five query variants using technical terms, synonyms, author names, benchmark names, and method names.
   - Prefer primary source targets first: arXiv, DOI pages, publisher pages, PubMed, ACL Anthology, IEEE/ACM/Springer pages, conference proceedings, and official lab pages.
   - Use secondary sources only for routing unless the user explicitly asks for commentary.

3. Triage candidate papers.
   - Record title, authors, year, venue or preprint status, source URL, and why the paper is relevant.
   - Mark each source as peer-reviewed, preprint, survey, replication, benchmark, dataset, theory, or position paper.
   - Prefer recent surveys for orientation, then trace claims back to original papers.

4. Read for evidence.
   - Extract the research question, method, dataset or experimental setup, main claims, limitations, and evaluation evidence.
   - Distinguish reported results from author interpretation.
   - Watch for arXiv versions, withdrawn papers, missing peer review, small samples, benchmark leakage, and unsupported generalization.

5. Synthesize with claim boundaries.
   - Group papers by mechanism, method family, empirical finding, or disagreement.
   - State what is established, what is plausible, what is contested, and what remains unknown.
   - Do not present a preprint as consensus or a single benchmark result as field-level proof.

6. Produce the requested artifact.
   - For a quick answer: give the short synthesis plus the most important papers.
   - For a literature review: include an evidence table and thematic synthesis.
   - For a bibliography: include citation metadata and stable links.
   - For an audit: list weak claims, missing controls, and stronger follow-up sources.

## Evidence Table

When the task involves more than a quick lookup, use a compact table with these columns:

| Paper | Source status | Method or contribution | Evidence used | Limits | Why it matters |
| --- | --- | --- | --- | --- | --- |

Keep the table factual. Put interpretation after the table.

## Citation Discipline

- Prefer stable identifiers: DOI, arXiv ID, PMID, ACL Anthology ID, conference page, or publisher URL.
- Include publication date or arXiv version date when recency matters.
- If a paper appears in both arXiv and a venue, cite the venue version and mention the arXiv version only if it matters.
- Never invent citation metadata. If metadata is unavailable, say so.
- Use direct quotes only when necessary and keep them short.

## Output Contract

For research synthesis, end with:

- Key findings: concise claims supported by the sources.
- Best sources: the strongest papers and why they deserve priority.
- Uncertainties: gaps, conflicts, or weak evidence.
- Next search path: exact terms, authors, venues, or adjacent topics to investigate next.
