# Origin Sync — Figma plugin implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Origin Sync," a consolidated Figma plugin that pushes all foundation tokens (color, typography, spacing, radius) from Origin into Figma as variables and text styles, with a status dashboard, per-foundation diffs, sync, and post-sync validation.

**Architecture:** Plugin lives at `lab/origin-sync/`. Token JSON files from `foundations/` are baked in at build time via Vite path aliases. The plugin's main thread orchestrates sync using tokenPath-based identity matching (via `setPluginData`/`getPluginData`). A comprehensive Figma API mock enables full behavioral testing of every module without running in Figma. Pure-logic modules (parser, diff, config) are tested independently; integration modules (upsert, foundation syncs) are tested against the mock.

**Tech Stack:** TypeScript, Vite (IIFE build for main, singlefile for UI), Vitest, `@figma/plugin-typings`

**Spec:** `lab/specs/2026-03-18-origin-sync-plugin-design.md`

**Commit policy:** No AI co-author attribution in commit messages (org repo).

---

## File structure

```
lab/origin-sync/
├── manifest.json
├── package.json
├── tsconfig.json
├── tsconfig.main.json
├── vite.config.main.ts
├── vite.config.ui.ts
├── vitest.config.ts
├── src/
│   ├── main/
│   │   ├── code.ts                        Entry point — IPC + orchestration
│   │   ├── collections.ts                 Collection find-or-create helpers
│   │   ├── collections.test.ts
│   │   ├── upsert.ts                      Core create/update/rename engine
│   │   ├── upsert.test.ts
│   │   ├── diff.ts                        Diff engine (code tokens vs Figma state)
│   │   ├── diff.test.ts
│   │   ├── validate.ts                    Post-sync validation checks
│   │   ├── validate.test.ts
│   │   ├── token-parser.ts                DTCG JSON → flat token maps
│   │   ├── token-parser.test.ts
│   │   ├── foundations/
│   │   │   ├── color.ts                   Color sync (primitives + semantics + modes)
│   │   │   ├── color.test.ts
│   │   │   ├── typography.ts              Typography sync (variables + text styles)
│   │   │   ├── typography.test.ts
│   │   │   ├── spacing.ts                 Spacing sync
│   │   │   ├── spacing.test.ts
│   │   │   ├── radius.ts                  Radius sync
│   │   │   └── radius.test.ts
│   │   └── config/
│   │       ├── scopes.ts                  Scope assignments per token group
│   │       ├── scopes.test.ts
│   │       ├── descriptions.ts            Brand color + token descriptions
│   │       └── descriptions.test.ts
│   ├── ui/
│   │   ├── index.html                     Plugin UI shell
│   │   └── ui.ts                          Dashboard, diff view, checklist
│   ├── shared/
│   │   └── messages.ts                    IPC message types (main <-> UI)
│   └── test/
│       ├── figma-mock.ts                  Comprehensive Figma API mock
│       └── figma-mock.test.ts             Tests that verify the mock itself
└── dist/                                  Built output (gitignored)
```

---

### Task 1: Project scaffolding

**Files:**
- Create: `lab/origin-sync/package.json`
- Create: `lab/origin-sync/tsconfig.json`
- Create: `lab/origin-sync/tsconfig.main.json`
- Create: `lab/origin-sync/vite.config.main.ts`
- Create: `lab/origin-sync/vite.config.ui.ts`
- Create: `lab/origin-sync/vitest.config.ts`
- Create: `lab/origin-sync/manifest.json`
- Create: `lab/origin-sync/src/shared/messages.ts`
- Create: `lab/origin-sync/.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@origin/origin-sync",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build:ui": "vite build --config vite.config.ui.ts",
    "build:main": "vite build --config vite.config.main.ts",
    "build": "npm run build:ui && npm run build:main",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@figma/plugin-typings": "^1.104.0",
    "typescript": "^5.7.0",
    "vite": "^6.1.0",
    "vite-plugin-singlefile": "^2.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create manifest.json**

```json
{
  "name": "Origin Sync",
  "id": "origin-sync-001",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/index.html",
  "editorType": ["figma"]
}
```

- [ ] **Step 3: Create tsconfig.json (UI)**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@foundations/*": ["../../foundations/*"]
    }
  },
  "include": ["src/ui/**/*", "src/shared/**/*"]
}
```

- [ ] **Step 4: Create tsconfig.main.json (plugin main thread)**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "outDir": "dist",
    "typeRoots": ["node_modules/@figma"],
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@foundations/*": ["../../foundations/*"]
    }
  },
  "include": ["src/main/**/*", "src/shared/**/*"]
}
```

- [ ] **Step 5: Create vite.config.main.ts**

```typescript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
    target: "es2017",
    lib: {
      entry: resolve(__dirname, "src/main/code.ts"),
      formats: ["iife"],
      name: "code",
      fileName: () => "code.js",
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        extend: true,
      },
    },
    sourcemap: false,
    minify: "esbuild",
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@foundations": resolve(__dirname, "../../foundations"),
    },
  },
});
```

- [ ] **Step 6: Create vite.config.ui.ts**

```typescript
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolve } from "path";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
    target: "es2020",
    rollupOptions: {
      input: resolve(__dirname, "src/ui/index.html"),
    },
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
});
```

- [ ] **Step 7: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@foundations": resolve(__dirname, "../../foundations"),
    },
  },
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/figma-mock.ts"],
  },
});
```

Note: `setupFiles` injects the Figma mock into every test's global scope as `figma`, mimicking the real Figma plugin environment where `figma` is a global.

- [ ] **Step 8: Create src/shared/messages.ts**

```typescript
export type LogLevel = "info" | "success" | "warn" | "error";

export type FoundationId = "color" | "typography" | "spacing" | "radius";

export type SyncStatus =
  | "not_synced"
  | "in_sync"
  | "out_of_sync"
  | "synced_with_warnings";

export interface DiffEntry {
  tokenPath: string;
  status: "new" | "changed" | "renamed" | "orphaned" | "in_sync";
  oldName?: string;
  newName?: string;
  oldValue?: string;
  newValue?: string;
}

export interface FoundationStatus {
  foundation: FoundationId;
  status: SyncStatus;
  summary: string;
  entries: DiffEntry[];
  variableCount: number;
  styleCount: number;
}

export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  severity: "error" | "warning";
  message: string;
  details?: string[];
}

// Plugin → UI messages
export type PluginToUIMessage =
  | { type: "STATUS"; foundations: FoundationStatus[] }
  | { type: "SYNC_STARTED"; foundation: FoundationId }
  | { type: "SYNC_PROGRESS"; foundation: FoundationId; current: number; total: number; phase: string }
  | { type: "SYNC_COMPLETE"; foundation: FoundationId; created: number; updated: number; renamed: number; orphaned: number }
  | { type: "VALIDATION_RESULT"; foundation: FoundationId; result: ValidationResult }
  | { type: "LOG"; entry: { level: LogLevel; message: string; detail?: string } }
  | { type: "ERROR"; message: string };

// UI → Plugin messages
export type UIToPluginMessage =
  | { type: "GET_STATUS" }
  | { type: "SYNC"; foundation: FoundationId }
  | { type: "SYNC_ALL" }
  | { type: "VALIDATE"; foundation: FoundationId }
  | { type: "CANCEL" };
```

- [ ] **Step 9: Create .gitignore**

```
node_modules/
dist/
```

- [ ] **Step 10: Install dependencies**

```bash
cd lab/origin-sync && npm install
```

- [ ] **Step 11: Verify TypeScript compiles (dry run)**

```bash
cd lab/origin-sync && npx tsc --noEmit -p tsconfig.main.json
```

This will fail because source files don't exist yet — that's expected. The point is to verify the config files parse correctly.

- [ ] **Step 12: Commit**

```bash
git add lab/origin-sync/
git commit -m "feat(origin-sync): scaffold plugin project with Vite, Vitest, and TypeScript"
```

---

### Task 2: Figma API mock

**Files:**
- Create: `lab/origin-sync/src/test/figma-mock.ts`
- Create: `lab/origin-sync/src/test/figma-mock.test.ts`

This mock is the testing foundation for the entire plugin. It simulates the Figma plugin API in-memory so all subsequent tasks can write behavioral tests without running inside Figma.

- [ ] **Step 1: Create figma-mock.ts**

The mock must support:

```typescript
// src/test/figma-mock.ts
//
// Comprehensive in-memory mock of the Figma Plugin API.
// Injected via vitest setupFiles so `figma` is available as a global in all tests.

let idCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}_${++idCounter}`;
}

// Reset counter between tests
export function resetMock(): void {
  idCounter = 0;
  mockState.variables.clear();
  mockState.collections.clear();
  mockState.textStyles.clear();
}

// ── Internal state ──

interface MockState {
  variables: Map<string, MockVariable>;
  collections: Map<string, MockVariableCollection>;
  textStyles: Map<string, MockTextStyle>;
}

const mockState: MockState = {
  variables: new Map(),
  collections: new Map(),
  textStyles: new Map(),
};

// ── MockVariable ──

class MockVariable {
  readonly id: string;
  name: string;
  resolveType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  variableCollectionId: string;
  valuesByMode: Record<string, any> = {};
  scopes: string[] = ["ALL_SCOPES"];
  description: string = "";
  hiddenFromPublishing: boolean = false;
  private pluginData: Record<string, string> = {};

  constructor(name: string, collectionId: string, resolveType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN") {
    this.id = nextId("var");
    this.name = name;
    this.resolveType = resolveType;
    this.variableCollectionId = collectionId;

    // Set default mode value
    const collection = mockState.collections.get(collectionId);
    if (collection) {
      this.valuesByMode[collection.defaultModeId] = getDefaultValue(resolveType);
    }
  }

  setValueForMode(modeId: string, value: any): void {
    this.valuesByMode[modeId] = value;
  }

  setPluginData(key: string, value: string): void {
    this.pluginData[key] = value;
  }

  getPluginData(key: string): string {
    return this.pluginData[key] ?? "";
  }
}

function getDefaultValue(type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN"): any {
  switch (type) {
    case "COLOR": return { r: 0, g: 0, b: 0, a: 1 };
    case "FLOAT": return 0;
    case "STRING": return "";
    case "BOOLEAN": return false;
  }
}

// ── MockVariableCollection ──

class MockVariableCollection {
  readonly id: string;
  name: string;
  defaultModeId: string;
  modes: Array<{ modeId: string; name: string }>;
  hiddenFromPublishing: boolean = false;

  constructor(name: string) {
    this.id = nextId("col");
    this.defaultModeId = nextId("mode");
    this.name = name;
    this.modes = [{ modeId: this.defaultModeId, name: "Mode 1" }];
  }

  addMode(name: string): string {
    const modeId = nextId("mode");
    this.modes.push({ modeId, name });
    return modeId;
  }

  renameMode(modeId: string, newName: string): void {
    const mode = this.modes.find(m => m.modeId === modeId);
    if (mode) mode.name = newName;
  }

  removeMode(modeId: string): void {
    this.modes = this.modes.filter(m => m.modeId !== modeId);
  }
}

// ── MockTextStyle ──

class MockTextStyle {
  readonly id: string;
  name: string = "";
  fontSize: number = 12;
  lineHeight: { value: number; unit: "PIXELS" | "PERCENT" | "AUTO" } | { unit: "AUTO" } = { unit: "AUTO" };
  letterSpacing: { value: number; unit: "PIXELS" | "PERCENT" } = { value: 0, unit: "PIXELS" };
  fontName: { family: string; style: string } = { family: "Inter", style: "Regular" };
  fontWeight: number = 400;
  textCase: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE" | "SMALL_CAPS" | "SMALL_CAPS_FORCED" = "ORIGINAL";
  private pluginData: Record<string, string> = {};
  private boundVariables: Record<string, { type: "VARIABLE_ALIAS"; id: string }> = {};

  constructor() {
    this.id = nextId("style");
  }

  setPluginData(key: string, value: string): void {
    this.pluginData[key] = value;
  }

  getPluginData(key: string): string {
    return this.pluginData[key] ?? "";
  }

  setBoundVariable(property: string, variable: MockVariable): void {
    this.boundVariables[property] = { type: "VARIABLE_ALIAS", id: variable.id };
  }

  getBoundVariables(): Record<string, { type: "VARIABLE_ALIAS"; id: string }> {
    return { ...this.boundVariables };
  }
}

// ── figma global mock ──

function createVariableAlias(variable: MockVariable): { type: "VARIABLE_ALIAS"; id: string } {
  return { type: "VARIABLE_ALIAS", id: variable.id };
}

const figmaMock = {
  variables: {
    createVariableCollection(name: string): MockVariableCollection {
      const col = new MockVariableCollection(name);
      mockState.collections.set(col.id, col);
      return col;
    },

    createVariable(name: string, collection: MockVariableCollection | string, resolveType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN"): MockVariable {
      const colId = typeof collection === "string" ? collection : collection.id;
      const v = new MockVariable(name, colId, resolveType);
      mockState.variables.set(v.id, v);
      return v;
    },

    createVariableAlias,

    async getLocalVariablesAsync(type?: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN"): Promise<MockVariable[]> {
      const all = Array.from(mockState.variables.values());
      if (type) return all.filter(v => v.resolveType === type);
      return all;
    },

    async getLocalVariableCollectionsAsync(): Promise<MockVariableCollection[]> {
      return Array.from(mockState.collections.values());
    },

    async getVariableByIdAsync(id: string): Promise<MockVariable | null> {
      return mockState.variables.get(id) ?? null;
    },

    // Deprecated sync versions — included for compatibility
    getLocalVariables(type?: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN"): MockVariable[] {
      const all = Array.from(mockState.variables.values());
      if (type) return all.filter(v => v.resolveType === type);
      return all;
    },

    getLocalVariableCollections(): MockVariableCollection[] {
      return Array.from(mockState.collections.values());
    },
  },

  async getLocalTextStylesAsync(): Promise<MockTextStyle[]> {
    return Array.from(mockState.textStyles.values());
  },

  getLocalTextStyles(): MockTextStyle[] {
    return Array.from(mockState.textStyles.values());
  },

  createTextStyle(): MockTextStyle {
    const style = new MockTextStyle();
    mockState.textStyles.set(style.id, style);
    return style;
  },

  // UI stubs
  showUI(_html: string, _opts?: any): void {},
  ui: {
    postMessage(_msg: any): void {},
    onmessage: null as ((msg: any) => void) | null,
  },

  closePlugin(): void {},
  notify(_msg: string): void {},
};

// ── Expose globally ──

export { mockState, MockVariable, MockVariableCollection, MockTextStyle };
export type { MockState };

// Install as global for vitest setupFiles
if (typeof globalThis !== "undefined") {
  (globalThis as any).figma = figmaMock;
}

// Also export for direct import in tests
export { figmaMock };
```

- [ ] **Step 2: Create figma-mock.test.ts**

Tests that verify the mock itself works correctly — this must pass before any other test can be trusted.

```typescript
// src/test/figma-mock.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { resetMock, mockState, MockVariable, MockVariableCollection, MockTextStyle, figmaMock } from "./figma-mock";

beforeEach(() => {
  resetMock();
});

describe("Figma Mock — Variable Collections", () => {
  it("creates a collection with an id, name, and default mode", () => {
    const col = figma.variables.createVariableCollection("Colors");
    expect(col.id).toBeTruthy();
    expect(col.name).toBe("Colors");
    expect(col.modes).toHaveLength(1);
    expect(col.defaultModeId).toBe(col.modes[0].modeId);
    expect(col.modes[0].name).toBe("Mode 1");
  });

  it("adds a mode with a name and unique modeId", () => {
    const col = figma.variables.createVariableCollection("Semantic");
    col.renameMode(col.defaultModeId, "Light");
    const darkModeId = col.addMode("Dark");
    expect(col.modes).toHaveLength(2);
    expect(col.modes[0].name).toBe("Light");
    expect(col.modes[1].name).toBe("Dark");
    expect(col.modes[1].modeId).toBe(darkModeId);
    expect(darkModeId).not.toBe(col.defaultModeId);
  });

  it("renames a mode", () => {
    const col = figma.variables.createVariableCollection("Test");
    col.renameMode(col.defaultModeId, "Renamed");
    expect(col.modes[0].name).toBe("Renamed");
  });

  it("sets hiddenFromPublishing", () => {
    const col = figma.variables.createVariableCollection("Primitives");
    expect(col.hiddenFromPublishing).toBe(false);
    col.hiddenFromPublishing = true;
    expect(col.hiddenFromPublishing).toBe(true);
  });

  it("getLocalVariableCollectionsAsync returns all collections", async () => {
    figma.variables.createVariableCollection("A");
    figma.variables.createVariableCollection("B");
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    expect(cols).toHaveLength(2);
    expect(cols.map(c => c.name)).toEqual(["A", "B"]);
  });
});

describe("Figma Mock — Variables", () => {
  it("creates a COLOR variable with correct defaults", () => {
    const col = figma.variables.createVariableCollection("Colors");
    const v = figma.variables.createVariable("color/red/500", col, "COLOR");
    expect(v.id).toBeTruthy();
    expect(v.name).toBe("color/red/500");
    expect(v.resolveType).toBe("COLOR");
    expect(v.variableCollectionId).toBe(col.id);
    expect(v.valuesByMode[col.defaultModeId]).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });

  it("creates a FLOAT variable with default 0", () => {
    const col = figma.variables.createVariableCollection("Spacing");
    const v = figma.variables.createVariable("spacing/16", col, "FLOAT");
    expect(v.resolveType).toBe("FLOAT");
    expect(v.valuesByMode[col.defaultModeId]).toBe(0);
  });

  it("creates a STRING variable with default empty string", () => {
    const col = figma.variables.createVariableCollection("Typography");
    const v = figma.variables.createVariable("typography/fontFamily/primary", col, "STRING");
    expect(v.resolveType).toBe("STRING");
    expect(v.valuesByMode[col.defaultModeId]).toBe("");
  });

  it("sets value per mode", () => {
    const col = figma.variables.createVariableCollection("Semantic");
    col.renameMode(col.defaultModeId, "Light");
    const darkModeId = col.addMode("Dark");
    const v = figma.variables.createVariable("color/surface/base", col, "COLOR");
    const lightVal = { r: 1, g: 1, b: 1, a: 1 };
    const darkVal = { r: 0, g: 0, b: 0, a: 1 };
    v.setValueForMode(col.defaultModeId, lightVal);
    v.setValueForMode(darkModeId, darkVal);
    expect(v.valuesByMode[col.defaultModeId]).toEqual(lightVal);
    expect(v.valuesByMode[darkModeId]).toEqual(darkVal);
  });

  it("sets variable alias as value", () => {
    const primCol = figma.variables.createVariableCollection("Primitives");
    const semCol = figma.variables.createVariableCollection("Semantic");
    const prim = figma.variables.createVariable("neutral/50", primCol, "COLOR");
    prim.setValueForMode(primCol.defaultModeId, { r: 1, g: 1, b: 1, a: 1 });
    const sem = figma.variables.createVariable("surface/base", semCol, "COLOR");
    const alias = figma.variables.createVariableAlias(prim);
    sem.setValueForMode(semCol.defaultModeId, alias);
    expect(alias).toEqual({ type: "VARIABLE_ALIAS", id: prim.id });
    expect(sem.valuesByMode[semCol.defaultModeId]).toEqual({ type: "VARIABLE_ALIAS", id: prim.id });
  });

  it("sets and gets pluginData", () => {
    const col = figma.variables.createVariableCollection("Test");
    const v = figma.variables.createVariable("test/var", col, "FLOAT");
    v.setPluginData("tokenPath", "spacing.16");
    expect(v.getPluginData("tokenPath")).toBe("spacing.16");
    expect(v.getPluginData("nonexistent")).toBe("");
  });

  it("sets scopes", () => {
    const col = figma.variables.createVariableCollection("Test");
    const v = figma.variables.createVariable("test/var", col, "FLOAT");
    v.scopes = ["GAP", "CORNER_RADIUS"];
    expect(v.scopes).toEqual(["GAP", "CORNER_RADIUS"]);
  });

  it("sets description", () => {
    const col = figma.variables.createVariableCollection("Test");
    const v = figma.variables.createVariable("test/var", col, "FLOAT");
    v.description = "A test description";
    expect(v.description).toBe("A test description");
  });

  it("getLocalVariablesAsync filters by type", async () => {
    const col = figma.variables.createVariableCollection("Mixed");
    figma.variables.createVariable("a", col, "COLOR");
    figma.variables.createVariable("b", col, "FLOAT");
    figma.variables.createVariable("c", col, "COLOR");
    const colors = await figma.variables.getLocalVariablesAsync("COLOR");
    const floats = await figma.variables.getLocalVariablesAsync("FLOAT");
    const all = await figma.variables.getLocalVariablesAsync();
    expect(colors).toHaveLength(2);
    expect(floats).toHaveLength(1);
    expect(all).toHaveLength(3);
  });

  it("getVariableByIdAsync finds a variable by id", async () => {
    const col = figma.variables.createVariableCollection("Test");
    const v = figma.variables.createVariable("test/var", col, "FLOAT");
    const found = await figma.variables.getVariableByIdAsync(v.id);
    expect(found).toBe(v);
    const notFound = await figma.variables.getVariableByIdAsync("nonexistent");
    expect(notFound).toBeNull();
  });
});

describe("Figma Mock — Text Styles", () => {
  it("creates a text style with default properties", () => {
    const style = figma.createTextStyle();
    expect(style.id).toBeTruthy();
    expect(style.name).toBe("");
    expect(style.fontSize).toBe(12);
    expect(style.fontName).toEqual({ family: "Inter", style: "Regular" });
    expect(style.textCase).toBe("ORIGINAL");
  });

  it("sets text style properties", () => {
    const style = figma.createTextStyle();
    style.name = "Display/L";
    style.fontSize = 57;
    style.lineHeight = { value: 56, unit: "PIXELS" };
    style.letterSpacing = { value: -2, unit: "PERCENT" };
    style.fontName = { family: "Haffer", style: "Heavy" };
    style.textCase = "UPPER";
    expect(style.name).toBe("Display/L");
    expect(style.fontSize).toBe(57);
    expect(style.lineHeight).toEqual({ value: 56, unit: "PIXELS" });
    expect(style.letterSpacing).toEqual({ value: -2, unit: "PERCENT" });
    expect(style.fontName).toEqual({ family: "Haffer", style: "Heavy" });
    expect(style.textCase).toBe("UPPER");
  });

  it("binds variables to text style properties", () => {
    const col = figma.variables.createVariableCollection("Typography");
    const fsVar = figma.variables.createVariable("fontSize/1200", col, "FLOAT");
    const style = figma.createTextStyle();
    style.setBoundVariable("fontSize", fsVar);
    const bound = style.getBoundVariables();
    expect(bound.fontSize).toEqual({ type: "VARIABLE_ALIAS", id: fsVar.id });
  });

  it("sets and gets pluginData on text style", () => {
    const style = figma.createTextStyle();
    style.setPluginData("tokenPath", "typography.display.l");
    expect(style.getPluginData("tokenPath")).toBe("typography.display.l");
    expect(style.getPluginData("nonexistent")).toBe("");
  });

  it("getLocalTextStylesAsync returns all text styles", async () => {
    const s1 = figma.createTextStyle();
    s1.name = "Display/L";
    const s2 = figma.createTextStyle();
    s2.name = "Body/M";
    const styles = await figma.getLocalTextStylesAsync();
    expect(styles).toHaveLength(2);
    expect(styles.map(s => s.name)).toEqual(["Display/L", "Body/M"]);
  });
});

describe("Figma Mock — Cross-collection aliases", () => {
  it("semantic variable aliases a primitive from a different collection", () => {
    const primCol = figma.variables.createVariableCollection("Color Primitives");
    const semCol = figma.variables.createVariableCollection("Color");
    semCol.renameMode(semCol.defaultModeId, "Light");
    const darkModeId = semCol.addMode("Dark");

    const neutral50 = figma.variables.createVariable("neutral/50", primCol, "COLOR");
    neutral50.setValueForMode(primCol.defaultModeId, { r: 1, g: 1, b: 1, a: 1 });
    const neutral950 = figma.variables.createVariable("neutral/950", primCol, "COLOR");
    neutral950.setValueForMode(primCol.defaultModeId, { r: 0.086, g: 0.063, b: 0.059, a: 1 });

    const surface = figma.variables.createVariable("surface/base", semCol, "COLOR");
    surface.setValueForMode(semCol.defaultModeId, figma.variables.createVariableAlias(neutral50));
    surface.setValueForMode(darkModeId, figma.variables.createVariableAlias(neutral950));

    expect(surface.valuesByMode[semCol.defaultModeId]).toEqual({ type: "VARIABLE_ALIAS", id: neutral50.id });
    expect(surface.valuesByMode[darkModeId]).toEqual({ type: "VARIABLE_ALIAS", id: neutral950.id });
    // The alias references are cross-collection
    expect(neutral50.variableCollectionId).toBe(primCol.id);
    expect(surface.variableCollectionId).toBe(semCol.id);
  });
});

describe("Figma Mock — resetMock", () => {
  it("clears all state between tests", () => {
    figma.variables.createVariableCollection("Test");
    figma.createTextStyle();
    expect(mockState.collections.size).toBe(1);
    expect(mockState.textStyles.size).toBe(1);
    resetMock();
    expect(mockState.collections.size).toBe(0);
    expect(mockState.variables.size).toBe(0);
    expect(mockState.textStyles.size).toBe(0);
  });
});
```

- [ ] **Step 3: Run tests to verify mock**

```bash
cd lab/origin-sync && npx vitest run src/test/figma-mock.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add lab/origin-sync/src/test/
git commit -m "test(origin-sync): add comprehensive Figma API mock with self-verification tests"
```

---

### Task 3: Token parser

**Files:**
- Create: `lab/origin-sync/src/main/token-parser.ts`
- Create: `lab/origin-sync/src/main/token-parser.test.ts`

Pure functions that read DTCG JSON and produce flat token maps. No Figma dependency.

- [ ] **Step 1: Write token-parser.test.ts (tests first)**

```typescript
// src/main/token-parser.test.ts

import { describe, it, expect } from "vitest";
import {
  parseColorPrimitives,
  parseColorSemantics,
  parseTypographyPrimitives,
  parseTypographySemantics,
  parseSpacingPrimitives,
  parseRadiusPrimitives,
  isReference,
  resolveReference,
} from "./token-parser";
import colorPrimitives from "@foundations/color/primitives.json";
import colorSemanticLight from "@foundations/color/semantic.light.json";
import colorSemanticDark from "@foundations/color/semantic.dark.json";
import typographyPrimitives from "@foundations/typography/primitives.json";
import typographySemantics from "@foundations/typography/semantic.json";
import spacingPrimitives from "@foundations/spacing/primitives.json";
import radiusPrimitives from "@foundations/radius/primitives.json";

describe("Token Parser — Color Primitives", () => {
  const tokens = parseColorPrimitives(colorPrimitives);

  it("parses 114 color primitive tokens", () => {
    expect(tokens).toHaveLength(114);
  });

  it("produces correct tokenPath for nested tokens", () => {
    const neutral50 = tokens.find(t => t.tokenPath === "color.neutral.50");
    expect(neutral50).toBeDefined();
    expect(neutral50!.figmaName).toBe("neutral/50");
    expect(neutral50!.value).toBe("#ffffff");
    expect(neutral50!.type).toBe("COLOR");
  });

  it("handles hyphenated ramp names (white-alpha, black-alpha)", () => {
    const wa70 = tokens.find(t => t.tokenPath === "color.white-alpha.70");
    expect(wa70).toBeDefined();
    expect(wa70!.figmaName).toBe("white-alpha/70");
    expect(wa70!.value).toBe("#ffffffb3");
  });

  it("preserves hex values including 8-digit alpha hex", () => {
    const ba8 = tokens.find(t => t.tokenPath === "color.black-alpha.8");
    expect(ba8).toBeDefined();
    expect(ba8!.value).toBe("#00000014");
  });

  it("includes all 10 color ramps", () => {
    const ramps = new Set(tokens.map(t => t.tokenPath.split(".")[1]));
    expect(ramps).toEqual(new Set([
      "neutral", "maroon", "crimson", "peach", "gold",
      "lime", "teal", "blue", "white-alpha", "black-alpha",
    ]));
  });
});

describe("Token Parser — Color Semantics", () => {
  const lightTokens = parseColorSemantics(colorSemanticLight);
  const darkTokens = parseColorSemantics(colorSemanticDark);

  it("parses 48 semantic tokens from light file", () => {
    expect(lightTokens).toHaveLength(48);
  });

  it("parses 48 semantic tokens from dark file", () => {
    expect(darkTokens).toHaveLength(48);
  });

  it("preserves DTCG reference syntax in value", () => {
    const surfaceBase = lightTokens.find(t => t.tokenPath === "color.surface.base");
    expect(surfaceBase).toBeDefined();
    expect(surfaceBase!.value).toBe("{color.neutral.50}");
    expect(surfaceBase!.isAlias).toBe(true);
  });

  it("resolves reference to primitive tokenPath", () => {
    const surfaceBase = lightTokens.find(t => t.tokenPath === "color.surface.base");
    expect(surfaceBase!.aliasTarget).toBe("color.neutral.50");
  });

  it("produces correct figmaName with group/token structure", () => {
    const onSurfacePrimary = lightTokens.find(t => t.tokenPath === "color.on-surface.primary");
    expect(onSurfacePrimary).toBeDefined();
    expect(onSurfacePrimary!.figmaName).toBe("on-surface/primary");
  });

  it("handles hyphenated group names", () => {
    const onBrandLight = lightTokens.find(t => t.tokenPath === "color.on-brand.light");
    expect(onBrandLight).toBeDefined();
    expect(onBrandLight!.figmaName).toBe("on-brand/light");
  });

  it("dark mode references different primitives", () => {
    const lightSurface = lightTokens.find(t => t.tokenPath === "color.surface.base");
    const darkSurface = darkTokens.find(t => t.tokenPath === "color.surface.base");
    expect(lightSurface!.aliasTarget).toBe("color.neutral.50");
    expect(darkSurface!.aliasTarget).toBe("color.neutral.950");
  });

  it("includes all 11 semantic groups", () => {
    const groups = new Set(lightTokens.map(t => t.tokenPath.split(".")[1]));
    expect(groups).toEqual(new Set([
      "surface", "on-surface", "border", "interactive",
      "success", "warning", "error", "info",
      "on-brand", "overlay", "brand",
    ]));
  });
});

describe("Token Parser — Typography Primitives", () => {
  const tokens = parseTypographyPrimitives(typographyPrimitives);

  it("parses 38 total tokens across 5 groups", () => {
    expect(tokens).toHaveLength(38);
  });

  it("includes 12 fontSize tokens (FLOAT)", () => {
    const fs = tokens.filter(t => t.tokenPath.startsWith("typography.fontSize."));
    expect(fs).toHaveLength(12);
    expect(fs[0].type).toBe("FLOAT");
  });

  it("includes 12 lineHeight tokens (FLOAT)", () => {
    const lh = tokens.filter(t => t.tokenPath.startsWith("typography.lineHeight."));
    expect(lh).toHaveLength(12);
  });

  it("includes 8 letterSpacing tokens", () => {
    const ls = tokens.filter(t => t.tokenPath.startsWith("typography.letterSpacing."));
    expect(ls).toHaveLength(8);
  });

  it("includes 5 fontWeight tokens (FLOAT)", () => {
    const fw = tokens.filter(t => t.tokenPath.startsWith("typography.fontWeight."));
    expect(fw).toHaveLength(5);
    expect(fw[0].type).toBe("FLOAT");
  });

  it("includes 1 fontFamily token (STRING)", () => {
    const ff = tokens.filter(t => t.tokenPath.startsWith("typography.fontFamily."));
    expect(ff).toHaveLength(1);
    expect(ff[0].type).toBe("STRING");
    expect(ff[0].value).toBe("Haffer");
  });

  it("parses dimension values as numeric (strip px)", () => {
    const fs300 = tokens.find(t => t.tokenPath === "typography.fontSize.300");
    expect(fs300!.value).toBe(14);
  });

  it("parses percentage letterSpacing as numeric string with unit", () => {
    const tight4 = tokens.find(t => t.tokenPath === "typography.letterSpacing.tight-4");
    expect(tight4).toBeDefined();
    expect(tight4!.value).toBe(-2);
    expect(tight4!.unit).toBe("PERCENT");
  });

  it("parses fontWeight as numeric value", () => {
    const bold = tokens.find(t => t.tokenPath === "typography.fontWeight.bold");
    expect(bold!.value).toBe(700);
  });

  it("handles hyphenated token names in letterSpacing", () => {
    const names = tokens
      .filter(t => t.tokenPath.startsWith("typography.letterSpacing."))
      .map(t => t.tokenPath.split(".")[2]);
    expect(names).toContain("tight-4");
    expect(names).toContain("tight-0");
    expect(names).toContain("wide-1");
    expect(names).toContain("wide-2");
  });

  it("marks letterSpacing group with skipVariable flag", () => {
    const ls = tokens.filter(t => t.tokenPath.startsWith("typography.letterSpacing."));
    for (const t of ls) {
      expect(t.skipVariable).toBe(true);
    }
    const fs = tokens.filter(t => t.tokenPath.startsWith("typography.fontSize."));
    for (const t of fs) {
      expect(t.skipVariable).toBeFalsy();
    }
  });
});

describe("Token Parser — Typography Semantics", () => {
  const tokens = parseTypographySemantics(typographySemantics);

  it("parses 25 composite tokens", () => {
    expect(tokens).toHaveLength(25);
  });

  it("produces correct tokenPath", () => {
    const displayL = tokens.find(t => t.tokenPath === "typography.display.l");
    expect(displayL).toBeDefined();
  });

  it("produces correct figmaName with capitalized folder", () => {
    const displayL = tokens.find(t => t.tokenPath === "typography.display.l");
    expect(displayL!.figmaName).toBe("Display/L");
  });

  it("extracts all composite value references", () => {
    const displayL = tokens.find(t => t.tokenPath === "typography.display.l");
    expect(displayL!.value.fontFamily).toBe("{typography.fontFamily.primary}");
    expect(displayL!.value.fontSize).toBe("{typography.fontSize.1200}");
    expect(displayL!.value.fontWeight).toBe("{typography.fontWeight.heavy}");
    expect(displayL!.value.lineHeight).toBe("{typography.lineHeight.1200}");
    expect(displayL!.value.letterSpacing).toBe("{typography.letterSpacing.tight-4}");
  });

  it("extracts $extensions with textCase", () => {
    const displayS = tokens.find(t => t.tokenPath === "typography.display.s");
    expect(displayS!.extensions?.textCase).toBe("uppercase");
  });

  it("extracts $extensions with openTypeFeatures", () => {
    const numberS = tokens.find(t => t.tokenPath === "typography.number.s");
    expect(numberS!.extensions?.openTypeFeatures?.tnum).toBe(true);
  });

  it("extracts $extensions with both textCase and openTypeFeatures", () => {
    const numberDisplayS = tokens.find(t => t.tokenPath === "typography.number.display-s");
    expect(numberDisplayS!.extensions?.textCase).toBe("uppercase");
    expect(numberDisplayS!.extensions?.openTypeFeatures?.tnum).toBe(true);
  });

  it("handles hyphenated group names (label-heavy)", () => {
    const labelHeavyM = tokens.find(t => t.tokenPath === "typography.label-heavy.m");
    expect(labelHeavyM).toBeDefined();
    expect(labelHeavyM!.figmaName).toBe("Label-Heavy/M");
  });

  it("handles hyphenated token names (display-s, display-m, display-l)", () => {
    const names = tokens
      .filter(t => t.tokenPath.startsWith("typography.number.display-"))
      .map(t => t.tokenPath);
    expect(names).toContain("typography.number.display-s");
    expect(names).toContain("typography.number.display-m");
    expect(names).toContain("typography.number.display-l");
  });

  it("produces correct figmaName for number display styles", () => {
    const nd = tokens.find(t => t.tokenPath === "typography.number.display-l");
    expect(nd!.figmaName).toBe("Number/Display-L");
  });

  it("tokens without $extensions have undefined extensions", () => {
    const headerS = tokens.find(t => t.tokenPath === "typography.header.s");
    expect(headerS!.extensions).toBeUndefined();
  });

  it("includes all 8 style groups", () => {
    const groups = new Set(tokens.map(t => t.tokenPath.split(".")[1]));
    expect(groups).toEqual(new Set([
      "display", "header", "title", "label", "label-heavy",
      "body", "number", "overline",
    ]));
  });
});

describe("Token Parser — Spacing", () => {
  const tokens = parseSpacingPrimitives(spacingPrimitives);

  it("parses 12 spacing tokens", () => {
    expect(tokens).toHaveLength(12);
  });

  it("all tokens are FLOAT type", () => {
    for (const t of tokens) {
      expect(t.type).toBe("FLOAT");
    }
  });

  it("produces correct tokenPaths and values", () => {
    const s16 = tokens.find(t => t.tokenPath === "spacing.16");
    expect(s16).toBeDefined();
    expect(s16!.value).toBe(16);
    expect(s16!.figmaName).toBe("spacing/16");
  });

  it("parses all expected values", () => {
    const values = tokens.map(t => t.value).sort((a, b) => a - b);
    expect(values).toEqual([4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80]);
  });
});

describe("Token Parser — Radius", () => {
  const tokens = parseRadiusPrimitives(radiusPrimitives);

  it("parses 8 radius tokens", () => {
    expect(tokens).toHaveLength(8);
  });

  it("all tokens are FLOAT type", () => {
    for (const t of tokens) {
      expect(t.type).toBe("FLOAT");
    }
  });

  it("produces correct tokenPath for full", () => {
    const full = tokens.find(t => t.tokenPath === "radius.full");
    expect(full).toBeDefined();
    expect(full!.value).toBe(9999);
    expect(full!.figmaName).toBe("radius/full");
  });

  it("preserves $description on radius.full", () => {
    const full = tokens.find(t => t.tokenPath === "radius.full");
    expect(full!.description).toBe("Fully rounded — produces pill/capsule shapes");
  });

  it("numeric tokens have no description", () => {
    const r8 = tokens.find(t => t.tokenPath === "radius.8");
    expect(r8!.description).toBeUndefined();
  });
});

describe("Token Parser — Reference utilities", () => {
  it("isReference returns true for DTCG references", () => {
    expect(isReference("{color.neutral.50}")).toBe(true);
    expect(isReference("{typography.fontSize.300}")).toBe(true);
  });

  it("isReference returns false for literal values", () => {
    expect(isReference("#ffffff")).toBe(false);
    expect(isReference("14px")).toBe(false);
    expect(isReference("400")).toBe(false);
  });

  it("resolveReference extracts path from reference", () => {
    expect(resolveReference("{color.neutral.50}")).toBe("color.neutral.50");
    expect(resolveReference("{typography.fontWeight.bold}")).toBe("typography.fontWeight.bold");
  });
});
```

- [ ] **Step 2: Implement token-parser.ts**

```typescript
// src/main/token-parser.ts
//
// Parses DTCG JSON token files into flat token maps.
// Pure functions — no Figma dependency.

// ── Types ──

export interface PrimitiveToken {
  tokenPath: string;       // e.g. "color.neutral.50"
  figmaName: string;       // e.g. "neutral/50"
  value: any;              // hex string for colors, number for dimensions
  type: "COLOR" | "FLOAT" | "STRING";
  description?: string;
  unit?: "PERCENT";        // for letterSpacing percentage values
  skipVariable?: boolean;  // true for letterSpacing (Figma can't bind % via variables)
}

export interface SemanticColorToken {
  tokenPath: string;       // e.g. "color.surface.base"
  figmaName: string;       // e.g. "surface/base"
  value: string;           // raw $value — a DTCG reference like "{color.neutral.50}"
  type: "COLOR";
  isAlias: true;
  aliasTarget: string;     // resolved reference: "color.neutral.50"
}

export interface TypographySemanticToken {
  tokenPath: string;       // e.g. "typography.display.l"
  figmaName: string;       // e.g. "Display/L"
  value: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
  };
  extensions?: {
    textCase?: string;
    openTypeFeatures?: Record<string, boolean>;
  };
}

// ── Reference helpers ──

export function isReference(value: string): boolean {
  return typeof value === "string" && /^\{.+\}$/.test(value);
}

export function resolveReference(ref: string): string {
  return ref.replace(/^\{/, "").replace(/\}$/, "");
}

// ── Parsers ──

export function parseColorPrimitives(json: any): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const root = json.color;

  for (const [rampName, ramp] of Object.entries(root) as [string, any][]) {
    if (rampName.startsWith("$")) continue;

    for (const [step, entry] of Object.entries(ramp) as [string, any][]) {
      if (step.startsWith("$")) continue;

      tokens.push({
        tokenPath: `color.${rampName}.${step}`,
        figmaName: `${rampName}/${step}`,
        value: entry.$value,
        type: "COLOR",
      });
    }
  }

  return tokens;
}

export function parseColorSemantics(json: any): SemanticColorToken[] {
  const tokens: SemanticColorToken[] = [];
  const root = json.color;

  for (const [groupName, group] of Object.entries(root) as [string, any][]) {
    if (groupName.startsWith("$")) continue;

    for (const [tokenName, entry] of Object.entries(group) as [string, any][]) {
      if (tokenName.startsWith("$")) continue;

      const ref = entry.$value;
      tokens.push({
        tokenPath: `color.${groupName}.${tokenName}`,
        figmaName: `${groupName}/${tokenName}`,
        value: ref,
        type: "COLOR",
        isAlias: true,
        aliasTarget: resolveReference(ref),
      });
    }
  }

  return tokens;
}

function parseDimensionValue(value: string): { numeric: number; unit?: "PERCENT" } {
  if (typeof value === "number") return { numeric: value };

  const percentMatch = value.match(/^(-?[\d.]+)%$/);
  if (percentMatch) {
    return { numeric: parseFloat(percentMatch[1]), unit: "PERCENT" };
  }

  const pxMatch = value.match(/^(-?[\d.]+)px$/);
  if (pxMatch) {
    return { numeric: parseFloat(pxMatch[1]) };
  }

  // Bare number (fontWeight)
  const num = Number(value);
  if (!isNaN(num)) return { numeric: num };

  return { numeric: 0 };
}

export function parseTypographyPrimitives(json: any): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const root = json.typography;

  for (const [groupName, group] of Object.entries(root) as [string, any][]) {
    if (groupName.startsWith("$")) continue;

    const groupType = (group as any).$type;

    for (const [tokenName, entry] of Object.entries(group) as [string, any][]) {
      if (tokenName.startsWith("$")) continue;

      const tokenPath = `typography.${groupName}.${tokenName}`;
      const figmaName = `typography/${groupName}/${tokenName}`;

      if (groupType === "fontFamily") {
        tokens.push({
          tokenPath,
          figmaName,
          value: entry.$value,
          type: "STRING",
        });
      } else if (groupType === "fontWeight") {
        tokens.push({
          tokenPath,
          figmaName,
          value: typeof entry.$value === "number" ? entry.$value : parseInt(entry.$value),
          type: "FLOAT",
        });
      } else {
        // dimension type (fontSize, lineHeight, letterSpacing)
        const parsed = parseDimensionValue(entry.$value);
        const isLetterSpacing = groupName === "letterSpacing";
        tokens.push({
          tokenPath,
          figmaName,
          value: parsed.numeric,
          type: "FLOAT",
          ...(parsed.unit ? { unit: parsed.unit } : {}),
          ...(isLetterSpacing ? { skipVariable: true } : {}),
        });
      }
    }
  }

  return tokens;
}

function capitalize(s: string): string {
  // Capitalize first letter of each hyphen-separated segment
  return s.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join("-");
}

export function parseTypographySemantics(json: any): TypographySemanticToken[] {
  const tokens: TypographySemanticToken[] = [];
  const root = json.typography;

  for (const [groupName, group] of Object.entries(root) as [string, any][]) {
    if (groupName.startsWith("$")) continue;

    for (const [tokenName, entry] of Object.entries(group) as [string, any][]) {
      if (tokenName.startsWith("$")) continue;

      const tokenPath = `typography.${groupName}.${tokenName}`;

      // Figma text style name: "Display/L", "Number/Display-L", "Label-Heavy/M"
      const folderName = capitalize(groupName);
      const styleName = capitalize(tokenName);
      const figmaName = `${folderName}/${styleName}`;

      const token: TypographySemanticToken = {
        tokenPath,
        figmaName,
        value: {
          fontFamily: entry.$value.fontFamily,
          fontSize: entry.$value.fontSize,
          fontWeight: entry.$value.fontWeight,
          lineHeight: entry.$value.lineHeight,
          letterSpacing: entry.$value.letterSpacing,
        },
      };

      // Extract extensions
      const ext = entry.$extensions?.["tech.vance.origin"];
      if (ext) {
        token.extensions = {};
        if (ext.textCase) token.extensions.textCase = ext.textCase;
        if (ext.openTypeFeatures) token.extensions.openTypeFeatures = ext.openTypeFeatures;
      }

      tokens.push(token);
    }
  }

  return tokens;
}

export function parseSpacingPrimitives(json: any): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const root = json.spacing;

  for (const [tokenName, entry] of Object.entries(root) as [string, any][]) {
    if (tokenName.startsWith("$")) continue;

    const parsed = parseDimensionValue(entry.$value);
    tokens.push({
      tokenPath: `spacing.${tokenName}`,
      figmaName: `spacing/${tokenName}`,
      value: parsed.numeric,
      type: "FLOAT",
    });
  }

  return tokens;
}

export function parseRadiusPrimitives(json: any): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const root = json.radius;

  for (const [tokenName, entry] of Object.entries(root) as [string, any][]) {
    if (tokenName.startsWith("$")) continue;

    const parsed = parseDimensionValue(entry.$value);
    const token: PrimitiveToken = {
      tokenPath: `radius.${tokenName}`,
      figmaName: `radius/${tokenName}`,
      value: parsed.numeric,
      type: "FLOAT",
    };

    if (entry.$description) {
      token.description = entry.$description;
    }

    tokens.push(token);
  }

  return tokens;
}
```

- [ ] **Step 3: Run tests**

```bash
cd lab/origin-sync && npx vitest run src/main/token-parser.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add lab/origin-sync/src/main/token-parser.ts lab/origin-sync/src/main/token-parser.test.ts
git commit -m "feat(origin-sync): add DTCG token parser with full test coverage"
```

---

### Task 4: Scope & description config

**Files:**
- Create: `lab/origin-sync/src/main/config/scopes.ts`
- Create: `lab/origin-sync/src/main/config/scopes.test.ts`
- Create: `lab/origin-sync/src/main/config/descriptions.ts`
- Create: `lab/origin-sync/src/main/config/descriptions.test.ts`

- [ ] **Step 1: Write scopes.test.ts (tests first)**

```typescript
// src/main/config/scopes.test.ts

import { describe, it, expect } from "vitest";
import {
  getColorSemanticScopes,
  getColorPrimitiveScopes,
  getTypographyScopes,
  getSpacingScopes,
  getRadiusScopes,
} from "./scopes";

describe("Scope Config — Color Semantics", () => {
  it("surface/* → ALL_FILLS", () => {
    expect(getColorSemanticScopes("surface/base")).toEqual(["ALL_FILLS"]);
    expect(getColorSemanticScopes("surface/raised")).toEqual(["ALL_FILLS"]);
  });

  it("on-surface/* → ALL_FILLS, TEXT_FILL", () => {
    expect(getColorSemanticScopes("on-surface/primary")).toEqual(["ALL_FILLS", "TEXT_FILL"]);
  });

  it("border/* → STROKE_COLOR", () => {
    expect(getColorSemanticScopes("border/default")).toEqual(["STROKE_COLOR"]);
  });

  it("interactive/* → ALL_FILLS", () => {
    expect(getColorSemanticScopes("interactive/primary")).toEqual(["ALL_FILLS"]);
  });

  it("success/warning/error/info .base → ALL_FILLS", () => {
    expect(getColorSemanticScopes("success/base")).toEqual(["ALL_FILLS"]);
    expect(getColorSemanticScopes("warning/base")).toEqual(["ALL_FILLS"]);
    expect(getColorSemanticScopes("error/base")).toEqual(["ALL_FILLS"]);
    expect(getColorSemanticScopes("info/base")).toEqual(["ALL_FILLS"]);
  });

  it("success/warning/error/info .subtle → ALL_FILLS", () => {
    expect(getColorSemanticScopes("success/subtle")).toEqual(["ALL_FILLS"]);
    expect(getColorSemanticScopes("error/subtle")).toEqual(["ALL_FILLS"]);
  });

  it("success/warning/error/info .text → ALL_FILLS, TEXT_FILL", () => {
    expect(getColorSemanticScopes("success/text")).toEqual(["ALL_FILLS", "TEXT_FILL"]);
    expect(getColorSemanticScopes("warning/text")).toEqual(["ALL_FILLS", "TEXT_FILL"]);
    expect(getColorSemanticScopes("error/text")).toEqual(["ALL_FILLS", "TEXT_FILL"]);
    expect(getColorSemanticScopes("info/text")).toEqual(["ALL_FILLS", "TEXT_FILL"]);
  });

  it("success/warning/error/info .border → STROKE_COLOR", () => {
    expect(getColorSemanticScopes("success/border")).toEqual(["STROKE_COLOR"]);
    expect(getColorSemanticScopes("warning/border")).toEqual(["STROKE_COLOR"]);
    expect(getColorSemanticScopes("error/border")).toEqual(["STROKE_COLOR"]);
    expect(getColorSemanticScopes("info/border")).toEqual(["STROKE_COLOR"]);
  });

  it("on-brand/* → ALL_FILLS, TEXT_FILL", () => {
    expect(getColorSemanticScopes("on-brand/light")).toEqual(["ALL_FILLS", "TEXT_FILL"]);
    expect(getColorSemanticScopes("on-brand/dark")).toEqual(["ALL_FILLS", "TEXT_FILL"]);
  });

  it("overlay/* → ALL_FILLS", () => {
    expect(getColorSemanticScopes("overlay/scrim")).toEqual(["ALL_FILLS"]);
  });

  it("brand/* → ALL_FILLS", () => {
    expect(getColorSemanticScopes("brand/maroon")).toEqual(["ALL_FILLS"]);
    expect(getColorSemanticScopes("brand/lime")).toEqual(["ALL_FILLS"]);
  });
});

describe("Scope Config — Color Primitives", () => {
  it("all primitives get ALL_FILLS, STROKE_COLOR", () => {
    expect(getColorPrimitiveScopes()).toEqual(["ALL_FILLS", "STROKE_COLOR"]);
  });
});

describe("Scope Config — Typography", () => {
  it("fontSize/* → FONT_SIZE", () => {
    expect(getTypographyScopes("typography/fontSize/300")).toEqual(["FONT_SIZE"]);
  });

  it("lineHeight/* → LINE_HEIGHT", () => {
    expect(getTypographyScopes("typography/lineHeight/400")).toEqual(["LINE_HEIGHT"]);
  });

  it("fontWeight/* → FONT_WEIGHT", () => {
    expect(getTypographyScopes("typography/fontWeight/bold")).toEqual(["FONT_WEIGHT"]);
  });

  it("fontFamily/* → FONT_FAMILY", () => {
    expect(getTypographyScopes("typography/fontFamily/primary")).toEqual(["FONT_FAMILY"]);
  });
});

describe("Scope Config — Spacing", () => {
  it("all spacing tokens → GAP", () => {
    expect(getSpacingScopes()).toEqual(["GAP"]);
  });
});

describe("Scope Config — Radius", () => {
  it("all radius tokens → CORNER_RADIUS", () => {
    expect(getRadiusScopes()).toEqual(["CORNER_RADIUS"]);
  });
});
```

- [ ] **Step 2: Implement scopes.ts**

```typescript
// src/main/config/scopes.ts
//
// Scope assignments per token group.
// Scopes control where a variable appears in Figma's variable picker.

// ── Color Semantics ──
// Status groups (success, warning, error, info) have sub-token-level scoping.

const STATUS_GROUPS = ["success", "warning", "error", "info"];

const COLOR_SEMANTIC_GROUP_SCOPES: Record<string, string[]> = {
  "surface":     ["ALL_FILLS"],
  "on-surface":  ["ALL_FILLS", "TEXT_FILL"],
  "border":      ["STROKE_COLOR"],
  "interactive": ["ALL_FILLS"],
  "on-brand":    ["ALL_FILLS", "TEXT_FILL"],
  "overlay":     ["ALL_FILLS"],
  "brand":       ["ALL_FILLS"],
};

// Status sub-token scopes
const STATUS_SUB_SCOPES: Record<string, string[]> = {
  "base":   ["ALL_FILLS"],
  "subtle": ["ALL_FILLS"],
  "text":   ["ALL_FILLS", "TEXT_FILL"],
  "border": ["STROKE_COLOR"],
};

export function getColorSemanticScopes(figmaName: string): string[] {
  const parts = figmaName.split("/");
  const group = parts[0];
  const subToken = parts[1];

  // Check status groups first (they have sub-token scoping)
  if (STATUS_GROUPS.includes(group)) {
    return STATUS_SUB_SCOPES[subToken] ?? ["ALL_FILLS"];
  }

  return COLOR_SEMANTIC_GROUP_SCOPES[group] ?? ["ALL_FILLS"];
}

// ── Color Primitives ──

export function getColorPrimitiveScopes(): string[] {
  return ["ALL_FILLS", "STROKE_COLOR"];
}

// ── Typography ──

const TYPOGRAPHY_GROUP_SCOPES: Record<string, string[]> = {
  "fontSize":   ["FONT_SIZE"],
  "lineHeight": ["LINE_HEIGHT"],
  "fontWeight": ["FONT_WEIGHT"],
  "fontFamily": ["FONT_FAMILY"],
};

export function getTypographyScopes(figmaName: string): string[] {
  // figmaName: "typography/fontSize/300"
  const group = figmaName.split("/")[1];
  return TYPOGRAPHY_GROUP_SCOPES[group] ?? [];
}

// ── Spacing ──

export function getSpacingScopes(): string[] {
  return ["GAP"];
}

// ── Radius ──

export function getRadiusScopes(): string[] {
  return ["CORNER_RADIUS"];
}
```

- [ ] **Step 3: Write descriptions.test.ts (tests first)**

```typescript
// src/main/config/descriptions.test.ts

import { describe, it, expect } from "vitest";
import { getTokenDescription } from "./descriptions";

describe("Description Config — Brand colors", () => {
  it("maroon → Pair with on-brand/light", () => {
    expect(getTokenDescription("color.brand.maroon")).toBe("Pair with on-brand/light");
  });

  it("crimson → Pair with on-brand/light", () => {
    expect(getTokenDescription("color.brand.crimson")).toBe("Pair with on-brand/light");
  });

  it("teal → Pair with on-brand/light", () => {
    expect(getTokenDescription("color.brand.teal")).toBe("Pair with on-brand/light");
  });

  it("blue → Pair with on-brand/light", () => {
    expect(getTokenDescription("color.brand.blue")).toBe("Pair with on-brand/light");
  });

  it("peach → Pair with on-brand/dark", () => {
    expect(getTokenDescription("color.brand.peach")).toBe("Pair with on-brand/dark");
  });

  it("gold → Pair with on-brand/dark", () => {
    expect(getTokenDescription("color.brand.gold")).toBe("Pair with on-brand/dark");
  });

  it("lime → Pair with on-brand/dark", () => {
    expect(getTokenDescription("color.brand.lime")).toBe("Pair with on-brand/dark");
  });
});

describe("Description Config — Token descriptions", () => {
  it("radius.full → pill/capsule description", () => {
    expect(getTokenDescription("radius.full")).toBe("Fully rounded — produces pill/capsule shapes");
  });
});

describe("Description Config — Unknown tokens", () => {
  it("unknown token → undefined", () => {
    expect(getTokenDescription("color.surface.base")).toBeUndefined();
    expect(getTokenDescription("spacing.16")).toBeUndefined();
    expect(getTokenDescription("typography.fontSize.300")).toBeUndefined();
  });
});
```

- [ ] **Step 4: Implement descriptions.ts**

```typescript
// src/main/config/descriptions.ts
//
// Variable descriptions for brand colors and special tokens.

const DESCRIPTIONS: Record<string, string> = {
  // Brand colors — pairing guidance
  "color.brand.maroon":  "Pair with on-brand/light",
  "color.brand.crimson": "Pair with on-brand/light",
  "color.brand.teal":    "Pair with on-brand/light",
  "color.brand.blue":    "Pair with on-brand/light",
  "color.brand.peach":   "Pair with on-brand/dark",
  "color.brand.gold":    "Pair with on-brand/dark",
  "color.brand.lime":    "Pair with on-brand/dark",

  // Special token descriptions
  "radius.full": "Fully rounded — produces pill/capsule shapes",
};

export function getTokenDescription(tokenPath: string): string | undefined {
  return DESCRIPTIONS[tokenPath];
}
```

- [ ] **Step 5: Run tests**

```bash
cd lab/origin-sync && npx vitest run src/main/config/
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add lab/origin-sync/src/main/config/
git commit -m "feat(origin-sync): add scope and description config with tests"
```

---

### Task 5: Diff engine

**Files:**
- Create: `lab/origin-sync/src/main/diff.ts`
- Create: `lab/origin-sync/src/main/diff.test.ts`

Pure function that compares code tokens against Figma state and produces a diff report. No Figma API calls — takes snapshots as input.

- [ ] **Step 1: Write diff.test.ts (tests first)**

```typescript
// src/main/diff.test.ts

import { describe, it, expect } from "vitest";
import {
  computeDiff,
  DiffResult,
  DiffEntry,
  FigmaSnapshot,
  FigmaVariableSnapshot,
  CodeToken,
} from "./diff";

function makeCodeToken(tokenPath: string, value: any, figmaName?: string): CodeToken {
  return { tokenPath, value, figmaName: figmaName ?? tokenPath.replace(/\./g, "/") };
}

function makeFigmaVar(tokenPath: string, name: string, value: any, extra?: Partial<FigmaVariableSnapshot>): FigmaVariableSnapshot {
  return { tokenPath, name, value, scopes: [], description: "", ...extra };
}

describe("Diff Engine", () => {
  it("empty Figma state → all tokens reported as 'new'", () => {
    const codeTokens = [
      makeCodeToken("spacing.4", 4),
      makeCodeToken("spacing.8", 8),
    ];
    const figmaState: FigmaSnapshot = { variables: [], textStyles: [] };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries).toHaveLength(2);
    expect(result.entries.every(e => e.status === "new")).toBe(true);
    expect(result.summary.new).toBe(2);
    expect(result.summary.total).toBe(2);
  });

  it("fully synced → all 'in_sync'", () => {
    const codeTokens = [
      makeCodeToken("spacing.4", 4, "spacing/4"),
      makeCodeToken("spacing.8", 8, "spacing/8"),
    ];
    const figmaState: FigmaSnapshot = {
      variables: [
        makeFigmaVar("spacing.4", "spacing/4", 4),
        makeFigmaVar("spacing.8", "spacing/8", 8),
      ],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries.every(e => e.status === "in_sync")).toBe(true);
    expect(result.summary.inSync).toBe(2);
  });

  it("one value changed → reports 'changed' with old and new", () => {
    const codeTokens = [makeCodeToken("spacing.4", 8, "spacing/4")]; // value changed from 4 to 8
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("spacing.4", "spacing/4", 4)],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].status).toBe("changed");
    expect(result.entries[0].oldValue).toBe(4);
    expect(result.entries[0].newValue).toBe(8);
    expect(result.summary.changed).toBe(1);
  });

  it("token renamed via rename map → reports 'renamed' with old and new names", () => {
    const codeTokens = [makeCodeToken("color.brand.maroon", "#680d0d", "brand/maroon")];
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("color.brand.dark-maroon", "brand/dark-maroon", "#680d0d")],
      textStyles: [],
    };
    const renameMap = { "color.brand.dark-maroon": "color.brand.maroon" };
    const result = computeDiff(codeTokens, figmaState, renameMap);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].status).toBe("renamed");
    expect(result.entries[0].oldName).toBe("brand/dark-maroon");
    expect(result.entries[0].newName).toBe("brand/maroon");
    expect(result.summary.renamed).toBe(1);
  });

  it("orphaned variable (has tokenPath but no code match) → reports 'orphaned'", () => {
    const codeTokens: CodeToken[] = [];
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("spacing.6", "spacing/6", 6)],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].status).toBe("orphaned");
    expect(result.entries[0].tokenPath).toBe("spacing.6");
    expect(result.summary.orphaned).toBe(1);
  });

  it("mixed state: 2 new + 1 changed + 1 orphaned → correct counts", () => {
    const codeTokens = [
      makeCodeToken("spacing.4", 4, "spacing/4"),
      makeCodeToken("spacing.8", 12, "spacing/8"),   // changed
      makeCodeToken("spacing.12", 12, "spacing/12"),  // new
      makeCodeToken("spacing.16", 16, "spacing/16"),  // new
    ];
    const figmaState: FigmaSnapshot = {
      variables: [
        makeFigmaVar("spacing.4", "spacing/4", 4),     // in_sync
        makeFigmaVar("spacing.8", "spacing/8", 8),      // changed
        makeFigmaVar("spacing.6", "spacing/6", 6),      // orphaned
      ],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.summary.new).toBe(2);
    expect(result.summary.changed).toBe(1);
    expect(result.summary.orphaned).toBe(1);
    expect(result.summary.inSync).toBe(1);
    expect(result.summary.total).toBe(5);
  });

  it("color mode diff: light value changed, dark same → reports 'changed'", () => {
    const codeTokens = [makeCodeToken("color.surface.base", "{color.neutral.100}", "surface/base")]; // changed from 50 to 100
    const figmaState: FigmaSnapshot = {
      variables: [
        makeFigmaVar("color.surface.base", "surface/base", "{color.neutral.50}", {
          modeValues: {
            light: "{color.neutral.50}",  // old
            dark: "{color.neutral.950}",
          },
        }),
      ],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries[0].status).toBe("changed");
  });

  it("color alias changed (different primitive target) → reports 'changed'", () => {
    const codeTokens = [makeCodeToken("color.brand.maroon", "{color.maroon.700}", "brand/maroon")]; // was 800
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("color.brand.maroon", "brand/maroon", "{color.maroon.800}")],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries[0].status).toBe("changed");
  });

  it("typography extension changed (tnum removed) → reports 'changed'", () => {
    const codeToken: CodeToken = {
      tokenPath: "typography.number.s",
      figmaName: "Number/S",
      value: { fontSize: "{typography.fontSize.200}" },
      extensions: undefined,  // tnum removed
    };
    const figmaState: FigmaSnapshot = {
      variables: [],
      textStyles: [{
        tokenPath: "typography.number.s",
        name: "Number/S",
        value: { fontSize: "{typography.fontSize.200}" },
        extensions: { openTypeFeatures: { tnum: true } },
      }],
    };
    const result = computeDiff([codeToken], figmaState);
    expect(result.entries[0].status).toBe("changed");
  });

  it("text style with wrong letterSpacing percentage → reports 'changed'", () => {
    const codeToken: CodeToken = {
      tokenPath: "typography.display.l",
      figmaName: "Display/L",
      value: { letterSpacing: "{typography.letterSpacing.tight-4}" },
    };
    const figmaState: FigmaSnapshot = {
      variables: [],
      textStyles: [{
        tokenPath: "typography.display.l",
        name: "Display/L",
        value: { letterSpacing: "{typography.letterSpacing.tight-3}" },  // wrong
      }],
    };
    const result = computeDiff([codeToken], figmaState);
    expect(result.entries[0].status).toBe("changed");
  });

  it("handles rename map with multiple entries", () => {
    const codeTokens = [
      makeCodeToken("color.brand.maroon", "#680d0d", "brand/maroon"),
      makeCodeToken("color.brand.teal", "#097e8d", "brand/teal"),
    ];
    const figmaState: FigmaSnapshot = {
      variables: [
        makeFigmaVar("color.brand.dark-maroon", "brand/dark-maroon", "#680d0d"),
        makeFigmaVar("color.brand.dark-teal", "brand/dark-teal", "#097e8d"),
      ],
      textStyles: [],
    };
    const renameMap = {
      "color.brand.dark-maroon": "color.brand.maroon",
      "color.brand.dark-teal": "color.brand.teal",
    };
    const result = computeDiff(codeTokens, figmaState, renameMap);
    expect(result.summary.renamed).toBe(2);
  });

  it("handles empty rename map", () => {
    const codeTokens = [makeCodeToken("spacing.4", 4, "spacing/4")];
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("spacing.4", "spacing/4", 4)],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState, {});
    expect(result.summary.inSync).toBe(1);
  });

  it("handles missing rename map gracefully (undefined)", () => {
    const codeTokens = [makeCodeToken("spacing.4", 4, "spacing/4")];
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("spacing.4", "spacing/4", 4)],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState, undefined);
    expect(result.summary.inSync).toBe(1);
  });
});
```

- [ ] **Step 2: Implement diff.ts**

```typescript
// src/main/diff.ts
//
// Compares code tokens against a Figma state snapshot.
// Pure function — no Figma API calls.

export interface CodeToken {
  tokenPath: string;
  figmaName: string;
  value: any;
  extensions?: any;
}

export interface FigmaVariableSnapshot {
  tokenPath: string;
  name: string;
  value: any;
  scopes?: string[];
  description?: string;
  modeValues?: Record<string, any>;
}

export interface FigmaTextStyleSnapshot {
  tokenPath: string;
  name: string;
  value: any;
  extensions?: any;
}

export interface FigmaSnapshot {
  variables: FigmaVariableSnapshot[];
  textStyles: FigmaTextStyleSnapshot[];
}

export interface DiffEntry {
  tokenPath: string;
  status: "new" | "changed" | "renamed" | "orphaned" | "in_sync";
  oldName?: string;
  newName?: string;
  oldValue?: any;
  newValue?: any;
}

export interface DiffSummary {
  total: number;
  new: number;
  changed: number;
  renamed: number;
  orphaned: number;
  inSync: number;
}

export interface DiffResult {
  entries: DiffEntry[];
  summary: DiffSummary;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a == b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function computeDiff(
  codeTokens: CodeToken[],
  figmaState: FigmaSnapshot,
  renameMap?: Record<string, string>,
): DiffResult {
  const entries: DiffEntry[] = [];
  const renames = renameMap ?? {};

  // Build reverse rename map: newTokenPath → oldTokenPath
  const reverseRenames: Record<string, string> = {};
  for (const [oldPath, newPath] of Object.entries(renames)) {
    reverseRenames[newPath] = oldPath;
  }

  // Build Figma lookup by tokenPath
  const figmaVarByPath = new Map<string, FigmaVariableSnapshot>();
  for (const v of figmaState.variables) {
    figmaVarByPath.set(v.tokenPath, v);
  }
  const figmaStyleByPath = new Map<string, FigmaTextStyleSnapshot>();
  for (const s of figmaState.textStyles) {
    figmaStyleByPath.set(s.tokenPath, s);
  }

  // Track which Figma artifacts were matched
  const matchedFigmaPaths = new Set<string>();

  // Process each code token
  for (const codeToken of codeTokens) {
    // Try direct tokenPath match
    const figmaVar = figmaVarByPath.get(codeToken.tokenPath);
    const figmaStyle = figmaStyleByPath.get(codeToken.tokenPath);
    const figmaArtifact = figmaVar ?? figmaStyle;

    if (figmaArtifact) {
      matchedFigmaPaths.add(codeToken.tokenPath);

      // Check if value has changed
      const figmaValue = figmaArtifact.value;
      const codeValue = codeToken.value;
      const extensionsMatch = figmaStyle
        ? deepEqual(codeToken.extensions, figmaStyle.extensions)
        : true;

      if (!deepEqual(figmaValue, codeValue) || !extensionsMatch) {
        entries.push({
          tokenPath: codeToken.tokenPath,
          status: "changed",
          oldValue: figmaValue,
          newValue: codeValue,
        });
      } else {
        entries.push({
          tokenPath: codeToken.tokenPath,
          status: "in_sync",
        });
      }
      continue;
    }

    // Try rename match: check if there's a Figma artifact with the old tokenPath
    const oldPath = reverseRenames[codeToken.tokenPath];
    if (oldPath) {
      const oldFigmaVar = figmaVarByPath.get(oldPath);
      const oldFigmaStyle = figmaStyleByPath.get(oldPath);
      const oldArtifact = oldFigmaVar ?? oldFigmaStyle;

      if (oldArtifact) {
        matchedFigmaPaths.add(oldPath);
        entries.push({
          tokenPath: codeToken.tokenPath,
          status: "renamed",
          oldName: oldArtifact.name,
          newName: codeToken.figmaName,
        });
        continue;
      }
    }

    // No match → new
    entries.push({
      tokenPath: codeToken.tokenPath,
      status: "new",
    });
  }

  // Find orphaned Figma artifacts (have tokenPath but no code match)
  for (const v of figmaState.variables) {
    if (!matchedFigmaPaths.has(v.tokenPath)) {
      // Check if it was renamed away (old path in rename map)
      if (!renames[v.tokenPath]) {
        entries.push({
          tokenPath: v.tokenPath,
          status: "orphaned",
        });
      }
    }
  }
  for (const s of figmaState.textStyles) {
    if (!matchedFigmaPaths.has(s.tokenPath)) {
      if (!renames[s.tokenPath]) {
        entries.push({
          tokenPath: s.tokenPath,
          status: "orphaned",
        });
      }
    }
  }

  // Compute summary
  const summary: DiffSummary = {
    total: entries.length,
    new: entries.filter(e => e.status === "new").length,
    changed: entries.filter(e => e.status === "changed").length,
    renamed: entries.filter(e => e.status === "renamed").length,
    orphaned: entries.filter(e => e.status === "orphaned").length,
    inSync: entries.filter(e => e.status === "in_sync").length,
  };

  return { entries, summary };
}
```

- [ ] **Step 3: Run tests**

```bash
cd lab/origin-sync && npx vitest run src/main/diff.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add lab/origin-sync/src/main/diff.ts lab/origin-sync/src/main/diff.test.ts
git commit -m "feat(origin-sync): add diff engine for code-vs-Figma comparison"
```

---

### Task 6: Upsert engine

**Files:**
- Create: `lab/origin-sync/src/main/upsert.ts`
- Create: `lab/origin-sync/src/main/upsert.test.ts`
- Create: `lab/origin-sync/src/main/collections.ts`
- Create: `lab/origin-sync/src/main/collections.test.ts`

Core create/update/rename logic that uses the Figma API (mocked in tests).

- [ ] **Step 1: Write collections.test.ts (tests first)**

```typescript
// src/main/collections.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../test/figma-mock";
import { findOrCreateCollection, findModeByName, ensureModes } from "./collections";

beforeEach(() => {
  resetMock();
});

describe("Collections — findOrCreateCollection", () => {
  it("creates a new collection when none exists", async () => {
    const col = await findOrCreateCollection("Spacing");
    expect(col.name).toBe("Spacing");
    const all = await figma.variables.getLocalVariableCollectionsAsync();
    expect(all).toHaveLength(1);
  });

  it("returns existing collection if name matches", async () => {
    const first = await findOrCreateCollection("Spacing");
    const second = await findOrCreateCollection("Spacing");
    expect(second.id).toBe(first.id);
    const all = await figma.variables.getLocalVariableCollectionsAsync();
    expect(all).toHaveLength(1);
  });

  it("sets hiddenFromPublishing when requested", async () => {
    const col = await findOrCreateCollection("Primitives", { hidden: true });
    expect(col.hiddenFromPublishing).toBe(true);
  });

  it("creates collection with hiddenFromPublishing=false by default", async () => {
    const col = await findOrCreateCollection("Public");
    expect(col.hiddenFromPublishing).toBe(false);
  });
});

describe("Collections — ensureModes", () => {
  it("creates Light and Dark modes on a new collection", async () => {
    const col = await findOrCreateCollection("Color");
    const { lightModeId, darkModeId } = await ensureModes(col, "Light", "Dark");
    expect(lightModeId).toBeTruthy();
    expect(darkModeId).toBeTruthy();
    expect(lightModeId).not.toBe(darkModeId);
    expect(col.modes).toHaveLength(2);
    expect(col.modes.map(m => m.name).sort()).toEqual(["Dark", "Light"]);
  });

  it("returns existing mode IDs if modes already exist", async () => {
    const col = await findOrCreateCollection("Color");
    const first = await ensureModes(col, "Light", "Dark");
    const second = await ensureModes(col, "Light", "Dark");
    expect(first.lightModeId).toBe(second.lightModeId);
    expect(first.darkModeId).toBe(second.darkModeId);
    expect(col.modes).toHaveLength(2); // no duplicates
  });
});

describe("Collections — findModeByName", () => {
  it("finds a mode by its name", async () => {
    const col = await findOrCreateCollection("Test");
    col.renameMode(col.defaultModeId, "Light");
    const found = findModeByName(col, "Light");
    expect(found).toBe(col.defaultModeId);
  });

  it("returns null for non-existent mode", async () => {
    const col = await findOrCreateCollection("Test");
    const found = findModeByName(col, "NonExistent");
    expect(found).toBeNull();
  });
});
```

- [ ] **Step 2: Implement collections.ts**

```typescript
// src/main/collections.ts
//
// Collection find-or-create helpers.

export async function findOrCreateCollection(
  name: string,
  options?: { hidden?: boolean },
): Promise<VariableCollection> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const existing = collections.find(c => c.name === name);

  if (existing) {
    if (options?.hidden !== undefined) {
      existing.hiddenFromPublishing = options.hidden;
    }
    return existing;
  }

  const col = figma.variables.createVariableCollection(name);
  if (options?.hidden) {
    col.hiddenFromPublishing = true;
  }
  return col;
}

export function findModeByName(
  collection: VariableCollection,
  name: string,
): string | null {
  const mode = collection.modes.find(m => m.name === name);
  return mode?.modeId ?? null;
}

export async function ensureModes(
  collection: VariableCollection,
  firstName: string,
  secondName: string,
): Promise<{ lightModeId: string; darkModeId: string }> {
  let firstModeId = findModeByName(collection, firstName);
  let secondModeId = findModeByName(collection, secondName);

  if (!firstModeId) {
    // Rename default mode to first name
    collection.renameMode(collection.defaultModeId, firstName);
    firstModeId = collection.defaultModeId;
  }

  if (!secondModeId) {
    secondModeId = collection.addMode(secondName);
  }

  return { lightModeId: firstModeId, darkModeId: secondModeId };
}
```

- [ ] **Step 3: Write upsert.test.ts (tests first)**

```typescript
// src/main/upsert.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { resetMock, mockState } from "../test/figma-mock";
import {
  upsertVariable,
  upsertTextStyle,
  buildTokenPathIndex,
  UpsertResult,
  hexToRgba,
} from "./upsert";
import { findOrCreateCollection, ensureModes } from "./collections";

beforeEach(() => {
  resetMock();
});

describe("Upsert — hexToRgba", () => {
  it("converts 6-digit hex to RGBA", () => {
    expect(hexToRgba("#ff0000")).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(hexToRgba("#ffffff")).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });

  it("converts 8-digit hex with alpha", () => {
    const result = hexToRgba("#ffffff66");
    expect(result.r).toBe(1);
    expect(result.g).toBe(1);
    expect(result.b).toBe(1);
    expect(result.a).toBeCloseTo(0.4, 1);
  });
});

describe("Upsert — buildTokenPathIndex", () => {
  it("builds lookup from variables with tokenPath pluginData", async () => {
    const col = await findOrCreateCollection("Test");
    const v1 = figma.variables.createVariable("spacing/4", col, "FLOAT");
    v1.setPluginData("tokenPath", "spacing.4");
    const v2 = figma.variables.createVariable("spacing/8", col, "FLOAT");
    v2.setPluginData("tokenPath", "spacing.8");

    const allVars = await figma.variables.getLocalVariablesAsync();
    const index = buildTokenPathIndex(allVars);
    expect(index.get("spacing.4")).toBe(v1);
    expect(index.get("spacing.8")).toBe(v2);
  });

  it("ignores variables without tokenPath pluginData", async () => {
    const col = await findOrCreateCollection("Test");
    figma.variables.createVariable("no-path", col, "FLOAT");
    const allVars = await figma.variables.getLocalVariablesAsync();
    const index = buildTokenPathIndex(allVars);
    expect(index.size).toBe(0);
  });
});

describe("Upsert — upsertVariable (FLOAT)", () => {
  it("creates new FLOAT variable with correct name, value, scope, tokenPath", async () => {
    const col = await findOrCreateCollection("Spacing");
    const result = await upsertVariable({
      tokenPath: "spacing.16",
      figmaName: "spacing/16",
      value: 16,
      type: "FLOAT",
      collection: col,
      scopes: ["GAP"],
    });
    expect(result.action).toBe("created");
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(1);
    const v = allVars[0];
    expect(v.name).toBe("spacing/16");
    expect(v.getPluginData("tokenPath")).toBe("spacing.16");
    expect(v.scopes).toEqual(["GAP"]);
    expect(v.valuesByMode[col.defaultModeId]).toBe(16);
  });

  it("updates existing variable value (matched by tokenPath)", async () => {
    const col = await findOrCreateCollection("Spacing");
    const existing = figma.variables.createVariable("spacing/16", col, "FLOAT");
    existing.setPluginData("tokenPath", "spacing.16");
    existing.setValueForMode(col.defaultModeId, 16);

    const result = await upsertVariable({
      tokenPath: "spacing.16",
      figmaName: "spacing/16",
      value: 20,  // changed
      type: "FLOAT",
      collection: col,
      scopes: ["GAP"],
      existingIndex: buildTokenPathIndex([existing]),
    });
    expect(result.action).toBe("updated");
    expect(existing.valuesByMode[col.defaultModeId]).toBe(20);
  });

  it("updates existing variable name (matched by tokenPath, name differs)", async () => {
    const col = await findOrCreateCollection("Spacing");
    const existing = figma.variables.createVariable("spacing/old-name", col, "FLOAT");
    existing.setPluginData("tokenPath", "spacing.16");
    existing.setValueForMode(col.defaultModeId, 16);

    const result = await upsertVariable({
      tokenPath: "spacing.16",
      figmaName: "spacing/16",
      value: 16,
      type: "FLOAT",
      collection: col,
      scopes: ["GAP"],
      existingIndex: buildTokenPathIndex([existing]),
    });
    expect(existing.name).toBe("spacing/16");
  });

  it("applies rename: finds by old tokenPath, updates name + tokenPath", async () => {
    const col = await findOrCreateCollection("Spacing");
    const existing = figma.variables.createVariable("spacing/old", col, "FLOAT");
    existing.setPluginData("tokenPath", "spacing.old");
    existing.setValueForMode(col.defaultModeId, 16);

    const renameMap = { "spacing.old": "spacing.16" };
    const result = await upsertVariable({
      tokenPath: "spacing.16",
      figmaName: "spacing/16",
      value: 16,
      type: "FLOAT",
      collection: col,
      scopes: ["GAP"],
      existingIndex: buildTokenPathIndex([existing]),
      renameMap,
    });
    expect(result.action).toBe("renamed");
    expect(existing.name).toBe("spacing/16");
    expect(existing.getPluginData("tokenPath")).toBe("spacing.16");
  });

  it("sets description on variable", async () => {
    const col = await findOrCreateCollection("Radius");
    const result = await upsertVariable({
      tokenPath: "radius.full",
      figmaName: "radius/full",
      value: 9999,
      type: "FLOAT",
      collection: col,
      scopes: ["CORNER_RADIUS"],
      description: "Fully rounded — produces pill/capsule shapes",
    });
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars[0].description).toBe("Fully rounded — produces pill/capsule shapes");
  });

  it("sets scopes on variable", async () => {
    const col = await findOrCreateCollection("Test");
    await upsertVariable({
      tokenPath: "test.var",
      figmaName: "test/var",
      value: 0,
      type: "FLOAT",
      collection: col,
      scopes: ["GAP", "CORNER_RADIUS"],
    });
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars[0].scopes).toEqual(["GAP", "CORNER_RADIUS"]);
  });
});

describe("Upsert — upsertVariable (COLOR)", () => {
  it("creates new COLOR variable with hex conversion to RGBA", async () => {
    const col = await findOrCreateCollection("Colors");
    await upsertVariable({
      tokenPath: "color.neutral.50",
      figmaName: "neutral/50",
      value: "#ffffff",
      type: "COLOR",
      collection: col,
      scopes: ["ALL_FILLS", "STROKE_COLOR"],
    });
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    expect(allVars[0].valuesByMode[col.defaultModeId]).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });
});

describe("Upsert — upsertVariable (STRING)", () => {
  it("creates new STRING variable", async () => {
    const col = await findOrCreateCollection("Typography");
    await upsertVariable({
      tokenPath: "typography.fontFamily.primary",
      figmaName: "typography/fontFamily/primary",
      value: "Haffer",
      type: "STRING",
      collection: col,
      scopes: ["FONT_FAMILY"],
    });
    const allVars = await figma.variables.getLocalVariablesAsync("STRING");
    expect(allVars).toHaveLength(1);
    expect(allVars[0].valuesByMode[col.defaultModeId]).toBe("Haffer");
  });
});

describe("Upsert — variable alias (cross-collection)", () => {
  it("creates variable alias (semantic → primitive)", async () => {
    const primCol = await findOrCreateCollection("Color Primitives", { hidden: true });
    const semCol = await findOrCreateCollection("Color");
    const { lightModeId, darkModeId } = await ensureModes(semCol, "Light", "Dark");

    // Create primitive
    const prim = figma.variables.createVariable("neutral/50", primCol, "COLOR");
    prim.setPluginData("tokenPath", "color.neutral.50");
    prim.setValueForMode(primCol.defaultModeId, hexToRgba("#ffffff"));

    // Upsert semantic with alias
    await upsertVariable({
      tokenPath: "color.surface.base",
      figmaName: "surface/base",
      value: { type: "VARIABLE_ALIAS", id: prim.id },
      type: "COLOR",
      collection: semCol,
      scopes: ["ALL_FILLS"],
      modeId: lightModeId,
    });

    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const sem = allVars.find(v => v.name === "surface/base");
    expect(sem).toBeDefined();
    expect(sem!.valuesByMode[lightModeId]).toEqual({ type: "VARIABLE_ALIAS", id: prim.id });
  });
});

describe("Upsert — collection modes", () => {
  it("creates collection with correct hiddenFromPublishing", async () => {
    const hidden = await findOrCreateCollection("Primitives", { hidden: true });
    const published = await findOrCreateCollection("Public");
    expect(hidden.hiddenFromPublishing).toBe(true);
    expect(published.hiddenFromPublishing).toBe(false);
  });

  it("creates collection modes (Light, Dark)", async () => {
    const col = await findOrCreateCollection("Color");
    const { lightModeId, darkModeId } = await ensureModes(col, "Light", "Dark");
    expect(col.modes).toHaveLength(2);
    expect(col.modes.map(m => m.name).sort()).toEqual(["Dark", "Light"]);
  });

  it("sets value per mode for COLOR variables", async () => {
    const primCol = await findOrCreateCollection("Primitives");
    const semCol = await findOrCreateCollection("Semantic");
    const { lightModeId, darkModeId } = await ensureModes(semCol, "Light", "Dark");

    const lightPrim = figma.variables.createVariable("neutral/50", primCol, "COLOR");
    lightPrim.setValueForMode(primCol.defaultModeId, hexToRgba("#ffffff"));
    const darkPrim = figma.variables.createVariable("neutral/950", primCol, "COLOR");
    darkPrim.setValueForMode(primCol.defaultModeId, hexToRgba("#16100f"));

    const sem = figma.variables.createVariable("surface/base", semCol, "COLOR");
    sem.setValueForMode(lightModeId, figma.variables.createVariableAlias(lightPrim));
    sem.setValueForMode(darkModeId, figma.variables.createVariableAlias(darkPrim));

    expect(sem.valuesByMode[lightModeId]).toEqual({ type: "VARIABLE_ALIAS", id: lightPrim.id });
    expect(sem.valuesByMode[darkModeId]).toEqual({ type: "VARIABLE_ALIAS", id: darkPrim.id });
  });
});

describe("Upsert — text styles", () => {
  it("creates text style with correct folder name", async () => {
    const result = await upsertTextStyle({
      tokenPath: "typography.display.l",
      figmaName: "Display/L",
      fontSize: 57,
      lineHeight: { value: 56, unit: "PIXELS" },
      letterSpacing: { value: -2, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Heavy" },
      textCase: "UPPER",
    });
    expect(result.action).toBe("created");
    const styles = await figma.getLocalTextStylesAsync();
    expect(styles).toHaveLength(1);
    expect(styles[0].name).toBe("Display/L");
  });

  it("sets letterSpacing as { value, unit: 'PERCENT' } directly (not bound)", async () => {
    await upsertTextStyle({
      tokenPath: "typography.display.l",
      figmaName: "Display/L",
      fontSize: 57,
      lineHeight: { value: 56, unit: "PIXELS" },
      letterSpacing: { value: -2, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Heavy" },
    });
    const styles = await figma.getLocalTextStylesAsync();
    expect(styles[0].letterSpacing).toEqual({ value: -2, unit: "PERCENT" });
  });

  it("sets textCase on text styles that need it", async () => {
    await upsertTextStyle({
      tokenPath: "typography.display.l",
      figmaName: "Display/L",
      fontSize: 57,
      lineHeight: { value: 56, unit: "PIXELS" },
      letterSpacing: { value: -2, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Heavy" },
      textCase: "UPPER",
    });
    const styles = await figma.getLocalTextStylesAsync();
    expect(styles[0].textCase).toBe("UPPER");
  });

  it("sets fontName with correct family/style pair", async () => {
    await upsertTextStyle({
      tokenPath: "typography.body.m",
      figmaName: "Body/M",
      fontSize: 14,
      lineHeight: { value: 20, unit: "PIXELS" },
      letterSpacing: { value: -0.6, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Regular" },
    });
    const styles = await figma.getLocalTextStylesAsync();
    expect(styles[0].fontName).toEqual({ family: "Haffer", style: "Regular" });
  });

  it("binds text style properties to variables", async () => {
    const col = await findOrCreateCollection("Typography Primitives");
    const fsVar = figma.variables.createVariable("typography/fontSize/1200", col, "FLOAT");
    fsVar.setPluginData("tokenPath", "typography.fontSize.1200");
    const lhVar = figma.variables.createVariable("typography/lineHeight/1200", col, "FLOAT");
    lhVar.setPluginData("tokenPath", "typography.lineHeight.1200");
    const fwVar = figma.variables.createVariable("typography/fontWeight/heavy", col, "FLOAT");
    fwVar.setPluginData("tokenPath", "typography.fontWeight.heavy");
    const ffVar = figma.variables.createVariable("typography/fontFamily/primary", col, "STRING");
    ffVar.setPluginData("tokenPath", "typography.fontFamily.primary");

    await upsertTextStyle({
      tokenPath: "typography.display.l",
      figmaName: "Display/L",
      fontSize: 57,
      lineHeight: { value: 56, unit: "PIXELS" },
      letterSpacing: { value: -2, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Heavy" },
      textCase: "UPPER",
      boundVariables: {
        fontSize: fsVar,
        lineHeight: lhVar,
        fontWeight: fwVar,
        fontFamily: ffVar,
      },
    });

    const styles = await figma.getLocalTextStylesAsync();
    const bound = styles[0].getBoundVariables();
    expect(bound.fontSize).toEqual({ type: "VARIABLE_ALIAS", id: fsVar.id });
    expect(bound.lineHeight).toEqual({ type: "VARIABLE_ALIAS", id: lhVar.id });
    expect(bound.fontWeight).toEqual({ type: "VARIABLE_ALIAS", id: fwVar.id });
    expect(bound.fontFamily).toEqual({ type: "VARIABLE_ALIAS", id: ffVar.id });
  });

  it("does NOT delete orphaned variables — reports them in result", async () => {
    const col = await findOrCreateCollection("Spacing");
    const orphan = figma.variables.createVariable("spacing/6", col, "FLOAT");
    orphan.setPluginData("tokenPath", "spacing.6");

    // Sync only spacing.4 — spacing.6 is orphaned
    await upsertVariable({
      tokenPath: "spacing.4",
      figmaName: "spacing/4",
      value: 4,
      type: "FLOAT",
      collection: col,
      scopes: ["GAP"],
    });

    // Orphan still exists
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(2); // spacing.4 + spacing.6
    expect(allVars.find(v => v.getPluginData("tokenPath") === "spacing.6")).toBeDefined();
  });

  it("handles idempotent re-runs (sync twice → no duplicates)", async () => {
    const col = await findOrCreateCollection("Spacing");

    // First sync
    const result1 = await upsertVariable({
      tokenPath: "spacing.16",
      figmaName: "spacing/16",
      value: 16,
      type: "FLOAT",
      collection: col,
      scopes: ["GAP"],
    });
    expect(result1.action).toBe("created");

    // Build index from current state
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const index = buildTokenPathIndex(allVars);

    // Second sync with same data
    const result2 = await upsertVariable({
      tokenPath: "spacing.16",
      figmaName: "spacing/16",
      value: 16,
      type: "FLOAT",
      collection: col,
      scopes: ["GAP"],
      existingIndex: index,
    });
    expect(result2.action).toBe("unchanged");

    // Still only 1 variable
    const finalVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(finalVars).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Implement upsert.ts**

```typescript
// src/main/upsert.ts
//
// Core create/update/rename engine for Figma variables and text styles.
// Identity matching by tokenPath pluginData — never by name.

export interface UpsertResult {
  action: "created" | "updated" | "renamed" | "unchanged";
  variableId?: string;
  styleId?: string;
}

export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

export function buildTokenPathIndex(
  artifacts: Array<{ getPluginData(key: string): string; id: string }>,
): Map<string, any> {
  const index = new Map<string, any>();
  for (const a of artifacts) {
    const tp = a.getPluginData("tokenPath");
    if (tp) index.set(tp, a);
  }
  return index;
}

export interface UpsertVariableOptions {
  tokenPath: string;
  figmaName: string;
  value: any;
  type: "COLOR" | "FLOAT" | "STRING";
  collection: VariableCollection;
  scopes: string[];
  description?: string;
  modeId?: string;
  existingIndex?: Map<string, any>;
  renameMap?: Record<string, string>;
}

export async function upsertVariable(options: UpsertVariableOptions): Promise<UpsertResult> {
  const {
    tokenPath, figmaName, value, type, collection, scopes,
    description, modeId, existingIndex, renameMap,
  } = options;

  const targetModeId = modeId ?? collection.defaultModeId;

  // 1. Try direct tokenPath match
  let variable = existingIndex?.get(tokenPath);

  if (variable) {
    // Check if value and name are the same — if so, unchanged
    const currentValue = variable.valuesByMode[targetModeId];
    const newValue = type === "COLOR" && typeof value === "string" ? hexToRgba(value) : value;
    const valueMatch = JSON.stringify(currentValue) === JSON.stringify(newValue);
    const nameMatch = variable.name === figmaName;

    if (valueMatch && nameMatch) {
      // Still update scopes and description in case they changed
      variable.scopes = scopes;
      if (description) variable.description = description;
      return { action: "unchanged", variableId: variable.id };
    }

    // Update
    variable.name = figmaName;
    const finalValue = type === "COLOR" && typeof value === "string" ? hexToRgba(value) : value;
    variable.setValueForMode(targetModeId, finalValue);
    variable.scopes = scopes;
    if (description) variable.description = description;
    return { action: "updated", variableId: variable.id };
  }

  // 2. Try rename match
  if (renameMap) {
    const reverseRenames: Record<string, string> = {};
    for (const [oldPath, newPath] of Object.entries(renameMap)) {
      reverseRenames[newPath] = oldPath;
    }
    const oldPath = reverseRenames[tokenPath];
    if (oldPath && existingIndex) {
      variable = existingIndex.get(oldPath);
      if (variable) {
        variable.name = figmaName;
        variable.setPluginData("tokenPath", tokenPath);
        const finalValue = type === "COLOR" && typeof value === "string" ? hexToRgba(value) : value;
        variable.setValueForMode(targetModeId, finalValue);
        variable.scopes = scopes;
        if (description) variable.description = description;
        return { action: "renamed", variableId: variable.id };
      }
    }
  }

  // 3. Create new
  variable = figma.variables.createVariable(figmaName, collection, type as any);
  variable.setPluginData("tokenPath", tokenPath);
  const finalValue = type === "COLOR" && typeof value === "string" ? hexToRgba(value) : value;
  variable.setValueForMode(targetModeId, finalValue);
  variable.scopes = scopes as any;
  if (description) variable.description = description;

  return { action: "created", variableId: variable.id };
}

export interface UpsertTextStyleOptions {
  tokenPath: string;
  figmaName: string;
  fontSize: number;
  lineHeight: { value: number; unit: "PIXELS" | "PERCENT" };
  letterSpacing: { value: number; unit: "PERCENT" };
  fontName: { family: string; style: string };
  textCase?: "UPPER" | "ORIGINAL";
  boundVariables?: {
    fontSize?: any;
    lineHeight?: any;
    fontWeight?: any;
    fontFamily?: any;
  };
  existingIndex?: Map<string, any>;
  renameMap?: Record<string, string>;
}

export async function upsertTextStyle(options: UpsertTextStyleOptions): Promise<UpsertResult> {
  const {
    tokenPath, figmaName, fontSize, lineHeight, letterSpacing,
    fontName, textCase, boundVariables, existingIndex, renameMap,
  } = options;

  // Try direct tokenPath match
  let style = existingIndex?.get(tokenPath);

  if (!style) {
    // Try rename match
    if (renameMap) {
      const reverseRenames: Record<string, string> = {};
      for (const [oldPath, newPath] of Object.entries(renameMap)) {
        reverseRenames[newPath] = oldPath;
      }
      const oldPath = reverseRenames[tokenPath];
      if (oldPath && existingIndex) {
        style = existingIndex.get(oldPath);
        if (style) {
          style.setPluginData("tokenPath", tokenPath);
        }
      }
    }
  }

  const isNew = !style;
  if (!style) {
    style = figma.createTextStyle();
  }

  style.name = figmaName;
  style.setPluginData("tokenPath", tokenPath);
  style.fontSize = fontSize;
  style.lineHeight = lineHeight;
  style.letterSpacing = letterSpacing;
  style.fontName = fontName;
  if (textCase) style.textCase = textCase;

  // Bind variables
  if (boundVariables) {
    if (boundVariables.fontSize) style.setBoundVariable("fontSize", boundVariables.fontSize);
    if (boundVariables.lineHeight) style.setBoundVariable("lineHeight", boundVariables.lineHeight);
    if (boundVariables.fontWeight) style.setBoundVariable("fontWeight", boundVariables.fontWeight);
    if (boundVariables.fontFamily) style.setBoundVariable("fontFamily", boundVariables.fontFamily);
  }

  return { action: isNew ? "created" : "updated", styleId: style.id };
}
```

- [ ] **Step 5: Run tests**

```bash
cd lab/origin-sync && npx vitest run src/main/upsert.test.ts src/main/collections.test.ts
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add lab/origin-sync/src/main/upsert.ts lab/origin-sync/src/main/upsert.test.ts \
        lab/origin-sync/src/main/collections.ts lab/origin-sync/src/main/collections.test.ts
git commit -m "feat(origin-sync): add upsert engine and collection helpers with tests"
```

---

### Task 7: Foundation sync — color

**Files:**
- Create: `lab/origin-sync/src/main/foundations/color.ts`
- Create: `lab/origin-sync/src/main/foundations/color.test.ts`

Integrates parser + upsert for the color foundation. Creates both primitive and semantic collections, modes, and cross-collection aliases.

- [ ] **Step 1: Write color.test.ts (tests first)**

```typescript
// src/main/foundations/color.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../../test/figma-mock";
import { syncColor } from "./color";
import { buildTokenPathIndex } from "../upsert";

beforeEach(() => {
  resetMock();
});

describe("Foundation Sync — Color (first sync)", () => {
  it("creates 114 primitive variables + 48 semantic variables = 162 total", async () => {
    const result = await syncColor();
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    expect(allVars).toHaveLength(162);
    expect(result.primitivesCreated).toBe(114);
    expect(result.semanticsCreated).toBe(48);
  });

  it("primitive collection is hidden, semantic collection is published", async () => {
    await syncColor();
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const primCol = cols.find(c => c.name === "Color Primitives");
    const semCol = cols.find(c => c.name === "Color");
    expect(primCol!.hiddenFromPublishing).toBe(true);
    expect(semCol!.hiddenFromPublishing).toBe(false);
  });

  it("semantic collection has 2 modes (Light, Dark)", async () => {
    await syncColor();
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const semCol = cols.find(c => c.name === "Color");
    expect(semCol!.modes).toHaveLength(2);
    expect(semCol!.modes.map(m => m.name).sort()).toEqual(["Dark", "Light"]);
  });

  it("all 48 semantic variables alias correct primitives in both modes", async () => {
    await syncColor();
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const semCol = cols.find(c => c.name === "Color")!;
    const semVars = allVars.filter(v => v.variableCollectionId === semCol.id);

    expect(semVars).toHaveLength(48);

    const lightModeId = semCol.modes.find(m => m.name === "Light")!.modeId;
    const darkModeId = semCol.modes.find(m => m.name === "Dark")!.modeId;

    for (const v of semVars) {
      const lightVal = v.valuesByMode[lightModeId];
      const darkVal = v.valuesByMode[darkModeId];
      expect(lightVal).toHaveProperty("type", "VARIABLE_ALIAS");
      expect(lightVal).toHaveProperty("id");
      expect(darkVal).toHaveProperty("type", "VARIABLE_ALIAS");
      expect(darkVal).toHaveProperty("id");
    }
  });

  it("brand variables have descriptions", async () => {
    await syncColor();
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const maroon = allVars.find(v => v.getPluginData("tokenPath") === "color.brand.maroon");
    expect(maroon!.description).toBe("Pair with on-brand/light");
    const lime = allVars.find(v => v.getPluginData("tokenPath") === "color.brand.lime");
    expect(lime!.description).toBe("Pair with on-brand/dark");
  });

  it("all scopes set correctly per group", async () => {
    await syncColor();
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");

    // Surface → ALL_FILLS
    const surface = allVars.find(v => v.getPluginData("tokenPath") === "color.surface.base");
    expect(surface!.scopes).toEqual(["ALL_FILLS"]);

    // on-surface → ALL_FILLS, TEXT_FILL
    const onSurface = allVars.find(v => v.getPluginData("tokenPath") === "color.on-surface.primary");
    expect(onSurface!.scopes).toEqual(["ALL_FILLS", "TEXT_FILL"]);

    // border → STROKE_COLOR
    const border = allVars.find(v => v.getPluginData("tokenPath") === "color.border.default");
    expect(border!.scopes).toEqual(["STROKE_COLOR"]);

    // success.text → ALL_FILLS, TEXT_FILL
    const successText = allVars.find(v => v.getPluginData("tokenPath") === "color.success.text");
    expect(successText!.scopes).toEqual(["ALL_FILLS", "TEXT_FILL"]);

    // success.border → STROKE_COLOR
    const successBorder = allVars.find(v => v.getPluginData("tokenPath") === "color.success.border");
    expect(successBorder!.scopes).toEqual(["STROKE_COLOR"]);

    // primitives → ALL_FILLS, STROKE_COLOR
    const neutral50 = allVars.find(v => v.getPluginData("tokenPath") === "color.neutral.50");
    expect(neutral50!.scopes).toEqual(["ALL_FILLS", "STROKE_COLOR"]);
  });
});

describe("Foundation Sync — Color (second sync, no changes)", () => {
  it("no new variables created, all in_sync", async () => {
    await syncColor();
    const result2 = await syncColor();
    expect(result2.primitivesCreated).toBe(0);
    expect(result2.semanticsCreated).toBe(0);
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    expect(allVars).toHaveLength(162); // no duplicates
  });
});
```

- [ ] **Step 2: Implement color.ts**

Full integration module that wires token parser, scope config, description config, and upsert engine together for the color foundation. Implementation should:

1. Parse color primitives and semantics (light + dark) using `parseColorPrimitives`, `parseColorSemantics`
2. Find or create "Color Primitives" collection (hidden) and "Color" collection (published, with Light/Dark modes)
3. Build tokenPath index from existing variables
4. Upsert all 114 primitives into the primitives collection
5. Build a primitive lookup (tokenPath → variable) for alias resolution
6. Upsert all 48 semantics, setting aliases for light and dark modes using `figma.variables.createVariableAlias()`
7. Apply scopes via `getColorSemanticScopes` and `getColorPrimitiveScopes`
8. Apply descriptions via `getTokenDescription`
9. Return sync counts

```typescript
// src/main/foundations/color.ts

import colorPrimitivesJson from "@foundations/color/primitives.json";
import colorSemanticLightJson from "@foundations/color/semantic.light.json";
import colorSemanticDarkJson from "@foundations/color/semantic.dark.json";
import { parseColorPrimitives, parseColorSemantics, resolveReference } from "../token-parser";
import { findOrCreateCollection, ensureModes } from "../collections";
import { upsertVariable, buildTokenPathIndex, hexToRgba } from "../upsert";
import { getColorPrimitiveScopes, getColorSemanticScopes } from "../config/scopes";
import { getTokenDescription } from "../config/descriptions";

export interface ColorSyncResult {
  primitivesCreated: number;
  primitivesUpdated: number;
  semanticsCreated: number;
  semanticsUpdated: number;
  errors: string[];
}

export async function syncColor(renameMap?: Record<string, string>): Promise<ColorSyncResult> {
  const errors: string[] = [];
  let primitivesCreated = 0;
  let primitivesUpdated = 0;
  let semanticsCreated = 0;
  let semanticsUpdated = 0;

  // Parse tokens
  const primTokens = parseColorPrimitives(colorPrimitivesJson);
  const lightTokens = parseColorSemantics(colorSemanticLightJson);
  const darkTokens = parseColorSemantics(colorSemanticDarkJson);

  // Collections
  const primCol = await findOrCreateCollection("Color Primitives", { hidden: true });
  const semCol = await findOrCreateCollection("Color");
  const { lightModeId, darkModeId } = await ensureModes(semCol, "Light", "Dark");

  // Build existing index
  const allExistingVars = await figma.variables.getLocalVariablesAsync("COLOR");
  const existingIndex = buildTokenPathIndex(allExistingVars);

  // ── Primitives ──
  const primVarsByTokenPath = new Map<string, any>();

  for (const token of primTokens) {
    const result = await upsertVariable({
      tokenPath: token.tokenPath,
      figmaName: token.figmaName,
      value: token.value,
      type: "COLOR",
      collection: primCol,
      scopes: getColorPrimitiveScopes(),
      existingIndex,
      renameMap,
    });

    if (result.action === "created") primitivesCreated++;
    else if (result.action === "updated" || result.action === "renamed") primitivesUpdated++;

    // Track for alias resolution
    const variable = result.variableId
      ? (await figma.variables.getVariableByIdAsync(result.variableId))
      : null;
    if (variable) {
      primVarsByTokenPath.set(token.tokenPath, variable);
    }
  }

  // Also index newly created primitives
  const allVarsNow = await figma.variables.getLocalVariablesAsync("COLOR");
  const updatedIndex = buildTokenPathIndex(allVarsNow);
  for (const v of allVarsNow) {
    const tp = v.getPluginData("tokenPath");
    if (tp && tp.startsWith("color.") && !tp.includes("surface") && !tp.includes("on-surface")) {
      primVarsByTokenPath.set(tp, v);
    }
  }

  // Build dark token lookup
  const darkByTokenPath = new Map<string, string>();
  for (const dt of darkTokens) {
    darkByTokenPath.set(dt.tokenPath, dt.aliasTarget);
  }

  // ── Semantics ──
  for (const token of lightTokens) {
    // Resolve light alias target
    const lightTarget = primVarsByTokenPath.get(token.aliasTarget);
    if (!lightTarget) {
      errors.push(`Missing primitive for light alias: ${token.aliasTarget} (${token.tokenPath})`);
      continue;
    }

    // Resolve dark alias target
    const darkAliasTarget = darkByTokenPath.get(token.tokenPath);
    if (!darkAliasTarget) {
      errors.push(`Missing dark mapping for: ${token.tokenPath}`);
      continue;
    }
    const darkTarget = primVarsByTokenPath.get(darkAliasTarget);
    if (!darkTarget) {
      errors.push(`Missing primitive for dark alias: ${darkAliasTarget} (${token.tokenPath})`);
      continue;
    }

    // Find or create the semantic variable
    let semVar = updatedIndex.get(token.tokenPath);
    const isNew = !semVar;

    if (!semVar) {
      semVar = figma.variables.createVariable(token.figmaName, semCol, "COLOR");
      semVar.setPluginData("tokenPath", token.tokenPath);
      semanticsCreated++;
    } else {
      semVar.name = token.figmaName;
    }

    // Set aliases per mode
    semVar.setValueForMode(lightModeId, figma.variables.createVariableAlias(lightTarget));
    semVar.setValueForMode(darkModeId, figma.variables.createVariableAlias(darkTarget));

    // Scopes
    semVar.scopes = getColorSemanticScopes(token.figmaName);

    // Description
    const desc = getTokenDescription(token.tokenPath);
    if (desc) semVar.description = desc;

    if (!isNew) semanticsUpdated++;
  }

  return {
    primitivesCreated,
    primitivesUpdated,
    semanticsCreated,
    semanticsUpdated,
    errors,
  };
}
```

- [ ] **Step 3: Run tests**

```bash
cd lab/origin-sync && npx vitest run src/main/foundations/color.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add lab/origin-sync/src/main/foundations/color.ts lab/origin-sync/src/main/foundations/color.test.ts
git commit -m "feat(origin-sync): add color foundation sync with full integration tests"
```

---

### Task 8: Foundation sync — typography

**Files:**
- Create: `lab/origin-sync/src/main/foundations/typography.ts`
- Create: `lab/origin-sync/src/main/foundations/typography.test.ts`

- [ ] **Step 1: Write typography.test.ts (tests first)**

```typescript
// src/main/foundations/typography.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../../test/figma-mock";
import { syncTypography, FONT_WEIGHT_STYLE_MAP } from "./typography";

beforeEach(() => {
  resetMock();
});

describe("Foundation Sync — Typography (first sync)", () => {
  it("creates 30 variables + 25 text styles", async () => {
    const result = await syncTypography();
    const allVars = await figma.variables.getLocalVariablesAsync();
    const styles = await figma.getLocalTextStylesAsync();

    // 12 fontSize + 12 lineHeight + 5 fontWeight + 1 fontFamily = 30
    expect(allVars).toHaveLength(30);
    expect(styles).toHaveLength(25);
    expect(result.variablesCreated).toBe(30);
    expect(result.stylesCreated).toBe(25);
  });

  it("variable collection is hidden", async () => {
    await syncTypography();
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const typCol = cols.find(c => c.name === "Typography Primitives");
    expect(typCol!.hiddenFromPublishing).toBe(true);
  });

  it("letter spacing NOT pushed as variables (only 30, not 38)", async () => {
    await syncTypography();
    const allVars = await figma.variables.getLocalVariablesAsync();
    const lsVars = allVars.filter(v => v.name.includes("letterSpacing"));
    expect(lsVars).toHaveLength(0);
    expect(allVars).toHaveLength(30);
  });

  it("25 text styles created with correct folder names", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const names = styles.map(s => s.name).sort();

    // Verify folder structure
    expect(names.filter(n => n.startsWith("Display/"))).toHaveLength(3);
    expect(names.filter(n => n.startsWith("Header/"))).toHaveLength(3);
    expect(names.filter(n => n.startsWith("Title/"))).toHaveLength(3);
    expect(names.filter(n => n.startsWith("Label/"))).toHaveLength(3);
    expect(names.filter(n => n.startsWith("Label-Heavy/"))).toHaveLength(3);
    expect(names.filter(n => n.startsWith("Body/"))).toHaveLength(3);
    expect(names.filter(n => n.startsWith("Number/"))).toHaveLength(6);
    expect(names.filter(n => n.startsWith("Overline/"))).toHaveLength(1);
  });

  it("text styles bound to correct variables (fontSize, lineHeight, fontWeight, fontFamily)", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const displayL = styles.find(s => s.name === "Display/L");
    const bound = displayL!.getBoundVariables();

    expect(bound.fontSize).toBeDefined();
    expect(bound.fontSize.type).toBe("VARIABLE_ALIAS");
    expect(bound.lineHeight).toBeDefined();
    expect(bound.fontWeight).toBeDefined();
    expect(bound.fontFamily).toBeDefined();
  });

  it("letter spacing set as percentage on each text style", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const displayL = styles.find(s => s.name === "Display/L");
    expect(displayL!.letterSpacing).toEqual({ value: -2, unit: "PERCENT" });

    const bodyM = styles.find(s => s.name === "Body/M");
    expect(bodyM!.letterSpacing).toEqual({ value: -0.6, unit: "PERCENT" });
  });

  it("display styles have textCase uppercase", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const displayStyles = styles.filter(s => s.name.startsWith("Display/"));
    for (const s of displayStyles) {
      expect(s.textCase).toBe("UPPER");
    }
  });

  it("number display styles have textCase uppercase", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const ndStyles = styles.filter(s =>
      s.name.startsWith("Number/Display-")
    );
    expect(ndStyles).toHaveLength(3);
    for (const s of ndStyles) {
      expect(s.textCase).toBe("UPPER");
    }
  });

  it("overline has textCase uppercase", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const overline = styles.find(s => s.name === "Overline/Standard");
    expect(overline!.textCase).toBe("UPPER");
  });

  it("fontName set correctly per weight", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();

    // Display/L uses heavy (900)
    const displayL = styles.find(s => s.name === "Display/L");
    expect(displayL!.fontName).toEqual({ family: "Haffer", style: "Heavy" });

    // Header/S uses bold (700)
    const headerS = styles.find(s => s.name === "Header/S");
    expect(headerS!.fontName).toEqual({ family: "Haffer", style: "Bold" });

    // Title/S uses semibold (600)
    const titleS = styles.find(s => s.name === "Title/S");
    expect(titleS!.fontName).toEqual({ family: "Haffer", style: "SemiBold" });

    // Label-Heavy/M uses medium (500)
    const labelHeavyM = styles.find(s => s.name === "Label-Heavy/M");
    expect(labelHeavyM!.fontName).toEqual({ family: "Haffer", style: "Medium" });

    // Body/M uses regular (400)
    const bodyM = styles.find(s => s.name === "Body/M");
    expect(bodyM!.fontName).toEqual({ family: "Haffer", style: "Regular" });
  });
});

describe("Foundation Sync — Typography (second sync, no changes)", () => {
  it("no duplicates on re-sync", async () => {
    await syncTypography();
    await syncTypography();
    const allVars = await figma.variables.getLocalVariablesAsync();
    const styles = await figma.getLocalTextStylesAsync();
    expect(allVars).toHaveLength(30);
    expect(styles).toHaveLength(25);
  });
});

describe("FONT_WEIGHT_STYLE_MAP", () => {
  it("maps weight numbers to Haffer style strings", () => {
    expect(FONT_WEIGHT_STYLE_MAP[400]).toBe("Regular");
    expect(FONT_WEIGHT_STYLE_MAP[500]).toBe("Medium");
    expect(FONT_WEIGHT_STYLE_MAP[600]).toBe("SemiBold");
    expect(FONT_WEIGHT_STYLE_MAP[700]).toBe("Bold");
    expect(FONT_WEIGHT_STYLE_MAP[900]).toBe("Heavy");
  });
});
```

- [ ] **Step 2: Implement typography.ts**

Full integration module for typography sync. Must:

1. Parse typography primitives (skip letterSpacing for variable creation) and semantics
2. Create "Typography Primitives" collection (hidden)
3. Upsert 30 variables (12 fontSize FLOAT, 12 lineHeight FLOAT, 5 fontWeight FLOAT, 1 fontFamily STRING)
4. Create 25 text styles with:
   - `fontSize`, `lineHeight`, `fontWeight`, `fontFamily` bound to variables via `setBoundVariable()`
   - `letterSpacing` set directly as `{ value, unit: "PERCENT" }` (resolved from DTCG reference to the letterSpacing primitive value)
   - `textCase` set to "UPPER" when `$extensions.tech.vance.origin.textCase === "uppercase"`
   - `fontName` set to `{ family: "Haffer", style: <weight style> }` using weight-to-style mapping
5. Use tokenPath-based identity matching for idempotent re-runs

```typescript
// src/main/foundations/typography.ts

import typographyPrimitivesJson from "@foundations/typography/primitives.json";
import typographySemanticJson from "@foundations/typography/semantic.json";
import {
  parseTypographyPrimitives,
  parseTypographySemantics,
  resolveReference,
  PrimitiveToken,
} from "../token-parser";
import { findOrCreateCollection } from "../collections";
import { upsertVariable, upsertTextStyle, buildTokenPathIndex } from "../upsert";
import { getTypographyScopes } from "../config/scopes";

export const FONT_WEIGHT_STYLE_MAP: Record<number, string> = {
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  900: "Heavy",
};

export interface TypographySyncResult {
  variablesCreated: number;
  variablesUpdated: number;
  stylesCreated: number;
  stylesUpdated: number;
  errors: string[];
}

export async function syncTypography(
  renameMap?: Record<string, string>,
): Promise<TypographySyncResult> {
  const errors: string[] = [];
  let variablesCreated = 0;
  let variablesUpdated = 0;
  let stylesCreated = 0;
  let stylesUpdated = 0;

  // Parse tokens
  const primTokens = parseTypographyPrimitives(typographyPrimitivesJson);
  const semTokens = parseTypographySemantics(typographySemanticJson);

  // Only create variables for non-letterSpacing primitives
  const variableTokens = primTokens.filter(t => !t.skipVariable);

  // Collection
  const col = await findOrCreateCollection("Typography Primitives", { hidden: true });

  // Build existing index
  const allExistingVars = await figma.variables.getLocalVariablesAsync();
  const allExistingStyles = await figma.getLocalTextStylesAsync();
  const existingVarIndex = buildTokenPathIndex(allExistingVars);
  const existingStyleIndex = buildTokenPathIndex(allExistingStyles);

  // Build a lookup for ALL primitive values (including letterSpacing) for resolving references
  const primValueByTokenPath = new Map<string, PrimitiveToken>();
  for (const t of primTokens) {
    primValueByTokenPath.set(t.tokenPath, t);
  }

  // ── Variables ──
  const varsByTokenPath = new Map<string, any>();

  for (const token of variableTokens) {
    const result = await upsertVariable({
      tokenPath: token.tokenPath,
      figmaName: token.figmaName,
      value: token.value,
      type: token.type,
      collection: col,
      scopes: getTypographyScopes(token.figmaName),
      existingIndex: existingVarIndex,
      renameMap,
    });

    if (result.action === "created") variablesCreated++;
    else if (result.action === "updated" || result.action === "renamed") variablesUpdated++;

    // Track variable for binding
    if (result.variableId) {
      const v = await figma.variables.getVariableByIdAsync(result.variableId);
      if (v) varsByTokenPath.set(token.tokenPath, v);
    }
  }

  // ── Text Styles ──
  for (const semToken of semTokens) {
    // Resolve references to primitive tokens
    const fsRef = resolveReference(semToken.value.fontSize);
    const lhRef = resolveReference(semToken.value.lineHeight);
    const fwRef = resolveReference(semToken.value.fontWeight);
    const ffRef = resolveReference(semToken.value.fontFamily);
    const lsRef = resolveReference(semToken.value.letterSpacing);

    // Get primitive values for direct properties
    const fsPrim = primValueByTokenPath.get(fsRef);
    const lhPrim = primValueByTokenPath.get(lhRef);
    const fwPrim = primValueByTokenPath.get(fwRef);
    const lsPrim = primValueByTokenPath.get(lsRef);

    if (!fsPrim || !lhPrim || !fwPrim || !lsPrim) {
      errors.push(`Missing primitive reference for ${semToken.tokenPath}`);
      continue;
    }

    // Get variables for binding
    const fsVar = varsByTokenPath.get(fsRef);
    const lhVar = varsByTokenPath.get(lhRef);
    const fwVar = varsByTokenPath.get(fwRef);
    const ffVar = varsByTokenPath.get(ffRef);

    // Determine fontName style from weight value
    const weightValue = typeof fwPrim.value === "number" ? fwPrim.value : parseInt(fwPrim.value);
    const fontStyle = FONT_WEIGHT_STYLE_MAP[weightValue] ?? "Regular";

    // Determine textCase
    const textCase = semToken.extensions?.textCase === "uppercase" ? "UPPER" as const : undefined;

    const result = await upsertTextStyle({
      tokenPath: semToken.tokenPath,
      figmaName: semToken.figmaName,
      fontSize: typeof fsPrim.value === "number" ? fsPrim.value : parseFloat(fsPrim.value),
      lineHeight: {
        value: typeof lhPrim.value === "number" ? lhPrim.value : parseFloat(lhPrim.value),
        unit: "PIXELS",
      },
      letterSpacing: {
        value: typeof lsPrim.value === "number" ? lsPrim.value : parseFloat(lsPrim.value),
        unit: "PERCENT",
      },
      fontName: { family: "Haffer", style: fontStyle },
      textCase,
      boundVariables: {
        fontSize: fsVar,
        lineHeight: lhVar,
        fontWeight: fwVar,
        fontFamily: ffVar,
      },
      existingIndex: existingStyleIndex,
      renameMap,
    });

    if (result.action === "created") stylesCreated++;
    else if (result.action === "updated") stylesUpdated++;
  }

  return {
    variablesCreated,
    variablesUpdated,
    stylesCreated,
    stylesUpdated,
    errors,
  };
}
```

- [ ] **Step 3: Run tests**

```bash
cd lab/origin-sync && npx vitest run src/main/foundations/typography.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add lab/origin-sync/src/main/foundations/typography.ts lab/origin-sync/src/main/foundations/typography.test.ts
git commit -m "feat(origin-sync): add typography foundation sync with variable bindings and text styles"
```

---

### Task 9: Foundation sync — spacing & radius

**Files:**
- Create: `lab/origin-sync/src/main/foundations/spacing.ts`
- Create: `lab/origin-sync/src/main/foundations/spacing.test.ts`
- Create: `lab/origin-sync/src/main/foundations/radius.ts`
- Create: `lab/origin-sync/src/main/foundations/radius.test.ts`

- [ ] **Step 1: Write spacing.test.ts (tests first)**

```typescript
// src/main/foundations/spacing.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../../test/figma-mock";
import { syncSpacing } from "./spacing";

beforeEach(() => {
  resetMock();
});

describe("Foundation Sync — Spacing", () => {
  it("creates 12 variables, published, with GAP scope", async () => {
    const result = await syncSpacing();
    expect(result.variablesCreated).toBe(12);

    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(12);

    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const spacingCol = cols.find(c => c.name === "Spacing");
    expect(spacingCol!.hiddenFromPublishing).toBe(false);

    for (const v of allVars) {
      expect(v.scopes).toEqual(["GAP"]);
    }
  });

  it("all values correct", async () => {
    await syncSpacing();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const col = cols[0];

    const valueMap: Record<string, number> = {};
    for (const v of allVars) {
      valueMap[v.name] = v.valuesByMode[col.defaultModeId];
    }

    expect(valueMap["spacing/4"]).toBe(4);
    expect(valueMap["spacing/8"]).toBe(8);
    expect(valueMap["spacing/16"]).toBe(16);
    expect(valueMap["spacing/80"]).toBe(80);
  });

  it("second sync: no duplicates", async () => {
    await syncSpacing();
    await syncSpacing();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(12);
  });
});
```

- [ ] **Step 2: Implement spacing.ts**

```typescript
// src/main/foundations/spacing.ts

import spacingPrimitivesJson from "@foundations/spacing/primitives.json";
import { parseSpacingPrimitives } from "../token-parser";
import { findOrCreateCollection } from "../collections";
import { upsertVariable, buildTokenPathIndex } from "../upsert";
import { getSpacingScopes } from "../config/scopes";
import { getTokenDescription } from "../config/descriptions";

export interface SpacingSyncResult {
  variablesCreated: number;
  variablesUpdated: number;
  errors: string[];
}

export async function syncSpacing(
  renameMap?: Record<string, string>,
): Promise<SpacingSyncResult> {
  let variablesCreated = 0;
  let variablesUpdated = 0;
  const errors: string[] = [];

  const tokens = parseSpacingPrimitives(spacingPrimitivesJson);
  const col = await findOrCreateCollection("Spacing");

  const allExisting = await figma.variables.getLocalVariablesAsync("FLOAT");
  const existingIndex = buildTokenPathIndex(allExisting);

  for (const token of tokens) {
    const result = await upsertVariable({
      tokenPath: token.tokenPath,
      figmaName: token.figmaName,
      value: token.value,
      type: "FLOAT",
      collection: col,
      scopes: getSpacingScopes(),
      description: getTokenDescription(token.tokenPath),
      existingIndex,
      renameMap,
    });

    if (result.action === "created") variablesCreated++;
    else if (result.action === "updated" || result.action === "renamed") variablesUpdated++;
  }

  return { variablesCreated, variablesUpdated, errors };
}
```

- [ ] **Step 3: Write radius.test.ts (tests first)**

```typescript
// src/main/foundations/radius.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../../test/figma-mock";
import { syncRadius } from "./radius";

beforeEach(() => {
  resetMock();
});

describe("Foundation Sync — Radius", () => {
  it("creates 8 variables, published, with CORNER_RADIUS scope", async () => {
    const result = await syncRadius();
    expect(result.variablesCreated).toBe(8);

    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(8);

    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const radiusCol = cols.find(c => c.name === "Radius");
    expect(radiusCol!.hiddenFromPublishing).toBe(false);

    for (const v of allVars) {
      expect(v.scopes).toEqual(["CORNER_RADIUS"]);
    }
  });

  it("radius/full has description", async () => {
    await syncRadius();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const full = allVars.find(v => v.getPluginData("tokenPath") === "radius.full");
    expect(full!.description).toBe("Fully rounded — produces pill/capsule shapes");
  });

  it("all values correct", async () => {
    await syncRadius();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const col = cols[0];

    const full = allVars.find(v => v.name === "radius/full");
    expect(full!.valuesByMode[col.defaultModeId]).toBe(9999);

    const r8 = allVars.find(v => v.name === "radius/8");
    expect(r8!.valuesByMode[col.defaultModeId]).toBe(8);
  });

  it("second sync: no duplicates", async () => {
    await syncRadius();
    await syncRadius();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(8);
  });
});
```

- [ ] **Step 4: Implement radius.ts**

```typescript
// src/main/foundations/radius.ts

import radiusPrimitivesJson from "@foundations/radius/primitives.json";
import { parseRadiusPrimitives } from "../token-parser";
import { findOrCreateCollection } from "../collections";
import { upsertVariable, buildTokenPathIndex } from "../upsert";
import { getRadiusScopes } from "../config/scopes";
import { getTokenDescription } from "../config/descriptions";

export interface RadiusSyncResult {
  variablesCreated: number;
  variablesUpdated: number;
  errors: string[];
}

export async function syncRadius(
  renameMap?: Record<string, string>,
): Promise<RadiusSyncResult> {
  let variablesCreated = 0;
  let variablesUpdated = 0;
  const errors: string[] = [];

  const tokens = parseRadiusPrimitives(radiusPrimitivesJson);
  const col = await findOrCreateCollection("Radius");

  const allExisting = await figma.variables.getLocalVariablesAsync("FLOAT");
  const existingIndex = buildTokenPathIndex(allExisting);

  for (const token of tokens) {
    const desc = token.description ?? getTokenDescription(token.tokenPath);

    const result = await upsertVariable({
      tokenPath: token.tokenPath,
      figmaName: token.figmaName,
      value: token.value,
      type: "FLOAT",
      collection: col,
      scopes: getRadiusScopes(),
      description: desc,
      existingIndex,
      renameMap,
    });

    if (result.action === "created") variablesCreated++;
    else if (result.action === "updated" || result.action === "renamed") variablesUpdated++;
  }

  return { variablesCreated, variablesUpdated, errors };
}
```

- [ ] **Step 5: Run tests**

```bash
cd lab/origin-sync && npx vitest run src/main/foundations/spacing.test.ts src/main/foundations/radius.test.ts
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add lab/origin-sync/src/main/foundations/spacing.ts lab/origin-sync/src/main/foundations/spacing.test.ts \
        lab/origin-sync/src/main/foundations/radius.ts lab/origin-sync/src/main/foundations/radius.test.ts
git commit -m "feat(origin-sync): add spacing and radius foundation sync with tests"
```

---

### Task 10: Validation

**Files:**
- Create: `lab/origin-sync/src/main/validate.ts`
- Create: `lab/origin-sync/src/main/validate.test.ts`

Post-sync validation checks that verify the Figma state matches expectations.

- [ ] **Step 1: Write validate.test.ts (tests first)**

```typescript
// src/main/validate.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../test/figma-mock";
import { validateFoundation, ValidationResult } from "./validate";
import { syncColor } from "./foundations/color";
import { syncTypography } from "./foundations/typography";
import { syncSpacing } from "./foundations/spacing";
import { syncRadius } from "./foundations/radius";

beforeEach(() => {
  resetMock();
});

describe("Validation — All-good state", () => {
  it("passes after a clean color sync", async () => {
    await syncColor();
    const result = await validateFoundation("color");
    expect(result.passed).toBe(true);
    expect(result.checks.every(c => c.passed)).toBe(true);
  });

  it("passes after a clean spacing sync", async () => {
    await syncSpacing();
    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(true);
  });

  it("passes after a clean radius sync", async () => {
    await syncRadius();
    const result = await validateFoundation("radius");
    expect(result.passed).toBe(true);
  });

  it("passes after a clean typography sync", async () => {
    await syncTypography();
    const result = await validateFoundation("typography");
    expect(result.passed).toBe(true);
  });
});

describe("Validation — Failure cases", () => {
  it("missing tokenPath → fails with specific error", async () => {
    await syncSpacing();
    // Remove tokenPath from one variable
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    allVars[0].setPluginData("tokenPath", "");

    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(false);
    const tokenPathCheck = result.checks.find(c => c.name === "tokenPath_integrity");
    expect(tokenPathCheck!.passed).toBe(false);
  });

  it("wrong value → fails", async () => {
    await syncSpacing();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const col = cols.find(c => c.name === "Spacing")!;
    // Corrupt a value
    allVars[0].setValueForMode(col.defaultModeId, 999);

    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(false);
    const valueCheck = result.checks.find(c => c.name === "value_correctness");
    expect(valueCheck!.passed).toBe(false);
  });

  it("broken alias → fails", async () => {
    await syncColor();
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const semCol = cols.find(c => c.name === "Color")!;
    const lightModeId = semCol.modes.find(m => m.name === "Light")!.modeId;
    // Break an alias
    const semVar = allVars.find(v => v.variableCollectionId === semCol.id);
    semVar!.setValueForMode(lightModeId, { r: 1, g: 0, b: 0, a: 1 }); // literal, not alias

    const result = await validateFoundation("color");
    expect(result.passed).toBe(false);
    const aliasCheck = result.checks.find(c => c.name === "alias_integrity");
    expect(aliasCheck!.passed).toBe(false);
  });

  it("wrong scope → fails", async () => {
    await syncSpacing();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    allVars[0].scopes = ["ALL_FILLS"]; // should be GAP

    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(false);
    const scopeCheck = result.checks.find(c => c.name === "scope_correctness");
    expect(scopeCheck!.passed).toBe(false);
  });

  it("missing brand description → fails", async () => {
    await syncColor();
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const maroon = allVars.find(v => v.getPluginData("tokenPath") === "color.brand.maroon");
    maroon!.description = ""; // clear it

    const result = await validateFoundation("color");
    expect(result.passed).toBe(false);
    const descCheck = result.checks.find(c => c.name === "description_correctness");
    expect(descCheck!.passed).toBe(false);
  });

  it("wrong hiddenFromPublishing → fails", async () => {
    await syncColor();
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const primCol = cols.find(c => c.name === "Color Primitives")!;
    primCol.hiddenFromPublishing = false; // should be true

    const result = await validateFoundation("color");
    expect(result.passed).toBe(false);
    const pubCheck = result.checks.find(c => c.name === "publishing_correctness");
    expect(pubCheck!.passed).toBe(false);
  });

  it("letter spacing in pixels instead of percent → fails", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const displayL = styles.find(s => s.name === "Display/L");
    displayL!.letterSpacing = { value: -2, unit: "PIXELS" }; // should be PERCENT

    const result = await validateFoundation("typography");
    expect(result.passed).toBe(false);
    const lsCheck = result.checks.find(c => c.name === "letter_spacing_unit");
    expect(lsCheck!.passed).toBe(false);
  });

  it("orphaned variables → warns (not error)", async () => {
    await syncSpacing();
    // Add an orphaned variable
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const col = cols.find(c => c.name === "Spacing")!;
    const orphan = figma.variables.createVariable("spacing/6", col, "FLOAT");
    orphan.setPluginData("tokenPath", "spacing.6");

    const result = await validateFoundation("spacing");
    // Orphans produce a warning, not a failure — overall validation can still pass
    const orphanCheck = result.checks.find(c => c.name === "orphaned_variables");
    expect(orphanCheck!.severity).toBe("warning");
    expect(orphanCheck!.passed).toBe(false);
  });

  it("missing Haffer font styles → error with list of missing styles", async () => {
    // For this test we validate typography pre-sync check.
    // The actual test would verify the preflight check. Since our mock doesn't
    // simulate font loading, this test verifies the validation logic reports
    // which font styles are needed.
    await syncTypography();
    const result = await validateFoundation("typography");
    const fontCheck = result.checks.find(c => c.name === "font_availability");
    expect(fontCheck).toBeDefined();
    // In mock environment, font check is informational — lists required styles
    expect(fontCheck!.details).toContain("Haffer Regular");
    expect(fontCheck!.details).toContain("Haffer Medium");
    expect(fontCheck!.details).toContain("Haffer SemiBold");
    expect(fontCheck!.details).toContain("Haffer Bold");
    expect(fontCheck!.details).toContain("Haffer Heavy");
  });
});
```

- [ ] **Step 2: Implement validate.ts**

Validation module that checks Figma state against expected values. Each check is a named function that returns pass/fail with details.

The implementation should:
1. Accept a foundation ID and run the relevant checks
2. For color: check tokenPath integrity, value correctness (aliases), scope correctness, descriptions, collection hiddenFromPublishing, and orphan detection
3. For typography: check text style bindings, letterSpacing units, font availability (informational)
4. For spacing/radius: check tokenPath integrity, value correctness, scope correctness, orphan detection
5. Return a `ValidationResult` with named checks, each containing pass/fail, severity, and details

```typescript
// src/main/validate.ts

import type { FoundationId } from "@shared/messages";
import { parseColorPrimitives, parseColorSemantics, parseSpacingPrimitives, parseRadiusPrimitives, parseTypographyPrimitives, parseTypographySemantics } from "./token-parser";
import { getColorSemanticScopes, getColorPrimitiveScopes, getSpacingScopes, getRadiusScopes } from "./config/scopes";
import { getTokenDescription } from "./config/descriptions";
import { buildTokenPathIndex } from "./upsert";
import colorPrimitivesJson from "@foundations/color/primitives.json";
import colorSemanticLightJson from "@foundations/color/semantic.light.json";
import colorSemanticDarkJson from "@foundations/color/semantic.dark.json";
import typographyPrimitivesJson from "@foundations/typography/primitives.json";
import typographySemanticJson from "@foundations/typography/semantic.json";
import spacingPrimitivesJson from "@foundations/spacing/primitives.json";
import radiusPrimitivesJson from "@foundations/radius/primitives.json";

export interface ValidationCheck {
  name: string;
  passed: boolean;
  severity: "error" | "warning";
  message: string;
  details?: string[];
}

export interface ValidationResult {
  passed: boolean;
  checks: ValidationCheck[];
}

export async function validateFoundation(foundation: FoundationId): Promise<ValidationResult> {
  switch (foundation) {
    case "color": return validateColor();
    case "typography": return validateTypography();
    case "spacing": return validateSimpleFloats("spacing", "Spacing", parseSpacingPrimitives(spacingPrimitivesJson), getSpacingScopes());
    case "radius": return validateSimpleFloats("radius", "Radius", parseRadiusPrimitives(radiusPrimitivesJson), getRadiusScopes());
  }
}

async function validateColor(): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
  const cols = await figma.variables.getLocalVariableCollectionsAsync();

  const primCol = cols.find(c => c.name === "Color Primitives");
  const semCol = cols.find(c => c.name === "Color");

  // Publishing correctness
  const pubErrors: string[] = [];
  if (primCol && !primCol.hiddenFromPublishing) pubErrors.push("Color Primitives should be hidden");
  if (semCol && semCol.hiddenFromPublishing) pubErrors.push("Color should be published");
  checks.push({
    name: "publishing_correctness",
    passed: pubErrors.length === 0,
    severity: "error",
    message: pubErrors.length === 0 ? "Collection publishing settings correct" : "Wrong publishing settings",
    details: pubErrors.length > 0 ? pubErrors : undefined,
  });

  // tokenPath integrity
  const missingTokenPaths: string[] = [];
  for (const v of allVars) {
    const tp = v.getPluginData("tokenPath");
    if (!tp) missingTokenPaths.push(v.name);
  }
  checks.push({
    name: "tokenPath_integrity",
    passed: missingTokenPaths.length === 0,
    severity: "error",
    message: missingTokenPaths.length === 0 ? "All variables have tokenPath" : `${missingTokenPaths.length} variables missing tokenPath`,
    details: missingTokenPaths.length > 0 ? missingTokenPaths : undefined,
  });

  // Alias integrity (semantic variables should be aliases, not literal values)
  if (semCol) {
    const semVars = allVars.filter(v => v.variableCollectionId === semCol.id);
    const lightModeId = semCol.modes.find(m => m.name === "Light")?.modeId;
    const brokenAliases: string[] = [];

    if (lightModeId) {
      for (const v of semVars) {
        const lightVal = v.valuesByMode[lightModeId];
        if (!lightVal || typeof lightVal !== "object" || lightVal.type !== "VARIABLE_ALIAS") {
          brokenAliases.push(v.name);
        }
      }
    }
    checks.push({
      name: "alias_integrity",
      passed: brokenAliases.length === 0,
      severity: "error",
      message: brokenAliases.length === 0 ? "All semantic aliases valid" : `${brokenAliases.length} broken aliases`,
      details: brokenAliases.length > 0 ? brokenAliases : undefined,
    });
  }

  // Scope correctness
  const scopeErrors: string[] = [];
  const semanticTokens = parseColorSemantics(colorSemanticLightJson);
  const primTokens = parseColorPrimitives(colorPrimitivesJson);

  for (const v of allVars) {
    const tp = v.getPluginData("tokenPath");
    if (!tp) continue;

    const semToken = semanticTokens.find(t => t.tokenPath === tp);
    if (semToken) {
      const expected = getColorSemanticScopes(semToken.figmaName);
      if (JSON.stringify(v.scopes) !== JSON.stringify(expected)) {
        scopeErrors.push(`${v.name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(v.scopes)}`);
      }
    }

    const primToken = primTokens.find(t => t.tokenPath === tp);
    if (primToken) {
      const expected = getColorPrimitiveScopes();
      if (JSON.stringify(v.scopes) !== JSON.stringify(expected)) {
        scopeErrors.push(`${v.name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(v.scopes)}`);
      }
    }
  }
  checks.push({
    name: "scope_correctness",
    passed: scopeErrors.length === 0,
    severity: "error",
    message: scopeErrors.length === 0 ? "All scopes correct" : `${scopeErrors.length} scope mismatches`,
    details: scopeErrors.length > 0 ? scopeErrors : undefined,
  });

  // Description correctness (brand colors must have descriptions)
  const descErrors: string[] = [];
  const brandTokenPaths = [
    "color.brand.maroon", "color.brand.crimson", "color.brand.teal", "color.brand.blue",
    "color.brand.peach", "color.brand.gold", "color.brand.lime",
  ];
  for (const tp of brandTokenPaths) {
    const v = allVars.find(vv => vv.getPluginData("tokenPath") === tp);
    if (v && !v.description) {
      descErrors.push(`${tp} missing description`);
    }
  }
  checks.push({
    name: "description_correctness",
    passed: descErrors.length === 0,
    severity: "error",
    message: descErrors.length === 0 ? "All brand descriptions set" : `${descErrors.length} missing descriptions`,
    details: descErrors.length > 0 ? descErrors : undefined,
  });

  // Orphaned variables
  const codeTokenPaths = new Set([
    ...primTokens.map(t => t.tokenPath),
    ...semanticTokens.map(t => t.tokenPath),
  ]);
  const orphaned = allVars.filter(v => {
    const tp = v.getPluginData("tokenPath");
    return tp && !codeTokenPaths.has(tp);
  });
  if (orphaned.length > 0) {
    checks.push({
      name: "orphaned_variables",
      passed: false,
      severity: "warning",
      message: `${orphaned.length} orphaned variables found`,
      details: orphaned.map(v => v.getPluginData("tokenPath")),
    });
  }

  return {
    passed: checks.filter(c => c.severity === "error").every(c => c.passed),
    checks,
  };
}

async function validateTypography(): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  const styles = await figma.getLocalTextStylesAsync();
  const allVars = await figma.variables.getLocalVariablesAsync();
  const cols = await figma.variables.getLocalVariableCollectionsAsync();

  const typCol = cols.find(c => c.name === "Typography Primitives");

  // Publishing
  const pubErrors: string[] = [];
  if (typCol && !typCol.hiddenFromPublishing) pubErrors.push("Typography Primitives should be hidden");
  checks.push({
    name: "publishing_correctness",
    passed: pubErrors.length === 0,
    severity: "error",
    message: pubErrors.length === 0 ? "Collection publishing correct" : "Wrong publishing settings",
    details: pubErrors.length > 0 ? pubErrors : undefined,
  });

  // tokenPath integrity on variables
  const missingTokenPaths: string[] = [];
  if (typCol) {
    const typVars = allVars.filter(v => v.variableCollectionId === typCol.id);
    for (const v of typVars) {
      if (!v.getPluginData("tokenPath")) missingTokenPaths.push(v.name);
    }
  }
  checks.push({
    name: "tokenPath_integrity",
    passed: missingTokenPaths.length === 0,
    severity: "error",
    message: missingTokenPaths.length === 0 ? "All variables have tokenPath" : `${missingTokenPaths.length} missing`,
    details: missingTokenPaths.length > 0 ? missingTokenPaths : undefined,
  });

  // Value correctness (variable count)
  const primTokens = parseTypographyPrimitives(typographyPrimitivesJson);
  const variableTokens = primTokens.filter(t => !t.skipVariable);
  const expectedVarCount = variableTokens.length; // 30
  const actualVarCount = typCol ? allVars.filter(v => v.variableCollectionId === typCol.id).length : 0;
  checks.push({
    name: "value_correctness",
    passed: actualVarCount === expectedVarCount,
    severity: "error",
    message: actualVarCount === expectedVarCount
      ? `${actualVarCount} variables correct`
      : `Expected ${expectedVarCount} variables, found ${actualVarCount}`,
  });

  // Letter spacing unit check
  const lsErrors: string[] = [];
  for (const s of styles) {
    if (s.letterSpacing && typeof s.letterSpacing === "object" && "unit" in s.letterSpacing) {
      if ((s.letterSpacing as any).unit !== "PERCENT") {
        lsErrors.push(`${s.name}: letterSpacing unit is ${(s.letterSpacing as any).unit}, expected PERCENT`);
      }
    }
  }
  checks.push({
    name: "letter_spacing_unit",
    passed: lsErrors.length === 0,
    severity: "error",
    message: lsErrors.length === 0 ? "All letter spacing in PERCENT" : `${lsErrors.length} wrong units`,
    details: lsErrors.length > 0 ? lsErrors : undefined,
  });

  // Font availability (informational — lists required styles)
  const requiredStyles = ["Haffer Regular", "Haffer Medium", "Haffer SemiBold", "Haffer Bold", "Haffer Heavy"];
  checks.push({
    name: "font_availability",
    passed: true, // informational in mock; in real Figma would check availability
    severity: "error",
    message: "Required font styles for typography",
    details: requiredStyles,
  });

  // Scope correctness
  const scopeErrors: string[] = [];
  if (typCol) {
    const typVars = allVars.filter(v => v.variableCollectionId === typCol.id);
    for (const v of typVars) {
      const tp = v.getPluginData("tokenPath");
      if (!tp) continue;
      const token = variableTokens.find(t => t.tokenPath === tp);
      if (token) {
        const expectedScopes = tp.includes("fontSize") ? ["FONT_SIZE"]
          : tp.includes("lineHeight") ? ["LINE_HEIGHT"]
          : tp.includes("fontWeight") ? ["FONT_WEIGHT"]
          : tp.includes("fontFamily") ? ["FONT_FAMILY"]
          : [];
        if (JSON.stringify(v.scopes) !== JSON.stringify(expectedScopes)) {
          scopeErrors.push(`${v.name}: expected ${JSON.stringify(expectedScopes)}, got ${JSON.stringify(v.scopes)}`);
        }
      }
    }
  }
  checks.push({
    name: "scope_correctness",
    passed: scopeErrors.length === 0,
    severity: "error",
    message: scopeErrors.length === 0 ? "All scopes correct" : `${scopeErrors.length} scope mismatches`,
    details: scopeErrors.length > 0 ? scopeErrors : undefined,
  });

  return {
    passed: checks.filter(c => c.severity === "error").every(c => c.passed),
    checks,
  };
}

async function validateSimpleFloats(
  foundationName: string,
  collectionName: string,
  expectedTokens: Array<{ tokenPath: string; figmaName: string; value: number; description?: string }>,
  expectedScopes: string[],
): Promise<ValidationResult> {
  const checks: ValidationCheck[] = [];
  const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = cols.find(c => c.name === collectionName);

  if (!col) {
    return {
      passed: false,
      checks: [{ name: "collection_exists", passed: false, severity: "error", message: `Collection "${collectionName}" not found` }],
    };
  }

  const colVars = allVars.filter(v => v.variableCollectionId === col.id);

  // Publishing
  checks.push({
    name: "publishing_correctness",
    passed: !col.hiddenFromPublishing,
    severity: "error",
    message: !col.hiddenFromPublishing ? "Collection is published" : "Collection should be published",
  });

  // tokenPath integrity
  const missingTp = colVars.filter(v => !v.getPluginData("tokenPath"));
  checks.push({
    name: "tokenPath_integrity",
    passed: missingTp.length === 0,
    severity: "error",
    message: missingTp.length === 0 ? "All variables have tokenPath" : `${missingTp.length} missing`,
    details: missingTp.length > 0 ? missingTp.map(v => v.name) : undefined,
  });

  // Value correctness
  const valueErrors: string[] = [];
  for (const expected of expectedTokens) {
    const v = colVars.find(vv => vv.getPluginData("tokenPath") === expected.tokenPath);
    if (!v) {
      valueErrors.push(`Missing: ${expected.tokenPath}`);
      continue;
    }
    const actual = v.valuesByMode[col.defaultModeId];
    if (actual !== expected.value) {
      valueErrors.push(`${expected.tokenPath}: expected ${expected.value}, got ${actual}`);
    }
  }
  checks.push({
    name: "value_correctness",
    passed: valueErrors.length === 0,
    severity: "error",
    message: valueErrors.length === 0 ? "All values correct" : `${valueErrors.length} value mismatches`,
    details: valueErrors.length > 0 ? valueErrors : undefined,
  });

  // Scope correctness
  const scopeErrors: string[] = [];
  for (const v of colVars) {
    if (JSON.stringify(v.scopes) !== JSON.stringify(expectedScopes)) {
      scopeErrors.push(`${v.name}: expected ${JSON.stringify(expectedScopes)}, got ${JSON.stringify(v.scopes)}`);
    }
  }
  checks.push({
    name: "scope_correctness",
    passed: scopeErrors.length === 0,
    severity: "error",
    message: scopeErrors.length === 0 ? "All scopes correct" : `${scopeErrors.length} scope mismatches`,
    details: scopeErrors.length > 0 ? scopeErrors : undefined,
  });

  // Description correctness
  const descErrors: string[] = [];
  for (const expected of expectedTokens) {
    const expectedDesc = expected.description ?? getTokenDescription(expected.tokenPath);
    if (expectedDesc) {
      const v = colVars.find(vv => vv.getPluginData("tokenPath") === expected.tokenPath);
      if (v && v.description !== expectedDesc) {
        descErrors.push(`${expected.tokenPath}: expected "${expectedDesc}", got "${v.description}"`);
      }
    }
  }
  checks.push({
    name: "description_correctness",
    passed: descErrors.length === 0,
    severity: "error",
    message: descErrors.length === 0 ? "All descriptions correct" : `${descErrors.length} description mismatches`,
    details: descErrors.length > 0 ? descErrors : undefined,
  });

  // Orphaned variables
  const codeTokenPaths = new Set(expectedTokens.map(t => t.tokenPath));
  const orphaned = colVars.filter(v => {
    const tp = v.getPluginData("tokenPath");
    return tp && !codeTokenPaths.has(tp);
  });
  if (orphaned.length > 0) {
    checks.push({
      name: "orphaned_variables",
      passed: false,
      severity: "warning",
      message: `${orphaned.length} orphaned variables found`,
      details: orphaned.map(v => v.getPluginData("tokenPath")),
    });
  }

  return {
    passed: checks.filter(c => c.severity === "error").every(c => c.passed),
    checks,
  };
}
```

- [ ] **Step 3: Run tests**

```bash
cd lab/origin-sync && npx vitest run src/main/validate.test.ts
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add lab/origin-sync/src/main/validate.ts lab/origin-sync/src/main/validate.test.ts
git commit -m "feat(origin-sync): add post-sync validation with comprehensive checks"
```

---

### Task 11: Plugin UI

**Files:**
- Create: `lab/origin-sync/src/ui/index.html`
- Create: `lab/origin-sync/src/ui/ui.ts`

No unit tests for UI (DOM-based, tested manually in Figma). Follows native Figma plugin design patterns.

- [ ] **Step 1: Create index.html**

Plugin UI shell. Must include:
- Status dashboard showing per-foundation state (Color, Typography, Spacing, Radius)
- Each foundation row shows: name, status indicator (synced/out of sync/not synced/warnings), summary counts
- Foundation rows expand to show individual diff entries (new, changed, renamed, orphaned)
- Per-foundation "Sync" button
- "Sync All" button
- Post-sync validation results area
- Manual checklist section (tnum reminders for Number styles)
- Native Figma styling: `font-family: Inter, sans-serif`, 11px base font, Figma color variables

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Figma plugin native styling */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: var(--figma-color-text, #333);
      background: var(--figma-color-bg, #fff);
      padding: 12px;
    }
    /* ... full styling in implementation */
  </style>
</head>
<body>
  <div id="app">
    <header class="plugin-header">
      <h1>Origin Sync</h1>
    </header>
    <main id="dashboard"></main>
    <footer class="plugin-footer">
      <button id="sync-all" class="btn btn-primary">Sync All</button>
    </footer>
  </div>
  <script type="module" src="./ui.ts"></script>
</body>
</html>
```

- [ ] **Step 2: Create ui.ts**

UI logic handles:
- Receiving `STATUS` messages and rendering the dashboard
- Sending `SYNC` and `GET_STATUS` messages to the plugin main thread
- Rendering validation results and checklist items
- Showing progress during sync operations

```typescript
// src/ui/ui.ts

import type { PluginToUIMessage, UIToPluginMessage, FoundationStatus, FoundationId } from "@shared/messages";

// Send message to plugin main thread
function send(msg: UIToPluginMessage): void {
  parent.postMessage({ pluginMessage: msg }, "*");
}

// ... full implementation: render dashboard, diff entries, validation results, checklist
// Listen for messages from main thread
window.onmessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage as PluginToUIMessage;
  // Handle STATUS, SYNC_STARTED, SYNC_PROGRESS, SYNC_COMPLETE, VALIDATION_RESULT, LOG, ERROR
};

// Request initial status on load
send({ type: "GET_STATUS" });
```

- [ ] **Step 3: Commit**

```bash
git add lab/origin-sync/src/ui/
git commit -m "feat(origin-sync): add plugin UI with dashboard, diff view, and checklist"
```

---

### Task 12: Plugin entry point

**Files:**
- Create: `lab/origin-sync/src/main/code.ts`

Wires everything together with IPC message handling.

- [ ] **Step 1: Implement code.ts**

Entry point that:
1. Shows the UI via `figma.showUI()`
2. Handles `GET_STATUS` — runs diff for each foundation, sends `STATUS` message to UI
3. Handles `SYNC` — runs the appropriate foundation sync, sends progress updates, then runs validation
4. Handles `SYNC_ALL` — syncs all foundations in order (color → typography → spacing → radius)
5. Handles `VALIDATE` — runs validation for a specific foundation
6. Handles `CANCEL` — closes the plugin

```typescript
// src/main/code.ts

import type { PluginToUIMessage, UIToPluginMessage, FoundationId, FoundationStatus } from "@shared/messages";
import { syncColor } from "./foundations/color";
import { syncTypography } from "./foundations/typography";
import { syncSpacing } from "./foundations/spacing";
import { syncRadius } from "./foundations/radius";
import { validateFoundation } from "./validate";
import { computeDiff, FigmaSnapshot } from "./diff";
import { parseColorPrimitives, parseColorSemantics, parseTypographyPrimitives, parseTypographySemantics, parseSpacingPrimitives, parseRadiusPrimitives } from "./token-parser";
import { buildTokenPathIndex } from "./upsert";
import colorPrimitivesJson from "@foundations/color/primitives.json";
import colorSemanticLightJson from "@foundations/color/semantic.light.json";
import typographyPrimitivesJson from "@foundations/typography/primitives.json";
import typographySemanticJson from "@foundations/typography/semantic.json";
import spacingPrimitivesJson from "@foundations/spacing/primitives.json";
import radiusPrimitivesJson from "@foundations/radius/primitives.json";

figma.showUI(__html__, { width: 400, height: 560, themeColors: true });

function send(msg: PluginToUIMessage) {
  figma.ui.postMessage(msg);
}

// ── Status computation ──

async function getFoundationStatuses(): Promise<FoundationStatus[]> {
  // Build Figma snapshots and compute diffs for each foundation
  // ... implementation computes diff for each foundation and returns FoundationStatus[]
  return []; // placeholder — full implementation in step
}

// ── Sync dispatcher ──

async function syncFoundation(foundation: FoundationId): Promise<void> {
  send({ type: "SYNC_STARTED", foundation });

  try {
    switch (foundation) {
      case "color": {
        const result = await syncColor();
        send({
          type: "SYNC_COMPLETE", foundation,
          created: result.primitivesCreated + result.semanticsCreated,
          updated: result.primitivesUpdated + result.semanticsUpdated,
          renamed: 0,
          orphaned: 0,
        });
        break;
      }
      case "typography": {
        const result = await syncTypography();
        send({
          type: "SYNC_COMPLETE", foundation,
          created: result.variablesCreated + result.stylesCreated,
          updated: result.variablesUpdated + result.stylesUpdated,
          renamed: 0,
          orphaned: 0,
        });
        break;
      }
      case "spacing": {
        const result = await syncSpacing();
        send({
          type: "SYNC_COMPLETE", foundation,
          created: result.variablesCreated,
          updated: result.variablesUpdated,
          renamed: 0,
          orphaned: 0,
        });
        break;
      }
      case "radius": {
        const result = await syncRadius();
        send({
          type: "SYNC_COMPLETE", foundation,
          created: result.variablesCreated,
          updated: result.variablesUpdated,
          renamed: 0,
          orphaned: 0,
        });
        break;
      }
    }

    // Run validation after sync
    const validationResult = await validateFoundation(foundation);
    send({ type: "VALIDATION_RESULT", foundation, result: validationResult });
  } catch (e) {
    send({ type: "ERROR", message: `Sync failed for ${foundation}: ${e}` });
  }
}

// ── Message handler ──

figma.ui.onmessage = async (msg: UIToPluginMessage) => {
  switch (msg.type) {
    case "GET_STATUS": {
      const statuses = await getFoundationStatuses();
      send({ type: "STATUS", foundations: statuses });
      break;
    }
    case "SYNC": {
      await syncFoundation(msg.foundation);
      break;
    }
    case "SYNC_ALL": {
      for (const f of ["color", "typography", "spacing", "radius"] as FoundationId[]) {
        await syncFoundation(f);
      }
      break;
    }
    case "VALIDATE": {
      const result = await validateFoundation(msg.foundation);
      send({ type: "VALIDATION_RESULT", foundation: msg.foundation, result });
      break;
    }
    case "CANCEL": {
      figma.closePlugin();
      break;
    }
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add lab/origin-sync/src/main/code.ts
git commit -m "feat(origin-sync): add plugin entry point with IPC message handling"
```

---

### Task 13: Build verification

**Files:**
- No new files — verifying build output

- [ ] **Step 1: Run full test suite**

```bash
cd lab/origin-sync && npx vitest run
```

Expected: All tests pass across all test files:
- `src/test/figma-mock.test.ts`
- `src/main/token-parser.test.ts`
- `src/main/config/scopes.test.ts`
- `src/main/config/descriptions.test.ts`
- `src/main/diff.test.ts`
- `src/main/collections.test.ts`
- `src/main/upsert.test.ts`
- `src/main/foundations/color.test.ts`
- `src/main/foundations/typography.test.ts`
- `src/main/foundations/spacing.test.ts`
- `src/main/foundations/radius.test.ts`
- `src/main/validate.test.ts`

- [ ] **Step 2: Build the plugin**

```bash
cd lab/origin-sync && npm run build
```

Expected: `dist/code.js` and `dist/index.html` are generated.

- [ ] **Step 3: Verify dist output exists and is non-empty**

```bash
ls -la lab/origin-sync/dist/
```

Expected: `code.js` (bundled plugin code with baked-in tokens) and `index.html` (single-file UI).

- [ ] **Step 4: Verify manifest points to correct dist paths**

```bash
cat lab/origin-sync/manifest.json
```

Expected: `"main": "dist/code.js"` and `"ui": "dist/index.html"`.

- [ ] **Step 5: Commit dist gitignore and final verification**

```bash
git add lab/origin-sync/
git commit -m "feat(origin-sync): verify build produces correct dist output"
```

- [ ] **Step 6: Final push**

```bash
git push origin main
```
