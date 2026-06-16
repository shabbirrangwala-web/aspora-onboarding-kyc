# Color-theory migration implementation plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate color-theory pipeline, tokens, and Figma plugin into Origin, converting token format from TypeScript to W3C DTCG JSON.

**Architecture:** Pipeline reads `foundations/color/anchors.json`, generates `foundations/color/primitives.json` in DTCG format. Semantic tokens are hand-authored DTCG files (`semantic.light.json`, `semantic.dark.json`). Figma plugin imports these JSON files at build time via Vite and pushes to Figma. Pipeline and plugin are separate packages connected through `foundations/color/` as the interface.

**Tech Stack:** TypeScript, Culori (OKLCH), Vite, Figma Plugin API

**Spec:** `lab/specs/2026-03-17-color-migration-design.md`

**Source project:** `/Users/hakeeb/Documents/Build/color-theory/scripts/figma-plugin/`

---

## File structure

### `foundations/color/`
- `anchors.json` — Brand hex inputs for pipeline (8 entries: neutral + 7 chromatic)
- `primitives.json` — Generated DTCG, 114 color variables across 10 ramps
- `semantic.light.json` — Hand-authored DTCG, 47 semantic tokens aliasing primitives (light mode)
- `semantic.dark.json` — Hand-authored DTCG, 47 semantic tokens aliasing primitives (dark mode)
- `guidelines.md` — Rationale, usage rules, accessibility

### `lab/pipelines/color/`
- `package.json` — culori, tsx, typescript
- `tsconfig.json` — TypeScript config for scripts
- `generate.ts` — OKLCH ramp generation, reads anchors.json, writes primitives.json
- `verify.ts` — Validates semantic files reference valid primitives

### `lab/figma-plugin/`
- `package.json` — @figma/plugin-typings, vite, vite-plugin-singlefile, tsx
- `tsconfig.json` — TypeScript config for UI
- `tsconfig.main.json` — TypeScript config for plugin main
- `vite.config.main.ts` — Build config for plugin code (with path alias for foundations)
- `vite.config.ui.ts` — Build config for plugin UI
- `manifest.json` — Figma plugin manifest
- `src/main/code.ts` — Plugin main logic, reads DTCG JSON, pushes to Figma
- `src/main/scope-config.ts` — Figma scope mappings by token group
- `src/ui/index.html` — Plugin UI
- `src/ui/ui.ts` — UI event handlers
- `src/shared/messages.ts` — IPC types

### `lab/viewer/`
- `color.html` — Interactive ramp builder (from color-theory outputs)

---

### Task 1: Create anchors.json

**Files:**
- Create: `foundations/color/anchors.json`

- [ ] **Step 1: Create anchors.json with brand color definitions**

```json
{
  "neutral": { "hex": "#680D0D", "isNeutral": true, "neutralChromaMax": 0.012 },
  "maroon":  { "hex": "#680D0D", "step": 800 },
  "crimson": { "hex": "#B33056", "step": 600 },
  "peach":   { "hex": "#FFAE92", "step": 300 },
  "gold":    { "hex": "#FAA810", "step": 400 },
  "lime":    { "hex": "#AFEA6A", "step": 300 },
  "teal":    { "hex": "#097E8D", "step": 600 },
  "blue":    { "hex": "#4E68F4", "step": 600 }
}
```

- [ ] **Step 2: Remove .gitkeep from foundations/color/**

```bash
rm foundations/color/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add foundations/color/anchors.json
git commit -m "feat(color): add brand anchor definitions"
```

---

### Task 2: Set up pipeline package and generate.ts

**Files:**
- Create: `lab/pipelines/color/package.json`
- Create: `lab/pipelines/color/tsconfig.json`
- Create: `lab/pipelines/color/generate.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@origin/pipeline-color",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "generate": "tsx generate.ts",
    "verify": "tsx verify.ts",
    "build": "npm run generate && npm run verify"
  },
  "devDependencies": {
    "culori": "^4.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["*.ts"]
}
```

- [ ] **Step 3: Create generate.ts**

Adapt from `/Users/hakeeb/Documents/Build/color-theory/scripts/figma-plugin/scripts/generate-colors.ts`. Key changes:
- Read anchors from `foundations/color/anchors.json` instead of hardcoded `BRAND_COLORS`
- Output DTCG JSON to `foundations/color/primitives.json` instead of TypeScript
- DTCG format: `{ "color": { "$type": "color", "<ramp>": { "<step>": { "$value": "#hex" } } } }`
- Anchor steps get `"$description": "Brand anchor"`
- Alpha ramps use hex8 format (e.g., `#ffffffb3` for 70% white)
- All generation logic (OKLCH math, Culori, lightness map, chroma curves) stays identical

The script should:
1. Read and parse `../../../foundations/color/anchors.json` (resolve path relative to script — 3 levels up from `lab/pipelines/color/`)
2. Generate chromatic ramps using the same algorithm as color-theory
3. Generate alpha ramps (white-alpha, black-alpha) with fixed steps [100, 70, 40, 16, 8]
4. Write `../../../foundations/color/primitives.json` in DTCG format
5. Print summary (ramp count, color count, anchor verification)

- [ ] **Step 4: Install dependencies**

```bash
cd lab/pipelines/color && npm install
```

- [ ] **Step 5: Run generate and verify output**

```bash
cd lab/pipelines/color && npm run generate
```

Expected: `foundations/color/primitives.json` created with 10 ramps, 114 colors. Verify hex values match color-theory's `generated-colors.ts` for a few spot checks:
- `neutral/50` = `#ffffff`
- `maroon/800` = `#680d0d` (anchor)
- `crimson/600` = `#b33056` (anchor)
- `peach/300` = `#ffae92` (anchor)

- [ ] **Step 6: Remove .gitkeep from lab/pipelines/**

```bash
rm lab/pipelines/.gitkeep
```

- [ ] **Step 7: Commit**

```bash
git add lab/pipelines/color/ foundations/color/primitives.json
git commit -m "feat(color): add OKLCH generation pipeline, produce DTCG primitives"
```

Note: `npm install` generates `package-lock.json` — include it in the commit. The root `.gitignore` does not exclude lockfiles.

---

### Task 3: Create semantic token files

**Files:**
- Create: `foundations/color/semantic.light.json`
- Create: `foundations/color/semantic.dark.json`

- [ ] **Step 1: Create semantic.light.json**

Convert the `lightRef` values from `/Users/hakeeb/Documents/Build/color-theory/scripts/figma-plugin/src/main/tokens.ts` into DTCG alias format. All 47 tokens. Structure:

```json
{
  "color": {
    "$type": "color",
    "surface": {
      "base":     { "$value": "{color.neutral.50}" },
      "raised":   { "$value": "{color.neutral.100}" },
      "sunken":   { "$value": "{color.neutral.200}" },
      "overlay":  { "$value": "{color.neutral.50}" },
      "contrast": { "$value": "{color.neutral.1000}" }
    },
    "on-surface": { ... },
    "border": { ... },
    "interactive": { ... },
    "success": { ... },
    "warning": { ... },
    "error": { ... },
    "info": { ... },
    "on-brand": { ... },
    "brand": { ... }
  }
}
```

Reference for all 47 tokens: source `tokens.ts` lines 14-85. Use `lightRef` values, converting `ramp/step` to DTCG path `{color.ramp.step}`. For alpha ramps: `white-alpha/100` becomes `{color.white-alpha.100}`.

- [ ] **Step 2: Create semantic.dark.json**

Same structure as light, but use `darkRef` values from `tokens.ts`.

- [ ] **Step 3: Commit**

```bash
git add foundations/color/semantic.light.json foundations/color/semantic.dark.json
git commit -m "feat(color): add semantic token files in DTCG format (light + dark)"
```

---

### Task 4: Create verify.ts

**Files:**
- Create: `lab/pipelines/color/verify.ts`

- [ ] **Step 1: Create verify.ts**

Adapt from `/Users/hakeeb/Documents/Build/color-theory/scripts/figma-plugin/scripts/verify.ts`. Key changes:
- Read `../../../foundations/color/primitives.json` instead of importing TypeScript (3 levels up from `lab/pipelines/color/`)
- Read `../../../foundations/color/semantic.light.json` and `semantic.dark.json` instead of importing `SEMANTIC_TOKENS`
- Parse DTCG format to extract primitive variable names and semantic alias references

Verification checks (all must pass):
1. **Primitive alias resolution**: Every `{color.ramp.step}` reference in both semantic files resolves to a real primitive in `primitives.json`
2. **Exact semantic token paths**: Verify every expected token path exists in both semantic files. Hardcode the full list of 47 expected paths (e.g., `surface/base`, `on-surface/primary`, `border/default`, etc.) and fail if any are missing or extra tokens appear. This catches renames and omissions.
3. **Per-ramp step validation**: Each chromatic ramp must have exactly 13 steps matching [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 975, 1000]. Each alpha ramp must have exactly 5 steps matching [100, 70, 40, 16, 8]. Fail if any ramp has wrong step count or wrong step values.
4. **Aggregate counts**: 114 total primitives, 47 semantic tokens in each mode file
5. **Group presence**: All 10 expected groups present: surface, on-surface, border, interactive, success, warning, error, info, on-brand, brand
6. **Anchor verification**: Anchor hex values match `anchors.json` entries
7. **Semantic parity**: Light and dark files must have identical token paths (same keys, different values)
8. **Scope coverage**: Read `lab/figma-plugin/src/main/scope-config.ts` (import or parse), verify every semantic token group has a scope mapping in `SCOPE_MAP`. Fail if any group would fall through to the default. This prevents silently widened scopes from typos or renamed groups.
- Exit with code 1 on errors

- [ ] **Step 2: Run verify**

```bash
cd lab/pipelines/color && npm run verify
```

Expected: `PASSED: All checks green.`

- [ ] **Step 3: Run full pipeline build**

```bash
cd lab/pipelines/color && npm run build
```

Expected: generate succeeds, verify passes.

- [ ] **Step 4: Commit**

```bash
git add lab/pipelines/color/verify.ts
git commit -m "feat(color): add DTCG token verification script"
```

---

### Task 5: Set up Figma plugin package

**Files:**
- Create: `lab/figma-plugin/package.json`
- Create: `lab/figma-plugin/tsconfig.json`
- Create: `lab/figma-plugin/tsconfig.main.json`
- Create: `lab/figma-plugin/manifest.json`
- Create: `lab/figma-plugin/vite.config.main.ts`
- Create: `lab/figma-plugin/vite.config.ui.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@origin/figma-plugin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build:ui": "vite build --config vite.config.ui.ts",
    "build:main": "vite build --config vite.config.main.ts",
    "build": "npm run build:ui && npm run build:main"
  },
  "devDependencies": {
    "@figma/plugin-typings": "^1.104.0",
    "typescript": "^5.7.0",
    "vite": "^6.1.0",
    "vite-plugin-singlefile": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json** (for UI code)

Copy from source. Same content:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@shared/*": ["./src/shared/*"]
    }
  },
  "include": ["src/ui/**/*", "src/shared/**/*"]
}
```

- [ ] **Step 3: Create tsconfig.main.json** (for plugin main code)

Copy from source, add path for foundations:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@shared/*": ["./src/shared/*"],
      "@foundations/*": ["../../foundations/*"]
    }
  },
  "include": ["src/main/**/*", "src/shared/**/*"],
  "files": ["node_modules/@figma/plugin-typings/index.d.ts"]
}
```

- [ ] **Step 4: Create manifest.json**

```json
{
  "name": "Origin Design System",
  "id": "origin-design-system-001",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/index.html",
  "editorType": ["figma"]
}
```

- [ ] **Step 5: Create vite.config.main.ts**

Add `@foundations` path alias pointing to `../../foundations`:
```typescript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
    target: "es2017",
    lib: {
      entry: resolve(__dirname, "src/main/code.ts"),
      formats: ["iife"],
      name: "code",
      fileName: () => "code.js",
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        extend: true,
      },
    },
    sourcemap: false,
    minify: "esbuild",
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@foundations": resolve(__dirname, "../../foundations"),
    },
  },
});
```

- [ ] **Step 6: Create vite.config.ui.ts**

Copy from source unchanged:
```typescript
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

export default defineConfig({
  plugins: [viteSingleFile()],
  root: resolve(__dirname, "src/ui"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
    target: "esnext",
    assetsInlineLimit: Infinity,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(__dirname, "src/ui/index.html"),
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
});
```

- [ ] **Step 7: Remove .gitkeep from lab/figma-plugin/**

```bash
rm lab/figma-plugin/.gitkeep
```

- [ ] **Step 8: Install dependencies**

```bash
cd lab/figma-plugin && npm install
```

- [ ] **Step 9: Commit**

```bash
git add lab/figma-plugin/package.json lab/figma-plugin/package-lock.json lab/figma-plugin/tsconfig.json lab/figma-plugin/tsconfig.main.json lab/figma-plugin/manifest.json lab/figma-plugin/vite.config.main.ts lab/figma-plugin/vite.config.ui.ts
git commit -m "feat(figma): set up plugin package with Vite build config"
```

---

### Task 6: Create plugin source files

**Files:**
- Create: `lab/figma-plugin/src/shared/messages.ts`
- Create: `lab/figma-plugin/src/main/scope-config.ts`
- Create: `lab/figma-plugin/src/main/code.ts`
- Create: `lab/figma-plugin/src/ui/index.html`
- Create: `lab/figma-plugin/src/ui/ui.ts`

- [ ] **Step 1: Copy messages.ts unchanged**

Copy from `/Users/hakeeb/Documents/Build/color-theory/scripts/figma-plugin/src/shared/messages.ts`. No changes needed — IPC contract is the same.

- [ ] **Step 2: Create scope-config.ts**

Extract scope mappings from old `tokens.ts`. Group-level rules:

```typescript
// Figma variable scope mappings by token group.
// Applied by the plugin when creating/updating semantic variables.

export const SCOPE_MAP: Record<string, string[]> = {
  "surface":     ["ALL_FILLS"],
  "on-surface":  ["ALL_SCOPES"],
  "border":      ["STROKE_COLOR"],
  "interactive": ["ALL_FILLS"],
  "success":     ["ALL_SCOPES"],
  "warning":     ["ALL_SCOPES"],
  "error":       ["ALL_SCOPES"],
  "info":        ["ALL_SCOPES"],
  "on-brand":    ["ALL_SCOPES"],
  "brand":       ["ALL_FILLS"],
};

export function getScopesForToken(tokenPath: string): string[] {
  const group = tokenPath.split("/")[0];
  return SCOPE_MAP[group] || ["ALL_SCOPES"];
}
```

- [ ] **Step 3: Create code.ts**

Adapt from `/Users/hakeeb/Documents/Build/color-theory/scripts/figma-plugin/src/main/code.ts`. Key changes:

1. Replace `import { RAMPS } from "./generated-colors"` with `import primitives from "@foundations/color/primitives.json"`
2. Replace `import { SEMANTIC_TOKENS } from "./tokens"` with `import lightTokens from "@foundations/color/semantic.light.json"` and `import darkTokens from "@foundations/color/semantic.dark.json"`
3. Import `getScopesForToken` from `./scope-config`
4. Parse DTCG primitives: iterate `primitives.color` groups, extract `$value` hex strings, convert hex to RGBA for Figma
5. Parse DTCG semantics: iterate token groups, extract `$value` alias references (e.g., `{color.neutral.50}`), resolve to primitive variable names (`neutral/50`)
6. Use `getScopesForToken(tokenPath)` instead of reading scopes from token data
7. All Figma API logic (upsert, collections, modes, aliases) stays the same

Helper function needed to convert hex to Figma RGBA:
```typescript
function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}
```

Helper to resolve DTCG alias reference to primitive variable name:
```typescript
function resolveAlias(ref: string): string {
  // "{color.neutral.50}" -> "neutral/50"
  const match = ref.match(/^\{color\.(.+)\.(\d+)\}$/);
  if (!match) throw new Error(`Invalid alias reference: ${ref}`);
  return `${match[1]}/${match[2]}`;
}
```

Helper to flatten DTCG semantic file into array of { path, ref }:
```typescript
interface SemanticEntry { path: string; ref: string; }

function flattenSemanticTokens(dtcg: any): SemanticEntry[] {
  const entries: SemanticEntry[] = [];
  const groups = dtcg.color;
  for (const [groupName, group] of Object.entries(groups)) {
    if (groupName.startsWith("$")) continue; // skip $type etc
    for (const [tokenName, token] of Object.entries(group as any)) {
      if (tokenName.startsWith("$")) continue;
      entries.push({
        path: `${groupName}/${tokenName}`,
        ref: (token as any).$value,
      });
    }
  }
  return entries;
}
```

- [ ] **Step 4: Copy UI files unchanged**

Copy `src/ui/index.html` and `src/ui/ui.ts` from source. Update the plugin name in `index.html`:
- Change `<h1>Aspora Color Setup</h1>` to `<h1>Origin Design System</h1>`
- Update primitives count from `104` to `114` in the summary card

- [ ] **Step 5: Build the plugin**

```bash
cd lab/figma-plugin && npm run build
```

Expected: `dist/code.js` and `dist/index.html` created without errors.

- [ ] **Step 6: Commit**

```bash
git add lab/figma-plugin/src/
git commit -m "feat(figma): add plugin source with DTCG JSON support"
```

---

### Task 7: Add color.html viewer

**Files:**
- Copy: `color-theory/outputs/color-system.html` → `lab/viewer/color.html`

- [ ] **Step 1: Copy the ramp builder**

```bash
cp /Users/hakeeb/Documents/Build/color-theory/outputs/color-system.html lab/viewer/color.html
```

- [ ] **Step 2: Update branding from Aspora to Origin**

Search the copied file for Aspora-specific branding and update:
- Page title and header references to "Aspora" → "Origin"
- Export filenames (e.g., `aspora-color-system.json` → `origin-color-system.json`)
- Any other Aspora-branded strings in the HTML

- [ ] **Step 3: Remove .gitkeep from lab/viewer/**

```bash
rm lab/viewer/.gitkeep
```

- [ ] **Step 4: Verify it loads**

```bash
open lab/viewer/color.html
```

Expected: Opens in browser, ramps display correctly, all tabs work. Title shows "Origin" not "Aspora".

- [ ] **Step 5: Commit**

```bash
git add lab/viewer/color.html
git commit -m "feat(viewer): add interactive color ramp builder"
```

---

### Task 8: Add color guidelines

**Files:**
- Create: `foundations/color/guidelines.md`

- [ ] **Step 1: Write guidelines.md**

Content sourced from color-theory's CLAUDE.md and design doc (`docs/plans/2026-03-05-color-system-design.md`). Should cover:

- **Color model**: OKLCH for perceptual uniformity. Why not HSL (uneven lightness).
- **Ramp structure**: 13 steps (50-1000), lightness-driven, chroma tapers at extremes
- **Brand anchors**: Each chromatic ramp has one step forced to the exact brand hex
- **Neutral ramp**: Warm gray derived from maroon hue, max chroma 0.012. Not cold gray.
- **Alpha ramps**: white-alpha and black-alpha at 5 opacity levels (100/70/40/16/8). Used for on-brand text layers.
- **Semantic tokens**: 47 tokens in 10 groups. Light and dark mode via separate files.
- **Accessibility**: Step 600 is "text-safe" step for chromatic colors on white (4.5:1 WCAG AA). Step 300 for text on dark backgrounds.
- **Usage rules**: Use semantic tokens, not primitives. Primitives are hidden in Figma.

- [ ] **Step 2: Commit**

```bash
git add foundations/color/guidelines.md
git commit -m "docs(color): add color foundation guidelines"
```

---

### Task 9: Add .gitignore entries and final verification

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add node_modules and dist ignores for lab subdirectories**

The root `.gitignore` already has `node_modules/` and `dist/` which will apply recursively. Verify this works:

```bash
ls lab/pipelines/color/node_modules/ > /dev/null 2>&1 && echo "node_modules exists"
git status lab/pipelines/color/node_modules/
```

Expected: `node_modules` should not appear in git status (covered by root `.gitignore`).

- [ ] **Step 2: Run full pipeline**

```bash
cd lab/pipelines/color && npm run build
```

Expected: `PASSED: All checks green.`

- [ ] **Step 3: Build Figma plugin**

```bash
cd lab/figma-plugin && npm run build
```

Expected: `dist/code.js` and `dist/index.html` built successfully.

- [ ] **Step 4: Verify foundations/color/ has all expected files**

```bash
ls -la foundations/color/
```

Expected: `anchors.json`, `primitives.json`, `semantic.light.json`, `semantic.dark.json`, `guidelines.md`

- [ ] **Step 5: Run snapshot validation**

Run a script that compares the migrated output against the ground truth snapshot at `lab/pipelines/color/expected-output.json`. This validates:

1. **Every primitive hex matches exactly** — compare each `ramp.step` hex value from `primitives.json` (parsed from DTCG `$value`) against `expected-output.json.primitives`. All 114 values must match. Fail with diff on any mismatch.
2. **Every semantic alias matches exactly** — compare each semantic token path and its resolved primitive reference from `semantic.light.json` and `semantic.dark.json` against `expected-output.json.semantics`. All 47 light and 47 dark mappings must match. Fail with diff on any mismatch.
3. **Anchor verification** — compare anchors from the generated primitives (entries marked with `"$description": "Brand anchor"`) against `expected-output.json.anchors`. All 7 must match step and hex.
4. **Counts match** — 10 ramps, 114 primitives, 47 semantic tokens per mode.

Create this as `lab/pipelines/color/validate.ts`:
```
npm run validate  # Compare generated output against expected-output.json
```

Add the script to `package.json`:
```json
"validate": "tsx validate.ts"
```

Update the full build command to include validation:
```json
"build": "npm run generate && npm run verify && npm run validate"
```

The validation script should:
- Read `../../../foundations/color/primitives.json` and parse DTCG
- Read `../../../foundations/color/semantic.light.json` and `semantic.dark.json` and parse DTCG
- Read `./expected-output.json`
- Diff every value, reporting exact mismatches with expected vs actual
- Exit 0 if all match, exit 1 with detailed diff if any mismatch

- [ ] **Step 6: Commit validation script**

```bash
git add lab/pipelines/color/validate.ts lab/pipelines/color/expected-output.json lab/pipelines/color/package.json
git commit -m "test(color): add snapshot validation against color-theory baseline"
```

- [ ] **Step 7: Push**

```bash
git push origin main
```
