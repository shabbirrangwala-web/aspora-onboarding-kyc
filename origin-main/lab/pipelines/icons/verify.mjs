#!/usr/bin/env node
/**
 * ICON BUILD VERIFICATION
 *
 * Validates the icon build outputs — SVG integrity, manifest schema,
 * and keys completeness.
 *
 * Usage: node lab/pipelines/icons/verify.mjs
 *
 * Checks:
 *   1. Manifest schema (foundations/iconography/icons.json)
 *   2. SVG file integrity (outputs/icons/{outlined,filled}/*.svg)
 *   3. Keys completeness (outputs/icons/keys.json)
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');

let errors = 0;
let warnings = 0;

function heading(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`); }
function pass(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); }
function fail(msg) { console.log(`  \x1b[31m✗\x1b[0m ${msg}`); errors++; }
function warn(msg) { console.log(`  \x1b[33m!\x1b[0m ${msg}`); warnings++; }

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    fail(`Invalid JSON: ${path} — ${e.message}`);
    return null;
  }
}

// ── Phase 1: Manifest schema ───────────────────────────────────────

heading('Phase 1: Manifest schema');

const manifestPath = resolve(ROOT, 'foundations/iconography/icons.json');

if (!existsSync(manifestPath)) {
  fail('Manifest not found: foundations/iconography/icons.json');
  process.exit(1);
}
pass('Manifest file exists');

const manifest = readJSON(manifestPath);
if (!manifest) process.exit(1);

// id_format
if (manifest.id_format === 'origin.icon.{id}.{variant}') {
  pass('id_format is correct');
} else {
  fail(`id_format expected "origin.icon.{id}.{variant}", got "${manifest.id_format}"`);
}

// source block
const source = manifest.source;
if (source && source.source && source.file && source.exportedAt) {
  pass(`source block present (${source.source}/${source.file}, exported ${source.exportedAt})`);
} else {
  fail('source block missing or incomplete (needs source, file, exportedAt)');
}

// icons array
const icons = manifest.icons;
if (!Array.isArray(icons) || icons.length === 0) {
  fail('icons array missing or empty');
  process.exit(1);
}
pass(`icons array has ${icons.length} entries`);

// Validate each icon entry
let entryErrors = 0;
for (const icon of icons) {
  if (typeof icon.id !== 'string') {
    fail(`Icon entry missing string id: ${JSON.stringify(icon).slice(0, 80)}`);
    entryErrors++;
    continue;
  }
  if (!Array.isArray(icon.aliases)) {
    fail(`${icon.id}: aliases is not an array`);
    entryErrors++;
  }
  if (!icon.variants || typeof icon.variants.outlined !== 'string' || typeof icon.variants.filled !== 'string') {
    fail(`${icon.id}: variants missing outlined/filled paths`);
    entryErrors++;
  }
}
if (entryErrors === 0) {
  pass('All icon entries have id, aliases, and variants');
} else {
  fail(`${entryErrors} icon entries have schema errors`);
}

// Sort order
let sortErrors = 0;
for (let i = 1; i < icons.length; i++) {
  if (icons[i].id.localeCompare(icons[i - 1].id) < 0) {
    if (sortErrors === 0) {
      fail(`Icons not sorted: "${icons[i].id}" comes after "${icons[i - 1].id}"`);
    }
    sortErrors++;
  }
}
if (sortErrors === 0) {
  pass('Icons are sorted alphabetically by id');
}

// ── Phase 2: SVG file integrity ────────────────────────────────────

heading('Phase 2: SVG file integrity');

let missingFiles = 0;
let badSvgStart = 0;
let missingViewBox = 0;
let hardcodedDimensions = 0;
let svgCount = 0;

for (const icon of icons) {
  for (const variant of ['outlined', 'filled']) {
    const relPath = icon.variants[variant];
    const absPath = resolve(ROOT, relPath);

    if (!existsSync(absPath)) {
      if (missingFiles < 5) fail(`Missing SVG: ${relPath}`);
      missingFiles++;
      continue;
    }

    const content = readFileSync(absPath, 'utf8');
    svgCount++;

    if (!content.trimStart().startsWith('<svg')) {
      if (badSvgStart < 5) fail(`SVG does not start with <svg: ${relPath}`);
      badSvgStart++;
    }

    if (!content.includes('viewBox')) {
      if (missingViewBox < 5) fail(`SVG missing viewBox: ${relPath}`);
      missingViewBox++;
    }

    // System icons should not have hardcoded width/height
    const widthMatch = content.match(/<svg[^>]*\bwidth="[^"]*"/);
    const heightMatch = content.match(/<svg[^>]*\bheight="[^"]*"/);
    if (widthMatch || heightMatch) {
      if (hardcodedDimensions < 5) fail(`SVG has hardcoded dimensions: ${relPath}`);
      hardcodedDimensions++;
    }
  }
}

if (missingFiles === 0) {
  pass(`All ${svgCount} SVG files exist on disk`);
} else {
  fail(`${missingFiles} SVG files missing (first 5 shown above)`);
}

if (badSvgStart === 0) {
  pass('All SVGs start with <svg');
} else {
  fail(`${badSvgStart} SVGs have bad start tag`);
}

if (missingViewBox === 0) {
  pass('All SVGs have viewBox attribute');
} else {
  fail(`${missingViewBox} SVGs missing viewBox`);
}

if (hardcodedDimensions === 0) {
  pass('No SVGs have hardcoded width/height');
} else {
  fail(`${hardcodedDimensions} SVGs have hardcoded dimensions`);
}

// ── Phase 3: Keys completeness ─────────────────────────────────────

heading('Phase 3: Keys completeness');

const keysPath = resolve(ROOT, 'outputs/icons/keys.json');

if (!existsSync(keysPath)) {
  fail('Keys file not found: outputs/icons/keys.json');
  process.exit(1);
}
pass('Keys file exists');

const keysData = readJSON(keysPath);
if (!keysData) process.exit(1);

// id_format
if (keysData.id_format === 'origin.icon.{id}.{variant}') {
  pass('Keys id_format is correct');
} else {
  fail(`Keys id_format expected "origin.icon.{id}.{variant}", got "${keysData.id_format}"`);
}

const keys = keysData.keys;
if (!Array.isArray(keys)) {
  fail('Keys array missing');
  process.exit(1);
}

// Build expected keys from manifest
const expectedKeys = new Set();
for (const icon of icons) {
  expectedKeys.add(`origin.icon.${icon.id}.outlined`);
  expectedKeys.add(`origin.icon.${icon.id}.filled`);
}

const actualKeys = new Set(keys);

// Check for missing keys
let missingKeys = 0;
for (const expected of expectedKeys) {
  if (!actualKeys.has(expected)) {
    if (missingKeys < 5) fail(`Missing key: ${expected}`);
    missingKeys++;
  }
}
if (missingKeys === 0) {
  pass(`All ${expectedKeys.size} expected keys present`);
} else {
  fail(`${missingKeys} keys missing from keys.json`);
}

// Check for extra keys
let extraKeys = 0;
for (const actual of actualKeys) {
  if (!expectedKeys.has(actual)) {
    if (extraKeys < 5) fail(`Extra key: ${actual}`);
    extraKeys++;
  }
}
if (extraKeys === 0) {
  pass('No extra keys in keys.json');
} else {
  fail(`${extraKeys} extra keys in keys.json`);
}

// Count match
if (keys.length === expectedKeys.size) {
  pass(`Key count matches: ${keys.length}`);
} else {
  fail(`Key count mismatch: keys.json has ${keys.length}, manifest implies ${expectedKeys.size}`);
}

// Sort order
let keySortErrors = 0;
for (let i = 1; i < keys.length; i++) {
  if (keys[i].localeCompare(keys[i - 1]) < 0) {
    if (keySortErrors === 0) {
      fail(`Keys not sorted: "${keys[i]}" comes after "${keys[i - 1]}"`);
    }
    keySortErrors++;
  }
}
if (keySortErrors === 0) {
  pass('Keys are sorted alphabetically');
}

// ── Summary ────────────────────────────────────────────────────────

heading('Summary');
console.log(`  Icons: ${icons.length}  |  SVGs: ${svgCount}  |  Keys: ${keys.length}`);
if (errors === 0 && warnings === 0) {
  console.log(`\x1b[32m  All checks passed.\x1b[0m\n`);
} else if (errors === 0) {
  console.log(`\x1b[33m  ${warnings} warning(s), 0 errors.\x1b[0m\n`);
} else {
  console.log(`\x1b[31m  ${errors} error(s), ${warnings} warning(s). Fix errors before committing.\x1b[0m\n`);
}

process.exit(errors > 0 ? 1 : 0);
