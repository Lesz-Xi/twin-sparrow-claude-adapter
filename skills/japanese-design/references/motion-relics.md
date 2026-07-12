# Relics Motion — Craft Numbers

**For:** `web-design` craft execution under `japanese-design` surface character.
**Source:** Relics showcase + taste-template (shipped 2026).

> No blur-in. Soft blur only as scrub **recede** when leaving the reading band.

---

## Tokens

| Token | Relics / taste default |
|-------|------------------------|
| Micro (hover) | ~160ms (`--dur-micro`) |
| UI | ~240ms (`--dur-ui`) |
| Fill-up pill | ~500ms, ease-fill |
| Ease working | `power3.out` / cubic-bezier(.22,1,.36,1) |
| Scrub y (content) | ~18–26px mobile / desktop |
| Scrub y (plates) | ~22–32px |
| Scrub scale base | 0.98 (plates) / 1 (content) |
| Scrub blur (recede) | ~2–3.5px content / ~3–5px plates |
| Line mask travel | ~108% |
| Clip wipe | ~1.05–1.1s, `power3.out` |
| Stagger | 40–90ms when grouping |

Animate only: `transform`, `opacity`, short-lived `clip-path`. No elastic, no bounce.

---

## Scrub grammar (distance-from-center)

CSS vars on `.rv` / `.rv-scale`:

- `--scrub-o`, `--scrub-y`, `--scrub-scale`, `--scrub-blur`

Markup:

| Attribute | Use |
|-----------|-----|
| `data-rv` | Content blocks — opacity + y + soft recede blur |
| `data-rv-scale` | Proof plates — slight scale + stronger recede |
| `data-rv-stay` | Stay fully clear after crossing **above** center; use only when that crossing is geometrically possible |
| `.disp` + `.lnw` / `.ln-line` | Display line mask via `--ln-y` |

Progress: element center vs viewport center band (~0.54–0.56 vh). Ease-out; lerp smooth for wheel steps. Wire Lenis `scroll` to the same scheduler when Lenis is present.

Default: reversible around center (distance-based).
With `data-rv-stay`: if element is above center (`signed < 0`), force progress = 1 (no exit blur).

---

## Other motion

- **Clip-path wipe** on media: `inset(100% 0 0 0) → inset(0 0 0 0)`; counter-scale settle.
- **Parallax** on media only if earned: small `yPercent` (~−6), scrubbed; never traps scroll.
- **Kinetic deck**: own interaction; no float drop-shadow on front card.
- **Lenis**: opt-in (`lerp` ~0.12); native scroll is default honest baseline.

### Causal handoff

One structural edge may connect adjacent representations when the movement explains continuity rather than decorating a section change.

- Measure the source edge and target rule; do not guess their geometry.
- **Stretch first, descend second** so the edge remains causally attached before resolving into the next plane.
- Keep the leading object clear longest; rear objects may recede by restrained translation, opacity, and exit blur.
- Use transform and opacity; no pin, scroll trap, looping flourish, or animated layout property.
- Under reduced motion, remove the traveling edge and render aligned static rules.

### Terminal clarity

Reversible scrub belongs only to content that can cross the reading band. End-of-document surfaces usually cannot.

- Footers, terminal notes, legal copy, and final controls default to static clarity.
- `data-rv-stay` does not repair an element that can never move above center; remove that element from scrub instead.
- At maximum scroll, terminal content must resolve to `opacity: 1`, `filter: none`, and `transform: none`.
- Verify contrast independently from motion state; low-contrast ink plus residual opacity can look blurred even when filter blur is small.

**Observed failure — taste template footer:** reversible scrub ended at `opacity: 0.922`, `blur(0.27px)`, and `translateY(2.02px)`. Removing the footer from scrub corrected the terminal state to `1 / none / none`.

---

## Reduced motion

```
prefers-reduced-motion: reduce
→ --scrub-o: 1; y: 0; scale: 1; blur: 0
→ --ln-y: 0%
→ no Lenis, no pin theater, content fully visible
→ causal handoffs resolve as aligned static rules
```

---

## Banned motion

- Blur-in (`blur(8px)→0` on entrance)
- Magnetic hover, custom cursors, mouse-reactive layers
- Scroll-jacking, preloader theater
- Elastic / bounce / spring spectacle
- Soft blur as constant surface material (only scrub recede)

---

## Conflict with older craft packs

MengTo / Aura harvest may say “never blur.” Relics **clarifies**:

| | Rule |
|--|------|
| Entrance | No blur |
| Exit recede (scrub) | Soft blur allowed, restrained |
| Resting UI / terminal surfaces | No blur; full opacity; no residual transform |

`web-design` must follow this file when building Twin-Sparrow web pages.
