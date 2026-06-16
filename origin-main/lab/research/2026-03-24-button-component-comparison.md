# Button component comparison: Wise, eBay, Uber Base

Last updated: 2026-03-24

Cross-system comparison of button component specifications. Focused on extracting patterns relevant to Origin's button contract design.

---

## Systems surveyed

| System | Source | Button component types |
|---|---|---|
| **Wise** | wise.design/components | Button, Icon button, Circular button (no Link button page found) |
| **eBay** | playbook.ebay.com/design-system | CTA button, Branded button, Icon button, Link button |
| **Uber Base** | baseweb.design + GitHub source | Button (unified component with kind/shape props) |

---

## 1. Button types and hierarchy

### Wise

Wise splits buttons into **four separate components** rather than one polymorphic component:

| Component | Purpose | Hierarchy levels |
|---|---|---|
| **Button** | Standard text buttons with optional icons/avatars | Primary, Secondary, Secondary neutral, Tertiary |
| **Icon button** | Icon-only, no text label | Primary, Secondary, Tertiary, Minimal |
| **Circular button** | Icon + short label, always used in groups | Primary, Secondary |
| **Link button** | Not documented (404) | Unknown |

Wise calls hierarchy levels "priorities" rather than "variants." They also have a separate axis called "type" with two values: **Default** (neutral actions) and **Negative** (destructive actions). This creates a 2D matrix: priority x type.

**Notable**: "Secondary neutral" is a distinct priority for convenience actions on neutral surfaces, separate from "Secondary." Four priorities for standard buttons but only two for circular buttons.

### eBay

eBay splits buttons into **four separate components**, each with its own documentation:

| Component | Purpose | Style properties (hierarchy) | Role properties |
|---|---|---|---|
| **CTA button** | Primary actions within flows | Primary, Secondary, Tertiary, Borderless | Default, Destructive |
| **Branded button** | Marketing placements only | Single style (inherits from parent theme) | Default only |
| **Icon button** | Icon-only for common tasks | (Uses background variants: onSecondary, onElevated, onImage) | Default |
| **Link button** | Tertiary text-styled actions | Strong, Subtle, White | Default |

eBay separates "style" (visual hierarchy) from "role" (semantic intent). CTA buttons have 4 style levels x 2 roles. The destructive role can be applied at any style level: a destructive primary is high-emphasis deletion, a destructive tertiary is low-emphasis removal.

**Notable**: Branded button is marketing-only, single height (40px), inherits color from parent container's theme palette. "Borderless" is a distinct fourth hierarchy level below tertiary.

### Uber Base

Uber Base uses a **single unified component** with a `kind` prop:

| Kind | Purpose |
|---|---|
| **primary** | Leading action, bold dominant-color background |
| **secondary** | Supporting action alongside primary |
| **tertiary** | Supplementary, creates variation |
| **dangerPrimary** | Destructive leading action |
| **dangerSecondary** | Destructive supporting action |
| **dangerTertiary** | Destructive supplementary action |

Plus a legacy `outline` kind in button groups.

**Notable**: Danger variants are first-class kinds (dangerPrimary, dangerSecondary, dangerTertiary) rather than a separate "role" axis. This means 6 total kinds instead of a 3x2 matrix. Single component handles all button types through `kind` + `shape` props.

### Hierarchy comparison

| Hierarchy level | Wise | eBay | Uber Base |
|---|---|---|---|
| Primary (filled) | Primary | CTA Primary | primary |
| Secondary (outline/subdued) | Secondary | CTA Secondary | secondary |
| Neutral secondary | Secondary neutral | -- | -- |
| Tertiary (minimal) | Tertiary | CTA Tertiary | tertiary |
| Borderless/ghost | -- | CTA Borderless | -- |
| Minimal | -- (Icon button only) | -- | (removed in v7) |
| Destructive primary | Primary + Negative type | CTA Primary + Destructive role | dangerPrimary |
| Destructive secondary | Secondary + Negative type | CTA Secondary + Destructive role | dangerSecondary |
| Destructive tertiary | Tertiary + Negative type | CTA Tertiary + Destructive role | dangerTertiary |
| Marketing/branded | -- | Branded button (separate component) | -- |
| Link-styled | Link button (separate) | Link button (separate) | -- (use anchor tag) |

---

## 2. Sizes

### Wise

| Size | Usage | Width behavior | Icon support |
|---|---|---|---|
| **Large** | Moving users forward in flows | Full-width on mobile, auto-width on desktop | No icon right, no media left |
| **Medium** | Inline content needing emphasis | Wraps to content | Icon left + right, avatars |
| **Small** | Smaller inline (list items) | Wraps to content | Icon left + right |

Icon buttons have **7 sizes**: 16, 24, 32, 40, 48, 56, 72px.

Constraints: Large buttons prohibited inside cards/list items. Medium buttons prohibited inside list items.

### eBay

| Size | CTA height | Icon size | Horizontal padding | Icon-title gap | Min width | Max width |
|---|---|---|---|---|---|---|
| **Large** | 48px | 24px | 24px | 8px | 2x height (96px) | 10x height (480px) |
| **Medium** | 40px | 20px | 20px | 8px | 2x height (80px) | 10x height (400px) |
| **Small** | 32px | 16px | 16px | 6px | 2x height (64px) | 10x height (320px) |

Branded button: Medium only (40px height, 20px padding, min 80px, max 400px).

Link button sizes map to typography: Large = 24px line (Subtitle 2, 16/24), Medium = 20px line (Body, 14/20), Small = 16px line (Caption, 12/16).

Icon button: same 3 sizes (48, 40, 32px) with matching icon sizes (24, 20, 16px). All maintain 48x48 min tap target.

### Uber Base

| Size | Min height | Min width | Typography | Padding (text) | Padding (icon shape) |
|---|---|---|---|---|---|
| **xSmall / mini** | scale850 | 52px | LabelXSmall | scale200 y / scale300 x | scale200 y / scale200 x |
| **small / compact** | scale950 | 60px | LabelSmall | scale400 y / scale500 x | scale400 y / scale400 x |
| **medium / default** | scale1200 | 72px | LabelMedium | scale550 y / scale600 x | scale550 y / scale550 x |
| **large** | scale1400 | 80px | LabelLarge | scale600 y / scale700 x | scale600 y / scale600 x |

**Notable**: Uber has 4 sizes (7 names due to aliases: mini=xSmall, compact=small, default=medium). Some sizes are deprecated aliases from older versions.

### Size comparison

| Dimension | Wise | eBay | Uber Base |
|---|---|---|---|
| Size count | 3 (button), 7 (icon button) | 3 | 4 (with deprecated aliases) |
| Smallest | Small (no px specified) | 32px | ~28px (mini/xSmall) |
| Default | Medium | Medium (40px) | Medium/default (~48px) |
| Largest | Large (no px specified) | 48px | Large (~56px) |
| Min width rule | None documented | 2x height | Fixed px per size |
| Max width rule | None documented | 10x height | None |
| Tap target | Adjusts for accessibility prefs | 48x48 minimum | Configurable (tap vs click) |

---

## 3. States

| State | Wise | eBay CTA | Uber Base |
|---|---|---|---|
| **Default/enabled** | Yes | Yes | Yes |
| **Hover** | Yes (implied) | Yes (state layer) | Yes (overlay) |
| **Pressed/active** | Yes (implied) | Yes (state layer) | Yes (overlay) |
| **Focused** | Yes (implied) | Yes (outline matches theme) | Yes (inset shadow, 2px borderAccent) |
| **Disabled** | Yes (with guidance to prefer enabled + feedback) | Yes | Yes |
| **Loading/pending** | Not on standard button (icon animation on iOS) | Yes (spinner replaces content, 1000ms delay) | Yes (spinner, timing700 infinite rotation) |
| **Selected** | No | No | Yes (isSelected prop) |
| **Success** | Yes (iOS: morphs to circle with checkmark) | No | No |

**Notable patterns**:

- **eBay's 1000ms pending delay**: The loading spinner does not appear for 1 second to prevent flicker on fast responses. The button remains styled normally during the delay. This is a sophisticated UX pattern.
- **Wise's success state**: On iOS, the button morphs from full-width to a circle with a checkmark using spring animation (response 0.5s, damping 0.7). This is an idle -> loading -> success progression.
- **Uber's selected state**: Unique among these three; supports toggle-like behavior within button groups.
- **Wise discourages disabled state**: Documentation recommends keeping buttons enabled and showing feedback about required steps instead.

---

## 4. Icon support

| Capability | Wise | eBay CTA | Uber Base |
|---|---|---|---|
| **Leading icon** | Yes (left placement, "supports the message") | Yes (lead icon, "reinforces meaning") | Yes (startEnhancer) |
| **Trailing icon** | Yes (right placement, "for actions") | Yes (trailing icon, "signals additional behavior") | Yes (endEnhancer) |
| **Icon-only** | Separate Icon button component | Separate Icon button component | Via shape (circle/square) |
| **Avatar support** | Yes (left only, single or double, Medium size only) | No | No |
| **Icon + text rules** | Icons must match content, no decorative use | Single icon only per button, must clarify not decorate | Enhancers accept any React node |
| **Size-dependent icon availability** | Large: no right icon. Small: icon only, no avatar | All sizes support lead + trailing | All sizes support enhancers |

**Notable**: Wise's avatar support is unique -- buttons can show currency or recipient avatars in the leading position. eBay explicitly prohibits icons on branded buttons. Uber's enhancer pattern is the most flexible (any React node) but least opinionated.

---

## 5. Width behavior

| Behavior | Wise | eBay | Uber Base |
|---|---|---|---|
| **Hug content** | Medium + Small default | CTA + Branded default (with min/max constraints) | Default (widthType: "hug") |
| **Fill parent** | Large on mobile | CTA can fill container | widthType: "fill" |
| **Responsive** | Large: full-width mobile, auto-width desktop | Not documented | Not documented (CSS responsibility) |
| **Min width** | Not documented | 2x button height | Fixed per size (52-80px) |
| **Max width** | Not documented | 10x button height | Not documented |
| **Text overflow** | Must be fully visible, no truncation | Truncates at trailing end | Not documented |
| **Branded button** | N/A | Always hugs, max 20 chars | N/A |

**Notable**: eBay's min/max width as multiples of height is a clean proportional system. Wise explicitly forbids text truncation and recommends concise copy to handle translation growth.

---

## 6. Shape, border, shadow, radius

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| **Shape** | Implied rounded rectangle (iOS: Capsule/pill) | Rounded rectangle | 5 shapes: default (theme radius), rectangular, rounded, pill (999px), circle (50%), square |
| **Border radius** | Not specified (iOS uses full pill) | Not specified in docs (token-referenced) | Theme-controlled `buttonBorderRadius`, pill=999px, circle=50% |
| **Border** | Primary: double border (inner + outer strokes). Secondary: none. Tertiary: none | Not prominent (state layers, not borders) | Secondary has border treatment; others rely on fill |
| **Shadow** | Primary: shadow at 25% opacity (iOS: radius .space.XS, y-offset .space.XXS). Disabled: 10% | Not documented on buttons | Not documented on standard buttons; `backgroundSafe` prop for FAB-style |
| **Gradient** | Primary: gradient fill (iOS: buttonV2GradientStart -> buttonV2GradientEnd) | Not on CTA; Branded inherits parent theme colors | Not documented |

**Notable**:
- **Wise's double border + gradient + shadow on primary** is the most visually rich treatment of any system here. The primary button has: gradient background, inner border, outer border, and drop shadow. This creates a premium/elevated feel.
- **eBay uses state layers** (semi-transparent overlays) for hover/press rather than changing background colors. Clean and consistent.
- **Uber's shape system** is the most flexible with 5+ options, though some are deprecated. The `circle` and `square` shapes serve as icon-only button containers.

---

## 7. Anatomy

### Wise button

```
[ (avatar?) | (icon-left?) | label | (icon-right?) ]
```

- Avatar: left only, Medium size only
- Icons: left supports content, right supports action
- Label: always visible text
- Container: shape varies by component (rectangular for Button, circular for Icon/Circular button)

### eBay CTA button

```
[ (lead-icon?) | title | (trailing-icon?) ]
     └── container ──┘
```

- Lead icon: reinforces meaning
- Title: verb + noun label
- Trailing icon: signals additional behavior (e.g., chevron for menu disclosure)
- Container: background + border structure

### Uber Base button

```
[ (startEnhancer?) | children/label | (endEnhancer?) ]
     └── loadingSpinnerContainer / loadingSpinner (when loading) ──┘
     └── baseButton (root interactive element) ──┘
```

- startEnhancer: any React node
- children: can be React node or render function receiving (isHovered, isPressed, isFocused, artworkSize)
- endEnhancer: any React node
- LoadingSpinner overlays content when isLoading=true
- All parts customizable via overrides

---

## 8. Props comparison

### Core props

| Prop concept | Wise | eBay CTA | Uber Base |
|---|---|---|---|
| Hierarchy | priority (4 values) | style (4 values: primary/secondary/tertiary/borderless) | kind (6 values incl. danger variants) |
| Destructive | type: negative | role: destructive | kind: dangerPrimary/Secondary/Tertiary |
| Size | size (3 values) | size (3 values: large/medium/small) | size (4+ values with aliases) |
| Label | Text content | title (verb + noun) | children (React node or render fn) |
| Disabled | Supported | Supported | disabled: boolean |
| Loading | iOS: state machine (idle/loading/success) | Pending state with 1000ms delay | isLoading: boolean |
| Leading icon | Left icon/avatar | Lead icon | startEnhancer |
| Trailing icon | Right icon | Trailing icon | endEnhancer |
| Full width | Large size = full width (mobile) | Fill container option | widthType: "fill" |
| Shape | Fixed per component type | Fixed (rounded rect) | shape prop (5 options) |
| Selected | No | No | isSelected: boolean |
| Custom colors | No | Branded button inherits theme | colors: { backgroundColor, color } |
| Link behavior | Separate Link button component | Separate Link button component | href + target props on same component |
| Type (HTML) | Not documented | Not documented | type: button/submit/reset |
| Min tap target | Accessibility-adaptive | 48x48 recommended | minHitArea: tap/click |

---

## 9. Unique patterns and notable decisions

### Wise

1. **Priority, not variant**: Calling hierarchy "priority" rather than "variant" emphasizes that it represents importance level, not visual style.
2. **Type x Priority matrix**: Separating destructive intent (type: negative) from visual weight (priority) creates a clean 2D decision space.
3. **Avatar buttons**: Supporting currency/recipient avatars inside buttons is unique and product-specific (financial product).
4. **Size constrains placement**: Large buttons are forbidden in cards/list items. Medium buttons are forbidden in list items. This is design enforcement, not just guidance.
5. **Anti-decoration stance**: "Icons must match written content; avoid decorative use." Strong opinionated position.
6. **No truncation, ever**: Text must be fully visible in all font sizes and languages. Forces concise copy.
7. **Success state animation**: idle -> loading -> success with spring morphing animation. Delightful but complex to implement cross-platform.
8. **Gradient + double border + shadow**: Primary button has the most elaborate visual treatment of any system surveyed.

### eBay

1. **Style x Role matrix**: Similar to Wise's Priority x Type, but with different naming. Style = visual hierarchy, Role = semantic intent. Clean separation.
2. **Branded button as separate component**: Marketing buttons have their own component with constrained API (medium only, no icons, inherits parent theme). Prevents misuse.
3. **Proportional min/max width**: Min = 2x height, Max = 10x height. Elegant scaling rule.
4. **1000ms loading delay**: Prevents spinner flicker. Sophisticated UX detail.
5. **Icon button background variants**: onSecondary, onElevated, onImage -- context-aware background treatment.
6. **Icon toggle**: Icon buttons can swap between outlined and filled states for toggle behavior (save, pin, thumb-up).
7. **Tooltip on icon buttons**: Labels appear on hover/long-press since no visible text exists. Built into the component spec.
8. **Link button distinction**: "Use a link when you're navigating... Use a button when you are performing an action." Clear semantic boundary.
9. **Split button min width**: 4x height (double the standard 2x) to accommodate divider + dropdown affordance.

### Uber Base

1. **Single component, many shapes**: Rather than separate Icon button / Circular button components, Uber uses shape prop (circle, square, pill) on the same Button component. Fewer components, more props.
2. **Danger as first-class kinds**: dangerPrimary, dangerSecondary, dangerTertiary are distinct kind values rather than a separate axis. Simpler API but 6 kinds instead of 3x2.
3. **Render prop children**: Children can be a function receiving (isHovered, isPressed, isFocused, artworkSize), allowing fully custom content that responds to interaction state.
4. **Override system**: Every sub-component (BaseButton, StartEnhancer, EndEnhancer, LoadingSpinner, etc.) is overridable. Maximum customization flexibility.
5. **backgroundSafe prop**: For floating action button usage -- applies special styles for buttons overlaying content.
6. **minHitArea: tap vs click**: Explicitly distinguishes touch (larger) from pointer (smaller) minimum hit areas.
7. **Deprecated shape aliases**: round -> circle, default -> rectangular. The system carries forward deprecated names for backwards compatibility.
8. **customColors prop**: Can override backgroundColor and text color directly, bypassing the design system. Escape hatch.

---

## 10. Comparison with Origin contract

Comparing against the existing button contract at `.claude/skills/cc-figma-component/examples/button.contract.json`:

| Aspect | Origin contract | Wise | eBay | Uber Base | Recommendation |
|---|---|---|---|---|---|
| **Variants** | primary, secondary, ghost, destructive | Primary, Secondary, Secondary neutral, Tertiary x Default/Negative | Primary, Secondary, Tertiary, Borderless x Default/Destructive | primary, secondary, tertiary, dangerPrimary/Secondary/Tertiary | Origin's current set is solid. Consider whether "ghost" maps to Wise's "tertiary" or a separate concept. May want to add a destructive secondary |
| **Sizes** | sm, md, lg | Large, Medium, Small | Large (48), Medium (40), Small (32) | xSmall, small, medium, large | 3 sizes is the consensus. Origin matches |
| **States** | default, hover, focus, active, disabled, loading | default, hover, focus, active, disabled, loading+success | enabled, hover, pressed, focused, disabled, pending | default, hover, active, focused, disabled, loading, selected | Origin's 6 states are good. Consider adding success state (Wise) |
| **Icon slots** | iconStart, iconEnd, iconOnly | Left icon, right icon (size-dependent) | Lead icon, trailing icon | startEnhancer, endEnhancer | Origin matches the consensus pattern |
| **Width** | fullWidth: boolean | Size-dependent (Large=full on mobile) | Hug or fill, with min/max ratios | widthType: hug/fill | Origin's boolean is simpler than Uber's enum but functionally equivalent |
| **Shape** | radius.md (single value) | Capsule/pill | Rounded rectangle | 5 shapes (pill, circle, square, rectangular, rounded) | Origin should consider whether icon-only buttons need circle/square shape options |
| **Loading** | loading: boolean | State machine (idle/loading/success) | Pending with 1000ms delay | isLoading: boolean | Consider eBay's delay pattern to prevent flicker |
| **Accessibility** | role: button, WCAG AA | Adaptive sizing, screen reader titles | 48px min tap, tooltips on icon buttons | minHitArea prop | Origin could add min tap target spec |

---

## Sources

- [Wise Button](https://wise.design/components/button)
- [Wise Icon Button](https://wise.design/components/icon-button)
- [Wise Circular Button](https://wise.design/components/circular-button)
- [eBay Button overview](https://playbook.ebay.com/design-system/button)
- [eBay CTA Button](https://playbook.ebay.com/design-system/cta-button)
- [eBay Branded Button](https://playbook.ebay.com/design-system/branded-button)
- [eBay Icon Button](https://playbook.ebay.com/design-system/icon-button)
- [eBay Link Button](https://playbook.ebay.com/design-system/link-button)
- [Uber Base Web GitHub - constants](https://github.com/uber/baseweb/blob/main/src/button/constants.ts)
- [Uber Base Web GitHub - types](https://github.com/uber/baseweb/blob/main/src/button/types.ts)
- [Uber Base Web GitHub - styled-components](https://github.com/uber/baseweb/blob/main/src/button/styled-components.ts)
- [Uber Base Web docs](https://baseweb.design/components/button/)
- Origin button contract: `.claude/skills/cc-figma-component/examples/button.contract.json`
- Origin component inventory: `lab/research/2026-03-18-component-inventory-audit.md` (Aspora iOS button deep-dive)
