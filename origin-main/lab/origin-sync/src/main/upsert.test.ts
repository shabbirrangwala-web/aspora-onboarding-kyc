import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../test/figma-mock";
import { findOrCreateCollection, ensureModes } from "./collections";
import {
  hexToRgba,
  buildTokenPathIndex,
  upsertVariable,
  upsertTextStyle,
  type UpsertResult,
} from "./upsert";

beforeEach(() => {
  resetMock();
});

// ---------------------------------------------------------------------------
// hexToRgba
// ---------------------------------------------------------------------------

describe("hexToRgba", () => {
  it("converts 6-digit hex to RGBA", () => {
    const result = hexToRgba("#ff0000");
    expect(result.r).toBeCloseTo(1, 5);
    expect(result.g).toBeCloseTo(0, 5);
    expect(result.b).toBeCloseTo(0, 5);
    expect(result.a).toBe(1);
  });

  it("converts 8-digit hex with alpha", () => {
    const result = hexToRgba("#00000080");
    expect(result.r).toBeCloseTo(0, 5);
    expect(result.g).toBeCloseTo(0, 5);
    expect(result.b).toBeCloseTo(0, 5);
    expect(result.a).toBeCloseTo(128 / 255, 3);
  });
});

// ---------------------------------------------------------------------------
// buildTokenPathIndex
// ---------------------------------------------------------------------------

describe("buildTokenPathIndex", () => {
  it("builds index from artifacts with tokenPath pluginData", async () => {
    const col = await findOrCreateCollection("Test");
    const v1 = figma.variables.createVariable("spacing/4", col, "FLOAT");
    v1.setPluginData("tokenPath", "spacing.4");
    const v2 = figma.variables.createVariable("spacing/8", col, "FLOAT");
    v2.setPluginData("tokenPath", "spacing.8");

    const index = buildTokenPathIndex([v1, v2]);
    expect(index.size).toBe(2);
    expect(index.get("spacing.4")).toBe(v1);
    expect(index.get("spacing.8")).toBe(v2);
  });

  it("skips artifacts without tokenPath pluginData", async () => {
    const col = await findOrCreateCollection("Test");
    const v1 = figma.variables.createVariable("spacing/4", col, "FLOAT");
    // No pluginData set
    const v2 = figma.variables.createVariable("spacing/8", col, "FLOAT");
    v2.setPluginData("tokenPath", "spacing.8");

    const index = buildTokenPathIndex([v1, v2]);
    expect(index.size).toBe(1);
    expect(index.has("spacing.4")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// upsertVariable — FLOAT
// ---------------------------------------------------------------------------

describe("upsertVariable (FLOAT)", () => {
  it("creates a new variable", async () => {
    const col = await findOrCreateCollection("Spacing");
    const index = new Map();

    const result = upsertVariable({
      tokenPath: "spacing.4",
      figmaName: "4",
      value: 4,
      resolveType: "FLOAT",
      collection: col,
      scopes: ["GAP"],
      existingIndex: index,
    });

    expect(result.status).toBe("created");
    expect(result.name).toBe("4");
    const vars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(vars).toHaveLength(1);
    expect(vars[0].valuesByMode[col.defaultModeId]).toBe(4);
    expect(vars[0].getPluginData("tokenPath")).toBe("spacing.4");
    expect(vars[0].scopes).toEqual(["GAP"]);
  });

  it("updates value of existing variable", async () => {
    const col = await findOrCreateCollection("Spacing");
    const v = figma.variables.createVariable("4", col, "FLOAT");
    v.setPluginData("tokenPath", "spacing.4");
    v.setValueForMode(col.defaultModeId, 4);
    const index = buildTokenPathIndex([v]);

    const result = upsertVariable({
      tokenPath: "spacing.4",
      figmaName: "4",
      value: 8,
      resolveType: "FLOAT",
      collection: col,
      existingIndex: index,
    });

    expect(result.status).toBe("updated");
    expect(v.valuesByMode[col.defaultModeId]).toBe(8);
  });

  it("updates name of existing variable", async () => {
    const col = await findOrCreateCollection("Spacing");
    const v = figma.variables.createVariable("old-name", col, "FLOAT");
    v.setPluginData("tokenPath", "spacing.4");
    v.setValueForMode(col.defaultModeId, 4);
    const index = buildTokenPathIndex([v]);

    const result = upsertVariable({
      tokenPath: "spacing.4",
      figmaName: "4",
      value: 4,
      resolveType: "FLOAT",
      collection: col,
      existingIndex: index,
    });

    expect(result.status).toBe("updated");
    expect(v.name).toBe("4");
  });

  it("renames via reverse rename map", async () => {
    const col = await findOrCreateCollection("Spacing");
    const v = figma.variables.createVariable("old/name", col, "FLOAT");
    v.setPluginData("tokenPath", "spacing.old");
    v.setValueForMode(col.defaultModeId, 4);
    const index = buildTokenPathIndex([v]);

    const result = upsertVariable({
      tokenPath: "spacing.new",
      figmaName: "new",
      value: 4,
      resolveType: "FLOAT",
      collection: col,
      existingIndex: index,
      reverseRenames: { "spacing.new": "spacing.old" },
    });

    expect(result.status).toBe("renamed");
    expect(v.name).toBe("new");
    expect(v.getPluginData("tokenPath")).toBe("spacing.new");
    expect(index.has("spacing.old")).toBe(false);
    expect(index.get("spacing.new")).toBe(v);
  });

  it("sets description on variable", async () => {
    const col = await findOrCreateCollection("Radius");
    const index = new Map();

    upsertVariable({
      tokenPath: "radius.full",
      figmaName: "full",
      value: 9999,
      resolveType: "FLOAT",
      collection: col,
      description: "Fully rounded",
      existingIndex: index,
    });

    const vars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(vars[0].description).toBe("Fully rounded");
  });

  it("sets scopes on variable", async () => {
    const col = await findOrCreateCollection("Radius");
    const index = new Map();

    upsertVariable({
      tokenPath: "radius.4",
      figmaName: "4",
      value: 4,
      resolveType: "FLOAT",
      collection: col,
      scopes: ["CORNER_RADIUS"],
      existingIndex: index,
    });

    const vars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(vars[0].scopes).toEqual(["CORNER_RADIUS"]);
  });

  it("returns unchanged when nothing differs", async () => {
    const col = await findOrCreateCollection("Spacing");
    const v = figma.variables.createVariable("4", col, "FLOAT");
    v.setPluginData("tokenPath", "spacing.4");
    v.setValueForMode(col.defaultModeId, 4);
    v.scopes = ["GAP"];
    v.description = "4px spacing";
    const index = buildTokenPathIndex([v]);

    const result = upsertVariable({
      tokenPath: "spacing.4",
      figmaName: "4",
      value: 4,
      resolveType: "FLOAT",
      collection: col,
      scopes: ["GAP"],
      description: "4px spacing",
      existingIndex: index,
    });

    expect(result.status).toBe("unchanged");
  });
});

// ---------------------------------------------------------------------------
// upsertVariable — COLOR
// ---------------------------------------------------------------------------

describe("upsertVariable (COLOR)", () => {
  it("converts hex string to RGBA when creating", async () => {
    const col = await findOrCreateCollection("Color primitives");
    const index = new Map();

    upsertVariable({
      tokenPath: "color.maroon.500",
      figmaName: "maroon/500",
      value: "#ff0000",
      resolveType: "COLOR",
      collection: col,
      existingIndex: index,
    });

    const vars = await figma.variables.getLocalVariablesAsync("COLOR");
    const colorVal = vars[0].valuesByMode[col.defaultModeId];
    expect(colorVal.r).toBeCloseTo(1, 5);
    expect(colorVal.g).toBeCloseTo(0, 5);
    expect(colorVal.b).toBeCloseTo(0, 5);
    expect(colorVal.a).toBe(1);
  });

  it("handles alias value (non-hex) without conversion", async () => {
    const col = await findOrCreateCollection("Semantic Colors");
    const index = new Map();
    const aliasValue = { type: "VARIABLE_ALIAS", id: "var_1" };

    upsertVariable({
      tokenPath: "color.surface.base",
      figmaName: "surface/base",
      value: aliasValue,
      resolveType: "COLOR",
      collection: col,
      existingIndex: index,
    });

    const vars = await figma.variables.getLocalVariablesAsync("COLOR");
    expect(vars[0].valuesByMode[col.defaultModeId]).toEqual(aliasValue);
  });
});

// ---------------------------------------------------------------------------
// upsertVariable — STRING
// ---------------------------------------------------------------------------

describe("upsertVariable (STRING)", () => {
  it("creates a STRING variable", async () => {
    const col = await findOrCreateCollection("Typography");
    const index = new Map();

    const result = upsertVariable({
      tokenPath: "typography.fontFamily.primary",
      figmaName: "fontFamily/primary",
      value: "Haffer",
      resolveType: "STRING",
      collection: col,
      existingIndex: index,
    });

    expect(result.status).toBe("created");
    const vars = await figma.variables.getLocalVariablesAsync("STRING");
    expect(vars[0].valuesByMode[col.defaultModeId]).toBe("Haffer");
  });
});

// ---------------------------------------------------------------------------
// Variable alias cross-collection
// ---------------------------------------------------------------------------

describe("variable alias cross-collection", () => {
  it("sets alias value referencing another variable", async () => {
    const primCol = await findOrCreateCollection("Color primitives");
    const semCol = await findOrCreateCollection("Semantic Colors");
    const primIndex = new Map();
    const semIndex = new Map();

    // Create primitive
    const primResult = upsertVariable({
      tokenPath: "color.neutral.50",
      figmaName: "neutral/50",
      value: "#ffffff",
      resolveType: "COLOR",
      collection: primCol,
      existingIndex: primIndex,
    });

    // Create semantic alias pointing to primitive
    const alias = figma.variables.createVariableAlias(primIndex.get("color.neutral.50"));
    const semResult = upsertVariable({
      tokenPath: "color.surface.base",
      figmaName: "surface/base",
      value: alias,
      resolveType: "COLOR",
      collection: semCol,
      existingIndex: semIndex,
    });

    expect(semResult.status).toBe("created");
    const semVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const semVar = semVars.find((v: any) => v.name === "surface/base");
    expect(semVar!.valuesByMode[semCol.defaultModeId]).toEqual(alias);
  });
});

// ---------------------------------------------------------------------------
// Collection modes
// ---------------------------------------------------------------------------

describe("collection modes", () => {
  it("sets values per mode using modeId", async () => {
    const col = await findOrCreateCollection("Semantic Colors");
    const { lightModeId, darkModeId } = await ensureModes(col, "Light", "Dark");
    const index = new Map();

    // Create with light mode value
    upsertVariable({
      tokenPath: "color.surface.base",
      figmaName: "surface/base",
      value: "#ffffff",
      resolveType: "COLOR",
      collection: col,
      modeId: lightModeId,
      existingIndex: index,
    });

    // Set dark mode value on same variable
    upsertVariable({
      tokenPath: "color.surface.base",
      figmaName: "surface/base",
      value: "#000000",
      resolveType: "COLOR",
      collection: col,
      modeId: darkModeId,
      existingIndex: index,
    });

    const vars = await figma.variables.getLocalVariablesAsync("COLOR");
    const surfaceBase = vars.find((v: any) => v.name === "surface/base");
    const lightVal = surfaceBase!.valuesByMode[lightModeId];
    const darkVal = surfaceBase!.valuesByMode[darkModeId];
    expect(lightVal.r).toBeCloseTo(1, 5);
    expect(darkVal.r).toBeCloseTo(0, 5);
  });
});

// ---------------------------------------------------------------------------
// upsertTextStyle
// ---------------------------------------------------------------------------

describe("upsertTextStyle", () => {
  it("creates a new text style with folder name", async () => {
    const index = new Map();

    const result = await upsertTextStyle({
      tokenPath: "typography.body.m",
      figmaName: "Body/Medium",
      fontSize: 16,
      lineHeight: { value: 24, unit: "PIXELS" },
      letterSpacing: { value: 0, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Regular" },
      existingIndex: index,
    });

    expect(result.status).toBe("created");
    expect(result.name).toBe("Body/Medium");
    const styles = figma.getLocalTextStyles();
    expect(styles).toHaveLength(1);
    expect(styles[0].name).toBe("Body/Medium");
    expect(styles[0].fontSize).toBe(16);
    expect(styles[0].lineHeight).toEqual({ value: 24, unit: "PIXELS" });
  });

  it("sets letterSpacing with PERCENT unit", async () => {
    const index = new Map();

    await upsertTextStyle({
      tokenPath: "typography.display.l",
      figmaName: "Display/Large",
      fontSize: 48,
      lineHeight: { value: 52, unit: "PIXELS" },
      letterSpacing: { value: -2, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Bold" },
      existingIndex: index,
    });

    const styles = figma.getLocalTextStyles();
    expect(styles[0].letterSpacing).toEqual({ value: -2, unit: "PERCENT" });
  });

  it("sets textCase", async () => {
    const index = new Map();

    await upsertTextStyle({
      tokenPath: "typography.display.s",
      figmaName: "Display/Small",
      fontSize: 14,
      lineHeight: { value: 20, unit: "PIXELS" },
      letterSpacing: { value: 2, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Bold" },
      textCase: "UPPER",
      existingIndex: index,
    });

    const styles = figma.getLocalTextStyles();
    expect(styles[0].textCase).toBe("UPPER");
  });

  it("sets fontName", async () => {
    const index = new Map();

    await upsertTextStyle({
      tokenPath: "typography.body.m",
      figmaName: "Body/Medium",
      fontSize: 16,
      lineHeight: { value: 24, unit: "PIXELS" },
      letterSpacing: { value: 0, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "SemiBold" },
      existingIndex: index,
    });

    const styles = figma.getLocalTextStyles();
    expect(styles[0].fontName).toEqual({ family: "Haffer", style: "SemiBold" });
  });

  it("binds variables via setBoundVariable", async () => {
    const col = await findOrCreateCollection("Typography");
    const fsVar = figma.variables.createVariable("fontSize/400", col, "FLOAT");
    fsVar.setPluginData("tokenPath", "typography.fontSize.400");
    const lhVar = figma.variables.createVariable("lineHeight/400", col, "FLOAT");
    lhVar.setPluginData("tokenPath", "typography.lineHeight.400");

    const index = new Map();

    await upsertTextStyle({
      tokenPath: "typography.body.m",
      figmaName: "Body/Medium",
      fontSize: 16,
      lineHeight: { value: 24, unit: "PIXELS" },
      letterSpacing: { value: 0, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Regular" },
      boundVariables: {
        fontSize: fsVar,
        lineHeight: lhVar,
      },
      existingIndex: index,
    });

    const styles = figma.getLocalTextStyles();
    const bound = styles[0].getBoundVariables();
    expect(bound.fontSize).toEqual({ type: "VARIABLE_ALIAS", id: fsVar.id });
    expect(bound.lineHeight).toEqual({ type: "VARIABLE_ALIAS", id: lhVar.id });
  });

  it("updates existing text style", async () => {
    const style = figma.createTextStyle();
    style.setPluginData("tokenPath", "typography.body.m");
    style.name = "Body/Medium";
    style.fontSize = 14;
    const index = buildTokenPathIndex([style]);

    const result = await upsertTextStyle({
      tokenPath: "typography.body.m",
      figmaName: "Body/Medium",
      fontSize: 16,
      lineHeight: { value: 24, unit: "PIXELS" },
      letterSpacing: { value: 0, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Regular" },
      existingIndex: index,
    });

    expect(result.status).toBe("updated");
    expect(style.fontSize).toBe(16);
  });

  it("renames text style via reverse rename map", async () => {
    const style = figma.createTextStyle();
    style.setPluginData("tokenPath", "typography.body.old");
    style.name = "Body/old";
    const index = buildTokenPathIndex([style]);

    const result = await upsertTextStyle({
      tokenPath: "typography.body.new",
      figmaName: "Body/new",
      fontSize: 16,
      lineHeight: { value: 24, unit: "PIXELS" },
      letterSpacing: { value: 0, unit: "PERCENT" },
      fontName: { family: "Haffer", style: "Regular" },
      existingIndex: index,
      reverseRenames: { "typography.body.new": "typography.body.old" },
    });

    expect(result.status).toBe("renamed");
    expect(style.name).toBe("Body/new");
    expect(style.getPluginData("tokenPath")).toBe("typography.body.new");
  });
});

// ---------------------------------------------------------------------------
// Orphan preservation
// ---------------------------------------------------------------------------

describe("orphan preservation", () => {
  it("does not delete unmatched existing variables", async () => {
    const col = await findOrCreateCollection("Spacing");
    const orphan = figma.variables.createVariable("6", col, "FLOAT");
    orphan.setPluginData("tokenPath", "spacing.6");
    orphan.setValueForMode(col.defaultModeId, 6);

    const index = buildTokenPathIndex([orphan]);

    // Upsert only spacing.4 — spacing.6 should remain
    upsertVariable({
      tokenPath: "spacing.4",
      figmaName: "4",
      value: 4,
      resolveType: "FLOAT",
      collection: col,
      existingIndex: index,
    });

    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(2);
    const orphanStillExists = allVars.find((v: any) => v.name === "6");
    expect(orphanStillExists).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Idempotent re-runs
// ---------------------------------------------------------------------------

describe("idempotent re-runs", () => {
  it("running upsert twice with same data returns unchanged on second run", async () => {
    const col = await findOrCreateCollection("Spacing");
    const index = new Map();

    const first = upsertVariable({
      tokenPath: "spacing.4",
      figmaName: "4",
      value: 4,
      resolveType: "FLOAT",
      collection: col,
      scopes: ["GAP"],
      description: "4px",
      existingIndex: index,
    });
    expect(first.status).toBe("created");

    const second = upsertVariable({
      tokenPath: "spacing.4",
      figmaName: "4",
      value: 4,
      resolveType: "FLOAT",
      collection: col,
      scopes: ["GAP"],
      description: "4px",
      existingIndex: index,
    });
    expect(second.status).toBe("unchanged");

    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(1);
  });
});
