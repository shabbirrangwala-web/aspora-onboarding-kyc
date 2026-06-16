# Aspora design system — deferred items

## Status
2026-03-17. Parking lot for decisions, research, and work that matters but isn't part of the current working plan.

---

## AI consumption layer

Full research in [ai-consumption-research.md](./ai-consumption-research.md).

### Deferred decisions
- **MCP server vs static files vs both?** MCP gives dynamic querying (only load what's needed), static files give universal compatibility. Could start with static (`outputs/ai/claude.md`) and add MCP later.
- **Registry pattern (shadcn-compatible)?** Would enable Cursor/v0 consumption. Worth evaluating once the design system has enough components to warrant it.
- **Layered context strategy**: Hot (~500 lines, always loaded) / Warm (auto-attached by file glob) / Cold (on-demand via MCP). Solid approach from research, implement when AI context output is prioritized.
- **Context budget per tool**: Lovable has ~500 line limit, Claude Code has a larger window, Cursor rules have their own format. Each output format may need different granularity.
- **Cross-tool sync**: Tools like rulesync or rule-porter could generate for all AI tools from a single source. Evaluate when shipping AI outputs.

### Key research findings to revisit
- Focused 300-token context often outperforms unfocused 113K tokens (Chroma research)
- Atlassian redesigned their homepage in 20 minutes with Figma MCP + design system MCP
- Cursor's dynamic context discovery reduced agent tokens by 46.9%
- Hardik Pandya's spec-driven approach: 8-section component specs, token audit scripts, three-layer indirection

---

## Automated native token generation

### What it would look like
- `build.ts` generates `outputs/ios/tokens.swift` and `outputs/android/tokens.kt` from `foundations/*/tokens.json`
- Engineers consume generated files instead of manually updating platform token files

### Why it's deferred
- Paul explicitly said it's not worth the investment: "It's just a file. It takes 2 minutes."
- Foundations change rarely — maybe once a year for typography, occasionally for color
- The team doesn't have bandwidth for pipeline infrastructure
- Manual reference works fine for the current team size

### When to reconsider
- If the team grows and manual sync becomes error-prone
- If token drift becomes a real problem (mismatches between platforms)
- If a second rebrand happens and every platform needs bulk updates simultaneously

### Technical notes from the native token audit
Full audit in [native-app-token-audit.md](./native-app-token-audit.md).

**iOS access patterns to preserve if generating:**
```swift
Color.theme.textBase600          // Colors
Font.theme.bodyMRegular          // SwiftUI fonts
UIFont.theme.bodyMRegular        // UIKit fonts
CGFloat.space.M                  // Spacing (-> 16)
CGFloat.corner.M                 // Corner radius (-> 12)
Typography(rawValue: "BODY_M_REGULAR")?.getFont()  // Server-driven
```

**Android access patterns to preserve if generating:**
```kotlin
Theme.colors.textBase600         // Colors
Theme.typography.BodyMRegular    // Typography
Dimens.Spacing.M.dp              // Spacing (-> 16.dp)
Dimens.Radius.M.dp               // Corner radius (-> 12.dp)
AppShapes.medium                 // Shapes (-> RoundedCornerShape(12.dp))
"BODY_M_REGULAR".parseToTypography()  // Server-driven
```

**Server-driven UI contract**: Both platforms use matching enum string identifiers (`BODY_M_REGULAR`, `HEADING_BOLD_H1`, etc.) for backend-controlled typography. Any generated system must preserve these or coordinate removal with backend.

**Material3 debug guard**: Android's `debugMaterial3ThemeColors()` sets all Material slots to neon green to catch components using Material defaults. Preserve this if generating theme code.

---

## Token format standards

### W3C DTCG (Design Tokens Community Group)
- Emerging standard for interoperable token format
- Evaluate whether `foundations/*/tokens.json` should adopt DTCG format or use custom JSON
- Benefits: tooling ecosystem compatibility (Style Dictionary v4, Tokens Studio, etc.)
- Risk: adds complexity for a small team, may not justify the overhead yet

### Style Dictionary
- Industry-standard token transform pipeline
- Could replace custom `build.ts` for generating platform outputs
- v4 supports DTCG format, has validate -> build -> test -> publish -> notify workflow
- Evaluate alongside automated native generation — they're the same decision

---

## Dark mode

### Current state
- **iOS**: `|` operator defined for light/dark pairs but always returns light color. No theme provider.
- **Android Compose**: `Adaptable(light, dark)` type exists but all colors use `Fixed`. `AppTheme.LIGHT` hardcoded.
- **Android XML**: Supporting dark mode would require duplicating all colors. Painful and not worth it.
- **Color-theory**: Already has full light/dark semantic mappings. The token system is ready.
- **Figma**: Light and Dark modes exist in the semantic variables collection.

### What's needed before dark mode ships
1. Design review of every screen in dark mode (Paul: "design needs to check everything")
2. Finalize dark semantic -> primitive mappings for all foundations (color done, typography/spacing may need review)
3. iOS: update the `|` operator to actually respect `UITraitCollection.userInterfaceStyle`
4. Android Compose: switch from `Fixed` to `Adaptable` for all colors, allow theme parameter to change
5. Android XML: either migrate screens to Compose first or accept partial dark mode coverage
6. Coordinate rollout — Sergei flagged that having Compose screens in dark mode but XML screens in light mode would be "really strange"

### When to tackle
- After rebrand lands
- After critical XML screens are either redesigned in Compose or explicitly excluded from dark mode

---

## Server-driven UI simplification

### Current state
Three systems exist:
1. **Configuration-driven typography**: Backend sends font/color/alignment strings for every text element. Over-engineered — Paul says "nobody updates anything." Makes API responses heavier for no practical benefit.
2. **Server-driven KYC**: Component library where backend assembles screens from a set of widgets. Complex but useful for country-specific KYC flows.
3. **Canvas/IA (home page)**: Defines widget types + layouts, backend combines them. Used for the new home page.

### Paul's ask
Remove or simplify the configuration-driven system. Would make API responses lighter, reduce complexity, and nobody would miss it.

### Implications for design system
- If configuration-driven typography is removed, the Typography enum preservation constraint relaxes significantly
- The server-driven KYC and canvas systems are product-specific — not a design system concern
- Current string identifiers (`BODY_M_REGULAR`, etc.) still need to be preserved for whatever server-driven UI remains

---

## Component library expansion

### Current shared components (from engineer call)
- Button (v2) — gradient, press scale, haptics, loading
- Input field (v2) — new design
- Radio/checkbox
- Selector

### Android has ~50+ Compose components
Full list in native token audit. Most are product-specific, not design-system-level. Includes server-driven components, layout primitives, navigation, data display, feedback, and input components.

### iOS components
Not fully audited. Located under `Aspora/UserInterface/`.

### Future component work
- Document shared components first (the 4 above)
- As rebrand redesigns surfaces, new shared components may emerge
- Paul wants a component catalog page — could be part of workspace/viewer or a separate deliverable
- Track component status: exists in Figma? Specced with uSpec? Implemented on iOS? On Android? On which screens?

---

## Cross-platform token mismatches (from native audit)

These are mismatches in the OLD token system. Most will be resolved by the rebrand (new tokens replace old ones). But some decisions still needed for values that carry forward:

| Item | iOS | Android | Notes |
|---|---|---|---|
| HeadingH2 size | 24pt | 28sp | New type scale may eliminate this |
| AccentH1 size | 43pt | 44sp | New type scale may eliminate this |
| utilityRed100 hex | `F71D11` | `FF3B30` | New error color (crimson ramp) replaces both |
| BodyXXLSemiBold | Exists | Missing | New type scale may eliminate this |
| BodyMSemiBold | Exists | Missing | New type scale may eliminate this |
| BodyS (Reg/Med/Bold) | Missing | Exists (12sp) | New type scale may eliminate this |
| XXXL corner radius (28pt) | Exists | Missing | Decide when spacing/radius tokens are finalized |
| Icon size tokens | None | 13 sizes | Create a shared set if iconography foundation warrants it |
| Purple ramp depth | 3 steps | 8 steps | Purple is the old brand. New palette has no purple ramp. |

---

## Other deferred items

- **Figma contribution plugin design** — how do design explorations in Figma push back to the design system repo?
- **Workshop tools** — do interactive exploration tools (like color-theory's HTML outputs) live in the workspace viewer, or somewhere else?
- **Whether web component implementations warrant a shared npm package** or stay in each web project
- **Android modularization** — Sergei wants to extract UI components into a package. Related to but separate from the design system.
- **Existing Android Claude Code skills** — the `compose-ui` skill hardcodes token guidance that will need updating when the rebrand tokens land. Could be replaced by `outputs/ai/claude.md` eventually.
