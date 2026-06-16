// Color semantics use ALL_SCOPES — no granular scoping.
// Granular scoping caused confusion (e.g., border colors not showing in fill picker).
export function getColorSemanticScopes(_figmaName: string): string[] {
  return ["ALL_SCOPES"];
}

export function getColorPrimitiveScopes(): string[] {
  // Primitives are hidden from publishing, so use ALL_SCOPES for maximum flexibility
  return ["ALL_SCOPES"];
}

const TYPOGRAPHY_GROUP_SCOPES: Record<string, string[]> = {
  "fontSize":   ["FONT_SIZE"],
  "lineHeight": ["LINE_HEIGHT"],
  "fontWeight": ["FONT_WEIGHT"],
  "fontFamily": ["FONT_FAMILY"],
};

export function getTypographyScopes(figmaName: string): string[] {
  const group = figmaName.split("/")[1];
  return TYPOGRAPHY_GROUP_SCOPES[group] ?? [];
}

export function getSpacingScopes(): string[] {
  return ["GAP"];
}

export function getRadiusScopes(): string[] {
  return ["CORNER_RADIUS"];
}

export function getAssetScopes(): string[] {
  return ["WIDTH_HEIGHT"];
}
