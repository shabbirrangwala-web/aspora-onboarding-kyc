import { describe, it, expect } from "vitest";
import {
  getColorSemanticScopes,
  getColorPrimitiveScopes,
  getTypographyScopes,
  getSpacingScopes,
  getRadiusScopes,
} from "./scopes";

describe("Color Semantic Scopes", () => {
  it("always returns ALL_SCOPES regardless of group", () => {
    expect(getColorSemanticScopes("surface/primary")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("on-surface/primary")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("border/default")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("interactive/primary")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("on-brand/light")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("overlay/scrim")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("brand/maroon")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("success/base")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("warning/border")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("error/text")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("info/subtle")).toEqual(["ALL_SCOPES"]);
    expect(getColorSemanticScopes("unknown/token")).toEqual(["ALL_SCOPES"]);
  });
});

describe("Color Primitive Scopes", () => {
  it("returns ALL_SCOPES", () => {
    expect(getColorPrimitiveScopes()).toEqual(["ALL_SCOPES"]);
  });
});

describe("Typography Scopes", () => {
  it("fontSize → FONT_SIZE", () => {
    expect(getTypographyScopes("typography/fontSize/body-m")).toEqual(["FONT_SIZE"]);
  });

  it("lineHeight → LINE_HEIGHT", () => {
    expect(getTypographyScopes("typography/lineHeight/body-m")).toEqual(["LINE_HEIGHT"]);
  });

  it("fontWeight → FONT_WEIGHT", () => {
    expect(getTypographyScopes("typography/fontWeight/regular")).toEqual(["FONT_WEIGHT"]);
  });

  it("fontFamily → FONT_FAMILY", () => {
    expect(getTypographyScopes("typography/fontFamily/sans")).toEqual(["FONT_FAMILY"]);
  });

  it("unknown typography group returns empty array", () => {
    expect(getTypographyScopes("typography/unknown/token")).toEqual([]);
  });
});

describe("Spacing Scopes", () => {
  it("returns GAP", () => {
    expect(getSpacingScopes()).toEqual(["GAP"]);
  });
});

describe("Radius Scopes", () => {
  it("returns CORNER_RADIUS", () => {
    expect(getRadiusScopes()).toEqual(["CORNER_RADIUS"]);
  });
});
