# Tag spec

Origin tag component. Display-only informational label. Distinct from Chips (which are interactive/selectable).

---

## Overview

Tags are small labels that communicate status, category, or metadata. Not interactive — no tap, no dismiss, no selection. Used inline with text, in list items (via secondary/tertiary swap sets), and alongside other content.

---

## Anatomy

```
Tag
├── Icon (optional, leading)
└── Label (text, required)
```

---

## Variants

### Color

Tags support brand and semantic colors for different contexts:

| Color | Use case |
|---|---|
| **Neutral** | Default, general metadata |
| **Maroon** | Brand accent |
| **Crimson** | Brand accent |
| **Teal** | Brand accent |
| **Blue** | Brand accent |
| **Gold** | Brand accent |
| **Lime** | Brand accent |
| **Peach** | Brand accent |
| **Success** (green) | Positive status (verified, complete, active) |
| **Warning** (gold) | Caution status (pending, expiring) |
| **Error** (red) | Negative status (failed, expired, blocked) |

### Icon

Boolean: show/hide leading icon. Icon is an instance swap slot.

---

## Props

| Prop | Type | Default |
|---|---|---|
| Label | text | required |
| Color | variant | Neutral |
| Show icon | boolean | false |
| Icon | instance swap | Placeholder icon |

---

## Size

Single size. Compact — height determined by padding + text. No size variants.

---

## Tokens

| Property | Token |
|---|---|
| Background | Color-specific (e.g., success/light, error/light, brand token + alpha) |
| Text | Color-specific (e.g., success/on-light, error/on-light, brand dark tone) |
| Icon | Same as text color |
| Padding x | spacing/8 |
| Padding y | spacing/4 |
| Radius | radius/full or radius/4 (per design) |
| Gap (icon to label) | spacing/4 |
| Label style | Label heavy/Small or Label/Small |

---

## Design decisions

- **Not interactive.** Tags are display-only. For selectable labels, use Chips (deferred component).
- **No dismiss.** Tags can't be removed by the user. They reflect system state.
- **Brand colors supported.** Tags can use any brand color for categorization and visual coding.
- **Semantic colors for status.** Success/warning/error tags communicate system status, not brand expression.
- **Single size.** Keeps tag usage consistent. No small/large variants.

---

## Usage

- In list items: via secondary/tertiary instance swap set (Tag type)
- In content: inline with text to mark status ("Mum `Favourite`")
- In buttons: pill button labels can pair with tag-like badges
- Not for: filtering (use Chips), actions (use Button), navigation (use Link)
