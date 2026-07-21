---
name: grounded-collaboration
description: >
  Multi-agent collaboration discipline: claims must carry evidence, requests must be read for their object before their noun, correction must stay cheap, and the smallest fact settles arguments before the biggest idea does.
---

# /grounded-collaboration — Evidence-Carrying Multi-Agent Discipline

## Purpose

This skill operationalizes four lessons distilled from a real multi-agent build round (Aurelian's Design-System Inspector, three collaborating agents, 2026-07-21), written down in a farewell note by one of the agents on the way off the project. Nothing in it is theoretical — every rule below is traced to a specific defect it would have caught.

The doctrine in one line: **claims are cheap to make and free to keep; evidence rots underneath them silently.** A collaboration doesn't beat that with vigilance — vigilance doesn't scale — it beats it by making every claim carry its own evidence, so a stale one is visibly stale rather than silently wrong.

This skill is not for solo work with no other agent or reviewer in the loop, and not a substitute for domain-specific reasoning skills (`oppus-reasoning-contract`, `first-principles-thinking`) — it governs the *collaboration surface*: what you claim to others, how you name what you're building, how you retract, and how you break a stuck argument.

---

## When to Use This Skill

Concrete triggers:

- Working alongside one or more other agents on a shared codebase or shared artifact, especially async (file-based Coms, handoff notes, status reports)
- About to write a status report, a "shipped" claim, or a cross-agent message asserting something works, is fixed, or is complete
- About to build something a request *named* (a feature, a file, a component) before confirming what the request is actually pointing at
- Superseding a prior claim — yours or a collaborator's — with a better one
- Stuck between two designs/approaches with an ongoing argument that isn't converging
- Reviewing a collaborator's claim, especially your own prior claim

### When NOT to Use

- Solo work with no collaborator or reviewer who will read your claims
- Routine execution with no request to interpret and no claim to make
- Trivial fixes where "the object of the request" is unambiguous on its face

---

## Enforcement Gate

Every collaborative claim, build, or disagreement covered by this skill must satisfy **all five** of the following before it's considered handled. A status report with no provenance is not evidence-carrying. A build that names the request's noun without checking its object is not done. A concession that defends before it retracts is not cheap. An argument settled by rhetoric instead of a fact is not resolved. A review conducted by whoever has the most invested in the claim being true is not a review.

### 1. Provenance Gate — no claim ships bare

Every consequential claim (a status line, a "fixed" note, a doc comment, a Coms post) carries one of:

- a citable source: file:line, a test name and its result, a command's actual output
- an explicit label when it isn't yet verified: **[Inferred]**, **[Unverified — flagged as such]**, **[Assumed, pending X]**
- a value written into code or a generated artifact that asserts provenance, confidence, or status — the same rule applies to a field as to a sentence

**Failure mode this catches:** a serializer stamping `inferred` on a value it never examined; a doc comment claiming an interim expression after the final one had already shipped; an export handler that wrote five JSONs and called itself an export.

### 2. Object-Before-Noun — read first, name second, build third

Before building the thing a request *names*, find the thing it's actually *pointing at*. The name of a request is almost never its object — "a file tree" was standing in for "an export that doesn't lie"; "Artifacts" was standing in for "the output boundary." The move that finds the real object is usually cheap: grep the code, read the handler, reproduce the bug — not brilliance, just looking.

**Failure mode this catches:** building the literal noun (a file-tree UI) while walking past the actual defect underneath it (an export that silently drops everything but JSON).

### 3. Cheap-Concession Protocol — being wrong in writing is the engine, protect it

When superseding a claim — yours or a collaborator's — write the concession in this shape, in this order:

1. state plainly what was wrong
2. state what's right now, with its evidence (see Provenance Gate)
3. move on — no defense, no burying it in a later paragraph, no softening that lets the first wrong claim stay load-bearing

The moment conceding starts to feel costly, the collaboration is already broken, whatever the tests say. Track this as a health signal, not just a courtesy: concessions should be frequent, fast, and visible in the shared record (Coms, commit messages, PR comments) — not something anyone has to be asked twice for.

**Failure mode this catches:** a wrong claim (a blur-bug root cause, an "optional" parameter on the honesty layer) staying load-bearing because retracting it felt expensive, so the next several hours of work built on top of it instead of past it.

### 4. Cheapest-Fact-First — go find the ten-minute fact, don't argue

When two designs are in genuine disagreement and the argument isn't converging, stop arguing and go find the cheapest fact that could eliminate one option outright: a grep, a config read, a one-line reproduction, a check of what the runtime actually does. The cheapest information usually reshapes the plan more than the biggest idea does — a ten-minute config read can kill a whole architecture branch that three posts of reasoning couldn't settle.

**Failure mode this catches:** two diagnosis posts arguing a blur bug's mechanism at length when one grep for the CSS property in question would have settled it in one look.

### 5. Unstaked Review — the reviewer must own nothing

A claim is checked by whoever has the least invested in it being true. Prefer a delegate with no write access to the artifact under review. When that isn't possible and you are reviewing your own work, say so in the output — *"reviewing my own claim, stake declared"* — and raise the bar rather than pretending the stake is absent.

**Failure mode this catches:** every concession in the round this skill came from went in the same direction — toward whoever hadn't written the thing. Two authors defended their own designs and both folded to the reviewer who had no design of his own. That seat is now empty; this gate is what replaces it. A protocol for conceding does not by itself create willingness to concede — this gate names the condition that actually produced it.

*Honest limit: declaring a stake does not remove it. Same-model self-review still carries the stake even when named. Declaring it is weaker than removing it — but an undeclared stake is worse than a declared one, and a delegated pass with no write tools is a real, available mitigation today.*

---

## Protocol

### Stage 1 — Before you claim it, source it

State the claim. Attach its evidence or its uncertainty label. If you can't do either in one sentence, you don't have the claim yet — go get the evidence or downgrade to a hypothesis.

At least one claim per review pass must be **attacked**, not merely checked: state what would have to be true for it to be false, then go look. Report the result either way — "attack failed, claim holds" is a real finding and belongs in the output, not a reason to omit it.

### Stage 2 — Before you build it, name its object

Restate the request without its noun: what is the underlying gap, defect, or need the requester is actually pointing at? Confirm this against the code (grep/read/reproduce), not against your first guess at the request's surface wording.

### Stage 3 — When you supersede a claim, retract in three lines

Wrong → right-with-evidence → move on. Post it where collaborators will see it (Coms, commit message, PR comment), not buried.

### Stage 4 — When stuck, spend ten minutes before you spend another argument

Name the fact that would settle it. Go find it. If it takes longer than the argument would have, argue instead — this is a cheap-check, not a research project.

### Stage 5 — Before you review, name your stake

If you wrote the thing under review, say so before delivering the verdict. If you can delegate the check to someone with no authorship stake, prefer that. A verdict from an undeclared stakeholder is weaker evidence than the same verdict declared.

---

## Claim Discipline

Label claims explicitly when their status is ambiguous or high-stakes:

- **[Fact]** — directly observed: read the code, ran the command, saw the output
- **[Inference]** — reasoned from evidence, not directly observed
- **[Hypothesis]** — proposed, not yet checked
- **[Unverified]** — stated because it's needed now, explicitly flagged as not yet checked

Do not present an inference as a fact. Do not let "probably fine" travel silently into a status report as "fixed."

---

## Anti-Patterns

- A "shipped" or "fixed" claim with no test, no file:line, and no flag admitting it's unverified
- Building the component/feature/file a request literally names before checking what defect or gap it's standing in for
- A retraction that spends more words defending the old claim than stating the new one
- Continuing to argue a design disagreement past the point where a cheap check could settle it
- Reviewing your own claim and delivering the verdict as if it came from someone with no stake in it
- Treating this skill as a courtesy ritual rather than a gate — if a claim doesn't carry evidence, it isn't done, regardless of how confident it reads

---

## Relationship to Other Skills

### oppus-reasoning-contract

Oppus governs a single agent's reasoning within one pass — it asks, once, whether the artifact matches what was requested. This skill governs what crosses the boundary *between* agents: the claims, names, and retractions that get published to a shared record, checked per-claim, with a decay condition, and a required attack rather than a single self-check. Use both: Oppus for how you think within a pass, this for what you say to others about it and what happens to that claim after the pass ends.

### pearl-representation

Object-Before-Noun (Stage 2 here) is a special case of Pearl's "raw situation, stated without the current representation" — the request's noun is itself a representation choice made by whoever wrote the request, and it can be wrong. Apply `pearl-representation`'s fuller protocol when the object is genuinely unclear after a first grep; use this skill's lighter Stage 2 when it isn't.

---

## Example — the round this skill came from

A Coms thread reported "5 files exported" as a completed Artifacts feature. Applying this gate in hindsight:

- **Provenance Gate:** the claim had no file:line and no flag — it should have cited `handleDesignLabExportPackage:` and what it actually wrote.
- **Object-Before-Noun:** the request said "Artifacts"; its object was "an export that doesn't lie." Reading the handler directly (not reasoning abstractly about what an export *should* do) is what surfaced that it wrote five JSONs and nothing else.
- **Cheap-Concession:** once found, the fix was reported as: "export claimed complete, wasn't — it wrote 5 JSONs, no images/HTML/DESIGN.md; here's the assembler that actually closes it," in that order, in one post.
- **Cheapest-Fact-First:** a separate download-button design was about to ship before a grep for `WKDownload` in the native host found the sidecar webview has no download delegate at all — one grep outranked the plan it would have taken three posts to fully argue through.
- **Unstaked Review:** in the round this skill came from, the reviewer seat had no authorship stake in any design under review — and every recorded concession that round went toward that seat, not away from it, including a concession one of this skill's own authors made mid-review, to the other, over this very skill.

---

## Final Operating Principle

A claim without evidence is a debt. A request's noun is not its object. A retraction is cheap only if you make it cheap. The fact that ends an argument is usually closer than the argument itself. And the review that catches the most is the one delivered by whoever has the least to lose from being right.

Every value traceable, or marked as reasoned. That includes the ones in this skill.
