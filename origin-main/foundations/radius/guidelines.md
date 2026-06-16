# Origin radius guidelines

Rules and rationale for the Origin radius system. For token values, see `primitives.json` in this directory.

---

## Scale overview

8 values. The first 7 follow 4px increments from 4 to 24, then jump to 36 for large containers. The 8th is `full` — an intent-based token for pill/capsule shapes. Seven concrete dimensions and one named concept.

## The scale

| Token | Value | Description |
|---|---|---|
| `radius.4` | 4px | Subtle rounding on small elements |
| `radius.8` | 8px | Standard container rounding |
| `radius.12` | 12px | Larger container rounding |
| `radius.16` | 16px | Prominent container rounding |
| `radius.20` | 20px | Large container rounding |
| `radius.24` | 24px | Extra-large container rounding |
| `radius.36` | 36px | Large rounded surfaces |
| `radius.full` | 9999px | Fully rounded — produces pill/capsule shapes |

Tokens are named by their pixel value. The name IS the value — no lookup table needed. The lone exception is `radius.full`, which names an intent rather than a dimension.

## When to use each value

**4 — Small elements.** Chips, badges, icon buttons. Enough rounding to soften edges without making the element feel rounded.

**8–12 — Cards, inputs, standard containers.** 8 for cards, inputs, and dropdowns. 12 for larger cards and popovers. This is the workhorse range for everyday UI surfaces.

**16–24 — Modals, bottom sheets, large containers.** 16 for modals and dialog boxes. 20 for bottom sheets and large containers. 24 for prominent containers and feature cards. Use higher values as the surface gets larger or more prominent.

**36 — Hero cards, prominent surfaces.** Large rounded surfaces where the rounding is a design feature, not just softening. Hero cards, promotional panels, feature highlights.

**full — Pill buttons, avatars, status indicators.** Any element that should be fully rounded regardless of its size. The 9999px value guarantees a pill/capsule shape on any dimension — `border-radius` larger than half the shortest side produces a fully rounded shape.

## Platform notes for `radius.full`

The `9999px` value works as-is on every platform. No special handling is required.

**CSS:**
```css
border-radius: 9999px;
```

**SwiftUI:**
```swift
// Raw value — functionally correct
.cornerRadius(9999)

// Platform idiom — conventional
.clipShape(Capsule())
```

**Compose:**
```kotlin
// Raw value — functionally correct
RoundedCornerShape(9999.dp)

// Platform idiom — conventional
RoundedCornerShape(50%)
```

Both approaches produce the same visual result. The raw value is correct everywhere. The platform idiom is more conventional and communicates intent more clearly in native code. Output generators MAY optimize to the idiom by detecting the `full` token name, but this is optional.

## What was dropped

**28px** was present only in iOS (`CornerRadiusConstants.xxxl`). It does not exist in Figma or Android. The value sits between 24 and 36 with no distinct use case that either neighbor cannot serve. Dropping it aligns all three platforms on the same scale. Components currently using 28 should migrate to 24 or 36.

## Relationship to Android `AppShapes`

Android currently uses an `AppShapes` object that maps size names to Material3 `RoundedCornerShape` instances. Origin radius tokens replace this abstraction entirely. Components reference `radius.*` tokens directly rather than going through a shape mapping layer. The output generator produces the appropriate `RoundedCornerShape` calls from the token values.

## Why no semantic layer

Radius has no modes — no light/dark variants, no responsive breakpoints in the token layer. It has no composition — each token is a single dimension value, not a composite of multiple properties. There are no cases where the same intent needs to resolve to different values under different conditions.

Adding `radius.card`, `radius.input`, or `radius.modal` would be premature abstraction. Components reference the primitive scale directly. Semantic aliases are only warranted when the same intent needs different values under different conditions (modes, themes, breakpoints). Radius has none of these.
