import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const iconsDir = join(process.cwd(), 'public/icons');
const inputFile = process.argv[2];

const data = JSON.parse(readFileSync(inputFile, 'utf-8'));

let count = 0;
for (const [path, svg] of Object.entries(data)) {
  const filePath = join(iconsDir, `${path}.svg`);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, svg);
  count++;
}

console.log(`Wrote ${count} icons`);
