# Origin design system — team review notes

Last updated: 2026-03-18

---

## Font

- Inter → Haffer (using Haffer-TRIAL until licensed)
- PP Neue Corp Narrow Bold retired — Display Heavy fills the accent role
- Single font family, weight creates all hierarchy

## Type scale

- ~40 styles → 25 styles. Single weight per category instead of granular weight variants per size
- Categories: Display, Header, Title, Label, Label heavy, Body, Number, Number display, Overline
- Number styles are new — tabular figures (tnum) baked in for financial amounts, transaction lists, dashboards
- Display and Overline always uppercase — brand rule, enforced in tokens
- Retired: ButtonL/M/S (use Label heavy), AccentH1 (use Display), BodyXXLSemiBold, BodyMSemiBold, keypad styles
- Line heights now explicit on both platforms (4px grid). Letter spacing explicit everywhere (8 curated values)

## Naming

- Sentence case in Figma: Label heavy/Medium, not Label-Heavy/M
- Full size names in Figma: Small, Medium, Large
- Token paths stay short: `body/m`, `header/l`

## Color

- 8 brand ramps (OKLCH-generated) + warm neutral + 2 alpha ramps = 114 primitives
- 48 semantic tokens across 11 groups (surface, on-surface, border, interactive, success, warning, error, info, on-brand, overlay, brand)
- Brand tokens renamed: dropped dark-/light- prefix → `brand/maroon`, `brand/peach` etc.
- Pairing guidance in Figma variable descriptions ("Pair with on-brand/light")
- Status subtles bumped: step 50 → 100 (light), 950 → 900 (dark) — actually visible now
- New overlay/scrim token for bottom sheet and modal backdrops

## Spacing

- 12 values on a structured grid: 4px increments to 32, 8px to 48, 16px to 80
- Named by pixel value: `spacing/16` not `spacing/M`
- Dropped: 0, 2, 6, 36, 56. Added: 64
- 2px moves to a border-width concern. 6px maps to 4 or 8

## Radius

- 7 concrete values (4–36) plus `full` for pills/capsules
- Dropped: 28 (was iOS-only)

## Figma

- Origin sync plugin replaces the old color-only plugin
- 5 variable collections: Color primitives (hidden), Color (light/dark modes), Typography primitives (hidden), Spacing, Radius
- 25 text styles with properties bound to variables — update automatically when primitives change
- tnum on Number styles is manual (6 styles) — Figma API can't write OpenType features
- Spacing scoped to gap/padding, radius to corner radius. No scoping on colors

## Architecture

- Two-layer tokens: primitives (raw scale) + semantics (intent-based)
- W3C DTCG format — industry standard, what engineers consume from `outputs/`
- Code is source of truth, Figma synced to
- No component-specific tokens — components reference the semantic scale directly
- Manual token consumption stays — engineers reference output files and update platform code

## How we got here

- Audited the existing Figma component library (173 published component sets across 30 pages)
- Searched both iOS (`vance-ios`) and Android (`vance-android`) codebases via GitHub — mapped every Figma component to its platform implementation
- 15 of 24 UI components fully matched across both platforms. 3 have gaps on one side (Chips on Android, Dialog on Android, Section Label on iOS). 3 are stubs on both (Banking Widget, Live Activity Card, Slots)
- Audited spacing/radius usage across both codebases to validate scale changes — confirmed 2px and 6px are predominantly used for border-width concerns and near-duplicate spacing
- Color system built on the OKLCH pipeline from the color-theory project, validated with snapshot testing (114 hex values diffed against the original output)

## Not changing yet

- Dark mode — phase 2, infrastructure exists
- SDU migration (BODY_M_REGULAR etc.) — separate spec with backend
- Prose foundations (photography, voice, illustration) — need brand material
- Output pipeline (CSS, JSON, Tailwind) — next priority, unblocks brand-lab and web consumers
