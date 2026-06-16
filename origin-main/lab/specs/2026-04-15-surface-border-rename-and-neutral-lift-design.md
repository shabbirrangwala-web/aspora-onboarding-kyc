# Surface/border rename and neutral low-end lift — design spec

## Date

2026-04-15

## Status

Draft — pending team review

## Problem

Two related issues with the current color system, observed in light-mode product screens:

1. **The low end of the neutral ramp is too dark.** `surface.raised` (`neutral-100` = `#f3f1f1`) makes a visibly hard step down from white. Cards and grouped-list trays read as "stamped on" the page rather than softly lifted, contributing to a jarring experience on information-dense screens. The asymmetry between ramp ends makes this structural: the light end has 3 steps (50/100/200) across `L 1.00 → 0.92` — a gap of 0.08 — while the dark end has 4 steps (900/950/975/1000) across `L 0.23 → 0.12` — a gap of 0.11. Dark end is finer-grained than light end, which is backwards for a product whose default UI lives on white.

2. **Surface and border token groups don't match the rest of the system.** `on-surface` and `interactive` already use `primary / secondary / tertiary / disabled / contrast`. `surface` uses `base / raised / sunken / overlay / contrast`, and `border` uses `default / subtle / strong / disabled / contrast`. Two naming conventions for what is structurally the same shape creates friction. The `raised` vs `sunken` distinction is also underspecified — the existing guidelines don't write down the rule for when to reach for each, and in practice the two get used interchangeably because the steps are close enough that the distinction doesn't carry.

## Decisions

### 1. Lift the low end of the neutral ramp

Update `LIGHTNESS_MAP` in `lab/pipelines/color/generate.ts`:

| Step | Old L | New L | Old hex | New hex |
|------|-------|-------|---------|---------|
| 50   | 1.000 | 1.000 | `#ffffff` | `#ffffff` (unchanged) |
| **100**  | **0.960** | **0.975** | **`#f3f1f1`** | **`#f7f6f6`** |
| **200**  | **0.920** | **0.935** | **`#e6e4e4`** | **`#ebe9e9`** |
| 300  | 0.850 | 0.850 | `#d0cdcc` | `#d0cdcc` (unchanged) |
| 400+ | unchanged | unchanged | unchanged | unchanged |

New hexes were previewed using the pipeline's own culori-based OKLCH→sRGB path with the existing maroon anchor (hue 27.21°) and `neutralChromaMax: 0.012`. These are generator outputs, not hand-picked values.

**Why these numbers.** The revised ladder preserves the ramp's overall shape (tight at extremes, wider through the middle) but mirrors the dark end's granularity on the light side. Gaps from the top become `0.025 / 0.040 / 0.085 / 0.090 / …` — monotonically expanding from step 50, which is the same principle the existing ramp follows, just retuned.

**Side effect: `interactive.secondary` drifts softer.** `interactive.secondary` aliases `neutral-100` in light mode, so secondary buttons will render with a `#f7f6f6` fill instead of `#f3f1f1`. This is accepted — it's a subtle improvement that matches the overall softening direction.

**Dark mode unaffected.** Steps 800+ are unchanged. Dark mode surfaces, borders, and text stay exactly where they are.

### 2. Rename surface tokens: base/raised/sunken → primary/secondary/tertiary

Harmonize `surface` with the `on-surface` and `interactive` groups, which already use ordinal naming.

| Old name | New name | Light primitive | Dark primitive |
|----------|----------|-----------------|----------------|
| `surface.base` | `surface.primary` | neutral-50 | neutral-950 |
| `surface.raised` | `surface.secondary` | neutral-100 (new `#f7f6f6`) | neutral-900 |
| `surface.sunken` | `surface.tertiary` | neutral-200 (new `#ebe9e9`) | neutral-1000 |
| `surface.overlay` | `surface.overlay` | neutral-50 | neutral-900 |
| `surface.contrast` | `surface.contrast` | neutral-1000 | neutral-50 |

Primitive mappings for primary/secondary/tertiary are a pure rename from base/raised/sunken — no change to which neutral step each token points at in either mode. The only primitive-level change is the low-end lift from decision 1.

**Semantic rule: ordinal = role, not lightness.** `primary` is the default-reach surface (the page). `secondary` is the alternative surface used for containers sitting on the page (cards, sheets, grouped lists). `tertiary` is the recessed surface used for insets within a container (input backgrounds, wells).

In light mode this ordering happens to coincide with decreasing lightness (`1.00 → 0.975 → 0.935`) because everything below white can only go darker. In dark mode the ordering is three-directional — `primary` is in the middle of the ramp (`L=0.18`), `secondary` is lifted above it (`L=0.23`, literally lighter), and `tertiary` is recessed below it (`L=0.12`, literally darker). This is not a bug; dark mode uses the lightness budget in both directions to produce richer surface affordances.

The guidelines must state plainly: **don't read the ordinal as a lightness ordering.** It's a role ordering, and the primitive mapping handles the lightness direction per mode.

### 3. Rename border tokens: default/subtle/strong → primary/secondary

Apply the same ordinal convention to `border`, and rebalance what each name points at.

| Old name | New name | Light primitive | Dark primitive |
|----------|----------|-----------------|----------------|
| `border.subtle` | `border.primary` | neutral-100 (new `#f7f6f6`) | neutral-900 |
| `border.default` | `border.secondary` | neutral-200 (new `#ebe9e9`) | neutral-800 |
| `border.strong` | *(retired — see below)* | — | — |
| `border.disabled` | `border.disabled` | neutral-200 | neutral-800 |
| `border.contrast` | `border.contrast` | neutral-1000 | neutral-50 |

**Semantic shift.** The rename does more than swap labels — it changes which border is the default reach. Today's `border.default` (neutral-200) is the everyday divider and `border.subtle` (neutral-100) is an optional softer variant. In practice the everyday divider reads too hard; most dividers want to be quieter. The rename flips that priority:

- **`border.primary` (new default reach)** keeps the primitive `subtle` used to point at — `neutral-100`, now lifted to `#f7f6f6`. This is the everyday divider. Designers who used to reach for `default` should reach here instead.
- **`border.secondary` (alternative, more assertive)** keeps the primitive `default` used to point at — `neutral-200`, now lifted to `#ebe9e9`. Used only when a divider genuinely needs more emphasis than `primary`.

Because the primitive pointers are preserved across the rename (subtle→primary both at neutral-100, default→secondary both at neutral-200), and because the only primitive-level change is the low-end lift from decision 1, the net visual effect is: every existing `border.subtle` usage becomes slightly softer (via the lift), every existing `border.default` usage becomes slightly softer (via the lift), and the recommended default shifts from the (now softer) `secondary` to the (also lifted) `primary`.

**`border.strong` is retired.** It currently points at `neutral-400` (`#b4b0af`), a mid-strength outline that's rarely used in product UI. Before the final rebrand cut, Paul (iOS) and Sergei (Android) should confirm their consuming code doesn't rely on it. If anything does, the options are: (a) reinstate it under a different name, (b) point those consumers at `interactive.primary` (solid black/white outline), or (c) point them at `accent.border` if the use case is focus-related. Tracked as an open item below.

### 4. `on-surface`, `interactive`, and all other groups unchanged

No changes to `on-surface`, `interactive`, `error`, `success`, `warning`, `accent`, `on-brand`, `overlay`, or `brand` tokens. This spec is scoped to neutral primitives (decision 1) and surface/border semantics (decisions 2–3) only.

## Implementation notes

### Files to change

1. **`lab/pipelines/color/generate.ts`** — update `LIGHTNESS_MAP` values for steps 100 and 200. Re-run the pipeline to regenerate:
   - `foundations/color/primitives.json`
   - `outputs/json/*.json`
   - `outputs/css/tokens.css`
   - `outputs/tailwind/theme.js`
   - `outputs/ts/colors.ts`
   - `outputs/ai/*`

2. **`foundations/color/semantic.light.json`** — rename surface and border token keys. Update `surface.*` mappings to use primary/secondary/tertiary. Update `border.*` to use primary (→ neutral-100) and secondary (→ neutral-200). Remove `border.strong`.

3. **`foundations/color/semantic.dark.json`** — same rename. Dark surface/border primitive mappings stay as-is (secondary = neutral-900, tertiary = neutral-1000 for surfaces; primary = neutral-900, secondary = neutral-800 for borders).

4. **`foundations/color/guidelines.md`** — update the semantic tokens section:
   - Replace surface group description with primary/secondary/tertiary framing.
   - Replace border group description with primary/secondary framing.
   - Add the "ordinal = role, not lightness" paragraph in the surfaces section.
   - Remove references to `raised`, `sunken`, `border.default`, `border.subtle`, `border.strong`.
   - Update the light/dark mapping example table.

5. **`lab/viewer/color.html`** — update token labels in the semantic preview section to match new names. This is a local viewer tool; no other consumers depend on it.

6. **Migration notes for platform consumers** — add a short mapping table in `migration/` (or wherever the rebrand migration notes live) so Paul and Sergei can do a single find-replace pass in iOS/Android:
   - `surface.base` → `surface.primary`
   - `surface.raised` → `surface.secondary`
   - `surface.sunken` → `surface.tertiary`
   - `border.default` → `border.secondary`
   - `border.subtle` → `border.primary`
   - `border.strong` → *deleted, contact Hakeeb if used*

### Validation

- Run `lab/pipelines/color/verify.ts` after regeneration to confirm anchor steps and chroma caps still hold.
- Eyeball `lab/viewer/color.html` against a current Aspora screen in light mode to confirm the softened surfaces feel right.
- Contrast check: `on-surface.primary` (neutral-1000) and `on-surface.secondary` (neutral-700) both ran comfortably above WCAG AA on the old `#f3f1f1`. Lifting to `#f7f6f6` moves the background slightly closer to pure white, which only *improves* contrast for dark text. No regressions expected on any `on-surface.*` × `surface.*` pairing. Status `on-light` tokens (red-700, green-700, yellow-600, blue-700) on the new `surface.secondary` should still be re-spot-checked in the viewer since they were tuned against `#f3f1f1`.

## Open items

1. **`border.strong` retirement needs consumer confirmation.** Paul and Sergei should grep their codebases for `border.strong` (or the platform-equivalent token name) before this ships as part of the rebrand migration. If either confirms usage, we'll need to decide whether to reinstate, redirect, or refactor call sites.

2. **Figma variable collection update.** The renamed surface and border tokens will need the consolidated Figma plugin to push the new names. Because Figma preserves variable identity across renames, existing bound properties should continue to resolve — but the plugin needs a rename pass, not a delete-and-recreate (never delete Figma artifacts per repo convention). Out of scope for this spec; tracked separately when the plugin pass runs.

3. **`on-surface` tertiary token already exists.** Worth a sanity check that the new `surface.tertiary` naming doesn't create confusion with `on-surface.tertiary`. These are different roles (background vs text), and the `surface.*` / `on-surface.*` prefixing already disambiguates them in all tooling, so no action expected — but flagging for reviewers.

## References

- `lab/specs/2026-03-25-color-system-revision-design.md` — prior color system revision (established the 5-token status/accent structure, introduced the primary/secondary/tertiary convention for on-surface)
- `lab/pipelines/color/generate.ts:21-26` — source of the lightness ladder
- `foundations/color/primitives.json` — generator output, neutral ramp
- `foundations/color/semantic.light.json` — light mode semantic mappings
- `foundations/color/semantic.dark.json` — dark mode semantic mappings
- `foundations/color/guidelines.md` — prose guidance to be updated
