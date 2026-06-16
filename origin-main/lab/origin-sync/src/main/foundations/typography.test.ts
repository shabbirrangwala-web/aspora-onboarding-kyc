import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../../test/figma-mock";
import { syncTypography, FONT_WEIGHT_STYLE_MAP } from "./typography";

beforeEach(() => {
  resetMock();
});

describe("syncTypography", () => {
  it("creates 30 variables and 25 text styles", async () => {
    const result = await syncTypography();
    expect(result.variables).toBe(30);
    expect(result.textStyles).toBe(25);
  });

  it("creates hidden Typography primitives collection", async () => {
    await syncTypography();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const col = collections.find((c: any) => c.name === "Typography primitives");
    expect(col).toBeDefined();
    expect(col!.hiddenFromPublishing).toBe(true);
  });

  it("does not create letterSpacing variables (skipVariable)", async () => {
    await syncTypography();
    const allVars = await figma.variables.getLocalVariablesAsync();
    const letterSpacingVars = allVars.filter((v: any) =>
      v.name.startsWith("letterSpacing/"),
    );
    expect(letterSpacingVars).toHaveLength(0);
  });

  it("creates text styles with correct folder names", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();

    const folderNames = new Set(styles.map((s: any) => s.name.split("/")[0]));
    expect(folderNames).toContain("Display");
    expect(folderNames).toContain("Header");
    expect(folderNames).toContain("Title");
    expect(folderNames).toContain("Label");
    expect(folderNames).toContain("Label heavy");
    expect(folderNames).toContain("Body");
    expect(folderNames).toContain("Number");
    expect(folderNames).toContain("Overline");
  });

  it("binds fontSize, lineHeight, fontWeight, fontFamily variables to text styles", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const bodyM = styles.find((s: any) => s.name === "Body/Medium");
    expect(bodyM).toBeDefined();

    const bound = bodyM!.getBoundVariables();
    expect(bound.fontSize).toBeDefined();
    expect(bound.lineHeight).toBeDefined();
    expect(bound.fontWeight).toBeDefined();
    expect(bound.fontFamily).toBeDefined();
  });

  it("sets letterSpacing as percentage value directly (not variable)", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();
    const bodyM = styles.find((s: any) => s.name === "Body/Medium");
    expect(bodyM).toBeDefined();
    expect(bodyM!.letterSpacing.unit).toBe("PERCENT");
    expect(typeof bodyM!.letterSpacing.value).toBe("number");
  });

  it("applies UPPER textCase to display, number-display, and overline styles", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();

    const expectedUpper = [
      "Display/Small",
      "Display/Medium",
      "Display/Large",
      "Number/Display small",
      "Number/Display medium",
      "Number/Display large",
      "Overline/Standard",
    ];

    for (const name of expectedUpper) {
      const style = styles.find((s: any) => s.name === name);
      expect(style).toBeDefined();
      expect(style!.textCase).toBe("UPPER");
    }

    // Non-uppercase styles should be ORIGINAL
    const bodyM = styles.find((s: any) => s.name === "Body/Medium");
    expect(bodyM!.textCase).toBe("ORIGINAL");
  });

  it("sets fontName using weight-to-style map", async () => {
    await syncTypography();
    const styles = await figma.getLocalTextStylesAsync();

    // Display uses weight 900 → "Heavy"
    const displayS = styles.find((s: any) => s.name === "Display/Small");
    expect(displayS!.fontName).toEqual({ family: "Haffer", style: "Heavy" });

    // Header uses weight 700 → "Bold"
    const headerS = styles.find((s: any) => s.name === "Header/Small");
    expect(headerS!.fontName).toEqual({ family: "Haffer", style: "Bold" });

    // Body uses weight 400 → "Regular"
    const bodyS = styles.find((s: any) => s.name === "Body/Small");
    expect(bodyS!.fontName).toEqual({ family: "Haffer", style: "Regular" });

    // Label heavy uses weight 500 → "Medium"
    const labelHeavyS = styles.find((s: any) => s.name === "Label heavy/Small");
    expect(labelHeavyS!.fontName).toEqual({ family: "Haffer", style: "Medium" });

    // Title uses weight 600 → "SemiBold"
    const titleS = styles.find((s: any) => s.name === "Title/Small");
    expect(titleS!.fontName).toEqual({ family: "Haffer", style: "SemiBold" });
  });

  it("is idempotent — re-sync produces same counts", async () => {
    await syncTypography();
    const vars1 = await figma.variables.getLocalVariablesAsync();
    const styles1 = await figma.getLocalTextStylesAsync();

    await syncTypography();
    const vars2 = await figma.variables.getLocalVariablesAsync();
    const styles2 = await figma.getLocalTextStylesAsync();

    expect(vars2).toHaveLength(vars1.length);
    expect(styles2).toHaveLength(styles1.length);
  });
});

describe("FONT_WEIGHT_STYLE_MAP", () => {
  it("maps numeric weights to Figma style names", () => {
    expect(FONT_WEIGHT_STYLE_MAP[400]).toBe("Regular");
    expect(FONT_WEIGHT_STYLE_MAP[500]).toBe("Medium");
    expect(FONT_WEIGHT_STYLE_MAP[600]).toBe("SemiBold");
    expect(FONT_WEIGHT_STYLE_MAP[700]).toBe("Bold");
    expect(FONT_WEIGHT_STYLE_MAP[900]).toBe("Heavy");
  });
});
