#!/usr/bin/env node

/**
 * figma-export.mjs — Export all icon SVGs from the Figma Origin-components file.
 *
 * Self-contained: discovers icons from the Figma file tree, then batch-exports
 * SVGs via the REST API images endpoint. No pre-generated node list required.
 *
 * Usage:
 *   FIGMA_TOKEN=<pat> node figma-export.mjs
 *
 * Or with an explicit token:
 *   node figma-export.mjs --token=figd_xxx
 *
 * Outputs:
 *   staging/outlined/<id>.svg   — outlined variant SVGs
 *   staging/filled/<id>.svg     — filled variant SVGs
 *   staging/metadata.json       — [{ id, aliases }] for each icon
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STAGING = resolve(__dirname, 'staging');
const OUTLINED_DIR = resolve(STAGING, 'outlined');
const FILLED_DIR = resolve(STAGING, 'filled');

const FILE_KEY = '86sLraTiTmODDdbKOHeGY8';
const ICONS_PAGE_ID = '807:9675';

// Parse token from env or --token=xxx arg
const tokenArg = process.argv.find(a => a.startsWith('--token='));
const TOKEN = tokenArg?.split('=')[1]
  || process.env.FIGMA_TOKEN
  || process.env.FIGMA_ACCESS_TOKEN
  || process.env.FIGMA_PERSONAL_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('Error: No Figma token found.');
  console.error('Set FIGMA_TOKEN env var or pass --token=figd_xxx');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Figma REST helpers
// ---------------------------------------------------------------------------

async function figmaGet(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { 'X-Figma-Token': TOKEN },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma API ${res.status}: ${body}`);
  }
  return res.json();
}

async function getImageUrls(nodeIds) {
  const ids = nodeIds.join(',');
  const data = await figmaGet(
    `/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg`,
  );
  return data.images;
}

async function downloadSvg(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

// ---------------------------------------------------------------------------
// Icon discovery from Figma file tree
// ---------------------------------------------------------------------------

/**
 * Normalize an icon ID: lowercase, replace spaces with hyphens.
 * Preserves special characters like '+' (e.g., 'c++') since those
 * are intentional in Central's naming.
 */
function normalizeId(raw) {
  return raw.toLowerCase().replace(/ /g, '-');
}

function discoverIcons(pageNode) {
  const icons = [];

  for (const frame of pageNode.children || []) {
    if (frame.name === 'Social Media & Brands') {
      // Standalone components inside a nested "icons" frame
      const iconsFrame = (frame.children || []).find(c => c.name === 'icons');
      if (!iconsFrame) continue;
      for (const comp of iconsFrame.children || []) {
        if (comp.type !== 'COMPONENT') continue;
        const parts = comp.name.split(',').map(s => s.trim());
        icons.push({
          id: normalizeId(parts[0]),
          aliases: parts.slice(1).filter(Boolean),
          offId: comp.id,
          onId: comp.id,
          standalone: true,
        });
      }
      continue;
    }

    // Regular category frames with COMPONENT_SET children
    for (const child of frame.children || []) {
      if (child.type !== 'COMPONENT_SET') continue;
      const parts = child.name.split(',').map(s => s.trim());
      const off = (child.children || []).find(c => c.name === 'filled=off');
      const on = (child.children || []).find(c => c.name === 'filled=on');
      if (!off || !on) continue;
      icons.push({
        id: normalizeId(parts[0]),
        aliases: parts.slice(1).filter(Boolean),
        offId: off.id,
        onId: on.id,
        standalone: false,
      });
    }
  }

  return icons;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const t0 = performance.now();
  mkdirSync(OUTLINED_DIR, { recursive: true });
  mkdirSync(FILLED_DIR, { recursive: true });

  // -- 1. Fetch file tree for the Icons page ----------------------------------
  console.log('Fetching Icons page structure from Figma...');
  const fileData = await figmaGet(
    `/files/${FILE_KEY}?ids=${encodeURIComponent(ICONS_PAGE_ID)}&depth=4`,
  );

  const iconsPage = fileData.document.children
    .find(p => p.id === ICONS_PAGE_ID);

  if (!iconsPage) {
    console.error('Icons page not found in file');
    process.exit(1);
  }

  const icons = discoverIcons(iconsPage);
  console.log(`Discovered ${icons.length} icons across ${iconsPage.children.length} categories`);

  // Handle duplicate IDs: some icons share the same name but different node IDs.
  // Deduplicate by appending a suffix for collisions.
  const idCounts = {};
  for (const icon of icons) {
    idCounts[icon.id] = (idCounts[icon.id] || 0) + 1;
  }
  const idSeen = {};
  for (const icon of icons) {
    if (idCounts[icon.id] > 1) {
      idSeen[icon.id] = (idSeen[icon.id] || 0) + 1;
      if (idSeen[icon.id] > 1) {
        icon.id = `${icon.id}-${idSeen[icon.id]}`;
      }
    }
  }

  // -- 2. Collect all unique node IDs -----------------------------------------
  const allNodeIds = new Set();
  for (const icon of icons) {
    allNodeIds.add(icon.offId);
    allNodeIds.add(icon.onId);
  }
  const nodeIdList = [...allNodeIds];
  console.log(`Unique nodes to export: ${nodeIdList.length}`);

  // -- 3. Batch-request export URLs -------------------------------------------
  const BATCH_SIZE = 400;
  const allUrls = {};
  const totalBatches = Math.ceil(nodeIdList.length / BATCH_SIZE);

  for (let i = 0; i < nodeIdList.length; i += BATCH_SIZE) {
    const batch = nodeIdList.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`Requesting export URLs [${batchNum}/${totalBatches}] (${batch.length} nodes)...`);
    const urls = await getImageUrls(batch);
    Object.assign(allUrls, urls);
  }

  const urlCount = Object.values(allUrls).filter(Boolean).length;
  console.log(`Got ${urlCount} export URLs`);

  // -- 4. Download SVGs -------------------------------------------------------
  const CONCURRENCY = 20;
  let downloaded = 0;
  let errors = 0;
  const metadata = [];

  for (let i = 0; i < icons.length; i += CONCURRENCY) {
    const chunk = icons.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (icon) => {
      try {
        const { id, aliases, offId, onId, standalone } = icon;

        // Outlined SVG
        const offUrl = allUrls[offId];
        if (offUrl) {
          const svg = await downloadSvg(offUrl);
          writeFileSync(resolve(OUTLINED_DIR, `${id}.svg`), svg);
        } else {
          console.warn(`  Missing URL: outlined/${id} (${offId})`);
          errors++;
        }

        // Filled SVG
        if (standalone) {
          // Brand icons: same SVG for both variants
          if (offUrl) {
            const svg = await downloadSvg(offUrl);
            writeFileSync(resolve(FILLED_DIR, `${id}.svg`), svg);
          }
        } else {
          const onUrl = allUrls[onId];
          if (onUrl) {
            const svg = await downloadSvg(onUrl);
            writeFileSync(resolve(FILLED_DIR, `${id}.svg`), svg);
          } else {
            console.warn(`  Missing URL: filled/${id} (${onId})`);
            errors++;
          }
        }

        metadata.push({ id, aliases });
        downloaded++;

        if (downloaded % 100 === 0) {
          console.log(`  Progress: ${downloaded}/${icons.length}`);
        }
      } catch (err) {
        console.error(`  Error: ${icon.id} — ${err.message}`);
        errors++;
      }
    }));
  }

  // -- 5. Write metadata.json -------------------------------------------------
  writeFileSync(
    resolve(STAGING, 'metadata.json'),
    JSON.stringify(metadata, null, 2) + '\n',
  );

  // -- Summary ----------------------------------------------------------------
  const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
  console.log(`\nExport complete in ${elapsed}s`);
  console.log(`  Icons exported: ${downloaded}`);
  console.log(`  SVG files: ${downloaded * 2} (${downloaded} outlined + ${downloaded} filled)`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Metadata: staging/metadata.json`);
}

main().catch(err => {
  console.error('\nExport failed:', err);
  process.exit(1);
});
