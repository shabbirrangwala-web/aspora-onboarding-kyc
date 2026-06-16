// ---------------------------------------------------------------------------
// Upsert Engine — Creates or updates Figma variables and text styles.
// ---------------------------------------------------------------------------

export interface UpsertResult {
  status: "created" | "updated" | "renamed" | "unchanged";
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Hex → RGBA conversion (6 or 8 digit hex to 0-1 range)
// ---------------------------------------------------------------------------

export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  const h = hex.replace(/^#/, "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

// ---------------------------------------------------------------------------
// Build index from existing Figma artifacts by tokenPath pluginData
// ---------------------------------------------------------------------------

export function buildTokenPathIndex<T extends { getPluginData(key: string): string }>(
  artifacts: T[],
): Map<string, T> {
  const index = new Map<string, T>();
  for (const artifact of artifacts) {
    const tp = artifact.getPluginData("tokenPath");
    if (tp) {
      index.set(tp, artifact);
    }
  }
  return index;
}

// ---------------------------------------------------------------------------
// Deep equality helper
// ---------------------------------------------------------------------------

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a == b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Upsert a single variable
// ---------------------------------------------------------------------------

export function upsertVariable(opts: {
  tokenPath: string;
  figmaName: string;
  value: any;
  resolveType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  collection: any;
  modeId?: string;
  scopes?: string[];
  description?: string;
  existingIndex: Map<string, any>;
  reverseRenames?: Record<string, string>;
}): UpsertResult {
  const {
    tokenPath,
    figmaName,
    value,
    resolveType,
    collection,
    scopes,
    description,
    existingIndex,
    reverseRenames,
  } = opts;
  const modeId = opts.modeId ?? collection.defaultModeId;

  // Resolve the value for COLOR types with hex strings
  const resolvedValue =
    resolveType === "COLOR" && typeof value === "string" && value.startsWith("#")
      ? hexToRgba(value)
      : value;

  // 1. Try direct tokenPath match
  const existing = existingIndex.get(tokenPath);
  if (existing) {
    let changed = false;

    if (existing.name !== figmaName) {
      existing.name = figmaName;
      changed = true;
    }

    const currentValue = existing.valuesByMode?.[modeId];
    if (!deepEqual(currentValue, resolvedValue)) {
      existing.setValueForMode(modeId, resolvedValue);
      changed = true;
    }

    if (scopes && !deepEqual(existing.scopes, scopes)) {
      existing.scopes = scopes;
      changed = true;
    }

    if (description !== undefined && existing.description !== description) {
      existing.description = description;
      changed = true;
    }

    return {
      status: changed ? "updated" : "unchanged",
      id: existing.id,
      name: figmaName,
    };
  }

  // 2. Try rename match via reverse rename map
  if (reverseRenames) {
    const oldPath = reverseRenames[tokenPath];
    if (oldPath) {
      const oldVar = existingIndex.get(oldPath);
      if (oldVar) {
        oldVar.name = figmaName;
        oldVar.setPluginData("tokenPath", tokenPath);
        oldVar.setValueForMode(modeId, resolvedValue);
        if (scopes) oldVar.scopes = scopes;
        if (description !== undefined) oldVar.description = description;

        // Update the index
        existingIndex.delete(oldPath);
        existingIndex.set(tokenPath, oldVar);

        return {
          status: "renamed",
          id: oldVar.id,
          name: figmaName,
        };
      }
    }
  }

  // 3. Create new variable
  const newVar = figma.variables.createVariable(figmaName, collection, resolveType);
  newVar.setPluginData("tokenPath", tokenPath);
  newVar.setValueForMode(modeId, resolvedValue);
  if (scopes) newVar.scopes = scopes;
  if (description !== undefined) newVar.description = description;

  existingIndex.set(tokenPath, newVar);

  return {
    status: "created",
    id: newVar.id,
    name: figmaName,
  };
}

// ---------------------------------------------------------------------------
// Upsert a single text style
// ---------------------------------------------------------------------------

export async function upsertTextStyle(opts: {
  tokenPath: string;
  figmaName: string;
  fontSize: number;
  lineHeight: { value: number; unit: "PIXELS" | "PERCENT" | "AUTO" };
  letterSpacing: { value: number; unit: "PERCENT" };
  fontName: { family: string; style: string };
  textCase?: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
  boundVariables?: Record<string, any>;
  existingIndex: Map<string, any>;
  reverseRenames?: Record<string, string>;
}): Promise<UpsertResult> {
  const {
    tokenPath,
    figmaName,
    fontSize,
    lineHeight,
    letterSpacing,
    fontName,
    textCase,
    boundVariables,
    existingIndex,
    reverseRenames,
  } = opts;

  // Try direct tokenPath match
  let style = existingIndex.get(tokenPath);
  let status: "created" | "updated" | "renamed" = "updated";

  // Try rename match
  if (!style && reverseRenames) {
    const oldPath = reverseRenames[tokenPath];
    if (oldPath) {
      style = existingIndex.get(oldPath);
      if (style) {
        existingIndex.delete(oldPath);
        existingIndex.set(tokenPath, style);
        status = "renamed";
      }
    }
  }

  // Create if new
  if (!style) {
    style = figma.createTextStyle();
    existingIndex.set(tokenPath, style);
    status = "created";
  }

  style.name = figmaName;
  style.setPluginData("tokenPath", tokenPath);

  // Load fonts before modifying text style properties.
  // Figma requires the current font to be loaded before any property changes,
  // and the target font to be loaded before setting fontName.
  try {
    // Load the style's current font first (defaults to Inter Regular for new styles)
    await figma.loadFontAsync(style.fontName);
  } catch {
    // If current font can't be loaded, try Inter Regular as fallback
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    } catch {
      // Continue anyway — may fail on property set
    }
  }

  // Load the target font
  try {
    await figma.loadFontAsync(fontName);
  } catch {
    // Will fail when setting fontName below — error surfaces to caller
  }

  style.fontSize = fontSize;
  style.lineHeight = lineHeight;
  style.letterSpacing = letterSpacing;
  style.fontName = fontName;
  if (textCase) style.textCase = textCase;

  // Bind variables if provided
  if (boundVariables) {
    for (const [property, variable] of Object.entries(boundVariables)) {
      style.setBoundVariable(property, variable);
    }
  }

  return {
    status,
    id: style.id,
    name: figmaName,
  };
}
