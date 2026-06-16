import { describe, it, expect, beforeEach } from "vitest";
import { resetMock, mockState } from "../test/figma-mock";
import { validateFoundation } from "./validate";
import { syncColor } from "./foundations/color";
import { syncTypography } from "./foundations/typography";
import { syncSpacing } from "./foundations/spacing";
import { syncRadius } from "./foundations/radius";

beforeEach(() => {
  resetMock();
});

describe("validateFoundation", () => {
  // ── 1-4. Clean sync passes ──

  it("passes validation for a clean color sync", async () => {
    await syncColor();
    const result = await validateFoundation("color");
    expect(result.passed).toBe(true);
    for (const check of result.checks) {
      if (check.severity === "error") {
        expect(check.passed).toBe(true);
      }
    }
  });

  it("passes validation for a clean spacing sync", async () => {
    await syncSpacing();
    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(true);
    for (const check of result.checks) {
      if (check.severity === "error") {
        expect(check.passed).toBe(true);
      }
    }
  });

  it("passes validation for a clean radius sync", async () => {
    await syncRadius();
    const result = await validateFoundation("radius");
    expect(result.passed).toBe(true);
    for (const check of result.checks) {
      if (check.severity === "error") {
        expect(check.passed).toBe(true);
      }
    }
  });

  it("passes validation for a clean typography sync", async () => {
    await syncTypography();
    const result = await validateFoundation("typography");
    expect(result.passed).toBe(true);
    for (const check of result.checks) {
      if (check.severity === "error") {
        expect(check.passed).toBe(true);
      }
    }
  });

  // ── 5. Missing tokenPath → fails ──

  it("fails when a variable is missing its tokenPath pluginData", async () => {
    await syncSpacing();

    // Corrupt: clear pluginData on first spacing variable
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const target = allVars[0];
    target.setPluginData("tokenPath", "");

    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(false);

    const check = result.checks.find((c) => c.name === "tokenPath_integrity");
    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
  });

  // ── 6. Wrong value → fails ──

  it("fails when a variable has the wrong value", async () => {
    await syncSpacing();

    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const col = collections.find((c: any) => c.name === "Spacing")!;

    // Find the "16" variable and corrupt its value
    const v16 = allVars.find((v: any) => v.name === "16");
    expect(v16).toBeDefined();
    v16!.setValueForMode(col.defaultModeId, 999);

    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(false);

    const check = result.checks.find((c) => c.name === "value_correctness");
    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
  });

  // ── 7. Broken alias → fails ──

  it("fails when a semantic color has a literal value instead of an alias", async () => {
    await syncColor();

    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const semCol = collections.find((c: any) => c.name === "Color")!;
    const lightModeId = semCol.modes[0].modeId;

    // Find a semantic variable and set it to a literal color
    const semVars = allVars.filter((v: any) => v.variableCollectionId === semCol.id);
    const target = semVars[0];
    target.setValueForMode(lightModeId, { r: 1, g: 0, b: 0, a: 1 });

    const result = await validateFoundation("color");
    expect(result.passed).toBe(false);

    const check = result.checks.find((c) => c.name === "alias_integrity");
    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
  });

  // ── 8. Wrong scope → fails ──

  it("fails when a variable has incorrect scopes", async () => {
    await syncSpacing();

    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const target = allVars[0];
    target.scopes = ["ALL_FILLS"];

    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(false);

    const check = result.checks.find((c) => c.name === "scope_correctness");
    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
  });

  // ── 9. Missing brand description → fails ──

  it("fails when a brand color is missing its description", async () => {
    await syncColor();

    const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
    const brandMaroon = allVars.find((v: any) => v.name === "brand/maroon");
    expect(brandMaroon).toBeDefined();
    brandMaroon!.description = "";

    const result = await validateFoundation("color");
    expect(result.passed).toBe(false);

    const check = result.checks.find((c) => c.name === "description_correctness");
    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
  });

  // ── 10. Wrong hiddenFromPublishing → fails ──

  it("fails when hiddenFromPublishing is wrong", async () => {
    await syncSpacing();

    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const col = collections.find((c: any) => c.name === "Spacing")!;
    col.hiddenFromPublishing = true;

    const result = await validateFoundation("spacing");
    expect(result.passed).toBe(false);

    const check = result.checks.find((c) => c.name === "publishing_correctness");
    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
  });

  // ── 11. Letter spacing in PIXELS → fails ──

  it("fails when a text style uses PIXELS for letter spacing", async () => {
    await syncTypography();

    const textStyles = await figma.getLocalTextStylesAsync();
    const bodyM = textStyles.find((s: any) => s.name === "Body/Medium");
    expect(bodyM).toBeDefined();
    (bodyM as any).letterSpacing = { value: -0.6, unit: "PIXELS" };

    const result = await validateFoundation("typography");
    expect(result.passed).toBe(false);

    const check = result.checks.find((c) => c.name === "letter_spacing_unit");
    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
  });

  // ── 12. Orphaned variables → warns ──

  it("warns when orphaned variables exist (does not fail overall)", async () => {
    await syncSpacing();

    // Add an extra variable with a tokenPath that does not exist in tokens
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const col = collections.find((c: any) => c.name === "Spacing")!;
    const orphan = figma.variables.createVariable("orphan-test", col, "FLOAT");
    orphan.setPluginData("tokenPath", "spacing.orphan-test");

    const result = await validateFoundation("spacing");

    // Overall should still pass (orphaned is a warning, not error)
    expect(result.passed).toBe(true);

    const check = result.checks.find((c) => c.name === "orphaned_variables");
    expect(check).toBeDefined();
    expect(check!.passed).toBe(false);
    expect(check!.severity).toBe("warning");
    expect(check!.details).toContain("spacing.orphan-test");
  });

  // ── 13. Font availability lists all 5 Haffer styles ──

  it("lists all 5 required Haffer font styles", async () => {
    await syncTypography();

    const result = await validateFoundation("typography");

    const check = result.checks.find((c) => c.name === "font_availability");
    expect(check).toBeDefined();
    expect(check!.details).toBeDefined();
    expect(check!.details).toContain("Haffer Regular");
    expect(check!.details).toContain("Haffer Medium");
    expect(check!.details).toContain("Haffer SemiBold");
    expect(check!.details).toContain("Haffer Bold");
    expect(check!.details).toContain("Haffer Heavy");
    expect(check!.details).toHaveLength(5);
  });
});
