# Origin

Aspora's design system. Foundations, tokens, guidelines, and tooling for building consistent experiences across all platforms.

## What this is

Origin is the source of truth for Aspora's design decisions. It holds:

- **Foundation tokens** (color, typography, spacing, motion, iconography) as machine-readable JSON
- **Foundation guidelines** (photography, voice, illustration, and all of the above) as structured markdown
- **Component guidelines** with links to visual specs in Figma
- **Generated outputs** for every platform — CSS, Tailwind, JSON, and AI-consumable context
- **Brand strategy** content (pillars, positioning, personas)

Origin is a knowledge base, not a component library. It defines *what the design decisions are* — platform teams build their own implementations from these decisions.

## Three-repo architecture

| Repo | Owner | Purpose |
|------|-------|---------|
| **origin** (this repo) | Hakeeb | Design system — tokens, guidelines, tooling |
| **aspora-design-site** | Suddo | Docs experience — crafted microsites for each foundation and component |
| **aspora-brand-lab** | Suddo | Creative studio — asset generation, prototyping, visual exploration |

Origin produces. The other two consume. Design site and brand-lab pull from Origin's generated outputs.

## Repo structure

```
foundations/          Source of truth — tokens + guidelines per foundation
components/           Usage guidelines + links to Figma/uSpec visual specs
outputs/              Generated platform outputs (JSON, CSS, Tailwind, AI context)
strategy/             Brand strategy content
lab/                  Exploration tools, pipelines, and documentation
migration/            Old-to-new token mapping (temporary, removed post-rebrand)
```

See `lab/README.md` for documentation conventions.

## How platforms consume

- **iOS / Android**: Engineers reference `outputs/json/` and update platform token files manually
- **Web projects**: Consume `outputs/css/` and `outputs/tailwind/` directly
- **Figma**: Variables pushed via consolidated plugin in `lab/figma-plugin/`
- **AI tools**: Consume `outputs/ai/` for machine-readable design context

## Status

Early setup. Color foundations established (114 primitives, 47 semantic tokens with light/dark modes). Typography, spacing, and remaining foundations in progress.
