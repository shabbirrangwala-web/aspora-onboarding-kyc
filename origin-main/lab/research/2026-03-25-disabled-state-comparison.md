# Disabled state approaches across major design systems

Date: 2026-03-25

## WCAG requirements for disabled controls

WCAG 2.1 Success Criterion 1.4.3 (Contrast Minimum) explicitly **exempts** disabled controls from contrast requirements:

> "Text or images of text that are part of an inactive user interface component [...] have no contrast requirement."

An inactive user interface component is defined as one that is "visible but not currently operable" -- for example, a submit button that cannot be activated until required fields are completed.

**Key nuance:** While WCAG does not require any minimum contrast for disabled elements, best practice guidance recommends keeping disabled text above 3:1 so it remains readable for users with low vision. The design tension is real: too much contrast and the button no longer looks disabled; too little and it becomes unreadable.

WCAG 2.1 SC 1.4.11 (Non-text Contrast) similarly exempts inactive components from the 3:1 non-text contrast requirement.

---

## Comparison table

| Aspect | Material Design 3 | Apple HIG | Spectrum (Adobe) | Carbon (IBM) | Polaris (Shopify) | Lightning (Salesforce) |
|---|---|---|---|---|---|---|
| **Primary mechanism** | Opacity on individual sub-elements | Whole-component opacity | Hybrid: opacity + dedicated tokens | Dedicated color tokens (opacity-derived) | Dedicated color tokens | Dedicated color tokens |
| **Strips color to neutral?** | Yes -- all variants go to on-surface | Yes -- desaturates via tintAdjustmentMode | Yes -- disabled backgrounds become gray | Yes -- all buttons become gray | Yes -- all variants share `bg-fill-disabled` | Yes -- brand/destructive become `$brand-disabled` (gray) |
| **Preserves variant identity?** | No | No | No | No | No | No |
| **Container/background** | `on-surface` at **12%** opacity | Platform-managed ~40% whole-element opacity | `--spectrum-disabled-background-color` (gray-100 light / gray-800 dark) | `$button-disabled`: Gray 30 (light), Gray 50 @ 30% (dark) | `--p-color-bg-fill-disabled`: `rgba(0,0,0,0.05)` | `$color-background-button-default-disabled` (neutral gray) |
| **Text/label** | `on-surface` at **38%** opacity | Handled by whole-element opacity | `--spectrum-disabled-content-color` + opacity 0.3 on component | `$text-disabled`: text-primary @ **25%** opacity | `--p-color-text-disabled`: `rgba(181,181,181,1)` (#b5b5b5) | `$color-text-button-brand-disabled` (light gray) |
| **Icon** | `on-surface` at **38%** opacity | Handled by whole-element opacity | Same opacity treatment as text | `$icon-on-color-disabled`: Gray 50 (light), icon-on-color @ 25% (dark) | `--p-color-icon-disabled`: `rgba(204,204,204,1)` (#cccccc) | Same as text treatment |
| **Border/outline** | `on-surface` at **12%** opacity | Handled by whole-element opacity | `--spectrum-disabled-border-color` (gray-300) | `$border-disabled` (opacity-derived) | `--p-color-border-disabled`: `rgba(235,235,235,1)` (#ebebeb) | Matches background token |
| **Disabled contrast ratio** | ~2.0-2.5:1 (below AA) | Variable, ~2.5:1 | ~2.0:1 (opacity 0.3 makes it low) | ~2.5-3.0:1 (25% of primary) | ~2.0:1 (text #b5b5b5 on white) | ~2.5:1 |
| **Cursor** | Default (no pointer) | N/A (native) | Default | Not-allowed | Default | Default |

---

## Detailed breakdown per system

### Material Design 3 (Google)

**Approach:** Per-sub-element opacity applied to a single neutral color (`on-surface`).

M3 does **not** apply opacity to the whole component. Instead, it applies different opacity levels to different parts of the button:

- **Disabled container color:** `on-surface` at 12% opacity
- **Disabled container opacity:** 1.0 (the 12% is baked into the color)
- **Disabled label text color:** `on-surface` at 38% opacity
- **Disabled label text opacity:** 1.0
- **Disabled icon color:** `on-surface` at 38% opacity
- **Disabled icon opacity:** 1.0
- **Disabled outline (outlined button):** `on-surface` at 12% opacity
- **Disabled elevation:** Level 0 (flat)

Token names follow the pattern: `md.comp.filled-button.disabled.container.color`, `md.comp.filled-button.disabled.label-text.color`, etc. In CSS custom properties: `--md-filled-button-disabled-container-color`, `--md-filled-button-disabled-label-text-color`.

**Colored buttons:** A disabled filled button (primary, secondary, tertiary) always becomes `on-surface` at the above opacities. The color identity (primary, error, etc.) is completely stripped. All disabled buttons look identical regardless of their enabled variant.

**Rationale:** Disabled = non-interactive, so communicating "you cannot use this" matters more than "what this would do."

### Apple Human Interface Guidelines

**Approach:** Whole-component opacity reduction + tint desaturation.

Apple's platform frameworks (UIKit, SwiftUI, AppKit) handle disabled states at the system level rather than through design tokens:

- **UIKit:** When `isEnabled = false`, the system applies a dimmed tint via `tintAdjustmentMode = .dimmed`, which desaturates the tint color. Custom backgrounds are the developer's responsibility.
- **SwiftUI:** The `.disabled(true)` modifier reduces the overall opacity of the view. The exact opacity is not publicly documented but is approximately 0.38-0.4 based on visual inspection.
- **AppKit (macOS):** Similar approach, controls become visually dimmed.

**No published token system:** Apple does not publish design tokens. The disabled appearance is baked into the platform's rendering pipeline. Developers can override with custom `ButtonStyle` implementations.

**Colored buttons:** The tint desaturation removes color vibrancy. A destructive (red) button becomes a washed-out grayish-red. Color identity is partially visible but heavily muted.

### Spectrum (Adobe)

**Approach:** Hybrid -- component-level opacity constant plus dedicated semantic color tokens.

Spectrum uses a fixed opacity constant for disabled states and also provides semantic tokens for specific disabled colors:

- **Global disabled opacity:** `--spectrum-opacity-disabled: 0.3` (30%)
- **Disabled background color:** `--spectrum-disabled-background-color` -> `--spectrum-gray-100` (light) / contextual dark value
- **Disabled border color:** `--spectrum-disabled-border-color` -> `--spectrum-gray-300`
- **Component-specific tokens:** e.g., `--spectrum-search-background-color-disabled: --spectrum-gray-25`

The opacity is applied to the **whole component** when disabled, making all elements (background, text, icons) fade uniformly.

**Colored buttons:** Accent (blue) and negative (red) button variants become gray when disabled. The color identity is stripped entirely. Disabled buttons "appear faded" per the documentation.

**Spectrum 2 updates:** S2 introduced more granular disabled tokens with specific gray values rather than relying solely on opacity.

### Carbon (IBM)

**Approach:** Dedicated color tokens derived from opacity calculations, stored as resolved colors.

Carbon v11 moved from fixed gray values to opacity-derived tokens that adapt to theme context:

- **`$button-disabled`:** Gray 30 (light themes: #c6c6c6) / Gray 50 @ 30% (dark themes: rgba(141,141,141,0.30))
- **`$text-disabled`:** `$text-primary` @ 25% opacity -> light: rgba(22,22,22,0.25), dark: rgba(244,244,244,0.25)
- **`$text-on-color-disabled`:** For text on colored backgrounds when disabled
- **`$icon-on-color-disabled`:** Gray 50 (light) / icon-on-color @ 25% (dark)
- **`$border-disabled`:** Opacity-derived, similar to text-disabled
- **`$layer-disabled`** (v10: `$disabled-01`): Background for disabled elements

v10 token mapping: `$disabled-01` -> background, `$disabled-02` -> borders/backgrounds (#c6c6c6), `$disabled-03` -> text/icons (#8d8d8d).

**Colored buttons:** All button variants (primary, danger, tertiary) become the same `$button-disabled` gray when disabled. Color identity is completely stripped.

**Key design decision:** Carbon explicitly states that disabled components "are not subject to WC3 contrast compliance standards." Their disabled text at 25% opacity intentionally sits below the 4.5:1 threshold.

### Polaris (Shopify)

**Approach:** Dedicated color tokens for every disabled property, no opacity on the component itself.

Polaris uses explicit, fully-resolved color values rather than opacity:

- **`--p-color-bg-fill-disabled`:** `rgba(0, 0, 0, 0.05)` -- very faint gray wash
- **`--p-color-bg-fill-brand-disabled`:** `rgba(0, 0, 0, 0.17)` -- slightly darker for primary buttons
- **`--p-color-bg-surface-disabled`:** `rgba(0, 0, 0, 0.05)`
- **`--p-color-text-disabled`:** `rgba(181, 181, 181, 1)` (#b5b5b5)
- **`--p-color-text-brand-on-bg-fill-disabled`:** `rgba(255, 255, 255, 1)` -- white text on brand-disabled fill
- **`--p-color-icon-disabled`:** `rgba(204, 204, 204, 1)` (#cccccc)
- **`--p-color-border-disabled`:** `rgba(235, 235, 235, 1)` (#ebebeb)
- **`--p-color-checkbox-bg-surface-disabled`:** `rgba(0, 0, 0, 0.08)`
- **`--p-color-radio-button-bg-surface-disabled`:** `rgba(0, 0, 0, 0.08)`

**Colored buttons:** Polaris originally used distinct disabled tokens per variant (`--p-action-critical-disabled`, `--p-action-primary-disabled`), but current implementation uses shared disabled tokens. The color scheme for disabled elements is "intentionally consistent throughout the admin interface, generally avoiding the use of distinct colors for each color role."

### Lightning (Salesforce)

**Approach:** Dedicated color tokens per button variant, mapping to neutral values.

SLDS uses design tokens with the `$color-` prefix for disabled states:

- **`$color-background-button-default-disabled`:** Neutral gray for default buttons
- **`$color-background-button-brand-disabled`** / **`$brand-disabled`:** Neutral gray for brand buttons
- **`$color-text-button-default-disabled`:** Light gray text
- **`$color-text-button-brand-disabled`:** Light gray text for brand buttons
- **`$color-border-button-brand-disabled`:** Matches disabled background

SLDS 2 moved from component-level styling hooks (`--slds-c-*`) to global styling hooks (`--slds-g-*`). Component-level disabled styling hooks were removed and handled at the global level instead.

**Colored buttons:** Brand (blue) and destructive (red) buttons both map to the same `$brand-disabled` neutral gray. Color identity is fully stripped.

**Cursor:** SLDS uses `cursor: default` for disabled buttons (not `not-allowed`).

---

## Pattern analysis

### Universal patterns

1. **All six systems strip color identity when disabled.** No major design system preserves the red/blue/green of a variant button in its disabled state. Every system maps disabled buttons to neutral gray tones.

2. **All six systems intentionally sit below WCAG contrast thresholds.** This is by design -- the low contrast itself is the signal that the element is inactive. This is permitted by the WCAG exemption for inactive components.

3. **None use a simple full-component `opacity: 0.5` approach.** Even Apple, which comes closest to whole-component opacity, uses tint desaturation rather than a simple opacity reduction.

### Two dominant strategies

| Strategy | Systems | Pros | Cons |
|---|---|---|---|
| **Opacity-based** (apply opacity to a base color) | M3, Apple, Spectrum, Carbon (v11) | Fewer tokens to maintain; adapts automatically to any background; consistent feel | Can look muddy on colored backgrounds; less precise control |
| **Dedicated resolved tokens** (explicit color values) | Polaris, Lightning, Carbon (v10) | Precise control over every property; works predictably on any surface | More tokens to maintain; must manually ensure disabled feel is consistent |

**Carbon v11 is the most interesting case** -- it bridges both strategies by using opacity as a *derivation method* but storing the result as a resolved token. This gives the adaptability of opacity-based approaches with the predictability of dedicated tokens.

### Opacity values in use

| System | Container/background | Content/text | Notes |
|---|---|---|---|
| M3 | 12% of on-surface | 38% of on-surface | Split opacity, not whole-component |
| Apple | ~38-40% whole element | Same (inherited) | Platform-managed, not tokenized |
| Spectrum | 30% whole component | Same (inherited) | `--spectrum-opacity-disabled: 0.3` |
| Carbon | 30% of Gray 50 (dark bg) | 25% of text-primary | Different ratios for container vs text |
| Polaris | 5% of black | N/A (solid #b5b5b5) | Extremely subtle container, solid text |
| Lightning | N/A (resolved gray) | N/A (resolved gray) | No opacity, fully resolved values |

---

## Implications for Origin

Key questions this research raises for our disabled state approach:

1. **Opacity vs. dedicated tokens:** M3 and Carbon v11's opacity-derived approach requires fewer tokens but assumes a neutral disabled color (on-surface / text-primary). Given our OKLCH color system, we could derive disabled values from our neutral ramp.

2. **How many tokens:** Polaris uses 11 disabled-specific tokens. M3 uses 7 per component type. Carbon uses ~6 global disabled tokens. The range is 6-11 dedicated tokens.

3. **Color stripping is universal:** We should not try to preserve variant color identity in disabled states. Every system strips to neutral, and this is well-understood by users.

4. **Contrast range:** Systems target roughly 2.0-3.0:1 contrast for disabled text. This is well below AA (4.5:1) but above the point of illegibility (~1.5:1). A good target is approximately 2.5:1.

5. **OKLCH advantage:** Since our color system is OKLCH, we can precisely control the lightness of disabled states to hit a target contrast ratio, rather than relying on opacity math that behaves differently depending on the base color.

---

## Sources

- [States -- Material Design 3](https://m3.material.io/foundations/interaction/states/applying-states)
- [Buttons -- Material Design 3](https://m3.material.io/components/buttons/specs)
- [Material Web button tokens (GitHub)](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-filled-button.scss)
- [Apple HIG -- Controls](https://developer.apple.com/design/human-interface-guidelines/controls)
- [Apple -- tintAdjustmentMode](https://developer.apple.com/documentation/uikit/uiview/1622555-tintadjustmentmode)
- [SwiftUI disabled(_:)](https://developer.apple.com/documentation/swiftui/view/disabled(_:))
- [States -- Spectrum (Adobe)](https://spectrum.adobe.com/page/states/)
- [Spectrum tokens (GitHub)](https://github.com/adobe/spectrum-tokens)
- [Carbon Design System -- Color](https://carbondesignsystem.com/elements/color/overview/)
- [Carbon v11 disabled token update (GitHub)](https://github.com/carbon-design-system/carbon/issues/10054)
- [Carbon v10 Color guidelines](https://v10.carbondesignsystem.com/guidelines/color/overview/)
- [Polaris -- Color tokens](https://polaris-react.shopify.com/tokens/color)
- [Polaris -- Disabled token bug fix (GitHub)](https://github.com/Shopify/polaris/issues/3141)
- [SLDS button source (GitHub)](https://github.com/salesforce-ux/design-system/blob/master/ui/components/buttons/base/_index.scss)
- [SLDS Styling Hooks](https://developer.salesforce.com/docs/platform/lwc/guide/create-components-css-custom-properties.html)
- [WCAG 2.1 SC 1.4.3 -- Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WCAG 2.1 SC 1.4.11 -- Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
- [WebAIM -- Contrast and Color Accessibility](https://webaim.org/articles/contrast/)
