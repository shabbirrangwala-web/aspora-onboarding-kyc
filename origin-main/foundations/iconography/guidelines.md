# Iconography guidelines

Origin uses [Central](https://iconists.co/central) as its icon library. Every icon ships in two variants — outlined (`filled=off`) and filled (`filled=on`) — with a locked combo: `stroke=2, radius=1, join=round`.

## Icon registry

All icons are registered in Origin GitHub. The registry is the engineering source of truth.

### Stable ID format

```
origin.icon.{concept}.{variant}
```

- `origin.icon` — namespace and asset type
- `concept` — Central's kebab-case name, globally unique (e.g., `lock`, `arrow-right`, `eye-slash`)
- `variant` — `outlined` or `filled`

Examples: `origin.icon.lock.outlined`, `origin.icon.lock.filled`, `origin.icon.instagram.outlined`

### Registry files

| File | Purpose | Who uses it |
|---|---|---|
| `outputs/icons/keys.json` | Flat list of every valid stable ID | Backend — upload as allowlist for icon selection |
| `foundations/iconography/icons.json` | Manifest with IDs, aliases, and SVG paths | Client — resolve an ID to a local asset |
| `outputs/icons/outlined/*.svg` | Outlined variant SVGs | All platforms — source for native asset generation |
| `outputs/icons/filled/*.svg` | Filled variant SVGs | All platforms — source for native asset generation |

### Flow

1. Backend picks an ID from `keys.json` and sends it in the API response
2. Client receives the ID, resolves to the local asset using the manifest or a generated lookup (Swift enum, Kotlin sealed class, TypeScript map)
3. Client applies theme color, size, and disabled state locally

### Refreshing the registry

When the Figma library changes (new icons added, icons renamed):

```bash
cd lab/pipelines/icons
FIGMA_ACCESS_TOKEN=<token> node figma-export.mjs   # export from Figma → staging/
cd ../../..
npm run build:icons                                 # optimize + generate manifest + keys
npm run verify:icons                                # validate outputs
```

## For developers: finding an icon's stable ID

When looking at a Figma design, icon instances may have generic layer names (`Icon`, `Leading icon`) rather than the Central concept name.

1. **Click the icon instance in Dev Mode** — the component reference panel shows the component set name (e.g., `lock, private`). The first value before the comma is the concept name.
2. **Search keys.json** — `grep lock outputs/icons/keys.json` returns the exact valid IDs.
3. **Browse outputs/icons/** — filenames are concept names. Visual scanning works for discovery.
4. **Search the manifest** — `icons.json` has aliases for each icon. Search by alias if you don't know the canonical name.

## Variant selection rules

### Rule 1 — Variant is background-driven

Default is `filled=on`. The only background that uses `filled=off` is **neutral and bright** — the neutral-ramp surfaces used for body/page backgrounds and low-emphasis interactive fills.

**Outlined (`filled=off`) backgrounds:**
- `surface/primary`, `surface/secondary`, `surface/tertiary`, `surface/overlay`, `surface/sunken`, `surface/base`
- `interactive/secondary`, `interactive/disabled`

**Filled (`filled=on`) backgrounds — everything else:**
- Dark neutrals: `surface/contrast`, `interactive/primary`, `interactive/contrast`
- Tinted light: `error/light`, `success/light`, `warning/light`, `accent/light` (bright but carry hue)
- Solid: `error/solid`, `success/solid`, `accent/solid`, `warning/solid`
- Brand: `brand/maroon`, `brand/crimson`, `brand/teal`, `brand/blue`, `brand/peach`, `brand/gold`, `brand/lime`

### Rule 1b — Component-level override

Some components use `filled=on` across all variants for internal visual coherence. This is a component-team decision, not per-instance. Current opt-ins: **Tag**, **Alert**, **Avatar**.

### Rule 2 — Consistency within state-family axes

Apply Rule 1 per orthogonal axis (Hierarchy, Color, Type, Size). Enforce consistency within state-family axes (State, Status, Selected, Disabled, Active, Loading). All states in a family share the same `filled` value.

### Rule 3 — Default state is authoritative

The Default state's resolved background drives the whole state-family. Tertiary button's Default is transparent (light fallback) → `filled=off` for all states. Primary button's Default is dark → `filled=on` for all states.

### Rule 4 — Transparent containers: walk ancestors

For transparent or no-fill containers, walk upward from the icon to find the first ancestor with a visible solid fill. Resolve its bound variable to determine the background. If nothing visible to the page root, fall back to `surface/primary` → `filled=off`.

### Rule 5 — Instance-level override

When a component is placed on a non-default background (e.g., Tertiary button on a dark section), override the instance's `filled` property.

### Rule 6 — Size forces filled

If rendered size is **12px or smaller** or **40px or larger**, the icon is `filled=on` regardless of background.

| Size token | Variant |
|---|---|
| `asset-size/12` | `filled=on` always |
| `asset-size/16`, `/24`, `/32` | follows background (Rules 1–4) |
| `asset-size/40`, `/48`, `/64` | `filled=on` always |

### Rule 7 — Size bound to asset-size token

Every icon's width and height must be bound to an `asset-size/*` variable — never a literal value. Available sizes: 12, 16, 24, 32, 40, 48, 64. Default is 24.

## Background cheatsheet

```
filled=off  (neutral + bright only):
  surface/primary        neutral.50
  surface/base           neutral.50
  surface/secondary      neutral.100
  surface/tertiary       neutral.200
  surface/overlay        neutral.50
  surface/sunken         neutral.100/200
  interactive/secondary  neutral.100
  interactive/disabled   neutral.200

filled=on  (everything else):
  surface/contrast       neutral.1000
  interactive/primary    neutral.1000
  interactive/contrast   neutral.50 (on-dark)
  error/light            red.100
  success/light          green.100
  warning/light          yellow.100
  accent/light           blue.100
  error/solid            red.600
  success/solid          green.600
  accent/solid           blue.600
  warning/solid          yellow.300
  brand/maroon           maroon.800
  brand/crimson          crimson.600
  brand/teal             teal.600
  brand/blue             blue.600
  brand/peach            peach.300
  brand/gold             gold.400
  brand/lime             lime.300
```
