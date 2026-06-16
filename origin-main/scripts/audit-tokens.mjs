#!/usr/bin/env node
/**
 * TOKEN AUDIT SCRIPT
 *
 * Validates consistency between Origin foundations, generated outputs,
 * and consumer repos (Brand Lab, aspora-site-new).
 *
 * Usage: node scripts/audit-tokens.mjs [--fix]
 *
 * Checks:
 *   1. Foundation JSON syntax
 *   2. Semantic → primitive reference integrity
 *   3. Responsive value ordering (mobile <= tablet <= desktopFloor <= desktopCeil)
 *   4. Output file existence
 *   5. R object completeness (every semantic category → R keys)
 *   6. SEMANTIC_TOKENS completeness
 *   7. CSS variable completeness
 *   8. Brand Lab barrel sync (destructured names vs R keys)
 *   9. aspora-site-new tokens.css freshness
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORIGIN = resolve(__dirname, '..');
const BRAND_LAB = resolve(ORIGIN, '..');
const SITE_NEW = resolve(BRAND_LAB, '..', 'aspora-site-new-repo');

let errors = 0;
let warnings = 0;

function pass(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); }
function fail(msg) { console.log(`  \x1b[31m✗\x1b[0m ${msg}`); errors++; }
function warn(msg) { console.log(`  \x1b[33m!\x1b[0m ${msg}`); warnings++; }
function heading(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`); }

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    fail(`Invalid JSON: ${path} — ${e.message}`);
    return null;
  }
}

function fileExists(path, label) {
  if (existsSync(path)) {
    pass(label || path);
    return true;
  } else {
    fail(`Missing: ${label || path}`);
    return false;
  }
}

// ── Phase 1: Foundation JSON syntax ──────────────────────────────

heading('Phase 1: Foundation JSON syntax');

const foundationFiles = [
  'typography/primitives.json',
  'typography/semantic.json',
  'typography/web-primitives.json',
  'color/primitives.json',
  'color/anchors.json',
  'color/semantic.light.json',
  'color/semantic.dark.json',
  'spacing/primitives.json',
  'radius/primitives.json',
];

const foundations = {};
for (const file of foundationFiles) {
  const path = resolve(ORIGIN, 'foundations', file);
  if (existsSync(path)) {
    const data = readJSON(path);
    if (data) {
      pass(file);
      foundations[file] = data;
    }
  } else {
    warn(`Not found (may be optional): ${file}`);
  }
}

// ── Phase 2: Semantic → primitive reference integrity ────────────

heading('Phase 2: Semantic reference integrity');

const typoPrims = foundations['typography/primitives.json']?.typography;
const typoSem = foundations['typography/semantic.json']?.typography;
const webTypoPrims = foundations['typography/web-primitives.json']?.['web-typography'];

if (typoPrims && typoSem) {
  const validSteps = {
    fontSize: new Set(Object.keys(typoPrims.fontSize || {}).filter(k => k !== '$type')),
    lineHeight: new Set(Object.keys(typoPrims.lineHeight || {}).filter(k => k !== '$type')),
    letterSpacing: new Set(Object.keys(typoPrims.letterSpacing || {}).filter(k => k !== '$type')),
    fontWeight: new Set(Object.keys(typoPrims.fontWeight || {}).filter(k => k !== '$type')),
    fontFamily: new Set(Object.keys(typoPrims.fontFamily || {}).filter(k => k !== '$type')),
  };

  let refErrors = 0;
  for (const [category, group] of Object.entries(typoSem)) {
    if (category === '$type') continue;
    for (const [size, token] of Object.entries(group)) {
      if (size === '$type') continue;
      const val = token.$value;
      if (!val) continue;

      // Check each reference
      for (const [prop, ref] of Object.entries(val)) {
        const match = String(ref).match(/^\{typography\.(\w+)\.([\w-]+)\}$/);
        if (match) {
          const [, type, step] = match;
          if (validSteps[type] && !validSteps[type].has(step)) {
            fail(`${category}.${size}.${prop}: references {typography.${type}.${step}} but step "${step}" does not exist in primitives`);
            refErrors++;
          }
        }
      }
    }
  }
  if (refErrors === 0) pass('All semantic references resolve to valid primitives');
} else {
  warn('Skipped: missing typography primitives or semantic files');
}

// ── Phase 3: Responsive value ordering ──────────────────────────

heading('Phase 3: Responsive value ordering');

if (webTypoPrims) {
  let orderErrors = 0;
  for (const scaleType of ['fontSize', 'lineHeight']) {
    const scale = webTypoPrims[scaleType];
    if (!scale) continue;
    for (const [step, token] of Object.entries(scale)) {
      if (step === '$type' || step === '$description') continue;
      const mobile = parseFloat(token.$value);
      const resp = token.$extensions?.['tech.vance.origin']?.responsive;
      if (!resp) continue;

      const tablet = parseFloat(resp.tablet);
      const dFloor = parseFloat(resp.desktopFloor);
      const dCeil = parseFloat(resp.desktopCeil);

      if (!(mobile <= tablet && tablet <= dFloor && dFloor <= dCeil)) {
        fail(`${scaleType}.${step}: ordering violation — mobile:${mobile} tablet:${tablet} floor:${dFloor} ceil:${dCeil}`);
        orderErrors++;
      }
      if (dFloor === dCeil) {
        warn(`${scaleType}.${step}: floor equals ceil (${dFloor}px) — will emit flat value, not clamp`);
      }
    }
  }
  if (orderErrors === 0) pass('All responsive values in correct ascending order');
} else {
  warn('Skipped: missing web typography primitives');
}

// ── Phase 4: Output file existence ──────────────────────────────

heading('Phase 4: Output files exist');

const expectedOutputs = [
  'outputs/ts/typography.ts',
  'outputs/ts/responsive-typography.ts',
  'outputs/ts/colors.ts',
  'outputs/ts/spacing.ts',
  'outputs/ts/radius.ts',
  'outputs/ts/index.ts',
  'outputs/css/tokens.css',
  'outputs/json/tokens.json',
  'outputs/tailwind/theme.js',
  'outputs/ai/design-system.md',
];

for (const file of expectedOutputs) {
  fileExists(resolve(ORIGIN, file), file);
}

// ── Phase 5: R object completeness ──────────────────────────────

heading('Phase 5: R object completeness');

const typographyTs = resolve(ORIGIN, 'outputs/ts/typography.ts');
if (existsSync(typographyTs)) {
  const content = readFileSync(typographyTs, 'utf8');
  const rKeys = new Set([...content.matchAll(/^\s+(\w+):\s+\{/gm)].map(m => m[1]));

  // Expected keys from semantic.json categories
  const sizeMap = { s: 'Sm', m: 'Md', l: 'Lg' };
  const expectedKeys = new Set();

  if (typoSem) {
    for (const [category, group] of Object.entries(typoSem)) {
      if (category === '$type') continue;
      const catCamel = category.replace(/-(\w)/g, (_, c) => c.toUpperCase());
      for (const size of Object.keys(group)) {
        if (size === '$type') continue;
        let key;
        if (size === 'standard') {
          key = catCamel;
        } else if (size.includes('-')) {
          const parts = size.split('-');
          key = catCamel + parts.map((p, i) => {
            if (i === 0) return p[0].toUpperCase() + p.slice(1);
            return sizeMap[p] || p[0].toUpperCase() + p.slice(1);
          }).join('');
        } else {
          key = catCamel + (sizeMap[size] || size[0].toUpperCase() + size.slice(1));
        }
        expectedKeys.add(key);
      }
    }

    let missing = 0;
    for (const key of expectedKeys) {
      if (!rKeys.has(key)) {
        fail(`R object missing key: ${key}`);
        missing++;
      }
    }
    if (missing === 0) pass(`All ${expectedKeys.size} expected R keys present`);

    // Check for extra keys in R that aren't in semantic
    for (const key of rKeys) {
      if (!expectedKeys.has(key)) {
        warn(`R object has extra key not in semantic.json: ${key}`);
      }
    }
  }
} else {
  fail('Cannot check R object: typography.ts not found');
}

// ── Phase 6: SEMANTIC_TOKENS completeness ───────────────────────

heading('Phase 6: SEMANTIC_TOKENS completeness');

const responsiveTs = resolve(ORIGIN, 'outputs/ts/responsive-typography.ts');
if (existsSync(responsiveTs)) {
  const content = readFileSync(responsiveTs, 'utf8');
  const semNames = new Set([...content.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]));

  if (typoSem) {
    let missing = 0;
    for (const [category, group] of Object.entries(typoSem)) {
      if (category === '$type') continue;
      for (const size of Object.keys(group)) {
        if (size === '$type') continue;
        const name = `${category}.${size}`;
        if (!semNames.has(name)) {
          fail(`SEMANTIC_TOKENS missing: ${name}`);
          missing++;
        }
      }
    }
    if (missing === 0) pass(`All ${semNames.size} semantic token entries present`);
  }
} else {
  fail('Cannot check SEMANTIC_TOKENS: responsive-typography.ts not found');
}

// ── Phase 7: CSS variable completeness ──────────────────────────

heading('Phase 7: CSS variable completeness');

const tokensCss = resolve(ORIGIN, 'outputs/css/tokens.css');
if (existsSync(tokensCss)) {
  const css = readFileSync(tokensCss, 'utf8');

  if (typoPrims) {
    let missing = 0;
    for (const scaleType of ['fontSize', 'lineHeight']) {
      const prefix = scaleType === 'fontSize' ? '--typo-fs-' : '--typo-lh-';
      const scale = typoPrims[scaleType];
      if (!scale) continue;
      for (const step of Object.keys(scale)) {
        if (step === '$type') continue;
        if (!css.includes(`${prefix}${step}`)) {
          fail(`CSS missing: ${prefix}${step}`);
          missing++;
        }
      }
    }
    if (missing === 0) pass('All primitive CSS variables present');
  }

  // Check semantic CSS variables
  if (typoSem) {
    let missing = 0;
    const semanticNames = [];
    for (const [category, group] of Object.entries(typoSem)) {
      if (category === '$type') continue;
      const catCamel = category.replace(/-(\w)/g, (_, c) => c.toUpperCase());
      for (const size of Object.keys(group)) {
        if (size === '$type') continue;
        let name;
        if (size === 'standard') {
          name = catCamel;
        } else if (size.includes('-')) {
          const sizeMap = { s: 'Sm', m: 'Md', l: 'Lg' };
          const parts = size.split('-');
          name = catCamel + parts.map((p, i) => i === 0 ? p[0].toUpperCase() + p.slice(1) : (sizeMap[p] || p[0].toUpperCase() + p.slice(1))).join('');
        } else {
          const sizeMap = { s: 'Sm', m: 'Md', l: 'Lg' };
          name = catCamel + (sizeMap[size] || size[0].toUpperCase() + size.slice(1));
        }
        semanticNames.push(name);
      }
    }

    for (const name of semanticNames) {
      if (!css.includes(`--type-${name}-size`)) {
        fail(`CSS missing semantic: --type-${name}-size`);
        missing++;
      }
    }
    if (missing === 0) pass(`All ${semanticNames.length} semantic CSS variable sets present`);
  }
} else {
  fail('Cannot check CSS: tokens.css not found');
}

// ── Phase 8: Brand Lab barrel sync ──────────────────────────────

heading('Phase 8: Brand Lab barrel sync');

const brandLabBarrel = resolve(BRAND_LAB, 'src/tokens/index.ts');
if (existsSync(brandLabBarrel) && existsSync(typographyTs)) {
  const barrel = readFileSync(brandLabBarrel, 'utf8');
  const rContent = readFileSync(typographyTs, 'utf8');
  const rKeys = new Set([...rContent.matchAll(/^\s+(\w+):\s+\{/gm)].map(m => m[1]));

  // Find destructured names from _R
  const destructureMatch = barrel.match(/const\s*\{([^}]+)\}\s*=\s*_R/s);
  if (destructureMatch) {
    const names = destructureMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('//'));

    let missing = 0;
    for (const name of names) {
      if (!rKeys.has(name)) {
        fail(`Brand Lab barrel destructures "${name}" but it's not in R object`);
        missing++;
      }
    }
    if (missing === 0) pass(`All ${names.length} destructured token names exist in R`);
  } else {
    warn('Could not parse destructure pattern from Brand Lab barrel');
  }
} else {
  if (!existsSync(brandLabBarrel)) warn('Brand Lab barrel not found (may not be in this repo)');
}

// ── Phase 9: aspora-site-new tokens.css freshness ───────────────

heading('Phase 9: aspora-site-new tokens.css sync');

const siteTokensCss = resolve(SITE_NEW, 'src/styles/tokens.css');
const originTokensCss = resolve(ORIGIN, 'outputs/css/tokens.css');

if (existsSync(siteTokensCss) && existsSync(originTokensCss)) {
  const site = readFileSync(siteTokensCss, 'utf8');
  const origin = readFileSync(originTokensCss, 'utf8');

  if (site === origin) {
    pass('aspora-site-new tokens.css matches Origin output');
  } else {
    fail('aspora-site-new tokens.css is out of sync with Origin output');
    // Show line count difference
    const siteLines = site.split('\n').length;
    const originLines = origin.split('\n').length;
    if (siteLines !== originLines) {
      warn(`  Origin: ${originLines} lines, Site: ${siteLines} lines`);
    }
  }
} else {
  if (!existsSync(siteTokensCss)) warn('aspora-site-new tokens.css not found');
  if (!existsSync(originTokensCss)) fail('Origin tokens.css not found');
}

// ── Summary ─────────────────────────────────────────────────────

heading('Summary');
if (errors === 0 && warnings === 0) {
  console.log(`\x1b[32m  All checks passed.\x1b[0m\n`);
} else if (errors === 0) {
  console.log(`\x1b[33m  ${warnings} warning(s), 0 errors.\x1b[0m\n`);
} else {
  console.log(`\x1b[31m  ${errors} error(s), ${warnings} warning(s). Fix errors before committing.\x1b[0m\n`);
}

process.exit(errors > 0 ? 1 : 0);
