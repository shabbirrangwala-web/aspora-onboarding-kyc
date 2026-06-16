// ---------------------------------------------------------------------------
// Spacing Foundation Sync — 12 FLOAT variables
// ---------------------------------------------------------------------------

import { parseSpacingPrimitives } from "../token-parser";
import { upsertVariable, buildTokenPathIndex } from "../upsert";
import { findOrCreateCollection } from "../collections";
import { getSpacingScopes } from "../config/scopes";

import spacingJson from "@foundations/spacing/primitives.json";

export interface SpacingSyncResult {
  variables: number;
}

export async function syncSpacing(): Promise<SpacingSyncResult> {
  const tokens = parseSpacingPrimitives(spacingJson);

  const collection = await findOrCreateCollection("Spacing");

  const existingVars = await figma.variables.getLocalVariablesAsync("FLOAT");
  const index = buildTokenPathIndex(
    existingVars.filter((v: any) => v.variableCollectionId === collection.id),
  );

  const scopes = getSpacingScopes();
  for (const token of tokens) {
    upsertVariable({
      tokenPath: token.tokenPath,
      figmaName: token.figmaName,
      value: token.value,
      resolveType: "FLOAT",
      collection,
      scopes,
      existingIndex: index,
    });
  }

  return {
    variables: tokens.length,
  };
}
