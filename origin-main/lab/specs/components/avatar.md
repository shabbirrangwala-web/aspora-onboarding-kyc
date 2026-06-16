# Avatar spec

Draft spec for Origin avatar component.

---

## Overview

Circular visual representation of a user, entity, or placeholder. Always circular. Sizes via asset tokens. Optional badge overlay.

---

## Content types

| Type | What fills the circle | Fallback for |
|---|---|---|
| **Image** | Photo, logo, brand mark — any visual | Primary content when available |
| **Initials** | Max 2 characters, neutral background | When no image exists but name is known |
| **Icon** | Generic placeholder icon, neutral background | When neither image nor name exists |

Fallback chain: Image → Initials → Icon

Initials generation: first character of first two words. "Rajan Dube" → "RD". "Rajan" → "R". Always uppercase.

Initials background: neutral (`surface/raised` or similar). No color assignment system for now. Can revisit if initials avatars are too indistinguishable in lists.

---

## Sizes

4 avatar sizes via asset tokens: **32, 40, 48, 64**

| Avatar | Asset token | Badge size |
|---|---|---|
| 32 | `asset/32` | 12 (`asset/12`) |
| 40 | `asset/40` | 12 (`asset/12`) |
| 48 | `asset/48` | 16 (`asset/16`) |
| 64 | `asset/64` | 16 (`asset/16`) |

Size controlled by resizing the instance and binding width/height to asset tokens. Not variant axes.

---

## Shape

Circle only. No rounded rectangles.

---

## Badge

Optional overlay at bottom-right. Max 1 badge. Badge is a nested component with its own type variants:

| Badge type | Content | Background | Use case |
|---|---|---|---|
| **Status** | Colored dot (no icon) | Semantic color (success/warning/error) | Online, verified, active |
| **Flag** | Country/currency flag fills circle | Flag image | Recipient country, currency |
| **Action** | Icon on colored bg | Brand/interactive color | Add, edit, camera |
| **Context** | Icon on neutral bg | Neutral/subtle | Transfer direction, category |
| **Aspora** | Aspora logo | Brand treatment | Profile avatar in nav |
| **Image** | Photo/logo fills circle | Image | Bank logo, partner brand |

Badge is a separate small component used inside the avatar's badge slot. Badge sizes scale relative to avatar size (roughly 1/3 diameter) or are fixed small size — TBD in design.

---

## Variant matrix

| Axis | Values |
|---|---|
| **Content** | Image, Initials, Icon |
| **Badge** | None, Status, Flag, Action, Context, Aspora, Image |

3 × 7 = 21 combinations. Size via tokens, not variants.

---

## Tokens

| Property | Token |
|---|---|
| Initials background | `surface/raised` |
| Icon background | `surface/raised` |
| Initials text | `on-surface/primary` |
| Icon color | `on-surface/secondary` |
| Image border (if needed) | `border/subtle` |
| Size | `asset/24` through `asset/64` |

---

## Not included

- **Flags as content type** — Flags are separate assets. Only appear as badges on avatars.
- **Color assignment for initials** — Deferred. All initials use neutral background for now.
- **Graphic language backgrounds** — Brand photography treatment doesn't read well at avatar sizes. Parked.
- **Interactive / non-interactive variant** — Dropped. Interaction behavior is a code concern, not a Figma variant.
- **Avatar groups / stacks** — Not used in the product today. Add later if needed.
- **Double avatars** — Wise has this. Not needed for now.

---

## Platform notes

- **iOS**: No shared avatar component exists. Inline implementations vary across screens. This spec standardizes sizing, colors, and initials logic.
- **Android**: `InitialsAvatar` exists in `base/compose/components/` but uses inconsistent colors. Standardize to Origin tokens.
- Both platforms: initials generation logic is already aligned (first char of first two words).

---

## Research sources

- Code scan: iOS has 12+ avatar-like implementations, Android has 8+. No shared component on either platform.
- Wise: 7 sizes (16-72), circle only, photo/text/icon/flag content, badges, interactive split.
- eBay: 7 sizes (32-128), circle only, 8 color combos for initials, scrim on photos.
