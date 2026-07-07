---
name: web-design
description: >
  Web craft execution layer: layout systems (editorial grids, container frames, split and
  image-first layouts), typography execution, motion engineering (duration/easing/stagger
  tokens, GSAP and Lenis setup, scroll reveals, pinned scenes), reveal and masking
  techniques, texture and material (paper surfaces, monochrome dither, shadow policy), and
  page assembly. Use when building, implementing, or execution-critiquing landing pages,
  product pages, and editorial pages. Composes under think-different (representation),
  product-design (function), japanese-design (surface), and twin-sparrow-taste (identity);
  it executes those layers and never overrides them.
---

# Web Design (Craft Layer)

Current name: `web-design`.

This skill turns design doctrine into built pages. It owns the construction layer of web
work: grid tokens, motion tokens, reveal mechanics, material execution, assembly order,
and QA. It is distilled from a curated pass over MengTo's Aura.build web-design pack
(`/Users/lesz/Developer/MengTo-Skills/agent-skills/web-design`), with every admitted
technique conformed to Twin-Sparrow doctrine and every rejected technique preserved there
as a contrast entry.

> Execution is where doctrine survives or dies. A page that is right in representation,
> function, and surface — and wrong in craft — is wrong.

## 🔒 MANDATORY ENFORCEMENT GATE

Before applying this skill, emit the acknowledge line:

`[web-design] Craft protocol engaged — executing under representation → function → surface → craft.`

Then enforce every gate check:

1. **Layer check.** If the real question is what the page *is*, route to `think-different`.
   If it is what the page *does* (value order, proof, CTA), route to `product-design`.
   If it is how the page *feels* (atmosphere, type voice, material), route to
   `japanese-design`. Build only when the upper layers are settled or explicitly delegated.
2. **Craft-task check.** There must be something to build, implement, or
   execution-critique. Doctrine debates are not craft tasks.
3. **Ban check.** If the request names a banned-by-default technique, respond with the
   contrast posture: why the doctrine rejects it, the earn-back condition, and the
   restrained alternative. Do not comply casually.
4. **Tradeoff required.** Every craft recommendation names its cost: weight, complexity,
   attention, maintenance.
5. **Floor constraints.** Performance budget, `prefers-reduced-motion`, and accessibility
   are non-negotiable inputs, not polish. A build that fails them is not finished.

## Position in the Hierarchy

| Layer | Skill | Decides |
|---|---|---|
| Representation | `think-different` | What the page is; category; soul; what to cut |
| Function | `product-design` | Value spine, proof order, the one primary action |
| Surface | `japanese-design` | Ma, shibui, materiality, type voice, motion character |
| Identity | `twin-sparrow-taste` | Chief's taste constants; instrument over dashboard |
| **Craft** | **`web-design`** | **Grid tokens, motion tokens, reveals, assembly, QA** |

Conflict rule: this skill never overrides an upper layer. If a craft decision would
reorder the value spine, demote the primary action, or contradict surface doctrine,
surface the conflict and escalate instead of silently building. What this skill uniquely
owns: the numbers, the mechanics, the build order, and the checklist.

## Layout Systems

Distilled from: `agency-grid-layout-minimal`, `container-lines`, `framed-grid-layout`,
`nested-container-frames`, `split-layout-technical`, `image-first-grid-layout`,
`number-details`.

### Editorial grid defaults

- Wide page shell with explicit columns; every section snaps to the same grid.
- Dominant headline spans most of the grid; supporting copy anchors in a narrow side
  column. Asymmetry over centering when the page is expressive or conceptual.
- Generous negative space is structural (ma), never leftover. Do not fill a gap because
  it exists.
- Imagery as large architectural blocks, never card galleries.

```css
:root {
  --container-max: 1120px;
  --container-pad: clamp(20px, 4vw, 48px);
  --grid-gap: 16px;
  --line-color: rgba(24, 24, 27, 0.14);
  --line-strong: rgba(24, 24, 27, 0.28);
  --corner-size: 6px;
}
.content-container {
  width: min(100% - (var(--container-pad) * 2), var(--container-max));
  margin-inline: auto;
}
```

### Hairline structure

Structure is shown with hairlines, not chrome:

- Container guide lines: 1px verticals at the true container edges, behind content,
  `pointer-events: none`, consistent across all sections.
- Corner squares: 4–8px, placed only on real container or section corners.
- Framed sections: one border color, one weight (1px), one spacing scale for the whole
  page. Rectangular and precise; radius only where material logic demands it.
- **One framing motif per page.** Container lines, corner squares, framed grid, or
  L-brackets — pick one. Stacking framing systems turns structure into HUD ornament.
- Text clears frame lines through generous gutters. Copy never touches a rule.

### Split and image-first patterns

- Split layout: two panels on the shared grid — one immersive (media), one
  spec/metadata. Thin frame lines, no glass, no gradient window chrome.
- Image-first: full-bleed photography as the stage; copy bottom-anchored; legibility via
  honest solid scrims or placement, not blur washes.

### Editorial numbering

`01 02 03` markers in mono or small caps, low contrast, as secondary structure only.
Numbering is metadata, never a decoration system.

## Typography Execution

Distilled from: `editorial-tech`, `book-serif-index`, `light-mode-paper-technical`.
Letterform, weight, and voice are owned by `japanese-design` (Shippori Mincho, Zen Kaku
Gothic New, Klee One as sparse accent). This skill executes scale and rhythm.

- Confident scale contrast: oversized display headlines with tight tracking and
  deliberate line breaks, against very small uppercase utility labels and calm body copy.
- Utility-label system: tiny uppercase metadata, timestamps, section markers — placed in
  adjacent grid columns where they clarify hierarchy, omitted where they do not.
- Serif index structures (drop caps, marginalia, two-zone reading shells) only when the
  page is genuinely archival or editorial; never as costume.
- Line length, wrap points, and heading breaks are checked after fonts load; reveal
  splitting initializes after `document.fonts.ready` when line integrity matters.

## Motion Engineering

Distilled from: `animation-systems` (token doctrine), `cinematic-gsap-lenis-motion-system`
and `cinematic-scroll-storytelling` (engineering harvest), `gsap-scrolltrigger-storytelling`
(pin discipline), `animation-on-scroll`, `masked-reveal`.

Motion exists to explain hierarchy, confirm action, guide attention, and maintain
continuity. If a movement serves none of those, delete it. One strong hero moment per
page; everything else is supporting motion. Motion character (mass, restraint, stillness)
is decided by `japanese-design`; this section supplies the numbers and wiring.

### Motion tokens

| Token | Value |
|---|---|
| Micro (hover, press) | 120–200ms |
| UI state change | 180–260ms |
| Small transition (popover, toast) | 220–320ms |
| Section entrance | 400–800ms |
| Hero sequence | 800–1600ms, with internal beats |
| Easing | ease-out family (`power3.out`, `power4.out`, `expo.out`); ease-in for exits |
| Stagger | 40–90ms per element; words 35–70ms; smaller on mobile |
| Standard offsets | 8 / 16 / 24 / 32px rise |
| Reveal trigger | `start: "top 82%"`, animate once |
| Scroll scrub | 0.8–1.4 only inside earned pinned scenes |

Hard rules: animate `transform` and `opacity` only (short-lived `clip-path` allowed for
reveals). No elastic or bounce. No blur-in entrances — the `blur(8px) → 0` flourish is
stripped from every admitted recipe. No animated layout properties. `will-change` only on
elements that actually animate.

### Setup (GSAP + Lenis, when smooth scroll is earned)

Lenis is opt-in, not default. Native scroll is the honest baseline; add Lenis only when
the page is a long-form editorial or story surface that benefits from paced reading.

```js
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power3.out", duration: 0.85 });

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis;
if (!reduceMotion && PAGE_EARNS_SMOOTH_SCROLL) {
  lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.9, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
window.addEventListener("load", () => ScrollTrigger.refresh());
```

Reusable `data-*` markup API so motion stays declarative:

```html
<h1 data-motion-text="lines">…</h1>
<section data-reveal-group>
  <article data-reveal="fade-up" data-reveal-item>…</article>
</section>
<figure data-image-reveal><img src="…" alt="…"></figure>
```

Engineering discipline (non-negotiable):

- Reveals animate once (`once: true`); no replay on micro-scroll.
- Pinned sections are story moments only, one idea per viewport, `anticipatePin: 1`,
  never overlapping the next section. Scroll must never be trapped.
- Parallax is speed difference, not drama: background slower, text stable, offsets small,
  `invalidateOnRefresh: true`.
- In React/SPA routes: wrap setup in `gsap.context()`, `ctx.revert()` on cleanup, kill
  ScrollTriggers before route transitions.
- `ScrollTrigger.refresh()` after images, fonts, or layout shifts.
- Reduced-motion policy: content visible, instant state plus subtle opacity, scrub and
  pin disabled, smooth scroll off. The page must read perfectly with all motion removed.

Banned in this section regardless of request framing: magnetic hover, custom cursors,
blend-mode cursor tricks, mouse-reactive parallax layers, scroll-jacking, preloader
theater. See Banned by Default.

## Reveal & Masking

Distilled from: `masked-reveal`, `staggered-word-reveal`, `css-alpha-masking`, clip
reveals from the cinematic harvest.

- Masked text reveal: words rise through an overflow mask. `yPercent: 110 → 0`,
  0.7–0.9s, `power3.out`/`expo.out`, stagger 25–45ms, once. Stagger by word, never by
  letter. Short headlines and section intros only — never paragraphs.
- Accessibility is part of the mechanic: original text preserved via `aria-label`,
  word spans `aria-hidden`, spaces intact, static text under reduced motion, no splitting
  of text containing links or meaningful inline markup.
- Clip image reveal: `clip-path: inset(0 0 100% 0) → inset(0 0 0% 0)` with a subtle
  settle (`scale: 1.08 → 1`), 1.1–1.2s, once. No blur pass.
- Alpha masking: `mask-image` linear-gradient edge fades for honest content overflow
  (long lists, horizontal media strips), with `-webkit-` fallback. A fade communicates
  "more content"; it is not an atmosphere effect.
- Reveals serve reading rhythm. If a reveal makes the reader wait for content they came
  for, cut it.

## Texture & Material

Distilled from: `dither-background`, `light-mode-paper-technical`,
`clean-minimal-beige-light-mode`; shadow policy resolved from the `beautiful-shadows`
contrast decision.

### Surfaces

- Warm paper and stone neutrals over stark white; layered low-contrast surfaces over
  elevation stacks. Tonal shifts and hairlines separate planes.
- Texture must read as material truth (wabi-sabi), not effect: diagonal line texture and
  grain stay below ~0.05 opacity and survive close inspection as surface tension only.
- Monochrome ordered-dither fields are the admitted atmospheric texture: near-black or
  paper monochrome, static by default; drift must be earned by the page's purpose and
  never sits behind reading-dense content.

### Shadow policy

Borders and tonal shifts first. Flat planes plus spacing are the default statement of
hierarchy. Exactly one layered-shadow recipe is sanctioned, and only for surfaces that
genuinely float above the page plane — popovers, modals, dragged elements:

```css
--shadow-floating:
  0px 0px 0px 1px rgba(0, 0, 0, 0.06),
  0px 1px 1px -0.5px rgba(0, 0, 0, 0.06),
  0px 3px 3px -1.5px rgba(0, 0, 0, 0.06),
  0px 6px 6px -3px rgba(0, 0, 0, 0.06),
  0px 12px 12px -6px rgba(0, 0, 0, 0.06),
  0px 24px 24px -12px rgba(0, 0, 0, 0.06);
```

Never on resting cards, list items, or section blocks. Never tinted. Never stacked with
other shadow utilities. Elevation-as-decoration is banned; elevation-as-fact is one token.

## Page Assembly

Distilled from: the `landing-page` and `pricing-page` transforms, cinematic QA
checklists, `animation-systems` output discipline.

### Build order

1. Shell: container width, padding, page grid.
2. Grid: section spans, column placements, gutters.
3. Type: scale system, headline breaks, utility labels.
4. Content: real copy in the product-design value spine order — promise, clarity, proof,
   mechanism, value translation, objection handling, action.
5. Structure lines: the one framing motif, applied consistently.
6. Motion: tokens applied to the assembled page; hero moment last.
7. QA: the checklist below.

Structure before decoration at every step: the page must read completely with motion,
texture, and imagery removed.

### Assembly rules

- Exactly one dominant primary CTA per page; secondary actions stay quiet.
- Proof is specific and static: named results, real artifacts, honest evidence. No logo
  marquees, no testimonial carousels, no scrolling trust theater.
- Pricing and comparison surfaces optimize for reading, not steering: honest tables,
  plan descriptions in user outcomes, no fake urgency, no "recommended" theater unless
  the recommendation is argued.
- Sections earn their place in the argument order or get cut. A page is a single ordered
  argument, not a stack of blocks.

### QA checklist

- Reduced motion: full content, no scrub, no pin, no smooth scroll.
- JS disabled: text and content visible (reveal CSS gated on a `js`/`has-motion` class).
- Mobile: pins simplified or removed; stagger reduced; touch gets no hover-dependent
  meaning.
- No CLS from reveals or pins; pinned sections hand off cleanly.
- Canvas/DPR clamped 1–2 on any heavy surface; `ctx.revert()` verified on SPA routes.
- Contrast passes on both themes; text clears all frame lines; focus states visible.
- The page still reads as designed with every decorative layer stripped.

## Banned by Default (Earn-Back Conditions)

Each entry: the ban, the narrow earn-back, and where the technique record is preserved
(contrast entries in `/Users/lesz/Developer/MengTo-Skills/agent-skills/web-design/`).

- **Glassmorphism / frosted panels** — banned by japanese-design outright. Earn-back:
  none as a design language; a single translucent functional layer requires explicit
  justification. Record: `dark-glass-clean-layout`, `blue-laser-clean-glass-layout`.
- **Gradient borders, mesh gradients, gradient heroes** — the definitive slop signature.
  Earn-back: at most one focus/active accent, explicitly argued. Record:
  `css-border-gradient`, `mesh-gradient-dark-blue-clean`.
- **Lasers, glow, bloom, neon** — light as ornament announces itself before it serves.
  Earn-back: the product is literally about light/optics, and even then scoped to one
  moment. Record: `webgl-laser`, `corner-lasers`, `atmosphere-background`.
- **WebGL spectacle (globes, particle fields, blobs, hosted scenes)** — decoration
  cosplaying capability. Earn-back: the content is genuinely spatial or geographic; then
  build local and authored, never embed remote scenes. Record: `globe-particles`,
  `webgl-3d-object`, `gooey-blob-system`, `unicorn-studio`, `vantajs`.
- **HUD ornament (corner diagonals, crosshairs, fake telemetry, wireframe décor)** —
  ornament pretending to be information. Earn-back: the readout is real and changes
  operator judgment. Record: `corner-diagonals`, `technical-wireframe-info-layout`.
- **Skeuomorphism, bevels, embossing** — material dishonesty. Earn-back: none. Record:
  `skeuomorphic-ui`, `high-contrast-skeuomorphic-clean`.
- **Ambient marquees / logo carousels** — autonomous motion performing credibility.
  Earn-back: user-initiated reels of genuinely sequential material. Record:
  `marquee-loop`, `company-logos`.
- **Elevation-first shadows on resting surfaces** — see Shadow policy; one floating
  token only. Record: `beautiful-shadows`.
- **Progressive blur as surface material** — iOS-glass chrome by another name.
  Earn-back: viewport-edge readability scrim under fixed chrome only. Record:
  `progressive-blur`.
- **Saturated accent costumes (acid green, fuchsia, brand-orange washes)** — palette as
  personality. Earn-back: accent as structural evidence of state per japanese-design's
  warmth rule. Record: `funky-purple-container-tech`, `tech-green-dark-mode-modern`.
- **Physics decoration** — simulation without a simulated subject. Earn-back: the
  content is the simulation. Record: `matterjs`.
- **Custom cursors, magnetic hover, mouse-reactive layers** — interaction performing
  intelligence instead of explaining state. Earn-back: none for product/editorial pages.
  Record: `cinematic-gsap-lenis-motion-system` (contrasted portions noted in its
  provenance).
- **Scroll-jacking and preloader theater** — the reader's scroll is not a stage.
  Earn-back: pinned story moments per the pin discipline above; loaders only when load
  time is real and the loader is honest progress. Record: `cinematic-scroll-storytelling`
  (contrasted portions noted in its provenance).
- **Blur-in reveals (`blur(8px) → 0`)** — trendy flourish stripped from all admitted
  recipes. Earn-back: none; masked rise carries the same rhythm honestly.

## Composition Rules

- Building a page from scratch, load in order: `think-different` (if soul is unclear) →
  `product-design` (spine) → `japanese-design` (surface) → `web-design` (build).
- Respect `japanese-design`'s mandatory reference gate: never load its external style
  references (cursor, elevenlabs, mistral.ai, vercel, warp) yourself; that gate belongs
  to japanese-design and requires asking the user first.
- When Chief asks this skill a surface question ("make it feel more Japanese", "warmer
  atmosphere"), route to `japanese-design` — do not improvise surface doctrine here.
- When conversion pressure and restraint collide during assembly, apply product-design's
  composition rule: function wins structure, doctrine wins surface, and genuine
  collisions are surfaced, never silently resolved.
- For TUI work, use `twin-sparrow-taste`; this skill is web-only and installs nothing
  into `packages/tui`.

## Non-Goals / Do Not Invoke

- Doctrine debates, brand identity, product strategy, or representation questions —
  route up the hierarchy.
- Twin-Sparrow TUI design — `twin-sparrow-taste` owns the terminal.
- Single-property fixes, token wiring, copy nits, spacing nits — execute directly with
  normal engineering discipline; no gate, no ceremony.
- Requests that are really banned-technique requests — respond with the contrast
  posture, not a build.

## Output Format

```md
## Craft plan        — what is being built and which upper-layer decisions it executes
## Layout tokens     — container, grid, line, and spacing values
## Motion tokens     — durations, easings, staggers, triggers actually used
## Build order       — numbered steps for this specific page
## Doctrine handoffs — what was deferred to think-different / product-design / japanese-design
## QA checklist      — the checks that apply to this build
## Risk / tradeoff   — named cost of the chosen approach
```

Compact responses for small craft tasks; full format for page-level builds.

## Quality Bar

A good response: emits the acknowledge line; routes layer questions up instead of
absorbing them; gives concrete tokens and a build order, not adjectives; strips banned
flourishes from any recipe it adapts; enforces reduced-motion and the QA floor; names the
tradeoff; refuses banned defaults with the earn-back and alternative.

A bad response: silently restyles structure the upper layers own; invents surface
doctrine; applies glass, gradients, glow, or scroll-jacking because the request sounded
casual; ships motion without reduced-motion handling; decorates instead of building;
omits the tradeoff.

## Verification

1. "Build the hero section for this landing page." → Gate line; if no value spine
   exists, defers spine to `product-design`; returns grid and motion tokens plus a build
   order.
2. "Add a glassmorphism panel here." → Contrast posture: ban named, earn-back stated,
   restrained alternative offered. No glass shipped.
3. "Make the page feel more Japanese." → Routes to `japanese-design`; no cosplay, no
   improvised surface doctrine.
4. "Fix this margin value." → Non-trigger; direct execution without ceremony.
5. "Add scroll storytelling to the product page." → Pin discipline applied; no
   scroll-jacking; reduced-motion policy stated; narrative decisions escalated to
   `product-design`.

## Command Name

Use `web-design` for commands, documentation, routing, and skill references.
