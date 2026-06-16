# List item component comparison

Research date: 2026-03-26
Systems: Wise, eBay (Playbook), Uber (Base Web)

---

## Architecture approach

| Aspect | Wise | eBay | Base Web |
|--------|------|------|----------|
| Component name | List Item | List Row | ListItem |
| Architecture | One base + 7 typed variants by trailing action | One flexible component, 2 interaction modes | One component + composable sub-components |
| Typed vs flexible | **Typed** -- separate variant per action type | **Flexible** -- single component, content-driven | **Flexible** -- slots filled via props |

### Wise variants (7 total)
1. **Navigation** -- navigates to another area; trailing chevron
2. **Radio** -- single selection; trailing radio button
3. **Checkbox** -- multi-selection; trailing checkbox
4. **Switch** -- toggle on/off; trailing switch
5. **Icon button** -- supporting actions (tooltip, copy, edit); trailing icon button
6. **Button** -- triggers an action; trailing button (primary or secondary)
7. **Non-interactive** -- informational display only; no trailing action

### eBay interaction modes (2)
1. **Actionable** -- entire row is one tap target
2. **Static** -- only nested elements (trailing accessories) are interactive

### Base Web rendering modes (2)
1. **Interactive** -- when `onClick` is provided, renders as `<button>`, full-surface tap target
2. **Static** -- renders as `<li>`, no click behavior

---

## Anatomy

### Wise

```
[ Leading (avatar) ] [ Content: title / subtitle / additional info / value ] [ Trailing (action accessory) ]
                                                                             [ Prompt (validation) ]
```

- Leading: optional avatar (5 sizes), double avatar (diagonal or horizontal)
- Content: title, description/subtitle, additional information, value
- Trailing: determined by variant type (radio, checkbox, switch, icon button, button, chevron, or none)
- Prompt: inline validation area below content (4 sentiments)
- Spotlight: special state for empty/activated states

### eBay

```
[ Lead accessories ] [ Main content: overline / title / subtitle / description ] [ Trailing accessories ]
                                           [ Divider ]
```

- Lead: icons, avatars, images, selection controls (checkbox, radio), or multiples combined (e.g. avatar + checkbox)
- Content: overline, title, subtitle, description (4-level hierarchy)
- Trailing: disclosure icon, external link icon, toggle switch, secondary value, infotip button
- Divider: optional, helps discern container shape in dense layouts

### Base Web

```
[ Artwork ] [ Label content: children (primary) / description (secondary) ] [ EndEnhancer ]
```

- Artwork: any React component, 3 sizes
- Content: primary text (children) + optional description
- EndEnhancer: any React component
- Subcomponents: ListItem, ListItemLabel, ListHeading, MenuAdapter

---

## Height and sizing

| Aspect | Wise | eBay | Base Web |
|--------|------|------|----------|
| Height model | Content-driven | Content-driven, flex vertically | Content-driven, min-height via theme |
| Min height | Not specified | 48px (small screens, tap target) | `scale1600` (~52px from theme) |
| Fixed sizes | No | No | No |
| Density modes | No (avatar size is the lever) | No | Compact vs default (menu items only) |
| Max width | Not specified | 480px recommended | Not specified |

### Wise avatar sizes (indirect height control)
| Size | Use case |
|------|----------|
| 32px | Case-by-case, smaller items |
| 40px | Summaries, extra space needed |
| 48px | **Default** across app |
| 56px | Larger size for option selection |
| 72px | Promotional purposes |

### Base Web artwork sizes
| Size | Pixels | Sublist pixels |
|------|--------|----------------|
| SMALL | 16px | 16px |
| MEDIUM | 24px (default) | n/a (aliased to SMALL) |
| LARGE | 36px | 24px |

### Base Web menu item density
| Size | Typography | Vertical padding | Horizontal padding |
|------|-----------|-------------------|---------------------|
| Compact | font100 | scale100 | scale900 |
| Default | font200 | scale300 | scale600 |

---

## Leading element

| Option | Wise | eBay | Base Web |
|--------|------|------|----------|
| Icon | Via avatar | Yes | Yes (artwork prop) |
| Avatar | Yes (5 sizes) | Yes | Yes (artwork prop) |
| Image | Via avatar media | Yes | Yes (artwork prop) |
| Checkbox | No (trailing only) | Yes (lead slot) | No (not built in) |
| Radio | No (trailing only) | Yes (lead slot) | No (not built in) |
| Double avatar | Yes (diagonal + horizontal) | Not documented | No |
| Custom component | No | Not documented | Yes (any React component) |

Key difference: Wise places selection controls (radio, checkbox) in the **trailing** slot. eBay allows them in the **leading** slot. Base Web does not have built-in selection; it would be custom via artwork/endEnhancer.

---

## Trailing element

| Option | Wise | eBay | Base Web |
|--------|------|------|----------|
| Chevron / disclosure | Yes (navigation variant) | Yes | Yes (endEnhancer) |
| Radio | Yes (radio variant) | Not documented trailing | No |
| Checkbox | Yes (checkbox variant) | Not documented trailing | No |
| Switch / toggle | Yes (switch variant) | Yes | Yes (endEnhancer) |
| Icon button | Yes (icon button variant) | Yes (infotip button) | Yes (endEnhancer) |
| Button | Yes (button variant, primary/secondary) | Not documented | Yes (endEnhancer) |
| Text / value | Yes (value element) | Yes (secondary value) | Yes (endEnhancer) |
| External link icon | Not documented | Yes | Yes (endEnhancer) |
| Badge | Not documented | Not documented | Yes (endEnhancer) |
| Custom component | No (fixed variant set) | Not documented | Yes (any React component) |

---

## Content structure

| Aspect | Wise | eBay | Base Web |
|--------|------|------|----------|
| Text levels | 4 | 4 | 2 |
| Level 1 | Title | Overline | children (primary) |
| Level 2 | Description/subtitle | Title | description (secondary) |
| Level 3 | Additional information | Subtitle | -- |
| Level 4 | Value (formatted) | Description | -- |
| Max lines (title) | Few words | Wrap or truncate (configurable) | maxLines: 1 or 2 (headings) |
| Max lines (description) | 2 sentences | Wrap or truncate (configurable) | Not specified |
| Max lines (additional) | 2 lines | -- | -- |
| Value | Single line only | Secondary value (trailing) | -- |
| Inverted hierarchy | Yes (description as focal point) | Not documented | No |
| Text formatting | Sentiment colors, strikethrough, bold | Not documented | Via overrides |
| Links in content | Single link in additional info | Not documented | Not built in |

### Wise content rules
- Title: sentence case, no period, most important words first
- Subtitle: max 2 sentences, plain text only, must end with period
- Additional info: max 2 lines, can include one appended link
- Value: single line, use text + iconography (not color alone) for accessibility
- If subtitle used for one item, include it for all items in the list

---

## Dividers

| Aspect | Wise | eBay | Base Web |
|--------|------|------|----------|
| Built in? | No (uses section headers to separate) | Yes (optional, per-row) | No |
| Type | Not a component feature | Visual separator for dense content | Not addressed |
| Guidance | Use section headers between different accessory types | Include when content is dense; omit for uniform rows | Not addressed |

---

## Interaction and states

| State | Wise | eBay | Base Web |
|-------|------|------|----------|
| Hover | Yes | Not documented | Yes (via menu: menuFillHover bg) |
| Active / pressed | Yes | Not documented | Not documented |
| Focus | Yes | Not documented | Yes ($isFocused) |
| Disabled | Yes (with inline prompt explanation) | Yes (pre-requisites not met) | Yes ($disabled, cursor: not-allowed) |
| Selected | Not documented (radio/checkbox state) | Not documented | Yes (aria-selected) |
| Highlighted | Not documented | Not documented | Yes ($isHighlighted, menu context) |

### Wise interaction modes
- **Fully interactive**: clicking anywhere on item triggers action + accessory state change
- **Partially interactive**: only the accessory area responds (for icon button, button, inline links)
- Rule: never mix fully and partially interactive items in the same list

### Wise spotlight
- **Inactive**: suggests action user hasn't taken
- **Active**: shows activated option
- Used for conveying empty states

---

## Inline validation / prompts

Only Wise has built-in inline validation. Four sentiment levels:

| Sentiment | Use case |
|-----------|----------|
| Neutral | Contextual hints or general information |
| Positive | Something resolved or now available |
| Warning | Could negatively impact experience |
| Negative | Has negatively affected experience |

- Single-line: container adjusts to content width
- Multi-line: stretches full width minus avatar
- Can contain a single link (full prompt tappable on mobile, only link on desktop)

---

## Accessibility

| Feature | Wise | eBay | Base Web |
|---------|------|------|----------|
| Screen reader ordering | Custom (title > value > subtitle) | Not documented | Auto-generates aria-label from first child |
| Disabled explanation | Required inline prompt | Not documented | Not documented |
| ARIA roles | Not documented | Not documented | role prop, aria-selected, aria-label |
| Keyboard navigation | Focus state | Not documented | Full keyboard nav (menu: arrows, enter, escape, home, end) |

---

## Summary of key patterns

### What they agree on
1. **Content-driven height** -- no fixed size variants; the row grows with content
2. **Slot-based anatomy** -- leading, content, trailing as the core structure
3. **Minimum tap target** -- eBay explicitly states 48px; others imply it through sizing
4. **Optional leading element** -- avatar/icon is never required
5. **Full-row tap target** -- all three support making the entire row clickable

### Where they diverge

| Decision | Wise | eBay | Base Web |
|----------|------|------|----------|
| Variant strategy | Typed variants (7) per action type | Single flexible component | Single flexible component |
| Selection control placement | Trailing only | Leading (or both) | Neither (custom) |
| Content depth | 4 levels + value | 4 levels (overline through description) | 2 levels (primary + description) |
| Inline validation | Built-in (4 sentiments) | Not built in | Not built in |
| Dividers | Not built in | Built in (optional) | Not built in |
| Density | Implicit via avatar size | Not documented | Compact/default (menu only) |

### Design decisions relevant to Origin

1. **Typed vs flexible**: Wise's typed approach is safest for consistency but creates many components. eBay and Base Web's flexible approach is more composable but relies on usage guidelines.
2. **Selection control position**: Wise trailing-only is cleaner. eBay's leading position allows avatar + checkbox combos (common in email/messaging UIs).
3. **Content levels**: 4 levels (Wise/eBay) covers most real-world needs. Base Web's 2-level is too minimal for a design system that serves product + editorial.
4. **Inline validation**: Wise's built-in prompt is unusual but valuable -- most systems handle validation at the form/list level, not per row.
5. **Dividers**: eBay treats them as optional per-row. Wise delegates to section headers. Building them in as optional is more practical for native platforms.

---

## Sources

- Wise: https://wise.design/components/list-item
- eBay: https://playbook.ebay.com/design-system/list-row
- Base Web: https://baseweb.design/components/list/ (source: https://github.com/uber/baseweb/tree/master/src/list)
- Base Web menu: https://baseweb.design/components/menu/ (source: https://github.com/uber/baseweb/tree/master/src/menu)
