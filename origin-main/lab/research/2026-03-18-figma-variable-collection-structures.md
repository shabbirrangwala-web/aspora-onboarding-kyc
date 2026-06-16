# Figma variable collection structures — research

## Status
2026-03-18. Research into how to structure Figma variable collections for the Aspora design system. Covers approaches, tradeoffs, API constraints, and recommendation for our setup.

## Context

We're setting up Figma with this architecture:
- **Lab** — unpublished, for experimentation
- **Foundations** — published, variables generated from code via custom plugin (code is source of truth)
- **Components** — published, icons + components built in Figma

Professional plan (10 modes per collection max).

---

## The three approaches to collection structure

### Approach 1: By category (flat)

Collections split by token type: `Colors`, `Spacing`, `Typography`, `Elevation`.

Each collection holds all abstraction levels (primitive + semantic) for that category.

**Pros**: Simple, few collections, easy to find things.
**Cons**: Conflates raw values with meaningful assignments. Modes get awkward — a `Colors` collection needs light/dark modes but the primitives within it don't need modes at all. Can hit the 5,000 variable limit per collection sooner with a large color system.

### Approach 2: By abstraction level (layered) — the dominant pattern

Collections split by role in the token hierarchy:

- **Primitives** (aka Core / Global) — raw values: `Blue/500 = #2196F3`, `Space/4 = 4`
- **Semantic** (aka Alias / Tokens) — meaningful assignments: `color/text/primary`, `color/surface/success`
- **Component** (optional third tier) — scoped to specific components: `button/bg/primary`, `card/padding`

Aliases chain across collections: `Component → Semantic → Primitive → raw value`.

**Pros**: Clean separation of what a value *is* vs what it *means*. Primitives can have one mode, semantic can have light/dark — no conflict since all variables in a collection share the same modes. This is what GitHub Primer, Shopify Polaris, and Intuit all use. It's also what Figma recommends.

**Cons**: More collections, cross-collection aliasing adds indirection.

### Approach 3: Hybrid (category + abstraction)

Collections like `Color — Primitive`, `Color — Semantic`, `Spacing — Primitive`, `Spacing — Semantic`.

**Pros**: Maximum granularity, each collection is small and focused.
**Cons**: Collection sprawl. A modest system ends up with 8-10 collections. More tabs to manage in the variables panel.

---

## Why abstraction-level (approach 2) wins

The key constraint: **all variables in a collection share the same modes.**

If primitives and semantic tokens are in the same collection, primitives (context-independent) are forced to have light/dark mode values even though they shouldn't. Separating by abstraction level solves this naturally:

| Collection | Modes | Example |
|---|---|---|
| Primitives | Single mode (values are absolute) | `Blue/500 = #2196F3` |
| Semantic | Light, Dark, High Contrast | `color/text/primary → Blue/900` (light) / `Blue/100` (dark) |
| Component (optional) | Inherits from semantic or adds overrides | `button/bg/primary → color/interactive` |

Within each collection, use slash-separated naming (`color/blue/500`, `spacing/gap/md`) to create groups in the Figma UI. This gives categorization without needing separate collections per category.

---

## Multi-brand and theming

Three dimensions teams commonly encode:

| Dimension | Best encoded as | Example |
|---|---|---|
| Theme (light/dark) | Modes on Semantic collection | `light`, `dark`, `high-contrast` |
| Brand | Separate Primitive collections per brand, or modes on a Brand collection | `BrandA`, `BrandB` |
| Density | Modes on a Spacing collection | `compact`, `default`, `comfortable` |

**Don't combine all three as modes on one collection.** Mode limits are plan-gated and `brands × themes × densities` blows up fast.

Figma also recently shipped **Extended Collections** (Enterprise only) where a parent collection can be extended per brand — child collections inherit everything and only override what differs. Not available on Professional plan.

### Mode limits by plan

| Plan | Max Modes per Collection |
|---|---|
| Professional | 10 |
| Organization | 20 |
| Enterprise | 40 |

---

## Tradeoffs: fewer large collections vs many small collections

| Factor | Fewer Large | Many Small |
|---|---|---|
| Designer experience | Fewer tabs to switch in variables panel | Each collection is focused, less scrolling within |
| Variable picker usability | Can be overwhelming with thousands of variables | Cleaner per-collection, but must know which collection to look in |
| Mode explosion | Risk of needing many modes if combining concerns | Each collection has only the modes it needs |
| Plugin automation | Fewer API calls to enumerate; simpler iteration | More granular control; can update one collection without touching others |
| Maintenance | Harder to reason about — mixed concerns | Clear separation of concerns; easier to assign ownership |
| Scalability | Hits 5,000 variable limit sooner | Distributes variables across collections |
| Cross-collection aliasing | Not needed (everything internal) | Requires aliases across collections, adding indirection |
| Restructuring later | Painful — must recreate variables (breaks alias references) | Same risk but smaller blast radius per migration |

**Consensus**: 2-4 collections organized by abstraction level, with groups (slash-separated naming) for categorization within each collection.

---

## Real-world examples

### GitHub Primer
- Two-layer model: **base color tokens** (primitives) and **functional color tokens** (semantic)
- Functional tokens like `fgColor-default`, `bgColor-muted` reference base tokens and respect color modes
- Token metadata includes Figma-specific extensions for collection, mode, and scoping
- Tokens defined in JSON (`@primer/primitives` package), pushed to Figma

### Shopify Polaris
- Replaced color Styles with Figma variables entirely as of v12.0.0
- Tokens are code-defined and pushed to Figma, covering color, spacing, typography

### Intuit (TurboTax, QuickBooks, Mailchimp, CreditKarma)
- Code-first approach using the Figma REST API
- Core system supports multi-brand and multi-platform with brand-specific overrides
- Key discovery: the REST API offers no change management — POSTing updates instantly modifies the file with no diff or notification

### Material Design 3
- Dynamic color system based on seed colors
- Tokens organized into color roles (primary, secondary, tertiary, surface, error) with tonal palettes
- Variables with light/dark modes

---

## Figma plugin API constraints

Since we're building a custom plugin to push code-defined tokens into Figma:

### Variable types
Only four types supported: `COLOR`, `FLOAT`, `STRING`, `BOOLEAN`. No composite types — **shadows, gradients, and typography must remain as Figma Styles**, not variables.

### Critical limitations

1. **No upsert operation.** Must enumerate existing variables, match by name or stored ID, decide whether to create or update. Store a mapping of token names → Figma variable IDs for incremental sync.

2. **Don't delete and recreate.** That breaks every reference in the Components file. Update in place.

3. **Cross-collection aliases work** via `createVariableAlias()`. Semantic variables can reference primitives in a different collection.

4. **`setVariableCodeSyntax(platform, syntax)`** sets code syntax for WEB, ANDROID, iOS — useful for mapping back from Figma to code tokens.

5. **Hide primitives from publishing** via `hiddenFromPublishing` on the collection. Designers only see semantic tokens.

6. **5,000 variables per collection** hard limit across all plans.

7. **Async-first API.** Synchronous methods (`getLocalVariables`, `getLocalVariableCollections`) are deprecated. Use `getLocalVariablesAsync()` and `getLocalVariableCollectionsAsync()`.

8. **Variable scoping** (`variable.scopes`) controls where a variable appears in the picker. Known bug: imported library variables always return `ALL_SCOPES` regardless of actual configuration.

9. **REST API variable writes are Enterprise-only.** Our plugin uses the Plugin API which has no plan restriction — this doesn't affect us.

10. **Naming**: `/` creates groups in the UI. Names must be unique within a collection.

---

## Recommendation for Aspora

Given our architecture (code → plugin → Foundations, components built in Figma, Professional plan):

### Two collections in the foundations file

| Collection | Contents | Modes | Published? |
|---|---|---|---|
| **Primitives** | Raw color palette, raw spacing scale, raw type scale | Single mode | Hidden from publishing |
| **Semantic** | `color/text/*`, `color/surface/*`, `spacing/gap/*` — aliased to primitives | Light, Dark | Published |

### Why not a component collection?

Since components are built in Figma, designers can reference semantic tokens directly. A third collection layer adds indirection without much benefit unless we reach a scale where component-specific overrides are common.

### Why not separate by category?

Groups within collections (via slash naming) give us the same categorization without the overhead of more collections. `color/blue/500` and `spacing/gap/md` are distinct groups inside the same Primitives collection.

### Mode budget (Professional plan: 10 per collection)

- Primitives: 1 mode used → 9 remaining
- Semantic: 2 modes (light/dark) → 8 remaining for future themes

No risk of hitting the limit with current architecture.

---

## Sources

- [Design System Mastery with Figma Variables (2025/2026 Playbook)](https://www.designsystemscollective.com/design-system-mastery-with-figma-variables-the-2025-2026-best-practice-playbook-da0500ca0e66)
- [How to Structure Figma Variables & Design Tokens (zeroheight)](https://zeroheight.com/blog/figma-variables-and-design-tokens-part-one-variable-architecture/)
- [Organize Variables in 3 Levels (Alice Packard)](https://www.alicepackarddesign.com/blog/organize-your-variables-in-3-levels-of-collections)
- [How I Organize Variables in Figma (Joey Banks)](https://medium.com/@joeyabanks/how-i-organize-variables-in-figma-8debf7c06f26)
- [Figma Help: Variables, Collections, and Modes](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes)
- [Figma Help: Modes for Variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)
- [Figma Dev Docs: Working with Variables](https://developers.figma.com/docs/plugins/working-with-variables/)
- [Figma Dev Docs: Variables REST API](https://developers.figma.com/docs/rest-api/variables-endpoints/)
- [Figma Blog: Schema 2025 — Design Systems](https://www.figma.com/blog/schema-2025-design-systems-recap/)
- [Using Figma Variables for Multi-Brand (Rangle.io)](https://rangle.io/blog/using-figma-variables-to-build-a-multi-brand-design-system)
- [Structuring Scalable Figma Variables (Border Crossing UX)](https://bordercrossingux.com/structuring-figma-variables/)
- [Synchronizing Figma Variables with Design Tokens (Nate Baldwin / Intuit)](https://medium.com/@NateBaldwin/synchronizing-figma-variables-with-design-tokens-3a6c6adbf7da)
- [GitHub Primer Primitives](https://github.com/primer/primitives)
- [Shopify Polaris Styles (Figma Community)](https://www.figma.com/community/file/1293614121185734569/polaris-styles)
