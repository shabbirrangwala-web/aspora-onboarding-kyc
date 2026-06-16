/**
 * Validates migrated output against the ground truth snapshot from color-theory.
 * Compares every primitive hex and every semantic alias to ensure exact parity.
 *
 * Usage: npm run validate
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOUNDATIONS_DIR = resolve(__dirname, "../../../foundations/color");

// ── Load files ──

const primitives = JSON.parse(readFileSync(resolve(FOUNDATIONS_DIR, "primitives.json"), "utf-8"));
const lightTokens = JSON.parse(readFileSync(resolve(FOUNDATIONS_DIR, "semantic.light.json"), "utf-8"));
const darkTokens = JSON.parse(readFileSync(resolve(FOUNDATIONS_DIR, "semantic.dark.json"), "utf-8"));
const expected = JSON.parse(readFileSync(resolve(__dirname, "expected-output.json"), "utf-8"));

let errors = 0;

function fail(msg: string) {
  console.error(`  FAIL: ${msg}`);
  errors++;
}

function pass(msg: string) {
  console.log(`  OK:   ${msg}`);
}

// ── 1. Validate every primitive hex ──
console.log("\n=== Primitive Hex Validation ===");

let primChecked = 0;
for (const [rampName, steps] of Object.entries(expected.primitives) as [string, Record<string, string>][]) {
  const ramp = primitives.color[rampName];
  if (!ramp) {
    fail(`Missing ramp: ${rampName}`);
    continue;
  }

  for (const [step, expectedHex] of Object.entries(steps)) {
    const entry = ramp[step];
    if (!entry) {
      fail(`Missing step: ${rampName}/${step}`);
      continue;
    }
    if (entry.$value !== expectedHex) {
      fail(`${rampName}/${step}: expected=${expectedHex} actual=${entry.$value}`);
    }
    primChecked++;
  }
}

if (primChecked === expected.counts.primitives) {
  pass(`All ${primChecked} primitive hex values match`);
}

// ── 2. Validate semantic aliases ──
console.log("\n=== Semantic Alias Validation ===");

function resolveAlias(ref: string): string {
  const match = ref.match(/^\{color\.(.+)\.(\d+)\}$/);
  if (!match) return ref;
  return `${match[1]}/${match[2]}`;
}

function flattenSemantics(dtcg: any): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [groupName, group] of Object.entries(dtcg.color) as [string, any][]) {
    if (groupName.startsWith("$")) continue;
    for (const [tokenName, token] of Object.entries(group) as [string, any][]) {
      if (tokenName.startsWith("$")) continue;
      result[`${groupName}/${tokenName}`] = resolveAlias(token.$value);
    }
  }
  return result;
}

const lightActual = flattenSemantics(lightTokens);
const darkActual = flattenSemantics(darkTokens);

let lightChecked = 0;
for (const [path, expectedRef] of Object.entries(expected.semantics.light) as [string, string][]) {
  const actual = lightActual[path];
  if (!actual) {
    fail(`Light: missing token "${path}"`);
  } else if (actual !== expectedRef) {
    fail(`Light ${path}: expected=${expectedRef} actual=${actual}`);
  }
  lightChecked++;
}

let darkChecked = 0;
for (const [path, expectedRef] of Object.entries(expected.semantics.dark) as [string, string][]) {
  const actual = darkActual[path];
  if (!actual) {
    fail(`Dark: missing token "${path}"`);
  } else if (actual !== expectedRef) {
    fail(`Dark ${path}: expected=${expectedRef} actual=${actual}`);
  }
  darkChecked++;
}

pass(`Light: ${lightChecked} aliases checked`);
pass(`Dark: ${darkChecked} aliases checked`);

// ── 3. Validate anchors ──
console.log("\n=== Anchor Validation ===");

for (const [rampName, anchorData] of Object.entries(expected.anchors) as [string, { step: number; hex: string }][]) {
  const ramp = primitives.color[rampName];
  if (!ramp) {
    fail(`Anchor ramp "${rampName}" not found`);
    continue;
  }
  const entry = ramp[String(anchorData.step)];
  if (!entry) {
    fail(`Anchor ${rampName}/${anchorData.step} not found`);
    continue;
  }
  if (entry.$value !== anchorData.hex) {
    fail(`Anchor ${rampName}/${anchorData.step}: expected=${anchorData.hex} actual=${entry.$value}`);
  }
}
pass(`All ${Object.keys(expected.anchors).length} anchors verified`);

// ── 4. Count validation ──
console.log("\n=== Count Validation ===");

const rampCount = Object.keys(primitives.color).filter(k => !k.startsWith("$")).length;
if (rampCount !== expected.counts.ramps) {
  fail(`Ramps: expected=${expected.counts.ramps} actual=${rampCount}`);
} else {
  pass(`Ramps: ${rampCount}`);
}

if (primChecked !== expected.counts.primitives) {
  fail(`Primitives: expected=${expected.counts.primitives} actual=${primChecked}`);
} else {
  pass(`Primitives: ${primChecked}`);
}

const lightCount = Object.keys(lightActual).length;
if (lightCount !== expected.counts.semanticTokens) {
  fail(`Semantic tokens (light): expected=${expected.counts.semanticTokens} actual=${lightCount}`);
} else {
  pass(`Semantic tokens: ${lightCount} per mode`);
}

// ── Summary ──
console.log("\n=== Validation Summary ===");
if (errors > 0) {
  console.error(`\nFAILED: ${errors} mismatch(es) found against expected baseline.\n`);
  process.exit(1);
} else {
  console.log(`\nPASSED: All values match color-theory baseline.\n`);
}
