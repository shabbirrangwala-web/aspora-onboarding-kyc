/**
 * Validates typography token integrity.
 *
 * Reads:  foundations/typography/primitives.json
 *         foundations/typography/semantic.json
 *
 * Usage: npm run verify
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOUNDATIONS_DIR = resolve(__dirname, "../../../foundations/typography");

// ── Load files ──

const primitives = JSON.parse(
  readFileSync(resolve(FOUNDATIONS_DIR, "primitives.json"), "utf8")
);
const semantics = JSON.parse(
  readFileSync(resolve(FOUNDATIONS_DIR, "semantic.json"), "utf8")
);

// ── Helpers ──

function resolvePath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function extractReference(value: string): string | null {
  const match = value.match(/^\{(.+)\}$/);
  return match ? match[1] : null;
}

const errors: string[] = [];
const warnings: string[] = [];

// ── Check primitives inventory ──

const EXPECTED_PRIMITIVE_GROUPS: Record<string, { type: string; tokens: string[] }> = {
  fontSize: {
    type: "dimension",
    tokens: ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000", "1100", "1200"],
  },
  lineHeight: {
    type: "dimension",
    tokens: ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000", "1100", "1200"],
  },
  letterSpacing: {
    type: "dimension",
    tokens: ["tight-4", "tight-3", "tight-2", "tight-1", "tight-0", "none", "wide-1", "wide-2"],
  },
  fontWeight: {
    type: "fontWeight",
    tokens: ["regular", "medium", "semibold", "bold", "heavy"],
  },
  fontFamily: {
    type: "fontFamily",
    tokens: ["primary"],
  },
};

let primitiveCount = 0;
const typoP = primitives.typography;

if (!typoP) {
  errors.push("primitives.json: missing top-level 'typography' key");
} else {
  for (const [group, expected] of Object.entries(EXPECTED_PRIMITIVE_GROUPS)) {
    const g = typoP[group];
    if (!g) {
      errors.push(`primitives: missing group '${group}'`);
      continue;
    }
    if (g.$type !== expected.type) {
      errors.push(`primitives.${group}: expected $type "${expected.type}", found "${g.$type}"`);
    }
    for (const token of expected.tokens) {
      if (!g[token]) {
        errors.push(`primitives.${group}.${token}: missing`);
      } else if (g[token].$value === undefined) {
        errors.push(`primitives.${group}.${token}: has no $value`);
      } else {
        primitiveCount++;
      }
    }
  }
}

if (primitiveCount !== 38) {
  errors.push(`Expected 38 primitive tokens, found ${primitiveCount}`);
}

// Letter spacing DTCG note
const lsGroup = typoP?.letterSpacing;
if (lsGroup) {
  const hasPercentage = Object.keys(lsGroup)
    .filter((k) => !k.startsWith("$"))
    .some((k) => typeof lsGroup[k].$value === "string" && lsGroup[k].$value.includes("%"));
  if (hasPercentage) {
    warnings.push(
      "letterSpacing uses percentage values under $type 'dimension' — deliberate DTCG departure (see spec)"
    );
  }
}

// ── Check semantic inventory ──

const EXPECTED_SEMANTIC_PATHS = [
  "typography.display.s", "typography.display.m", "typography.display.l",
  "typography.header.s", "typography.header.m", "typography.header.l",
  "typography.title.s", "typography.title.m", "typography.title.l",
  "typography.label.s", "typography.label.m", "typography.label.l",
  "typography.label-heavy.s", "typography.label-heavy.m", "typography.label-heavy.l",
  "typography.body.s", "typography.body.m", "typography.body.l",
  "typography.number.s", "typography.number.m", "typography.number.l",
  "typography.number.display-s", "typography.number.display-m", "typography.number.display-l",
  "typography.overline.standard",
];

interface SemanticToken {
  path: string;
  value: Record<string, string>;
  extensions?: any;
}

const tokens: SemanticToken[] = [];
const typoS = semantics.typography;

if (!typoS) {
  errors.push("semantic.json: missing top-level 'typography' key");
} else {
  for (const category of Object.keys(typoS)) {
    if (category.startsWith("$")) continue;
    const group = typoS[category];
    for (const size of Object.keys(group)) {
      if (size.startsWith("$")) continue;
      const token = group[size];
      if (token.$value) {
        tokens.push({
          path: `typography.${category}.${size}`,
          value: token.$value,
          extensions: token.$extensions,
        });
      }
    }
  }

  // Check exact paths
  for (const expected of EXPECTED_SEMANTIC_PATHS) {
    const found = tokens.find((t) => t.path === expected);
    if (!found) {
      errors.push(`semantic: missing expected token '${expected}'`);
    }
  }
  // Check for unexpected tokens
  for (const token of tokens) {
    if (!EXPECTED_SEMANTIC_PATHS.includes(token.path)) {
      errors.push(`semantic: unexpected token '${token.path}'`);
    }
  }
}

if (tokens.length !== 25) {
  errors.push(`Expected 25 semantic tokens, found ${tokens.length}`);
}

// ── Check references and composite structure ──

const EXPECTED_PROPERTIES = [
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing",
];

for (const token of tokens) {
  const valueKeys = Object.keys(token.value);
  if (valueKeys.length !== 5) {
    errors.push(
      `${token.path}: expected 5 $value properties, found ${valueKeys.length} (${valueKeys.join(", ")})`
    );
  }
  for (const prop of EXPECTED_PROPERTIES) {
    if (!(prop in token.value)) {
      errors.push(`${token.path}: missing $value property "${prop}"`);
    }
  }

  for (const [prop, val] of Object.entries(token.value)) {
    if (typeof val !== "string") continue;
    const ref = extractReference(val);
    if (ref) {
      const resolved = resolvePath(primitives, ref);
      if (resolved === undefined) {
        errors.push(`${token.path}.${prop}: reference {${ref}} not found in primitives`);
      } else if (resolved.$value === undefined) {
        errors.push(`${token.path}.${prop}: reference {${ref}} has no $value`);
      }
    }
  }
}

// ── Check tnum extensions ──

const TNUM_REQUIRED = [
  "typography.number.s", "typography.number.m", "typography.number.l",
  "typography.number.display-s", "typography.number.display-m", "typography.number.display-l",
];

for (const path of TNUM_REQUIRED) {
  const token = tokens.find((t) => t.path === path);
  if (!token) continue; // already flagged in inventory check
  const tnum = token.extensions?.["tech.vance.origin"]?.openTypeFeatures?.tnum;
  if (tnum !== true) {
    errors.push(`${path}: missing $extensions.tech.vance.origin.openTypeFeatures.tnum`);
  }
}

// ── Check textCase extensions ──

const UPPERCASE_REQUIRED = [
  "typography.display.s", "typography.display.m", "typography.display.l",
  "typography.number.display-s", "typography.number.display-m", "typography.number.display-l",
  "typography.overline.standard",
];

for (const path of UPPERCASE_REQUIRED) {
  const token = tokens.find((t) => t.path === path);
  if (!token) continue; // already flagged in inventory check
  const textCase = token.extensions?.["tech.vance.origin"]?.textCase;
  if (textCase !== "uppercase") {
    errors.push(`${path}: missing $extensions.tech.vance.origin.textCase = "uppercase"`);
  }
}

// ── Report ──

if (warnings.length > 0) {
  console.log(`\n⚠️  Warnings:`);
  for (const w of warnings) {
    console.log(`   ${w}`);
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Verification failed with ${errors.length} error(s):\n`);
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
} else {
  console.log(`\n✅ Typography tokens verified:`);
  console.log(`   ${primitiveCount} primitive tokens across ${Object.keys(EXPECTED_PRIMITIVE_GROUPS).length} groups`);
  console.log(`   ${tokens.length} semantic tokens (all expected paths present)`);
  console.log(`   All references resolve to valid primitives`);
  console.log(`   tnum extensions present on ${TNUM_REQUIRED.length} Number styles`);
  console.log(`   textCase extensions present on ${UPPERCASE_REQUIRED.length} uppercase styles`);
}
