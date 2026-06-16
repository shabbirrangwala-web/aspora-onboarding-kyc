# Selectors spec

Origin selection control components. Simple atoms — no labels, no descriptions, no groups. Composition concerns (labels, groups, context) are handled by list items and forms.

---

## Components

### Checkbox

Single size: **24px**. Square with rounded corners.

| State | Visual |
|---|---|
| **Unchecked** | Border (border/default), transparent fill |
| **Checked** | interactive/primary fill, white checkmark |
| **Indeterminate** | interactive/primary fill, white dash |
| **Disabled** | Muted treatment (reduced opacity or disabled tokens) |

Disabled crosses with all selection states (disabled unchecked, disabled checked, disabled indeterminate).

### Radio button

Single size: **24px**. Circle with inner dot.

| State | Visual |
|---|---|
| **Unselected** | Border (border/default), transparent fill |
| **Selected** | interactive/primary border, interactive/primary inner dot |
| **Disabled** | Muted treatment |

Disabled crosses with selection states (disabled unselected, disabled selected).

### Toggle

Single size: **46×28px** track, **24px** thumb.

| State | Visual |
|---|---|
| **Off** | Track: surface/sunken or neutral fill. Thumb: left position. |
| **On** | Track: interactive/primary. Thumb: right position. |
| **Disabled** | Muted treatment |

Disabled crosses with on/off states.

---

## Design decisions

- **One size per control.** No small/large variants. 24px for checkbox/radio, 46×28 for toggle. Mobile-first, generous touch targets.
- **No labels built in.** Labels are provided by the parent context (list item, form, standalone text). The selector is just the control.
- **No groups built in.** Grouping is handled by list components (List / Radio, List / Checkbox) or by the designer composing selectors with text.
- **Accessibility:** Minimum 44px touch target on all controls (code concern — implemented as tappable area larger than visual element).

---

## Tokens

| Property | Token |
|---|---|
| Unchecked/unselected border | border/default |
| Checked/selected fill | interactive/primary |
| Checkmark/dot color | on-surface/contrast |
| Disabled | on-surface/disabled or 40% opacity |
| Toggle track off | surface/sunken or equivalent neutral |
| Toggle track on | interactive/primary |
| Toggle thumb | on-surface/contrast (white) |
| Checkbox radius | radius/4 or radius/8 (per design) |
| Radio radius | radius/full |
| Toggle track radius | radius/full |
