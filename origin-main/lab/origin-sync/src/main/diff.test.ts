import { describe, it, expect } from "vitest";
import {
  computeDiff,
  type DiffResult,
  type DiffEntry,
  type FigmaSnapshot,
  type FigmaVariableSnapshot,
  type CodeToken,
} from "./diff";

function makeCodeToken(tokenPath: string, value: any, figmaName?: string): CodeToken {
  return { tokenPath, value, figmaName: figmaName ?? tokenPath.replace(/\./g, "/") };
}

function makeFigmaVar(tokenPath: string, name: string, value: any, extra?: Partial<FigmaVariableSnapshot>): FigmaVariableSnapshot {
  return { tokenPath, name, value, scopes: [], description: "", ...extra };
}

describe("Diff Engine", () => {
  it("empty Figma state → all tokens reported as 'new'", () => {
    const codeTokens = [
      makeCodeToken("spacing.4", 4),
      makeCodeToken("spacing.8", 8),
    ];
    const figmaState: FigmaSnapshot = { variables: [], textStyles: [] };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries).toHaveLength(2);
    expect(result.entries.every(e => e.status === "new")).toBe(true);
    expect(result.summary.new).toBe(2);
    expect(result.summary.total).toBe(2);
  });

  it("fully synced → all 'in_sync'", () => {
    const codeTokens = [
      makeCodeToken("spacing.4", 4, "spacing/4"),
      makeCodeToken("spacing.8", 8, "spacing/8"),
    ];
    const figmaState: FigmaSnapshot = {
      variables: [
        makeFigmaVar("spacing.4", "spacing/4", 4),
        makeFigmaVar("spacing.8", "spacing/8", 8),
      ],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries.every(e => e.status === "in_sync")).toBe(true);
    expect(result.summary.inSync).toBe(2);
  });

  it("one value changed → reports 'changed' with old and new", () => {
    const codeTokens = [makeCodeToken("spacing.4", 8, "spacing/4")]; // value changed from 4 to 8
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("spacing.4", "spacing/4", 4)],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].status).toBe("changed");
    expect(result.entries[0].oldValue).toBe(4);
    expect(result.entries[0].newValue).toBe(8);
    expect(result.summary.changed).toBe(1);
  });

  it("token renamed via rename map → reports 'renamed' with old and new names", () => {
    const codeTokens = [makeCodeToken("color.brand.maroon", "#680d0d", "brand/maroon")];
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("color.brand.dark-maroon", "brand/dark-maroon", "#680d0d")],
      textStyles: [],
    };
    const renameMap = { "color.brand.dark-maroon": "color.brand.maroon" };
    const result = computeDiff(codeTokens, figmaState, renameMap);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].status).toBe("renamed");
    expect(result.entries[0].oldName).toBe("brand/dark-maroon");
    expect(result.entries[0].newName).toBe("brand/maroon");
    expect(result.summary.renamed).toBe(1);
  });

  it("orphaned variable (has tokenPath but no code match) → reports 'orphaned'", () => {
    const codeTokens: CodeToken[] = [];
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("spacing.6", "spacing/6", 6)],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].status).toBe("orphaned");
    expect(result.entries[0].tokenPath).toBe("spacing.6");
    expect(result.summary.orphaned).toBe(1);
  });

  it("mixed state: 2 new + 1 changed + 1 orphaned → correct counts", () => {
    const codeTokens = [
      makeCodeToken("spacing.4", 4, "spacing/4"),
      makeCodeToken("spacing.8", 12, "spacing/8"),   // changed
      makeCodeToken("spacing.12", 12, "spacing/12"),  // new
      makeCodeToken("spacing.16", 16, "spacing/16"),  // new
    ];
    const figmaState: FigmaSnapshot = {
      variables: [
        makeFigmaVar("spacing.4", "spacing/4", 4),     // in_sync
        makeFigmaVar("spacing.8", "spacing/8", 8),      // changed
        makeFigmaVar("spacing.6", "spacing/6", 6),      // orphaned
      ],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.summary.new).toBe(2);
    expect(result.summary.changed).toBe(1);
    expect(result.summary.orphaned).toBe(1);
    expect(result.summary.inSync).toBe(1);
    expect(result.summary.total).toBe(5);
  });

  it("color mode diff: light value changed, dark same → reports 'changed'", () => {
    const codeTokens = [makeCodeToken("color.surface.base", "{color.neutral.100}", "surface/base")]; // changed from 50 to 100
    const figmaState: FigmaSnapshot = {
      variables: [
        makeFigmaVar("color.surface.base", "surface/base", "{color.neutral.50}", {
          modeValues: {
            light: "{color.neutral.50}",  // old
            dark: "{color.neutral.950}",
          },
        }),
      ],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries[0].status).toBe("changed");
  });

  it("color alias changed (different primitive target) → reports 'changed'", () => {
    const codeTokens = [makeCodeToken("color.brand.maroon", "{color.maroon.700}", "brand/maroon")]; // was 800
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("color.brand.maroon", "brand/maroon", "{color.maroon.800}")],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState);
    expect(result.entries[0].status).toBe("changed");
  });

  it("typography extension changed (tnum removed) → reports 'changed'", () => {
    const codeToken: CodeToken = {
      tokenPath: "typography.number.s",
      figmaName: "Number/Small",
      value: { fontSize: "{typography.fontSize.200}" },
      extensions: undefined,  // tnum removed
    };
    const figmaState: FigmaSnapshot = {
      variables: [],
      textStyles: [{
        tokenPath: "typography.number.s",
        name: "Number/Small",
        value: { fontSize: "{typography.fontSize.200}" },
        extensions: { openTypeFeatures: { tnum: true } },
      }],
    };
    const result = computeDiff([codeToken], figmaState);
    expect(result.entries[0].status).toBe("changed");
  });

  it("text style with wrong letterSpacing percentage → reports 'changed'", () => {
    const codeToken: CodeToken = {
      tokenPath: "typography.display.l",
      figmaName: "Display/Large",
      value: { letterSpacing: "{typography.letterSpacing.tight-4}" },
    };
    const figmaState: FigmaSnapshot = {
      variables: [],
      textStyles: [{
        tokenPath: "typography.display.l",
        name: "Display/Large",
        value: { letterSpacing: "{typography.letterSpacing.tight-3}" },  // wrong
      }],
    };
    const result = computeDiff([codeToken], figmaState);
    expect(result.entries[0].status).toBe("changed");
  });

  it("handles rename map with multiple entries", () => {
    const codeTokens = [
      makeCodeToken("color.brand.maroon", "#680d0d", "brand/maroon"),
      makeCodeToken("color.brand.teal", "#097e8d", "brand/teal"),
    ];
    const figmaState: FigmaSnapshot = {
      variables: [
        makeFigmaVar("color.brand.dark-maroon", "brand/dark-maroon", "#680d0d"),
        makeFigmaVar("color.brand.dark-teal", "brand/dark-teal", "#097e8d"),
      ],
      textStyles: [],
    };
    const renameMap = {
      "color.brand.dark-maroon": "color.brand.maroon",
      "color.brand.dark-teal": "color.brand.teal",
    };
    const result = computeDiff(codeTokens, figmaState, renameMap);
    expect(result.summary.renamed).toBe(2);
  });

  it("handles empty rename map", () => {
    const codeTokens = [makeCodeToken("spacing.4", 4, "spacing/4")];
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("spacing.4", "spacing/4", 4)],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState, {});
    expect(result.summary.inSync).toBe(1);
  });

  it("handles missing rename map gracefully (undefined)", () => {
    const codeTokens = [makeCodeToken("spacing.4", 4, "spacing/4")];
    const figmaState: FigmaSnapshot = {
      variables: [makeFigmaVar("spacing.4", "spacing/4", 4)],
      textStyles: [],
    };
    const result = computeDiff(codeTokens, figmaState, undefined);
    expect(result.summary.inSync).toBe(1);
  });
});
