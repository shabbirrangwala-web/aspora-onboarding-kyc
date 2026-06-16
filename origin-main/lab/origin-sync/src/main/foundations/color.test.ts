import { describe, it, expect, beforeEach } from "vitest";
import { resetMock, mockState } from "../../test/figma-mock";
import { syncColor } from "./color";

beforeEach(() => {
  resetMock();
});

describe("syncColor", () => {
  it("creates 209 total variables (153 primitives + 56 semantics)", async () => {
    const result = await syncColor();
    expect(result.primitives).toBe(153);
    expect(result.semantics).toBe(56);

    const allVars = await figma.variables.getLocalVariablesAsync();
    expect(allVars).toHaveLength(209);
  });

  it("creates Color primitives collection as hidden", async () => {
    await syncColor();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const primCol = collections.find((c: any) => c.name === "Color primitives");
    expect(primCol).toBeDefined();
    expect(primCol!.hiddenFromPublishing).toBe(true);
  });

  it("creates Color collection as published (not hidden)", async () => {
    await syncColor();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const semCol = collections.find((c: any) => c.name === "Color");
    expect(semCol).toBeDefined();
    expect(semCol!.hiddenFromPublishing).toBe(false);
  });

  it("creates Light and Dark modes on Color collection", async () => {
    await syncColor();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const semCol = collections.find((c: any) => c.name === "Color")!;
    expect(semCol.modes).toHaveLength(2);
    expect(semCol.modes[0].name).toBe("Light");
    expect(semCol.modes[1].name).toBe("Dark");
  });

  it("sets all semantic variables as cross-collection aliases", async () => {
    await syncColor();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const semCol = collections.find((c: any) => c.name === "Color")!;
    const lightModeId = semCol.modes[0].modeId;
    const darkModeId = semCol.modes[1].modeId;

    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const semanticVars = allVars.filter(
      (v: any) => v.variableCollectionId === semCol.id,
    );
    expect(semanticVars).toHaveLength(56);

    // Every semantic variable should have an alias value in both modes
    for (const v of semanticVars) {
      const lightVal = v.valuesByMode[lightModeId];
      const darkVal = v.valuesByMode[darkModeId];
      expect(lightVal).toBeDefined();
      expect(lightVal.type).toBe("VARIABLE_ALIAS");
      expect(darkVal).toBeDefined();
      expect(darkVal.type).toBe("VARIABLE_ALIAS");
    }
  });

  it("applies brand descriptions to brand semantic tokens", async () => {
    await syncColor();
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const brandMaroon = allVars.find((v: any) => v.name === "brand/maroon");
    expect(brandMaroon).toBeDefined();
    expect(brandMaroon!.description).toBe("Pair with on-brand/light");

    const brandPeach = allVars.find((v: any) => v.name === "brand/peach");
    expect(brandPeach).toBeDefined();
    expect(brandPeach!.description).toBe("Pair with on-brand/dark");
  });

  it("assigns ALL_SCOPES scopes to primitives", async () => {
    await syncColor();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const primCol = collections.find((c: any) => c.name === "Color primitives")!;

    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const primVars = allVars.filter(
      (v: any) => v.variableCollectionId === primCol.id,
    );

    for (const v of primVars) {
      expect(v.scopes).toEqual(["ALL_SCOPES"]);
    }
  });

  it("assigns ALL_SCOPES to all semantic tokens", async () => {
    await syncColor();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const semCol = collections.find((c: any) => c.name === "Color")!;
    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const semanticVars = allVars.filter(
      (v: any) => v.variableCollectionId === semCol.id,
    );

    for (const v of semanticVars) {
      expect(v.scopes).toEqual(["ALL_SCOPES"]);
    }
  });

  it("is idempotent — re-sync produces same count", async () => {
    await syncColor();
    const firstRun = await figma.variables.getLocalVariablesAsync();
    const firstCount = firstRun.length;

    await syncColor();
    const secondRun = await figma.variables.getLocalVariablesAsync();
    expect(secondRun).toHaveLength(firstCount);
  });
});
