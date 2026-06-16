# Origin Sync — Figma plugin design spec

## Date
2026-03-18

## Goal
Build "Origin Sync," a consolidated Figma plugin that pushes all foundation tokens from Origin into Figma as variables and text styles. Replaces the existing color-only plugin at `lab/figma-plugin/`. Provides a status dashboard with per-foundation diffs, per-foundation sync, and post-sync validation with manual step checklists.

## Source material
- Color tokens: `foundations/color/` (114 primitives, 48 semantics with light/dark modes)
- Typography tokens: `foundations/typography/` (38 primitives, 25 semantic composites)
- Spacing tokens: `foundations/spacing/` (12 primitives)
- Radius tokens: `foundations/radius/` (8 primitives)
- Figma API constraints: `lab/research/2026-03-18-figma-variable-collection-structures.md`
- Existing plugin: `lab/figma-plugin/` (color-only, to be replaced)

---

## Decisions

### Plugin identity
- **Name:** Origin Sync
- **Location:** `lab/origin-sync/` (new directory, not `lab/figma-plugin/`)
- **Replaces:** the existing color-only plugin at `lab/figma-plugin/`, which stays until Origin Sync is ready

### Collections

Five Figma variable collections, organized by foundation and visibility:

| Collection | Type | Published? | Modes | Variable Count |
|---|---|---|---|---|
| Color Primitives | COLOR | Hidden | No | 114 |
| Color | COLOR | Published | Light / Dark | 48 |
| Typography Primitives | FLOAT, STRING | Hidden | No | 30 |
| Spacing | FLOAT | Published | No | 12 |
| Radius | FLOAT | Published | No | 8 |

**Hidden** means `hiddenFromPublishing = true` on the collection. Variables exist in the source file but are not published to the library. Designers consuming the library only see published collections.

**Typography semantics** are 25 Figma text styles (not variables), created via `figma.createTextStyle()` with properties bound to Typography Primitives variables via `setBoundVariable()`.

**Why this structure:**
- Color primitives are hidden because designers consume semantic aliases, not raw ramp values.
- Typography primitives are hidden because designers consume text styles, not raw font sizes.
- Spacing and radius primitives are published directly — they ARE the designer-facing API (no semantic layer, per their specs).
- Color semantics get their own collection because they have modes (light/dark). No other foundation has modes.

### Upsert strategy

**Identity mechanism:** `setPluginData('tokenPath', '<path>')` on every variable and text style.

- `tokenPath` is derived from the JSON key structure in `foundations/` (e.g., `color.brand.maroon`, `typography.fontSize.300`, `spacing.16`)
- On sync, the plugin builds a lookup `{ tokenPath → figmaVariable/textStyle }` using `getPluginData('tokenPath')`
- Matching is by tokenPath, never by name. This means renames are safe — `variable.name` and `textStyle.name` are updated in place, preserving all bindings (Figma stores references by `id`, not `name`)
- Both `Variable` and `TextStyle` support `setPluginData` / `getPluginData`

**Adoption path for existing files:** `setPluginData` is private to a plugin ID. Origin Sync has a different manifest ID than the old color plugin at `lab/figma-plugin/`. If running Origin Sync against a file that was previously synced by the old plugin, the old plugin's `pluginData` is invisible. On first run, Origin Sync will find no tokenPath matches and treat all variables as new — creating duplicates alongside the old plugin's variables. **Recommended rollout: run Origin Sync against a clean Figma file** (or manually delete old-plugin variables first). The old plugin's variables carry no data that Origin Sync can adopt.

**Sync algorithm per foundation:**

1. Load baked-in tokens (from build-time imports)
2. Query existing Figma variables/styles via `getLocalVariablesAsync()` / `getLocalTextStylesAsync()`
3. Build lookup: `{ tokenPath → figmaArtifact }` from `getPluginData('tokenPath')`
4. Check for rename map in `migration/` (if any active renames)
5. For each token in code:
   - **Match by tokenPath** → update value, update name if different
   - **Match by old tokenPath** (via rename map) → update name, update tokenPath pluginData, update value
   - **No match** → create new, stamp tokenPath
6. For each Figma artifact with a tokenPath not in code → flag as **orphaned** (don't delete)

**Rename map** at `migration/figma-renames.json` (temporary):

```json
{
  "renames": {
    "color.brand.dark-maroon": "color.brand.maroon"
  }
}
```

Entries are removed after the rename has been synced. File is deleted when empty.

**Deletions:** Flag but never auto-delete. Orphaned variables/styles appear in the diff as warnings. User decides whether to remove manually. This prevents accidental breakage of components still referencing old variables.

### Token-to-Figma mapping

#### Color primitives → "Color Primitives" collection (hidden)

- 114 `COLOR` variables
- Source: `foundations/color/primitives.json`
- Names: `color/neutral/50`, `color/maroon/800`, `color/white-alpha/70`, etc.
- Scopes: `ALL_FILLS`, `STROKE_COLOR`
- No modes

#### Color semantics → "Color" collection (published, with modes)

- 48 `COLOR` variables aliasing primitives via `createVariableAlias()`
- Source: `foundations/color/semantic.light.json` + `foundations/color/semantic.dark.json`
- Two modes: Light, Dark
- Names: `color/surface/base`, `color/on-surface/primary`, `color/brand/maroon`, etc.
- Brand variables get descriptions with on-brand pairing guidance (set via `variable.description`)
- Cross-collection aliases: each semantic variable references a Color Primitives variable

Scopes per group:

| Group | Scopes |
|---|---|
| surface/* | `ALL_FILLS` |
| on-surface/* | `ALL_FILLS`, `TEXT_FILL` |
| border/* | `STROKE_COLOR` |
| interactive/* | `ALL_FILLS` |
| success/warning/error/info .base | `ALL_FILLS` |
| success/warning/error/info .subtle | `ALL_FILLS` |
| success/warning/error/info .text | `ALL_FILLS`, `TEXT_FILL` |
| success/warning/error/info .border | `STROKE_COLOR` |
| on-brand/* | `ALL_FILLS`, `TEXT_FILL` |
| overlay/* | `ALL_FILLS` |
| brand/* | `ALL_FILLS` |

Brand color descriptions:

| Variable | Description |
|---|---|
| `color/brand/maroon` | Pair with on-brand/light |
| `color/brand/crimson` | Pair with on-brand/light |
| `color/brand/teal` | Pair with on-brand/light |
| `color/brand/blue` | Pair with on-brand/light |
| `color/brand/peach` | Pair with on-brand/dark |
| `color/brand/gold` | Pair with on-brand/dark |
| `color/brand/lime` | Pair with on-brand/dark |

#### Typography primitives → "Typography Primitives" collection (hidden)

- 30 variables (not 38 — letter spacing excluded, see below)
- Source: `foundations/typography/primitives.json`
- 12 fontSize (`FLOAT`), 12 lineHeight (`FLOAT`), 5 fontWeight (`FLOAT`), 1 fontFamily (`STRING`)
- **Letter spacing (8 tokens) NOT pushed as variables.** Figma variables for letter spacing only support pixel units, not percentages. Our tokens use percentages. This is a known Figma limitation with no resolution. Letter spacing values are consumed directly from the JSON at text style creation time.
- Names: `typography/fontSize/100`, `typography/lineHeight/200`, `typography/fontWeight/regular`, `typography/fontFamily/primary`

Scopes per group:

| Group | Scopes |
|---|---|
| fontSize/* | `FONT_SIZE` |
| lineHeight/* | `LINE_HEIGHT` |
| fontWeight/* | `FONT_WEIGHT` |
| fontFamily/* | `FONT_FAMILY` |

#### Typography semantics → 25 text styles

- Created via `figma.createTextStyle()`
- Source: `foundations/typography/semantic.json`
- Properties bound to primitive variables via `setBoundVariable()`:
  - `fontSize` → fontSize variable (bound)
  - `lineHeight` → lineHeight variable (bound)
  - `fontWeight` → fontWeight variable (bound, accepts `FLOAT` numeric values like 400, 700)
  - `fontFamily` → fontFamily variable (bound, accepts `STRING` value "Haffer")
- Properties set directly (not variable-bound):
  - `letterSpacing` → set as `{ value: <number>, unit: "PERCENT" }` from token JSON (Figma variables don't support percentage letter spacing)
  - `textCase` → set directly per style (fixed value, not a variable concern)
  - `fontName` → set to `{ family: "Haffer", style: <weight> }` where the style string ("Heavy", "Bold", "SemiBold", "Medium", "Regular") is derived from the fontWeight value
- Organized into folders via path names: `Display/S`, `Header/M`, `Body/L`, `Number/Display-L`, `Overline/Standard`, etc.
- OpenType features (tnum on Number styles) require manual toggle — plugin cannot set `openTypeFeatures`

#### Spacing → "Spacing" collection (published)

- 12 `FLOAT` variables
- Source: `foundations/spacing/primitives.json`
- Names: `spacing/4`, `spacing/8`, `spacing/12`, ..., `spacing/80`
- Scopes: `GAP` (covers both gap and padding in Figma — there is no separate padding scope)
- Published directly — no hidden primitives, no semantic layer

#### Radius → "Radius" collection (published)

- 8 `FLOAT` variables
- Source: `foundations/radius/primitives.json`
- Names: `radius/4`, `radius/8`, ..., `radius/36`, `radius/full`
- Scopes: `CORNER_RADIUS`
- Published directly — no hidden primitives, no semantic layer
- `radius/full` has `$description` from the token file: "Fully rounded — produces pill/capsule shapes"

### Plugin UI

#### On launch — status dashboard

Plugin compares baked-in code tokens against current Figma state using tokenPath matching. Shows a per-foundation status:

| Foundation | Status | Details |
|---|---|---|
| Color | 3 changes | 2 renamed, 1 value changed |
| Typography | In sync | 25 styles, 30 variables |
| Spacing | 1 new | `spacing.64` added |
| Radius | In sync | 8 variables |

Each row expands to show individual changes:
- **New** — token in code, no matching tokenPath in Figma
- **Renamed** — tokenPath matches but name differs (via rename map)
- **Value changed** — tokenPath matches, name matches, value differs
- **Orphaned** — variable in Figma has tokenPath with no matching code token

#### Sync — per foundation

User clicks "Sync Color" / "Sync Typography" / etc. to push one foundation at a time. Each foundation syncs independently.

#### Post-sync — validation & checklist

After sync, the plugin runs automated checks and surfaces results:

**Automated checks (plugin verifies):**
- All expected tokenPaths exist as variables/styles in Figma
- All variable values match code values
- All aliases resolve (color semantic → primitive)
- All scopes are correctly set
- All descriptions are set (brand colors have pairing guidance)
- Text style properties bound to correct primitive variables (fontSize, lineHeight, fontWeight, fontFamily)
- Letter spacing set correctly as percentage values on text styles (not variable-bound)
- `hiddenFromPublishing` correct on each collection (hidden for Color Primitives + Typography Primitives, published for Color + Spacing + Radius)
- Haffer font available in the file — preflight checks every required family/style pair (`Haffer Regular`, `Haffer Medium`, `Haffer SemiBold`, `Haffer Bold`, `Haffer Heavy`) before typography sync. Surfaces clear error listing missing styles if any are unavailable.

**Manual checks (plugin surfaces as checklist):**
- Typography Number styles (6): tnum OpenType feature toggled
- Always shown for Number styles on every sync (automated tnum detection is fragile — simpler to always remind)

**Checklist behavior:**
- First sync: full checklist shown
- Subsequent syncs: only show items that appear incomplete or couldn't be verified
- Orphaned variables: listed with a warning, user decides whether to delete manually

**Status indicators per foundation:**
- **Synced** — all checks pass
- **Synced with warnings** — orphans exist, or manual steps pending
- **Out of sync** — values differ from code
- **Not yet synced** — no matching tokenPaths found in Figma

#### UI design
- Native-feeling Figma plugin aesthetic
- Follows Figma's own plugin design patterns and component styles

### Build architecture

**Token files baked in at build time** via Vite path aliases. The plugin imports JSON from `foundations/` — values are compiled into the plugin's JavaScript output. Rebuild required when tokens change.

```typescript
// vite.config.main.ts
resolve: {
  alias: {
    '@foundations': resolve(__dirname, '../../foundations')
  }
}

// In foundation sync files
import colorPrimitives from '@foundations/color/primitives.json'
import colorSemanticLight from '@foundations/color/semantic.light.json'
import colorSemanticDark from '@foundations/color/semantic.dark.json'
import typographyPrimitives from '@foundations/typography/primitives.json'
import typographySemantics from '@foundations/typography/semantic.json'
import spacingPrimitives from '@foundations/spacing/primitives.json'
import radiusPrimitives from '@foundations/radius/primitives.json'
```

Build scripts:
```
npm run build:ui      # Compile plugin UI
npm run build:main    # Compile plugin code (bakes in token values)
npm run build         # build:ui + build:main
```

### What this does NOT cover
- Foundation documentation page generation in Figma (deferred, separate tool — see `project_foundation_docs_gap` memory)
- Output generation (CSS, Tailwind, platform files) — separate workstream
- Auto-rebuild on token change — nice-to-have automation, not in v1
- Multi-file support — plugin runs against one Figma file (the source/library file)
- Variable deletion — orphans are flagged, never auto-deleted
- OpenType feature automation — tnum stays manual until Figma API supports writable `openTypeFeatures`
- Color accent/info decisions — deferred, plugin consumes whatever's in `foundations/`

---

## File structure

```
lab/origin-sync/
├── manifest.json              Plugin manifest (name: "Origin Sync")
├── package.json               Dependencies + build scripts
├── vite.config.main.ts        Build config for plugin code
├── vite.config.ui.ts          Build config for plugin UI
├── tsconfig.json              TypeScript config for UI
├── tsconfig.main.json         TypeScript config for plugin main
├── src/
│   ├── main/
│   │   ├── code.ts            Entry point — orchestrates sync
│   │   ├── collections.ts     Collection creation/lookup
│   │   ├── upsert.ts          Core upsert logic (tokenPath matching)
│   │   ├── diff.ts            Compares code tokens vs Figma state
│   │   ├── validate.ts        Post-sync validation checks
│   │   ├── foundations/
│   │   │   ├── color.ts       Color sync (primitives + semantics + modes + aliases)
│   │   │   ├── typography.ts  Typography sync (variables + text styles + bindings)
│   │   │   ├── spacing.ts     Spacing sync (standalone FLOAT variables)
│   │   │   └── radius.ts      Radius sync (standalone FLOAT variables)
│   │   └── config/
│   │       ├── scopes.ts      Scope assignments per token group
│   │       └── descriptions.ts Brand color pairing descriptions
│   ├── ui/
│   │   ├── index.html         Plugin UI shell
│   │   └── ui.ts              UI logic (dashboard, diff view, checklist)
│   └── shared/
│       └── messages.ts        IPC message types between main and UI
└── dist/                      Built output
```

---

## Token counts summary

| Foundation | Primitives (variables) | Semantics | Total Figma artifacts |
|---|---|---|---|
| Color | 114 COLOR variables | 48 COLOR variables (with modes) | 162 variables |
| Typography | 30 FLOAT/STRING variables | 25 text styles | 30 variables + 25 styles |
| Spacing | 12 FLOAT variables | — | 12 variables |
| Radius | 8 FLOAT variables | — | 8 variables |
| **Total** | **164 variables** | **48 variables + 25 styles** | **212 variables + 25 text styles** |

All well within Figma's 5,000 variables per collection limit. Pro plan supports 10 modes per collection — only Color uses modes (2: light/dark).

---

## Done when

- `lab/origin-sync/` builds and produces a working Figma plugin
- Plugin creates/updates all 5 variable collections with correct variable counts (114 + 48 + 30 + 12 + 8 = 212), types, and values
- Plugin creates/updates all 25 typography text styles with correct property bindings to primitive variables
- Color semantic variables correctly alias color primitive variables across collections
- Color semantic collection has Light and Dark modes with correct values per mode
- All variables have correct scopes per the scope config
- Brand color variables have pairing descriptions
- `radius/full` has its description from the token file
- Upsert matches by tokenPath pluginData, not by name
- Renames update variable/style names in place without breaking bindings
- Orphaned variables/styles are flagged in the UI, not auto-deleted
- Status dashboard shows per-foundation diff on launch
- Post-sync validation runs automated checks and surfaces manual checklist for tnum
- Plugin UI follows native Figma design patterns
- Existing `lab/figma-plugin/` left untouched until Origin Sync is validated
