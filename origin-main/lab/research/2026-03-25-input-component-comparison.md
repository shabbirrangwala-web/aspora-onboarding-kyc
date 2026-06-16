# Input / text field component comparison: Wise, eBay, Uber Base

Last updated: 2026-03-25

Cross-system comparison of input and text field component specifications. Focused on extracting patterns relevant to Origin's input field contract design.

---

## Systems surveyed

| System | Source | Input component types |
|---|---|---|
| **Wise** | wise.design/components | Text Input, Text Area, Money Input, Expressive Money Input, Password Input, Search Input, Compact Date Input, Date Input |
| **eBay** | playbook.ebay.com/design-system | Text Field, Text Area, Search Field, Password, Phone Number, Numeric Stepper, Combobox, Dropdown |
| **Uber Base** | baseweb.design/components | Input (unified), Textarea, Phone Input, Pin Code, Payment Card, FormControl (wrapper), MaskedInput (sub-component) |

---

## 1. Architecture: one base component or many?

### Wise

Wise uses **8 separate components**, each purpose-built:

| Component | Purpose | Relationship to base |
|---|---|---|
| **Text Input** | Single-line text entry | Base component |
| **Text Area** | Multi-line text entry | Separate component |
| **Money Input** | Amount + currency selector | Composite (text input + dropdown) |
| **Expressive Money Input** | Large-format amount for transaction flows | Specialized variant of Money Input |
| **Password Input** | Credential entry with show/hide | Text Input + visibility toggle |
| **Search Input** | Query entry with search affordance | Separate component |
| **Compact Date Input** | Month/year entry (e.g., expiry date) | Separate component |
| **Date Input** | Full date entry (day/month/year) | Separate component (sub-fields) |

**Philosophy**: Each specialized input is its own component with purpose-specific documentation. No shared base component is referenced across the docs. Content guidelines are consistent across all variants (max 3-word label, noun-based, no placeholders, optional single-sentence description).

### eBay

eBay uses **8 separate components**, with a clear shared design language (the "Evo" system, all v4.0):

| Component | Purpose | Shared anatomy |
|---|---|---|
| **Text Field** | Single-line text entry | Label, container, helper text, prefix, suffix, lead icon, trailing icon |
| **Text Area** | Multi-line text entry | Label, container, helper text |
| **Search Field** | Query filtering | Search icon, placeholder, trailing accessory, clear button |
| **Password** | Credential entry with toggle | Label, container, helper text, visibility toggle |
| **Phone Number** | International phone entry | Label, country dropdown, country code, phone value, container |
| **Numeric Stepper** | Increment/decrement number | Label, hint, decrease button, value, increase button |
| **Combobox** | Text input + filterable menu | Label, value, menu, container |
| **Dropdown** | Selection from preset list | Label, value, helper text, container, chevron icon |

**Philosophy**: Separate components but with strong shared conventions (same sizes, same label rules, same helper text patterns, same error handling, same spacing). The text field and password share the most DNA. All components share 4px label-to-container and 8px container-to-helper-text spacing.

### Uber Base

Uber Base uses a **single base Input component** with specialized wrappers built on top:

| Component | Relationship | Built from |
|---|---|---|
| **Input** | Core component | BaseInput (internal) |
| **Textarea** | Separate but shares Input props | Same prop interface as Input |
| **MaskedInput** | Sub-component of Input | Input with mask pattern |
| **Phone Input** | Composite | Input + country Select dropdown |
| **Pin Code** | Separate | Array of single-character Inputs |
| **Payment Card** | Specialized Input | Input with card type detection |
| **FormControl** | Wrapper (label + caption + error) | Wraps any form element |

**Philosophy**: One base component with maximum flexibility. FormControl is a separate wrapper that provides label, caption, and error messaging around any child input. The Input itself has no built-in label -- that comes from FormControl. Start/end enhancers accept any React node, making the component infinitely extensible.

### Architecture comparison

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Component count** | 8 separate | 8 separate | 1 base + 5 specialized + 1 wrapper |
| **Base component** | Text Input (implicit) | Text Field (implicit) | Input (explicit, exported) |
| **Label built-in?** | Yes (all components) | Yes (all components) | No (FormControl wrapper) |
| **Caption/error built-in?** | Yes (description/error) | Yes (helper text/error) | No (FormControl wrapper) |
| **Specialization strategy** | Separate components per use case | Separate components per use case | Props + enhancers on one component; wrappers for complex cases |
| **Shared design language** | Consistent content rules | Consistent spacing/sizing/states | Consistent API (overrides pattern) |

---

## 2. Anatomy

### Wise text input anatomy

```
  [ label (max 3 words, noun) ]
  ┌─────────────────────────────┐
  │  value                      │
  └─────────────────────────────┘
  [ description (optional, 1 sentence) ]
```

- **Label**: Required, max 3 words, must be a noun (not a verb)
- **Placeholder**: NOT supported (research-backed decision -- users confuse placeholders with values, contrast issues)
- **Description**: Optional helper text, single sentence, only include if user research supports it
- **Optional indicator**: Shown when field is not required
- No documented prefix/suffix, lead/trailing icon, or character count for base text input

### eBay text field anatomy (8 elements)

```
  [ label* ]                          [ required (*) / optional indicator ]
  ┌──────────────────────────────────────────────────┐
  │ (lead icon) │ (prefix) │ value │ (suffix) │ (trailing icon / clear) │
  └──────────────────────────────────────────────────┘
  [ helper text / error text ]        [ character count ]
```

1. **Label** -- required, describes field purpose; can be visually hidden if another element acts as label
2. **Lead icon** -- optional, before input value
3. **Prefix** -- static text/symbol prepended (e.g., "$" for currency)
4. **Value** -- user-entered text
5. **Container** -- field background/border wrapper
6. **Suffix** -- static text/symbol appended (e.g., "cm", "kg")
7. **Trailing icon** -- optional, after input value (clear button when focused with content)
8. **Helper text** -- below field; conveys requirements/disclaimers; replaced by error message on validation failure

**Layout options**: Stacked (label above) or Floating (label inside, animates up on focus).

### Uber Base input anatomy

```
  [ FormControl: label ]
  ┌──────────────────────────────────────────────────┐
  │ (startEnhancer) │ input value │ (endEnhancer)    │
  └──────────────────────────────────────────────────┘
  [ FormControl: caption / error / positive ]
```

**Input sub-components** (all overridable):
- `Root` -- outermost container
- `StartEnhancer` -- any React node before input (e.g., "$", "@", icon)
- `InputContainer` -- inner container around the actual input element
- `Input` -- the native input element
- `EndEnhancer` -- any React node after input (e.g., ".00", icon)
- `Before` / `After` -- additional slots
- `ClearIcon` / `ClearIconContainer` -- clear button (when clearable=true)
- `MaskToggleButton` -- show/hide toggle (when type="password")

**FormControl sub-components**:
- `Label` -- rendered as `<label>`, linked via htmlFor
- `Caption` -- helper text; replaced by error/positive message
- `ControlContainer` -- wraps the child input

### Anatomy comparison

| Slot | Wise | eBay | Uber Base |
|---|---|---|---|
| **Label** | Built-in, max 3 words | Built-in, stacked or floating | Separate FormControl wrapper |
| **Placeholder** | Explicitly banned | Supported but discouraged | Supported (prop) |
| **Helper text** | "Description" (1 sentence) | "Helper text" (persistent or on-focus) | "Caption" via FormControl |
| **Error text** | Not detailed | Replaces helper text + error icon | Replaces caption via FormControl error prop |
| **Positive text** | Not documented | Not documented | Supported (positive prop on FormControl) |
| **Leading element** | Not documented | Lead icon | startEnhancer (any React node) |
| **Trailing element** | Show/hide on password only | Trailing icon / clear button | endEnhancer (any React node) |
| **Prefix** | Not documented | Static text (e.g., "$") | startEnhancer (renders as text) |
| **Suffix** | Not documented | Static text (e.g., "cm") | endEnhancer (renders as text) |
| **Character count** | Textarea only | Supported with real-time updates | Not built-in |
| **Required/optional indicator** | Optional indicator shown | Asterisk (*) or "(optional)" | Not built-in |
| **Floating label** | Not documented | Yes (animates up on focus) | Not built-in |

---

## 3. Sizes

### Wise

Sizes are not explicitly documented with pixel values for text inputs. The search input documentation mentions: "Use the size of the input to suggest how many characters a user should enter." No explicit small/medium/large size system is documented for text inputs.

### eBay

| Size | Height | Usage |
|---|---|---|
| **Small** | 40px | -- |
| **Large** | 48px (default, recommended) | Preferred for smaller screens |

Only 2 sizes for text fields. Search field has 3 sizes:

| Search size | Height | Tap target |
|---|---|---|
| **Small** (default) | 32px | 48px |
| **Medium** | 40px | 48px |
| **Large** | 48px | 48px |

Phone number: fixed 48px container height. Numeric stepper: Default + Large.

### Uber Base

| Size | Constant | Notes |
|---|---|---|
| **mini** | SIZE.mini | Smallest, very compact UI |
| **compact** | SIZE.compact | -- |
| **default** | SIZE.default | Standard size |
| **large** | SIZE.large | Most generous |

4 sizes. These same sizes apply to Input, Textarea, and all derived components.

### Size comparison

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Size count** | Not specified | 2 (text field), 3 (search) | 4 |
| **Smallest** | -- | 32px (search small) | mini |
| **Default** | -- | 48px (large) | default |
| **Largest** | -- | 48px | large |
| **Size naming** | -- | Small, Large | mini, compact, default, large |
| **Width constraints** | -- | Min 200px, max 480px (search) | -- |

---

## 4. States

### Wise

States are referenced but not detailed with visual specifications in the public documentation. The component pages focus on content guidelines rather than visual state specs. Inferred states: default, focused, filled, error, disabled.

### eBay

| State | Text field | Search field | Password | Phone |
|---|---|---|---|---|
| **Default** | Background visible, border subtle | Search icon visible | Same as text field | Country selector + input |
| **Active/focused** | Background removed, border strengthened, cursor visible | -- | Same as text field | -- |
| **Filled** | User text visible | Input text visible | Masked dots | Formatted number |
| **Error** | Error icon + message replaces helper text | -- | Error icon + message | Error via aria-describedby |
| **Disabled** | Non-focusable, no value submitted | -- | -- | -- |
| **Read-only** | Non-focusable, value visible, value submitted with form | -- | -- | -- |
| **Clearing** | Clear button as trailing icon when focused with content | Clear button replaces trailing accessory | -- | -- |

### Uber Base

| State | Prop | Visual effect |
|---|---|---|
| **Default** | -- | Standard appearance |
| **Error** | `error={true}` | Error border color, FormControl shows error caption |
| **Positive** | `positive={true}` | Positive/success border color, FormControl shows positive caption |
| **Disabled** | `disabled={true}` | Muted appearance, non-interactive |
| **Read-only** | `readOnly={true}` | Value visible but not editable |
| **Clearable** | `clearable={true}` | Clear icon appears with content; Escape key clears (configurable) |

### State comparison

| State | Wise | eBay | Uber Base |
|---|---|---|---|
| **Default** | Yes | Yes | Yes |
| **Focused** | Implied | Yes (bg removed, border strengthened) | Yes (theme-controlled) |
| **Filled** | Implied | Yes | Yes (via value prop) |
| **Error** | Yes (not detailed) | Yes (icon + message replaces helper) | Yes (error prop, boolean or string) |
| **Positive/success** | No | No | Yes (positive prop) |
| **Disabled** | Yes | Yes (no value submitted) | Yes |
| **Read-only** | No | Yes (value submitted) | Yes |
| **Loading** | No | No | No (not on input) |
| **Clearable** | No | Yes (trailing icon on focus) | Yes (dedicated prop + Escape key) |

---

## 5. Validation and error handling

### Wise

- Labels must clearly communicate expected input
- No detailed error handling patterns documented for inputs
- General principle: description text provides preventive guidance

### eBay

- **Error messages** replace helper text below the field
- **Error icon** prepends the error message for visual scanning
- Character count updates in real-time as a throttled ARIA live region
- Input formatting automatically adds pattern characters (slashes, dashes, spaces) for credit cards, SSNs, etc.
- Phone number validation occurs on blur -- formatting groups digits per country standards
- Helper text can display persistently or on focus only

### Uber Base

- **FormControl** handles all validation display
- `error` prop accepts boolean (shows generic error styling) or string (shows as caption text)
- `positive` prop works the same way for success state
- Validation logic is external -- the component only renders the state
- No built-in real-time validation; expected to be handled by the consumer

### Validation comparison

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Error message location** | Below field (implied) | Replaces helper text | FormControl caption area |
| **Error icon** | Not documented | Yes, prepends message | Yes, in FormControl |
| **Positive/success feedback** | No | No | Yes (positive prop) |
| **Real-time character count** | Textarea only | Yes with throttled ARIA live | No built-in |
| **Auto-formatting** | Not documented | Yes (credit card, SSN, phone) | MaskedInput sub-component |
| **Validation timing** | Not documented | On blur (phone), real-time (count) | Consumer-controlled |
| **Preventive guidance** | Description text | Helper text (persistent or on-focus) | Caption text |

---

## 6. Specialized input variants

### 6a. Password input

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Separate component?** | Yes (Password Input) | Yes (Password) | No (Input with type="password") |
| **Text masking** | Dots, hidden by default | Dots, hidden by default | Dots, hidden by default |
| **Show/hide toggle** | Built-in action icon | Trailing visibility toggle icon | Built-in MaskToggleButton |
| **Toggle behavior** | User-controlled | Icon shows action (reveal icon when concealed, hide icon when revealed) | Toggle button; customizable via overrides |
| **Strength indicator** | Not documented | Not documented | Not documented |
| **Autocomplete** | Not documented | Not documented | Defaults to autocomplete="new-password" |
| **Sizes** | Not specified | 48px and 40px | Same 4 sizes as Input |
| **Layouts** | Not specified | Stacked or floating label | -- |
| **Overflow** | Not documented | Content flows left to keep cursor visible; shifts to start on blur | Same as Input |

### 6b. Search input

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Separate component?** | Yes (Search Input) | Yes (Search Field) | No (not a separate component; use Input with search icon enhancer) |
| **Search icon** | Not detailed | Static lead icon, always visible | Consumer adds via startEnhancer |
| **Clear button** | Not detailed | Replaces trailing accessory when focused with text | clearable prop |
| **Cancel button** | Not documented | Optional, recommended in search views | Not built-in |
| **Search/submit button** | Not documented | Optional, for server requests | Not built-in |
| **Suggestions/autocomplete** | Not documented | Not detailed | Not built-in (use Combobox) |
| **Sizes** | Not specified | 3 sizes: 32px, 40px, 48px | Same 4 sizes as Input |
| **Width constraints** | Not specified | Min 200px, max 480px | -- |
| **Platform adaptation** | Not detailed | Small: full width near top. Native: real-time filter. Web: filters below | -- |

### 6c. Money/currency input

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Dedicated component?** | Yes (Money Input + Expressive Money Input) | No | No |
| **Currency selector** | Built-in dropdown trigger | -- (use prefix for "$") | -- (use startEnhancer) |
| **Currency format** | "[Code] [Name]" (e.g., "ARS Argentine Peso") | -- | -- |
| **Platform behavior** | Web: panel. Mobile web: bottom sheet. Mobile: full page | -- | -- |
| **Dynamic scaling** | Expressive variant: text scales down to fit | -- | -- |
| **Balance display** | Expressive variant: shows balance in empty state | -- | -- |
| **Read-only mode** | Disables currency selector for balance transfers | -- | -- |

### 6d. Phone input

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Dedicated component?** | No (not found) | Yes (Phone Number) | Yes (Phone Input) |
| **Country selector** | -- | Dropdown with indexed country list | Select dropdown with country flags |
| **Auto-formatting** | -- | Per-country digit grouping (e.g., US: "(234) 567-8900") | Country-based formatting |
| **Paste handling** | -- | Detects international code, removes from input, updates code display | -- |
| **Container height** | -- | 48px fixed | Same sizes as Input |
| **Platform behavior** | -- | Small native: fullscreen overlay. Small web: large sheet. Medium+: popover | -- |
| **Focusable elements** | -- | 2 (country selector + text field) | 2 (country select + input) |

### 6e. Date input

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Dedicated component?** | Yes (Date Input + Compact Date Input) | No | No (use Datepicker) |
| **Full date (d/m/y)** | Date Input | -- | Datepicker component |
| **Month/year only** | Compact Date Input | -- | -- |
| **Localization** | Sub-field order changes by locale | -- | -- |
| **Calendar picker** | Not documented | -- | Datepicker includes calendar |

### 6f. PIN/OTP input

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Dedicated component?** | No | No | Yes (Pin Code) |
| **Individual digit fields** | -- | -- | Yes (array of single-char inputs) |
| **Auto-advance** | -- | -- | Yes (moves to next field) |
| **Paste support** | -- | -- | Yes (distributes across fields) |

### 6g. Payment card input

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Dedicated component?** | No | No | Yes (Payment Card) |
| **Card type detection** | -- | -- | Detects Visa, Mastercard, Amex, etc. from number pattern |
| **Card icon** | -- | -- | Shows detected card brand icon |
| **Auto-formatting** | -- | Input formatting for card patterns | Built-in card number formatting |

### 6h. Numeric stepper

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Dedicated component?** | No | Yes (Numeric Stepper) | Yes (Stepper, but different purpose) |
| **Increment/decrement buttons** | -- | Yes (decrease + increase) | -- |
| **Min/max values** | -- | Configurable; min default 0, max optional | -- |
| **Delete behavior** | -- | Decrement at zero becomes delete (for cart items) | -- |
| **Direct text entry** | -- | Tap value to type custom number | -- |
| **Max width** | -- | 480px | -- |
| **Whole numbers only** | -- | Yes (no decimals) | -- |

### 6i. Combobox (input + filterable menu)

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Dedicated component?** | No | Yes (Combobox) | Yes (Combobox, separate from Select) |
| **Single-select** | -- | Collapses menu, sets value | Yes |
| **Multi-select** | -- | Input chips for each selection | Yes (via Select with multi) |
| **Autocomplete** | -- | Fills without complete typing | -- |
| **Create new values** | -- | "Create new" option with <=3 matches | Yes (creatable prop) |
| **Min/max width** | -- | 192px min, 480px max | -- |
| **Trigger** | -- | On focus or on input (configurable) | On focus |
| **Platform behavior** | -- | Native small: fullscreen modal. Web: popover | Popover |

### Specialized variant summary

| Variant type | Wise | eBay | Uber Base |
|---|---|---|---|
| **Text input** | Separate component | Separate component | Input |
| **Textarea** | Separate component | Separate component | Textarea |
| **Password** | Separate component | Separate component | Input type="password" |
| **Search** | Separate component | Separate component | Input + enhancers |
| **Money/currency** | 2 separate components | Not separate | Input + enhancers |
| **Phone** | -- | Separate component | PhoneInput |
| **Date** | 2 separate components | -- | Datepicker |
| **PIN/OTP** | -- | -- | PinCode |
| **Payment card** | -- | -- | PaymentCard |
| **Numeric stepper** | -- | Separate component | -- |
| **Combobox** | -- | Separate component | Combobox |
| **Dropdown/select** | -- | Separate component | Select (separate) |
| **Total input-family** | 8 | 8 | 7 (+ FormControl wrapper) |

---

## 7. Leading/trailing elements

### Wise

Leading and trailing elements are not prominently documented for the base text input. The money input has a built-in currency selector trigger and icon button. The password input has a built-in show/hide toggle. Wise's philosophy appears to handle specialized affordances through separate components rather than flexible slots.

### eBay

| Element | Position | Behavior | Examples |
|---|---|---|---|
| **Lead icon** | Before prefix/value | Static, reinforces purpose | Search icon, calendar icon |
| **Prefix** | Between lead icon and value | Static text/symbol | "$", "+1", "https://" |
| **Suffix** | After value | Static text/symbol | "cm", "kg", ".com" |
| **Trailing icon** | After suffix | Contextual; becomes clear button when focused with content | Clear X, dropdown chevron |
| **Camera button** | Search trailing | Alternative input method | Camera icon (search by image) |

### Uber Base

| Element | Prop | Accepts | Examples |
|---|---|---|---|
| **startEnhancer** | `startEnhancer` | Any React node or render function | `() => "$"`, `() => <Icon />`, `() => <Select />` |
| **endEnhancer** | `endEnhancer` | Any React node or render function | `() => ".00"`, `() => <Icon />`, `() => <Button />` |
| **Before** | Override slot | Any React node | Custom elements before input |
| **After** | Override slot | Any React node | Custom elements after input |

Uber also demonstrates combining Input with Select as start/end enhancers to create compound inputs (e.g., phone country code + number, currency + amount).

### Leading/trailing comparison

| Capability | Wise | eBay | Uber Base |
|---|---|---|---|
| **Leading icon** | Not on base input | Lead icon slot | startEnhancer |
| **Leading text** | Not on base input | Prefix slot ("$") | startEnhancer |
| **Trailing icon** | Password toggle only | Trailing icon slot | endEnhancer |
| **Trailing text** | Not on base input | Suffix slot ("cm") | endEnhancer |
| **Clear button** | Not on base input | Contextual trailing icon | clearable prop |
| **Embedded select** | Money input only (separate component) | Not documented | Demonstrated with enhancers |
| **Flexibility** | Purpose-built per component | Named slots (icon, prefix, suffix) | Any React node in enhancer slots |
| **Opinionation level** | High (separate components) | Medium (typed slots) | Low (anything goes) |

---

## 8. Spacing and dimensions

### eBay (most detailed)

| Measurement | Value |
|---|---|
| Label to container gap | 4px |
| Container to helper text gap | 8px |
| Container horizontal padding | 16px |
| Container vertical padding | 8px (textarea) |
| Small text field height | 40px |
| Large text field height | 48px |
| Search field min width | 200px |
| Search field max width | 480px |
| Combobox min width | 192px |
| Combobox/stepper max width | 480px |
| Dropdown min width | 2x height |
| Dropdown max width | 280px (menu) |

### Uber Base

Spacing is theme-controlled and uses scale tokens rather than fixed pixel values. Sizes are mini, compact, default, and large -- exact dimensions come from the theme.

### Wise

Specific spacing values are not published in the public component documentation.

---

## 9. Content guidelines

| Guideline | Wise | eBay | Uber Base |
|---|---|---|---|
| **Label length** | Max 3 words | "Succinctly describes" | No constraint |
| **Label grammar** | Noun, never a verb | Required for all fields | No constraint |
| **Placeholder** | Banned (research-backed) | Supported but discouraged; use helper text instead | Supported |
| **Helper text** | "Description", single sentence, only with user-research evidence | "Helper text", persistent or on-focus, conveys requirements | "Caption" via FormControl |
| **Error message style** | Not detailed | Concise, direct, replaces helper text | Replaces caption |
| **Required indicator** | "Optional" indicator for non-required | Asterisk (*) for required OR "(optional)" for non-required | Not built-in |
| **Character count** | Textarea only | Throttled ARIA live region | Not built-in |
| **Currency format** | "[Code] [Name]" e.g. "ARS Argentine Peso" | -- | -- |

---

## 10. Accessibility

| Aspect | Wise | eBay | Uber Base |
|---|---|---|---|
| **Label association** | Not detailed | Programmatic label via htmlFor | FormControl assigns htmlFor from child id |
| **Error announcement** | Not detailed | aria-describedby links error message | FormControl manages aria attributes |
| **Character count** | Not detailed | Throttled live region | Not built-in |
| **Placeholder vs label** | Placeholder banned | "Placeholder is not accessible for instructions" | Both supported |
| **Keyboard support** | Not detailed | Documented per component (Tab, Enter, Escape, Arrow keys) | clearOnEscape prop |
| **Touch targets** | Not detailed | 48px minimum tap target maintained across all search sizes | -- |
| **Screen reader** | Not detailed | Mask caution: "Read-aloud of masked value can sound strange" | Same caution on MaskedInput |
| **Focus management** | Not detailed | Focus documented per component | inputRef for programmatic focus |

---

## 11. Platform responsiveness

| Behavior | Wise | eBay | Uber Base |
|---|---|---|---|
| **Small screens** | Not detailed | Full width to margins; phone opens fullscreen overlay; search positioned near top | CSS responsibility |
| **Medium/large screens** | Not detailed | Aligned to grid; avoid full-page width | CSS responsibility |
| **Currency/country selector** | Web: panel. Mobile web: bottom sheet. Mobile: full page | Small native: fullscreen overlay. Small web: large sheet. Medium+: popover | Select dropdown |
| **Touch keyboard** | Not detailed | Numeric keyboard for phone | inputMode prop |
| **Resize (textarea)** | Not detailed | Browser-native, can be disabled | Not resizable by default; configurable via overrides |

---

## 12. Unique patterns and notable decisions

### Wise

1. **Placeholder ban**: The strongest stance of any system. Backed by research showing users confuse placeholders with values. All other systems support placeholders with varying degrees of discouragement.
2. **Separate Money Input components**: Two dedicated components (standard + expressive) for currency entry, reflecting Wise's core product domain (money transfers). No other system has this.
3. **Expressive money input scaling**: Dynamic text scaling where the value shrinks to fit available space. A product-specific pattern for transactional UIs.
4. **Compact Date Input vs Date Input**: Explicitly differentiating month/year entry from full-date entry. Other systems handle this through date picker variants.
5. **Content-first documentation**: Component pages focus heavily on content guidelines (label grammar, description usage) rather than visual specs or props lists.
6. **Platform availability tracking**: Each component page shows a table of which platforms (Android, iOS, Web) support the component.

### eBay

1. **8-element anatomy for text field**: The most detailed anatomy breakdown of any system. Explicitly names lead icon, prefix, suffix, trailing icon as separate slots.
2. **Floating label layout**: Animates label from inside the container to above on focus. Wise bans this; Uber Base does not support it natively.
3. **Stacked vs floating as layout option**: Both are available per-field; consistency within a form is required.
4. **Input auto-formatting**: Automatically inserts formatting characters (slashes, dashes, spaces) during typing for patterns like credit cards and SSNs.
5. **Trailing icon contextual swap**: The trailing icon area transforms into a clear button when the field is focused and contains text. Elegant dual-purpose slot.
6. **Numeric stepper delete behavior**: When min is 0, decrementing at zero converts the decrease button into a delete action (for shopping cart item removal).
7. **Search field trailing accessory**: Defaults to a camera button (search by image) that swaps to clear when text is present. Product-specific but well-considered.
8. **1000ms loading delay pattern**: Also present on eBay buttons. A consistent system-wide pattern for preventing UI flicker.
9. **Phone paste intelligence**: Pasting a complete international number detects the country code, removes it from the input value, and updates the country code selector.

### Uber Base

1. **FormControl separation**: The most architecturally clean approach -- Input handles input, FormControl handles labeling and validation display. Complete separation of concerns.
2. **Enhancer pattern**: startEnhancer and endEnhancer accept any React node, making the input infinitely extensible without new component types. Combined with Select to create phone/currency inputs.
3. **Positive state**: Unique among the three -- supports success/positive feedback on inputs, not just error.
4. **Override system**: Every sub-component (Root, InputContainer, Input, StartEnhancer, EndEnhancer, ClearIcon, MaskToggleButton) can be fully overridden with custom styles, props, or components.
5. **Clearable + clearOnEscape**: Dedicated props for clear behavior with keyboard shortcut. clearOnEscape defaults to true.
6. **Adjoined prop**: Allows grouping inputs side by side with shared borders (none, left, right, both). Useful for compound fields.
7. **PinCode as array of inputs**: PIN entry is an array of single-character inputs with auto-advance and paste distribution.
8. **PaymentCard with brand detection**: Detects card brand (Visa, Mastercard, Amex) from the number pattern and shows the appropriate icon.
9. **Password built into Input**: Rather than a separate component, `type="password"` on Input activates the MaskToggleButton automatically. Can be opted out via overrides.

---

## 13. Comparison with Aspora current state

From the component inventory audit (`lab/research/2026-03-18-component-inventory-audit.md`):

### Aspora input field status

| Platform | Component | Specialized variants |
|---|---|---|
| **Figma** | .boss_Input_Field_V2 | -- |
| **iOS** | `AsporaInputField` + legacy `P91TextField` | Date, email, phone, OTP, currency |
| **Android** | `InputV2` Compose + `PlusEditText` XML | Currency, code, PIN |

The Aspora codebase already has specialized input variants on both platforms (date, email, phone, OTP/PIN, currency). These map to the patterns seen across all three reference systems.

### Gap analysis

| Capability | Wise | eBay | Uber Base | Aspora current | Recommendation |
|---|---|---|---|---|---|
| **Base text input** | Yes | Yes | Yes | Yes (all platforms) | Solid foundation exists |
| **Textarea** | Yes | Yes | Yes | Not audited separately | Verify if textarea exists or is input with multiline |
| **Password** | Separate component | Separate component | Input type="password" | Likely via AsporaInputField | Determine: separate component or mode on base input |
| **Search** | Separate component | Separate component | Input + enhancers | `P91SearchBar` / `SearchInput` (separate) | Separate search component exists on both platforms |
| **Currency input** | 2 components | Via prefix slot | Via enhancer | iOS + Android variants exist | Product-critical; ensure parity |
| **Phone input** | Not found | Separate component | Separate component | iOS variant exists | Verify Android phone input |
| **Date input** | 2 components | Not separate | Datepicker | iOS variant exists | Verify Android date input |
| **OTP/PIN** | Not found | Not found | PinCode | iOS OTP + Android PIN/code | Both platforms have this |
| **Label** | Built-in | Built-in | FormControl wrapper | Unknown | Key architectural decision for Origin |
| **Helper/error text** | Built-in | Built-in | FormControl wrapper | Unknown | Key architectural decision for Origin |
| **Leading/trailing** | Per-component | Named slots | React node enhancers | Unknown | Key architectural decision for Origin |
| **Sizes** | Not specified | 2 (40px, 48px) | 4 (mini/compact/default/large) | 2 (implied from button: regular 52pt, small 36pt) | Align with button size system |
| **States** | Not detailed | 6 (default, active, filled, error, disabled, read-only) | 5 (default, error, positive, disabled, read-only) | Unknown | Audit existing state support |
| **Floating label** | Not supported | Supported | Not native | Unknown | Determine if needed |

---

## 14. Cross-system matrix summary

### Component architecture

| Decision | Wise | eBay | Uber Base | Recommendation for Origin |
|---|---|---|---|---|
| One component or many? | Many (8) | Many (8) | One base + wrappers (7) | Lean toward Uber's model: one base input with specialized wrappers for complex variants (phone, currency, PIN). Simpler API surface, fewer components to maintain |
| Label/error built-in? | Yes | Yes | No (FormControl) | Built-in. Native platforms (iOS/Android) benefit from integrated label/error. FormControl separation is a web-framework pattern |
| Floating label? | No | Yes | No | No. Wise bans it for accessibility. eBay supports it. Not critical for mobile-first |
| Placeholder? | Banned | Discouraged | Supported | Discourage. Follow Wise's research-backed guidance. Support the prop but document against use |

### Slot architecture

| Slot | Wise | eBay | Uber Base | Recommendation for Origin |
|---|---|---|---|---|
| Label | Built-in, max 3 words | Built-in, stacked/floating | FormControl | Built-in prop |
| Helper text | Built-in ("description") | Built-in ("helper text") | FormControl ("caption") | Built-in prop |
| Error text | Built-in (replaces helper) | Built-in (replaces helper + icon) | FormControl (replaces caption) | Built-in prop, replaces helper text |
| Leading icon | -- | Lead icon slot | startEnhancer | Named slot (leadingIcon) |
| Leading text | -- | Prefix slot | startEnhancer | Named slot (prefix) |
| Trailing icon | -- | Trailing icon slot | endEnhancer | Named slot (trailingIcon) |
| Trailing text | -- | Suffix slot | endEnhancer | Named slot (suffix) |
| Clear button | -- | Contextual trailing | clearable prop | Clearable prop (shows in trailing slot when active) |
| Character count | Textarea | Yes | -- | Built-in for textarea, optional for text input |

### Sizes

| Origin size | Maps to eBay | Maps to Uber |
|---|---|---|
| (single default size, TBD) | Large (48px) | default |
| (compact, if needed) | Small (40px) | compact |

### States

| State | Include in Origin? | Notes |
|---|---|---|
| Default | Yes | All systems |
| Focused | Yes | All systems (implied or explicit) |
| Filled | Yes | All systems |
| Error | Yes | All systems |
| Disabled | Yes | All systems |
| Read-only | Yes | eBay + Uber |
| Positive/success | Consider | Uber only, but useful for inline validation |
| Loading | No | Not standard for inputs |

### Specialized variants to support

| Variant | Priority | Rationale |
|---|---|---|
| Text input (single line) | P0 | Universal base |
| Textarea (multi line) | P0 | Universal |
| Password | P0 | Auth flows |
| Search | P1 | Exists on both platforms |
| Currency/money | P1 | Core Aspora product (financial) |
| Phone | P1 | Registration/verification |
| OTP/PIN | P1 | Verification flows, exists on both platforms |
| Date | P2 | Less common, platform date pickers available |
| Numeric stepper | P2 | eBay-only pattern |
| Combobox | P2 | Complex interaction, may be separate component family |

---

## Sources

- [Wise Text Input](https://wise.design/components/text-input)
- [Wise Text Area](https://wise.design/components/text-area)
- [Wise Money Input](https://wise.design/components/money-input)
- [Wise Expressive Money Input](https://wise.design/components/expressive-money-input)
- [Wise Password Input](https://wise.design/components/password-input)
- [Wise Search Input](https://wise.design/components/search-input)
- [Wise Compact Date Input](https://wise.design/components/compact-date-input)
- [Wise Date Input](https://wise.design/components/date-input)
- [eBay Text Field](https://playbook.ebay.com/design-system/text-field)
- [eBay Text Area](https://playbook.ebay.com/design-system/text-area)
- [eBay Search Field](https://playbook.ebay.com/design-system/search-field)
- [eBay Password](https://playbook.ebay.com/design-system/password)
- [eBay Phone Number](https://playbook.ebay.com/design-system/phone-number)
- [eBay Numeric Stepper](https://playbook.ebay.com/design-system/numeric-stepper)
- [eBay Combobox](https://playbook.ebay.com/design-system/combobox)
- [eBay Dropdown](https://playbook.ebay.com/design-system/dropdown)
- [Uber Base Web Input](https://baseweb.design/components/input/)
- [Uber Base Web Textarea](https://baseweb.design/components/textarea/)
- [Uber Base Web Phone Input](https://baseweb.design/components/phone-input/)
- [Uber Base Web Form Control](https://baseweb.design/components/form-control/)
- [Uber Base Web Pin Code](https://baseweb.design/components/pin-code/)
- [Uber Base Web Payment Card](https://baseweb.design/components/payment-card/)
- Origin component inventory: `lab/research/2026-03-18-component-inventory-audit.md`
- Origin button contract: `components/product/button.contract.json`
