import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../../test/figma-mock";
import { syncRadius } from "./radius";

beforeEach(() => {
  resetMock();
});

describe("syncRadius", () => {
  it("creates 8 FLOAT variables", async () => {
    const result = await syncRadius();
    expect(result.variables).toBe(8);

    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(8);
  });

  it("creates published Radius collection (not hidden)", async () => {
    await syncRadius();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const col = collections.find((c: any) => c.name === "Radius");
    expect(col).toBeDefined();
    expect(col!.hiddenFromPublishing).toBe(false);
  });

  it("assigns CORNER_RADIUS scopes to all variables", async () => {
    await syncRadius();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    for (const v of allVars) {
      expect(v.scopes).toEqual(["CORNER_RADIUS"]);
    }
  });

  it("has correct values including 9999 for full", async () => {
    await syncRadius();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const col = collections.find((c: any) => c.name === "Radius")!;

    const getVal = (name: string) => {
      const v = allVars.find((v: any) => v.name === name);
      return v?.valuesByMode[col.defaultModeId];
    };

    expect(getVal("4")).toBe(4);
    expect(getVal("8")).toBe(8);
    expect(getVal("12")).toBe(12);
    expect(getVal("16")).toBe(16);
    expect(getVal("20")).toBe(20);
    expect(getVal("24")).toBe(24);
    expect(getVal("36")).toBe(36);
    expect(getVal("full")).toBe(9999);
  });

  it("sets description on radius/full", async () => {
    await syncRadius();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const fullVar = allVars.find((v: any) => v.name === "full");
    expect(fullVar).toBeDefined();
    expect(fullVar!.description).toBe("Fully rounded \u2014 produces pill/capsule shapes");
  });

  it("is idempotent — re-sync produces same count", async () => {
    await syncRadius();
    await syncRadius();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(8);
  });
});
