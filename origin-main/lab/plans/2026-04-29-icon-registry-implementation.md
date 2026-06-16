# Icon registry and distribution implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pipeline that extracts SVGs from the Central Icons npm packages and produces a manifest, SVG files, and a stable ID allowlist that backend and native platforms consume.

**Architecture:** A standalone Node.js build script reads the two Central npm packages (outlined + filled variants at the locked combo), extracts SVG content from React components, optimizes with SVGO, and writes three outputs: SVGs to `outputs/icons/`, manifest to `foundations/iconography/icons.json`, keys to `outputs/icons/keys.json`. A verification script validates the outputs.

**Tech Stack:** Node.js (ESM), SVGO, Central Icons React packages (private, licensed)

**Spec:** `lab/specs/2026-04-29-icon-registry-and-distribution-design.md`

---

## File map

### New files

| File | Responsibility |
|------|---------------|
| `lab/pipelines/icons/package.json` | Dependencies: svgo, @central-icons-react packages |
| `lab/pipelines/icons/build.mjs` | Main build logic — extract SVGs, optimize, generate manifest + keys |
| `lab/pipelines/icons/verify.mjs` | Validates outputs: SVG integrity, manifest schema, keys completeness |
| `foundations/iconography/icons.json` | Generated manifest (source of truth for icon metadata) |
| `outputs/icons/outlined/*.svg` | Generated outlined system icon SVGs |
| `outputs/icons/filled/*.svg` | Generated filled system icon SVGs |
| `outputs/icons/brand/*.svg` | Generated brand icon SVGs (single-form) |
| `outputs/icons/keys.json` | Generated flat allowlist of all valid stable IDs |

### Modified files

| File | Changes |
|------|---------|
| `package.json` (root) | Add `build:icons` script pointing to pipeline |
| `.gitignore` | Add `lab/pipelines/icons/node_modules/` |

### Unchanged files (for reference)

| File | Why relevant |
|------|-------------|
| `lab/pipelines/color/generate.ts` | Pattern reference for pipeline structure |
| `lab/pipelines/color/verify.ts` | Pattern reference for verification script |
| `scripts/build-ts.mjs` | Pattern reference for output generation |
| `scripts/audit-tokens.mjs` | Pattern reference for pass/fail/warn reporting |
| `foundations/iconography/guidelines.md` | Planned but not in this scope (prose rules, written separately) |

---

## Task 1: Spike — examine Central package structure

Before writing the build script, we need to know how SVGs are stored inside the Central React packages. This determines the extraction approach.

**Files:**
- Create: `lab/pipelines/icons/package.json`

- [ ] **Step 1: Create the icons pipeline directory and package.json**

```bash
mkdir -p lab/pipelines/icons
```

```json
{
  "name": "@origin/pipeline-icons",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node build.mjs",
    "verify": "node verify.mjs",
    "spike": "node spike.mjs"
  },
  "dependencies": {
    "@central-icons-react/round-outlined-radius-1-stroke-2": "latest",
    "@central-icons-react/round-filled-radius-1-stroke-2": "latest"
  },
  "devDependencies": {
    "svgo": "^3.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd lab/pipelines/icons && npm install
```

This requires the Central license key as an environment variable. If it fails, verify the key is set per Central's docs.

- [ ] **Step 3: Write and run a spike script to inspect the package structure**

Create `lab/pipelines/icons/spike.mjs`:

```javascript
#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Find the installed package directory
const outlinedPkg = dirname(require.resolve(
  '@central-icons-react/round-outlined-radius-1-stroke-2/package.json'
));
const filledPkg = dirname(require.resolve(
  '@central-icons-react/round-filled-radius-1-stroke-2/package.json'
));

console.log('=== Outlined package ===');
console.log('Location:', outlinedPkg);

// List top-level contents
const outlinedContents = readdirSync(outlinedPkg);
console.log('Top-level files/dirs:', outlinedContents.slice(0, 20));

// Check for raw SVG files
const hasSvgDir = outlinedContents.some(f => f === 'svg' || f === 'svgs' || f === 'icons');
console.log('Has SVG directory:', hasSvgDir);

// Read package.json for exports/main/files fields
const outlinedPkgJson = JSON.parse(readFileSync(resolve(outlinedPkg, 'package.json'), 'utf-8'));
console.log('Main:', outlinedPkgJson.main);
console.log('Module:', outlinedPkgJson.module);
console.log('Exports:', JSON.stringify(outlinedPkgJson.exports, null, 2)?.slice(0, 500));
console.log('Files:', outlinedPkgJson.files);

// Find a sample icon file and inspect its content
function findSampleIcon(dir, depth = 0) {
  if (depth > 3) return null;
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (entry.startsWith('Icon') && (entry.endsWith('.js') || entry.endsWith('.jsx') || entry.endsWith('.tsx'))) {
      return full;
    }
    if (statSync(full).isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
      const found = findSampleIcon(full, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

const sampleIcon = findSampleIcon(outlinedPkg);
if (sampleIcon) {
  console.log('\n=== Sample icon file ===');
  console.log('Path:', sampleIcon);
  console.log('Content (first 1000 chars):');
  console.log(readFileSync(sampleIcon, 'utf-8').slice(0, 1000));
} else {
  console.log('\nNo sample icon file found — check directory structure manually');
  // Try listing subdirectories
  for (const entry of outlinedContents) {
    const full = resolve(outlinedPkg, entry);
    if (statSync(full).isDirectory()) {
      const subContents = readdirSync(full).slice(0, 10);
      console.log(`  ${entry}/: ${subContents.join(', ')}`);
    }
  }
}

// Count total icon files
function countIcons(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { recursive: true })) {
    if (String(entry).startsWith('Icon') && String(entry).endsWith('.js')) count++;
  }
  return count;
}

console.log('\n=== Counts ===');
console.log('Outlined icon files:', countIcons(outlinedPkg));
console.log('Filled icon files:', countIcons(filledPkg));

// Check if brand icons exist in both packages
const brandNames = ['IconInstagram', 'IconGithub', 'IconFigma', 'IconX'];
console.log('\n=== Brand icon check ===');
for (const name of brandNames) {
  const outlinedPath = findSampleIcon(outlinedPkg)?.replace(/Icon[A-Z][^/]*$/, name);
  // Just try to require both variants
  try {
    const oMod = await import(`@central-icons-react/round-outlined-radius-1-stroke-2/${name}`);
    console.log(`${name} in outlined: YES (exports: ${Object.keys(oMod).join(', ')})`);
  } catch (e) {
    console.log(`${name} in outlined: NO (${e.code || e.message})`);
  }
  try {
    const fMod = await import(`@central-icons-react/round-filled-radius-1-stroke-2/${name}`);
    console.log(`${name} in filled: YES (exports: ${Object.keys(fMod).join(', ')})`);
  } catch (e) {
    console.log(`${name} in filled: NO (${e.code || e.message})`);
  }
}
```

- [ ] **Step 4: Run the spike**

```bash
cd lab/pipelines/icons && node spike.mjs
```

Record the findings:
- How is SVG content stored? (raw SVG files, JSX source, pre-compiled JS with SVG strings)
- What's the export structure per icon? (named export, default export, function component, SVG string)
- Are brand icons present in both packages or only one?
- What metadata is available? (categories, aliases, tags)

- [ ] **Step 5: Document findings and adjust plan**

Update this plan with the actual extraction approach based on the spike results. The subsequent tasks assume the most likely structure (React components with inline SVG markup in JS source), but adjust if the spike reveals something different.

- [ ] **Step 6: Commit**

```bash
git add lab/pipelines/icons/package.json lab/pipelines/icons/spike.mjs
git commit -m "spike(icons): examine Central package structure for SVG extraction"
```

---

## Task 2: Build the SVG extraction core

Write the module that reads Central packages and extracts raw SVG content from each icon.

**Files:**
- Create: `lab/pipelines/icons/extract.mjs`
- Create: `lab/pipelines/icons/extract.test.mjs`

- [ ] **Step 1: Write the extraction test with fixture data**

Create `lab/pipelines/icons/extract.test.mjs`. Use a fixture that mimics the structure discovered in the spike. This example assumes React component source with inline SVG — adjust based on spike findings:

```javascript
import { describe, it, assert } from 'node:test';
import { extractSvgFromSource, pascalToKebab } from './extract.mjs';

describe('pascalToKebab', () => {
  it('converts PascalCase icon names to kebab-case', () => {
    assert.strictEqual(pascalToKebab('IconArrowRight'), 'arrow-right');
    assert.strictEqual(pascalToKebab('IconCircleInfo'), 'circle-info');
    assert.strictEqual(pascalToKebab('IconX'), 'x');
    assert.strictEqual(pascalToKebab('IconEyeSlash'), 'eye-slash');
    assert.strictEqual(pascalToKebab('IconInstagram'), 'instagram');
  });

  it('strips the Icon prefix', () => {
    assert.strictEqual(pascalToKebab('IconLock'), 'lock');
  });
});

describe('extractSvgFromSource', () => {
  it('extracts SVG markup from a React component source string', () => {
    // Fixture mimicking Central's compiled output — adjust based on spike
    const source = `
      import { jsx as _jsx } from "react/jsx-runtime";
      export const IconLock = (props) => _jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        children: _jsx("path", {
          d: "M12 2C9.24 2 7 4.24 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.76-2.24-5-5-5z",
          stroke: "currentColor",
          strokeWidth: "2"
        })
      });
    `;

    const svg = extractSvgFromSource(source);
    assert.ok(svg.startsWith('<svg'));
    assert.ok(svg.includes('viewBox="0 0 24 24"'));
    assert.ok(svg.includes('currentColor'));
    assert.ok(svg.endsWith('</svg>'));
  });

  it('returns null for files with no SVG content', () => {
    const source = `export const metadata = { version: "1.0" };`;
    const svg = extractSvgFromSource(source);
    assert.strictEqual(svg, null);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd lab/pipelines/icons && node --test extract.test.mjs
```

Expected: FAIL — `extract.mjs` does not exist.

- [ ] **Step 3: Write the extraction module**

Create `lab/pipelines/icons/extract.mjs`:

```javascript
/**
 * SVG extraction from Central Icons React packages.
 *
 * Central packages export React components with inline SVG.
 * This module extracts the raw SVG markup from the compiled source.
 *
 * IMPORTANT: The extraction approach was determined by the spike in Task 1.
 * If the package structure changes in a future Central version, this is
 * the file to update.
 */

/**
 * Convert PascalCase icon name (with Icon prefix) to kebab-case.
 * IconArrowRight → arrow-right
 * IconCircleInfo → circle-info
 * IconX → x
 */
export function pascalToKebab(name) {
  // Strip "Icon" prefix
  const stripped = name.replace(/^Icon/, '');
  // Insert hyphens before uppercase letters, then lowercase everything
  return stripped
    .replace(/([A-Z])/g, (match, letter, offset) =>
      offset > 0 ? `-${letter}` : letter
    )
    .toLowerCase();
}

/**
 * Extract raw SVG markup from a React component source string.
 * Returns the SVG as a string, or null if no SVG found.
 *
 * NOTE: This implementation assumes Central's compiled JSX output format.
 * Adjust the regex/parsing based on spike findings.
 * The actual implementation will depend on what the spike in Task 1 reveals
 * about the compiled output format. This is a placeholder that handles
 * the most common React icon component patterns:
 *
 * Pattern A: JSX source with <svg>...</svg>
 * Pattern B: Compiled _jsx("svg", {...}) calls
 * Pattern C: Raw SVG string export
 */
export function extractSvgFromSource(source) {
  // Pattern A: Raw SVG tags in JSX source
  const svgMatch = source.match(/<svg[\s\S]*?<\/svg>/);
  if (svgMatch) return svgMatch[0];

  // Pattern B: _jsx("svg", ...) — needs JSX runtime to render
  // For this pattern, we'd use a different approach (dynamic import + renderToString)
  // This branch will be filled in after the spike confirms the format

  // Pattern C: Exported SVG string constant
  const strMatch = source.match(/["'`](<svg[\s\S]*?<\/svg>)["'`]/);
  if (strMatch) return strMatch[1];

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd lab/pipelines/icons && node --test extract.test.mjs
```

Expected: PASS (or partial — the compiled JSX test may need adjustment after the spike).

- [ ] **Step 5: Commit**

```bash
git add lab/pipelines/icons/extract.mjs lab/pipelines/icons/extract.test.mjs
git commit -m "feat(icons): SVG extraction module with PascalCase-to-kebab conversion"
```

---

## Task 3: Build the SVGO optimization step

**Files:**
- Create: `lab/pipelines/icons/optimize.mjs`
- Create: `lab/pipelines/icons/optimize.test.mjs`

- [ ] **Step 1: Write the optimization test**

Create `lab/pipelines/icons/optimize.test.mjs`:

```javascript
import { describe, it, assert } from 'node:test';
import { optimizeSvg } from './optimize.mjs';

describe('optimizeSvg', () => {
  it('strips width and height attributes, keeps viewBox', async () => {
    const input = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 22h20z"/></svg>';
    const output = await optimizeSvg(input);
    assert.ok(!output.includes('width="24"'), 'should strip width');
    assert.ok(!output.includes('height="24"'), 'should strip height');
    assert.ok(output.includes('viewBox="0 0 24 24"'), 'should keep viewBox');
  });

  it('preserves currentColor for theming', async () => {
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path stroke="currentColor" d="M12 2L2 22h20z"/></svg>';
    const output = await optimizeSvg(input);
    assert.ok(output.includes('currentColor'), 'should preserve currentColor');
  });

  it('does not merge paths (Android SVG Tiny compat)', async () => {
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 1h10v10z"/><path d="M12 12h10v10z"/></svg>';
    const output = await optimizeSvg(input);
    const pathCount = (output.match(/<path/g) || []).length;
    assert.strictEqual(pathCount, 2, 'should not merge separate paths');
  });

  it('preserves multi-color fills on brand icons', async () => {
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1877F2" d="M12 2z"/><path fill="#fff" d="M15 12z"/></svg>';
    const output = await optimizeSvg(input);
    assert.ok(output.includes('#1877F2') || output.includes('#1877f2'), 'should preserve brand color');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd lab/pipelines/icons && node --test optimize.test.mjs
```

Expected: FAIL — `optimize.mjs` does not exist.

- [ ] **Step 3: Write the optimization module**

Create `lab/pipelines/icons/optimize.mjs`:

```javascript
import { optimize } from 'svgo';

/**
 * SVGO config for icon optimization.
 * - Strips width/height (icons are sized by consumers via tokens)
 * - Keeps viewBox (needed for scaling)
 * - Does not merge paths (Android SVG Tiny compatibility, per Polaris pattern)
 * - Preserves currentColor (for theming)
 * - Preserves explicit fill colors (for multi-color brand icons)
 */
const SVGO_CONFIG = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          mergePaths: false,
        },
      },
    },
    'removeDimensions',
  ],
};

/**
 * Optimize an SVG string for distribution.
 * Returns the optimized SVG string.
 */
export async function optimizeSvg(svgString) {
  const result = optimize(svgString, SVGO_CONFIG);
  return result.data;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd lab/pipelines/icons && node --test optimize.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lab/pipelines/icons/optimize.mjs lab/pipelines/icons/optimize.test.mjs
git commit -m "feat(icons): SVGO optimization module for SVG distribution"
```

---

## Task 4: Build the manifest and keys generator

**Files:**
- Create: `lab/pipelines/icons/manifest.mjs`
- Create: `lab/pipelines/icons/manifest.test.mjs`

- [ ] **Step 1: Write the manifest generation test**

Create `lab/pipelines/icons/manifest.test.mjs`:

```javascript
import { describe, it, assert } from 'node:test';
import { buildManifest, buildKeys } from './manifest.mjs';

const SAMPLE_ICONS = [
  {
    id: 'arrow-right',
    aliases: ['next', 'forward'],
    category: 'arrows',
    variants: {
      outlined: 'outputs/icons/outlined/arrow-right.svg',
      filled: 'outputs/icons/filled/arrow-right.svg',
    },
  },
  {
    id: 'lock',
    aliases: ['private'],
    category: 'security',
    variants: {
      outlined: 'outputs/icons/outlined/lock.svg',
      filled: 'outputs/icons/filled/lock.svg',
    },
  },
  {
    id: 'instagram',
    aliases: [],
    category: 'social-media-and-brands',
    variants: {
      brand: 'outputs/icons/brand/instagram.svg',
    },
  },
];

const SOURCE_INFO = {
  package: '@central-icons-react',
  version: '0.0.4',
  combo: { join: 'round', radius: 1, stroke: 2 },
};

describe('buildManifest', () => {
  it('produces valid manifest structure', () => {
    const manifest = buildManifest(SAMPLE_ICONS, SOURCE_INFO);
    assert.strictEqual(manifest.id_format, 'origin.icon.{id}.{variant}');
    assert.deepStrictEqual(manifest.source, SOURCE_INFO);
    assert.strictEqual(manifest.icons.length, 3);
  });

  it('sorts icons alphabetically by id', () => {
    const manifest = buildManifest(SAMPLE_ICONS, SOURCE_INFO);
    const ids = manifest.icons.map(i => i.id);
    assert.deepStrictEqual(ids, ['arrow-right', 'instagram', 'lock']);
  });
});

describe('buildKeys', () => {
  it('generates all stable IDs from manifest', () => {
    const manifest = buildManifest(SAMPLE_ICONS, SOURCE_INFO);
    const keys = buildKeys(manifest);
    assert.strictEqual(keys.id_format, 'origin.icon.{id}.{variant}');
    assert.ok(keys.keys.includes('origin.icon.arrow-right.outlined'));
    assert.ok(keys.keys.includes('origin.icon.arrow-right.filled'));
    assert.ok(keys.keys.includes('origin.icon.lock.outlined'));
    assert.ok(keys.keys.includes('origin.icon.lock.filled'));
    assert.ok(keys.keys.includes('origin.icon.instagram.brand'));
  });

  it('produces correct count: 2 per system icon + 1 per brand icon', () => {
    const manifest = buildManifest(SAMPLE_ICONS, SOURCE_INFO);
    const keys = buildKeys(manifest);
    // 2 system icons × 2 variants + 1 brand icon × 1 variant = 5
    assert.strictEqual(keys.keys.length, 5);
  });

  it('sorts keys alphabetically', () => {
    const manifest = buildManifest(SAMPLE_ICONS, SOURCE_INFO);
    const keys = buildKeys(manifest);
    const sorted = [...keys.keys].sort();
    assert.deepStrictEqual(keys.keys, sorted);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd lab/pipelines/icons && node --test manifest.test.mjs
```

Expected: FAIL — `manifest.mjs` does not exist.

- [ ] **Step 3: Write the manifest and keys module**

Create `lab/pipelines/icons/manifest.mjs`:

```javascript
/**
 * Manifest and keys generation for the icon registry.
 *
 * Takes a list of processed icons and produces:
 * 1. The manifest (foundations/iconography/icons.json)
 * 2. The keys allowlist (outputs/icons/keys.json)
 */

/**
 * Build the manifest object from a list of processed icons.
 * @param {Array<{id, aliases, category, variants}>} icons
 * @param {{package, version, combo}} sourceInfo
 * @returns {object} The manifest
 */
export function buildManifest(icons, sourceInfo) {
  const sorted = [...icons].sort((a, b) => a.id.localeCompare(b.id));

  return {
    id_format: 'origin.icon.{id}.{variant}',
    source: sourceInfo,
    icons: sorted,
  };
}

/**
 * Build the keys allowlist from a manifest.
 * Each icon produces one key per variant:
 *   origin.icon.{id}.outlined
 *   origin.icon.{id}.filled
 *   origin.icon.{id}.brand
 *
 * @param {object} manifest
 * @returns {{id_format: string, keys: string[]}}
 */
export function buildKeys(manifest) {
  const keys = [];

  for (const icon of manifest.icons) {
    for (const variant of Object.keys(icon.variants)) {
      keys.push(`origin.icon.${icon.id}.${variant}`);
    }
  }

  keys.sort();

  return {
    id_format: manifest.id_format,
    keys,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd lab/pipelines/icons && node --test manifest.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lab/pipelines/icons/manifest.mjs lab/pipelines/icons/manifest.test.mjs
git commit -m "feat(icons): manifest and keys generation module"
```

---

## Task 5: Wire up the main build script

Combine extraction, optimization, manifest, and keys into the orchestration script.

**Files:**
- Create: `lab/pipelines/icons/build.mjs`

- [ ] **Step 1: Write the build script**

Create `lab/pipelines/icons/build.mjs`:

```javascript
#!/usr/bin/env node

/**
 * Icon registry build script.
 *
 * Reads Central Icons React packages, extracts SVGs, optimizes them,
 * and generates:
 *   - outputs/icons/outlined/*.svg
 *   - outputs/icons/filled/*.svg
 *   - outputs/icons/brand/*.svg
 *   - outputs/icons/keys.json
 *   - foundations/iconography/icons.json
 *
 * Usage: node build.mjs
 * Run from: lab/pipelines/icons/
 */

import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { extractSvgFromSource, pascalToKebab } from './extract.mjs';
import { optimizeSvg } from './optimize.mjs';
import { buildManifest, buildKeys } from './manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');
const OUT_ICONS = resolve(ROOT, 'outputs', 'icons');
const FOUNDATIONS = resolve(ROOT, 'foundations', 'iconography');

const require = createRequire(import.meta.url);

// --- Config ---

const OUTLINED_PKG = '@central-icons-react/round-outlined-radius-1-stroke-2';
const FILLED_PKG = '@central-icons-react/round-filled-radius-1-stroke-2';

const SOURCE_INFO = {
  package: '@central-icons-react',
  version: JSON.parse(
    readFileSync(require.resolve(`${OUTLINED_PKG}/package.json`), 'utf-8')
  ).version,
  combo: { join: 'round', radius: 1, stroke: 2 },
};

// --- Helpers ---

function heading(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`); }
function pass(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); }
function warn(msg) { console.log(`  \x1b[33m!\x1b[0m ${msg}`); }

/**
 * Discover all icon component files in a Central package.
 * Returns array of { name: 'IconArrowRight', source: '...' }
 */
function discoverIcons(pkgName) {
  const pkgDir = dirname(require.resolve(`${pkgName}/package.json`));
  const icons = [];

  // NOTE: This discovery logic depends on the spike findings (Task 1).
  // Adjust the file traversal based on actual package structure.
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(resolve(dir, entry.name));
      } else if (entry.name.startsWith('Icon') && entry.name.endsWith('.js')) {
        const name = entry.name.replace(/\.js$/, '');
        const source = readFileSync(resolve(dir, entry.name), 'utf-8');
        icons.push({ name, source });
      }
    }
  }

  walk(pkgDir);
  return icons;
}

/**
 * Determine if an icon is a brand icon by comparing its SVG content
 * between outlined and filled packages. If identical, it's a brand icon
 * (no outlined/filled distinction).
 */
function isBrandIcon(outlinedSvg, filledSvg) {
  return outlinedSvg === filledSvg;
}

// --- Main ---

async function main() {
  heading('Icon registry build');
  console.log(`  Source: ${SOURCE_INFO.package}@${SOURCE_INFO.version}`);
  console.log(`  Combo: join=${SOURCE_INFO.combo.join}, radius=${SOURCE_INFO.combo.radius}, stroke=${SOURCE_INFO.combo.stroke}`);

  // Step 1: Discover icons in both packages
  heading('Discovering icons');
  const outlinedRaw = discoverIcons(OUTLINED_PKG);
  const filledRaw = discoverIcons(FILLED_PKG);
  console.log(`  Outlined package: ${outlinedRaw.length} components`);
  console.log(`  Filled package: ${filledRaw.length} components`);

  // Index filled icons by name for comparison
  const filledByName = new Map(filledRaw.map(i => [i.name, i]));

  // Step 2: Extract and classify
  heading('Extracting and classifying');
  const icons = [];
  const errors = [];

  for (const outlined of outlinedRaw) {
    const id = pascalToKebab(outlined.name);
    const outlinedSvg = extractSvgFromSource(outlined.source);

    if (!outlinedSvg) {
      errors.push(`${id}: failed to extract SVG from outlined source`);
      continue;
    }

    const filled = filledByName.get(outlined.name);
    const filledSvg = filled ? extractSvgFromSource(filled.source) : null;

    if (isBrandIcon(outlinedSvg, filledSvg)) {
      icons.push({ id, type: 'brand', svgs: { brand: outlinedSvg } });
    } else {
      if (!filledSvg) {
        errors.push(`${id}: found in outlined but missing/failed in filled`);
        continue;
      }
      icons.push({
        id,
        type: 'system',
        svgs: { outlined: outlinedSvg, filled: filledSvg },
      });
    }
  }

  pass(`${icons.filter(i => i.type === 'system').length} system icons (outlined + filled)`);
  pass(`${icons.filter(i => i.type === 'brand').length} brand icons`);
  if (errors.length) {
    for (const e of errors) warn(e);
  }

  // Step 3: Optimize SVGs
  heading('Optimizing SVGs');
  for (const icon of icons) {
    for (const [variant, svg] of Object.entries(icon.svgs)) {
      icon.svgs[variant] = await optimizeSvg(svg);
    }
  }
  pass(`${icons.length} icons optimized`);

  // Step 4: Write SVG files
  heading('Writing SVG files');
  mkdirSync(resolve(OUT_ICONS, 'outlined'), { recursive: true });
  mkdirSync(resolve(OUT_ICONS, 'filled'), { recursive: true });
  mkdirSync(resolve(OUT_ICONS, 'brand'), { recursive: true });

  let svgCount = 0;
  for (const icon of icons) {
    for (const [variant, svg] of Object.entries(icon.svgs)) {
      const path = resolve(OUT_ICONS, variant, `${icon.id}.svg`);
      writeFileSync(path, svg, 'utf-8');
      svgCount++;
    }
  }
  pass(`${svgCount} SVG files written to outputs/icons/`);

  // Step 5: Build manifest
  heading('Generating manifest');
  mkdirSync(FOUNDATIONS, { recursive: true });

  // TODO: Aliases and categories need to come from Central's metadata.
  // The spike (Task 1) should reveal whether the packages include metadata
  // or whether we need to extract it from component names/file paths.
  // For now, aliases default to [] and category to 'uncategorized'.
  // This will be refined after the spike.
  const manifestIcons = icons.map(icon => ({
    id: icon.id,
    aliases: [], // Populated from Central metadata after spike
    category: 'uncategorized', // Populated from Central metadata after spike
    variants: Object.fromEntries(
      Object.keys(icon.svgs).map(variant => [
        variant,
        `outputs/icons/${variant}/${icon.id}.svg`,
      ])
    ),
  }));

  const manifest = buildManifest(manifestIcons, SOURCE_INFO);
  writeFileSync(
    resolve(FOUNDATIONS, 'icons.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf-8'
  );
  pass(`Manifest written to foundations/iconography/icons.json (${manifest.icons.length} icons)`);

  // Step 6: Build keys
  heading('Generating keys');
  const keys = buildKeys(manifest);
  writeFileSync(
    resolve(OUT_ICONS, 'keys.json'),
    JSON.stringify(keys, null, 2) + '\n',
    'utf-8'
  );
  pass(`Keys written to outputs/icons/keys.json (${keys.keys.length} keys)`);

  // Summary
  heading('Done');
  console.log(`  System icons: ${icons.filter(i => i.type === 'system').length} × 2 variants`);
  console.log(`  Brand icons:  ${icons.filter(i => i.type === 'brand').length} × 1 variant`);
  console.log(`  Total SVGs:   ${svgCount}`);
  console.log(`  Total keys:   ${keys.keys.length}`);
  if (errors.length) {
    console.log(`  Warnings:     ${errors.length}`);
  }
}

main().catch(err => {
  console.error('\n\x1b[31mBuild failed:\x1b[0m', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the build script**

```bash
cd lab/pipelines/icons && node build.mjs
```

Verify output:
- `outputs/icons/outlined/` has ~1,812 SVG files
- `outputs/icons/filled/` has ~1,812 SVG files
- `outputs/icons/brand/` has ~144 SVG files
- `foundations/iconography/icons.json` exists and is valid JSON
- `outputs/icons/keys.json` exists and has the expected key count

- [ ] **Step 3: Spot-check a few SVGs**

```bash
# Check a system icon has no width/height but has viewBox
head -1 outputs/icons/outlined/lock.svg
head -1 outputs/icons/filled/lock.svg

# Check a brand icon preserves its fill colors
cat outputs/icons/brand/instagram.svg

# Verify outlined and filled are different for a system icon
diff outputs/icons/outlined/lock.svg outputs/icons/filled/lock.svg

# Verify brand icons are identical across detection
# (the same SVG should be in brand/, not in outlined/ or filled/)
ls outputs/icons/outlined/instagram.svg 2>/dev/null && echo "ERROR: brand icon in outlined" || echo "OK: brand icon not in outlined"
```

- [ ] **Step 4: Commit**

```bash
git add lab/pipelines/icons/build.mjs
git commit -m "feat(icons): main build script — extract, optimize, generate manifest and keys"
```

---

## Task 6: Write the verification script

Validates the outputs for integrity after every build.

**Files:**
- Create: `lab/pipelines/icons/verify.mjs`

- [ ] **Step 1: Write the verification script**

Create `lab/pipelines/icons/verify.mjs`:

```javascript
#!/usr/bin/env node

/**
 * Icon registry verification.
 *
 * Validates outputs from the icon build:
 * 1. SVG file integrity (valid XML, has viewBox, no width/height)
 * 2. Manifest schema (required fields, valid references)
 * 3. Keys completeness (every manifest entry produces correct keys)
 * 4. Cross-reference (every key resolves to an existing SVG file)
 *
 * Usage: node verify.mjs
 * Run from: lab/pipelines/icons/
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');

let errors = 0;
let warnings = 0;

function heading(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`); }
function pass(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); }
function fail(msg) { console.log(`  \x1b[31m✗\x1b[0m ${msg}`); errors++; }
function warn(msg) { console.log(`  \x1b[33m!\x1b[0m ${msg}`); warnings++; }

function readJSON(path) {
  return JSON.parse(readFileSync(resolve(ROOT, path), 'utf-8'));
}

// --- Phase 1: Manifest schema ---

heading('Phase 1: Manifest schema');

const manifestPath = 'foundations/iconography/icons.json';
if (!existsSync(resolve(ROOT, manifestPath))) {
  fail(`Manifest not found at ${manifestPath}`);
  process.exit(1);
}

const manifest = readJSON(manifestPath);

if (manifest.id_format === 'origin.icon.{id}.{variant}') {
  pass('id_format correct');
} else {
  fail(`id_format is "${manifest.id_format}", expected "origin.icon.{id}.{variant}"`);
}

if (manifest.source?.package && manifest.source?.version && manifest.source?.combo) {
  pass(`Source: ${manifest.source.package}@${manifest.source.version}`);
} else {
  fail('Source block missing required fields (package, version, combo)');
}

if (Array.isArray(manifest.icons) && manifest.icons.length > 0) {
  pass(`${manifest.icons.length} icons in manifest`);
} else {
  fail('No icons in manifest');
}

// Validate each icon entry
const validVariants = new Set(['outlined', 'filled', 'brand']);
let schemaErrors = 0;

for (const icon of manifest.icons) {
  if (!icon.id || typeof icon.id !== 'string') {
    fail(`Icon missing id: ${JSON.stringify(icon).slice(0, 80)}`);
    schemaErrors++;
    continue;
  }
  if (!Array.isArray(icon.aliases)) {
    fail(`${icon.id}: aliases is not an array`);
    schemaErrors++;
  }
  if (!icon.category || typeof icon.category !== 'string') {
    fail(`${icon.id}: missing or invalid category`);
    schemaErrors++;
  }
  if (!icon.variants || typeof icon.variants !== 'object') {
    fail(`${icon.id}: missing variants`);
    schemaErrors++;
    continue;
  }
  for (const v of Object.keys(icon.variants)) {
    if (!validVariants.has(v)) {
      fail(`${icon.id}: invalid variant "${v}"`);
      schemaErrors++;
    }
  }
}

if (schemaErrors === 0) {
  pass('All icon entries pass schema validation');
}

// Check alphabetical sort
const ids = manifest.icons.map(i => i.id);
const sorted = [...ids].sort();
if (JSON.stringify(ids) === JSON.stringify(sorted)) {
  pass('Icons sorted alphabetically');
} else {
  fail('Icons not sorted alphabetically');
}

// --- Phase 2: SVG file integrity ---

heading('Phase 2: SVG file integrity');

let svgChecked = 0;
let svgMissing = 0;
let svgInvalid = 0;

for (const icon of manifest.icons) {
  for (const [variant, svgPath] of Object.entries(icon.variants)) {
    const fullPath = resolve(ROOT, svgPath);
    if (!existsSync(fullPath)) {
      fail(`Missing SVG: ${svgPath}`);
      svgMissing++;
      continue;
    }

    const content = readFileSync(fullPath, 'utf-8');

    if (!content.includes('<svg')) {
      fail(`${svgPath}: not a valid SVG (no <svg tag)`);
      svgInvalid++;
      continue;
    }

    if (!content.includes('viewBox')) {
      fail(`${svgPath}: missing viewBox attribute`);
      svgInvalid++;
    }

    // System icons should not have hardcoded width/height
    if (variant !== 'brand') {
      if (/\bwidth="\d+"/.test(content) || /\bheight="\d+"/.test(content)) {
        warn(`${svgPath}: has width/height attributes (should be stripped for system icons)`);
      }
    }

    svgChecked++;
  }
}

if (svgMissing === 0 && svgInvalid === 0) {
  pass(`${svgChecked} SVG files verified`);
}

// --- Phase 3: Keys completeness ---

heading('Phase 3: Keys completeness');

const keysPath = 'outputs/icons/keys.json';
if (!existsSync(resolve(ROOT, keysPath))) {
  fail(`Keys file not found at ${keysPath}`);
  process.exit(1);
}

const keysFile = readJSON(keysPath);

if (keysFile.id_format === 'origin.icon.{id}.{variant}') {
  pass('Keys id_format correct');
} else {
  fail(`Keys id_format is "${keysFile.id_format}"`);
}

// Verify every manifest icon produces the right keys
const expectedKeys = new Set();
for (const icon of manifest.icons) {
  for (const variant of Object.keys(icon.variants)) {
    expectedKeys.add(`origin.icon.${icon.id}.${variant}`);
  }
}

const actualKeys = new Set(keysFile.keys);

const missingKeys = [...expectedKeys].filter(k => !actualKeys.has(k));
const extraKeys = [...actualKeys].filter(k => !expectedKeys.has(k));

if (missingKeys.length === 0) {
  pass('All manifest icons have corresponding keys');
} else {
  fail(`${missingKeys.length} keys missing from keys.json`);
  for (const k of missingKeys.slice(0, 5)) fail(`  missing: ${k}`);
}

if (extraKeys.length === 0) {
  pass('No extra keys beyond manifest');
} else {
  fail(`${extraKeys.length} extra keys not in manifest`);
  for (const k of extraKeys.slice(0, 5)) fail(`  extra: ${k}`);
}

// Check alphabetical sort
const keysSorted = [...keysFile.keys].sort();
if (JSON.stringify(keysFile.keys) === JSON.stringify(keysSorted)) {
  pass('Keys sorted alphabetically');
} else {
  fail('Keys not sorted alphabetically');
}

pass(`${keysFile.keys.length} total keys`);

// --- Summary ---

heading('Summary');
console.log(`  ${errors === 0 ? '✅' : '❌'} ${errors} errors, ${warnings} warnings`);
process.exit(errors > 0 ? 1 : 0);
```

- [ ] **Step 2: Run the verification script**

```bash
cd lab/pipelines/icons && node verify.mjs
```

Expected: all phases pass if the build ran successfully.

- [ ] **Step 3: Commit**

```bash
git add lab/pipelines/icons/verify.mjs
git commit -m "feat(icons): verification script for build output integrity"
```

---

## Task 7: Wire up npm scripts and gitignore

**Files:**
- Modify: `package.json` (root)
- Modify: `.gitignore`

- [ ] **Step 1: Add build:icons script to root package.json**

Update `/Users/hakeeb/Documents/Build/origin/package.json`:

```json
{
  "name": "@vance-club/origin",
  "description": "Origin — Aspora's design system. Foundations, tokens, guidelines, and tooling.",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "build:icons": "cd lab/pipelines/icons && node build.mjs",
    "verify:icons": "cd lab/pipelines/icons && node verify.mjs"
  }
}
```

- [ ] **Step 2: Add node_modules to gitignore**

Append to `.gitignore`:

```
lab/pipelines/icons/node_modules/
```

- [ ] **Step 3: Run the full pipeline from root**

```bash
npm run build:icons
npm run verify:icons
```

Both should complete without errors.

- [ ] **Step 4: Verify the generated outputs look correct**

```bash
# Count files
ls outputs/icons/outlined/ | wc -l   # expect ~1812
ls outputs/icons/filled/ | wc -l     # expect ~1812
ls outputs/icons/brand/ | wc -l      # expect ~144

# Check manifest
cat foundations/iconography/icons.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d[\"icons\"])} icons')"

# Check keys
cat outputs/icons/keys.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{len(d[\"keys\"])} keys')"

# Spot-check a few IDs
grep "origin.icon.lock" outputs/icons/keys.json
grep "origin.icon.instagram" outputs/icons/keys.json
grep "origin.icon.arrow-right" outputs/icons/keys.json
```

- [ ] **Step 5: Commit all generated outputs**

```bash
git add .gitignore package.json
git add foundations/iconography/icons.json
git add outputs/icons/
git commit -m "feat(icons): icon registry build pipeline with manifest, SVGs, and keys

Extracts 1,812 system icons (outlined + filled) and 144 brand icons
from Central npm packages. Generates manifest, optimized SVGs, and
stable ID allowlist for backend validation."
```

---

## Task 8: Clean up spike artifacts

**Files:**
- Delete: `lab/pipelines/icons/spike.mjs`

- [ ] **Step 1: Remove the spike script**

```bash
rm lab/pipelines/icons/spike.mjs
```

- [ ] **Step 2: Commit**

```bash
git add -u lab/pipelines/icons/spike.mjs
git commit -m "chore(icons): remove spike script after build pipeline complete"
```
