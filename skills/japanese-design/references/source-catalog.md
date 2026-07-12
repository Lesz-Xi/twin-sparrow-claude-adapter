# Source Catalog — Japanese Design Grounding

## Primary (always real)

| Source | Path / URL |
|--------|------------|
| Hara doctrine (skill) | `references/hera-doctrine.md` |
| Relics language (skill) | `references/relics-language.md` |
| Relics motion (skill) | `references/motion-relics.md` |
| Surface contract | `references/surface-grounding.md` |
| Hara origin (Relics repo) | `/Users/lesz/Developer/Twin-Sparrow/Aura/showcase/DESIGN-Hera-Doctrine.md` |
| Relics live | https://relics.quest/index.html |
| Relics local showcase | `/Users/lesz/Developer/Twin-Sparrow/Aura/showcase/index.html` |
| Taste specimen | `/Users/lesz/Developer/Twin-Sparrow/Aura/showcase/taste-template.html` |

## Skill author roots

| Role | Path |
|------|------|
| Monorepo skills (author) | `/Users/lesz/Developer/Twin-Sparrow/skills/` |
| Agent skill root | `~/.twin-sparrow/agent/skills/` (symlinks into monorepo) |
| Marketplace plugin | `~/.claude/plugins/marketplaces/twin-sparrow-marketplace/skills/` |
| Runtime cache | `~/.claude/plugins/cache/twin-sparrow-marketplace/twin-sparrow/0.0.2/skills/` |

## Optional (load only if present)

| Source | Path |
|--------|------|
| Visual Doctrine deep handoff | `/Users/lesz/Downloads/Visual-Doctrine/handoff/visual-doctrine-deep-handoff.md` |
| MengTo web-design contrast archive | `/Users/lesz/Developer/MengTo-Skills/agent-skills/web-design/` |

If an optional path is missing, **do not fail**. Continue with Hara + Relics.

## External style corpus (gated)

Only after user confirms one of: `cursor`, `elevenlabs`, `mistral.ai`, `vercel`, `warp`.  
Relics is **not** in this list — it is Twin-Sparrow’s own specimen, not an external costume.

## Composition

Do not load multiple external styles unless the user asks for comparison.  
Doctrine-first work (Hara / Relics / Visual Doctrine) does **not** require the external gate.
