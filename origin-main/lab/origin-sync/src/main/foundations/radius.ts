// ---------------------------------------------------------------------------
// Radius Foundation Sync — 8 FLOAT variables
// ---------------------------------------------------------------------------

import { parseRadiusPrimitives } from "../token-parser";
import { upsertVariable, buildTokenPathIndex } from "../upsert";
import { findOrCreateCollection } from "../collections";
import { getRadiusScopes } from "../config/scopes";
import { getTokenDescription } from "../config/descriptions";

import radiusJson from "@foundations/radius/primitives.json";

export interface RadiusSyncResult {
  variables: number;
}

export async function syncRadius(): Promise<RadiusSyncResult> {
  const tokens = parseRadiusPrimitives(radiusJson);

  const collection = await findOrCreateCollection("Radius");

  const existingVars = await figma.variables.getLocalVariablesAsync("FLOAT");
  const index = buildTokenPathIndex(
    existingVars.filter((v: any) => v.variableCollectionId === collection.id),
  );

  const scopes = getRadiusScopes();
  for (const token of tokens) {
    const description = getTokenDescription(token.tokenPath) ?? token.description;
    upsertVariable({
      tokenPath: token.tokenPath,
      figmaName: token.figmaName,
      value: token.value,
      resolveType: "FLOAT",
      collection,
      scopes,
      description,
      existingIndex: index,
    });
  }

  return {
    variables: tokens.length,
  };
}
