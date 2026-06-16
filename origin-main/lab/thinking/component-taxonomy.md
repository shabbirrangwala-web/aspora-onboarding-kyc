# Component taxonomy

Living document. Tracks Origin's component organization decisions, rationale, and backlog.

---

## Taxonomy

7 categories modeled on Uber Base naming. Functional grouping — categories describe what a component helps the user do, not what it looks like.

| Category | Components | Count |
|---|---|---|
| **Core** | Button, Card, Banner, List item, Divider, Tag, Avatar, Badge | 8 |
| **Forms** | Input field, Selector, Search bar, Slider | 4 |
| **Selectors** | Checkbox, Radio button, Toggle, Chips | 4 |
| **Overlay** | Bottom sheet, Dialog | 2 |
| **Messaging** | Alert notice, Snackbar | 2 |
| **Indicators** | Progress bar, Progress stepper, Skeleton, Expressive loader | 4 |
| **Navigation** | Top navigation, Tab bar, Segmented control | 3 |

**27 components total.**

### TBD

- **Action pills** — Likely a Button variant (pill size with icon). Not a separate component unless the use case proves distinct from Button.

---

## Category rationale

### Core
The components everyone reaches for. No single functional purpose — they're the building blocks that appear across all contexts.

- **Button** — Primary interactive trigger. Includes potential action pill variant.
- **Card** — Pure container. Groups related, heterogeneous content. Not for listed/repeating content. Not for wrapping standalone components. Two sizes (compact, default) driven by padding and radius, not by content type. Value is in enabling unique one-off compositions that don't warrant a pattern. See: Wise design system card constraints.
- **Banner** — Informational card-like surface for promotions, announcements, system info. Similar to eBay's banner and Uber's message card. Sits alongside Card as a surface with more opinionated structure.
- **List item** — Row for displaying key-value content, transactions, settings, navigation options. Leading slot (icon, avatar), content area (label + optional secondary text), trailing slot (value, chevron, action). Central to fintech UIs — transaction summaries, fee breakdowns, settings screens.
- **Divider** — Thin, thick, or dashed. Separates content sections. Used everywhere, rarely discussed.
- **Tag** — Informational label. Status, category, metadata. Display only — not interactive (unlike Chips which are selectable). Similar to eBay's Signal.
- **Avatar** — User representation. Photo, initials fallback, or icon.
- **Badge** — Small status indicator. Notification counts, dot indicators.

### Forms
Components that collect data from users through direct input.

- **Input field** — Text entry. Includes specialized variants (date, email, phone, OTP, currency, password).
- **Selector** — Dropdown / picker. Presents options for selection, typically via bottom sheet.
- **Search bar** — Text input specialized for search with focus states, filtering behavior.
- **Slider** — Value selection along a range. Includes expressive variant with tick marks and value labels (used in transfer amount selection).

### Selectors
Binary and multi-choice controls. Separated from Forms because the mental model is different — "pick from options" vs "enter data."

- **Checkbox** — Multi-select. Square, checked/unchecked/disabled states.
- **Radio button** — Single-select from a group. Circle with inner dot.
- **Toggle** — On/off binary. Track with sliding thumb.
- **Chips** — Selection/filtering. Filter chips (multi-select), choice chips (single-select). Interactive — distinct from Tags which are display-only.

### Overlay
Components that float above the base UI in an elevated layer. Share z-index, dismiss behavior, and focus-trapping concerns.

- **Bottom sheet** — Partial overlay anchored to bottom. Contextual content, actions, or selection.
- **Dialog** — Full-attention overlay. Confirmation, destructive actions, critical decisions. eBay frames bottom sheet and dialog as subtypes of "Sheet" (context sheet / focus sheet) — worth considering.

### Messaging
System-to-user communication. Things the system tells you.

- **Alert notice** — Persistent message. Inline, page-level, or section-level. Error, warning, success, info variants. Similar to eBay's alert notices (inline, page, section).
- **Snackbar** — Transient overlay notification. Appears briefly, auto-dismisses. Preferred term over "toast" — describes the behavior (brief, slides away) rather than a metaphor.

### Indicators
Progress and loading states. Answer "what's happening?" and "how far along?"

- **Progress bar** — Linear or circular progress. Percentage, determinate/indeterminate. Upload progress, loading states.
- **Progress stepper** — Multi-step flow indicator. Horizontal (step dots) and vertical (timeline/checklist). Onboarding, KYC, transfer flows. Modeled on Uber's Progress Listed and Progress Steps.
- **Skeleton** — Content placeholder while loading. Shimmer animation.
- **Expressive loader** — Branded, delightful loading animation. Distinct from utilitarian skeleton/spinner. eBay has this concept too.

### Navigation
Components that move users through the app.

- **Top navigation** — App header with profile, actions, balance.
- **Tab bar** — Bottom navigation between primary destinations.
- **Segmented control** — Inline tab-like switcher for views/filters within a screen.

---

## Patterns (separate from components)

Patterns are documented recipes for composing components. They are NOT published as library components. They describe how to combine primitives for specific use cases.

Patterns earn their place when:
1. The composition appears across many screens with the same structure
2. Designers consistently get it wrong without guidance
3. Inconsistency would occur if left to individual interpretation

### Identified patterns (to be documented later)
- **Transaction summary** — List items + dividers showing fee breakdowns, amounts, totals
- **NBA action card** — Card + icon + secondary content + widget footer
- **Offer banner** — Card + title + description + CTA
- **Active action widget** — Card + slot content + divider + footer
- **Payment request** — Card + avatar + text + action buttons

---

## Assets (separate from components)

Assets are static visual resources consumed by components. Not interactive, not behavioral.

- **Icons** — System icon set
- **Flags** — Country/currency flags
- **3D assets** — Branded 3D illustrations

Assets live in a separate section/file from components.

---

## Key design decisions

### Card is a container, not a composition
Card provides surface (background, padding, radius) and nothing else. Content goes in a slot. The value is enabling unique compositions that don't warrant a documented pattern. Constraints from Wise:
- Do use for heterogeneous, unique content grouping
- Do use as entry points into deeper layers
- Don't use for listed/repeating homogeneous content (use List item)
- Don't use to wrap standalone components (use the component directly)

### Functional categories, not structural
Categories describe user intent ("I need to collect data" → Forms) not component structure ("this has a border" → Surfaces). Grounded in Material Design 3, Uber Base, and Nathan Curtis's recommendations.

### Flat within categories
No nesting deeper than one level. Alphabetical within each category. Hierarchy comes from patterns, not nested component groups.

### Patterns are separate
Every major design system separates patterns from components (Carbon, Lightning, Material, Polaris, Atlassian). Mixing them creates confusion about what's a reusable building block vs a recipe.

### No atoms/molecules vocabulary
Brad Frost's atomic design thinking is adopted (primitives compose into components compose into patterns) but not the naming. Nathan Curtis: "Atoms and Molecules creates a layer of transformation that gets in the way." We use: components, patterns.

### Chips are selectors, Tags are display
Chips are interactive (filter, choose, select). Tags are informational labels (status, category). Different intent, different categories.

### Snackbar over Toast
"Snackbar" describes the behavior (transient, brief, slides away). "Toast" is a metaphor that doesn't communicate behavior. Aligns with Uber and eBay naming.

### Asset sizing: two token sets, not spacing tokens
Icon and media asset sizes are separate token sets, not derived from spacing. Spacing tokens have intermediate stops (4, 8, 12, 20, 28) that aren't valid asset sizes, and reusing them would let designers pick invalid values.

Single `asset/` token set covering all non-interactive visual elements:

```
asset/16, asset/24, asset/32, asset/40, asset/48, asset/64
```

Icons use the lower end (16, 24, 32). Avatars, flags, 3D icons, logos use the full range. Same tokens, same 1:1 containers. Defined in `foundations/asset/primitives.json`.

Component heights (28, 36, 48, 52) are defined per component contract, not as shared tokens — no designer picks a "component height" from a dropdown.

Applied via height/width token binding in Figma, not component variants or component properties.

Grounded in research across Material, Carbon, Primer, Wise, eBay, Atlassian. Every system uses a fixed size set. 16px and 24px appear universally. No system allows arbitrary sizing.

---

## Research sources

Taxonomy grounded in analysis of 8 design systems + theoretical frameworks:

- **Uber Base** — 8 categories. Primary influence on our naming and structure.
- **Material Design 3** — 6 categories. Cleanest taxonomy. Validated the functional grouping approach.
- **eBay Playbook** — Parent/child component grouping. Alert notice subtypes. Lifecycle status tags. Expressive loader concept.
- **Wise** — Card-as-pure-container model. List item family. Product vs Editorial split. Strong card constraints.
- **Carbon (IBM)** — Flat alphabetical. Patterns as separate concept.
- **Polaris (Shopify)** — 11 categories (too many). Explicit primitives in Layout.
- **Atlassian** — 11 categories. Explicit Primitives category. Messaging naming.
- **Primer (GitHub)** — 7-8 loose groups. Internal vs public component tiers.
- **Lightning (Salesforce)** — Flat components + richly categorized patterns.
- **Nathan Curtis / EightShapes** — "Call everything components." Categories as tags not folders. Avoid metaphorical naming.
- **Brad Frost / Atomic Design** — Hierarchical thinking adopted, specific vocabulary not adopted.

Full research: `lab/research/2026-03-24-component-taxonomy-comparison.md`
Component audit: `lab/research/2026-03-18-component-inventory-audit.md`

---

## Build pipeline

Decided 2026-03-24. Contract-driven, not prompt-driven.

1. **Research** — Scan iOS/Android code for existing implementation
2. **Spec** — Draft JSON contract (using cc-figma-component skill schema)
3. **Build** — Compile contract into Figma via use_figma MCP
4. **Validate** — Screenshot + metadata checks + designer review
5. **Document** — Generate documentation via uspec (separate step)

Contracts live in `components/product/{name}.contract.json`.
Components built in Origin components file (`86sLraTiTmODDdbKOHeGY8`).
Origin foundation tokens in (`3lR7HDm73ftyRt8m25mj8G`).

### Build order
1. Core — Button, Card, List item, Divider (most foundational, some already prototyped)
2. Selectors — Checkbox, Radio button, Toggle, Chips (simplest, well-matched across platforms)
3. Forms — Input field, Selector, Search bar, Slider
4. Overlay — Bottom sheet, Dialog
5. Messaging — Alert notice, Snackbar
6. Indicators — Progress bar, Progress stepper, Skeleton, Expressive loader
7. Navigation — Top navigation, Tab bar, Segmented control
8. Core (remaining) — Tag, Avatar, Badge, Banner
