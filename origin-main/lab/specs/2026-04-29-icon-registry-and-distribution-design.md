# Icon registry and distribution — design spec

**Status:** Draft — pending review
**Owner:** Hakeeb
**Related:** `lab/specs/2026-04-22-icon-system-and-migration-design.md` (Figma library + migration plugin)

## Goals

Replace the current S3-URL-based icon delivery flow (Figma export → S3 upload → backend sends URL → client renders remotely) with a registry-based system where backend sends stable icon IDs and clients resolve icons locally. This gives clients control over theming, sizing, and disabled states, removes the S3 upload bottleneck from development, and aligns Figma, backend, and all native platforms around a single set of identifiers.

## Scope

- All icons from the Central npm packages — every concept gets both outlined and filled variants uniformly, including brand/social icons.
- Flags, bank logos, brand logos, 3D icons, and other asset types are out of scope. They can follow the same pattern later with their own asset-type segment (e.g., `origin.flag.*`, `origin.bank.*`).

## Non-goals

- Platform-specific code generation (Swift enums, Kotlin sealed classes, TypeScript maps). Each platform team owns their own generation step from the manifest. Origin provides raw materials only.
- CDN/S3 deployment pipeline. CI can sync `outputs/icons/` to S3, but the pipeline configuration is not part of this spec.
- Figma export tooling. The Central npm packages contain the same icons with the same names as the Figma library — no Figma API access or export pipeline needed.

## Stable ID format

The icon ID is the contract between all systems — Figma, backend, iOS, Android, web.

**Format:** `origin.icon.{concept}.{variant}`

- `origin` — system namespace
- `icon` — asset type (future asset types get their own segment: `flag`, `bank`, etc.)
- `concept` — Central's kebab-case concept name, globally unique (e.g., `lock`, `arrow-right`, `eye-slash`)
- `variant` — `outlined` or `filled`

### Variant rules

Every icon produces exactly two IDs — one per variant. This includes brand/social icons (e.g., Instagram, GitHub) which render identically in both variants. The Central npm packages include both variants for all icons uniformly, so Origin mirrors this without special-casing.

### Examples

```
origin.icon.lock.outlined
origin.icon.lock.filled
origin.icon.arrow-right.outlined
origin.icon.arrow-right.filled
origin.icon.circle-info.outlined
origin.icon.circle-info.filled
origin.icon.instagram.outlined
origin.icon.instagram.filled
```

### Rules

- Backend sends the full ID string in API responses.
- Client parses the ID, resolves to the local asset, applies theme color, size, and disabled state.
- If backend doesn't need to specify variant, it sends `outlined` (the default per icon governance rules).

## Repository structure

### Manifest and guidelines

```
foundations/iconography/
  icons.json          ← manifest (source of truth for all icon metadata)
  guidelines.md       ← prose rules (already planned in the icon system spec)
```

### Generated outputs

```
outputs/icons/
  outlined/           ← all icon SVGs (filled=off variant)
    arrow-right.svg
    lock.svg
    instagram.svg
    ...
  filled/             ← all icon SVGs (filled=on variant)
    arrow-right.svg
    lock.svg
    instagram.svg
    ...
  keys.json           ← flat allowlist of every valid stable ID
```

### Build script

```
scripts/build-icons.mjs
```

Follows the existing Origin pattern: `foundations/ → scripts/ → outputs/`. Never hand-edit anything in `outputs/icons/`.

## Manifest schema

```json
{
  "id_format": "origin.icon.{id}.{variant}",
  "source": {
    "package": "@central-icons-react",
    "version": "0.0.4",
    "combo": {
      "join": "round",
      "radius": 1,
      "stroke": 2
    }
  },
  "icons": [
    {
      "id": "lock",
      "aliases": ["private"],
      "variants": {
        "outlined": "outputs/icons/outlined/lock.svg",
        "filled": "outputs/icons/filled/lock.svg"
      }
    },
    {
      "id": "instagram",
      "aliases": [],
      "variants": {
        "outlined": "outputs/icons/outlined/instagram.svg",
        "filled": "outputs/icons/filled/instagram.svg"
      }
    }
  ]
}
```

### Fields

| Field | Type | Description |
|---|---|---|
| `id_format` | string | Documents how stable IDs are constructed from manifest data |
| `source.package` | string | Central npm package scope |
| `source.version` | string | Pinned package version for reproducibility |
| `source.combo` | object | Locked Central combo parameters (join, radius, stroke) |
| `icons[].id` | string | Concept name — the third segment of the stable ID |
| `icons[].aliases` | string[] | Central's search synonyms (from ariaLabel in the npm package). Not used for resolution |
| `icons[].variants` | object | Map of variant name to SVG path in outputs. Keys are `outlined` and `filled` |

### What's deliberately excluded

- **Categories** — Central's 37 categories exist in Figma (as frame names) but are not encoded in the npm packages. Not worth maintaining a separate mapping. Icons are discoverable by id, aliases, and browsing the SVG directories.
- **Deprecation lifecycle** — Central names are stable and Origin is not renaming anything. Add when needed.
- **Figma component keys** — session-specific and stale across conversations.
- **CDN URLs** — derived downstream by whoever deploys to S3. Deterministic from the ID: `https://cdn.example.com/icons/{variant}/{concept}.svg`.

## Keys file

`outputs/icons/keys.json` is a flat allowlist of every valid stable ID, generated from the manifest:

```json
{
  "id_format": "origin.icon.{id}.{variant}",
  "keys": [
    "origin.icon.arrow-right.outlined",
    "origin.icon.arrow-right.filled",
    "origin.icon.circle-info.outlined",
    "origin.icon.circle-info.filled",
    "origin.icon.lock.outlined",
    "origin.icon.lock.filled",
    "origin.icon.instagram.outlined",
    "origin.icon.instagram.filled"
  ]
}
```

Backend pulls this file as their source of truth for validation. If an ID isn't in the list, it's invalid. No manual ID construction needed — pick from the list.

This artifact also feeds into:
- Backend enum/constant generation
- API response validation
- Internal search tooling

## Build pipeline

The build script (`scripts/build-icons.mjs`) reads from the Central npm packages and produces all outputs in one pass.

### Input

Two Central npm packages at the pinned version and locked combo:
- `@central-icons-react/round-outlined-radius-1-stroke-2` — outlined variants
- `@central-icons-react/round-filled-radius-1-stroke-2` — filled variants

Every icon exists in both packages — brand/social icons render identically in both, but are extracted uniformly without special-casing.

### Pipeline steps

1. Read every icon component from both packages using `renderToStaticMarkup` from `react-dom/server`.
2. Extract concept name and aliases from the `ariaLabel` attribute in the component source.
3. Strip the `Icon` prefix, recover original kebab-case name. Verify recovered names match the `ariaLabel` concept name.
4. Optimize all SVGs with SVGO (strip width/height attributes, keep viewBox, normalize paths).
5. Write SVGs to `outputs/icons/{variant}/{concept}.svg`.
6. Write `foundations/iconography/icons.json` (manifest).
7. Write `outputs/icons/keys.json` (stable ID allowlist, generated from manifest).

### Running it

```
npm run build:icons
```

Idempotent — safe to re-run. Overwrites outputs entirely. Diffable in PRs so changes are visible when the Central version is bumped.

## Platform consumption

The registry provides raw materials. Each platform generates their own type-safe wrappers.

### Backend

- Pulls `outputs/icons/keys.json` as an allowlist.
- Validates icon IDs against it before including in API responses.
- Sends the full stable ID string in response payloads.
- No SVGs needed server-side.

### iOS (SwiftUI)

- SVGs from `outputs/icons/` converted to Asset Catalog resources.
- A generated Swift enum from the manifest provides type-safe resolution.
- Paul regenerates the enum when icons are updated.

### Android (Compose + XML)

- SVGs from `outputs/icons/` converted to vector drawables.
- A generated Kotlin sealed class or enum provides type-safe resolution.
- Compose references the enum; XML legacy references drawables directly.
- Sergei regenerates from the manifest when icons are updated.

### Web

- Can use SVGs directly from the repo, from CDN, or from the npm package.
- A generated TypeScript map from the manifest if needed for validation.

### CDN/S3

- CI syncs `outputs/icons/` to S3.
- URL pattern derived from the ID: `https://cdn.example.com/icons/{variant}/{concept}.svg`.
- Backend doesn't store URLs — the URL is deterministic from the ID.

## Dev Mode discoverability

A developer looking at a Figma design may see generic layer names (`Icon`, `Leading icon`) rather than the Central concept name. The icon identity is always accessible via the component reference — it requires clicking into the nested instance in Dev Mode.

### Workflow (documented in guidelines.md)

1. **Click the icon instance in Dev Mode** — the component reference panel shows the component set name (e.g., `lock, private`). The first segment before the comma is the concept name → `origin.icon.lock.{variant}`.
2. **Search keys.json** — `grep lock outputs/icons/keys.json` returns the exact valid IDs.
3. **Browse outputs/icons/** — filenames are concept names. Visual scanning works for discovery.

No new tooling required. A short "For developers" section in `guidelines.md` covers this.

## Relationship to the icon system spec

This spec complements `lab/specs/2026-04-22-icon-system-and-migration-design.md`, which covers:
- The Figma library structure (Icons page, component sets, Style variant property)
- The migration plugin (replacing Hugeicons/Untitled-UI with Central)
- Icon governance rules (outlined vs. filled, size tokens, color binding)

This spec covers what happens after the Figma library exists — how icons flow from Figma/Central through Origin GitHub to all engineering consumers.

| Concern | Icon system spec | This spec |
|---|---|---|
| Figma library structure | Yes | No |
| Migration plugin | Yes | No |
| Governance rules (filled vs outlined) | Yes | No |
| Stable ID format | No | Yes |
| Manifest and SVG registry | No | Yes |
| Build pipeline | No | Yes |
| Platform consumption | No | Yes |
| Backend contract | No | Yes |

## Research basis

Approach informed by research into established design system icon registries:

- **Phosphor Icons** — richest manifest schema (`icons.ts` with id, aliases, categories, codepoints, versioning). Multi-platform distribution via git submodule. Variant subdirectory structure adopted for Origin.
- **Lucide Icons** — best deprecation lifecycle model (`deprecated`, `deprecationReason`, `toBeRemovedInVersion`). Deferred for Origin since Central names are stable.
- **GitHub Octicons** — hybrid sidecar + build manifest pattern. Figma plugin that pushes PRs.
- **Shopify Polaris** — SVGO optimization pipeline, YAML sidecar metadata, PascalCase stable IDs.
- **Google Material Symbols** — `asset_url_pattern` for deterministic CDN URLs from icon IDs. Category-namespaced version tracking.
- **Atlassian** — runtime facade for backward compatibility during migration. ESLint auto-fixer for 75% of callsite migrations.

Cross-cutting pattern: every system uses a stable string identifier as the backend-frontend contract, with kebab-case as the dominant convention.

## Open questions

1. **Central package version pinning strategy** — when Central releases a new version with additional icons, the workflow is: bump version in `package.json`, run `npm run build:icons`, review the diff, commit. Need to decide whether this is on a cadence or ad-hoc.
2. **SVG optimization settings** — SVGO config should strip width/height but preserve `currentColor` for theming and `viewBox` for scaling. Need to validate against a sample of Central SVGs to ensure the optimization doesn't break any icons.
3. **Count discrepancy** — the npm packages contain 1,977 icons per package, while the Figma library has ~1,812 system icons + 144 brand icons. The manifest will include everything from the npm package. Need to reconcile whether the extra icons are intentional or should be filtered.
