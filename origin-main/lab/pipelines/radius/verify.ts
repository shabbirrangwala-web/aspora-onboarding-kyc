/**
 * Verifies radius token structure and full token.
 * Usage: npm run verify
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOUNDATIONS_DIR = resolve(__dirname, "../../../foundations/radius");

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

console.log("\n=== Radius Token Verification ===");

// 1. Check DTCG structure
if (primitives.radius?.$type !== "dimension") {
  error('Missing or incorrect $type — expected "dimension"');
}

// 2. Extract values
const tokens: Record<string, string> = {};
for (const [key, entry] of Object.entries(primitives.radius) as [string, any][]) {
  if (key.startsWith("$")) continue;
  if (!entry.$value || typeof entry.$value !== "string") {
    error(`${key}: missing or invalid $value`);
    continue;
  }
  tokens[key] = entry.$value;
}

// 3. Check expected tokens
const EXPECTED_NUMERIC = [4, 8, 12, 16, 20, 24, 36];
const numericTokens = Object.entries(tokens)
  .filter(([key]) => key !== "full")
  .map(([key, val]) => {
    const match = val.match(/^(\d+)px$/);
    if (!match) {
      error(`${key}: invalid $value format "${val}" — expected "<N>px"`);
      return 0;
    }
    if (key !== String(match[1])) {
      error(`Token named "${key}" has value ${match[1]}px — name should match value`);
    }
    return parseInt(match[1]);
  })
  .sort((a, b) => a - b);

for (const val of EXPECTED_NUMERIC) {
  if (!numericTokens.includes(val)) {
    error(`Missing expected value: ${val}px`);
  }
}

for (const val of numericTokens) {
  if (val !== 0 && !EXPECTED_NUMERIC.includes(val)) {
    error(`Unexpected value: ${val}px`);
  }
}

ok(`${numericTokens.length} numeric radius tokens present`);

// 4. Check full token
console.log("\n=== Full Token ===");

if (!tokens.full) {
  error('Missing "full" token');
} else {
  if (tokens.full !== "9999px") {
    error(`full: expected "9999px", got "${tokens.full}"`);
  } else {
    ok('full = "9999px"');
  }

  const fullEntry = primitives.radius.full;
  if (!fullEntry.$description) {
    error("full: missing $description");
  } else {
    ok(`full has $description: "${fullEntry.$description}"`);
  }
}

// 5. Total count
const totalCount = Object.keys(tokens).length;
if (totalCount !== 8) {
  error(`Expected 8 tokens (7 numeric + full), got ${totalCount}`);
} else {
  ok("Token count: 8 (7 numeric + full)");
}

// Summary
console.log("\n=== Summary ===");
console.log(`  Tokens: ${totalCount}`);
console.log(`  Errors: ${errors}`);

if (errors > 0) {
  console.error(`\nFAILED: ${errors} error(s) found.\n`);
  process.exit(1);
} else {
  console.log("\nPASSED: All checks green.\n");
}
