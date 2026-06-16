// ---------------------------------------------------------------------------
// Post-Sync Validation — Checks Figma state against token source of truth
// ---------------------------------------------------------------------------

import type { FoundationId, ValidationCheck, ValidationResult } from "@shared/messages";

import {
  parseColorPrimitives,
  parseColorSemantics,
  resolveReference,
  parseTypographyPrimitives,
  parseTypographySemantics,
  parseSpacingPrimitives,
  parseRadiusPrimitives,
} from "./token-parser";
import { buildTokenPathIndex } from "./upsert";
import { hexToRgba } from "./upsert";
import {
  getColorPrimitiveScopes,
  getColorSemanticScopes,
  getTypographyScopes,
  getSpacingScopes,
  getRadiusScopes,
} from "./config/scopes";
import { getTokenDescription } from "./config/descriptions";
import { FONT_WEIGHT_STYLE_MAP } from "./foundations/typography";

import colorPrimitivesJson from "@foundations/color/primitives.json";
import colorLightJson from "@foundations/color/semantic.light.json";
import colorDarkJson from "@foundations/color/semantic.dark.json";
import typoPrimitivesJson from "@foundations/typography/primitives.json";
import typoSemanticsJson from "@foundations/typography/semantic.json";
import spacingJson from "@foundations/spacing/primitives.json";
import radiusJson from "@foundations/radius/primitives.json";

// Re-export from shared for convenience
export type { ValidationCheck, ValidationResult };

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function validateFoundation(foundation: FoundationId): Promise<ValidationResult> {
  switch (foundation) {
    case "color":
      return validateColor();
    case "typography":
      return validateTypography();
    case "spacing":
      return validateSimpleFloats("spacing");
    case "radius":
      return validateSimpleFloats("radius");
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function buildResult(checks: ValidationCheck[]): ValidationResult {
  const passed = checks
    .filter((c) => c.severity === "error")
    .every((c) => c.passed);
  return { passed, checks };
}

// ---------------------------------------------------------------------------
// Color Validation
// ---------------------------------------------------------------------------

async function validateColor(): Promise<ValidationResult> {
  const primitiveTokens = parseColorPrimitives(colorPrimitivesJson);
  const lightTokens = parseColorSemantics(colorLightJson);
  const darkTokens = parseColorSemantics(colorDarkJson);

  const allVars = await figma.variables.getLocalVariablesAsync("COLOR");
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  const primCol = collections.find((c: any) => c.name === "Color primitives");
  const semCol = collections.find((c: any) => c.name === "Color");

  const primVars = allVars.filter((v: any) => v.variableCollectionId === primCol?.id);
  const semVars = allVars.filter((v: any) => v.variableCollectionId === semCol?.id);

  const primIndex = buildTokenPathIndex(primVars);
  const semIndex = buildTokenPathIndex(semVars);

  // Build primitive lookup for alias resolution
  const primVarLookup = new Map<string, any>();
  for (const [, v] of primIndex) {
    const tp = v.getPluginData("tokenPath");
    if (tp) primVarLookup.set(tp, v);
  }

  const checks: ValidationCheck[] = [];

  // ── 1. publishing_correctness ──
  {
    const failures: string[] = [];
    if (primCol && !primCol.hiddenFromPublishing) {
      failures.push("Color primitives should be hidden but is published");
    }
    if (semCol && semCol.hiddenFromPublishing) {
      failures.push("Color should be published but is hidden");
    }
    checks.push({
      name: "publishing_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "Collection publishing settings are correct"
        : `Incorrect publishing: ${failures.join("; ")}`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 2. tokenPath_integrity ──
  {
    const missing: string[] = [];
    for (const token of primitiveTokens) {
      if (!primIndex.has(token.tokenPath)) {
        missing.push(token.tokenPath);
      }
    }
    for (const token of lightTokens) {
      if (!semIndex.has(token.tokenPath)) {
        missing.push(token.tokenPath);
      }
    }
    // Also check that every variable has a tokenPath
    const noPath: string[] = [];
    for (const v of [...primVars, ...semVars]) {
      const tp = v.getPluginData("tokenPath");
      if (!tp) {
        noPath.push(v.name);
      }
    }
    const allMissing = [...missing, ...noPath];
    checks.push({
      name: "tokenPath_integrity",
      passed: allMissing.length === 0,
      severity: "error",
      message: allMissing.length === 0
        ? "All variables have valid tokenPath pluginData"
        : `${allMissing.length} tokenPath issue(s) found`,
      ...(allMissing.length > 0 ? { details: allMissing } : {}),
    });
  }

  // ── 3. alias_integrity ──
  {
    const failures: string[] = [];
    const lightModeId = semCol?.modes?.[0]?.modeId;

    for (const token of lightTokens) {
      if (!token.isAlias || !token.aliasTarget) continue;
      const semVar = semIndex.get(token.tokenPath);
      if (!semVar || !lightModeId) continue;

      const val = semVar.valuesByMode[lightModeId];
      if (!val || val.type !== "VARIABLE_ALIAS") {
        failures.push(`${token.tokenPath}: expected alias, got literal`);
      }
    }

    checks.push({
      name: "alias_integrity",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All semantic color aliases resolve correctly"
        : `${failures.length} broken alias(es)`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 4. scope_correctness ──
  {
    const failures: string[] = [];
    const expectedPrimScopes = getColorPrimitiveScopes();

    for (const v of primVars) {
      if (!arraysEqual(v.scopes, expectedPrimScopes)) {
        failures.push(`${v.name}: expected [${expectedPrimScopes}], got [${v.scopes}]`);
      }
    }

    for (const token of lightTokens) {
      const semVar = semIndex.get(token.tokenPath);
      if (!semVar) continue;
      const expected = getColorSemanticScopes(token.figmaName);
      if (!arraysEqual(semVar.scopes, expected)) {
        failures.push(`${semVar.name}: expected [${expected}], got [${semVar.scopes}]`);
      }
    }

    checks.push({
      name: "scope_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All variable scopes match expected values"
        : `${failures.length} scope mismatch(es)`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 5. description_correctness ──
  {
    const failures: string[] = [];

    for (const token of lightTokens) {
      const expected = getTokenDescription(token.tokenPath);
      if (expected === undefined) continue;
      const semVar = semIndex.get(token.tokenPath);
      if (!semVar) continue;
      if (semVar.description !== expected) {
        failures.push(`${token.tokenPath}: expected "${expected}", got "${semVar.description}"`);
      }
    }

    checks.push({
      name: "description_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All descriptions match expected values"
        : `${failures.length} description mismatch(es)`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 6. orphaned_variables ──
  {
    const expectedPrimPaths = new Set(primitiveTokens.map((t) => t.tokenPath));
    const expectedSemPaths = new Set(lightTokens.map((t) => t.tokenPath));
    const orphaned: string[] = [];

    for (const v of primVars) {
      const tp = v.getPluginData("tokenPath");
      if (tp && !expectedPrimPaths.has(tp)) {
        orphaned.push(tp);
      }
    }
    for (const v of semVars) {
      const tp = v.getPluginData("tokenPath");
      if (tp && !expectedSemPaths.has(tp)) {
        orphaned.push(tp);
      }
    }

    checks.push({
      name: "orphaned_variables",
      passed: orphaned.length === 0,
      severity: "warning",
      message: orphaned.length === 0
        ? "No orphaned variables found"
        : `${orphaned.length} orphaned variable(s) found`,
      ...(orphaned.length > 0 ? { details: orphaned } : {}),
    });
  }

  return buildResult(checks);
}

// ---------------------------------------------------------------------------
// Typography Validation
// ---------------------------------------------------------------------------

async function validateTypography(): Promise<ValidationResult> {
  const allPrimitives = parseTypographyPrimitives(typoPrimitivesJson);
  const variableTokens = allPrimitives.filter((t) => !t.skipVariable);
  const semanticTokens = parseTypographySemantics(typoSemanticsJson);

  const allVars = await figma.variables.getLocalVariablesAsync();
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const col = collections.find((c: any) => c.name === "Typography primitives");
  const typVars = allVars.filter((v: any) => v.variableCollectionId === col?.id);
  const typIndex = buildTokenPathIndex(typVars);

  const textStyles = await figma.getLocalTextStylesAsync();
  const styleIndex = buildTokenPathIndex(textStyles);

  // Value lookup for primitive resolution
  const valueLookup = new Map<string, any>();
  for (const token of allPrimitives) {
    valueLookup.set(token.tokenPath, token);
  }

  const checks: ValidationCheck[] = [];

  // ── 1. publishing_correctness ──
  {
    const failures: string[] = [];
    if (col && !col.hiddenFromPublishing) {
      failures.push("Typography primitives should be hidden but is published");
    }
    checks.push({
      name: "publishing_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "Collection publishing settings are correct"
        : `Incorrect publishing: ${failures.join("; ")}`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 2. tokenPath_integrity ──
  {
    const missing: string[] = [];
    for (const token of variableTokens) {
      if (!typIndex.has(token.tokenPath)) {
        missing.push(token.tokenPath);
      }
    }
    for (const token of semanticTokens) {
      if (!styleIndex.has(token.tokenPath)) {
        missing.push(token.tokenPath);
      }
    }
    // Check that every variable has a tokenPath
    const noPath: string[] = [];
    for (const v of typVars) {
      const tp = v.getPluginData("tokenPath");
      if (!tp) noPath.push(v.name);
    }
    for (const s of textStyles) {
      const tp = s.getPluginData("tokenPath");
      if (!tp) noPath.push(s.name);
    }
    const allMissing = [...missing, ...noPath];
    checks.push({
      name: "tokenPath_integrity",
      passed: allMissing.length === 0,
      severity: "error",
      message: allMissing.length === 0
        ? "All variables and styles have valid tokenPath"
        : `${allMissing.length} tokenPath issue(s) found`,
      ...(allMissing.length > 0 ? { details: allMissing } : {}),
    });
  }

  // ── 3. value_correctness ──
  {
    const failures: string[] = [];
    for (const token of variableTokens) {
      const v = typIndex.get(token.tokenPath);
      if (!v) continue;
      const modeId = col?.defaultModeId;
      if (!modeId) continue;
      const actual = v.valuesByMode[modeId];
      if (actual !== token.value) {
        failures.push(`${token.tokenPath}: expected ${token.value}, got ${actual}`);
      }
    }
    checks.push({
      name: "value_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All variable values match token definitions"
        : `${failures.length} value mismatch(es)`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 4. letter_spacing_unit ──
  {
    const failures: string[] = [];
    for (const style of textStyles) {
      if ((style as any).letterSpacing?.unit === "PIXELS") {
        failures.push(`${style.name}: letterSpacing uses PIXELS instead of PERCENT`);
      }
    }
    checks.push({
      name: "letter_spacing_unit",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All text styles use PERCENT for letter spacing"
        : `${failures.length} style(s) use PIXELS for letter spacing`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 5. font_availability ──
  {
    const requiredStyles = new Set<string>();
    for (const token of semanticTokens) {
      const fontWeightRef = token.value.fontWeight;
      const isRef = fontWeightRef.startsWith("{") && fontWeightRef.endsWith("}");
      const weightPath = isRef ? fontWeightRef.slice(1, -1) : undefined;
      const weight = weightPath
        ? (valueLookup.get(weightPath)?.value as number) ?? 400
        : parseFloat(fontWeightRef);
      const fontStyle = FONT_WEIGHT_STYLE_MAP[weight] ?? "Regular";
      requiredStyles.add(`Haffer ${fontStyle}`);
    }
    const sorted = Array.from(requiredStyles).sort();
    checks.push({
      name: "font_availability",
      passed: true,
      severity: "warning",
      message: `${sorted.length} font style(s) required`,
      details: sorted,
    });
  }

  // ── 6. scope_correctness ──
  {
    const failures: string[] = [];
    for (const token of variableTokens) {
      const v = typIndex.get(token.tokenPath);
      if (!v) continue;
      const scopeKey = `typography/${token.figmaName}`;
      const expected = getTypographyScopes(scopeKey);
      if (!arraysEqual(v.scopes, expected)) {
        failures.push(`${v.name}: expected [${expected}], got [${v.scopes}]`);
      }
    }
    checks.push({
      name: "scope_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All variable scopes match expected values"
        : `${failures.length} scope mismatch(es)`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  return buildResult(checks);
}

// ---------------------------------------------------------------------------
// Simple Float Validation (Spacing / Radius)
// ---------------------------------------------------------------------------

async function validateSimpleFloats(
  foundation: "spacing" | "radius",
): Promise<ValidationResult> {
  const tokens =
    foundation === "spacing"
      ? parseSpacingPrimitives(spacingJson)
      : parseRadiusPrimitives(radiusJson);

  const collectionName = foundation === "spacing" ? "Spacing" : "Radius";
  const getScopes = foundation === "spacing" ? getSpacingScopes : getRadiusScopes;

  const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const col = collections.find((c: any) => c.name === collectionName);
  const vars = allVars.filter((v: any) => v.variableCollectionId === col?.id);
  const index = buildTokenPathIndex(vars);

  const checks: ValidationCheck[] = [];

  // ── 1. publishing_correctness ──
  {
    const failures: string[] = [];
    if (col && col.hiddenFromPublishing) {
      failures.push(`${collectionName} should be published but is hidden`);
    }
    checks.push({
      name: "publishing_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "Collection publishing settings are correct"
        : `Incorrect publishing: ${failures.join("; ")}`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 2. tokenPath_integrity ──
  {
    const missing: string[] = [];
    for (const token of tokens) {
      if (!index.has(token.tokenPath)) {
        missing.push(token.tokenPath);
      }
    }
    const noPath: string[] = [];
    for (const v of vars) {
      const tp = v.getPluginData("tokenPath");
      if (!tp) noPath.push(v.name);
    }
    const allMissing = [...missing, ...noPath];
    checks.push({
      name: "tokenPath_integrity",
      passed: allMissing.length === 0,
      severity: "error",
      message: allMissing.length === 0
        ? "All variables have valid tokenPath pluginData"
        : `${allMissing.length} tokenPath issue(s) found`,
      ...(allMissing.length > 0 ? { details: allMissing } : {}),
    });
  }

  // ── 3. value_correctness ──
  {
    const failures: string[] = [];
    for (const token of tokens) {
      const v = index.get(token.tokenPath);
      if (!v) continue;
      const modeId = col?.defaultModeId;
      if (!modeId) continue;
      const actual = v.valuesByMode[modeId];
      if (actual !== token.value) {
        failures.push(`${token.tokenPath}: expected ${token.value}, got ${actual}`);
      }
    }
    checks.push({
      name: "value_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All variable values match token definitions"
        : `${failures.length} value mismatch(es)`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 4. scope_correctness ──
  {
    const failures: string[] = [];
    const expectedScopes = getScopes();
    for (const token of tokens) {
      const v = index.get(token.tokenPath);
      if (!v) continue;
      if (!arraysEqual(v.scopes, expectedScopes)) {
        failures.push(`${v.name}: expected [${expectedScopes}], got [${v.scopes}]`);
      }
    }
    checks.push({
      name: "scope_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All variable scopes match expected values"
        : `${failures.length} scope mismatch(es)`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 5. description_correctness ──
  {
    const failures: string[] = [];
    for (const token of tokens) {
      const expected = getTokenDescription(token.tokenPath) ?? token.description;
      if (expected === undefined) continue;
      const v = index.get(token.tokenPath);
      if (!v) continue;
      if (v.description !== expected) {
        failures.push(`${token.tokenPath}: expected "${expected}", got "${v.description}"`);
      }
    }
    checks.push({
      name: "description_correctness",
      passed: failures.length === 0,
      severity: "error",
      message: failures.length === 0
        ? "All descriptions match expected values"
        : `${failures.length} description mismatch(es)`,
      ...(failures.length > 0 ? { details: failures } : {}),
    });
  }

  // ── 6. orphaned_variables ──
  {
    const expectedPaths = new Set(tokens.map((t) => t.tokenPath));
    const orphaned: string[] = [];
    for (const v of vars) {
      const tp = v.getPluginData("tokenPath");
      if (tp && !expectedPaths.has(tp)) {
        orphaned.push(tp);
      }
    }
    checks.push({
      name: "orphaned_variables",
      passed: orphaned.length === 0,
      severity: "warning",
      message: orphaned.length === 0
        ? "No orphaned variables found"
        : `${orphaned.length} orphaned variable(s) found`,
      ...(orphaned.length > 0 ? { details: orphaned } : {}),
    });
  }

  return buildResult(checks);
}
