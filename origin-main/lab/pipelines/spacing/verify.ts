/**
 * Verifies spacing token structure and increment grid.
 * Usage: npm run verify
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOUNDATIONS_DIR = resolve(__dirname, "../../../foundations/spacing");

let errors = 0;

function error(msg: string) {
  console.error(`  ERROR: ${msg}`);
  errors++;
}

function ok(msg: string) {
  console.log(`  OK:    ${msg}`);
}

// Load tokens
const primitives = JSON.parse(readFileSync(resolve(FOUNDATIONS_DIR, "primitives.json"), "utf-8"));

console.log("\n=== Spacing Token Verification ===");

// 1. Check DTCG structure
if (primitives.spacing?.$type !== "dimension") {
  error('Missing or incorrect $type — expected "dimension"');
}

// 2. Extract values
const tokens: Record<string, number> = {};
for (const [key, entry] of Object.entries(primitives.spacing) as [string, any][]) {
  if (key.startsWith("$")) continue;
  const match = entry.$value?.match(/^(\d+)px$/);
  if (!match) {
    error(`${key}: invalid $value format "${entry.$value}" — expected "<N>px"`);
    continue;
  }
  tokens[key] = parseInt(match[1]);
}

// 3. Check expected values
const EXPECTED = [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80];
const actual = Object.values(tokens).sort((a, b) => a - b);

if (actual.length !== EXPECTED.length) {
  error(`Expected ${EXPECTED.length} tokens, got ${actual.length}`);
}

for (const val of EXPECTED) {
  if (!actual.includes(val)) {
    error(`Missing expected value: ${val}px`);
  }
}

for (const val of actual) {
  if (!EXPECTED.includes(val)) {
    error(`Unexpected value: ${val}px`);
  }
}

ok(`${actual.length} spacing tokens present`);

// 4. Verify increment grid
console.log("\n=== Increment Grid ===");

// 4px tier: 4 to 32
const tier4 = actual.filter(v => v >= 4 && v <= 32);
for (let i = 1; i < tier4.length; i++) {
  const diff = tier4[i] - tier4[i - 1];
  if (diff !== 4) {
    error(`4px tier: ${tier4[i - 1]} → ${tier4[i]} is ${diff}px, expected 4px`);
  }
}
ok(`4px tier (4–32): ${tier4.join(", ")}`);

// 8px tier: 32 to 48
const tier8 = actual.filter(v => v >= 32 && v <= 48);
for (let i = 1; i < tier8.length; i++) {
  const diff = tier8[i] - tier8[i - 1];
  if (diff !== 8) {
    error(`8px tier: ${tier8[i - 1]} → ${tier8[i]} is ${diff}px, expected 8px`);
  }
}
ok(`8px tier (32–48): ${tier8.join(", ")}`);

// 16px tier: 48 to 80
const tier16 = actual.filter(v => v >= 48 && v <= 80);
for (let i = 1; i < tier16.length; i++) {
  const diff = tier16[i] - tier16[i - 1];
  if (diff !== 16) {
    error(`16px tier: ${tier16[i - 1]} → ${tier16[i]} is ${diff}px, expected 16px`);
  }
}
ok(`16px tier (48–80): ${tier16.join(", ")}`);

// 5. Token naming matches value
console.log("\n=== Name-Value Consistency ===");
for (const [key, val] of Object.entries(tokens)) {
  if (key !== String(val)) {
    error(`Token named "${key}" has value ${val}px — name should match value`);
  }
}
ok("All token names match their pixel values");

// Summary
console.log("\n=== Summary ===");
console.log(`  Tokens: ${actual.length}`);
console.log(`  Errors: ${errors}`);

if (errors > 0) {
  console.error(`\nFAILED: ${errors} error(s) found.\n`);
  process.exit(1);
} else {
  console.log("\nPASSED: All checks green.\n");
}
