# Native app token audit — iOS & Android

## Status
2026-03-17. Remote audit of `Vance-Club/vance-ios` and `Vance-Club/vance-android` via GitHub API. No repos cloned.

## Summary

Both native apps were recently refactored (March 2026, by Aryan Rai) with a unified token naming system. The token names are ~90% aligned across platforms. Both support server-driven typography with matching enum identifiers. Dark mode infrastructure exists on both but is unused. The Compose token system on Android is the "new system" — the XML resource layer is legacy and divergent.

---

## Repo overview

### iOS (`Vance-Club/vance-ios`)

| | |
|---|---|
| Language | Swift 6.0 |
| UI Framework | SwiftUI |
| Min iOS | 16.4+ |
| Architecture | Clean Architecture (Domain/Data/Repository/Core/UI) |
| DI | Swinject |
| Navigation | Coordinator pattern |
| Deps Manager | SPM (primary), CocoaPods (TensorFlowLiteC, legacy video KYC) |
| Linting | SwiftLint |

### Android (`Vance-Club/vance-android`)

| | |
|---|---|
| Language | Kotlin |
| UI Framework | XML views (legacy) migrating to Jetpack Compose |
| Min SDK | 26 |
| Architecture | MVVM (XML) → MVI (Compose), 6 modules |
| DI | Hilt |
| Navigation | AndroidX Navigation v2 |
| Deps Manager | Version catalog (`libs.versions.toml`) |
| CI/CD | GitHub Actions → Slack + Google Play Internal |

---

## Token file locations

### iOS

```
Aspora/App/Constants/Theme/
├── ColorConstants.swift           ~120 color tokens
├── FontConstants.swift            ~40 font presets (SwiftUI + UIKit variants)
├── SpaceConstants.swift           13 spacing values
├── CornerRadiusConstants.swift    8 radius values

Aspora/Data/Models/Common/
├── Typography.swift               ~40 primary + ~30 legacy font configs (Codable enum)
├── DecodableTypography.swift      JSON decoder for server-driven typography

Aspora/Core/Extensions/Color/
├── Color+.swift                   hex initializer (UInt32 + String)
├── Color+Scheme.swift             light|dark operator (currently returns light only)
├── Color+Theme.swift              Color.theme accessor
├── ShapeStyle+Theme.swift         (not audited)

Aspora/Core/Extensions/Font/
├── AppFont.swift                  FontConfig struct, Font/UIFont initializers
├── Font+Theme.swift               Font.theme accessor
├── UIFont+Theme.swift             UIFont.theme accessor

Aspora/Core/Extensions/
├── CGFloat+Theme.swift            CGFloat.space and CGFloat.corner accessors
```

### Android (Compose — the "new system")

```
app/src/main/java/tech/vance/app/base/compose/
├── tokens/
│   ├── Colors.kt                  ColorPalette abstract + AsporaColorPalette (~60 colors)
│   ├── Typography.kt              Typography data class + AppTextStyles enum (~35 styles)
│   ├── Dimens.kt                  Spacing/Radius/Size/IconSize enums
│   ├── Shape.kt                   AppShapes object (RoundedCornerShapes)
├── theme/
│   ├── Theme.kt                   AppTheme composable, CompositionLocal providers

data-layer/src/main/java/tech/vance/app/data_layer/common_ui/
├── PlusTypography.kt              Server-driven typography enum (~40 values + aliases)

app/src/main/java/tech/vance/app/base/extension/
├── TypographyModels.kt            SpannableTheme for XML view typography
```

### Android (XML — legacy, divergent)

```
app/src/main/res/values/
├── colors.xml                     Legacy naming (green_main_primary_original_teal_deer)
├── dimens.xml                     Uses sdp (scalable dp), different values than Compose
├── styles.xml                     (not audited in detail)
├── themes.xml                     (not audited in detail)
```

---

## Color tokens

### iOS — `ColorConstants.swift`

Static enum with ~120 tokens organized by semantic group. Uses a custom `|` infix operator for light/dark mode pairs.

```swift
// Usage: Color.theme.textBase600

// Text/Base
static let textBase400 = Color(hex: 0x0E0F11).opacity(0.45) | Color(hex: 0xDCE2E5).opacity(0.45)
static let textBase500 = Color(hex: 0x0E0F11).opacity(0.65) | Color(hex: 0xDCE2E5).opacity(0.65)
static let textBase600 = Color(hex: 0x0E0F11) | Color(hex: 0xDCE2E5)
static let textBaseInfo = Color(hex: 0x4A5DF9) | Color(hex: 0x4A5DF9)
static let textBaseAccent = Color(hex: 0x4A5DF9) | Color(hex: 0x4A5DF9)
static let textBaseDanger = Color(hex: 0xF71D11) | Color(hex: 0xF71D11)
static let textBaseWarning = Color(hex: 0xDF7727) | Color(hex: 0xDF7727)
static let textBaseSuccess = Color(hex: 0x188B33) | Color(hex: 0x188B33)

// Text/Contrast
static let textContrast600 = Color(hex: 0xFFFFFF) | Color(hex: 0xDCE2E5)

// Fills/Surface
static let fillsSurfaceGray5 = Color(hex: 0xE5E5EA) | Color(hex: 0x2C2C2E)
static let fillsSurfaceGray6 = Color(hex: 0xF2F2F7) | Color(hex: 0xF2F2F7)

// Fills/Primary (brand purple)
static let fillsBasePrimary500 = Color(hex: 0x5523B2) | Color(hex: 0x5523B2)

// Utility
static let utilityGreen100 = Color(hex: 0x21BD45)
static let utilityRed100 = Color(hex: 0xF71D11)
static let utilityBlue100 = Color(hex: 0x4A5DF9)
static let utilityOrange100 = Color(hex: 0xECA53A)

// V2 Button (component-level tokens)
static let buttonV2GradientStart = Color(hex: 0x6E2FE4)
static let buttonV2GradientEnd = Color(hex: 0x5523B2)
static let buttonV2Pressed = Color(hex: 0x501FA9)
static let buttonV2BorderShadow = Color(hex: 0x43149B)

// Legacy section (~20 tokens from the old dark-first design)
static let legacyPrimaryOriginal = Color(hex: 0x81EBAB)   // old green primary
static let legacySecondaryGold = Color(hex: 0xFCDB66)
```

**Dark mode status**: The `|` operator is defined but currently **always returns the light color**:
```swift
static func | (lightMode: Color, darkMode: Color) -> Color {
    return Color(UIColor { _ in
        return lightMode.uiColor  // TODO: Enable dark mode
    })
```

**Groups**: Text/Base, Text/Contrast, Text/Button, Text/Normal, Fills/Surface (gray scale), Fills/Primary (brand purple), Utility (red/orange/green/blue/yellow/pink/purple), V2 Button, V2 Secondary Button, Legacy

### Android — `Colors.kt` (Compose)

Abstract `ColorPalette` base class with concrete `AsporaColorPalette`. Uses a `Fixed`/`Adaptable` sealed interface for theme-aware colors.

```kotlin
// Usage: Theme.colors.textBase600

// Abstract palette defines the contract
abstract class ColorPalette(val theme: AppTheme) {
    abstract val fillsSurfaceWhite: Color
    abstract val textBase600: Color
    // ... ~55 abstract properties
}

// Concrete implementation
open class AsporaColorPalette(theme: AppTheme) : ColorPalette(theme) {
    override val textBase600 by color { Fixed(Color(0xFF0E0F11)) }
    override val textBase500 by color { Fixed(Color(0xA60E0F11)) }
    override val fillsBasePrimary500 by color { Fixed(Color(0xFF5523B2)) }
    // ...
}
```

**Dark mode status**: `Adaptable(light: Color, dark: Color)` exists as a type but is never used — all colors use `Fixed`. The `AppTheme.LIGHT` is hardcoded in `Theme.kt`:
```kotlin
fun AppTheme(
    theme: AppTheme = AppTheme.LIGHT, // For now always use LIGHT theme
    content: @Composable () -> Unit
)
```

**Groups**: Fills/Surface, Fills/Base, Fills/Aspora Purple, Button (gradients), Text/Base, Text/Contrast, Utility (green/orange/yellow/red/blue), Gradients, Shadow

### Android — `colors.xml` (XML legacy)

Completely different naming convention. Mix of semantic and descriptive names from an older era:
```xml
<color name="green_main_primary_original_teal_deer">#81EBAB</color>
<color name="black_main_background_base_chinese_black">#111111</color>
<color name="button_regular_background">@color/fills_accent_100</color>
```

References tokens like `fills_accent_100`, `text_button_light`, `utility_red_5` — some of which bridge to the newer naming but most are their own system. This file should be considered dead weight once Compose migration completes.

### Cross-platform color comparison

| Token Name | iOS Hex | Android Hex | Match? |
|---|---|---|---|
| textBase600 | `0x0E0F11` | `0xFF0E0F11` | Yes |
| textBase500 | `0x0E0F11` @ 65% | `0xA60E0F11` | Yes (A6 = ~65%) |
| textBaseDanger | `0xF71D11` | `0xFFF71D11` | Yes |
| textBaseSuccess | `0x188B33` | `0xFF188B33` | Yes |
| fillsBasePrimary500 | `0x5523B2` | `0xFF5523B2` | Yes |
| fillsSurfaceGray5 | `0xE5E5EA` | `0xFFE5E5EA` | Yes |
| utilityGreen100 | `0x21BD45` | `0xFF21BD45` | Yes |
| utilityRed100 | `0xF71D11` (iOS) vs `0xFFFF3B30` (Android) | **Mismatch** |
| buttonGradientStart | `0x6E2FE4` | `0xFF6E2FE4` | Yes |
| buttonGradientEnd | `0x5523B2` | `0xFF5523B2` | Yes |

**Notable mismatch**: `utilityRed100` is `0xF71D11` on iOS but `0xFF3B30` on Android.

### iOS-only colors (not in Android Compose palette)

- `textBaseInfo`, `textBaseAccent`, `textBaseWarning`, `textNegative`
- `textContrast400`, `textContrast500`, `textContrastInfo`, `textContrastAccent`, `textContrastDanger`, `textContrastWarning`, `textContrastSuccess`
- `textButtonPrimary`, `textButtonLight`, `textButtonDisabled`
- `textNormal`, `textL1`, `textBaseLight3`
- `utilityTurmericYellow100`, `utilityPlayfulpink100/300/600`
- `buttonV2SecondaryBackground`, `buttonV2SecondaryText`, `buttonV2SecondaryTextDisabled`
- `buttonV2DisabledBackground`, `buttonV2DisabledInnerBorder`, `buttonV2DisabledOuterBorder`, `buttonV2InnerBorder`, `buttonV2OuterBorder`
- All `legacy*` tokens (~20)

### Android-only colors (not in iOS)

- `asporaPurple100` through `asporaPurple800` (full ramp)
- `fillsBasePrimary600`, `fillsBasePrimary700`
- `primaryTextGradientStart`, `primaryTextGradientEnd`
- `shadowColor`
- `securityTrustBackgroundBrush` (gradient brush)
- `utilityYellow10`, `utilityYellow100`

---

## Typography tokens

### Shared type scale

Both platforms use **Inter** as the primary font and **PP Neue Corp Narrow Bold** as the accent font. The scale is nearly identical:

| Token | iOS Size | Android Size | iOS Weight | Android Weight | Match? |
|---|---|---|---|---|---|
| DisplayLEmphasized | 40pt | 40sp | Bold | Bold | Yes |
| DisplayLSemiBold | 40pt | 40sp | SemiBold | SemiBold | Yes |
| DisplayMEmphasized | 32pt | 32sp | Bold | Bold | Yes |
| AccentH1 | 43pt | 44sp | Bold (NeueCorp) | Bold (NeueCorp) | **~1pt off** |
| HeadingH1 | 28pt | 28sp | Bold | Bold | Yes |
| HeadingH2 | **24pt** | **28sp** | Bold | Bold | **Mismatch** |
| HeadingH3 | 22pt | 22sp | Bold | Bold | Yes |
| HeadingH4 | 20pt | 20sp | Bold | Bold | Yes |
| BodyXXLSemiBold | 22pt | — | SemiBold | — | iOS only |
| BodyXLRegular | 17pt | 17sp | Regular | Regular | Yes |
| BodyXLMedium | 17pt | 17sp | Medium | Medium | Yes |
| BodyXLSemiBold | 17pt | 17sp | SemiBold | SemiBold | Yes |
| BodyXLBold | 17pt | 17sp | Bold | Bold | Yes |
| BodyLRegular | 16pt | 16sp | Regular | Regular | Yes |
| BodyLMedium | 16pt | 16sp | Medium | Medium | Yes |
| BodyLBold | 16pt | 16sp | Bold | Bold | Yes |
| BodyLAdditionalRegular | 15pt | 15sp | Regular | Regular | Yes |
| BodyMRegular | 14pt | 14sp | Regular | Regular | Yes |
| BodyMMedium | 14pt | 14sp | Medium | Medium | Yes |
| BodyMSemiBold | 14pt | — | SemiBold | — | iOS only |
| BodyMBold | 14pt | 14sp | Bold | Bold | Yes |
| BodyFootnoteRegular | 13pt | 13sp | Regular | Regular | Yes |
| BodyCaption1Regular | 12pt | 12sp | Regular | Regular | Yes |
| BodyCaption2Regular | 10pt | 10sp | Regular | Regular | Yes |
| BodyCaption2Tags | 8pt | 8sp | SemiBold | SemiBold | Yes |
| ButtonL | 15pt | 15sp | SemiBold | SemiBold | Yes |
| ButtonM | 14pt | 14sp | SemiBold | SemiBold | Yes |
| ButtonS | 12pt | 12sp | SemiBold | SemiBold | Yes |

**Key mismatches**:
- `HeadingH2`: iOS 24pt vs Android 28sp (Android H2 is same as H1)
- `AccentH1`: iOS 43pt vs Android 44sp (~1pt difference)
- `BodyXXLSemiBold`: exists on iOS only
- `BodyMSemiBold`: exists on iOS only
- `BodySRegular/Medium/Bold` (12sp): exists on Android only
- `KeypadPin`, `KeypadTransfer`: exist on Android only

### iOS font config system

Typography is a single `enum` with a `fontConfig` computed property:
```swift
enum Typography: String, Codable {
    case bodyMRegular = "BODY_M_REGULAR"   // server-driven UI key
    // ...
    var fontConfig: FontConfig {
        switch self {
        case .bodyMRegular: FontConfig(name: "Inter-Regular", size: 14)
        // ...
        }
    }
}
```

Font names reference bundled Inter weight variants: `Inter-Regular`, `Inter-Regular_Medium`, `Inter-Regular_SemiBold`, `Inter-Regular_Bold`.

Both `Font` (SwiftUI) and `UIFont` (UIKit) are supported via factory methods.

### Android typography system

Two-tier system:

1. **`AppTextStyles` enum** — private, defines each style as a `TextStyle` with explicit fontSize, lineHeight, letterSpacing, fontWeight
2. **`Typography` data class** — public, wraps AppTextStyles with a `defaultTextColor`, exposed via `Theme.typography`

```kotlin
// Private definition
HeadingH1(TextStyle(
    fontFamily = Fonts.inter,
    fontWeight = FontWeight.Bold,
    fontSize = 28.sp,
    lineHeight = 36.sp,
    letterSpacing = (-0.01).sp
))

// Public access
Theme.typography.H1  // → TextStyle
```

Font families defined as both static weight files (`inter_regular`, `inter_medium`, etc.) and variable font (`inter_variable` with `FontVariation.weight()`).

### Server-driven typography

Both platforms support backend-controlled typography via matching enum string identifiers:

| iOS (`Typography` raw value) | Android (`PlusTypography` name) | Match? |
|---|---|---|
| `BODY_M_REGULAR` | `BODY_M_REGULAR` | Yes |
| `HEADING_BOLD_H1` | `HEADING_BOLD_H1` | Yes |
| `ACCENT_H1` | `ACCENT_H1` | Yes |
| `BUTTON_L` | `BUTTON_L` | Yes |
| `DISPLAY_L_EMPHASIZED` | `DISPLAY_L_EMPHASIZED` | Yes |

iOS has ~30 additional legacy cases (e.g. `DISPLAY_XL`, `BODY_LG`, `BODY_MD_BOLD`) that map to newer tokens. Android has aliases (`HEADLINE_H1` alongside `HEADING_BOLD_H1`, `BODY_CAPTION_REGULAR` alongside `BODY_CAPTION1_REGULAR`).

**The server-driven UI contract must be preserved** — any generated token system needs to produce these string identifiers or the backend SDU system breaks.

---

## Spacing tokens

### iOS — `SpaceConstants.swift`

```swift
enum SpaceConstants {
    static let closest: CGFloat = 2
    static let XXS: CGFloat = 4
    static let XXSALT: CGFloat = 6
    static let XS: CGFloat = 8
    static let S: CGFloat = 12
    static let M: CGFloat = 16
    static let L: CGFloat = 20
    static let XL: CGFloat = 24
    static let XXL: CGFloat = 28
    static let XXXL: CGFloat = 32
    static let X4L: CGFloat = 36
    static let X5L: CGFloat = 40
    static let X6L: CGFloat = 48
}
// Usage: CGFloat.space.M → 16
```

### Android (Compose) — `Dimens.kt`

```kotlin
enum class Spacing(val dp: Dp) {
    None(0.dp),
    Closest(2.dp),
    XXS(4.dp),
    XXSAlt(6.dp),
    XS(8.dp),
    S(12.dp),
    M(16.dp),
    L(20.dp),
    XL(24.dp),
    XXL(28.dp),
    XXXL(32.dp),
    XXXXL(36.dp),
    XXXXXL(40.dp),
    XXXXXXL(48.dp),
    XXXXXXXL(56.dp),
    BottomButtons(80.dp)
}
// Usage: Dimens.Spacing.M.dp → 16.dp
```

### Android (XML) — `dimens.xml`

**Completely different system** using sdp (scalable dp):
```xml
<dimen name="padding_xl">@dimen/_12sdp</dimen>   <!-- vs Compose XL = 24dp -->
<dimen name="margin_xl">@dimen/_12sdp</dimen>
<dimen name="radius_medium">@dimen/_6sdp</dimen>  <!-- vs Compose M = 12dp -->
```

The XML dimens are scaled (sdp adapts to screen density) and use completely different base values. They should be considered a separate, legacy system.

### Cross-platform spacing comparison

| Token | iOS (pt) | Android Compose (dp) | Match? |
|---|---|---|---|
| Closest | 2 | 2 | Yes |
| XXS | 4 | 4 | Yes |
| XXSAlt | 6 | 6 | Yes |
| XS | 8 | 8 | Yes |
| S | 12 | 12 | Yes |
| M | 16 | 16 | Yes |
| L | 20 | 20 | Yes |
| XL | 24 | 24 | Yes |
| XXL | 28 | 28 | Yes |
| XXXL | 32 | 32 | Yes |
| X4L / XXXXL | 36 | 36 | Yes |
| X5L / XXXXXL | 40 | 40 | Yes |
| X6L / XXXXXXL | 48 | 48 | Yes |
| — | — | 56 (XXXXXXXL) | Android only |
| — | — | 80 (BottomButtons) | Android only |
| None | — | 0 | Android only |

Values are **perfectly aligned** through the core range. Android extends with 56dp and 80dp. The naming convention differs slightly at the upper end (iOS `X4L` vs Android `XXXXL`).

---

## Corner radius tokens

### iOS — `CornerRadiusConstants.swift`

```swift
enum CornerRadiusConstants {
    static let XS: CGFloat = 4
    static let S: CGFloat = 8
    static let M: CGFloat = 12
    static let L: CGFloat = 16
    static let XL: CGFloat = 20
    static let XXL: CGFloat = 24
    static let XXXL: CGFloat = 28
    static let MAX: CGFloat = 36
}
// Usage: CGFloat.corner.M → 12
```

### Android (Compose) — `Dimens.Radius` + `AppShapes`

```kotlin
enum class Radius(val dp: Dp) {
    XS(4.dp), S(8.dp), M(12.dp), L(16.dp),
    XL(20.dp), XXL(24.dp), MAX(36.dp)
}

object AppShapes {
    val extraSmall = RoundedCornerShape(Dimens.Radius.XS.dp)  // 4dp
    val small = RoundedCornerShape(Dimens.Radius.S.dp)         // 8dp
    val medium = RoundedCornerShape(Dimens.Radius.M.dp)        // 12dp
    val large = RoundedCornerShape(Dimens.Radius.L.dp)         // 16dp
    val extraLarge = RoundedCornerShape(Dimens.Radius.XL.dp)   // 20dp
    val extraExtraLarge = RoundedCornerShape(Dimens.Radius.XXL.dp) // 24dp
    val max = RoundedCornerShape(Dimens.Radius.MAX.dp)         // 36dp
}
```

| Token | iOS (pt) | Android (dp) | Match? |
|---|---|---|---|
| XS | 4 | 4 | Yes |
| S | 8 | 8 | Yes |
| M | 12 | 12 | Yes |
| L | 16 | 16 | Yes |
| XL | 20 | 20 | Yes |
| XXL | 24 | 24 | Yes |
| XXXL | 28 | — | iOS only |
| MAX | 36 | 36 | Yes |

**Nearly identical.** iOS has XXXL (28) which Android skips.

---

## Icon size tokens (Android only)

```kotlin
enum class IconSize(val dp: Dp) {
    dp12(12.dp), dp14(14.dp), dp16(16.dp), dp18(18.dp),
    dp20(20.dp), dp24(24.dp), dp28(28.dp), dp32(32.dp),
    dp40(40.dp), dp42(42.dp), dp48(48.dp), dp64(64.dp), dp72(72.dp)
}
```

iOS has no equivalent icon size token system.

---

## Theming architecture

### iOS

Lightweight — the `|` operator on `Color` is the only theming mechanism:
```swift
static func | (lightMode: Color, darkMode: Color) -> Color {
    return Color(UIColor { _ in
        return lightMode.uiColor  // always returns light
    })
}
```

No theme provider, no composition local equivalent. Colors are accessed as static properties (`Color.theme.textBase600`), fonts as `Font.theme.bodyMRegular`, spacing as `CGFloat.space.M`.

### Android

Full Compose theming:
```kotlin
@Composable
fun AppTheme(theme: AppTheme = AppTheme.LIGHT, content: @Composable () -> Unit) {
    val palette: ColorPalette = remember(theme) { AsporaColorPalette(theme) }
    ProvideAppTheme(palette) {
        MaterialTheme(
            colorScheme = debugMaterial3ThemeColors(),  // neon green poison
            shapes = Shapes(...)
        ) {
            // Also provides: textSelectionColors, ripple config (disabled), span click handler
            content()
        }
    }
}

object Theme {
    val typography: Typography @Composable get() = LocalTypography.current
    val colors: ColorPalette @Composable get() = LocalColors.current
}
```

**Notable**: All Material3 color slots are set to `Color(0xFF39FF14)` (toxic neon green) to catch any component accidentally using Material defaults instead of the custom design system. This is intentional and should be preserved.

---

## Component library

### Android Compose components (`base/compose/components/`)

~50+ shared components, including:

**Core**: ButtonV2 (gradient, press scale, haptics, loading spinner), PlusTextView (rich text with server-driven typography, inline icons, clickable spans), InputV2, SearchInput, CodeInput, PinInput

**Layout**: AppScreen, BottomSheet, SurfaceCard, SectionHeader, ScreenSpacers, DashedDivider

**Navigation**: BottomNavBar, PlusTopBar, SegmentedControl, PlusTab

**Data Display**: ActionListItem, ExpandableListItem, LabelValueRow, StatusTimeline, InitialsAvatar, DecoratedTextBadge, Pill

**Feedback**: Skeleton, LinearProgressIndicator, PlusFullScreenLoader, PlusErrorView, LoadingShimmerText

**Input**: AnimatedAmountInput, CurrencyInputField, CollapsibleSelectField, SelectionField, EmailWithSuggestionsInput, DatePickerDialog, NumberKeypad, CustomSlider

**Server-Driven**: ServerDrivenInput, ServerDrivenText, ComponentText (with span click handling)

**Misc**: RemoteImage (Coil), AsporaImage, AsporaLogo, SwipeButton, PlusCountdownTimer, PlusTextFlipper, AnimatedBalance

### iOS components

Located under `Aspora/UserInterface/` — not fully enumerated in this audit. The README confirms reusable components, view modifiers, and styles exist.

---

## AI tooling in the Android repo

### Claude Code skills (`.claude/skills/`)

**`design-qa`** — Compares Compose screen implementations against Figma screenshots. Uses Figma MCP server to fetch designs, reads token files for reference, scores on: design fidelity, spacing/padding, edge cases, performance, missing elements. Outputs scored report with file:line references.

**`compose-ui`** — Comprehensive UI building guidelines. Key rules:
- Always use `Theme.colors.*`, never hardcode hex
- Always use `Dimens.*` tokens, never hardcode dp
- Always use `Icon` enum, never `painterResource`
- Always use `stringResource(R.string.*)`, never hardcode strings
- Two typography systems: `Theme.typography.*` (static UI) vs `PlusTypography.*` (server-driven)
- Mandatory visual feedback loop via `/preview-screenshot`

**`compose-ui` agent** (`.claude/agents/compose-ui.md`) — An Opus-powered agent with Figma MCP tool access for autonomous UI implementation.

### `.figma_token` file

Contains a Figma personal access token (`figd_Tn3A...`). Likely used by Figma MCP server or a sync script. No automated pipeline was found consuming it.

---

## Implications for design system architecture

### What `outputs/ios/tokens.swift` would replace

All files in `Aspora/App/Constants/Theme/` and `Aspora/Data/Models/Common/Typography.swift`. The extensions (`Color+Theme.swift`, `Font+Theme.swift`, `CGFloat+Theme.swift`, `Color+Scheme.swift`, `AppFont.swift`) would need to be generated or shipped as a companion file.

### What `outputs/android/tokens.kt` would replace

All files in `base/compose/tokens/` and `base/compose/theme/Theme.kt`. The `PlusTypography` enum in `data-layer` would also need updating (or the generated tokens would need to produce matching enum values).

### Migration constraints

1. **Server-driven UI contract**: Generated token enums must preserve string identifiers like `BODY_M_REGULAR` or the backend SDU system breaks. Both platforms have legacy aliases that also need to be preserved or coordinated for removal with backend.

2. **The `|` operator / `Adaptable` pattern**: Generated iOS output should produce `Color(hex: 0xLight) | Color(hex: 0xDark)` pairs. Android output should use `Adaptable(light, dark)` instead of `Fixed`. The toggle code already exists on both — only the color values need dark variants.

3. **Typography font config**: iOS uses `FontConfig(name: "Inter-Regular_Bold", size: 28)` with bundled font file names. Android uses `FontFamily` + `FontWeight`. Generated tokens need to output platform-appropriate font references, not just size/weight.

4. **Component-level tokens**: Android `ButtonV2` uses `Theme.colors.buttonGradientStart/End/Pressed/BorderShadow`. iOS has matching `buttonV2GradientStart/End/Pressed/BorderShadow`. These component-specific tokens map well to `components/product/button/tokens.json` in the planned architecture.

5. **Material3 debug guard**: Android's `debugMaterial3ThemeColors()` (neon green poison) should be preserved in the generated theme — it's an intentional safety net.

6. **XML legacy sunset**: Don't generate XML resources (`colors.xml`, `dimens.xml`). The Compose system is the target and the XML layer should be allowed to die naturally with the migration.

7. **Line height / letter spacing**: Android defines explicit `lineHeight` and `letterSpacing` for every text style. iOS only defines font name and size — line height comes from the font metrics. Generated tokens may need to include these values for Android but not iOS.

8. **Android Claude Code skills**: The `compose-ui` skill hardcodes guidance like "Always use Theme.colors.*". When generated tokens ship, these skills should be updated (or replaced by `outputs/ai/claude.md`).

### Mismatches to resolve

| Item | iOS | Android | Decision Needed |
|---|---|---|---|
| HeadingH2 size | 24pt | 28sp | Which is correct? |
| AccentH1 size | 43pt | 44sp | Which is correct? |
| utilityRed100 hex | `F71D11` | `FF3B30` | Which is the canonical value? |
| BodyXXLSemiBold | Exists | Missing | Add to Android or remove from iOS? |
| BodyMSemiBold | Exists | Missing | Add to Android or remove from iOS? |
| BodyS (Regular/Medium/Bold) | Missing | Exists (12sp) | Add to iOS or remove from Android? |
| Keypad (Pin/Transfer) | Missing | Exists | iOS handles keypads differently? |
| XXXL corner radius (28pt) | Exists | Missing | Add to Android or remove from iOS? |
| Icon size tokens | None | 13 sizes | Create for iOS? |
| Purple ramp depth | 3 steps | 8 steps (100-800) | Align on how many? |

---

## Appendix: token access patterns (for generated code templates)

### iOS consumption patterns to preserve

```swift
// Colors
Color.theme.textBase600
Color.theme.fillsBasePrimary500

// Fonts (SwiftUI)
Font.theme.bodyMRegular

// Fonts (UIKit)
UIFont.theme.bodyMRegular

// Spacing
CGFloat.space.M    // → 16

// Corner radius
CGFloat.corner.M   // → 12

// Server-driven typography
Typography(rawValue: "BODY_M_REGULAR")?.getFont()
```

### Android consumption patterns to preserve

```kotlin
// Colors (Compose)
Theme.colors.textBase600
Theme.colors.fillsBasePrimary500

// Typography (Compose)
Theme.typography.BodyMRegular
Theme.typography.H1

// Spacing
Dimens.Spacing.M.dp           // → 16.dp
Dimens.horizontalPadding       // → 24.dp

// Corner radius
Dimens.Radius.M.dp             // → 12.dp
AppShapes.medium                // → RoundedCornerShape(12.dp)

// Icon sizes
Dimens.IconSize.dp24            // → 24.dp

// Server-driven typography
"BODY_M_REGULAR".parseToTypography()  // → PlusTypography.BODY_M_REGULAR
```
