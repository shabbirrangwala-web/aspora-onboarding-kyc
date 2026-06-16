import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const iconsDir = join(process.cwd(), 'public/icons');
const inputFile = process.argv[2];

const raw = readFileSync(inputFile, 'utf-8');
const entries = raw.split('\n---\n');
let count = 0;

for (const entry of entries) {
  const sepIdx = entry.indexOf('::');
  if (sepIdx === -1) continue;
  const path = entry.substring(0, sepIdx).trim();
  const svg = entry.substring(sepIdx + 2).trim();
  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) continue;

  const filePath = join(iconsDir, `${path}.svg`);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, svg);
  count++;
}

console.log(`Wrote ${count} SVG files`);
