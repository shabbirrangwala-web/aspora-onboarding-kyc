# Radius foundation — design spec

## Date
2026-03-18

## Goal
Define the radius foundation for Origin. Establish a single-layer token architecture (primitives only, no semantic aliases), with 8 dimension tokens covering the full range from subtle rounding to pill/capsule shapes. Token format is W3C DTCG, consistent with the color and typography foundation patterns.

## Source material
- Figma radius tokens: [Aspora Component Library](https://www.figma.com/design/Vc84mP3YDNUXAGVQOugrfa/Aspora-Component-Library?node-id=6206-2541) (7 tokens: XS=4, S=8, M=12, L=16, XL=20, XXL=24, MAX=36)
- Native token audit: `lab/research/2026-03-17-native-app-token-audit.md` — iOS `CornerRadiusConstants` (8 values including 28), Android `Dimens.Radius` (7 values matching Figma)

## Decisions

### Scale
- **8 values: 4, 8, 12, 16, 20, 24, 36, full.** The scale follows 4px increments up to 24, then jumps to 36 for large containers, with `full` as a named concept for pill/capsule shapes.
- Values are named by their pixel size (`radius.4`, `radius.8`, etc.), except `radius.full` which is a named semantic concept.

### Token architecture
- **Primitives only, no semantic layer.** The values ARE the API. Unlike typography (which needs composites) and color (which needs intent-based aliases for mode switching), radius has no modes and no composition — a single flat set of values is sufficient.
- **No semantic aliases.** Adding `radius.card`, `radius.input`, `radius.modal` would be premature abstraction. Components reference the primitive scale directly. Semantic aliases are only warranted when the same intent needs to resolve to different values under different conditions (modes, themes, breakpoints). Radius has none of these.

### Token format
- **W3C DTCG, `$type: "dimension"`.** Each token has a `$value` in pixel units.
- **Named by pixel value**, not by t-shirt size. `radius.4` is clearer than `radius.xs` — the name IS the value, eliminating the need to look up what "small" means. The lone exception is `radius.full`, which names an intent rather than a pixel value.

### `radius.full`
- **Uses `$value: "9999px"`.** This is a large-enough value that produces pill/capsule shapes on any element. The value is a CSS convention — `border-radius` larger than half the element's shortest dimension produces a fully rounded shape.
- **Has `$description: "Fully rounded — produces pill/capsule shapes"`.** The description makes the intent explicit.
- **The `9999px` value works as-is on all platforms.** CSS `border-radius: 9999px` produces a pill. Figma accepts it as a large float and rounds correctly. Native platforms can use the raw value directly. Output generators MAY optimize to platform idioms (SwiftUI `Capsule()`, Compose `RoundedCornerShape(50%)`) by detecting the `full` token name, but this is optional — the raw value is functionally correct everywhere.

### Figma
- **Pushed as `FLOAT` variables, scoped to `CORNER_RADIUS`.** The Figma plugin pushes all 8 values as float variables. Scoping to `CORNER_RADIUS` ensures they only appear in the corner radius property picker, not in width/height/spacing.
- **Published directly** — unlike color (where primitives are hidden and designers consume semantic aliases), radius primitives ARE the designer-facing API. There is no semantic indirection layer, so these variables are published for library consumers. The "hide primitives" rule applies only to foundations with a separate semantic layer (e.g., color).
- **Scopes live in plugin config, not in foundation files.** The `primitives.json` file is platform-agnostic. Figma-specific metadata (variable scopes, collection names) belongs in the plugin configuration.

### Modes
- Radius has no modes. No light/dark, no responsive breakpoints in the token layer. A single `primitives.json` file.

### What was dropped
- **28 (XXXL on iOS).** Present only in iOS `CornerRadiusConstants`, absent from both Figma and Android. The value sits between 24 and 36 with no clear use case that 24 or 36 cannot serve. Removing it aligns all three platforms on the same 7-value base scale, plus the new `full` token.

### What is new
- **`radius.full` (9999px).** For pill shapes, avatars, circular buttons. Provides an explicit intent token rather than hardcoded large values scattered across component code. Neither Figma, iOS, nor Android currently have this as a named token — each platform hardcodes its own large value or shape primitive ad hoc.

### What this does NOT cover
- Border width / stroke tokens (separate concern, deferred)
- Figma plugin implementation (how variables map to collections, scope configuration) — workstream #4
- Output generation (CSS custom properties, Tailwind config, platform files) — separate workstream
- Semantic radius aliases (YAGNI — no modes, no composition, no justification for a semantic layer)

---

## Primitives

### Radius (8 values)

| Token | Value | Usage |
|---|---|---|
| `radius.4` | 4px | Subtle rounding on small elements (chips, badges, small buttons) |
| `radius.8` | 8px | Cards, inputs, dropdowns |
| `radius.12` | 12px | Larger cards, popovers |
| `radius.16` | 16px | Modals, dialog boxes |
| `radius.20` | 20px | Bottom sheets, large containers |
| `radius.24` | 24px | Prominent containers, feature cards |
| `radius.36` | 36px | Large rounded surfaces, hero cards |
| `radius.full` | 9999px | Pill/capsule shapes, avatars, circular buttons |

**Total: 8 primitive tokens.**

---

## Cross-platform comparison

| Value | Current iOS | Current Android | Figma | Origin | Notes |
|---|---|---|---|---|---|
| 4 | Yes (XS) | Yes (XS) | Yes (XS) | Yes | |
| 8 | Yes (S) | Yes (S) | Yes (S) | Yes | |
| 12 | Yes (M) | Yes (M) | Yes (M) | Yes | |
| 16 | Yes (L) | Yes (L) | Yes (L) | Yes | |
| 20 | Yes (XL) | Yes (XL) | Yes (XL) | Yes | |
| 24 | Yes (XXL) | Yes (XXL) | Yes (XXL) | Yes | |
| 28 | Yes (XXXL) | — | — | Dropped | iOS-only, no Figma or Android equivalent |
| 36 | Yes (MAX) | Yes (MAX) | Yes (MAX) | Yes | |
| full | — | — | — | **New** | Pill/capsule shapes, replaces hardcoded values |

### What changes from the current native implementation

| Aspect | Current (iOS/Android) | New (Origin) |
|---|---|---|
| Scale size | iOS: 8 values; Android: 7 values | 8 values (unified) |
| Naming | T-shirt sizes (`XS`, `S`, `M`, etc.) | Pixel values (`4`, `8`, `12`, etc.) + `full` |
| Pill shapes | Hardcoded per component | Explicit `radius.full` token |
| Token architecture | Flat constants / enums | Flat DTCG dimension tokens |
| 28px value | iOS only | Dropped — use 24 or 36 |
| Android `AppShapes` | Material3 `RoundedCornerShape` mapping | Radius tokens replace the shape abstraction |

---

## Token file format

### `foundations/radius/primitives.json`

DTCG format. 8 dimension tokens named by pixel value.

```json
{
  "radius": {
    "$type": "dimension",
    "4":    { "$value": "4px" },
    "8":    { "$value": "8px" },
    "12":   { "$value": "12px" },
    "16":   { "$value": "16px" },
    "20":   { "$value": "20px" },
    "24":   { "$value": "24px" },
    "36":   { "$value": "36px" },
    "full": { "$value": "9999px", "$description": "Fully rounded — produces pill/capsule shapes" }
  }
}
```

### `foundations/radius/guidelines.md`

Prose source of truth. Covers:

- **Scale overview**: 4px increments from 4 to 24, then 36 for large containers, then `full` for pills. The scale is intentionally simple — 7 concrete values and 1 intent-based value.
- **When to use each value**: 4 for subtle rounding on small elements (chips, badges, icon buttons). 8–12 for cards, inputs, and standard container rounding. 16–24 for larger containers, modals, and bottom sheets. 36 for prominent rounded surfaces and hero cards. `full` for pill-shaped buttons, avatars, status indicators, and any element that should be fully rounded regardless of size.
- **Platform notes for `radius.full`**: The `9999px` value works directly on all platforms. CSS uses `border-radius: 9999px`. SwiftUI and Compose can use the raw value, or use platform idioms (`.clipShape(Capsule())`, `RoundedCornerShape(50%)`) for clarity. Document both approaches — the raw value is correct, the idiom is conventional.
- **What was dropped and why**: 28px was iOS-only (`CornerRadiusConstants.xxxl`), not present in Figma or Android. It sat between 24 and 36 without a distinct use case. Components using 28 should migrate to 24 or 36.
- **Relationship to Android `AppShapes`**: Android currently uses an `AppShapes` object that maps size names to Material3 `RoundedCornerShape` instances. Origin radius tokens replace this abstraction — components reference `radius.*` tokens directly, and the output generator produces the appropriate `RoundedCornerShape` calls.
- **Why no semantic layer**: Radius has no modes (no light/dark, no responsive breakpoints), no composition (a single value, not a composite of multiple properties), and no cases where the same intent needs to resolve to different values. Semantic aliases would add indirection without solving a real problem.

---

## What moves where

### `foundations/radius/`

Source of truth for radius tokens. Platform-agnostic, no Figma-specific data.

| File | Notes |
|---|---|
| `primitives.json` | 8 DTCG dimension tokens: 7 pixel values (4, 8, 12, 16, 20, 24, 36) + 1 intent-based value (`full` = 9999px) |
| `guidelines.md` | Scale rationale, usage guidance per value, `full` token platform notes, dropped values, relationship to Android `AppShapes` |

### No generation pipeline, but verification is required

Radius tokens are hand-authored. No generation step — unlike color (which computes OKLCH ramps from brand anchors), radius values are direct design decisions pulled from an existing cross-platform audit. However, `lab/pipelines/radius/` exists as a verification-only pipeline (no `generate.ts`, only `verify.ts`), following the same directory convention as color and typography.

### Verification

`lab/pipelines/radius/verify.ts` validates:
- All 8 expected values are present (`4`, `8`, `12`, `16`, `20`, `24`, `36`, `full`)
- DTCG format is valid (`$type: "dimension"` at the group level, `$value` on each token)
- `full` token has `$description` containing the expected description text
- No unexpected tokens are present (the scale is closed — new values require a spec update)

### Figma plugin

The existing plugin (workstream #4) will push radius values as `FLOAT` variables scoped to `CORNER_RADIUS`. This is straightforward — 8 numeric values, no composites, no modes. Scoping ensures radius tokens only appear in corner radius property pickers, not in other numeric contexts. This spec documents what needs pushing, not how the plugin organizes collections.

---

## Done when

- `foundations/radius/primitives.json` has all 8 tokens in DTCG format (`$type: "dimension"`, pixel values, `full` token with `$description`)
- `lab/pipelines/radius/verify.ts` validates structure: all 8 expected values present, DTCG format valid, `full` token has correct description
- `foundations/radius/guidelines.md` covers scale rationale, usage guidance per value, `full` token platform notes, dropped values, and relationship to Android `AppShapes`
- All committed and pushed
