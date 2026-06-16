// ---------------------------------------------------------------------------
// Origin sync — Plugin main thread entry point
// ---------------------------------------------------------------------------

import type {
  PluginToUIMessage,
  UIToPluginMessage,
  FoundationId,
  FoundationStatus,
} from "@shared/messages";
import { syncColor } from "./foundations/color";
import { syncTypography } from "./foundations/typography";
import { syncSpacing } from "./foundations/spacing";
import { syncRadius } from "./foundations/radius";
import { syncAsset } from "./foundations/asset";
import { validateFoundation } from "./validate";

figma.showUI(__html__, { width: 400, height: 560, themeColors: true });

function send(msg: PluginToUIMessage): void {
  figma.ui.postMessage(msg);
}

async function getFoundationStatuses(): Promise<FoundationStatus[]> {
  const allVars = await figma.variables.getLocalVariablesAsync();
  const allStyles = await figma.getLocalTextStylesAsync();
  const cols = await figma.variables.getLocalVariableCollectionsAsync();

  // Count variables by collection name
  function countVarsInCollection(name: string): number {
    const col = cols.find((c: any) => c.name.toLowerCase() === name.toLowerCase());
    if (!col) return 0;
    return allVars.filter((v: any) => v.variableCollectionId === col.id).length;
  }

  // Count styles with tokenPaths matching a prefix
  function countStylesWithPrefix(prefix: string): number {
    return allStyles.filter((s: any) => {
      const tp = s.getPluginData("tokenPath");
      return tp && tp.startsWith(prefix);
    }).length;
  }

  // Color
  const colorPrimCount = countVarsInCollection("Color primitives");
  const colorSemCount = countVarsInCollection("Color");
  const colorTotal = colorPrimCount + colorSemCount;
  const colorExpected = 153 + 57;

  // Typography
  const typVarCount = countVarsInCollection("Typography primitives");
  const typStyleCount = countStylesWithPrefix("typography.");
  const typExpected = 30 + 25;

  // Spacing
  const spacingCount = countVarsInCollection("Spacing");

  // Radius
  const radiusCount = countVarsInCollection("Radius");

  // Asset
  const assetCount = countVarsInCollection("Asset");
  const assetExpected = 7;

  function makeStatus(
    foundation: FoundationId,
    actual: number,
    expected: number,
    varCount: number,
    styleCount: number,
  ): FoundationStatus {
    if (actual === 0) {
      return { foundation, status: "not_synced", summary: "Not synced", entries: [], variableCount: 0, styleCount: 0 };
    }
    if (actual >= expected) {
      return { foundation, status: "in_sync", summary: `${varCount} variables${styleCount ? `, ${styleCount} styles` : ""}`, entries: [], variableCount: varCount, styleCount };
    }
    return { foundation, status: "out_of_sync", summary: `${actual} of ${expected} synced`, entries: [], variableCount: varCount, styleCount };
  }

  return [
    makeStatus("color", colorTotal, colorExpected, colorPrimCount + colorSemCount, 0),
    makeStatus("typography", typVarCount + typStyleCount, typExpected, typVarCount, typStyleCount),
    makeStatus("spacing", spacingCount, 12, spacingCount, 0),
    makeStatus("radius", radiusCount, 8, radiusCount, 0),
    makeStatus("asset", assetCount, assetExpected, assetCount, 0),
  ];
}

async function syncFoundation(foundation: FoundationId): Promise<void> {
  send({ type: "SYNC_STARTED", foundation });

  try {
    switch (foundation) {
      case "color": {
        const result = await syncColor();
        send({
          type: "SYNC_COMPLETE",
          foundation,
          created: result.created,
          updated: result.updated,
          renamed: result.renamed,
          orphaned: 0,
        });
        break;
      }
      case "typography": {
        const result = await syncTypography();
        send({
          type: "SYNC_COMPLETE",
          foundation,
          created: result.variables + result.textStyles,
          updated: 0,
          renamed: 0,
          orphaned: 0,
        });
        break;
      }
      case "spacing": {
        const result = await syncSpacing();
        send({
          type: "SYNC_COMPLETE",
          foundation,
          created: result.variables,
          updated: 0,
          renamed: 0,
          orphaned: 0,
        });
        break;
      }
      case "radius": {
        const result = await syncRadius();
        send({
          type: "SYNC_COMPLETE",
          foundation,
          created: result.variables,
          updated: 0,
          renamed: 0,
          orphaned: 0,
        });
        break;
      }
      case "asset": {
        const result = await syncAsset();
        send({
          type: "SYNC_COMPLETE",
          foundation,
          created: result.variables,
          updated: 0,
          renamed: 0,
          orphaned: 0,
        });
        break;
      }
    }

    const validationResult = await validateFoundation(foundation);
    send({ type: "VALIDATION_RESULT", foundation, result: validationResult });
  } catch (e) {
    send({ type: "ERROR", message: `Sync failed for ${foundation}: ${e}` });
  }
}

figma.ui.onmessage = async (msg: UIToPluginMessage) => {
  switch (msg.type) {
    case "GET_STATUS": {
      const statuses = await getFoundationStatuses();
      send({ type: "STATUS", foundations: statuses });
      break;
    }
    case "SYNC":
      await syncFoundation(msg.foundation);
      break;
    case "SYNC_ALL":
      for (const f of ["color", "typography", "spacing", "radius", "asset"] as FoundationId[]) {
        await syncFoundation(f);
      }
      break;
    case "VALIDATE": {
      const result = await validateFoundation(msg.foundation);
      send({ type: "VALIDATION_RESULT", foundation: msg.foundation, result });
      break;
    }
    case "CANCEL":
      figma.closePlugin();
      break;
  }
};
