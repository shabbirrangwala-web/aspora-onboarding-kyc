# Spacing & radius foundations implementation plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create spacing (12 values) and radius (8 values) foundations with DTCG token files, verification scripts, and guidelines.

**Architecture:** Hand-authored DTCG primitives, no generation pipeline. Verification scripts validate structure and values. Follows the same pattern as typography — flat dimension tokens, no semantic layer, no modes.

**Tech Stack:** TypeScript (tsx for verification scripts)

**Specs:**
- `lab/specs/2026-03-18-spacing-foundation-design.md`
- `lab/specs/2026-03-18-radius-foundation-design.md`

---

## File structure

### `foundations/spacing/`
- `primitives.json` — 12 DTCG dimension tokens

### `foundations/radius/`
- `primitives.json` — 8 DTCG dimension tokens (including `full`)

### `lab/pipelines/spacing/`
- `package.json` — tsx, typescript devDependencies
- `verify.ts` — validates spacing token structure and increment grid

### `lab/pipelines/radius/`
- `package.json` — tsx, typescript devDependencies
- `verify.ts` — validates radius token structure and `full` token description

---

### Task 1: Create spacing primitives

**Files:**
- Create: `foundations/spacing/primitives.json`

- [ ] **Step 1: Create primitives.json**

```json
{
  "spacing": {
    "$type": "dimension",
    "4":  { "$value": "4px" },
    "8":  { "$value": "8px" },
    "12": { "$value": "12px" },
    "16": { "$value": "16px" },
    "20": { "$value": "20px" },
    "24": { "$value": "24px" },
    "28": { "$value": "28px" },
    "32": { "$value": "32px" },
    "40": { "$value": "40px" },
    "48": { "$value": "48px" },
    "64": { "$value": "64px" },
    "80": { "$value": "80px" }
  }
}
```

- [ ] **Step 2: Remove .gitkeep and commit**

```bash
git rm foundations/spacing/.gitkeep
git add foundations/spacing/primitives.json
git commit -m "feat(spacing): add spacing primitives in DTCG format"
```

---

### Task 2: Create radius primitives

**Files:**
- Create: `foundations/radius/primitives.json`

Note: There is no `foundations/radius/` directory yet — the architecture doc uses `foundations/spacing/` but radius was planned under the broader spacing/radius umbrella. Create the directory.

- [ ] **Step 1: Create directory**

```bash
mkdir -p foundations/radius
```

- [ ] **Step 2: Create primitives.json**

```json
{
  "radius": {
    "$type": "dimension",
    "4":    { "$value": "4px" },
    "8":    { "$value": "8px" },
    "12":   { "$value": "12px" },
    "16":   { "$value": "16px" },
    "20":   { "$value": "20px" },
    "24":   { "$value": "24px" },
    "36":   { "$value": "36px" },
    "full": { "$value": "9999px", "$description": "Fully rounded — produces pill/capsule shapes" }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add foundations/radius/primitives.json
git commit -m "feat(radius): add radius primitives in DTCG format"
```

---

### Task 3: Create spacing pipeline package and verification script

**Files:**
- Create: `lab/pipelines/spacing/package.json`
- Create: `lab/pipelines/spacing/verify.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@origin/pipeline-spacing",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "verify": "tsx verify.ts"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd lab/pipelines/spacing && npm install
```

- [ ] **Step 3: Create verify.ts**

```typescript
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
```

- [ ] **Step 4: Run verify**

```bash
cd lab/pipelines/spacing && npm run verify
```

Expected: `PASSED: All checks green.`

- [ ] **Step 5: Commit**

```bash
git add lab/pipelines/spacing/
git commit -m "test(spacing): add spacing token verification script"
```

---

### Task 4: Create radius pipeline package and verification script

**Files:**
- Create: `lab/pipelines/radius/package.json`
- Create: `lab/pipelines/radius/verify.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@origin/pipeline-radius",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "verify": "tsx verify.ts"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd lab/pipelines/radius && npm install
```

- [ ] **Step 3: Create verify.ts**

```typescript
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
```

- [ ] **Step 4: Run verify**

```bash
cd lab/pipelines/radius && npm run verify
```

Expected: `PASSED: All checks green.`

- [ ] **Step 5: Commit**

```bash
git add lab/pipelines/radius/
git commit -m "test(radius): add radius token verification script"
```

---

### Task 5: Create spacing guidelines

**Files:**
- Create: `foundations/spacing/guidelines.md`

- [ ] **Step 1: Write guidelines.md**

Content per the spec's guidelines requirements:
- **Scale rationale**: Three increment tiers — 4px for fine control (0–32), 8px for medium jumps (32–48), 16px for large jumps (48–80). Grid doubles at boundaries for natural deceleration.
- **Usage by range**: 4–12 for tight component internals (icon-to-text gaps, compact list padding). 16–32 for standard padding and gaps (card padding, form fields, toolbar gaps). 40–80 for section-level spacing (page margins, section dividers, hero padding).
- **What was dropped and why**: Migration guidance for 0 (absence), 2 (border concern → use 4 or wait for border-width tokens), 6 (use 4 or 8), 36 (use 32 or 40), 56 (use 48 or 64).
- **Relationship to typography**: Same 4px grid as line heights, independent tokens.
- **What this scale is NOT**: Not for border widths, icon sizes, or border radii.

- [ ] **Step 2: Commit**

```bash
git add foundations/spacing/guidelines.md
git commit -m "docs(spacing): add spacing guidelines"
```

---

### Task 6: Create radius guidelines

**Files:**
- Create: `foundations/radius/guidelines.md`

- [ ] **Step 1: Write guidelines.md**

Content per the spec's guidelines requirements:
- **Scale overview**: 4px increments from 4–24, then 36 for large containers, then `full` for pills.
- **When to use each value**: 4 for chips/badges/icon buttons. 8–12 for cards/inputs. 16–24 for modals/bottom sheets. 36 for hero cards. `full` for pill buttons/avatars/status indicators.
- **Platform notes for `radius.full`**: `9999px` works as-is everywhere. CSS `border-radius: 9999px`. SwiftUI can use raw value or `Capsule()`. Compose can use raw value or `RoundedCornerShape(50%)`.
- **What was dropped**: 28px (iOS-only, not in Figma or Android, use 24 or 36).
- **Relationship to Android `AppShapes`**: Origin radius tokens replace the Material3 shape abstraction.
- **Why no semantic layer**: No modes, no composition, no cases where same intent resolves to different values.

- [ ] **Step 2: Commit**

```bash
git add foundations/radius/guidelines.md
git commit -m "docs(radius): add radius guidelines"
```

---

### Task 7: Final verification and push

- [ ] **Step 1: Run spacing verification**

```bash
cd lab/pipelines/spacing && npm run verify
```

Expected: `PASSED: All checks green.`

- [ ] **Step 2: Run radius verification**

```bash
cd lab/pipelines/radius && npm run verify
```

Expected: `PASSED: All checks green.`

- [ ] **Step 3: Verify file structure**

```bash
ls foundations/spacing/ foundations/radius/
```

Expected:
- `foundations/spacing/`: `primitives.json`, `guidelines.md`
- `foundations/radius/`: `primitives.json`, `guidelines.md`

- [ ] **Step 4: Push**

```bash
git push origin main
```
