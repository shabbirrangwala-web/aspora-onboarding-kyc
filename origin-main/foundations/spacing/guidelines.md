# Origin spacing guidelines

Rules and rationale for the Origin spacing scale. For token values, see `primitives.json` in this directory.

---

## Scale rationale

The scale uses three increment tiers, each doubling the step size as values grow:

- **4px increments** (4--32): Fine-grained control where small differences are visually meaningful. The gap between 8px and 12px of padding inside a component matters.
- **8px increments** (32--48): Medium jumps for layout-level spacing where 4px differences become imperceptible relative to the overall size.
- **16px increments** (48--80): Large jumps for section-level spacing where precision gives way to rhythm and breathing room.

The grid doubles at each boundary (4 to 8 at 32, 8 to 16 at 48). This produces a natural deceleration -- tight control where you need it, broader steps where fine differences stop mattering. The values are hand-picked, not derived from a mathematical ratio. The increment structure is the governing logic.

## The scale

12 values. Token names match the pixel value (`spacing.4`, `spacing.8`, etc.).

| Token | Value | Increment Tier |
|---|---|---|
| `spacing.4` | 4px | 4px |
| `spacing.8` | 8px | 4px |
| `spacing.12` | 12px | 4px |
| `spacing.16` | 16px | 4px |
| `spacing.20` | 20px | 4px |
| `spacing.24` | 24px | 4px |
| `spacing.28` | 28px | 4px |
| `spacing.32` | 32px | 4px |
| `spacing.40` | 40px | 8px |
| `spacing.48` | 48px | 8px |
| `spacing.64` | 64px | 16px |
| `spacing.80` | 80px | 16px |

## Usage by range

### 4--12: Component internals

Tight spacing inside components where density matters. Icon-to-text gaps, compact list item padding, inline element spacing, checkbox/radio label offsets, badge insets.

### 16--32: Standard padding and gaps

The workhorse range for everyday layout. Card padding, form field spacing, toolbar gaps, modal insets, list item padding, input group spacing.

### 40--80: Section-level spacing

Breathing room between major content areas. Page margins, section dividers, hero area padding, content group separation, bottom sheet spacing.

## What was dropped

Five values from the existing platforms are excluded.

### 0 (None)

Zero is the absence of spacing, not a spacing value. Omit the property or set it to `0` directly -- a token for "nothing" adds noise without aiding comprehension.

### 2 (Closest)

A code search across iOS and Android shows this value is predominantly used for divider thickness, timeline line widths, and hairline separators -- these are border-width concerns, not spacing concerns.

**Migration:** Use `spacing.4` for the rare tight-gap cases. Border-width tokens will be handled as a separate foundation.

### 6 (XXSAlt)

Too close to both 4 and 8, creating a "which one do I pick?" problem. In practice, anywhere 6 is used, 4 or 8 produces an equivalent result.

**Migration:** Map to `spacing.4` or `spacing.8` case-by-case. Prefer 8 unless the tighter option is clearly needed.

### 36 (XXXXL)

Does not fit the increment grid. The 4px tier ends at 32 and the 8px tier begins at 40 (32 + 8). 36 falls between tiers, breaking the structural logic.

**Migration:** Map to `spacing.32` or `spacing.40` case-by-case.

### 56 (XXXXXXXL)

Does not fit the increment grid -- falls between the 8px tier ending at 48 and the 16px tier starting at 64. Also Android-only with no iOS or Figma counterpart.

**Migration:** Map to `spacing.48` or `spacing.64` case-by-case.

## Relationship to typography

Spacing and typography line heights share the same 4px base grid, but they are independent token sets. Changing a spacing value does not change a line height. The shared grid means vertical rhythm is naturally aligned when combining type and spacing -- a 20px line height plus 12px of vertical padding sits cleanly on the 4px grid. The relationship is structural, not coupled.

## What this scale is NOT

Spacing tokens are for **padding, gap, and margin**. Do not use them for:

- **Border widths.** Borders are a separate concern with different value needs (1px, 2px). A dedicated border-width foundation will handle this.
- **Icon sizes.** Icons have their own sizing conventions tied to touch targets and optical alignment, not spacing rhythm.
- **Border radii.** Radius values follow different logic (small for subtle rounding, large for pills) and do not benefit from the spacing increment grid.

If you need a value for one of these, it does not belong in the spacing token set.
