# Surface/border rename — migration mapping

**Date:** 2026-04-15
**Scope:** Origin → platform consumers (iOS, Android, web)
**Spec:** [`lab/specs/2026-04-15-surface-border-rename-and-neutral-lift-design.md`](../lab/specs/2026-04-15-surface-border-rename-and-neutral-lift-design.md)

## What changed

1. **Neutral primitives lifted** (light end of the ramp softened):
   - `neutral-100`: `#f3f1f1` → `#f7f6f6`
   - `neutral-200`: `#e6e4e4` → `#ebe9e9`
   - All other steps unchanged.

2. **Surface tokens renamed** to ordinal scheme:

   | Old | New |
   |-----|-----|
   | `surface.base` | `surface.primary` |
   | `surface.raised` | `surface.secondary` |
   | `surface.sunken` | `surface.tertiary` |
   | `surface.overlay` | `surface.overlay` (unchanged) |
   | `surface.contrast` | `surface.contrast` (unchanged) |

3. **Border tokens renamed and consolidated**:

   | Old | New |
   |-----|-----|
   | `border.subtle` | `border.primary` |
   | `border.default` | `border.secondary` |
   | `border.strong` | **removed** — see below |
   | `border.disabled` | `border.disabled` (unchanged) |
   | `border.contrast` | `border.contrast` (unchanged) |

## Find-and-replace guide

Mechanical rename. Each old token maps to exactly one new token with the same primitive pointer, so behavior is preserved across the rename. The only visual change is the neutral lift (softer hexes at steps 100 and 200), which flows through automatically.

```
surface.base     → surface.primary
surface.raised   → surface.secondary
surface.sunken   → surface.tertiary
border.subtle    → border.primary
border.default   → border.secondary
```

Platform-specific token names (e.g. SwiftUI `Color.surfaceRaised`, Compose `AsporaColors.surfaceRaised`, XML `@color/surface_raised`) follow the same substitution pattern.

## `border.strong` removal

`border.strong` (`neutral-400` / `#b4b0af`) has been retired. It was rarely used and the gap to `border.secondary` (`neutral-200`) did not justify a dedicated token.

**Before you merge this migration, please grep your codebase for `borderStrong`, `border.strong`, `border_strong`, or the platform equivalent.** If you find usages:

- For **focus rings** or **selected outlines**, migrate to `interactive.primary` (solid black in light, solid white in dark) or `accent.border` if the use case is informational.
- For **emphasized dividers** that genuinely need more weight than `border.secondary`, flag it and we'll decide whether to reinstate `border.strong` under a new name.
- If you find **nothing**, the retirement ships clean.

## New editorial direction for borders

The rename flips which border is the "default reach":

- **Before:** `border.default` (neutral-200, darker) was the everyday divider; `border.subtle` (neutral-100, lighter) was optional.
- **After:** `border.primary` (neutral-100, now `#f7f6f6`) is the everyday divider; `border.secondary` (neutral-200, now `#ebe9e9`) is the assertive alternative.

For **new** component work, reach for `border.primary` by default. **Existing** component code that used `border.default` is mechanically migrated to `border.secondary` to preserve current visual behavior — no forced rework. Upgrade individual call sites to `border.primary` only when you decide a specific divider should be softer.

## Dark mode

No primitive mapping changes in dark mode. The rename is a pure label swap — `surface.base/raised/sunken → primary/secondary/tertiary` and `border.subtle/default → primary/secondary` all preserve their dark-mode primitive pointers. Dark mode surfaces remain three-directional (secondary is lifted above primary, tertiary is recessed below primary) and this is intentional. See the spec for the "ordinal = role, not lightness" note.

## Questions

Ping Hakeeb (design@aspora.com) or drop a comment on the spec.
