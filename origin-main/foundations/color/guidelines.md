# Origin color guidelines

Rules and rationale for the Origin color system. For token values, see the JSON files in this directory.

---

## Color model

All color ramps are generated in **OKLCH** (Oklab Lightness-Chroma-Hue). OKLCH is perceptually uniform: equal numeric lightness steps produce equal perceived brightness steps. HSL fails this -- its lightness axis is mathematically simple but perceptually uneven (e.g., HSL yellow at 50% lightness looks far brighter than HSL blue at 50%).

Ramps are authored in OKLCH, then converted to hex/RGB for consumption in Figma and code.

## Primitive ramps

### Structure

11 solid ramps + 2 alpha ramps. Each solid ramp has **13 steps**: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 975, 1000.

Steps are **lightness-driven**: 50 is near-white, 1000 is near-black. The three extra steps at the dark end (950, 975, 1000) provide the surface hierarchy granularity needed for dark mode. Chroma tapers naturally toward both extremes (very light and very dark values cannot sustain high chroma).

### Brand ramps

Seven chromatic ramps derived from brand colors, each with a **brand anchor** -- the exact brand hex forced at the step whose natural OKLCH lightness matches it:


| Ramp    | Anchor hex | Anchor step | Role                   |
| ------- | ---------- | ----------- | ---------------------- |
| maroon  | `#680D0D`  | 800         | Brand                  |
| crimson | `#B33056`  | 600         | Brand                  |
| peach   | `#FFAE92`  | 300         | Brand                  |
| gold    | `#FAA810`  | 400         | Brand                  |
| lime    | `#AFEA6A`  | 300         | Brand                  |
| teal    | `#097E8D`  | 600         | Brand                  |
| blue    | `#4E68F4`  | 600         | Brand + accent         |


The anchor step is not arbitrary -- it is determined by converting the brand hex to OKLCH and placing it at the step whose lightness target it most closely matches.

### Functional ramps

Three additional chromatic ramps tuned for status signaling. These are independent of the brand ramps -- their hues are optimized for functional clarity (red reads as danger, green reads as success, yellow reads as caution).


| Ramp   | Anchor hex | Anchor step | OKLCH hue | Purpose |
| ------ | ---------- | ----------- | --------- | ------- |
| red    | `#DC2626`  | 600         | ~27       | Error   |
| green  | `#16A34A`  | 500         | ~149      | Success |
| yellow | `#EAB308`  | 400         | ~86       | Warning |


Brand ramps (crimson, lime, gold) remain available for decorative and brand use. Functional ramps (red, green, yellow) are used exclusively for status semantics.

### Neutral ramp

The neutral ramp is a **warm gray**, not a cold/blue gray. Hue is derived from the maroon anchor (`#680D0D`, ~25 degrees OKLCH hue). Chroma is capped at **0.012** so the ramp reads as gray with a subtle warm undertone. `neutral-50` is clean white; `neutral-1000` is a warm near-black.

The neutral ramp is separate from the maroon chromatic ramp. They share a hue but differ in chroma by an order of magnitude.

### Alpha ramps

Two alpha ramps for overlays, interaction states, and text on brand-colored backgrounds:


| Ramp        | Steps              | Values                          |
| ----------- | ------------------ | ------------------------------- |
| white-alpha | 100, 70, 40, 16, 8 | `#ffffff` at decreasing opacity |
| black-alpha | 100, 70, 40, 16, 8 | `#000000` at decreasing opacity |


Step names are the opacity percentage. These serve two roles: (1) on-brand text tokens that adapt to any background hue, and (2) overlay tokens for interactive states (hover/pressed).

## Semantic tokens

**56 tokens** across **11 groups**. Each token aliases a primitive step. Light and dark mode are separate files (`semantic.light.json`, `semantic.dark.json`) with the same token names pointing to different primitive steps.


| Group       | Count | Purpose                                                             |
| ----------- | ----- | ------------------------------------------------------------------- |
| surface     | 5     | Backgrounds: primary, secondary, tertiary, overlay, contrast        |
| on-surface  | 5     | Text/icons: primary, secondary, tertiary, disabled, contrast        |
| border      | 4     | Dividers and outlines: primary, secondary, disabled, contrast       |
| interactive | 4     | CTAs and controls: primary, secondary, disabled, contrast           |
| error       | 5     | Status: solid, light, on-solid, on-light, border                    |
| success     | 5     | Status: solid, light, on-solid, on-light, border                    |
| warning     | 5     | Status: solid, light, on-solid, on-light, border                    |
| accent      | 5     | General-purpose accent: solid, light, on-solid, on-light, border    |
| on-brand    | 6     | Text on brand fills (via alpha primitives)                          |
| overlay     | 5     | Scrim + interaction state overlays                                  |
| brand       | 7     | Direct references to brand anchor steps                             |


### Surface and border: ordinal naming

`surface`, `on-surface`, `border`, and `interactive` all use the same ordinal scheme: `primary`, `secondary`, `tertiary` (where applicable), plus `disabled` and `contrast`. The convention across every group is **primary = the default reach**, not the strongest:

- `surface.primary` — the page itself (white in light, near-black in dark).
- `surface.secondary` — the alternative surface used for containers that sit on the page: cards, sheets, grouped-list backgrounds, popovers.
- `surface.tertiary` — a recessed surface used for insets within a container: input backgrounds, wells, deep trays.
- `on-surface.primary` — the main text/icon color (darkest in light, lightest in dark).
- `border.primary` — the everyday divider. Reach here first.
- `border.secondary` — a stronger divider. Use only when `primary` is too quiet.
- `interactive.primary` — the main CTA.

**Don't read the ordinal as a lightness ordering — it's a role ordering.** In light mode, surface primary/secondary/tertiary happens to descend in lightness (`1.00 → 0.975 → 0.935`) because everything below white can only go darker. In dark mode, the ordering is three-directional: `primary` sits in the middle of the ramp, `secondary` is literally lifted above it (lighter, for raised cards), and `tertiary` is literally recessed below it (darker, for insets). Both modes are correct. Designers should pick tokens by role, not by expected lightness — the primitive mapping handles the direction per mode.

### Status and accent token structure

Each status group (error, success, warning) and the accent group use a 5-token structure with explicit pairing relationships:

| Token    | Role                                     | Example use                               |
| -------- | ---------------------------------------- | ----------------------------------------- |
| solid    | Strong fill background                   | Destructive button, solid badge            |
| light    | Tinted/subtle surface                    | Warning banner, error field background     |
| on-solid | Text/icon on solid fill                  | White text on a red button                 |
| on-light | Text/icon on light surface or neutral bg | Error message, helper text, banner copy    |
| border   | Stroke color                             | Error input ring, accent-outlined button   |

`on-light` doubles as a standalone text/icon color on neutral surfaces. If it's accessible on the `light` tint, it's definitely accessible on white.

**Warning exception:** warning.on-solid uses `neutral-1000` (dark text) instead of `neutral-50` because yellow solid fills are too light for white text.

### Overlay tokens

Interactive states are handled by semi-transparent overlays rather than dedicated hover/pressed tokens. This scales to any fill color without token explosion.

| Token          | Value         | Use                              |
| -------------- | ------------- | -------------------------------- |
| solid-hover    | white-alpha-8  | Hover on solid/dark fills        |
| solid-pressed  | white-alpha-16 | Pressed on solid/dark fills      |
| light-hover    | black-alpha-8  | Hover on light/secondary fills   |
| light-pressed  | black-alpha-16 | Pressed on light/secondary fills |

Direction rule: overlays move the background toward the text color, preserving contrast. Solid fills (dark bg, light text) use lighten overlays. Light fills (light bg, dark text) use darken overlays.

### Disabled state

Disabled strips color identity entirely. All button variants converge to the same neutral appearance. WCAG 2.1 SC 1.4.3 exempts disabled controls from contrast requirements; we target ~2.5:1 for readability.

| Token                | Light       | Dark        |
| -------------------- | ----------- | ----------- |
| interactive.disabled | neutral-200 | neutral-800 |
| on-surface.disabled  | neutral-400 | neutral-600 |
| border.disabled      | neutral-200 | neutral-800 |

### Light/dark mapping

Dark mode flips which end of the ramp each token pulls from. Examples:


| Token                 | Light        | Dark         |
| --------------------- | ------------ | ------------ |
| surface.primary       | neutral-50   | neutral-950  |
| surface.secondary     | neutral-100  | neutral-900  |
| surface.tertiary      | neutral-200  | neutral-1000 |
| on-surface.primary    | neutral-1000 | neutral-50   |
| on-surface.secondary  | neutral-700  | neutral-300  |
| border.primary        | neutral-200  | neutral-900  |
| border.secondary      | neutral-300  | neutral-800  |


Status tokens follow a similar pattern: solid fills use step 600 in light mode and step 500 in dark mode. Light surfaces use step 50/100 in light mode and step 950 in dark mode. on-light text uses step 700 in light mode and step 300 in dark mode.

## Accessibility

### Contrast rules

- **Step 700** is the text-safe step for chromatic colors on a white or light background. Status `on-light` tokens use step 700 in light mode, meeting **WCAG AA 4.5:1** for normal text.
- **Step 300** is the text-safe step for chromatic colors on dark backgrounds. Status `on-light` tokens use step 300 in dark mode.
- Status colors use dedicated functional ramps (red, green, yellow) for maximum clarity. Brand ramps (crimson, lime, gold) are reserved for decorative use.

### What to check

Any new semantic token pairing text on a surface must meet 4.5:1 for normal text, 3:1 for large text and UI components (WCAG AA). Disabled states are exempt per WCAG but should target ~2.5:1.

## Usage rules

1. **Use semantic tokens, not primitives.** Semantic tokens carry meaning (e.g., `surface.primary`, `error.on-light`). Primitives carry none -- `red-600` says nothing about where it should be used.
2. **Primitives are hidden in Figma.** The Primitives collection is unpublished. Designers cannot accidentally use a raw step. If a specific brand color is needed for illustration or brand work, use the escape hatch: a reference page with colored rectangles for eyedropper sampling.
3. **Semantics are scoped in Figma.** `surface/`* tokens only appear for fill properties, `on-surface/*` only for text, `border/*` only for stroke. This prevents misuse at the point of selection.
4. **Status colors come from functional ramps.** Error = red, success = green, warning = yellow, accent = blue. Do not use brand ramps (crimson, lime, gold) for status signaling.
5. **On-brand tokens use alpha primitives.** When placing text on a brand-colored fill, use `on-brand/light` or `on-brand/dark` (and their secondary/disabled variants). These are alpha-based and adapt to any background hue.
6. **The UI is predominantly neutral.** Chromatic color enters through illustrations, 3D assets, and graphic devices. Functional screens are black and white. Do not introduce chromatic fills into standard UI components.
7. **Interactive states use overlays, not dedicated tokens.** Components layer a semi-transparent overlay on their base fill for hover/pressed states. Solid fills use lighten overlays; light fills use darken overlays.
8. **Disabled is always neutral.** Disabled components strip their color identity and use the shared disabled tokens regardless of their active variant.
