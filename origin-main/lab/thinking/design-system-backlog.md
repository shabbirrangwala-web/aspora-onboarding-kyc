# Design system backlog

Global tracker for Origin design system work. Updated as items are completed or new ones discovered.

---

## Foundations

| Item | Status | Notes |
|---|---|---|
| Color primitives | Done | 153 variables, synced to Figma |
| Color semantics (light/dark) | Done | 56 variables, synced to Figma |
| Typography primitives | Done | 30 variables, synced to Figma |
| Typography text styles | Done | 25 styles, synced to Figma. Haffer (licensed) |
| Spacing | Done | 12 variables, synced to Figma |
| Radius | Done | 8 variables, synced to Figma |
| Asset sizing | Done | 7 variables (12–64), plugin updated, synced to Figma |
| Overlay tokens | Not started | Needed for pressed/hover/focus state layers. Semi-transparent overlays on interactive surfaces. |
| Asset guidelines | Not started | `foundations/asset/guidelines.md` — sizing rules, icon vs media usage, text pairing guidance |
| Iconography guidelines | Not started | `foundations/iconography/` is empty. Stroke weight rules, grid, sizing per asset tokens |

## Components — by category

### Core
| Component | Research | Spec | Figma | Notes |
|---|---|---|---|---|
| Button | Done | Done | Done | 5 types (standard, destructive, pill, icon, swipe). States included. |
| Card | Not started | Not started | - | Pure container, Wise model. Slot-based. |
| Banner | Not started | Not started | - | Informational surface, similar to eBay banner |
| List item | Done | Done | Done | Accessor variants (navigation, radio, checkbox, toggle, non-interactive). Divider as boolean. Contained style for radio/checkbox. Content swap sets (text, tag, alert, combos). Published as list groups with internal `_List item`. |
| Divider | Done | Not started | Done | Rectangle, 1px height, fill width |
| Tag | Done | Done | Done | Display-only label. Brand + semantic colors. Optional leading icon. |
| Avatar | Done | Done | Done | 4 sizes (32, 40, 48, 64). Content: image, initials, icon. Badge as nested component (6 types). |
| Badge | Done | Done (part of avatar) | Done | 6 types: status, flag, action, context, aspora, image. 2 sizes (12, 16). |
| Logo | - | - | Done | Two components: Logo (brand asset) and Logo mark (sized system versions). Variants: wordmark, emblem, symbol. |

### Forms
| Component | Research | Spec | Figma | Notes |
|---|---|---|---|---|
| Text input | Done | Done | Done | Base input. Covers text, email, date, number. Multiline as variant. Slots for leading/trailing (max 2 items). |
| Password input | Done | Done | Done | Fixed visibility toggle. Variant axis: hidden/visible. |
| Phone input | Done | Done | Done | Country prefix. Variant axis: selectable/fixed. |
| Search input | Done | Done | Done | Standalone. No label, pill shape, search icon + clear. |
| Code input | Done | Done | Done | Standalone. Individual cells (OTP, PIN). Cell + component level states. |
| Selector | Not started | Not started | - | Dropdown/picker, presents via bottom sheet |
| Slider | Not started | Not started | - | Includes expressive variant with tick marks |

### Selectors
| Component | Research | Spec | Figma | Notes |
|---|---|---|---|---|
| Checkbox | Done | Done | Done | 24px. States: unchecked, checked, indeterminate, disabled. |
| Radio button | Done | Done | Done | 24px. States: unselected, selected, disabled. |
| Toggle | Done | Done | Done | 46×28. States: off, on, disabled. |
| Chips | Done | Done | - | Two types: Choice + Filter. Two sizes: 28px, 36px. Selected = black outline. Chip group component (row + wrap). |

### Overlay
| Component | Research | Spec | Figma | Notes |
|---|---|---|---|---|
| Bottom sheet | Not started | Not started | - | Slot-based content area. Highest impact for Figma slots. |
| Dialog | Not started | Not started | - | Android has a gap. eBay frames as "focus sheet". |

### Messaging
| Component | Research | Spec | Figma | Notes |
|---|---|---|---|---|
| Alert notice | Done | Done | Done | One component, two scopes (section/inline). 5 variants: error, warning, success, accent, neutral. Tinted bg, black text, locked icons. Section: optional title, button action, dismiss. Inline: icon + description only. |
| Snackbar | Done | Done | Done | Transient, dark/inverse, no semantic variants. Two states: confirmation (checkmark + optional action) and in-progress (spinner). One at a time, no stacking. |
| Action prompt | Done | Done | Done | Replaces NBA action card. Page-level action prompt. Semantic coloring. Icon + title + metadata + chevron + footer. |

### Indicators
| Component | Research | Spec | Figma | Notes |
|---|---|---|---|---|
| Progress bar | Not started | Not started | - | Continuous or discrete × linear or circular. Compact summary ("how far along"). |
| Progress stepper | Done | Done | Done | Vertical list of labeled steps with states. Detailed breakdown ("what are the steps, where am I"). |
| Spinner | Not started | Not started | - | Indeterminate, neutral. Just on/off. |
| Skeleton | Not started | Not started | - | Content placeholder shimmer |
| Expressive loader | Not started | Not started | - | Branded loading animation |

### Navigation
| Component | Research | Spec | Figma | Notes |
|---|---|---|---|---|
| Navigation bar | Done | Done | Done | Top-of-screen nav. 3 rows: action row (52px), stacked title, secondary content. Boolean toggles. Research covers Wise, eBay, Uber, native codebases. |
| Tab bar | Not started | Not started | - | Bottom navigation between primary destinations |
| Segmented control | Done | Done | Done | Inline tab-like switcher |

### TBD
| Item | Notes |
|---|---|
| Action pills | Resolved — pill type within Button component |
| Chips | Resolved — Choice (single-select) + Filter (multi-select). Spec written. |

---

## Assets

| Component | Figma | Notes |
|---|---|---|
| Solid icons | Done | Organized by category (General, Arrows, Communication, etc.) |
| Flags | Done | Circular format |
| 3D icons | Done | Brand illustrations |
| Logo | Done | Brand asset (full size) |
| Logo mark | Done | Sized system versions (wordmark, emblem, symbol) |

---

## Patterns (to document after primitives exist)

| Pattern | Components used | Priority |
|---|---|---|
| Transaction summary | List item (non-interactive) + Divider | High |
| NBA action card | Promoted to Messaging component | - |
| Offer banner | Card + title + description + CTA | Medium |
| Active action widget | Card + slot content + divider + footer | Medium |
| Payment request | Card + avatar + text + action buttons | Low |

---

## Open questions

| Question | Context | Status |
|---|---|---|
| Overlay tokens | Need semi-transparent overlays for pressed/hover/focus states. Generic overlay approach (overlay/pressed, overlay/hover) preferred over specific per-surface pressed colors. | Needs decision |
| Interactive/contrast token | White interactive fill for buttons on brand surfaces. Deferred — rolled back pending overlay token decision. | Deferred |
| Figma slots | Plugin API doesn't support native slots yet. Manual conversion needed. | Blocked on Figma API |

---

## Workflow

Pipeline per component: Research → Brainstorm → Spec (markdown) → Build (HTML spec page → Figma capture → Hakeeb finishes)

- Specs: `lab/specs/components/` (plain names matching component)
- HTML spec pages: `lab/viewer/` (for Figma capture workflow)
- Components built in: Origin components file (`86sLraTiTmODDdbKOHeGY8`)
- Foundation tokens in: Origin foundations file (`3lR7HDm73ftyRt8m25mj8G`)
- Taxonomy: `lab/thinking/component-taxonomy.md`
- Research: `lab/research/`
- JSON contracts deferred until components are finalized in Figma
- Internal/private components use `_` prefix (published but hidden from assets panel)
