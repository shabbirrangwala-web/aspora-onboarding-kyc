# Typography foundation implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the typography foundation for Origin — 38 primitive tokens, 25 semantic styles, a verification script, and usage guidelines.

**Architecture:** Two DTCG JSON files (primitives + semantics) in `foundations/typography/`, a TypeScript verification script in `lab/pipelines/typography/`, and a prose guidelines file. No generation pipeline — all values are hand-authored. The verifier validates referential integrity and extension correctness.

**Tech Stack:** TypeScript (verification script), tsx (runner), JSON (DTCG tokens), Markdown (guidelines)

**Spec:** `lab/specs/2026-03-18-typography-foundation-design.md`

**Commit policy:** No AI co-author attribution in commit messages (org repo).

---

### Task 1: Create primitives.json

**Files:**
- Create: `foundations/typography/primitives.json`
- Delete: `foundations/typography/.gitkeep`

- [ ] **Step 1: Write primitives.json**

Copy the exact JSON from the spec (lines 230–288). The file contains 38 tokens under `typography.*`:
- `fontSize` (12 values, `$type: "dimension"`)
- `lineHeight` (12 values, `$type: "dimension"`)
- `letterSpacing` (8 values, `$type: "dimension"` — deliberate departure from DTCG for percentage values)
- `fontWeight` (5 values, `$type: "fontWeight"`)
- `fontFamily` (1 value, `$type: "fontFamily"`)

```json
{
  "typography": {
    "fontSize": {
      "$type": "dimension",
      "100": { "$value": "11px" },
      "200": { "$value": "12px" },
      "300": { "$value": "14px" },
      "400": { "$value": "16px" },
      "500": { "$value": "20px" },
      "600": { "$value": "22px" },
      "700": { "$value": "24px" },
      "800": { "$value": "28px" },
      "900": { "$value": "32px" },
      "1000": { "$value": "36px" },
      "1100": { "$value": "45px" },
      "1200": { "$value": "57px" }
    },
    "lineHeight": {
      "$type": "dimension",
      "100": { "$value": "12px" },
      "200": { "$value": "16px" },
      "300": { "$value": "20px" },
      "400": { "$value": "24px" },
      "500": { "$value": "28px" },
      "600": { "$value": "32px" },
      "700": { "$value": "36px" },
      "800": { "$value": "40px" },
      "900": { "$value": "44px" },
      "1000": { "$value": "48px" },
      "1100": { "$value": "52px" },
      "1200": { "$value": "56px" }
    },
    "letterSpacing": {
      "$type": "dimension",
      "tight-4": { "$value": "-2%" },
      "tight-3": { "$value": "-1.7%" },
      "tight-2": { "$value": "-1%" },
      "tight-1": { "$value": "-0.9%" },
      "tight-0": { "$value": "-0.6%" },
      "none": { "$value": "0%" },
      "wide-1": { "$value": "0.5%" },
      "wide-2": { "$value": "1.5%" }
    },
    "fontWeight": {
      "$type": "fontWeight",
      "regular": { "$value": 400 },
      "medium": { "$value": 500 },
      "semibold": { "$value": 600 },
      "bold": { "$value": 700 },
      "heavy": { "$value": 900 }
    },
    "fontFamily": {
      "$type": "fontFamily",
      "primary": { "$value": "Haffer" }
    }
  }
}
```

- [ ] **Step 2: Validate JSON parses correctly**

Run: `node -e "JSON.parse(require('fs').readFileSync('foundations/typography/primitives.json', 'utf8')); console.log('Valid JSON')"`
Expected: `Valid JSON`

- [ ] **Step 3: Commit**

```bash
git add foundations/typography/primitives.json
git rm foundations/typography/.gitkeep
git commit -m "feat(typography): add DTCG primitive tokens"
```

---

### Task 2: Create semantic.json

**Files:**
- Create: `foundations/typography/semantic.json`

- [ ] **Step 1: Write semantic.json**

25 composite typography tokens. Key structural patterns:
- `$type: "typography"` set at group level
- `$value` contains only DTCG-standard properties: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`
- Non-standard properties (`textCase`, `openTypeFeatures`) in `$extensions.tech.vance.origin`
- Display (3), Number Display (3), Overline (1) have `textCase: "uppercase"`
- Number (3), Number Display (3) have `openTypeFeatures: { "tnum": true }`

```json
{
  "typography": {
    "display": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1000}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.800}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": { "textCase": "uppercase" }
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1100}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.1000}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": { "textCase": "uppercase" }
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1200}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.1200}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": { "textCase": "uppercase" }
        }
      }
    },
    "header": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.700}",
          "fontWeight": "{typography.fontWeight.bold}",
          "lineHeight": "{typography.lineHeight.600}",
          "letterSpacing": "{typography.letterSpacing.tight-2}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.800}",
          "fontWeight": "{typography.fontWeight.bold}",
          "lineHeight": "{typography.lineHeight.700}",
          "letterSpacing": "{typography.letterSpacing.tight-2}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.900}",
          "fontWeight": "{typography.fontWeight.bold}",
          "lineHeight": "{typography.lineHeight.800}",
          "letterSpacing": "{typography.letterSpacing.tight-2}"
        }
      }
    },
    "title": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.semibold}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.400}",
          "fontWeight": "{typography.fontWeight.semibold}",
          "lineHeight": "{typography.lineHeight.400}",
          "letterSpacing": "{typography.letterSpacing.tight-1}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.600}",
          "fontWeight": "{typography.fontWeight.semibold}",
          "lineHeight": "{typography.lineHeight.500}",
          "letterSpacing": "{typography.letterSpacing.tight-3}"
        }
      }
    },
    "label": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.100}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.wide-1}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.200}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.none}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        }
      }
    },
    "label-heavy": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.100}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.wide-1}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.200}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.none}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        }
      }
    },
    "body": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.200}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.none}"
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.400}",
          "fontWeight": "{typography.fontWeight.regular}",
          "lineHeight": "{typography.lineHeight.400}",
          "letterSpacing": "{typography.letterSpacing.tight-1}"
        }
      }
    },
    "number": {
      "$type": "typography",
      "s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.200}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.none}"
        },
        "$extensions": {
          "tech.vance.origin": { "openTypeFeatures": { "tnum": true } }
        }
      },
      "m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.300}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.300}",
          "letterSpacing": "{typography.letterSpacing.tight-0}"
        },
        "$extensions": {
          "tech.vance.origin": { "openTypeFeatures": { "tnum": true } }
        }
      },
      "l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.400}",
          "fontWeight": "{typography.fontWeight.medium}",
          "lineHeight": "{typography.lineHeight.400}",
          "letterSpacing": "{typography.letterSpacing.tight-1}"
        },
        "$extensions": {
          "tech.vance.origin": { "openTypeFeatures": { "tnum": true } }
        }
      },
      "display-s": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1000}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.800}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase",
            "openTypeFeatures": { "tnum": true }
          }
        }
      },
      "display-m": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1100}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.1000}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase",
            "openTypeFeatures": { "tnum": true }
          }
        }
      },
      "display-l": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.1200}",
          "fontWeight": "{typography.fontWeight.heavy}",
          "lineHeight": "{typography.lineHeight.1200}",
          "letterSpacing": "{typography.letterSpacing.tight-4}"
        },
        "$extensions": {
          "tech.vance.origin": {
            "textCase": "uppercase",
            "openTypeFeatures": { "tnum": true }
          }
        }
      }
    },
    "overline": {
      "$type": "typography",
      "standard": {
        "$value": {
          "fontFamily": "{typography.fontFamily.primary}",
          "fontSize": "{typography.fontSize.100}",
          "fontWeight": "{typography.fontWeight.semibold}",
          "lineHeight": "{typography.lineHeight.200}",
          "letterSpacing": "{typography.letterSpacing.wide-2}"
        },
        "$extensions": {
          "tech.vance.origin": { "textCase": "uppercase" }
        }
      }
    }
  }
}
```

- [ ] **Step 2: Validate JSON parses correctly**

Run: `node -e "JSON.parse(require('fs').readFileSync('foundations/typography/semantic.json', 'utf8')); console.log('Valid JSON')"`
Expected: `Valid JSON`

- [ ] **Step 3: Spot-check reference count**

Run: `node -e "const d=JSON.parse(require('fs').readFileSync('foundations/typography/semantic.json','utf8')); const s=JSON.stringify(d); const refs=(s.match(/\\{typography\\./g)||[]).length; console.log('References:', refs)"`
Expected: References count should be 125 (25 styles × 5 properties each)

- [ ] **Step 4: Commit**

```bash
git add foundations/typography/semantic.json
git commit -m "feat(typography): add DTCG semantic composite tokens"
```

---

### Task 3: Create verification script

**Files:**
- Create: `lab/pipelines/typography/verify.ts`
- Create: `lab/pipelines/typography/package.json`
- Create: `lab/pipelines/typography/tsconfig.json`

- [ ] **Step 1: Write package.json**

Follow the color pipeline pattern (`lab/pipelines/color/package.json`). No culori dependency needed — typography has no generation step, only verification.

```json
{
  "name": "@origin/pipeline-typography",
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

- [ ] **Step 2: Write tsconfig.json**

Same as color pipeline:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["*.ts"]
}
```

- [ ] **Step 3: Write verify.ts**

The script validates both primitives and semantics comprehensively:
1. **Primitive inventory**: exact expected token paths, correct `$type` per group, total count of 38
2. **Semantic inventory**: exact expected 25 token paths (not just count — catches typos like `labelheavy` or `titel`)
3. **Reference resolution**: every `{typography.*}` reference resolves to a valid primitive
4. **Composite structure**: each semantic token has exactly 5 `$value` properties
5. **Extensions**: tnum on all 6 Number styles, textCase on all 7 uppercase styles
6. **Letter spacing note**: logs a warning that percentage values are a deliberate DTCG departure (not an error)

```typescript
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
```

- [ ] **Step 4: Install dependencies**

Run: `cd lab/pipelines/typography && npm install`
Expected: tsx and typescript installed

- [ ] **Step 5: Run verification**

Run: `cd lab/pipelines/typography && npm run verify`
Expected:
```
⚠️  Warnings:
   letterSpacing uses percentage values under $type 'dimension' — deliberate DTCG departure (see spec)

✅ Typography tokens verified:
   38 primitive tokens across 5 groups
   25 semantic tokens (all expected paths present)
   All references resolve to valid primitives
   tnum extensions present on 6 Number styles
   textCase extensions present on 7 uppercase styles
```

- [ ] **Step 6: Commit**

```bash
git add lab/pipelines/typography/
git commit -m "feat(typography): add token verification script"
```

---

### Task 4: Write guidelines.md

**Files:**
- Create: `foundations/typography/guidelines.md`

- [ ] **Step 1: Write guidelines.md**

Follow the structure outlined in the spec (lines 603–613). Cover these sections:

```markdown
# Typography guidelines

## Font family

Haffer is the sole typeface for Aspora. There is no accent font — weight creates hierarchy. PP Neue Corp Narrow Bold (the previous accent font) is retired; Display Heavy fills that role.

## Weight roles

| Weight | Value | Role | Used by |
|---|---|---|---|
| Heavy | 900 | Display and accent. Large, uppercase hero text and number displays. | Display, Number Display |
| Bold | 700 | Section headings. Primary structural hierarchy. | Header |
| SemiBold | 600 | Titles and overlines. Secondary structural hierarchy. | Title, Overline |
| Medium | 500 | Emphasized labels and tabular numbers. Subtle weight bump for distinction. | Label heavy, Number |
| Regular | 400 | Body text and labels. Default reading weight. | Body, Label |

## Type scale

### Display
Hero moments, splash screens, large promotional numbers. Always uppercase (brand rule). Heavy weight at 36/45/57px. Use sparingly — these are for impact, not information density.

### Header
Section structure within a screen. Bold weight at 24/28/32px. Use for screen titles, section headers, and primary navigation labels.

### Title
Card titles, list item headers, sub-section labels. SemiBold weight at 14/16/22px. The workhorse for giving structure within content areas.

### Label
Form labels, metadata, timestamps, secondary information. Regular weight at 11/12/14px. Designed to be readable but visually subordinate to body text.

### Label heavy
Tabs, buttons, emphasized metadata. Medium weight at the same sizes as Label (11/12/14px). Use when a label needs to carry more visual weight without changing size.

### Body
Readable content — descriptions, explanations, terms. Regular weight at 12/14/16px. Optimized for comfortable reading in both short and medium-length passages.

### Number
Tabular numeric data — transaction amounts, table cells, inline values. Medium weight at 12/14/16px with tabular figures (tnum) enabled. Ensures digit columns align vertically.

### Number display
Hero amounts — account balances, transfer totals, large financial figures. Heavy weight at 36/45/57px with tabular figures (tnum) and uppercase. Combines Display's visual impact with Number's alignment precision.

### Overline
Category tags, section labels, metadata flags. SemiBold weight at 11px, always uppercase with wide tracking (+1.5%). A single style — no size variants.

## Tabular numbers (tnum)

### When to use
- Financial amounts in lists and tables
- Transaction histories
- Dashboards and reporting
- Timers, OTP countdowns, live-updating metrics
- Any UI where numeric alignment supports scanning

### When to avoid
- Marketing surfaces
- Long-form reading
- Headings and editorial copy
- Short inline numbers in sentences (e.g., "3 items")

### Platform code (outside Number styles)
When applying tnum outside the dedicated Number styles, use platform modifiers:

**CSS:**
```css
font-variant-numeric: tabular-nums;
```

**SwiftUI:**
```swift
Text("$1,234.56")
    .monospacedDigit()
```

**Compose:**
```kotlin
Text(
    text = "$1,234.56",
    style = Theme.typography.BodyMRegular.copy(
        fontFeatureSettings = "tnum"
    )
)
```

## Uppercase rules

Three categories enforce uppercase via `textCase` in their token extensions:

- **Display** (S/M/L) — brand rule. All display text is uppercase.
- **Number Display** (S/M/L) — inherits from Display. Uppercase is harmless on digits and correct for adjacent currency codes.
- **Overline** (Standard) — category tag convention. Always uppercase with wide tracking.

All other styles use default case. Do not manually uppercase Header, Title, Label, or Body text — if content needs to be uppercase, use Display or Overline.

## OpenType features

Haffer supports the following OpenType features:

| Feature | Status in tokens | Notes |
|---|---|---|
| Tabular figures (tnum) | Baked into Number styles via `$extensions` | Applied automatically when using Number tokens |
| Slashed zero (zero) | Available, not in tokens | Toggle per-instance in Figma or apply in code |
| Ligatures (liga) | Available, not in tokens | On by default in most renderers |
| Contextual alternates (calt) | Available, not in tokens | On by default in most renderers |
| Fractions (frac) | Available, not in tokens | Toggle per-instance when displaying fractions |

Only tnum is encoded in the token system. Other features are available for per-instance use but are not part of the design system's token contract.

## Primitive scale rationale

### Font sizes
Hand-picked, not mathematically derived. The 12 values (11–57px) approximate a major second (1.125) scale but are rounded to practical integers. Constraint is enforced at the semantic layer — not every primitive needs a semantic consumer. The primitive layer provides a complete vocabulary for future styles without requiring scale changes.

### Line heights
12 values on a 4px grid, starting from 12px. Independent from the spacing foundation but on the same rhythmic grid. Changing a spacing value does not change a line height — the relationship is coincidental, not coupled.

Display/L has a line height (56px) smaller than its font size (57px). This tight leading is intentional for large uppercase display text, where conventional line height ratios create excessive visual spacing.

### Letter spacing
8 curated values from -2% to +1.5%. Positive tracking for small and uppercase text (aids legibility at small sizes), progressively tighter as size increases (large text needs negative tracking to avoid appearing loose).

Note: percentage-based letter spacing is a deliberate departure from DTCG `dimension` type (which requires px/rem). Converting to absolute values would couple letter spacing to font size, breaking the composability of the primitive layer.
```

- [ ] **Step 2: Commit**

```bash
git add foundations/typography/guidelines.md
git commit -m "docs(typography): add usage guidelines"
```

---

### Task 5: Final verification and push

**Files:**
- No new files

- [ ] **Step 1: Run full verification**

Run: `cd lab/pipelines/typography && npm run verify`
Expected: All checks pass

- [ ] **Step 2: Verify file structure**

Run: `ls -la foundations/typography/`
Expected:
```
guidelines.md
primitives.json
semantic.json
```

- [ ] **Step 3: Push**

Run: `git push`
Expected: All commits pushed to origin/main
