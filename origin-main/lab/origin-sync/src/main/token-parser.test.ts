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
  type PrimitiveToken,
  type SemanticColorToken,
  type TypographySemanticToken,
} from "./token-parser";

import colorPrimitives from "@foundations/color/primitives.json";
import colorSemanticsLight from "@foundations/color/semantic.light.json";
import colorSemanticsDark from "@foundations/color/semantic.dark.json";
import typographyPrimitives from "@foundations/typography/primitives.json";
import typographySemantics from "@foundations/typography/semantic.json";
import spacingPrimitives from "@foundations/spacing/primitives.json";
import radiusPrimitives from "@foundations/radius/primitives.json";

describe("Token Parser — Color primitives", () => {
  const tokens = parseColorPrimitives(colorPrimitives);

  it("parses 153 tokens", () => {
    expect(tokens).toHaveLength(153);
  });

  it("produces correct tokenPaths", () => {
    const first = tokens.find((t) => t.tokenPath === "color.neutral.50");
    expect(first).toBeDefined();
    expect(first!.value).toBe("#ffffff");
    expect(first!.type).toBe("COLOR");
  });

  it("produces hyphenated figmaNames", () => {
    const wa = tokens.find((t) => t.tokenPath === "color.white-alpha.40");
    expect(wa).toBeDefined();
    expect(wa!.figmaName).toBe("white-alpha/40");
  });

  it("preserves alpha hex values", () => {
    const ba8 = tokens.find((t) => t.tokenPath === "color.black-alpha.8");
    expect(ba8).toBeDefined();
    expect(ba8!.value).toBe("#00000014");
  });

  it("includes all 13 ramps", () => {
    const ramps = new Set(
      tokens.map((t) => t.tokenPath.split(".")[1]),
    );
    expect(ramps.size).toBe(13);
    expect(ramps).toContain("neutral");
    expect(ramps).toContain("maroon");
    expect(ramps).toContain("crimson");
    expect(ramps).toContain("peach");
    expect(ramps).toContain("gold");
    expect(ramps).toContain("lime");
    expect(ramps).toContain("teal");
    expect(ramps).toContain("blue");
    expect(ramps).toContain("red");
    expect(ramps).toContain("green");
    expect(ramps).toContain("yellow");
    expect(ramps).toContain("white-alpha");
    expect(ramps).toContain("black-alpha");
  });
});

describe("Token Parser — Color Semantics", () => {
  const lightTokens = parseColorSemantics(colorSemanticsLight);
  const darkTokens = parseColorSemantics(colorSemanticsDark);

  it("parses 56 tokens from light", () => {
    expect(lightTokens).toHaveLength(56);
  });

  it("parses 56 tokens from dark", () => {
    expect(darkTokens).toHaveLength(56);
  });

  it("preserves references as values", () => {
    const surfacePrimary = lightTokens.find(
      (t) => t.tokenPath === "color.surface.primary",
    );
    expect(surfacePrimary).toBeDefined();
    expect(surfacePrimary!.value).toBe("{color.neutral.50}");
    expect(surfacePrimary!.isAlias).toBe(true);
  });

  it("resolves aliasTarget from references", () => {
    const surfacePrimary = lightTokens.find(
      (t) => t.tokenPath === "color.surface.primary",
    );
    expect(surfacePrimary!.aliasTarget).toBe("color.neutral.50");
  });

  it("produces hyphenated figmaNames for groups", () => {
    const onSurface = lightTokens.find(
      (t) => t.tokenPath === "color.on-surface.primary",
    );
    expect(onSurface).toBeDefined();
    expect(onSurface!.figmaName).toBe("on-surface/primary");
  });

  it("has 11 semantic groups", () => {
    const groups = new Set(
      lightTokens.map((t) => t.tokenPath.split(".")[1]),
    );
    expect(groups.size).toBe(11);
  });
});

describe("Token Parser — Typography primitives", () => {
  const tokens = parseTypographyPrimitives(typographyPrimitives);

  it("parses 38 tokens", () => {
    expect(tokens).toHaveLength(38);
  });

  it("parses 12 fontSize tokens as FLOAT", () => {
    const fontSizes = tokens.filter((t) =>
      t.tokenPath.startsWith("typography.fontSize."),
    );
    expect(fontSizes).toHaveLength(12);
    fontSizes.forEach((t) => expect(t.type).toBe("FLOAT"));
  });

  it("parses 12 lineHeight tokens", () => {
    const lineHeights = tokens.filter((t) =>
      t.tokenPath.startsWith("typography.lineHeight."),
    );
    expect(lineHeights).toHaveLength(12);
  });

  it("parses 8 letterSpacing tokens with skipVariable", () => {
    const letterSpacings = tokens.filter((t) =>
      t.tokenPath.startsWith("typography.letterSpacing."),
    );
    expect(letterSpacings).toHaveLength(8);
    letterSpacings.forEach((t) => {
      expect(t.skipVariable).toBe(true);
    });
  });

  it("parses 5 fontWeight tokens as FLOAT", () => {
    const fontWeights = tokens.filter((t) =>
      t.tokenPath.startsWith("typography.fontWeight."),
    );
    expect(fontWeights).toHaveLength(5);
    fontWeights.forEach((t) => expect(t.type).toBe("FLOAT"));
  });

  it("parses 1 fontFamily token as STRING", () => {
    const families = tokens.filter((t) =>
      t.tokenPath.startsWith("typography.fontFamily."),
    );
    expect(families).toHaveLength(1);
    expect(families[0].type).toBe("STRING");
    expect(families[0].value).toBe("Haffer");
  });

  it("strips px from dimension values", () => {
    const fs400 = tokens.find(
      (t) => t.tokenPath === "typography.fontSize.400",
    );
    expect(fs400).toBeDefined();
    expect(fs400!.value).toBe(16);
  });

  it("handles percent letterSpacing values", () => {
    const tight4 = tokens.find(
      (t) => t.tokenPath === "typography.letterSpacing.tight-4",
    );
    expect(tight4).toBeDefined();
    expect(tight4!.value).toBe(-2);
    expect(tight4!.unit).toBe("PERCENT");
    expect(tight4!.skipVariable).toBe(true);
  });
});

describe("Token Parser — Typography Semantics", () => {
  const tokens = parseTypographySemantics(typographySemantics);

  it("parses 25 composite tokens", () => {
    expect(tokens).toHaveLength(25);
  });

  it("produces correct figmaName with capitalized folder", () => {
    const displayS = tokens.find(
      (t) => t.tokenPath === "typography.display.s",
    );
    expect(displayS).toBeDefined();
    expect(displayS!.figmaName).toBe("Display/Small");
  });

  it("extracts extensions for textCase", () => {
    const displayS = tokens.find(
      (t) => t.tokenPath === "typography.display.s",
    );
    expect(displayS!.extensions).toBeDefined();
    expect(displayS!.extensions!.textCase).toBe("uppercase");
  });

  it("extracts extensions for tnum", () => {
    const numberS = tokens.find(
      (t) => t.tokenPath === "typography.number.s",
    );
    expect(numberS!.extensions).toBeDefined();
    expect(numberS!.extensions!.openTypeFeatures).toEqual({ tnum: true });
  });

  it("produces sentence-case figmaName for label-heavy", () => {
    const lhS = tokens.find(
      (t) => t.tokenPath === "typography.label-heavy.s",
    );
    expect(lhS).toBeDefined();
    expect(lhS!.figmaName).toBe("Label heavy/Small");
  });

  it("produces expanded figmaNames for number display-s/m/l", () => {
    const nds = tokens.find(
      (t) => t.tokenPath === "typography.number.display-s",
    );
    expect(nds).toBeDefined();
    expect(nds!.figmaName).toBe("Number/Display small");
  });

  it("has 8 groups", () => {
    const groups = new Set(
      tokens.map((t) => t.tokenPath.split(".")[1]),
    );
    expect(groups.size).toBe(8);
  });
});

describe("Token Parser — Spacing", () => {
  const tokens = parseSpacingPrimitives(spacingPrimitives);

  it("parses 12 tokens", () => {
    expect(tokens).toHaveLength(12);
  });

  it("all tokens are FLOAT type", () => {
    tokens.forEach((t) => expect(t.type).toBe("FLOAT"));
  });

  it("has correct values", () => {
    const s4 = tokens.find((t) => t.tokenPath === "spacing.4");
    expect(s4!.value).toBe(4);
    const s80 = tokens.find((t) => t.tokenPath === "spacing.80");
    expect(s80!.value).toBe(80);
  });
});

describe("Token Parser — Radius", () => {
  const tokens = parseRadiusPrimitives(radiusPrimitives);

  it("parses 8 tokens", () => {
    expect(tokens).toHaveLength(8);
  });

  it("all tokens are FLOAT type", () => {
    tokens.forEach((t) => expect(t.type).toBe("FLOAT"));
  });

  it("radius.full has description and value 9999", () => {
    const full = tokens.find((t) => t.tokenPath === "radius.full");
    expect(full).toBeDefined();
    expect(full!.value).toBe(9999);
    expect(full!.description).toBe(
      "Fully rounded — produces pill/capsule shapes",
    );
  });

  it("numeric radius tokens have no description", () => {
    const r4 = tokens.find((t) => t.tokenPath === "radius.4");
    expect(r4).toBeDefined();
    expect(r4!.description).toBeUndefined();
  });
});

describe("Token Parser — Reference utilities", () => {
  it("isReference detects references", () => {
    expect(isReference("{color.neutral.50}")).toBe(true);
    expect(isReference("#ffffff")).toBe(false);
    expect(isReference("16px")).toBe(false);
  });

  it("resolveReference strips braces", () => {
    expect(resolveReference("{color.neutral.50}")).toBe("color.neutral.50");
    expect(resolveReference("{typography.fontSize.400}")).toBe(
      "typography.fontSize.400",
    );
  });
});
