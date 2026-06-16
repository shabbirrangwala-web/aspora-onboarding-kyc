// ---------------------------------------------------------------------------
// Color Foundation Sync — Primitives + Semantics (Light/Dark)
// ---------------------------------------------------------------------------

import {
  parseColorPrimitives,
  parseColorSemantics,
  resolveReference,
} from "../token-parser";
import { upsertVariable, buildTokenPathIndex, type UpsertResult } from "../upsert";
import { findOrCreateCollection, ensureModes } from "../collections";
import { getColorPrimitiveScopes, getColorSemanticScopes } from "../config/scopes";
import { getTokenDescription } from "../config/descriptions";

import colorPrimitivesJson from "@foundations/color/primitives.json";
import colorLightJson from "@foundations/color/semantic.light.json";
import colorDarkJson from "@foundations/color/semantic.dark.json";

export interface ColorSyncResult {
  primitives: number;
  semantics: number;
  created: number;
  updated: number;
  renamed: number;
}

// Color system revision rename map: oldTokenPath → newTokenPath
// Used to rename Figma variables in place, preserving references.
// Variables in Figma that have no entry here AND no matching current token
// become stale orphans — untouched by sync, not deleted (per repo convention).
// `color.border.strong` falls into this category as of 2026-04-15.
const COLOR_RENAME_MAP: Record<string, string> = {
  // Status/accent rename (2026-03-25 color system revision)
  "color.info.base": "color.accent.solid",
  "color.info.subtle": "color.accent.light",
  "color.info.text": "color.accent.on-light",
  "color.info.border": "color.accent.border",
  "color.error.base": "color.error.solid",
  "color.error.subtle": "color.error.light",
  "color.error.text": "color.error.on-light",
  "color.success.base": "color.success.solid",
  "color.success.subtle": "color.success.light",
  "color.success.text": "color.success.on-light",
  "color.warning.base": "color.warning.solid",
  "color.warning.subtle": "color.warning.light",
  "color.warning.text": "color.warning.on-light",
  // Surface/border ordinal rename (2026-04-15)
  "color.surface.base": "color.surface.primary",
  "color.surface.raised": "color.surface.secondary",
  "color.surface.sunken": "color.surface.tertiary",
  "color.border.subtle": "color.border.primary",
  "color.border.default": "color.border.secondary",
};

// Invert the map: upsertVariable expects newTokenPath → oldTokenPath
function invertMap(map: Record<string, string>): Record<string, string> {
  const inv: Record<string, string> = {};
  for (const [oldPath, newPath] of Object.entries(map)) {
    inv[newPath] = oldPath;
  }
  return inv;
}

export async function syncColor(): Promise<ColorSyncResult> {
  const reverseRenames = invertMap(COLOR_RENAME_MAP);

  // ── 1. Parse tokens ──
  const primitiveTokens = parseColorPrimitives(colorPrimitivesJson);
  const lightTokens = parseColorSemantics(colorLightJson);
  const darkTokens = parseColorSemantics(colorDarkJson);

  // ── 2. Collections ──
  const primCollection = await findOrCreateCollection("Color primitives", { hidden: true });
  const semCollection = await findOrCreateCollection("Color");
  const { lightModeId, darkModeId } = await ensureModes(semCollection, "Light", "Dark");

  // ── 3. Build existing index for primitives ──
  const existingPrimVars = await figma.variables.getLocalVariablesAsync("COLOR");
  const primIndex = buildTokenPathIndex(
    existingPrimVars.filter((v: any) => v.variableCollectionId === primCollection.id),
  );

  // ── 4. Upsert primitive variables ──
  const primScopes = getColorPrimitiveScopes();
  for (const token of primitiveTokens) {
    upsertVariable({
      tokenPath: token.tokenPath,
      figmaName: token.figmaName,
      value: token.value,
      resolveType: "COLOR",
      collection: primCollection,
      scopes: primScopes,
      description: token.description,
      existingIndex: primIndex,
    });
  }

  // ── 5. Build primitive variable lookup for alias resolution ──
  const primVarLookup = new Map<string, any>();
  for (const [, v] of primIndex) {
    const tp = v.getPluginData("tokenPath");
    if (tp) primVarLookup.set(tp, v);
  }

  // ── 6. Build existing index for semantics ──
  const allColorVars = await figma.variables.getLocalVariablesAsync("COLOR");
  const semIndex = buildTokenPathIndex(
    allColorVars.filter((v: any) => v.variableCollectionId === semCollection.id),
  );

  // ── 7. Upsert semantic variables with cross-collection aliases ──
  const counts = { created: 0, updated: 0, renamed: 0 };
  for (const lightToken of lightTokens) {
    const darkToken = darkTokens.find((d) => d.tokenPath === lightToken.tokenPath);

    // Resolve light alias target
    const lightAlias = lightToken.isAlias && lightToken.aliasTarget
      ? primVarLookup.get(lightToken.aliasTarget)
      : undefined;

    // Resolve dark alias target
    const darkAlias = darkToken?.isAlias && darkToken.aliasTarget
      ? primVarLookup.get(darkToken.aliasTarget)
      : undefined;

    const lightValue = lightAlias
      ? figma.variables.createVariableAlias(lightAlias)
      : lightToken.value;

    const darkValue = darkAlias
      ? figma.variables.createVariableAlias(darkAlias)
      : darkToken?.value ?? lightToken.value;

    // Get scopes and description
    const scopes = getColorSemanticScopes(lightToken.figmaName);
    const description = getTokenDescription(lightToken.tokenPath);

    // Upsert for light mode
    const result = upsertVariable({
      tokenPath: lightToken.tokenPath,
      figmaName: lightToken.figmaName,
      value: lightValue,
      resolveType: "COLOR",
      collection: semCollection,
      modeId: lightModeId,
      scopes,
      description,
      existingIndex: semIndex,
      reverseRenames,
    });
    if (result.status === "created") counts.created++;
    else if (result.status === "updated") counts.updated++;
    else if (result.status === "renamed") counts.renamed++;

    // Set dark mode value on the same variable
    const semVar = semIndex.get(lightToken.tokenPath);
    if (semVar) {
      semVar.setValueForMode(darkModeId, darkValue);
    }
  }

  return {
    primitives: primitiveTokens.length,
    semantics: lightTokens.length,
    ...counts,
  };
}
