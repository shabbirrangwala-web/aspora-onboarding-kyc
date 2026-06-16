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

  // Font loading stub (no-op in mock, required by real Figma API)
  async loadFontAsync(_fontName: { family: string; style: string }): Promise<void> {},

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
