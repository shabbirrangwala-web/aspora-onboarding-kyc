/**
 * Verifies color token integrity across all foundation files.
 * Checks primitive structure, semantic alias resolution, group coverage,
 * anchor fidelity, light/dark parity, and scope coverage.
 *
 * Usage: npm run verify
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOUNDATIONS_DIR = resolve(__dirname, "../../../foundations/color");
const PLUGIN_DIR = resolve(__dirname, "../../figma-plugin/src/main");

let errors = 0;
let warnings = 0;

function error(msg: string) {
  console.error(`  ERROR: ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`  WARN:  ${msg}`);
  warnings++;
}

function ok(msg: string) {
  console.log(`  OK:    ${msg}`);
}

// ── Load files ──

const primitives = JSON.parse(readFileSync(resolve(FOUNDATIONS_DIR, "primitives.json"), "utf-8"));
const lightTokens = JSON.parse(readFileSync(resolve(FOUNDATIONS_DIR, "semantic.light.json"), "utf-8"));
const darkTokens = JSON.parse(readFileSync(resolve(FOUNDATIONS_DIR, "semantic.dark.json"), "utf-8"));
const anchors = JSON.parse(readFileSync(resolve(FOUNDATIONS_DIR, "anchors.json"), "utf-8"));

// ── 1. Verify primitive structure ──
console.log("\n=== Primitive Structure ===");

const EXPECTED_CHROMATIC_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 975, 1000];
const EXPECTED_ALPHA_STEPS = [100, 70, 40, 16, 8];
const ALPHA_RAMPS = new Set(["white-alpha", "black-alpha"]);

const primitiveNames = new Set<string>();
let primitiveCount = 0;

for (const [rampName, rampObj] of Object.entries(primitives.color) as [string, any][]) {
  if (rampName.startsWith("$")) continue; // skip $type

  const isAlpha = ALPHA_RAMPS.has(rampName);
  const expectedSteps = isAlpha ? EXPECTED_ALPHA_STEPS : EXPECTED_CHROMATIC_STEPS;
  const actualSteps = Object.keys(rampObj).filter(k => !k.startsWith("$")).map(Number).sort((a, b) => a - b);

  // Check step count
  if (actualSteps.length !== expectedSteps.length) {
    error(`Ramp "${rampName}" has ${actualSteps.length} steps, expected ${expectedSteps.length}`);
  }

  // Check exact step values
  for (const expected of expectedSteps) {
    if (!actualSteps.includes(expected)) {
      error(`Ramp "${rampName}" missing step ${expected}`);
    }
  }
  for (const actual of actualSteps) {
    if (!expectedSteps.includes(actual)) {
      error(`Ramp "${rampName}" has unexpected step ${actual}`);
    }
  }

  // Validate each step has a $value
  for (const [step, entry] of Object.entries(rampObj) as [string, any][]) {
    if (step.startsWith("$")) continue;
    if (!entry.$value || typeof entry.$value !== "string") {
      error(`${rampName}/${step}: missing or invalid $value`);
    } else {
      // Validate hex format
      if (!/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(entry.$value)) {
        error(`${rampName}/${step}: invalid hex format: ${entry.$value}`);
      }
      primitiveNames.add(`${rampName}/${step}`);
      primitiveCount++;
    }
  }
}

ok(`${primitiveCount} primitive variables across ${Object.keys(primitives.color).filter(k => !k.startsWith("$")).length} ramps`);

// Check total count
if (primitiveCount !== 153) {
  error(`Expected 153 primitives, got ${primitiveCount}`);
} else {
  ok("Primitive count: 153");
}

// ── 2. Verify anchors ──
console.log("\n=== Anchor Verification ===");

for (const [rampName, config] of Object.entries(anchors) as [string, any][]) {
  if (config.isNeutral) {
    // Neutral should have no anchor markers
    const ramp = primitives.color[rampName];
    if (ramp) {
      for (const [step, entry] of Object.entries(ramp) as [string, any][]) {
        if (step.startsWith("$")) continue;
        if (entry.$description === "Brand anchor") {
          error(`Neutral ramp should not have anchor markers, found at step ${step}`);
        }
      }
      ok(`${rampName}: no anchor (correct for neutral)`);
    }
    continue;
  }

  const ramp = primitives.color[rampName];
  if (!ramp) {
    error(`Anchor ramp "${rampName}" not found in primitives`);
    continue;
  }

  const anchorStep = String(config.step);
  const entry = ramp[anchorStep];
  if (!entry) {
    error(`${rampName}: anchor step ${anchorStep} not found`);
    continue;
  }

  if (entry.$description !== "Brand anchor") {
    error(`${rampName}/${anchorStep}: missing "Brand anchor" description`);
  }

  if (entry.$value.toLowerCase() !== config.hex.toLowerCase()) {
    error(`${rampName}/${anchorStep}: hex mismatch — expected ${config.hex}, got ${entry.$value}`);
  } else {
    ok(`${rampName}: anchor at step ${anchorStep} = ${entry.$value}`);
  }
}

// Neutral step 50 should be pure white
const neutral50 = primitives.color?.neutral?.["50"];
if (neutral50?.$value !== "#ffffff") {
  error(`neutral/50 should be #ffffff, got ${neutral50?.$value}`);
} else {
  ok("neutral/50 = #ffffff (pure white)");
}

// ── 3. Verify semantic tokens ──
console.log("\n=== Semantic Tokens ===");

const EXPECTED_TOKEN_PATHS = [
  "surface/primary", "surface/secondary", "surface/tertiary", "surface/overlay", "surface/contrast",
  "on-surface/primary", "on-surface/secondary", "on-surface/tertiary", "on-surface/disabled", "on-surface/contrast",
  "border/primary", "border/secondary", "border/disabled", "border/contrast",
  "interactive/primary", "interactive/secondary", "interactive/disabled", "interactive/contrast",
  "error/solid", "error/light", "error/on-solid", "error/on-light", "error/border",
  "success/solid", "success/light", "success/on-solid", "success/on-light", "success/border",
  "warning/solid", "warning/light", "warning/on-solid", "warning/on-light", "warning/border",
  "accent/solid", "accent/light", "accent/on-solid", "accent/on-light", "accent/border",
  "on-brand/light", "on-brand/light-secondary", "on-brand/light-disabled",
  "on-brand/dark", "on-brand/dark-secondary", "on-brand/dark-disabled",
  "overlay/scrim", "overlay/solid-hover", "overlay/solid-pressed", "overlay/light-hover", "overlay/light-pressed",
  "brand/maroon", "brand/crimson", "brand/teal", "brand/blue",
  "brand/peach", "brand/gold", "brand/lime",
];

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
      result[`${groupName}/${tokenName}`] = token.$value;
    }
  }
  return result;
}

function verifySemanticFile(label: string, dtcg: any) {
  const tokens = flattenSemantics(dtcg);
  const tokenPaths = Object.keys(tokens);

  // Check exact expected paths
  for (const path of EXPECTED_TOKEN_PATHS) {
    if (!(path in tokens)) {
      error(`${label}: missing token "${path}"`);
    }
  }

  // Check for extra tokens
  for (const path of tokenPaths) {
    if (!EXPECTED_TOKEN_PATHS.includes(path)) {
      error(`${label}: unexpected token "${path}"`);
    }
  }

  // Count check
  if (tokenPaths.length !== 56) {
    error(`${label}: expected 56 tokens, got ${tokenPaths.length}`);
  } else {
    ok(`${label}: ${tokenPaths.length} tokens`);
  }

  // Verify all aliases resolve to existing primitives
  for (const [path, ref] of Object.entries(tokens)) {
    const resolved = resolveAlias(ref);
    if (!primitiveNames.has(resolved)) {
      error(`${label}: ${path} references "${resolved}" which doesn't exist in primitives`);
    }
  }
}

verifySemanticFile("Light", lightTokens);
verifySemanticFile("Dark", darkTokens);

// ── 4. Light/dark parity ──
console.log("\n=== Light/Dark Parity ===");

const lightPaths = new Set(Object.keys(flattenSemantics(lightTokens)));
const darkPaths = new Set(Object.keys(flattenSemantics(darkTokens)));

for (const path of lightPaths) {
  if (!darkPaths.has(path)) {
    error(`Token "${path}" exists in light but not dark`);
  }
}
for (const path of darkPaths) {
  if (!lightPaths.has(path)) {
    error(`Token "${path}" exists in dark but not light`);
  }
}
if (lightPaths.size === darkPaths.size) {
  ok(`Light and dark files have identical token paths (${lightPaths.size} each)`);
}

// ── 5. Group presence ──
console.log("\n=== Group Presence ===");

const EXPECTED_GROUPS = ["surface", "on-surface", "border", "interactive", "error", "success", "warning", "accent", "on-brand", "overlay", "brand"];
const actualGroups = new Set(
  Object.keys(flattenSemantics(lightTokens)).map(p => p.split("/")[0])
);

for (const g of EXPECTED_GROUPS) {
  if (!actualGroups.has(g)) {
    error(`Missing token group: ${g}`);
  }
}
ok(`All ${EXPECTED_GROUPS.length} token groups present: ${[...actualGroups].join(", ")}`);

// ── 6. Scope coverage (if plugin exists) ──
console.log("\n=== Scope Coverage ===");

try {
  const scopeConfigPath = resolve(PLUGIN_DIR, "scope-config.ts");
  const scopeContent = readFileSync(scopeConfigPath, "utf-8");

  // Parse SCOPE_MAP keys from the TypeScript file
  const scopeMapMatch = scopeContent.match(/SCOPE_MAP[^{]*\{([^}]+)\}/s);
  if (scopeMapMatch) {
    const entries = scopeMapMatch[1].matchAll(/"([^"]+)"/g);
    const mappedGroups = new Set<string>();
    for (const match of entries) {
      // Only take the keys (odd-indexed quotes are values like ALL_FILLS)
      mappedGroups.add(match[1]);
    }

    for (const group of actualGroups) {
      if (!mappedGroups.has(group)) {
        error(`Scope coverage: group "${group}" has no scope mapping in scope-config.ts — will silently default to ALL_SCOPES`);
      }
    }
    ok("All semantic groups have scope mappings");
  } else {
    warn("Could not parse SCOPE_MAP from scope-config.ts");
  }
} catch {
  warn("scope-config.ts not found (Figma plugin not yet set up) — skipping scope coverage check");
}

// ── Summary ──
console.log("\n=== Summary ===");
console.log(`  Primitives: ${primitiveCount} (${Object.keys(primitives.color).filter(k => !k.startsWith("$")).length} ramps)`);
console.log(`  Semantics:  ${lightPaths.size} tokens x 2 modes`);
console.log(`  Aliases:    ${lightPaths.size * 2} total`);
console.log(`  Errors:     ${errors}`);
console.log(`  Warnings:   ${warnings}`);

if (errors > 0) {
  console.error(`\nFAILED: ${errors} error(s) found.\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\nPASSED with ${warnings} warning(s).\n`);
} else {
  console.log("\nPASSED: All checks green.\n");
}
