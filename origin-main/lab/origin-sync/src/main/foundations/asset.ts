// ---------------------------------------------------------------------------
// Asset Foundation Sync — 6 FLOAT variables (icon/media sizing)
// ---------------------------------------------------------------------------

import { parseAssetPrimitives } from "../token-parser";
import { upsertVariable, buildTokenPathIndex } from "../upsert";
import { findOrCreateCollection } from "../collections";
import { getAssetScopes } from "../config/scopes";

import assetJson from "@foundations/asset/primitives.json";

export interface AssetSyncResult {
  variables: number;
}

export async function syncAsset(): Promise<AssetSyncResult> {
  const tokens = parseAssetPrimitives(assetJson);

  const collection = await findOrCreateCollection("Asset");

  const existingVars = await figma.variables.getLocalVariablesAsync("FLOAT");
  const index = buildTokenPathIndex(
    existingVars.filter((v: any) => v.variableCollectionId === collection.id),
  );

  const scopes = getAssetScopes();
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
