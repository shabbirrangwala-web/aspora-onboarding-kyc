# List item spec

Final spec for Origin list component.

---

## Architecture

**Published components (what designers use):**
- List / Navigation
- List / Radio (Variant: Default, Contained)
- List / Checkbox (Variant: Default, Contained)
- List / Toggle
- List / Non-interactive

**Internal component (not published):**
- List item — the repeating unit inside each list variant

Designers grab a List variant, add/remove items from the slot. Every item in the slot is the same accessor type. Enforces: "don't mix accessor types in the same list."

---

## List item (internal repeating unit)

### Anatomy

```
List item
├── Leading slot                  (avatar, icon, flag — visual context)
├── Content
│   ├── Primary                   (instance swap: Text, Text+Text, Text+Tag)
│   ├── Secondary                 (instance swap: Text, Tag, Alert, Text+Text, Text+Tag)
│   └── Tertiary                  (instance swap: Text, Tag, Alert, Text+Text, Text+Tag)
└── Trailing
    ├── Content slot              (value text, badge, tag — swappable)
    └── Accessor                  (fixed per list variant: chevron, radio, checkbox, toggle, none)
```

### Content swap sets

| Line | Available types |
|---|---|
| **Primary** | Text, Text+Text, Text+Tag |
| **Secondary** | Text, Tag, Alert (4 sentiments), Text+Text, Text+Tag |
| **Tertiary** | Text, Tag, Alert (4 sentiments), Text+Text, Text+Tag |

Primary is always text-led. Secondary and tertiary share the same full set.

Text supports all Origin text styles and colors — "15 Nov · Pending" is Text+Text with different text treatments applied by the designer. The swap set doesn't handle styling permutations.

### Alert sentiments
- Neutral
- Positive
- Warning
- Negative

### Props

| Prop | Type | Default |
|---|---|---|
| Primary | instance swap | Text ("List item title") |
| Show secondary | boolean | false |
| Secondary | instance swap | Text ("Secondary text") |
| Show tertiary | boolean | false |
| Tertiary | instance swap | Text ("Tertiary text") |
| Show leading | boolean | true |
| Show trailing content | boolean | true |

### Layout

- Height: hug content
- Width: fill parent
- Padding: spacing/16 horizontal, spacing/12 vertical
- Gap: spacing/12 between leading/content/trailing
- Content gap: spacing/4 between primary/secondary/tertiary
- Trailing gap: spacing/8 between content and accessor
- Vertical alignment: center (leading and trailing), top (content if multi-line)

---

## Published list variants

### Accessor types

| Variant | Trailing accessor | Interaction | Variants |
|---|---|---|---|
| **Navigation** | Chevron | Tap row → navigate | Default |
| **Radio** | Radio button | Tap row → select | Default, Contained |
| **Checkbox** | Checkbox | Tap row → toggle | Default, Contained |
| **Toggle** | Toggle switch | Tap row → toggle | Default |
| **Non-interactive** | None | No interaction | Default |

### Divider

Boolean property toggle on all list variants. Not a variant axis.

| Divider | Visual |
|---|---|
| **Off** | Items stack with gap only |
| **On** | Thin line between items |

### Contained variant (Radio / Checkbox only)

Each item gets its own border, radius, and gap between items.

| State | Border | Fill |
|---|---|---|
| Unselected | border/default | surface/base |
| Selected | interactive/primary or border/strong | surface/base |

### Interaction modes

- **Fully interactive** — Navigation, Radio, Checkbox, Toggle. Tap anywhere on the row triggers the action.
- **Non-interactive** — Information display only. Can contain inline links in content.
- Don't combine interaction modes in the same list.

---

## Tokens

| Property | Token |
|---|---|
| Horizontal padding | `spacing/16` |
| Vertical padding | `spacing/12` |
| Leading to content gap | `spacing/12` |
| Content to trailing gap | `spacing/12` |
| Primary to secondary gap | `spacing/4` |
| Secondary to tertiary gap | `spacing/4` |
| Trailing content to accessor gap | `spacing/8` |
| Divider color | `border/subtle` |
| Contained border (unselected) | `border/default` |
| Contained border (selected) | `interactive/primary` or `border/strong` |
| Contained radius | `radius/12` |
| Contained item gap | `spacing/8` |
| Primary text color | `on-surface/primary` |
| Secondary/tertiary text | `on-surface/secondary` |
| Trailing value text | `on-surface/secondary` |
| Pressed background | TBD (overlay token) |
| Disabled opacity | 40% |

---

## Usage guidance

- **Navigation**: menus, settings, recipient lists — tap leads somewhere
- **Radio**: single-select choices — choose account, choose method
- **Checkbox**: multi-select — select recipients, permissions
- **Toggle**: on/off settings — notifications, preferences
- **Non-interactive**: display-only rows — fee breakdowns, summaries, info
- **Contained**: deliberate choices where each option should feel like a discrete card
- **Divider on**: scannable lists where visual separation aids scanning
- **Divider off**: compact/tight layouts, items inside cards
- Accessor drives the pattern. Content guides what shows where.
- Don't mix accessor types in the same list — separate with section headers if needed.

---

## Research sources

- Wise: 7 typed variants, "don't mix accessory types" rule, prompts with sentiment
- Uber Base: Core (display) vs Control (interactive) split
- Cash App: Contained radio selection pattern
- Aspora screens: transaction lists, settings, account balances
- Comparison: `lab/research/2026-03-26-list-item-component-comparison.md`
