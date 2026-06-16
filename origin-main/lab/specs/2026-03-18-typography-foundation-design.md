# Typography foundation — design spec

## Date
2026-03-18

## Goal
Define the typography foundation for Origin. Establish a two-layer token architecture (primitives + semantics), a 25-style type scale built on Haffer, and guidelines for tabular numbers and OpenType features. Token format is W3C DTCG, consistent with the color foundation pattern.

## Source material
- New type scale defined in Figma: [Product explorations](https://www.figma.com/design/9KTgVHmuo2ovsKedzBa5tX/Product-explorations?node-id=133-8142)
- Old type styles: [Aspora Component Library](https://www.figma.com/design/Vc84mP3YDNUXAGVQOugrfa/Aspora-Component-Library?node-id=7119-1561)
- Native token audit: `lab/research/2026-03-17-native-app-token-audit.md`

## Decisions

### Font family
- **Haffer only.** Single font family across the entire system. Weight does the differentiating.
- PP Neue Corp Narrow Bold (the old accent font) is retired. Display Heavy fills the accent role.
- Five weights: Regular (400), Medium (500), SemiBold (600), Bold (700), Heavy (900).

### Token architecture
- **Two layers: primitives + semantics.** Follows industry standard (M3, Spectrum, Polaris, Primer all use this pattern).
- **Primitives** are the raw scale — hand-picked values for font size, line height, letter spacing, font weight, and font family. No intent, no composition.
- **Semantics** are intent-based composite typography tokens that reference primitives. Engineers consume these directly from `outputs/`. Designers consume them as **Figma text styles** (see Figma consumption model below).
- **No component-specific tokens.** Components reference the semantic type scale directly. A button uses `label-heavy/m`, not `button/label`. Per-component tokens are only warranted when independent per-component theming is needed, which it is not.

### Figma consumption model
Figma variables only support `COLOR`, `FLOAT`, `STRING`, `BOOLEAN` types. Typography composites cannot be variables — they must remain **Figma text styles** (per `lab/research/2026-03-18-figma-variable-collection-structures.md`).

The consumption model is:
1. **Plugin pushes primitive values as Figma variables** — font sizes and line heights as `FLOAT`, font family as `STRING`. These live in a variables collection.
2. **Plugin creates text styles programmatically** via `figma.createTextStyle()`, setting `fontName`, `fontSize`, `lineHeight`, `letterSpacing`, and `textCase`. Properties are bound to primitive variables via `setBoundVariable()`. Styles are organized into folders using path names (e.g., `style.name = "Display/Large"`).
3. **OpenType features (tnum) require manual one-time setup** on Number styles — the plugin API cannot set `openTypeFeatures`. The plugin should surface a checklist for this after creating styles.

Once created, text styles update automatically when the plugin pushes new primitive values. Only the tnum toggle is truly manual.

### Tabular numbers (tnum)
- **tnum is not a global default.** Proportional figures are the baseline everywhere.
- **tnum is not a utility/modifier in Figma.** Figma hides OpenType feature controls when a text style is applied, making per-instance toggling impractical.
- **tnum is baked into dedicated Number styles** as a DTCG `$extensions` property, using reverse domain notation (`tech.vance.origin`).
- **Number styles exist at two tiers:** body-scale (Medium weight) for transaction rows, tables, and inline amounts; display-scale (Heavy weight) for hero balances and large amount displays.
- **In code, tnum is also available as a platform modifier** for cases outside the Number styles: CSS `font-variant-numeric: tabular-nums`, SwiftUI `.monospacedDigit()`, Compose `fontFeatureSettings = "tnum"`.
- **Guidelines document when to use tabular numbers:** amounts in lists/tables, transaction histories, dashboards, timers, live-updating metrics. Not for marketing, editorial, headings, or inline numbers in sentences.

### Uppercase rules
- **Display** (all 3 sizes) — always uppercase. Brand rule.
- **Number Display** (all 3 sizes) — inherits uppercase from Display. Harmless on digits, correct for any adjacent currency codes.
- **Overline** — always uppercase. Single style.
- All other styles — default case.

### OpenType features
- **tnum** is the only OpenType feature baked into tokens (on Number styles).
- Other Haffer features (slashed zero, ligatures, contextual alternates, fractions) are documented in guidelines as available but not encoded in tokens.
- The Figma plugin API can create text styles and set most properties (`fontName`, `fontSize`, `lineHeight`, `letterSpacing`, `textCase`) but **cannot set OpenType features** (`openTypeFeatures` is read-only on `TextNode`, absent on `TextStyle`). Number styles require manual one-time tnum setup in Figma after the plugin creates them.

### Modes
- Typography has no modes. No light/dark, no responsive breakpoints in the token layer. A single `semantic.json` file, not file-per-mode.

### Primitives design rationale
- **Font sizes are hand-picked, not mathematically derived.** The values approximate a major second (1.125) scale but are rounded to practical integers. Constraint is enforced at the semantic layer, not the primitive layer.
- **Line heights follow a 4px grid starting from 12.** Independent from the spacing foundation but on the same rhythmic grid. Not coupled — changing a spacing value does not change a line height.
- **Letter spacing is a curated set of 8 values.** Positive tracking for small/uppercase text, progressively tighter as size increases.
- **Primitives are a superset of semantic consumers.** Some primitives (fontSize 20px, lineHeight 12/44/52px) are not referenced by any current semantic style. They exist to provide a complete scale for future styles or component-level use without requiring primitive-layer changes.
- **Display/L has lineHeight (56px) smaller than fontSize (57px).** This tight/negative leading is intentional for large uppercase display text, where conventional line height ratios create excessive visual spacing.

### What this does NOT cover
- Figma plugin implementation (how variables map to collections, naming conventions, tnum reminder checklist) — workstream #4
- Output generation (CSS custom properties, Tailwind config, platform files) — separate workstream
- SDU migration mapping (`BODY_M_REGULAR → body/m`) — lives in `migration/`
- Dark mode — no mode switching for typography, phase 2 regardless
- Other OpenType features beyond tnum — documented in guidelines only
- Prose foundations (photography, voice, illustration) — separate specs
- Spacing / radius tokens — separate spec

---

## Primitives

### Font sizes (12 values)

| Token | Value |
|---|---|
| `typography.fontSize.100` | 11px |
| `typography.fontSize.200` | 12px |
| `typography.fontSize.300` | 14px |
| `typography.fontSize.400` | 16px |
| `typography.fontSize.500` | 20px |
| `typography.fontSize.600` | 22px |
| `typography.fontSize.700` | 24px |
| `typography.fontSize.800` | 28px |
| `typography.fontSize.900` | 32px |
| `typography.fontSize.1000` | 36px |
| `typography.fontSize.1100` | 45px |
| `typography.fontSize.1200` | 57px |

### Line heights (12 values, 4px grid)

| Token | Value |
|---|---|
| `typography.lineHeight.100` | 12px |
| `typography.lineHeight.200` | 16px |
| `typography.lineHeight.300` | 20px |
| `typography.lineHeight.400` | 24px |
| `typography.lineHeight.500` | 28px |
| `typography.lineHeight.600` | 32px |
| `typography.lineHeight.700` | 36px |
| `typography.lineHeight.800` | 40px |
| `typography.lineHeight.900` | 44px |
| `typography.lineHeight.1000` | 48px |
| `typography.lineHeight.1100` | 52px |
| `typography.lineHeight.1200` | 56px |

### Letter spacing (8 values)

> **DTCG note:** Letter spacing values are percentages, but DTCG `dimension` type requires px/rem units. There is no DTCG type for percentage-based letter spacing. We use `$type: "dimension"` with percentage strings as a deliberate departure — converting to absolute values would couple letter spacing to font size, breaking the "one token, many sizes" model. Output generators should interpret these as percentages.

| Token | Value |
|---|---|
| `typography.letterSpacing.tight-4` | -2% |
| `typography.letterSpacing.tight-3` | -1.7% |
| `typography.letterSpacing.tight-2` | -1% |
| `typography.letterSpacing.tight-1` | -0.9% |
| `typography.letterSpacing.tight-0` | -0.6% |
| `typography.letterSpacing.none` | 0% |
| `typography.letterSpacing.wide-1` | 0.5% |
| `typography.letterSpacing.wide-2` | 1.5% |

### Font weights (5 values)

| Token | Value |
|---|---|
| `typography.fontWeight.regular` | 400 |
| `typography.fontWeight.medium` | 500 |
| `typography.fontWeight.semibold` | 600 |
| `typography.fontWeight.bold` | 700 |
| `typography.fontWeight.heavy` | 900 |

### Font family (1 value)

| Token | Value |
|---|---|
| `typography.fontFamily.primary` | Haffer |

**Total: 38 primitive tokens.**

---

## Semantic styles

25 composite typography tokens referencing primitives. Each is a DTCG `$type: "typography"` composite.

### Display — Heavy (900), always uppercase

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.display.s` | {fontSize.1000} = 36 | {lineHeight.800} = 40 | {letterSpacing.tight-4} = -2% |
| `typography.display.m` | {fontSize.1100} = 45 | {lineHeight.1000} = 48 | {letterSpacing.tight-4} = -2% |
| `typography.display.l` | {fontSize.1200} = 57 | {lineHeight.1200} = 56 | {letterSpacing.tight-4} = -2% |

### Header — Bold (700)

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.header.s` | {fontSize.700} = 24 | {lineHeight.600} = 32 | {letterSpacing.tight-2} = -1% |
| `typography.header.m` | {fontSize.800} = 28 | {lineHeight.700} = 36 | {letterSpacing.tight-2} = -1% |
| `typography.header.l` | {fontSize.900} = 32 | {lineHeight.800} = 40 | {letterSpacing.tight-2} = -1% |

### Title — SemiBold (600)

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.title.s` | {fontSize.300} = 14 | {lineHeight.300} = 20 | {letterSpacing.tight-0} = -0.6% |
| `typography.title.m` | {fontSize.400} = 16 | {lineHeight.400} = 24 | {letterSpacing.tight-1} = -0.9% |
| `typography.title.l` | {fontSize.600} = 22 | {lineHeight.500} = 28 | {letterSpacing.tight-3} = -1.7% |

### Label — Regular (400)

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.label.s` | {fontSize.100} = 11 | {lineHeight.200} = 16 | {letterSpacing.wide-1} = 0.5% |
| `typography.label.m` | {fontSize.200} = 12 | {lineHeight.200} = 16 | {letterSpacing.none} = 0% |
| `typography.label.l` | {fontSize.300} = 14 | {lineHeight.300} = 20 | {letterSpacing.tight-0} = -0.6% |

### Label heavy — Medium (500)

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.label-heavy.s` | {fontSize.100} = 11 | {lineHeight.200} = 16 | {letterSpacing.wide-1} = 0.5% |
| `typography.label-heavy.m` | {fontSize.200} = 12 | {lineHeight.200} = 16 | {letterSpacing.none} = 0% |
| `typography.label-heavy.l` | {fontSize.300} = 14 | {lineHeight.300} = 20 | {letterSpacing.tight-0} = -0.6% |

### Body — Regular (400)

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.body.s` | {fontSize.200} = 12 | {lineHeight.200} = 16 | {letterSpacing.none} = 0% |
| `typography.body.m` | {fontSize.300} = 14 | {lineHeight.300} = 20 | {letterSpacing.tight-0} = -0.6% |
| `typography.body.l` | {fontSize.400} = 16 | {lineHeight.400} = 24 | {letterSpacing.tight-1} = -0.9% |

### Number — Medium (500) + tnum

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.number.s` | {fontSize.200} = 12 | {lineHeight.200} = 16 | {letterSpacing.none} = 0% |
| `typography.number.m` | {fontSize.300} = 14 | {lineHeight.300} = 20 | {letterSpacing.tight-0} = -0.6% |
| `typography.number.l` | {fontSize.400} = 16 | {lineHeight.400} = 24 | {letterSpacing.tight-1} = -0.9% |

### Number display — Heavy (900) + tnum, always uppercase

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.number.display-s` | {fontSize.1000} = 36 | {lineHeight.800} = 40 | {letterSpacing.tight-4} = -2% |
| `typography.number.display-m` | {fontSize.1100} = 45 | {lineHeight.1000} = 48 | {letterSpacing.tight-4} = -2% |
| `typography.number.display-l` | {fontSize.1200} = 57 | {lineHeight.1200} = 56 | {letterSpacing.tight-4} = -2% |

### Overline — SemiBold (600), always uppercase

| Token | Font Size | Line Height | Letter Spacing |
|---|---|---|---|
| `typography.overline.standard` | {fontSize.100} = 11 | {lineHeight.200} = 16 | {letterSpacing.wide-2} = 1.5% |

---

## Token file format

### `foundations/typography/primitives.json`

DTCG format. Individual tokens grouped by property type.

```json
{
  "typography": {
    "fontSize": {
      "$type": "dimension",
      "100": { "$value": "11px" },
      "200": { "$value": "12px" },
      "300": { "$value": "14px" },
      "400": { "$value": "16px" },
      "500": { "$value": "20px" },
      "600": { "$value": "22px" },
      "700": { "$value": "24px" },
      "800": { "$value": "28px" },
      "900": { "$value": "32px" },
      "1000": { "$value": "36px" },
      "1100": { "$value": "45px" },
      "1200": { "$value": "57px" }
    },
    "lineHeight": {
      "$type": "dimension",
      "100": { "$value": "12px" },
      "200": { "$value": "16px" },
      "300": { "$value": "20px" },
      "400": { "$value": "24px" },
      "500": { "$value": "28px" },
      "600": { "$value": "32px" },
      "700": { "$value": "36px" },
      "800": { "$value": "40px" },
      "900": { "$value": "44px" },
      "1000": { "$value": "48px" },
      "1100": { "$value": "52px" },
      "1200": { "$value": "56px" }
    },
    "letterSpacing": {
      "$type": "dimension",
      "tight-4": { "$value": "-2%" },
      "tight-3": { "$value": "-1.7%" },
      "tight-2": { "$value": "-1%" },
      "tight-1": { "$value": "-0.9%" },
      "tight-0": { "$value": "-0.6%" },
      "none": { "$value": "0%" },
      "wide-1": { "$value": "0.5%" },
      "wide-2": { "$value": "1.5%" }
    },
    "fontWeight": {
      "$type": "fontWeight",
      "regular": { "$value": 400 },
      "medium": { "$value": 500 },
      "semibold": { "$value": 600 },
      "bold": { "$value": 700 },
      "heavy": { "$value": 900 }
    },
    "fontFamily": {
      "$type": "fontFamily",
      "primary": { "$value": "Haffer" }
    }
  }
}
```

### `foundations/typography/semantic.json`

DTCG composite tokens referencing primitives. Non-standard properties (`textCase`, `openTypeFeatures`) live in `$extensions` under `tech.vance.origin`, keeping `$value` DTCG-compliant.

```json
{
  "typography": {
    "display": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1000}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.800}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase"
          }
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1100}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.1000}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase"
          }
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1200}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.1200}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase"
          }
        }
      }
    },
    "header": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.700}",
          "fontWeight": "{typography.fontWeight.bold}",
          "lineHeight": "{typography.lineHeight.600}",
          "letterSpacing": "{typography.letterSpacing.tight-2}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.800}",
          "fontWeight": "{typography.fontWeight.bold}",
          "lineHeight": "{typography.lineHeight.700}",
          "letterSpacing": "{typography.letterSpacing.tight-2}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.900}",
          "fontWeight": "{typography.fontWeight.bold}",
          "lineHeight": "{typography.lineHeight.800}",
          "letterSpacing": "{typography.letterSpacing.tight-2}"
        }
      }
    },
    "title": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.semibold}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.400}",
          "fontWeight": "{typography.fontWeight.semibold}",
          "lineHeight": "{typography.lineHeight.400}",
          "letterSpacing": "{typography.letterSpacing.tight-1}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.600}",
          "fontWeight": "{typography.fontWeight.semibold}",
          "lineHeight": "{typography.lineHeight.500}",
          "letterSpacing": "{typography.letterSpacing.tight-3}"
        }
      }
    },
    "label": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.100}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.wide-1}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.200}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.none}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        }
      }
    },
    "label-heavy": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.100}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.wide-1}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.200}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.none}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        }
      }
    },
    "body": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.200}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.none}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.400}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.400}",
          "letterSpacing": "{typography.letterSpacing.tight-1}"
        }
      }
    },
    "number": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.200}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.none}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "openTypeFeatures": { "tnum": true }
          }
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "openTypeFeatures": { "tnum": true }
          }
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.400}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.400}",
          "letterSpacing": "{typography.letterSpacing.tight-1}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "openTypeFeatures": { "tnum": true }
          }
        }
      },
      "display-s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1000}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.800}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase",
            "openTypeFeatures": { "tnum": true }
          }
        }
      },
      "display-m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1100}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.1000}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase",
            "openTypeFeatures": { "tnum": true }
          }
        }
      },
      "display-l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1200}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.1200}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase",
            "openTypeFeatures": { "tnum": true }
          }
        }
      }
    },
    "overline": {
      "$type": "typography",
      "standard": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.100}",
          "fontWeight": "{typography.fontWeight.semibold}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.wide-2}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase"
          }
        }
      }
    }
  }
}
```

### `foundations/typography/guidelines.md`

Prose source of truth. Covers:

- **Font family**: Haffer is the sole typeface. No accent font. Weight creates hierarchy.
- **Weight roles**: Heavy for display/accent, Bold for section headings, SemiBold for titles and overlines, Medium for emphasized labels and numbers, Regular for body text and labels.
- **Type scale usage**: When to use each category (Display for hero moments, Header for section structure, Title for card/list titles, Label for metadata/form labels, Body for readable content, Number for tabular data, Overline for category tags).
- **Tabular numbers**: When to use (financial amounts in lists/tables, transaction histories, dashboards, timers, live-updating metrics, any UI where numeric alignment supports scanning). When to avoid (marketing surfaces, long-form reading, headings, short inline numbers in sentences). Platform code snippets for applying tnum as a modifier outside Number styles.
- **Uppercase rules**: Display and Overline are always uppercase (brand rule). Number Display inherits this.
- **OpenType features**: Document what Haffer supports (tnum, slashed zero, ligatures, contextual alternates, fractions). Only tnum is encoded in tokens. Others are available for per-instance use.
- **Primitive scale rationale**: Font sizes are hand-picked (approximate major second), line heights on a 4px grid from 12, letter spacing curated for size-appropriate tracking.

---

## What moves where

### `foundations/typography/`

Source of truth for typography tokens. Platform-agnostic, no Figma-specific data.

| File | Notes |
|---|---|
| `primitives.json` | 38 DTCG tokens: 12 font sizes, 12 line heights, 8 letter spacings, 5 font weights, 1 font family |
| `semantic.json` | 25 DTCG composite typography tokens referencing primitives. Non-standard properties (`textCase`, `openTypeFeatures`) in `$extensions`. |
| `guidelines.md` | Usage rules, tnum guidance, uppercase rules, OpenType feature documentation, scale rationale |

### No generation pipeline, but verification is required

Typography tokens are hand-authored. No generation step — unlike color (which computes OKLCH ramps from brand anchors), typography values are direct design decisions. However, `lab/pipelines/typography/` still exists as a verification-only pipeline (no `generate.ts`, only `verify.ts`), following the same directory convention as color.

Since all 25 semantic tokens are alias-heavy composites with hand-authored primitive references, a **verification script is required** at `lab/pipelines/typography/verify.ts`. It validates:
- All semantic `$value` references resolve to valid primitives in `primitives.json`
- All Number styles have `$extensions` with `openTypeFeatures.tnum`
- All Display, Number Display, and Overline styles have `$extensions` with `textCase: "uppercase"`
- No orphaned primitives that are referenced but missing (the inverse — unused primitives — is allowed by design)

### Figma plugin

The existing plugin (workstream #4) will be extended to push typography primitive variables and create text styles programmatically via `figma.createTextStyle()` and `setBoundVariable()`. The plugin sets `fontName`, `fontSize`, `lineHeight`, `letterSpacing`, `textCase`, and binds size/lineHeight to primitive variables. The only manual step is toggling tnum on Number styles (6 styles), since the plugin API cannot write `openTypeFeatures`. The plugin should surface a reminder for this. This spec documents what needs pushing, not how the plugin organizes collections.

### Migration

Old-to-new SDU identifier mapping (`BODY_M_REGULAR → body/m`, `HEADING_BOLD_H1 → header/l`, etc.) lives in `migration/`. This is a separate spec coordinated with backend, Paul (iOS), and Sergei (Android). The ~30 legacy iOS aliases and Android aliases need to be catalogued and either mapped or deprecated.

---

## Cross-platform comparison

### What changes from the current native implementation

| Aspect | Current (iOS/Android) | New (Origin) |
|---|---|---|
| Primary font | Inter | Haffer |
| Accent font | PP Neue Corp Narrow Bold | None (Display Heavy fills this role) |
| Scale size | ~40 styles with weight variants per size | 25 styles, single weight per category |
| Naming | `BodyMRegular`, `HeadingH1`, `DisplayLEmphasized` | `body/m`, `header/l`, `display/l` |
| Token architecture | Flat enum/class | Two layers: primitives + semantics |
| Tabular numbers | Not addressed | Dedicated Number styles with tnum |
| Line heights | iOS: font metrics only; Android: explicit per style | Explicit everywhere, 4px grid |
| Letter spacing | Android: explicit; iOS: not specified | Explicit everywhere, curated scale |
| Dark mode | Infrastructure exists, unused | Not in scope (no mode switching for typography) |

### Mismatches to resolve (in migration spec)

| Item | Current state | Decision needed |
|---|---|---|
| HeadingH2 size | iOS 24pt vs Android 28sp | Resolved: header/s = 24, header/m = 28 |
| AccentH1 | iOS 43pt vs Android 44sp | Retired: Display styles replace accent |
| BodyXXLSemiBold | iOS only | Retired: not in new scale |
| BodyMSemiBold | iOS only | Retired: use title/s (14px SemiBold) |
| BodyS sizes | Android only (12sp) | Covered: body/s = 12 |
| Keypad styles | Android only | Retired: not in new scale, component-level concern |
| ButtonL/M/S | Both platforms | Retired: components reference semantic scale (e.g., label-heavy/m) |
| SDU identifiers | ~40 primary + ~30 legacy aliases | Migration mapping needed |

---

## Done when

- `foundations/typography/primitives.json` has all 38 tokens in DTCG format (with the documented departure for percentage-based letter spacing under `$type: "dimension"`)
- `foundations/typography/semantic.json` has all 25 composite tokens referencing valid primitives, with `$extensions` on Number styles (tnum), Display styles (textCase), Number Display styles (tnum + textCase), and Overline (textCase)
- `lab/pipelines/typography/verify.ts` validates all semantic references resolve to valid primitives, all Number styles have `tnum` extension, and all Display/Number Display/Overline styles have `textCase` extension
- `foundations/typography/guidelines.md` covers font family, weight roles, scale usage, tnum guidance, uppercase rules, OpenType features, and scale rationale
- All committed and pushed
