# Selection / selector control component comparison: Wise, eBay, Uber Base

Last updated: 2026-03-26

Cross-system comparison of checkbox, radio button, switch/toggle, and chip component specifications. Focused on extracting patterns relevant to Origin's selection control contract design.

---

## Systems surveyed

| System | Source | Selection components |
|---|---|---|
| **Wise** | wise.design/components | Checkbox, Radio, Switch, Chip (choice + filter) |
| **eBay** | playbook.ebay.com/design-system | Checkbox, Radio Button, Switch, Chip (filter + input), Filter Chip, Quick Filter, Toggle Button Group |
| **Uber Base** | baseweb.design/components | Checkbox (includes toggle mode), Radio + RadioGroup |

---

## 1. Checkbox

### 1a. Sizes

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Size variants | Not publicly documented | 2: Large (24px), Small (18px) | 1 size: 20px (`scale700`) |
| Default size | -- | Large (24px) | 20px |
| Dense/compact | -- | Small (18px), noted as "less tap-friendly" | N/A (single size, customizable via overrides) |
| Checkbox-to-label spacing | -- | Large: 16px, Small: 12px | 8px (`scale300`) |

### 1b. States

| State | Wise | eBay | Uber Base |
|---|---|---|---|
| Unchecked | Yes | Yes | Yes |
| Checked | Yes | Yes | Yes (`checked` prop) |
| Indeterminate | Not publicly documented | Yes ("when group includes both selected and unselected") | Yes (`isIndeterminate` prop) |
| Disabled | Not publicly documented | Yes (any state) | Yes (`disabled` prop) |
| Error | Not publicly documented | Not documented | Yes (`error` prop) |
| Hover | -- | Not detailed | Yes (`isHovered` state, changes background) |
| Focus | -- | Not detailed | Yes (`isFocusVisible` state, `borderSelected` ring) |
| Active/pressed | -- | Not detailed | Yes (`isActive` state, deeper fill) |

### 1c. Anatomy

| Part | Wise | eBay | Uber Base |
|---|---|---|---|
| Checkbox control | Yes | Yes | Yes (Checkmark sub-component) |
| Label | Yes (required) | Yes (required) | Yes (passed as `children`) |
| Description | -- | -- | Not built-in (use external) |
| Container/root | -- | -- | Yes (Root sub-component) |
| Hidden input | -- | -- | Yes (Input sub-component, 0x0 for a11y) |

### 1d. Label handling

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Label required? | Not publicly documented | Yes, always required | Optional (via `children`) |
| Label position | Not documented | Right of checkbox (fixed) | 4 options: `top`, `right`, `bottom`, `left` |
| Label interaction | -- | Clicking label toggles value | Clicking label toggles value |
| Label overflow | -- | Wraps; checkbox aligns to top of text | Handled by layout |
| Content guidelines | -- | Short, represent value or yes/no | No content guidelines in API |

### 1e. Group behavior

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Group component | Not documented | No dedicated group (form or menu context) | No dedicated CheckboxGroup |
| Inline vs stacked | -- | Vertical stacking shown | No built-in group layout |
| Select-all / indeterminate parent | -- | Supported via indeterminate state | Supported via `isIndeterminate` |

### 1f. Color treatment

| State | Wise | eBay | Uber Base |
|---|---|---|---|
| Unchecked border | Not documented | Not specified (implied neutral) | `tickBorder` (neutral) |
| Checked fill | Not documented | Not specified | `tickFillSelected` (brand/accent fill) |
| Indeterminate fill | -- | Same as checked | Same as checked (`tickFillSelected`) |
| Disabled | -- | Greyed out | `tickFillDisabled` (muted) |
| Error | -- | Not documented | `tickFillError` / `tickFillErrorSelected` |
| Check mark color | -- | -- | Implied white on filled background |

### 1g. Animation

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Check transition | Not documented | Not documented | `timing200` with `easeOutCurve` on background-image, border-color, background-color |
| Focus ring | -- | -- | `0 0 0 3px borderAccent` |

---

## 2. Radio button

### 2a. Sizes

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Size variants | Not publicly documented | 2: Large (24px), Small (18px) | 1 size: 20px (`scale700`) |
| Default size | -- | Large (24px) | 20px |
| Radio-to-label spacing | -- | Large: 16px, Small: 12px | 8px (`scale300`) |

### 2b. States

| State | Wise | eBay | Uber Base |
|---|---|---|---|
| Unselected | Yes | Yes | Yes |
| Selected | Yes | Yes | Yes (`checked` prop) |
| Disabled | Not documented | Yes (prerequisite-gated) | Yes (`disabled` prop) |
| Error | Not documented | Not documented | Yes (`error` prop with distinct color tokens) |
| Hover | -- | Not detailed | Yes (changes outer circle fill) |
| Focus | -- | Roving tabindex, arrow key navigation | Yes (`isFocusVisible`, `borderAccent` ring) |
| Active/pressed | -- | -- | Yes (deeper fill on press) |

### 2c. Anatomy

| Part | Wise | eBay | Uber Base |
|---|---|---|---|
| Outer circle | Yes | Yes | Yes (`RadioMarkOuter`) |
| Inner dot | Yes | Yes | Yes (`RadioMarkInner`, scales 0.3 when checked, 0.7 when unchecked) |
| Label | Yes (required) | Yes (required) | Yes (via `children`) |
| Description | -- | -- | Yes (`description` prop, max-width 240px) |
| Hidden input | -- | -- | Yes (clipped for a11y) |

### 2d. Label handling

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Label required? | Not documented | Yes, always | Optional |
| Label position | Not documented | Right (fixed) | 4 options: `top`, `right`, `bottom`, `left` |
| Label overflow | -- | Wraps; radio aligns to text top | Wraps per layout |
| Description support | -- | -- | Yes, built-in `description` prop on Radio |

### 2e. Group behavior

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Group component | Not documented | No dedicated component, but group rules enforced | Yes, `RadioGroup` component |
| Minimum items | -- | 2 (cannot exist standalone) | Not enforced by component |
| Group title | -- | Required to clarify relationship | Via external label (`aria-label` or `aria-labelledby`) |
| Layout direction | -- | Vertical shown | `align` prop: `vertical` (default) or `horizontal` |
| Keyboard navigation | -- | Roving tabindex, arrow keys cycle | Standard radio group behavior |

### 2f. Color treatment

| State | Wise | eBay | Uber Base |
|---|---|---|---|
| Unselected border | Not documented | Neutral | `tickBorder` (neutral) |
| Selected fill | Not documented | Brand/accent (updated in v2.1) | `tickFillSelected` (brand fill) |
| Inner dot (checked) | -- | -- | `tickMarkFill` (white/contrast) |
| Inner dot (unchecked) | -- | -- | `tickFill` (matches background) |
| Error | -- | -- | `tickBorderError` / `tickFillErrorSelected` |
| Disabled | -- | Greyed | `tickFillDisabled` |

### 2g. Animation

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Selection transition | Not documented | Not documented | `timing200` + `easeOutCurve` on background-color and transform (inner dot scale) |
| Focus ring | -- | -- | `0 0 0 3px borderAccent` |

---

## 3. Switch / toggle

### 3a. Architecture

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Standalone component? | Yes (Switch) | Yes (Switch) | No -- checkbox with `checkmarkType: 'toggle'` |
| Related components | "List Item - Switch" variant | -- | Shares Checkbox props, adds Toggle/ToggleInner/ToggleTrack overrides |

### 3b. Sizes

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Track width | Not documented | Not documented | 40px (`scale1000`) |
| Track height | Not documented | Not documented | 14px (`scale550`) |
| Thumb diameter | Not documented | Not documented | 20px (`scale700`) |
| Size variants | Not documented | Not documented | 1 (single size, customizable) |

### 3c. States

| State | Wise | eBay | Uber Base |
|---|---|---|---|
| Off | Yes | Yes (Unselected) | Yes (unchecked) |
| On | Yes | Yes (Selected) | Yes (checked) |
| Disabled | Not documented | Yes (either state) | Yes (`disabled` prop) |
| Indeterminate | -- | Explicitly not supported ("cannot be in an indefinite state") | Technically inherits `isIndeterminate` but not meaningful for toggle |
| Error | -- | -- | Yes (`error` prop inherited from Checkbox) |
| Hover | -- | -- | Yes (shadow changes: `shadow400` -> `shadow500`) |
| Focus | -- | -- | Yes (`borderAccent` 3px ring) |

### 3d. Anatomy

| Part | Wise | eBay | Uber Base |
|---|---|---|---|
| Track | Implied | Implied (referenced in guidance) | Yes (`ToggleTrack`, 40x14px, 7px border-radius) |
| Thumb | Implied | Implied | Yes (`Toggle`, 20px circle, 50% border-radius) |
| Inner indicator | -- | -- | Yes (`ToggleInner`) |
| Label | Yes | Yes (required, trailing) | Via Checkbox `children` prop |

### 3e. Label handling

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Label required? | Not documented | Yes, always | Optional |
| Label position | Not documented | Trailing (label leads, switch follows) | Same as checkbox: `top`, `right`, `bottom`, `left` |
| Label content | -- | Avoid "on"/"off"; use verbs like "Show", "Notify" | No content guidelines |

### 3f. Behavior

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Immediate effect? | Not documented | Yes -- "immediately update the state" | Not specified (follows checkbox onChange pattern) |
| Loading state | -- | "Use loading indicator if delay necessary" | Not built-in |
| vs. Checkbox distinction | -- | "Switches for activation, checkboxes for selection in forms" | Variant of same component |

### 3g. Color treatment

| State | Wise | eBay | Uber Base |
|---|---|---|---|
| Track (off) | Not documented | Native platform treatment | `toggleTrackFill` |
| Track (on) | Not documented | Native platform treatment | `toggleTrackFill` (same token; checked state changes thumb) |
| Thumb (off) | -- | -- | `toggleFill` |
| Thumb (on) | -- | -- | `toggleFillChecked` |
| Thumb (disabled) | -- | -- | `toggleFillDisabled` |
| Track (disabled) | -- | -- | `toggleTrackFillDisabled` |

### 3h. Animation

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Thumb slide | Not documented | Not documented | `translateX(100%)` with `timing200` transition |
| RTL support | -- | -- | `translateX(-100%)` for RTL |

---

## 4. Chips

### 4a. Types

| Chip type | Wise | eBay | Uber Base |
|---|---|---|---|
| Choice chip (single-select) | Yes | Via Toggle Button Group | No dedicated chip component |
| Filter chip (multi-select) | Yes | Yes (Filter Chip + Quick Filter) | No dedicated chip component |
| Input chip (tag-like) | No | Yes (Input Chip) | No dedicated chip component (use Tag) |
| Action chip | No | No | No |
| Dismissible chip | Filter chips have clear button | Input chips have delete button | N/A |

### 4b. Sizes

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Height | Not documented | 32px (chip + filter chip + quick filter) | N/A |
| Min width | -- | 56px (chip/filter), 2x height (quick filter) | N/A |
| Max width | -- | 320px (chip), 296px (filter chip), 256px (quick filter) | N/A |
| Expressive variant | -- | 72px min width (filter chip) | N/A |

### 4c. Chip anatomy

| Part | Wise | eBay (filter chip) | eBay (input chip) |
|---|---|---|---|
| Container | Implied | Yes | Yes |
| Title/label | Yes | Yes (required) | Yes |
| Leading icon | -- | Yes (optional; images in expressive) | -- |
| Trailing icon | -- | Chevron (dropdown variants) | Delete button |
| Counter | -- | Yes (multi-select shows count) | -- |
| Clear/delete button | Yes (filter chips) | Yes (input chips) | Yes |

### 4d. Selection behavior

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| **Choice/single-select** | One selected at a time; pre-select default; selecting new deselects old | Toggle Button Group: single-select mode; border + background change on selection | N/A |
| **Filter/multi-select** | Unselected by default; tap to select many; clear button to deselect | Filter Chip: discrete (toggle) or dropdown (single/multi with checkboxes + counter) | N/A |
| Immediate vs deferred | Not documented | Discrete: immediate. Dropdown multi: async or apply button | N/A |

### 4e. Layout

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Arrangement | Horizontal scrollable row | Single row, no stacking/wrapping | N/A |
| Placement | Below search, near top of screen, above content | Filter bars | N/A |
| Overflow | Horizontal scroll | Truncate labels (tooltip on hover/focus) | N/A |

### 4f. Content guidelines

| Property | Wise | eBay | Uber Base |
|---|---|---|---|
| Label length | Extremely short (one word preferred) | Keep short; truncate over wrap | N/A |
| Casing | Sentence case | Not specified | N/A |
| Punctuation | None | Not specified | N/A |
| Min items | Always in sets, never a single chip | Not specified | N/A |

### 4g. Color treatment

| State | Wise | eBay |
|---|---|---|
| Unselected | Not documented | Default container + label color |
| Selected | Visual state change (color/elevation/icon implied) | Filter: background fills with active color. Toggle Button: `background.secondary` + `border.strong` with increased border width |
| Hover | -- | State layer on delete button (chip), state layer on container (filter chip) |
| Disabled | -- | Mentioned but not detailed |

### 4h. eBay toggle button group (choice chip equivalent)

| Property | Value |
|---|---|
| Min width | 72px (minimal), 140px (list/gallery) |
| Min height | 40px (minimal) |
| Max width | 600px (minimal/list), 140px (gallery) |
| Selection indicator | Border thickens + changes to `border.strong`; background changes to `background.secondary` |
| Elements | Image (optional), Title (required, <20 chars), Subtitle (optional, 1-2 lines), Border, Container |
| Single-select | Yes |
| Multi-select | Yes |
| Keyboard states | Enabled, hover, disabled, focused |

---

## 5. Cross-cutting patterns

### 5a. Touch targets

| System | Approach |
|---|---|
| **Wise** | Not publicly documented |
| **eBay** | Large (24px) preferred on mobile; small (18px) acknowledged as "less tap-friendly" but no explicit minimum tap area stated |
| **Uber Base** | 20px visible control; no explicit minimum tap area documented, but checkbox/radio root is a flex container with pointer cursor |

Industry standard: 44x44px minimum (WCAG / Apple HIG). All three systems likely pad the visible control to meet this via the clickable label area, but none explicitly document a minimum tap target size in pixels.

### 5b. Platform approach

| System | Web | iOS | Android |
|---|---|---|---|
| **Wise** | Custom (Neptune) | Custom native | Custom native |
| **eBay** | Custom (Evo) | Native OS components | Native Material components |
| **Uber Base** | Custom (React) | Not applicable (web-only) | Not applicable (web-only) |

### 5c. Indeterminate state support

| Component | Wise | eBay | Uber Base |
|---|---|---|---|
| Checkbox | Not documented | Yes | Yes (`isIndeterminate` prop) |
| Radio | N/A | N/A | N/A |
| Switch | N/A | Explicitly no | Technically inherits but meaningless |

### 5d. Error state support

| Component | Wise | eBay | Uber Base |
|---|---|---|---|
| Checkbox | Not documented | Not documented | Yes (full error color token set: border, fill, hover, active) |
| Radio | Not documented | Not documented | Yes (full error color token set) |
| Switch | Not documented | Not documented | Yes (inherits from checkbox) |

### 5e. Customization/extensibility

| System | Approach |
|---|---|
| **Wise** | Closed system; no public API or customization surface |
| **eBay** | Platform tokens (Evo); native controls on mobile; no override API documented |
| **Uber Base** | Deep customization via `overrides` prop on every sub-component (Root, Checkmark, Label, Toggle, ToggleTrack, ToggleInner, Input for checkbox; RadioMarkInner, RadioMarkOuter, Label, Root, Input, Description for radio) |

---

## 6. Key takeaways for Origin

### Checkbox
- **Two sizes is the norm** (eBay). Uber Base offers one but with full override capability. A "default" (24px) and "compact" (18px-20px) pairing covers both standard and dense contexts.
- **Indeterminate is expected**. Both eBay and Uber Base support it. Essential for select-all patterns in tables/lists.
- **Error state is uncommon on checkboxes** -- only Uber Base provides it. eBay and Wise do not. Consider whether this is needed or whether validation belongs at the form/group level.
- **Labels are required** (eBay enforces, Wise implies). Label position is fixed-right in most systems; only Uber Base offers four-way placement.

### Radio
- **Two sizes mirror checkbox** (eBay). Keep sizing parity between checkbox and radio.
- **RadioGroup is valuable** (Uber Base). Provides layout control (vertical/horizontal) and accessible `name` grouping. eBay handles grouping via conventions rather than a component.
- **Description/sublabel** built into Uber Base's Radio is useful for complex option sets.
- **Minimum 2 items** (eBay). Enforce group semantics.

### Switch / toggle
- **Standalone vs. checkbox variant**: Wise and eBay treat switch as its own component. Uber Base makes it a checkbox `checkmarkType` variant. Separate component is cleaner for documentation and conceptual clarity.
- **Immediate effect is the defining characteristic** (eBay: "immediately update state"). This is the primary UX distinction from checkbox.
- **No indeterminate state** on switches (eBay explicitly forbids it).
- **Label position**: eBay mandates trailing placement (label leads, switch follows). This is the established pattern.
- **Loading state**: eBay recommends a loading indicator for delayed effects. Worth considering in the contract.

### Chips
- **Two core types**: Choice (single-select, like radio) and Filter (multi-select, like checkbox). eBay adds Input chips (tag-like) as a third type.
- **32px height is standard** (eBay across all chip variants).
- **Horizontal scrollable row** is the universal layout (both Wise and eBay).
- **Sentence case, one word preferred** (Wise). Keep labels extremely concise.
- **Wise pre-selects one choice chip by default** -- mirrors radio button convention.
- **eBay's filter chips have two interaction models**: discrete (immediate toggle) and dropdown (deferred selection with counter). The dropdown model is more complex but handles large option sets.
- **Uber Base does not have a chip component** -- this is a gap in their system.

### General
- **Wise's public docs are high-level only** -- detailed specs are behind authenticated Neptune docs. The patterns above are inferred from overview pages.
- **eBay is the most prescriptive** about content, behavior, and distinction between components.
- **Uber Base is the most technically thorough** -- full TypeScript types, granular color tokens per state combination, deep override system.
- **All systems use filled-background treatment for checked/selected states**, not outline-only. The checked state uses a brand/accent color fill with a contrasting mark.
- **Animation is subtle** -- Uber Base uses 200ms ease-out transitions. No system documents elaborate check/uncheck animations.
