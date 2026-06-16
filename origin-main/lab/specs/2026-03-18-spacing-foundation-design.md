# Spacing foundation — design spec

## Date
2026-03-18

## Goal
Define the spacing foundation for Origin. Establish a single-layer token architecture (primitives only) with 12 values on a structured increment grid. Token format is W3C DTCG, consistent with the color and typography foundation patterns.

## Source material
- Figma spacing tokens: [Aspora Component Library](https://www.figma.com/design/Vc84mP3YDNUXAGVQOugrfa/Aspora-Component-Library?node-id=6206-2377) (14 tokens, labeled "Padding")
- Native token audit: `lab/research/2026-03-17-native-app-token-audit.md` — iOS `SpaceConstants` (13 values), Android `Dimens.Spacing` (16 values including None, XXXXXXXL=56, BottomButtons=80)
- Both platforms perfectly aligned through the core range (2-48), Android extends with 56 and 80

## Decisions

### Scale
- **12 values on a structured increment grid.** Three tiers of increments, each tier doubling the step size as values grow:
  - **4px increments** from 4 to 32: 4, 8, 12, 16, 20, 24, 28, 32
  - **8px increments** from 32 to 48: 40, 48
  - **16px increments** from 48 to 80: 64, 80
- The scale is hand-picked, not mathematically derived from a ratio. The increment structure provides the governing logic — every value is reachable from its neighbor by the tier's step size.

### Token architecture
- **Primitives only, no semantic layer.** The values ARE the API. A button uses `spacing.16`, not `spacing.standard` or `spacing.component-padding`. This is a deliberate departure from typography (which has two layers) because spacing values are self-describing — `16` communicates intent in a way that `fontSize.400` does not.
- **No composites, no aliases.** Every token is a single DTCG dimension value. There is no indirection.

### Token naming
- **Named by pixel value.** `spacing.4`, `spacing.8`, `spacing.12`, etc. The value IS the name. No t-shirt sizes (S/M/L), no abstract scales (100/200/300), no semantic labels (tight/standard/loose).
- This eliminates the naming proliferation problem visible in the current platforms (XXS, XXSALT, XXXL, XXXXL, XXXXXL, XXXXXXL, XXXXXXXL on Android).

### Modes
- Spacing has no modes. No light/dark, no responsive breakpoints in the token layer. A single `primitives.json` file.

### No generation pipeline
- Spacing tokens are hand-authored. No generation step — unlike color (which computes OKLCH ramps from brand anchors), spacing values are direct design decisions. A verification script at `lab/pipelines/spacing/verify.ts` validates structure but does not generate.

### Figma
- Pushed as `FLOAT` variables, scoped to gap + padding properties.
- **Published directly** — unlike color (where primitives are hidden and designers consume semantic aliases), spacing primitives ARE the designer-facing API. There is no semantic indirection layer, so these variables are published for library consumers. The "hide primitives" rule applies only to foundations with a separate semantic layer (e.g., color).
- Scoping configuration lives in the Figma plugin config, not in foundation files. This spec documents what values to push, not how the plugin organizes collections.

### What this does NOT cover
- Border width / stroke tokens (separate concern, deferred — see "What's Dropped" below for context on the 2px value)
- Figma plugin implementation (how variables map to collections, scoping setup) — workstream #4
- Output generation (CSS custom properties, Tailwind config, platform files) — separate workstream
- Semantic spacing aliases (YAGNI — may revisit if patterns emerge that warrant indirection, but current usage does not)

---

## Scale

### Spacing primitives (12 values)

| Token | Value | Increment Tier |
|---|---|---|
| `spacing.4` | 4px | 4px increments |
| `spacing.8` | 8px | 4px increments |
| `spacing.12` | 12px | 4px increments |
| `spacing.16` | 16px | 4px increments |
| `spacing.20` | 20px | 4px increments |
| `spacing.24` | 24px | 4px increments |
| `spacing.28` | 28px | 4px increments |
| `spacing.32` | 32px | 4px increments |
| `spacing.40` | 40px | 8px increments |
| `spacing.48` | 48px | 8px increments |
| `spacing.64` | 64px | 16px increments |
| `spacing.80` | 80px | 16px increments |

**Total: 12 primitive tokens.**

### Scale rationale
The three-tier increment structure reflects how spacing is used in practice:
- **4px tier (4-32):** Fine-grained control where small differences matter. The gap between 8px and 12px of padding inside a component is visually meaningful.
- **8px tier (40-48):** Medium jumps for layout-level spacing where 4px differences become imperceptible relative to the overall size.
- **16px tier (64-80):** Large jumps for section-level spacing where precision gives way to rhythm and breathing room.

### Relationship to typography
Spacing and typography line heights share the same 4px base grid, but they are independent token sets. Changing a spacing value does not change a line height. The shared grid means vertical rhythm is naturally aligned when combining type and spacing — a 20px line height plus 12px of vertical padding sits cleanly on the 4px grid.

---

## What's dropped

Five values from the current platforms are deliberately excluded.

### 0 (None)
- **Current:** Android `Dimens.Spacing.None`, Figma `0`.
- **Decision:** Dropped. Zero is the absence of spacing, not a spacing value. It does not need a token — omitting a spacing property or setting it to `0` in code is clearer than referencing `spacing.0`. A token for "nothing" adds noise without aiding comprehension.

### 2 (Closest)
- **Current:** iOS `SpaceConstants.closest` (2), Android `Dimens.Spacing.Closest` (2), Figma `2`.
- **Decision:** Dropped. A GitHub code search across both platforms shows this value is predominantly used for divider thickness, timeline/stepper line widths, and hairline separators — these are border-width concerns, not spacing concerns. The remaining uses (very tight title-subtitle gaps) are adequately served by `spacing.4`. Border-width tokens will be handled separately.

### 6 (XXSAlt)
- **Current:** iOS `SpaceConstants.xxsAlt` (6), Android `Dimens.Spacing.XXSAlt` (6), Figma `6`.
- **Decision:** Dropped. Too close to both 4 and 8, creating a "which one do I pick?" problem for designers. In practice, anywhere 6 is used, 4 or 8 produces an equivalent result. Eliminating the option forces consistency.

### 36 (XXXXL)
- **Current:** iOS `SpaceConstants.x4l` (36), Android `Dimens.Spacing.XXXXL` (36), Figma `36`.
- **Decision:** Dropped. Does not fit the increment grid. The 4px tier ends at 32, and the 8px tier begins at 40 (32 + 8). 36 falls between tiers — it is 4px above 32 (continuing the 4px tier past its boundary) but not 8px above 32 (which would be 40). Keeping it would break the structural logic.

### 56 (XXXXXXXL)
- **Current:** Android `Dimens.Spacing.XXXXXXXL` (56) only. Not in iOS or Figma.
- **Decision:** Dropped. Does not fit the increment grid — falls between the 8px tier ending at 48 and the 16px tier starting at 64. Also Android-only with no iOS or Figma counterpart. Usages should map to 48 or 64 on a case-by-case basis.

---

## What's new

### 64
- **Current:** Not present on any platform.
- **Decision:** Added. Fills the gap between 48 and 80 in the 16px increment tier. Without it, the jump from 48 to 80 is 32px — too large a gap for a structured scale. 64 provides a stepping stone for section-level spacing that needs more room than 48 but less than 80.

---

## Token file format

### `foundations/spacing/primitives.json`

DTCG format. All tokens grouped under a single `spacing` namespace with `$type: "dimension"` set at the group level.

```json
{
  "spacing": {
    "$type": "dimension",
    "4":  { "$value": "4px" },
    "8":  { "$value": "8px" },
    "12": { "$value": "12px" },
    "16": { "$value": "16px" },
    "20": { "$value": "20px" },
    "24": { "$value": "24px" },
    "28": { "$value": "28px" },
    "32": { "$value": "32px" },
    "40": { "$value": "40px" },
    "48": { "$value": "48px" },
    "64": { "$value": "64px" },
    "80": { "$value": "80px" }
  }
}
```

### `foundations/spacing/guidelines.md`

Prose source of truth. Covers:

- **Scale rationale**: Why three increment tiers, why these specific values, why the grid doubles at boundaries.
- **Usage by range**: 4-12 for tight component internals (icon-to-text gaps, compact list item padding, inline element spacing). 16-32 for standard padding and gaps (card padding, form field spacing, toolbar gaps, modal insets). 40-80 for section-level spacing (page margins, section dividers, hero area padding, content group separation).
- **What was dropped and why**: Migration guidance for 0, 2, 6, 36, and 56. What to use instead — 2 moves to border-width, 6 maps to 4 or 8, 36 maps to 32 or 40, 56 maps to 48 or 64 case-by-case.
- **Relationship to typography line heights**: Same 4px grid, independent tokens. How the shared grid supports vertical rhythm without coupling.
- **What this scale is NOT**: Not for border widths (separate concern), not for icon sizes, not for border radii. Spacing tokens are for padding, gap, and margin.

---

## What moves where

### `foundations/spacing/`

Source of truth for spacing tokens. Platform-agnostic, no Figma-specific data.

| File | Notes |
|---|---|
| `primitives.json` | 12 DTCG dimension tokens, named by pixel value |
| `guidelines.md` | Scale rationale, increment logic, usage guidance by range, migration notes for dropped values |

### Verification

`lab/pipelines/spacing/verify.ts` — validates:

- All 12 expected values are present (4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80)
- Increment structure is correct: 4px increments from 4-32, 8px increments from 32-48, 16px increments from 48-80
- DTCG format is valid (`$type: "dimension"`, every `$value` matches `Npx` pattern)
- No extra tokens beyond the expected 12

### Figma plugin

The existing plugin (workstream #4) will be extended to push spacing primitives as `FLOAT` variables. Variables are scoped to gap and padding properties via `variableScope` — this scoping lives in the plugin config, not in the foundation files. This spec documents what values to push, not how the plugin organizes collections.

### Migration

Native platform migration is straightforward since the core range (4-48 minus the dropped values) is identical. Migration notes:

| Current Token | Value | Origin Equivalent | Action |
|---|---|---|---|
| `None` / 0 | 0 | — | Remove token reference, use `0` directly |
| `Closest` / 2 | 2 | — | Move to border-width foundation (deferred) |
| `XXS` / 4 | 4 | `spacing.4` | Rename |
| `XXSAlt` / 6 | 6 | `spacing.4` or `spacing.8` | Map to nearest, case-by-case |
| `XS` / 8 | 8 | `spacing.8` | Rename |
| `S` / 12 | 12 | `spacing.12` | Rename |
| `M` / 16 | 16 | `spacing.16` | Rename |
| `L` / 20 | 20 | `spacing.20` | Rename |
| `XL` / 24 | 24 | `spacing.24` | Rename |
| `XXL` / 28 | 28 | `spacing.28` | Rename |
| `XXXL` / 32 | 32 | `spacing.32` | Rename |
| `XXXXL` / 36 | 36 | `spacing.32` or `spacing.40` | Map to nearest, case-by-case |
| `XXXXXL` / 40 | 40 | `spacing.40` | Rename |
| `XXXXXXL` / 48 | 48 | `spacing.48` | Rename |
| `XXXXXXXL` / 56 | 56 | `spacing.48` or `spacing.64` | Map to nearest, case-by-case (Android only) |
| `BottomButtons` / 80 | 80 | `spacing.80` | Rename (Android only) |

---

## Cross-platform comparison

| Value | Current iOS | Current Android | Figma | Origin | Notes |
|---|---|---|---|---|---|
| 0 | — | Yes (None) | Yes | Dropped | Absence of spacing |
| 2 | Yes (closest) | Yes (Closest) | Yes | Dropped | Border concern, not spacing |
| 4 | Yes (XXS) | Yes (XXS) | Yes | Yes | |
| 6 | Yes (XXSALT) | Yes (XXSAlt) | Yes | Dropped | Too close to 4 and 8 |
| 8 | Yes (XS) | Yes (XS) | Yes | Yes | |
| 12 | Yes (S) | Yes (S) | Yes | Yes | |
| 16 | Yes (M) | Yes (M) | Yes | Yes | |
| 20 | Yes (L) | Yes (L) | Yes | Yes | |
| 24 | Yes (XL) | Yes (XL) | Yes | Yes | |
| 28 | Yes (XXL) | Yes (XXL) | Yes | Yes | |
| 32 | Yes (XXXL) | Yes (XXXL) | Yes | Yes | |
| 36 | Yes (X4L) | Yes (XXXXL) | Yes | Dropped | Doesn't fit increment grid |
| 40 | Yes (X5L) | Yes (XXXXXL) | Yes | Yes | |
| 48 | Yes (X6L) | Yes (XXXXXXL) | Yes | Yes | |
| 56 | — | Yes (XXXXXXXL) | — | Dropped | Android-only, doesn't fit increment grid |
| 64 | — | — | — | **New** | Fills gap in 16px increment tier |
| 80 | — | Yes (BottomButtons) | — | Yes | Proper scale value, not one-off |

---

## Done when

- `foundations/spacing/primitives.json` has all 12 tokens in DTCG format (`$type: "dimension"`, values as `Npx` strings)
- `lab/pipelines/spacing/verify.ts` validates all 12 expected values are present, increment structure is correct, and DTCG format is valid
- `foundations/spacing/guidelines.md` covers scale rationale, usage guidance by range, migration notes for dropped values, and relationship to typography line heights
- All committed and pushed
