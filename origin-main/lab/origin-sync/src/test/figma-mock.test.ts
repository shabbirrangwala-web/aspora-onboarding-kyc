import { describe, it, expect, beforeEach } from "vitest";
import { resetMock, mockState, figmaMock } from "./figma-mock";

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
    expect(cols.map((c: any) => c.name)).toEqual(["A", "B"]);
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
    style.name = "Display/Large";
    style.fontSize = 57;
    style.lineHeight = { value: 56, unit: "PIXELS" };
    style.letterSpacing = { value: -2, unit: "PERCENT" };
    style.fontName = { family: "Haffer", style: "Heavy" };
    style.textCase = "UPPER";
    expect(style.name).toBe("Display/Large");
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
    s1.name = "Display/Large";
    const s2 = figma.createTextStyle();
    s2.name = "Body/Medium";
    const styles = await figma.getLocalTextStylesAsync();
    expect(styles).toHaveLength(2);
    expect(styles.map((s: any) => s.name)).toEqual(["Display/Large", "Body/Medium"]);
  });
});

describe("Figma Mock — Cross-collection aliases", () => {
  it("semantic variable aliases a primitive from a different collection", () => {
    const primCol = figma.variables.createVariableCollection("Color primitives");
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
