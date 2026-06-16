# Input components spec

Draft spec for Origin input component family. 5 components across two tiers.

---

## Form inputs (shared anatomy)

Shared structure: label (stacked above) + contained input (bordered rectangle, rounded corners, 48px height) + helper text / error message below.

- Labels always visible, always stacked above
- Placeholders optional, supplementary only — never a replacement for labels
- Contained style (not underline)
- Single size: 48px height
- Leading and trailing as Figma slots (max 2 items per slot)

### Text input

Base input. Covers text, email, date, number — these are just keyboard/placeholder differences, not separate components.

**Props:**
- Label (text, required)
- Placeholder (text, optional — format hints only)
- Helper text (text, optional — persistent guidance)
- Leading (slot, optional — icon, flag, prefix text. Max 2 items.)
- Trailing (slot, optional — icon, suffix text, action, spinner. Max 2 items.)
- Disabled (boolean)
- Required (boolean — shows indicator on label)
- Error message (text, optional — replaces helper text)
- Success message (text, optional — replaces helper text)

**States:** Default, Focused, Filled, Error, Disabled

**Note:** Multiline is a property or variant on text input (taller container, top-aligned text, optional character count), not a separate component.

### Password input

Fixed trailing slot (visibility toggle). Separate component because trailing is permanently claimed.

**Props:**
Same as text input except:
- No free leading or trailing slots (trailing is the visibility toggle)
- Visibility (variant axis: hidden / visible)

**States:** Default, Focused, Filled, Error, Disabled
**Variants:** Visibility = Hidden, Visible

### Phone input

Country prefix (flag + dial code) with text input for the number.

**Props:**
Same as text input except:
- No free leading slot (country prefix is fixed)
- Country selector (variant axis: selectable / fixed)
- Selectable: flag + code + chevron, tappable, opens picker
- Fixed: flag + code, static — visual treatment TBD

**States:** Default, Focused, Filled, Error, Disabled
**Variants:** Country selector = Selectable, Fixed

---

## Standalone inputs (own anatomy)

### Search input

No label. Leading search icon (fixed), trailing clear button (appears on content). Placeholder serves as the primary hint.

**Props:**
- Placeholder (text, required — this IS the hint)
- Trailing clear (automatic on content)

**States:** Default, Focused, Filled

**Note:** May support style variants for different surface contexts (filled/outlined) in the future.

### Code input

Individual cells in a row. Completely different anatomy from form inputs. Used for OTP, PIN, verification codes.

**Props:**
- Length (number — how many cells, default 4 or 6)
- Secure (boolean — show dots instead of digits for PIN)
- Error message (text, optional)
- Success message (text, optional)

**Cell-level states:** Empty, Active (cursor in this cell), Filled
**Component-level states:** Default, Error, Success, Disabled

---

## Components removed from original 7

| Removed | Reason |
|---|---|
| Multiline input | Property/variant on text input, not separate component |
| Date input | Just a text input with DD/MM/YYYY placeholder and masking. Not structurally different. |

---

## Shared design decisions

- **Container style:** Bordered rectangle, rounded corners, contained (not underline)
- **Height:** 48px (single size, mobile-first)
- **Label:** Always stacked above, always visible (on form inputs)
- **Placeholders:** Optional, supplementary. Never replaces label.
- **Error messages:** Replace helper text when present. Red treatment.
- **Success messages:** Replace helper text when present. Green treatment.
- **Slots:** Leading and trailing are native Figma slots, max 2 items each. Supports icon + spinner, prefix + icon, etc.
- **No loading state:** Loading handled via trailing slot content (spinner), not a component state.

---

## Research sources

- Code scan: `lab/research/2026-03-18-component-inventory-audit.md`
- Design system comparison: `lab/research/2026-03-25-input-component-comparison.md`
