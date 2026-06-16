#!/usr/bin/env node

/**
 * build.mjs — Icon pipeline orchestrator.
 *
 * Reads icons from the local staging directory (populated by a Figma
 * export script), optimizes SVGs, and generates the manifest and keys
 * allowlist.
 *
 * Usage:  node build.mjs          (from lab/pipelines/icons/)
 *    or:  npm run build
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { optimizeSvg } from './optimize.mjs';
import { buildManifest, buildKeys } from './manifest.mjs';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');

const STAGING_DIR = resolve(__dirname, 'staging');
const METADATA_PATH = resolve(STAGING_DIR, 'metadata.json');

const OUTLINED_DIR = resolve(ROOT, 'outputs/icons/outlined');
const FILLED_DIR = resolve(ROOT, 'outputs/icons/filled');
const KEYS_PATH = resolve(ROOT, 'outputs/icons/keys.json');
const MANIFEST_PATH = resolve(ROOT, 'foundations/iconography/icons.json');

// ---------------------------------------------------------------------------
// Console helpers
// ---------------------------------------------------------------------------

function heading(msg) { console.log(`\n\x1b[1m${msg}\x1b[0m`); }
function pass(msg) { console.log(`  \x1b[32m\u2713\x1b[0m ${msg}`); }
function warn(msg) { console.log(`  \x1b[33m!\x1b[0m ${msg}`); }

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const t0 = performance.now();
  let errors = 0;

  // -- 1. Read metadata ------------------------------------------------------

  heading('Reading staging metadata');

  if (!existsSync(METADATA_PATH)) {
    console.error('\n\x1b[31mNo staging/metadata.json found. Run the Figma export first.\x1b[0m');
    process.exit(1);
  }

  const metadata = JSON.parse(readFileSync(METADATA_PATH, 'utf-8'));
  pass(`Found ${metadata.length} icons in staging/metadata.json`);

  // -- 2. Create output directories ------------------------------------------

  heading('Preparing output directories');
  mkdirSync(OUTLINED_DIR, { recursive: true });
  mkdirSync(FILLED_DIR, { recursive: true });
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  pass(`${OUTLINED_DIR.replace(ROOT + '/', '')}`);
  pass(`${FILLED_DIR.replace(ROOT + '/', '')}`);

  // -- 3. Process icons ------------------------------------------------------

  heading('Processing icons');

  const icons = [];

  for (const entry of metadata) {
    const { id, aliases } = entry;

    const outlinedPath = resolve(STAGING_DIR, 'outlined', `${id}.svg`);
    const filledPath = resolve(STAGING_DIR, 'filled', `${id}.svg`);

    // Warn and skip if either SVG is missing
    if (!existsSync(outlinedPath)) {
      errors++;
      warn(`${id}: missing outlined SVG (staging/outlined/${id}.svg)`);
      continue;
    }
    if (!existsSync(filledPath)) {
      errors++;
      warn(`${id}: missing filled SVG (staging/filled/${id}.svg)`);
      continue;
    }

    const outlinedRaw = readFileSync(outlinedPath, 'utf-8');
    const filledRaw = readFileSync(filledPath, 'utf-8');

    const outlinedOpt = optimizeSvg(outlinedRaw);
    const filledOpt = optimizeSvg(filledRaw);

    icons.push({
      id,
      aliases: aliases || [],
      outlinedSvg: outlinedOpt,
      filledSvg: filledOpt,
    });
  }

  pass(`Optimized ${icons.length} icons (${errors} errors)`);

  // -- 4. Write SVG files ----------------------------------------------------

  heading('Writing SVG files');
  for (const icon of icons) {
    writeFileSync(resolve(OUTLINED_DIR, `${icon.id}.svg`), icon.outlinedSvg);
    writeFileSync(resolve(FILLED_DIR, `${icon.id}.svg`), icon.filledSvg);
  }
  pass(`${icons.length} outlined SVGs -> outputs/icons/outlined/`);
  pass(`${icons.length} filled SVGs -> outputs/icons/filled/`);

  // -- 5. Generate manifest --------------------------------------------------

  heading('Generating manifest');

  const exportedAt = metadata.exported || metadata.exportedAt || new Date().toISOString();

  const sourceInfo = {
    source: 'figma',
    file: 'Origin-components',
    exportedAt,
  };
  const manifest = buildManifest(icons, sourceInfo);
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  pass(`${manifest.icons.length} icons -> foundations/iconography/icons.json`);

  // -- 6. Generate keys ------------------------------------------------------

  heading('Generating keys');
  const keys = buildKeys(manifest);
  writeFileSync(KEYS_PATH, JSON.stringify(keys, null, 2) + '\n');
  pass(`${keys.keys.length} keys -> outputs/icons/keys.json`);

  // -- Summary ---------------------------------------------------------------

  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
  heading('Done');
  console.log(`  ${icons.length} icons, ${keys.keys.length} keys in ${elapsed}s`);

  if (errors > 0) {
    warn(`${errors} icon(s) failed — review warnings above`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n\x1b[31mBuild failed:\x1b[0m', err);
  process.exit(1);
});
