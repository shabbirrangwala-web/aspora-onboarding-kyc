# Typography guidelines

## Font family

Haffer is the sole typeface for Aspora. There is no accent font — weight creates hierarchy. PP Neue Corp Narrow Bold (the previous accent font) is retired; Display Heavy fills that role.

## Weight roles

| Weight | Value | Role | Used by |
|---|---|---|---|
| Heavy | 900 | Display and accent. Large, uppercase hero text and number displays. | Display, Number Display |
| Bold | 700 | Section headings. Primary structural hierarchy. | Header |
| SemiBold | 600 | Titles and overlines. Secondary structural hierarchy. | Title, Overline |
| Medium | 500 | Emphasized labels and tabular numbers. Subtle weight bump for distinction. | Label heavy, Number |
| Regular | 400 | Body text and labels. Default reading weight. | Body, Label |

## Type scale

### Display
Hero moments, splash screens, large promotional text. Always uppercase (brand rule). Heavy weight at 36/45/57px. Use sparingly for impact, not information density.

### Header
Section structure within a screen. Bold weight at 24/28/32px. Use for screen titles, section headers, and primary navigation labels.

### Title
Card titles, list item headers, sub-section labels. SemiBold weight at 14/16/22px. The workhorse for giving structure within content areas.

### Label
Form labels, metadata, timestamps, secondary information. Regular weight at 11/12/14px. Designed to be readable but visually subordinate to body text.

### Label heavy
Tabs, buttons, emphasized metadata. Medium weight at the same sizes as Label (11/12/14px). Use when a label needs to carry more visual weight without changing size.

### Body
Readable content: descriptions, explanations, terms. Regular weight at 12/14/16px. Optimised for comfortable reading in both short and medium-length passages.

### Number
Tabular numeric data: transaction amounts, table cells, inline values. Medium weight at 12/14/16px with tabular figures (tnum) enabled. Ensures digit columns align vertically.

### Number display
Hero amounts: account balances, transfer totals, large financial figures. Heavy weight at 36/45/57px with tabular figures (tnum) and uppercase. Combines Display's visual impact with Number's alignment precision.

### Overline
Category tags, section labels, metadata flags. SemiBold weight at 11px, always uppercase with wide tracking (+1.5%). A single style, no size variants.

## Responsive scaling

Origin primitives define mobile-first values (`$value`). The responsive extension (`tech.vance.origin.responsive`) adds three additional viewport targets. Together they form a four-column scaling system.

### Breakpoints

| Name | Range | Behaviour |
|---|---|---|
| Mobile | <=734px | Fixed px. Origin `$value` used as-is. This is the source of truth. |
| Tablet | 735 - 1068px | Fixed px. Hand-picked values that step up from mobile. |
| Desktop floor | >=1069px | Lower bound of fluid scaling. Laptop at ~1069px viewport. |
| Desktop ceiling | 1440px | Upper bound of fluid scaling. Values stop growing at 1440px. |

On desktop, web implementations use CSS `clamp()` to interpolate between floor and ceiling:

```
clamp(floorPx, calc(floorPx + (ceilPx - floorPx) * (100vw - 1069px) / 371), ceilPx)
```

Native platforms (iOS, Android) should pick the value closest to their device class. Mobile maps to `$value`, tablets map to `responsive.tablet`, and desktop/large screen maps to `responsive.desktopFloor`.

### Font size responsive values

| Step | Mobile | Tablet | Desktop floor | Desktop ceil |
|---|---|---|---|---|
| 100 | 11px | 11px | 12px | 13px |
| 200 | 12px | 13px | 14px | 15px |
| 300 | 14px | 15px | 16px | 18px |
| 400 | 16px | 17px | 18px | 20px |
| 500 | 20px | 22px | 24px | 26px |
| 600 | 22px | 24px | 26px | 28px |
| 700 | 24px | 26px | 28px | 32px |
| 800 | 28px | 30px | 32px | 36px |
| 900 | 32px | 36px | 40px | 44px |
| 1000 | 36px | 40px | 45px | 52px |
| 1100 | 45px | 52px | 57px | 66px |
| 1200 | 57px | 64px | 72px | 84px |

### Line height responsive values

| Step | Mobile | Tablet | Desktop floor | Desktop ceil |
|---|---|---|---|---|
| 100 | 12px | 12px | 16px | 16px |
| 200 | 16px | 16px | 20px | 20px |
| 300 | 20px | 22px | 24px | 28px |
| 400 | 24px | 26px | 28px | 32px |
| 500 | 28px | 30px | 32px | 36px |
| 600 | 32px | 34px | 36px | 40px |
| 700 | 36px | 38px | 40px | 44px |
| 800 | 40px | 42px | 44px | 48px |
| 900 | 44px | 48px | 52px | 56px |
| 1000 | 48px | 52px | 56px | 64px |
| 1100 | 52px | 58px | 64px | 72px |
| 1200 | 56px | 64px | 72px | 80px |

### Letter spacing

Letter spacing uses percentages, not absolute values. Percentages scale proportionally with font size, so no responsive overrides are needed. The same 8 steps apply at every breakpoint.

### Design rationale

Mobile values are the Origin baseline. They are hand-picked integers, not mathematically derived. Tablet values are hand-tuned upward bumps (typically +1 to +7px depending on the step). Desktop floor and ceiling values define the fluid range; the ceiling is the upper comfort limit at 1920px, not an extrapolation.

Line heights sit on a 4px grid at desktop floor and ceiling. Mobile and tablet line heights are hand-tuned for correct visual ratios with their paired font sizes. Display/L has a line height (56px at mobile) smaller than its font size (57px) intentionally: tight leading on large uppercase display text prevents excessive visual spacing.

## Tabular numbers (tnum)

### When to use
- Financial amounts in lists and tables
- Transaction histories
- Dashboards and reporting
- Timers, OTP countdowns, live-updating metrics
- Any UI where numeric alignment supports scanning

### When to avoid
- Marketing surfaces
- Long-form reading
- Headings and editorial copy
- Short inline numbers in sentences (e.g., "3 items")

### Platform code (outside Number styles)
When applying tnum outside the dedicated Number styles, use platform modifiers:

**CSS:**
```css
font-variant-numeric: tabular-nums;
```

**SwiftUI:**
```swift
Text("$1,234.56")
    .monospacedDigit()
```

**Compose:**
```kotlin
Text(
    text = "$1,234.56",
    style = Theme.typography.BodyMRegular.copy(
        fontFeatureSettings = "tnum"
    )
)
```

## Uppercase rules

Three categories enforce uppercase via `textCase` in their token extensions:

- **Display** (S/M/L): brand rule. All display text is uppercase.
- **Number Display** (S/M/L): inherits from Display. Uppercase is harmless on digits and correct for adjacent currency codes.
- **Overline** (Standard): category tag convention. Always uppercase with wide tracking.

All other styles use default case. Do not manually uppercase Header, Title, Label, or Body text. If content needs to be uppercase, use Display or Overline.

## OpenType features

Haffer supports the following OpenType features:

| Feature | Status in tokens | Notes |
|---|---|---|
| Tabular figures (tnum) | Baked into Number styles via `$extensions` | Applied automatically when using Number tokens |
| Slashed zero (zero) | Available, not in tokens | Toggle per-instance in Figma or apply in code |
| Ligatures (liga) | Available, not in tokens | On by default in most renderers |
| Contextual alternates (calt) | Available, not in tokens | On by default in most renderers |
| Fractions (frac) | Available, not in tokens | Toggle per-instance when displaying fractions |

Only tnum is encoded in the token system. Other features are available for per-instance use but are not part of the design system's token contract.

## Primitive scale rationale

### Font sizes
Hand-picked, not mathematically derived. The 12 values (11-57px) approximate a major second (1.125) scale but are rounded to practical integers. Constraint is enforced at the semantic layer, not every primitive needs a semantic consumer. The primitive layer provides a complete vocabulary for future styles without requiring scale changes.

### Line heights
12 values on a 4px grid, starting from 12px. Independent from the spacing foundation but on the same rhythmic grid. Changing a spacing value does not change a line height; the relationship is coincidental, not coupled.

Display/L has a line height (56px) smaller than its font size (57px). This tight leading is intentional for large uppercase display text, where conventional line height ratios create excessive visual spacing.

### Letter spacing
8 curated values from -2% to +1.5%. Positive tracking for small and uppercase text (aids legibility at small sizes), progressively tighter as size increases (large text needs negative tracking to avoid appearing loose).

Note: percentage-based letter spacing is a deliberate departure from DTCG `dimension` type (which requires px/rem). Converting to absolute values would couple letter spacing to font size, breaking the composability of the primitive layer.
