# Button spec

Origin button component. 5 types across 4 sizes with monochromatic treatment.

---

## Types

Size is the structural frame. Type determines interaction and visual treatment. Not all types exist at all sizes.

| Type | Sizes | Hierarchies | Width | Icons |
|---|---|---|---|---|
| **Standard** | Large (52px) | Primary, Secondary, Tertiary | Full width | None |
| **Destructive** | Large (52px) | Primary only | Full width | None |
| **Pill** | Small (36px), XSmall (28px) | Primary, Secondary, Tertiary | Hug content | Leading, trailing (optional) |
| **Icon** | Medium (48px), Small (36px), XSmall (28px) | Primary, Secondary, Tertiary | Fixed (circle) | Icon only (the whole button) |
| **Swipe** | Large (52px) | Primary only | Full width | Arrow in thumb only |

### Constraint matrix

| Type | XSmall | Small | Medium | Large |
|---|---|---|---|---|
| Standard | - | - | - | Yes |
| Destructive | - | - | - | Yes |
| Pill | Yes | Yes | - | - |
| Icon | Yes | Yes | Yes | - |
| Swipe | - | - | - | Yes |

---

## States

All types support: **Default, Pressed, Disabled, Loading**

Standard also supports **Success** (circle morph with checkmark).

---

## Hierarchy treatments

| Hierarchy | Background | Text/Icon | Border |
|---|---|---|---|
| **Primary** | interactive/primary | on-surface/contrast | None |
| **Secondary** | interactive/secondary | on-surface/primary | border/default |
| **Tertiary** | Transparent | on-surface/primary + underline | None |
| **Destructive** | error/solid | on-surface/contrast | None |

---

## Shape

All types use capsule/pill shape (radius/full). Icon buttons are circular.

---

## Icon support

| Type | Leading | Trailing |
|---|---|---|
| Standard | None | None |
| Destructive | None | None |
| Pill | Optional (asset/16) | Optional (asset/16) |
| Icon | The icon IS the content (asset/16 or asset/24) | N/A |
| Swipe | Arrow in thumb only | N/A |

---

## Swipe type

Track (interactive/secondary) with draggable thumb (interactive/primary, 44px circle). Label centered in track (on-surface/secondary). Arrow icon in thumb (on-surface/contrast, asset/24). Completes when thumb reaches end threshold.

---

## Tokens

| Property | Token |
|---|---|
| Primary bg | interactive/primary |
| Secondary bg | interactive/secondary |
| Destructive bg | error/solid |
| Contrast bg (brand surfaces) | interactive/contrast |
| Text on primary | on-surface/contrast |
| Text on secondary | on-surface/primary |
| Text disabled | on-surface/disabled |
| Border secondary | border/default |
| Shape | radius/full |
| Standard label | Title/Medium |
| Pill small label | Label heavy/Large |
| Pill xsmall label | Label heavy/Small |
| Swipe label | Title/Medium |
| Standard padding x | spacing/24 |
| Pill small padding x | spacing/16 |
| Pill xsmall padding x | spacing/12 |
| Icon gap (pill) | spacing/8 |

---

## Notes

- Monochromatic treatment — solid fills, no gradients
- Migrates from Aspora's gradient + double-border to Origin's contained style
- Touch target: minimum 44px on all interactive buttons (code concern, not Figma)
- Press scale varies by type (subtle on standard, more pronounced on pill/icon)
- Loading delay: 1000ms before showing spinner (prevents flicker on fast responses)
