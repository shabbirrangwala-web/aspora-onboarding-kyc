// ---------------------------------------------------------------------------
// DTCG Token Parser — Pure functions, no Figma dependency
// ---------------------------------------------------------------------------

export interface PrimitiveToken {
  tokenPath: string;
  figmaName: string;
  value: string | number;
  type: "COLOR" | "FLOAT" | "STRING";
  description?: string;
  unit?: string;
  skipVariable?: boolean;
}

export interface SemanticColorToken {
  tokenPath: string;
  figmaName: string;
  value: string;
  type: "COLOR";
  isAlias: boolean;
  aliasTarget?: string;
}

export interface TypographySemanticToken {
  tokenPath: string;
  figmaName: string;
  value: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
  };
  extensions?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Reference utilities
// ---------------------------------------------------------------------------

export function isReference(value: string): boolean {
  return value.startsWith("{") && value.endsWith("}");
}

export function resolveReference(ref: string): string {
  return ref.slice(1, -1);
}

// ---------------------------------------------------------------------------
// Naming helpers — sentence case for Figma style names
// ---------------------------------------------------------------------------

// "label-heavy" → "Label heavy", "display" → "Display", "number" → "Number"
function sentenceCase(s: string): string {
  const words = s.split("-");
  return words
    .map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

// Size token name expansion: "s" → "Small", "m" → "Medium", etc.
const SIZE_NAMES: Record<string, string> = {
  s: "Small",
  m: "Medium",
  l: "Large",
};

// "display-s" → "Display small", "standard" → "Standard"
function expandTokenName(name: string): string {
  // Check for compound names like "display-s", "display-m", "display-l"
  const dashIdx = name.lastIndexOf("-");
  if (dashIdx > 0) {
    const suffix = name.slice(dashIdx + 1);
    if (SIZE_NAMES[suffix]) {
      const prefix = name.slice(0, dashIdx);
      return `${sentenceCase(prefix)} ${SIZE_NAMES[suffix].toLowerCase()}`;
    }
  }
  // Simple size names
  if (SIZE_NAMES[name]) return SIZE_NAMES[name];
  // Everything else: sentence case
  return sentenceCase(name);
}

// ---------------------------------------------------------------------------
// Color primitives
// ---------------------------------------------------------------------------

export function parseColorPrimitives(json: Record<string, unknown>): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const colorGroup = json.color as Record<string, unknown>;

  for (const [rampName, rampValue] of Object.entries(colorGroup)) {
    if (rampName.startsWith("$")) continue;
    const ramp = rampValue as Record<string, unknown>;

    for (const [step, stepValue] of Object.entries(ramp)) {
      if (step.startsWith("$")) continue;
      const entry = stepValue as Record<string, unknown>;

      tokens.push({
        tokenPath: `color.${rampName}.${step}`,
        figmaName: `${rampName}/${step}`,
        value: entry.$value as string,
        type: "COLOR",
        ...(entry.$description ? { description: entry.$description as string } : {}),
      });
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Color Semantics
// ---------------------------------------------------------------------------

export function parseColorSemantics(json: Record<string, unknown>): SemanticColorToken[] {
  const tokens: SemanticColorToken[] = [];
  const colorGroup = json.color as Record<string, unknown>;

  for (const [groupName, groupValue] of Object.entries(colorGroup)) {
    if (groupName.startsWith("$")) continue;
    const group = groupValue as Record<string, unknown>;

    for (const [tokenName, tokenValue] of Object.entries(group)) {
      if (tokenName.startsWith("$")) continue;
      const entry = tokenValue as Record<string, unknown>;
      const rawValue = entry.$value as string;
      const alias = isReference(rawValue);

      tokens.push({
        tokenPath: `color.${groupName}.${tokenName}`,
        figmaName: `${groupName}/${tokenName}`,
        value: rawValue,
        type: "COLOR",
        isAlias: alias,
        ...(alias ? { aliasTarget: resolveReference(rawValue) } : {}),
      });
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Typography primitives
// ---------------------------------------------------------------------------

function parseDimensionValue(raw: string): { value: number; unit?: string; skipVariable?: boolean } {
  if (raw.endsWith("%")) {
    const num = parseFloat(raw.slice(0, -1));
    return { value: num, unit: "PERCENT", skipVariable: true };
  }
  if (raw.endsWith("px")) {
    return { value: parseFloat(raw.slice(0, -2)) };
  }
  return { value: parseFloat(raw) };
}

export function parseTypographyPrimitives(json: Record<string, unknown>): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const typoGroup = json.typography as Record<string, unknown>;

  for (const [categoryName, categoryValue] of Object.entries(typoGroup)) {
    if (categoryName.startsWith("$")) continue;
    const category = categoryValue as Record<string, unknown>;
    const categoryType = category.$type as string | undefined;

    for (const [tokenName, tokenValue] of Object.entries(category)) {
      if (tokenName.startsWith("$")) continue;
      const entry = tokenValue as Record<string, unknown>;
      const rawValue = entry.$value;

      if (categoryType === "fontFamily") {
        tokens.push({
          tokenPath: `typography.${categoryName}.${tokenName}`,
          figmaName: `${categoryName}/${tokenName}`,
          value: rawValue as string,
          type: "STRING",
        });
      } else if (categoryType === "fontWeight") {
        tokens.push({
          tokenPath: `typography.${categoryName}.${tokenName}`,
          figmaName: `${categoryName}/${tokenName}`,
          value: rawValue as number,
          type: "FLOAT",
        });
      } else {
        // dimension: fontSize, lineHeight, letterSpacing
        const parsed = parseDimensionValue(rawValue as string);
        tokens.push({
          tokenPath: `typography.${categoryName}.${tokenName}`,
          figmaName: `${categoryName}/${tokenName}`,
          value: parsed.value,
          type: "FLOAT",
          ...(parsed.unit ? { unit: parsed.unit } : {}),
          ...(parsed.skipVariable ? { skipVariable: parsed.skipVariable } : {}),
        });
      }
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Typography Semantics
// ---------------------------------------------------------------------------

export function parseTypographySemantics(json: Record<string, unknown>): TypographySemanticToken[] {
  const tokens: TypographySemanticToken[] = [];
  const typoGroup = json.typography as Record<string, unknown>;

  for (const [groupName, groupValue] of Object.entries(typoGroup)) {
    if (groupName.startsWith("$")) continue;
    const group = groupValue as Record<string, unknown>;

    for (const [tokenName, tokenValue] of Object.entries(group)) {
      if (tokenName.startsWith("$")) continue;
      const entry = tokenValue as Record<string, unknown>;
      const composite = entry.$value as Record<string, string>;
      const extensions = entry.$extensions as Record<string, unknown> | undefined;
      const originExt = extensions?.["tech.vance.origin"] as Record<string, unknown> | undefined;

      tokens.push({
        tokenPath: `typography.${groupName}.${tokenName}`,
        figmaName: `${sentenceCase(groupName)}/${expandTokenName(tokenName)}`,
        value: {
          fontFamily: composite.fontFamily,
          fontSize: composite.fontSize,
          fontWeight: composite.fontWeight,
          lineHeight: composite.lineHeight,
          letterSpacing: composite.letterSpacing,
        },
        ...(originExt ? { extensions: originExt } : {}),
      });
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Spacing Primitives
// ---------------------------------------------------------------------------

export function parseSpacingPrimitives(json: Record<string, unknown>): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const spacingGroup = json.spacing as Record<string, unknown>;

  for (const [tokenName, tokenValue] of Object.entries(spacingGroup)) {
    if (tokenName.startsWith("$")) continue;
    const entry = tokenValue as Record<string, unknown>;
    const parsed = parseDimensionValue(entry.$value as string);

    tokens.push({
      tokenPath: `spacing.${tokenName}`,
      figmaName: tokenName,
      value: parsed.value,
      type: "FLOAT",
    });
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Asset Primitives
// ---------------------------------------------------------------------------

export function parseAssetPrimitives(json: Record<string, unknown>): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const assetGroup = json.asset as Record<string, unknown>;

  for (const [tokenName, tokenValue] of Object.entries(assetGroup)) {
    if (tokenName.startsWith("$")) continue;
    const entry = tokenValue as Record<string, unknown>;
    const parsed = parseDimensionValue(entry.$value as string);

    tokens.push({
      tokenPath: `asset.${tokenName}`,
      figmaName: tokenName,
      value: parsed.value,
      type: "FLOAT",
      ...(entry.$description ? { description: entry.$description as string } : {}),
    });
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Radius Primitives
// ---------------------------------------------------------------------------

export function parseRadiusPrimitives(json: Record<string, unknown>): PrimitiveToken[] {
  const tokens: PrimitiveToken[] = [];
  const radiusGroup = json.radius as Record<string, unknown>;

  for (const [tokenName, tokenValue] of Object.entries(radiusGroup)) {
    if (tokenName.startsWith("$")) continue;
    const entry = tokenValue as Record<string, unknown>;
    const parsed = parseDimensionValue(entry.$value as string);

    tokens.push({
      tokenPath: `radius.${tokenName}`,
      figmaName: tokenName,
      value: parsed.value,
      type: "FLOAT",
      ...(entry.$description ? { description: entry.$description as string } : {}),
    });
  }

  return tokens;
}
