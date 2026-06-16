# Component inventory audit

Last updated: 2026-03-24

Cross-platform audit of UI components across Figma, iOS, and Android. Covers the Aspora Component Library (Figma), `Vance-Club/vance-ios`, and `Vance-Club/vance-android`.

---

## Source

- **Figma**: [Aspora Component Library](https://www.figma.com/design/Vc84mP3YDNUXAGVQOugrfa/Aspora-Component-Library) — 30 pages, 173 published component sets (157 active, 8 sunset, 8 other)
- **iOS**: `Vance-Club/vance-ios` (branch: `dev`)
- **Android**: `Vance-Club/vance-android`

## Scope

This audit covers UI components only — excludes assets (3D icons, flags, payment methods, partner logos, icon sets). 24 component types audited.

---

## Cross-platform matrix


| #   | Component              | Figma                | iOS                                                                                                                                       | Android                                                                                                           | Status                    |
| --- | ---------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | **Button**             | Button v2            | `AsporaButton` + legacy `P91Button`                                                                                                       | `ButtonV2` Compose + `PlusButton` XML                                                                             | Matched                   |
| 2   | **Input Field**        | .boss_Input_Field_V2 | `AsporaInputField` + legacy `P91TextField`, specialized variants (date, email, phone, OTP, currency)                                      | `InputV2` Compose + `PlusEditText` XML, specialized variants (currency, code, pin)                                | Matched                   |
| 3   | **Checkbox**           | Checkboxes           | `P91Checkbox`, `CheckboxToggleStyle`, `CheckboxGroupView` + SDUI                                                                          | Compose `Checkbox` + `PlusCheckBox` XML                                                                           | Matched                   |
| 4   | **Chips**              | Chips                | `ChipView` with selected/unselected, border/filled, `ChipsFlowLayout`, `AsporaTag`                                                        | **Partial** — no reusable Compose chip in base library. Material chips in XML, ad-hoc Compose usage               | Android gap               |
| 5   | **Radio Button**       | Radio Button         | `P91RadioButton` + extensive SDUI radio groups                                                                                            | Compose `RadioButton` + `PlusRadioButton` XML                                                                     | Matched                   |
| 6   | **Search Bar**         | Search bar           | `P91SearchBar` with focus-aware borders, regex filtering                                                                                  | `SearchInput` Compose + `PlusSearchBar` XML                                                                       | Matched                   |
| 7   | **Selector**           | Selector             | `DropdownView` (presents bottom sheet), `MagneticPickerView` + SDUI variants                                                              | `SelectionField`, `CollapsibleSelectField`, `AppDropdownMenu`                                                     | Matched                   |
| 8   | **Slider**             | Slider               | `P91SliderView` (UIKit wrapper), `TickMarksSliderView`                                                                                    | `CustomSlider` Compose                                                                                            | Matched                   |
| 9   | **Toggle**             | Toggle               | `P91ToggleStyle` (SwiftUI ToggleStyle) with gradients, sizing, on/off images                                                              | `ToggleWithText` Compose + `PlusSwitch` XML                                                                       | Matched                   |
| 10  | **Bottom Sheet**       | Bottom sheet         | `BottomSheetController`, SwiftUI modifiers, native + custom variants, 30+ feature-specific sheets                                         | `AppBottomSheet` Compose + `BaseBottomSheetWithoutBarDialogFragment` XML, 15+ feature sheets                      | Matched                   |
| 11  | **Dialog**             | Dialogue sheet       | `P91DialogModifier` (SwiftUI ViewModifier) with spring animation                                                                          | **Partial** — no reusable Compose dialog. Uses bottom sheets or `GenericAlertParser`. XML `rewards_dialog` exists | Android gap               |
| 12  | **Toast**              | Toasts               | `ToastView` with success/error/info/neutral states, slides from top                                                                       | `PlusToastType` enum + `Toaster` singleton + `showPlusToast` extension. System-level, not a Compose component     | Architectural divergence  |
| 13  | **Progress Bar**       | Progress Bar         | `LinearProgressView`, `DashedProgressView`, `CircularProgressView`, `BannerProgressView`, `CountdownTimerView`                            | `AppLinearProgressIndicator` Compose + `PlusProgressBar` XML + `PlusFullScreenLoader`                             | Matched                   |
| 14  | **Top Navigation**     | Top Navigation       | `TopNavBarView` (profile, earn button, balance) + `HomeV3NavigationBarView` (Canvas-based)                                                | `PlusTopBarWithBack`, `PlusTopBarWithFilledClose` Compose                                                         | Matched                   |
| 15  | **Tab Bar**            | Bottom bar v3        | `TabBarView` with highlight configs, animation, Plotline tracking                                                                         | `BottomNavView` XML + `PlusTab` Compose (swipeable/non-swipeable)                                                 | Matched                   |
| 16  | **Section Label**      | Section Label        | **Partial** — `CanvasSectionTitleView` (Canvas-specific), `HomeTitleSectionViewModifier` (home-specific). No standalone generic component | `SectionHeader` Compose + `SectionHeaderViewHolder` XML                                                           | iOS gap                   |
| 17  | **Divider**            | Divider              | `AsporaDivider` (thin/thick), `DashedDivider`, `GradientHDivider`, `VDivider` + SDUI                                                      | `PlusDivider` Compose + `DashedDivider` Compose + `PlusDivider` XML                                               | Matched                   |
| 18  | **Action Pills**       | Action-pills         | `PillView`, `RoundedPill`, `CanvasQuickActionPillView`, `CategoryPillsView`                                                               | `QuickActionPillWidget`, `QuickActionIconWidget`, `Pill`, `SimplePill`                                            | Matched                   |
| 19  | **Banking Widget**     | Banking Widget       | **Partial** — `CanvasAccountBalanceWidget` data model exists, view returns `EmptyView()` (TODO)                                           | **Partial** — `AccountBalanceWidgetData` exists, composable TBD                                                   | Both stubs                |
| 20  | **NBA Action Card**    | NBA-action-card      | `CanvasNBAActionCardView` + legacy `ActionCardView`                                                                                       | `NbaActionCardWidget` Compose                                                                                     | Matched                   |
| 21  | **Offer Banner**       | Offer banner         | `CanvasOfferBannerView`, `CanvasHeroBannerView`, `BannerView` + SDUI                                                                      | `OfferBannerWidget`, `HeroBannerWidget` + carousel support                                                        | Matched                   |
| 22  | **Live Activity Card** | Live activity card   | **Partial** — `LiveActivityManager` (ActivityKit) works, `CanvasLiveStatusCardView` returns `EmptyView()` (TODO)                          | **Partial** — `LiveStatusCardWidgetData` model exists, composable TBD                                             | Both stubs                |
| 23  | **Slots**              | Slots                | **No** — no files found                                                                                                                   | **Partial** — `BaseCell` uses slot pattern (leading/center/trailing), not standalone                              | Weakest coverage          |
| 24  | **Skeleton/Loader**    | Solid-loader         | `Shimmer` view with configurable animation, feature-specific shimmer extensions                                                           | `skeleton()` modifier, `SkeletonCell`, `LoadingShimmerText`, `ShimmerFrameLayout` XML                             | Matched (naming diverges) |


---

## Summary


| Status                       | Count | Components                                                                                                                                                          |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Both platforms fully matched | 15    | Button, Input, Checkbox, Radio, Search, Selector, Slider, Toggle, Bottom Sheet, Progress, Top Nav, Tab Bar, Divider, Action Pills, NBA Card, Offer Banner, Skeleton |
| One platform has a gap       | 3     | Chips (Android missing Compose), Dialog (Android missing Compose), Section Label (iOS missing generic)                                                              |
| Both platforms partial/stub  | 3     | Banking Widget, Live Activity Card, Slots                                                                                                                           |
| Architectural divergence     | 1     | Toast (iOS = view component, Android = system utility)                                                                                                              |


## Patterns observed

### Naming conventions

- **iOS**: Newer components use `Aspora`* prefix (AsporaButton, AsporaInputField, AsporaDivider). Legacy components use `P91*` prefix. SDUI components use `SD*` prefix.
- **Android**: Compose components in `base/compose/components/`. XML views use `Plus`* prefix (PlusButton, PlusCheckBox, PlusEditText). Canvas/home widgets use `*Widget` suffix. Both live side by side.
- **Android has a figma-mapping.md** that explicitly maps Figma designs to Compose components. iOS has no equivalent.

### Legacy vs. current

Both platforms maintain legacy component versions alongside current ones. The rebrand is an opportunity to retire legacy versions as screens are redesigned.

### Server-driven UI

Both platforms have server-driven component variants (iOS: `SD`* prefix, Android: widget data models + `TemplateMapper`). These are not design system components — they're product-specific rendering of backend-defined layouts.

### Canvas/home widget system

Both platforms have a Canvas-based home screen widget system that renders server-defined widget types. Some widgets (Banking Widget, Live Activity Card) exist as data models but have stub/TODO UI implementations.

## iOS SwiftUI component deep-dive

Extracted 2026-03-24 from `Vance-Club/vance-ios` branch `dev`. All paths relative to `Aspora/UserInterface/Components/`.

---

### 1. Button (`Button/AsporaButton/`)

5 source files: `AsporaButton.swift`, `AsporaButtonStyle.swift`, `AsporaButtonVariant.swift`, `AsporaButtonConfig.swift`, `AsporaButtonEnvKey.swift`.

#### Public API — AsporaButton

Generic over `Label: View`. Convenience inits accept `String`, `TextConfig`, or `CTAButton` (resolves to `Text`).

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `label` | `Label: View` | required | Button content |
| `variant` | `AsporaButtonVariant` | `.primary` | Visual style |
| `size` | `AsporaButtonSize` | `.regular` | Set via `.size()` modifier |
| `leftIcon` | `Image?` | `nil` | Set via `.leftIcon()` modifier |
| `rightIcon` | `Image?` | `nil` | Set via `.rightIcon()` modifier |
| `leftIconURL` | `String?` | `nil` | Remote icon via KFImage |
| `rightIconURL` | `String?` | `nil` | Remote icon via KFImage |
| `isDisabled` | `Bool` | `false` | Set via `.disabled()` modifier |
| `fillsParent` | `Bool` | `true` | Full-width; `.fillsParent(false)` for intrinsic |
| `shouldTransformToSuccess` | `Bool` | `false` | Enables idle -> loading -> success animation |
| `externalLoadingBinding` | `Binding<Bool>?` | `nil` | Override loading state externally |
| `autoTriggerBinding` | `Binding<Bool>?` | `nil` | Programmatically trigger action |

#### Variants — `AsporaButtonVariant`

| Variant | Background | Text color | Border | Shadow | Other |
|---|---|---|---|---|---|
| `.primary` | Gradient: `buttonV2GradientStart` -> `buttonV2GradientEnd` | `.white` | Inner: `buttonV2InnerBorder`, outer: `buttonV2OuterBorder` | `buttonV2BorderShadow` at 25% | Pressed: `buttonV2Pressed` solid fill |
| `.secondary` | Solid `buttonV2SecondaryBackground` | `textBase600` | None (`.clear`) | None (`.clear`) | Pressed: same background |
| `.tertiary` | None (transparent) | `buttonV2SecondaryText` | None (`.clear`) | None (`.clear`) | Underlined text |

Disabled overrides:
- Primary: bg `buttonV2DisabledBackground`, text `.white`, borders `buttonV2DisabledInnerBorder` / `buttonV2DisabledOuterBorder`, shadow at 10%
- Secondary: text `buttonV2SecondaryTextDisabled`, same background
- Tertiary: text `textBase400` at 30% opacity

#### Sizes — `AsporaButtonSize`

| Size | Height | Font | Horizontal padding |
|---|---|---|---|
| `.regular` | 52 pt | `.theme.buttonL` | `.space.M` |
| `.small` | 36 pt | `.theme.buttonS` | `.space.M` |

#### States — `AsporaButtonState`

| State | Visual |
|---|---|
| `.idle` | Label + optional icons in HStack (spacing `.space.XS`) |
| `.loading` | Spinning star icon (24x24), 1s continuous rotation |
| `.success` | Circular pill with checkmark (`.space.L`), spring-in animation |

#### Layout details

- Shape: `Capsule()` (fully rounded pill)
- Icon size: 24x24 pt
- Content spacing: `.space.XS` between icons and label
- Border: double-border — outer 1pt stroke, inner 1pt stroke inset 1pt
- Shadow: radius `.space.XS`, y-offset `.space.XXS`
- Press animation: `scaleEffect(0.98)` with `easeInOut(0.1s)`
- Tertiary: no capsule background, padding `.space.XXS` horizontal only
- Success state: button morphs to circle (width = height = size.height), spring response 0.5s damping 0.7

#### Color tokens

```
.theme.buttonV2GradientStart
.theme.buttonV2GradientEnd
.theme.buttonV2Pressed
.theme.buttonV2DisabledBackground
.theme.buttonV2InnerBorder
.theme.buttonV2OuterBorder
.theme.buttonV2DisabledInnerBorder
.theme.buttonV2DisabledOuterBorder
.theme.buttonV2BorderShadow
.theme.buttonV2SecondaryBackground
.theme.buttonV2SecondaryText
.theme.buttonV2SecondaryTextDisabled
.theme.textBase600
.theme.textBase400
```

---

### 2. Toggle (`Toggle/P91ToggleStyle.swift`)

Implements SwiftUI `ToggleStyle`. All customization via builder-pattern modifiers.

#### Properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `activeColor` | `Color` | `.green` | Track color when on |
| `inactiveColor` | `Color` | `.gray` | Track color when off |
| `activeGradientColor` | `[Color]` | `[]` | Optional gradient overlay when on |
| `inactiveGradientColor` | `[Color]` | `[]` | Optional gradient overlay when off |
| `borderStrokeWidth` | `CGFloat` | `0` | Border around track |
| `borderStrokeGradient` | `[Color]` | `[]` | Gradient for track border |
| `thumbColor` | `Color` | `.white` | Thumb circle color |
| `sizeClass` | `SizeClass` | `.regular` | Controls all dimensions |
| `onImage` | `ImageResource?` | `nil` | Icon inside thumb when on |
| `offImage` | `ImageResource?` | `nil` | Icon inside thumb when off |
| `hideConfigurationLabel` | `Bool` | `false` | Hides the Toggle label |
| `hideSpacer` | `Bool` | `false` | Prevents full-width stretch |

#### Sizes — `ConfigurationSizeStyle`

| Size | Track (w x h) | Thumb (w x h) | Icon (w x h) | Thumb offset |
|---|---|---|---|---|
| `.large` | 46 x 28 | 24 x 24 | 20 x 20 | 9 pt |
| `.regular` | 40 x 24 | 20 x 20 | 16 x 16 | 8 pt |
| `.small` | 34 x 20 | 16 x 16 | 10 x 10 | 6.8 pt |

#### Layout details

- Track shape: `Rectangle` with `cornerRadius(24)` (pill)
- Thumb shape: `Circle`
- Thumb travel: slides from `-offset` to `+offset` on x-axis
- Animation: timing curve `(0.42, 0.0, 0.58, 1.0)`, 0.1s (ease-in-out)
- Optional gradient: `LinearGradient` bottom-to-top on track
- Optional border: gradient stroke on `RoundedRectangle` matching track
- Label spacing: 5pt trailing padding from label to toggle
- Tap target: entire track rectangle

#### Color tokens (from production usage in TogglesDemoView)

```
.theme.fillsBasePrimary500      (active color)
.theme.fillsSurfaceGray3         (inactive color)
.theme.buttonV2GradientStart     (gradient variant)
.theme.buttonV2GradientEnd       (gradient variant)
```

---

### 3. Divider (`Dividers/AsporaDivider.swift`)

Sibling files exist (`DashedDivider.swift`, `GradientHDivider.swift`, `VDivider.swift`) but only `AsporaDivider` is the primary component.

#### Public API

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `type` | `DividerType` | `.thin` | Init parameter |
| `color` | `Color?` | `nil` | Override; falls back to theme default per type |

#### Variants — `DividerType`

| Type | Height | Default color | Implementation |
|---|---|---|---|
| `.thin` | 1 pt | `fillsSurfaceGray5` | SwiftUI `Divider()` with `foregroundStyle` |
| `.thick` | 4 pt | `fillsSurfaceGray6` | `Rectangle().fill()`, full width |

#### Color tokens

```
.theme.fillsSurfaceGray5     (thin default)
.theme.fillsSurfaceGray6     (thick default)
```

---

### 4. Checkbox (`Checkbox/`)

Two implementations: `P91Checkbox.swift` (standalone visual) and `CheckboxToggleStyle.swift` (SwiftUI ToggleStyle wrapper with label support).

#### P91Checkbox — properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `checkboxType` | `CheckboxType` | `.square` | Shape variant |
| `checkboxState` | `CheckboxState` | `.resting` | Visual state |
| `sizeClass` | `SizeClass` | `.medium` | Dimensions |

#### P91Checkbox — shape variants (`CheckboxType`)

| Type | Shape | Corner radius |
|---|---|---|
| `.square` | `RoundedRectangle` | 6 pt |
| `.circular` | `Circle` | n/a |

#### P91Checkbox — states (`CheckboxState`)

| State | Fill | Border | Checkmark |
|---|---|---|---|
| `.resting` | `.clear` | `fillsSurfaceGray` 1pt stroke | No |
| `.active` | `fillsBasePrimary500` | `.clear` | Yes, white (`.fillsSurfaceWhite`) |
| `.disabled` | `fillsSurfaceGray5` | `fillsSurfaceGray4` 1pt stroke | No |
| `.disabledActive` | `fillsSurfaceGray2` | `.clear` | Yes, white |

#### P91Checkbox — sizes

| Size | Box (w x h) | Icon (w x h) |
|---|---|---|
| `.large` | 28 x 28 | 20 x 20 |
| `.medium` | 24 x 24 | 16 x 16 |
| `.small` | 20 x 20 | 12 x 12 |

#### CheckboxToggleStyle — properties

Alternative checkbox used as a SwiftUI `ToggleStyle` (authored by Paul Lavoine).

| Property | Type | Default | Notes |
|---|---|---|---|
| `sizeClass` | `SizeClass` | `.small` | Only small and medium |
| `labelColor` | `Color?` | `nil` | Falls back to `textBase400` |
| `labelFont` | `Font?` | `nil` | Falls back to `.theme.bodyMMedium` |

#### CheckboxToggleStyle — sizes

| Size | Box | Corner radius | Checkmark (system font) |
|---|---|---|---|
| `.small` | 16 pt | 4 pt | 8 pt bold |
| `.medium` | 24 pt | 6 pt | 12 pt bold |

#### CheckboxToggleStyle — states

| State | Fill | Border | Checkmark |
|---|---|---|---|
| Off | `.clear` | 2pt `fillsBasePrimary500` | No |
| On | `fillsBasePrimary500` | `.clear` | White system checkmark |

#### CheckboxToggleStyle — layout

- `HStack(alignment: .top, spacing: 8)` — label right of checkbox
- Wrapped in plain `Button` (no default button styling)

#### Color tokens (both implementations)

```
.theme.fillsBasePrimary500       (active fill)
.theme.fillsSurfaceGray          (resting border, P91)
.theme.fillsSurfaceGray2         (disabled-active fill, P91)
.theme.fillsSurfaceGray4         (disabled border, P91)
.theme.fillsSurfaceGray5         (disabled fill, P91)
.theme.fillsSurfaceWhite         (checkmark color, P91)
.theme.textBase400               (label fallback, CheckboxToggleStyle)
```

---

### 5. Radio button (`RadioButtton/P91RadioButton.swift`)

Note: directory has a typo — "RadioButtton" with triple-t.

#### Properties

| Property | Type | Default | Notes |
|---|---|---|---|
| `radioButtonState` | `RadioButtonState` | `.resting` | Visual state |
| `sizeClass` | `SizeClass` | `.medium` | Dimensions |

#### States — `RadioButtonState`

| State | Fill | Border | Inner dot |
|---|---|---|---|
| `.resting` | `.clear` | `fillsSurfaceGray` 1pt stroke | No |
| `.active` | `fillsBasePrimary500` | n/a | 8x8 white circle (`fillsSurfaceWhite`) |
| `.disabled` | `fillsSurfaceGray5` | `fillsSurfaceGray5` 1pt stroke | No |
| `.disabledActive` | `fillsSurfaceGray2` | n/a | 8x8 white circle (reuses active view) |

#### Sizes — `SizeClass`

| Size | Diameter |
|---|---|
| `.large` | 28 pt |
| `.medium` | 24 pt |
| `.small` | 20 pt |
| `.extraSmall` | 18 pt |

Note: Radio has 4 sizes (includes `.extraSmall`); Checkbox has only 3.

#### Layout details

- Shape: always `Circle()`
- Resting: 1pt `strokeBorder`
- Active: solid filled circle with 8x8 white circle overlay centered
- Disabled: filled circle with 1pt `strokeBorder` overlay
- Inner dot: fixed 8x8 pt regardless of size class

#### Color tokens

```
.theme.fillsBasePrimary500     (active fill)
.theme.fillsSurfaceGray        (resting border)
.theme.fillsSurfaceGray2       (disabled-active fill)
.theme.fillsSurfaceGray5       (disabled fill and border)
.theme.fillsSurfaceWhite       (inner dot)
```

---

### iOS shared color token summary

All color tokens used across these 5 components:

| Token | Used by | Semantic meaning |
|---|---|---|
| `fillsBasePrimary500` | Checkbox, Radio, Toggle | Primary brand fill (active state) |
| `fillsSurfaceWhite` | Checkbox, Radio | White foreground on filled controls |
| `fillsSurfaceGray` | Checkbox, Radio | Resting/default border |
| `fillsSurfaceGray2` | Checkbox, Radio | Disabled-active fill |
| `fillsSurfaceGray3` | Toggle | Inactive track |
| `fillsSurfaceGray4` | Checkbox | Disabled border |
| `fillsSurfaceGray5` | Checkbox, Radio, Divider | Disabled fill / thin divider |
| `fillsSurfaceGray6` | Divider | Thick divider fill |
| `textBase600` | Button | Secondary button text |
| `textBase400` | Button, Checkbox | Tertiary disabled text / checkbox label |
| `buttonV2GradientStart` | Button, Toggle | Primary gradient top |
| `buttonV2GradientEnd` | Button, Toggle | Primary gradient bottom |
| `buttonV2Pressed` | Button | Primary pressed state |
| `buttonV2DisabledBackground` | Button | Primary disabled background |
| `buttonV2InnerBorder` | Button | Primary inner border |
| `buttonV2OuterBorder` | Button | Primary outer border |
| `buttonV2DisabledInnerBorder` | Button | Primary disabled inner border |
| `buttonV2DisabledOuterBorder` | Button | Primary disabled outer border |
| `buttonV2BorderShadow` | Button | Primary shadow color |
| `buttonV2SecondaryBackground` | Button | Secondary fill |
| `buttonV2SecondaryText` | Button | Tertiary text |
| `buttonV2SecondaryTextDisabled` | Button | Secondary disabled text |

---

## Recommendations for Origin

1. **Start with the 4 shared components** identified in the working plan: Button, Input Field, Radio/Checkbox, Selector. These are the most mature and best-matched across platforms.
2. **Chips needs a Compose implementation** on Android before it can be considered shared.
3. **Dialog on Android** could be added to the base Compose library — currently relying on bottom sheets for dialog-like patterns.
4. **Section Label on iOS** should be extracted from Canvas-specific implementations into a generic reusable component.
5. **Banking Widget and Live Activity Card** are product-specific widgets with TODO stubs — not design system components. Deprioritize.
6. **Slots** is a Figma layout pattern, not a component per se. Both platforms implement the concept through slot-based architecture (Compose content lambdas, SwiftUI ViewBuilder) rather than standalone components.
7. **Toast** architectural divergence should be resolved — decide whether Origin specifies it as a view component or a system utility.

---

## Android Compose component deep-dive

Extracted 2026-03-24 from `Vance-Club/vance-android` HEAD. All paths relative to `app/src/main/java/tech/vance/app/base/compose/`.

---

### 1. Button (`components/ButtonV2.kt`)

Two public composables: `ButtonV2Large` and `ButtonV2Medium`.

#### Public API — ButtonV2Large

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `text` | `String` | required | Button label |
| `onClick` | `() -> Unit` | required | Tap callback |
| `modifier` | `Modifier` | `Modifier.fillMaxWidth()` | Layout modifier |
| `state` | `ButtonState` | `ENABLED` | Controls enabled/disabled/loading |
| `variant` | `ButtonVariant` | `Primary` | Visual style |
| `buttonSize` | `ButtonSize` | `L` | Height + typography selection |
| `leadingIcon` | `(@Composable () -> Unit)?` | `null` | Optional icon slot before text |

#### Public API — ButtonV2Medium

Same parameters as ButtonV2Large except no `buttonSize` parameter (hardcoded to S-equivalent: 36dp height, `ButtonS` typography).

#### Enums and sealed classes

**ButtonState** (`components/ButtonState.kt`):

| Value | `isClickable` | `showLoadingSpinner` |
|-------|---------------|----------------------|
| `ENABLED` | true | false |
| `DISABLED` | false | false |
| `LOADING` | false | true |

**ButtonVariant** (sealed class):

| Object | Description |
|--------|-------------|
| `Primary` | Gradient purple CTA |
| `White` | Light/neutral secondary |

**ButtonSize**:

| Value | Height | Loader icon size | Typography |
|-------|--------|------------------|------------|
| `L` | 52dp | 18dp | `ButtonL` (Inter SemiBold 15/17sp) |
| `S` | 36dp | 12dp | `ButtonS` (Inter SemiBold 12/13sp) |

#### Colors by variant and state

**Primary variant:**

| Property | Default | Pressed | Disabled |
|----------|---------|---------|----------|
| Background | Vertical gradient: `#6E2FE4` -> `#5523B2` | Solid `#501FA9` | Same as default, alpha 0.3 |
| Content (text/icon) | `#FFFFFF` (textContrast600) | Same | Same |
| Border | `#43149B` (buttonBorderShadow) | Same | Same |
| Shadow | `#43149B` at 0.5 alpha | Same | 0.2 alpha |
| Inner highlight top | `White @ 40%` | `White @ 20%` | Same |
| Inner border glow | `White @ 30%` | `White @ 10%` | Same |

**White variant:**

| Property | Default | Pressed | Disabled |
|----------|---------|---------|----------|
| Background | Solid `#E5E5EA` (fillsSurfaceGray5) | Solid `#D1D1D6` (fillsSurfaceGray4) | Same as default, alpha 0.3 |
| Content (text/icon) | `#0E0F11` (textBase600) | Same | Same |
| Border | `#D1D1D6` (fillsSurfaceGray4) | Same | Same |
| Shadow | `#D1D1D6` at 0.15 alpha | Same | 0.05 alpha |
| Inner highlight / glow | Transparent | Transparent | Transparent |

#### Layout details

- Shape: fully rounded (`RoundedCornerShape(100.dp)`)
- Horizontal padding (content inset): 16dp
- Border width: 1dp
- Inner border inset: 1dp stroke inside the border
- Shadow: offset Y=4dp, blur=12dp, corner radius=100dp
- Press animation: scale to 0.95 over 100ms
- Loading spinner: rotating `Icon.LoadingStar`, 1000ms per rotation
- Content transition: fade + scale (0.8 initial) over 250ms
- Icon-to-text spacing: 12dp (via `Arrangement.spacedBy`)
- Haptic feedback on tap: `KEYBOARD_TAP`

---

### 2. Toggle (`components/ToggleWithText.kt`)

Two public composables: `ToggleWithText` (row with label + toggle) and `Toggle` (standalone switch).

#### Public API — ToggleWithText

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `checked` | `Boolean` | required | Toggle state |
| `onCheckedChange` | `(Boolean) -> Unit` | required | State callback |
| `modifier` | `Modifier` | `Modifier` | Layout modifier |
| `enabled` | `Boolean` | `true` | Interaction enabled |
| `content` | `@Composable () -> Unit` | required | Label slot (any composable) |

#### Public API — Toggle

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `checked` | `Boolean` | required | Toggle state |
| `onCheckedChange` | `((Boolean) -> Unit)?` | required | Null = read-only |
| `modifier` | `Modifier` | `Modifier` | Layout modifier |
| `enabled` | `Boolean` | `true` | Interaction enabled |
| `width` | `Dp` | `46.dp` | Track width |
| `height` | `Dp` | `28.dp` | Track height |
| `knobSize` | `Dp` | `24.dp` | Knob diameter |
| `horizontalPadding` | `Dp` | `2.dp` | Padding inside track |

#### Colors

| Element | On (checked) | Off (unchecked) | Disabled |
|---------|-------------|-----------------|----------|
| Track | `#5523B2` (fillsBasePrimary500) | `#D1D1D6` (fillsSurfaceGray4) | `fillsSurfaceGray4 @ 60%` |
| Knob | `#FFFFFF` (fillsSurfaceWhite) | Same | `fillsSurfaceGray6` |
| Check icon tint | `#5523B2` (fillsBasePrimary500) | N/A (hidden) | `textBase400` |

#### Layout details

- Track shape: 50% rounded (pill)
- Knob shape: circular (50% rounded)
- Knob travel distance: `width - (horizontalPadding * 2) - knobSize` = 18dp with defaults
- Knob animation: spring with `DampingRatioMediumBouncy`, `StiffnessLow`
- Check icon inside knob: `Icon.Check` at 12dp, alpha animated (1 when checked, 0 when unchecked)
- ToggleWithText row: vertical padding 16dp, 16dp spacer between content and toggle
- Row fills width, content slot gets `weight(1f)`
- Semantic role: `Role.Switch`
- Haptic feedback: `LongPress`

---

### 3. Divider — Solid (`components/PlusDivider.kt`)

Single composable wrapping Material3 `HorizontalDivider`.

#### Public API — PlusDivider

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `modifier` | `Modifier` | `Modifier` | Layout modifier |
| `thickness` | `Dp` | `2.dp` | Line thickness |
| `color` | `Color` | `Theme.colors.fillsSurfaceGray6` | Line color |

#### Color reference

- Default color: `#F2F2F7` (fillsSurfaceGray6)

#### Layout details

- Wraps `HorizontalDivider` from Material3 — no custom drawing
- Full width by default (inherits from parent)
- No variants or states

---

### 4. Divider — Dashed (`components/DashedDivider.kt`)

Custom Canvas-drawn dashed line.

#### Public API — DashedDivider

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `modifier` | `Modifier` | `Modifier` | Layout modifier |
| `color` | `Color` | `Theme.colors.fillsSurfaceGray5` | Dash color |
| `thickness` | `Dp` | `1.dp` | Line thickness |
| `dashWidth` | `Dp` | `8.dp` | Length of each dash |
| `gapWidth` | `Dp` | `8.dp` | Gap between dashes |
| `customWidth` | `Dp?` | `null` | Fixed width override; null = fillMaxWidth |

#### Color reference

- Default color: `#E5E5EA` (fillsSurfaceGray5)

#### Layout details

- Draws via `Canvas` composable with `PathEffect.dashPathEffect`
- Height equals `thickness`
- Width: `fillMaxWidth()` unless `customWidth` is set
- No animation, no states

---

### 5. Checkbox (`components/Checkbox.kt`)

Single composable with animated check mark.

#### Public API — Checkbox

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `checked` | `Boolean` | required | Checked state |
| `onCheckedChange` | `(Boolean) -> Unit` | required | State callback |
| `modifier` | `Modifier` | `Modifier` | Layout modifier |
| `checkedColor` | `Color` | `Theme.colors.fillsBasePrimary500` | Background when checked |
| `enabled` | `Boolean` | `true` | Interaction enabled |

#### Colors

| Element | Checked | Unchecked |
|---------|---------|-----------|
| Background | `checkedColor` param (default `#5523B2`) | `Transparent` |
| Border | `Transparent` (hidden) | `#8E8E93` (fillsSurfaceGray) at 1.3dp |
| Checkmark icon | `#FFFFFF` (White) | Hidden (scale 0) |

Note: The `figma-mapping.md` documents two semantic color usages:
- Purple checkbox (default): `checkedColor = fillsBasePrimary500` (#5523B2)
- Green checkbox (confirmed): `checkedColor = utilityGreen200` (#188B33)

#### Layout details

- Overall size: 21dp x 21dp
- Corner radius: 7dp (`RoundedCornerShape(7.dp)`)
- Checkmark icon: `R.drawable.ic_check` at 16dp, tint White
- Border width: animated from 1.3dp (unchecked) to 0dp (checked) over 200ms
- Background color: animated over 200ms tween
- Container scale bounce on check: scales to 1.2 (100ms) then springs back to 1.0 (damping 0.5)
- Checkmark scale: spring animation (damping 0.45, stiffness Low)
- Disabled: entire component at 50% alpha
- Semantic role: `Role.Checkbox`
- Haptic feedback: `LongPress`

---

### 6. Radio button (`components/RadioButton.kt`)

Single composable with animated inner dot.

#### Public API — RadioButton

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `selected` | `Boolean` | required | Selected state |
| `onClick` | `() -> Unit` | required | Tap callback |
| `modifier` | `Modifier` | `Modifier` | Layout modifier |

Note: No `enabled` parameter — always interactive.

#### Colors

| Element | Selected | Unselected |
|---------|----------|------------|
| Border | `#5523B2` (fillsBasePrimary500) | `#C7C7CC` (fillsSurfaceGray3) |
| Inner circle | `#5523B2` (fillsBasePrimary500) | Hidden (scale 0) |

#### Layout details

- Overall size: 21dp x 21dp
- Shape: `CircleShape`
- Border width: 1.3dp (fixed, does not animate)
- Inner circle: 7dp diameter, centered
- Border color: animated over 200ms tween
- Inner circle scale: spring with `DampingRatioMediumBouncy`, `StiffnessLow`
- Inner circle alpha: animated over 150ms tween
- Semantic role: `Role.RadioButton`
- Haptic feedback: `LongPress`

---

### Token reference summary

All color tokens used across these 5 components, mapped to hex values from `AsporaColorPalette`:

| Token | Hex | Used in |
|-------|-----|---------|
| `fillsBasePrimary500` | `#5523B2` | Toggle track (on), Checkbox bg, RadioButton border+dot |
| `fillsSurfaceGray` | `#8E8E93` | Checkbox border (unchecked) |
| `fillsSurfaceGray3` | `#C7C7CC` | RadioButton border (unselected) |
| `fillsSurfaceGray4` | `#D1D1D6` | Toggle track (off), Button White border/shadow |
| `fillsSurfaceGray5` | `#E5E5EA` | Button White bg, DashedDivider default |
| `fillsSurfaceGray6` | `#F2F2F7` | PlusDivider default, Toggle knob (disabled) |
| `fillsSurfaceWhite` | `#FFFFFF` | Toggle knob |
| `textBase600` | `#0E0F11` | Button White content |
| `textBase400` | `#0E0F11 @ 45%` | Toggle check tint (disabled) |
| `textContrast600` | `#FFFFFF` | Button Primary content |
| `buttonGradientStart` | `#6E2FE4` | Button Primary gradient top |
| `buttonGradientEnd` | `#5523B2` | Button Primary gradient bottom |
| `buttonPressed` | `#501FA9` | Button Primary pressed bg |
| `buttonBorderShadow` | `#43149B` | Button Primary border + shadow |

Typography tokens used:

| Token | Font | Size/Line | Weight | Used in |
|-------|------|-----------|--------|---------|
| `ButtonL` | Inter | 15/17sp | SemiBold (600) | ButtonV2Large size L |
| `ButtonS` | Inter | 12/13sp | SemiBold (600) | ButtonV2Large size S, ButtonV2Medium |

