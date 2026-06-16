// ---------------------------------------------------------------------------
// Typography Foundation Sync — Primitive variables + Text styles
// ---------------------------------------------------------------------------

import {
  parseTypographyPrimitives,
  parseTypographySemantics,
  resolveReference,
  isReference,
  type PrimitiveToken,
} from "../token-parser";
import {
  upsertVariable,
  upsertTextStyle,
  buildTokenPathIndex,
  type UpsertResult,
} from "../upsert";
import { findOrCreateCollection } from "../collections";
import { getTypographyScopes } from "../config/scopes";

import typoPrimitivesJson from "@foundations/typography/primitives.json";
import typoSemanticsJson from "@foundations/typography/semantic.json";

export const FONT_WEIGHT_STYLE_MAP: Record<number, string> = {
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  900: "Heavy",
};

export interface TypographySyncResult {
  variables: number;
  textStyles: number;
}

export async function syncTypography(): Promise<TypographySyncResult> {
  // ── 1. Parse tokens ──
  const allPrimitives = parseTypographyPrimitives(typoPrimitivesJson);
  const variableTokens = allPrimitives.filter((t) => !t.skipVariable);
  const semanticTokens = parseTypographySemantics(typoSemanticsJson);

  // ── 2. Collection ──
  const collection = await findOrCreateCollection("Typography primitives", { hidden: true });

  // ── 3. Build existing index ──
  const existingVars = await figma.variables.getLocalVariablesAsync();
  const primVars = existingVars.filter(
    (v: any) => v.variableCollectionId === collection.id,
  );
  const primIndex = buildTokenPathIndex(primVars);

  // ── 4. Upsert primitive variables (30 — no letterSpacing) ──
  for (const token of variableTokens) {
    const scopeKey = `typography/${token.figmaName}`;
    upsertVariable({
      tokenPath: token.tokenPath,
      figmaName: token.figmaName,
      value: token.value,
      resolveType: token.type === "STRING" ? "STRING" : "FLOAT",
      collection,
      scopes: getTypographyScopes(scopeKey),
      existingIndex: primIndex,
    });
  }

  // ── 5. Build lookups for variable binding and value resolution ──
  // Token path -> Figma variable (for binding)
  const varLookup = new Map<string, any>();
  for (const [, v] of primIndex) {
    const tp = v.getPluginData("tokenPath");
    if (tp) varLookup.set(tp, v);
  }

  // Token path -> raw value (for resolving letter spacing and other values)
  const valueLookup = new Map<string, PrimitiveToken>();
  for (const token of allPrimitives) {
    valueLookup.set(token.tokenPath, token);
  }

  // ── 6. Build existing text style index ──
  const existingStyles = await figma.getLocalTextStylesAsync();
  const styleIndex = buildTokenPathIndex(existingStyles);

  // ── 7. Create/update text styles ──
  for (const style of semanticTokens) {
    const { value, extensions } = style;

    // Resolve primitive references to actual values and variables
    const fontFamilyPath = isReference(value.fontFamily)
      ? resolveReference(value.fontFamily)
      : undefined;
    const fontSizePath = isReference(value.fontSize)
      ? resolveReference(value.fontSize)
      : undefined;
    const fontWeightPath = isReference(value.fontWeight)
      ? resolveReference(value.fontWeight)
      : undefined;
    const lineHeightPath = isReference(value.lineHeight)
      ? resolveReference(value.lineHeight)
      : undefined;
    const letterSpacingPath = isReference(value.letterSpacing)
      ? resolveReference(value.letterSpacing)
      : undefined;

    // Resolve actual numeric/string values
    const fontFamily = fontFamilyPath
      ? (valueLookup.get(fontFamilyPath)?.value as string) ?? "Haffer"
      : value.fontFamily;
    const fontSize = fontSizePath
      ? (valueLookup.get(fontSizePath)?.value as number) ?? 16
      : parseFloat(value.fontSize);
    const fontWeight = fontWeightPath
      ? (valueLookup.get(fontWeightPath)?.value as number) ?? 400
      : parseFloat(value.fontWeight);
    const lineHeight = lineHeightPath
      ? (valueLookup.get(lineHeightPath)?.value as number) ?? 24
      : parseFloat(value.lineHeight);
    const letterSpacingValue = letterSpacingPath
      ? (valueLookup.get(letterSpacingPath)?.value as number) ?? 0
      : parseFloat(value.letterSpacing);

    // Build variable bindings
    const boundVariables: Record<string, any> = {};
    if (fontFamilyPath && varLookup.has(fontFamilyPath)) {
      boundVariables.fontFamily = varLookup.get(fontFamilyPath);
    }
    if (fontSizePath && varLookup.has(fontSizePath)) {
      boundVariables.fontSize = varLookup.get(fontSizePath);
    }
    if (fontWeightPath && varLookup.has(fontWeightPath)) {
      boundVariables.fontWeight = varLookup.get(fontWeightPath);
    }
    if (lineHeightPath && varLookup.has(lineHeightPath)) {
      boundVariables.lineHeight = varLookup.get(lineHeightPath);
    }

    // Determine fontName from weight
    const fontStyle = FONT_WEIGHT_STYLE_MAP[fontWeight] ?? "Regular";

    // Determine textCase
    const textCase = extensions?.textCase === "uppercase" ? "UPPER" : "ORIGINAL";

    await upsertTextStyle({
      tokenPath: style.tokenPath,
      figmaName: style.figmaName,
      fontSize,
      lineHeight: { value: lineHeight, unit: "PIXELS" },
      letterSpacing: { value: letterSpacingValue, unit: "PERCENT" },
      fontName: { family: fontFamily, style: fontStyle },
      textCase,
      boundVariables,
      existingIndex: styleIndex,
    });
  }

  return {
    variables: variableTokens.length,
    textStyles: semanticTokens.length,
  };
}
