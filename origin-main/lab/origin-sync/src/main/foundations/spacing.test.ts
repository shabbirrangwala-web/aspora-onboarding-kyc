import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../../test/figma-mock";
import { syncSpacing } from "./spacing";

beforeEach(() => {
  resetMock();
});

describe("syncSpacing", () => {
  it("creates 12 FLOAT variables", async () => {
    const result = await syncSpacing();
    expect(result.variables).toBe(12);

    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(12);
  });

  it("creates published Spacing collection (not hidden)", async () => {
    await syncSpacing();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const col = collections.find((c: any) => c.name === "Spacing");
    expect(col).toBeDefined();
    expect(col!.hiddenFromPublishing).toBe(false);
  });

  it("assigns GAP scopes to all variables", async () => {
    await syncSpacing();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    for (const v of allVars) {
      expect(v.scopes).toEqual(["GAP"]);
    }
  });

  it("has correct values for known tokens", async () => {
    await syncSpacing();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const col = collections.find((c: any) => c.name === "Spacing")!;

    const getVal = (name: string) => {
      const v = allVars.find((v: any) => v.name === name);
      return v?.valuesByMode[col.defaultModeId];
    };

    expect(getVal("4")).toBe(4);
    expect(getVal("8")).toBe(8);
    expect(getVal("16")).toBe(16);
    expect(getVal("32")).toBe(32);
    expect(getVal("80")).toBe(80);
  });

  it("is idempotent — re-sync produces same count", async () => {
    await syncSpacing();
    await syncSpacing();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    expect(allVars).toHaveLength(12);
  });
});
