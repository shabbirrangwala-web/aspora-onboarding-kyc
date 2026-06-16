# Component taxonomy comparison

Last updated: 2026-03-24

Cross-system comparison of how major design systems categorize and organize their components. Focused on taxonomy structure, not individual component specs.

---

## Systems surveyed

| System | Owner | Component count | Category count | Category style |
|---|---|---|---|---|
| Material Design 3 | Google | ~28 | 6 | Functional (by user intent) |
| Carbon | IBM | ~126 packages | Flat (none) | Alphabetical with patterns separate |
| Polaris | Shopify | ~75 | 11 | Functional + structural |
| Spectrum | Adobe | ~100+ | Informal groupings | Mixed (by type and function) |
| Lightning (SLDS) | Salesforce | ~60 components + patterns | 2 top-level (components + patterns) | Alphabetical components, functional patterns |
| Atlassian Design | Atlassian | ~80 | 11 | Functional + structural |
| Primer | GitHub | ~75+ | 7-8 informal | Functional (loose) |

---

## Category-by-category breakdown

### Material Design 3

Six categories organized by **what the user is trying to do**:

| Category | Components | Count |
|---|---|---|
| **Actions** | Buttons, FABs, Extended FABs, Icon buttons, Segmented buttons | 5 |
| **Communication** | Badges, Progress indicators, Snackbars | 3 |
| **Containment** | Cards, Dialogs, Bottom sheets, Side sheets, Carousels, Tooltips, Lists, Dividers | 8 |
| **Navigation** | Navigation bar, Navigation drawer, Tabs, Bottom app bar, Top app bar | 5 |
| **Selection** | Checkboxes, Radio buttons, Chips, Switches, Sliders | 5 |
| **Text input** | Text fields | 1 |

**Notable**: Cleanest taxonomy of any major system. Purely intent-based. "Containment" is the broadest bucket, holding everything from Cards to Tooltips. Text input is its own category despite having only one component. No primitives concept at the component level (primitives live in the "styles" layer: color, typography, shape, motion, elevation).

### Carbon (IBM)

**No formal categories.** Components are listed alphabetically. Patterns are separate.

Components (~50 core, ~126 total packages including variants, skeletons, and fluid versions):
- Accordion, Breadcrumb, Button, Checkbox, Code snippet, Combo box, Contained list, Content switcher, Copy button, Data table, Date picker, Dialog, Dropdown, File uploader, Form, Grid, Inline loading, Layer, Link, List (ordered/unordered/structured), Loading, Menu, Modal, Multi-select, Notification, Number input, Overflow menu, Pagination, Popover, Progress bar, Progress indicator, Radio button, Search, Select, Slider, Stack, Structured list, Tabs, Tag, Text area, Text input, Tile, Time picker, Toggle, Toggletip, Tooltip, Tree view, UI Shell

Patterns are a separate concept covering cross-component flows: Dialogs, Empty states, Forms, Global header, Loading, Login, Notifications, Search, Status indicators.

**Notable**: Flat list, no grouping. "Fluid" variants (FluidTextInput, FluidDropdown, etc.) are separate packages. AI-specific variants (AILabel, AISkeleton) added as distinct components rather than variants. The UI Shell (header, side nav, footer) is treated as a single mega-component.

### Polaris (Shopify)

Eleven categories mixing functional purpose with structural role:

| Category | Components | Count |
|---|---|---|
| **Actions** | Button, ButtonGroup, Page actions | ~3 |
| **Layout and structure** | Box, BlockStack, Card, Columns, Divider, EmptyState, Grid, InlineGrid, InlineStack, Layout, LegacyCard, MediaCard, Page | ~13 |
| **Selection and input** | Autocomplete, Checkbox, ChoiceList, Combobox, ColorPicker, DatePicker, DropZone, Filters, Form, IndexFilters, InlineCode, Listbox, OptionList, RadioButton, RangeSlider, Select, Tag, TextField, ContextualSaveBar | ~17 |
| **Images and icons** | Avatar, Icon, KeyboardKey, Thumbnail, VideoThumbnail | ~5 |
| **Feedback indicators** | Banner, ExceptionList, Loading, ProgressBar, SkeletonBodyText, SkeletonDisplayText, SkeletonPage, SkeletonThumbnail, Spinner, Toast | ~10 |
| **Typography** | Text, DisplayText | ~2 |
| **Tables** | DataTable, IndexTable | ~2 |
| **Lists** | ActionList, DescriptionList, Listbox, ResourceList, ResourceItem | ~5 |
| **Navigation** | FooterHelp, Link, Navigation, Pagination, Tabs, TopBar | ~6 |
| **Overlays** | Modal, Popover, Sheet, Tooltip | ~4 |
| **Utilities** | AppProvider, Collapsible, Frame, Scrollable, Portal, VisuallyHidden | ~6 |

**Notable**: Explicit primitives in Layout (Box, BlockStack, InlineStack, InlineGrid, Grid). "Overlays" is its own top-level category. "Tables" and "Lists" are separate from each other and from "Layout." Has a clear "Utilities" bucket for non-visual infrastructure. Most categories in any major system (11).

### Spectrum (Adobe)

Spectrum does not publish a strict formal taxonomy on its documentation site (the site requires JavaScript rendering). From the Spectrum Web Components library, components fall into informal functional groupings:

| Informal group | Components |
|---|---|
| **Buttons and actions** | Button, Action button, Action group, Clear button, Close button, Button group, Infield button, Menu |
| **Form inputs** | Textfield, Textarea, Checkbox, Radio, Radio group, Switch, Number field, Color field, Search, Combobox, Picker |
| **Navigation** | Accordion, Breadcrumbs, Sidenav, Tabs, Top nav |
| **Overlays and dialogs** | Dialog, Alert dialog, Popover, Tooltip, Tray, Overlay, Underlay |
| **Data display and status** | Table, Card, Badge, Status light, Progress bar, Progress circle, Meter, Tags, Avatar, Illustrated message |
| **Color tools** | Color area, Color field, Color slider, Color wheel, Color handle, Color loupe, Swatch group |
| **Layout and structure** | Divider, Dropzone |
| **Media** | Asset, Icon, Link |

**Notable**: Rich color-picker component suite (7 color-specific components) reflecting Adobe's creative-tool focus. React Aria (the headless layer underneath) provides 50+ unstyled behavior hooks, separating interaction patterns from visual presentation. Spectrum 2 is in progress, adding platform-specific variants (desktop/mobile/web).

### Lightning Design System (Salesforce)

Two top-level concepts: **Components** and **Patterns**.

**Components** (~60, listed alphabetically): Accordion, Avatar, Badge, Breadcrumbs, Button, Button groups, Button icons, Cards, Carousel, Checkbox, Checkbox button, Checkbox toggle, Color picker, Combobox, Data table, Datepicker, Datetime picker, Dual listbox, Dynamic icons, Empty state, File selector, Form element, Icons, Input, Map, Menu, Modals, Pills, Progress bar, Progress indicator, Progress ring, Prompt, Radio button group, Radio group, Rich text editor, Scoped tabs, Select, Slider, Spinners, Tabs, Textarea, Timepicker, Toast, Tooltip, Tree, Tree grid, Vertical navigation.

**Patterns** (organized into functional subcategories):
| Pattern group | Contents |
|---|---|
| **Data** | Data entry, Displaying data, Data visualization (charts, metrics) |
| **Interaction** | Layout, Loading, Localization, Navigation, Rules/Filters/Logic |
| **Communication** | In-app feedback, Messaging UI, User engagement, System messaging |
| **Search** | Global search, In-context search |
| **Builder patterns** | Canvas, Click to create, Configuration, Connectors, Drag and drop, Header, Layout, Modals, Nodes, Panels, Popover, Validation, Zoom controls |

**Notable**: The **Builder patterns** subcategory is unique to Lightning, reflecting Salesforce's low-code builder tools. Components are flat/alphabetical but patterns are richly categorized. Status tags (New, Ready, In Progress, Deprecated) provide lifecycle metadata. "Prompt" is a distinct component (for confirmation dialogs), distinct from "Modals."

### Atlassian Design System

Eleven categories organized by **functional role**:

| Category | Components | Count |
|---|---|---|
| **Forms and input** | Button, Calendar, Checkbox, Comment, Date time picker, Dropdown menu, Focus ring, Form, Radio, Range, Select, Text area, Text field, Toggle | 14 |
| **Images and icons** | Avatar, Avatar group, Icon, Image, Logo, Object, Tile | ~7 |
| **Layout and structure** | Layout grid, Page, Page header, Page layout | ~4 |
| **Loading** | Progress bar, Skeleton, Spinner | 3 |
| **Messaging** | Banner, Flag, Inline message, Modal dialog, Spotlight, Section message | ~6 |
| **Navigation** | Breadcrumbs, Link, Menu, Navigation system, Pagination, Side navigation, Tabs | ~7 |
| **Overlays and layering** | Blanket, Drawer, Inline dialog, Popup, Tooltip | 5 |
| **Primitives** | Box, Pressable, Anchor, Inline, Stack, Flex, Grid, Bleed, XCSS, Responsive, Text, Focusable | ~12 |
| **Status indicators** | Badge, Empty state, Lozenge, Progress indicator, Progress tracker, Tag, Tag group | 7 |
| **Text and data display** | Code, Dynamic table, Heading, Inline edit, Table, Table tree, Visually hidden | ~7 |
| **Libraries and tooling** | CSS, CSS reset, Design tokens, Motion, Popper, Portal, App provider, ESLint plugin, Stylelint plugin | ~9 |

**Notable**: **Primitives is an explicit top-level category** containing layout building blocks (Box, Stack, Flex, Grid, Inline, Bleed) and semantic wrappers (Pressable, Anchor, Focusable). This is the clearest primitives-vs-compositions distinction of any system. "Messaging" rather than "Feedback" as the category name. "Overlays and layering" is its own category. "Libraries and tooling" category includes developer infrastructure (ESLint plugins, tokens package).

### Primer (GitHub)

Approximately 75+ components organized into loose functional groups:

| Group | Components |
|---|---|
| **Actions and selection** | ActionBar, ActionList, ActionMenu, Autocomplete, Button, ButtonGroup, Checkbox, CheckboxGroup, Radio, RadioGroup, SegmentedControl, Select, SelectPanel, ToggleSwitch |
| **Data and display** | Avatar, AvatarStack, CircleBadge, CounterLabel, DataTable, Label, LabelGroup, ProgressBar, StateLabel, Token, Truncate |
| **Navigation and layout** | Breadcrumbs, NavList, PageHeader, PageLayout, SplitPageLayout, UnderlineNav, UnderlinePanels, Pagination |
| **Overlays and floating** | AnchoredOverlay, Dialog, ConfirmationDialog, Overlay, Popover, Tooltip |
| **Text and input** | Heading, Text, TextInput, Textarea, TextInputWithTokens, Link |
| **Feedback and status** | Banner, Blankslate, InlineMessage, RelativeTime, Timeline |
| **Loading and structure** | Details, SkeletonAvatar, SkeletonBox, SkeletonText, Spinner, TreeView |
| **Specialized** | BranchName, FormControl, IconButton |

Also has a separate **Internal components** set (18 components for GitHub-specific features like DatePicker, MarkdownEditor, Filter) and supporting **Primitives** (color, size, typography tokens).

**Notable**: Merges "actions" and "selection" into one group. "Blankslate" is Primer's name for empty state. Has GitHub-specific components (BranchName, StateLabel) that would not exist in a generic system. Internal components are explicitly separated from public ones, providing a tier system.

---

## Cross-system category mapping

This table maps equivalent functional categories across all seven systems:

| Functional concept | Material 3 | Carbon | Polaris | Spectrum | Lightning | Atlassian | Primer |
|---|---|---|---|---|---|---|---|
| **Buttons/actions** | Actions | (flat) | Actions | Buttons/actions | (flat) | Forms and input | Actions/selection |
| **Form inputs** | Selection + Text input | (flat) | Selection and input | Form inputs | (flat) | Forms and input | Text and input |
| **Navigation** | Navigation | (flat) | Navigation | Navigation | (flat) | Navigation | Navigation/layout |
| **Overlays/modals** | Containment | (flat) | Overlays | Overlays/dialogs | (flat) | Overlays/layering | Overlays/floating |
| **Feedback/status** | Communication | (flat) | Feedback indicators | Data display/status | (flat) | Messaging + Status indicators | Feedback/status |
| **Data display** | Containment | (flat) | Tables + Lists | Data display/status | (flat) | Text/data display | Data/display |
| **Layout** | (styles layer) | (flat) | Layout and structure | Layout/structure | (flat) | Layout + Primitives | Navigation/layout |
| **Loading** | Communication | (flat) | Feedback indicators | Data display/status | (flat) | Loading | Loading/structure |
| **Primitives** | (styles layer) | (flat) | Layout primitives | (React Aria) | (flat) | **Primitives** | (separate) |
| **Patterns** | (separate) | Patterns | (separate) | (separate) | **Patterns** | (separate) | (separate) |

---

## Key patterns and observations

### 1. Two dominant organizational strategies

**Functional categories** (Material, Polaris, Atlassian, Primer): Group by what the component helps the user accomplish. Categories like "Actions," "Navigation," "Feedback," "Selection." This is the most common approach.

**Flat alphabetical + patterns** (Carbon, Lightning): No component-level categories. All components in one alphabetical list. Complexity is pushed into a separate "patterns" concept for cross-component guidance.

### 2. The universal categories

Five functional concepts appear in every system that uses categories:

1. **Actions** — Buttons and triggers (the thing you click to do something)
2. **Navigation** — Wayfinding (tabs, breadcrumbs, nav bars, links)
3. **Selection and input** — Forms and data entry (text fields, checkboxes, pickers)
4. **Feedback and status** — System communication (toasts, banners, progress, badges)
5. **Containment / overlays** — Things that hold other things (modals, sheets, cards, dialogs)

### 3. Where systems diverge

| Dimension | Divergent approaches |
|---|---|
| **Cards** | Material: Containment. Polaris: Layout and structure. Atlassian: (not a standalone component). |
| **Lists** | Polaris: Own category. Material: Containment. Atlassian: Text and data display. |
| **Tooltips** | Material: Containment. Atlassian: Overlays and layering. Polaris: Overlays. |
| **Loading** | Atlassian: Own category. Material: Communication. Polaris: Feedback indicators. |
| **Buttons** | Material: Actions. Atlassian: Forms and input. Most: Actions. |
| **Empty state** | Atlassian: Status indicators. Polaris: Layout. Lightning: Standalone component. |

### 4. Primitives handling

Three distinct approaches:

| Approach | Systems | How |
|---|---|---|
| **Explicit primitives category** | Atlassian | Box, Stack, Flex, Grid, Bleed, Inline, Pressable, Anchor as a named "Primitives" category |
| **Primitives embedded in layout** | Polaris | Box, BlockStack, InlineStack, Grid inside "Layout and structure" |
| **Primitives as a separate layer** | Material, Spectrum, Primer | Primitives are tokens/styles (Material), headless hooks (React Aria/Spectrum), or CSS utilities (Primer) — not components |
| **No explicit primitives** | Carbon, Lightning | Layout handled by Grid utility classes, not primitive components |

### 5. Patterns vs. components distinction

All systems separate patterns from components, but the boundary varies:

- **Carbon and Lightning**: Patterns are an explicit, richly categorized section of the documentation alongside the component list
- **Material**: Patterns are not in the component taxonomy; they appear under separate "Common layouts" and "Canonical layouts" sections
- **Atlassian and Polaris**: Patterns exist but are less prominent, mostly as usage guidance within component docs
- **Lightning is unique** with its "Builder patterns" subcategory for low-code canvas interactions

### 6. Category count sweet spot

| Category count | Systems |
|---|---|
| 6 | Material Design 3 |
| 7-8 | Primer (informal) |
| 11 | Polaris, Atlassian |
| 0 (flat) | Carbon, Lightning (components) |

Systems with 6-8 categories tend to have cleaner, more memorable taxonomies. Systems with 11 categories offer more precision but can split hairs (e.g., Polaris has separate "Tables" and "Lists" categories with 2-5 items each).

### 7. Product-specific components

Every enterprise system has product-specific components that break the generic taxonomy:

- **Primer**: BranchName, StateLabel (GitHub-specific)
- **Lightning**: Builder patterns, Prompt (Salesforce-specific)
- **Polaris**: IndexTable, IndexFilters, ResourceList (Shopify-specific)
- **Atlassian**: Lozenge, Flag, Spotlight (Atlassian-product-specific naming)

---

## Theoretical frameworks

### Atomic design (Brad Frost)

Five levels: Atoms, Molecules, Organisms, Templates, Pages.

- Atoms: Indivisible elements (button, input, label)
- Molecules: Simple combinations (search form = input + button)
- Organisms: Complex sections (header = logo + nav + search)
- Templates: Page-level layouts with placeholder content
- Pages: Templates with real content

**Real-world adoption**: Almost no major system uses the atoms/molecules/organisms naming. Material, Carbon, Polaris, and others use "components" as a flat term. The hierarchical *thinking* is widely adopted (primitives compose into components compose into patterns), but the specific vocabulary is not. Brad Frost himself states "atomic design is not rigid dogma" and endorses teams creating their own terminology.

GE's Predix system adapted Atomic Design into: Principles, Basics, Components, Templates, Features, Applications — replacing the chemistry metaphor with plain language.

### Nathan Curtis (EightShapes)

Key recommendations from "On classification in design systems":

1. **Three sections, not five**: Visual style, Components, Patterns
2. **Call everything "components"** — do not distinguish elements from components. A longer flat list with one search location beats a hierarchical taxonomy that creates ambiguity about which level something belongs to.
3. **Avoid metaphorical naming** — "Atoms and Molecules" creates a "layer of transformation that gets in the way." Use plain language (components, patterns).
4. **Allow nesting without taxonomy** — a component containing another component is normal, not a reason to create new classification levels.
5. **Categories should be tags, not folders** — the same component might reasonably appear in multiple categories. Functional categories are better than structural ones.

### Six functional categories model

Emerging consensus from multiple articles and systems:

1. **Actions** — Buttons, links, menus (things you click to make something happen)
2. **Inputs** — Text fields, selects, checkboxes, sliders (things that collect data)
3. **Navigation** — Tabs, breadcrumbs, nav bars, links (things that move you around)
4. **Feedback** — Toasts, banners, progress, modals (things that tell you something)
5. **Informational / display** — Cards, badges, avatars, lists (things that show you data)
6. **Structural** — Layout primitives, grids, dividers, containers (things that organize space)

This maps closely to Material's six categories (Actions, Selection, Text input, Navigation, Communication, Containment) and is the most common pattern across all systems.

---

## Scaling considerations

### What makes a taxonomy scale

Based on patterns observed across these seven systems:

1. **Fewer categories are better** — Material (6) is more navigable than Polaris (11). When categories have 2-3 items, they should probably merge.
2. **Functional over structural** — Categorizing by "what does this help the user do" works better than "what does this look like" or "how complex is this."
3. **Flat beats deep** — No major system uses more than one level of component categorization. Alphabetical within categories. Hierarchy comes from patterns, not nested component groups.
4. **Patterns are separate** — Every system separates component (the reusable building block) from pattern (the cross-component recipe). Mixing them in one taxonomy creates confusion.
5. **Primitives need a home** — Systems that explicitly name their primitives (Atlassian, Polaris) provide clearer guidance than systems where primitives are implicit or scattered.
6. **Status metadata matters** — Lightning and Atlassian tag components with lifecycle status (New, Beta, Stable, Deprecated). This is orthogonal to functional categories but critical for adoption.

### Common pitfalls

- **Too many categories**: Polaris's 11 categories include "Tables" (2 components) and "Typography" (2 components) — these could merge into adjacent categories.
- **Ambiguous boundaries**: Is a Tooltip feedback, an overlay, or containment? Material, Atlassian, and Polaris each answer differently.
- **Button placement**: Buttons are Actions in most systems but Forms in Atlassian — reflecting that buttons exist in both action and form contexts.
- **Overloading "Containment"**: Material puts Cards, Dialogs, Bottom sheets, Tooltips, Lists, and Dividers all in "Containment." The category is defined by what things *do* architecturally (hold other content) but the user intent for a Card vs a Modal is quite different.

---

## Sources

- [Material Design 3 components](https://m3.material.io/components) and [Android component overview](https://developer.android.com/design/ui/mobile/guides/components/material-overview)
- [Carbon Design System](https://carbondesignsystem.com/) and [GitHub component source](https://github.com/carbon-design-system/carbon)
- [Polaris (Shopify)](https://polaris-react.shopify.com/components)
- [Spectrum Web Components (Adobe)](https://opensource.adobe.com/spectrum-web-components/) and [React Aria](https://react-aria.adobe.com/)
- [Lightning Design System (Salesforce)](https://www.lightningdesignsystem.com/components/overview/)
- [Atlassian Design System](https://atlassian.design/components)
- [Primer (GitHub)](https://primer.style/components)
- [Atomic Design, chapter 2 — Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)
- [Extending Atomic Design — Brad Frost](https://bradfrost.com/blog/post/extending-atomic-design/)
- [On Classification in Design Systems — Nathan Curtis / EightShapes](https://eightshapes.com/articles/on-classification-in-design-systems/)
- [Benefits of Categorising Components By Use-Case — Nayaab Khan](https://dev.to/nayaabkhan/benefits-of-categorising-components-by-use-case-33g)
- [GE Predix Design System — Scaling Atomic Design](https://medium.com/ge-design/ges-predix-design-system-8236d47b0891)
