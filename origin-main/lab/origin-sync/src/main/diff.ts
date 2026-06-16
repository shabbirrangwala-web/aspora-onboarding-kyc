// ---------------------------------------------------------------------------
// Diff Engine — Compares code tokens against a Figma state snapshot.
// Pure function — no Figma API calls.
// ---------------------------------------------------------------------------

export interface CodeToken {
  tokenPath: string;
  figmaName: string;
  value: any;
  extensions?: any;
}

export interface FigmaVariableSnapshot {
  tokenPath: string;
  name: string;
  value: any;
  scopes?: string[];
  description?: string;
  modeValues?: Record<string, any>;
}

export interface FigmaTextStyleSnapshot {
  tokenPath: string;
  name: string;
  value: any;
  extensions?: any;
}

export interface FigmaSnapshot {
  variables: FigmaVariableSnapshot[];
  textStyles: FigmaTextStyleSnapshot[];
}

export interface DiffEntry {
  tokenPath: string;
  status: "new" | "changed" | "renamed" | "orphaned" | "in_sync";
  oldName?: string;
  newName?: string;
  oldValue?: any;
  newValue?: any;
}

export interface DiffSummary {
  total: number;
  new: number;
  changed: number;
  renamed: number;
  orphaned: number;
  inSync: number;
}

export interface DiffResult {
  entries: DiffEntry[];
  summary: DiffSummary;
}

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

export function computeDiff(
  codeTokens: CodeToken[],
  figmaState: FigmaSnapshot,
  renameMap?: Record<string, string>,
): DiffResult {
  const entries: DiffEntry[] = [];
  const renames = renameMap ?? {};

  // Build reverse rename map: newTokenPath → oldTokenPath
  const reverseRenames: Record<string, string> = {};
  for (const [oldPath, newPath] of Object.entries(renames)) {
    reverseRenames[newPath] = oldPath;
  }

  // Build Figma lookup by tokenPath
  const figmaVarByPath = new Map<string, FigmaVariableSnapshot>();
  for (const v of figmaState.variables) {
    figmaVarByPath.set(v.tokenPath, v);
  }
  const figmaStyleByPath = new Map<string, FigmaTextStyleSnapshot>();
  for (const s of figmaState.textStyles) {
    figmaStyleByPath.set(s.tokenPath, s);
  }

  // Track which Figma artifacts were matched
  const matchedFigmaPaths = new Set<string>();

  // Process each code token
  for (const codeToken of codeTokens) {
    // Try direct tokenPath match
    const figmaVar = figmaVarByPath.get(codeToken.tokenPath);
    const figmaStyle = figmaStyleByPath.get(codeToken.tokenPath);
    const figmaArtifact = figmaVar ?? figmaStyle;

    if (figmaArtifact) {
      matchedFigmaPaths.add(codeToken.tokenPath);

      // Check if value has changed
      const figmaValue = figmaArtifact.value;
      const codeValue = codeToken.value;
      const extensionsMatch = figmaStyle
        ? deepEqual(codeToken.extensions, figmaStyle.extensions)
        : true;

      if (!deepEqual(figmaValue, codeValue) || !extensionsMatch) {
        entries.push({
          tokenPath: codeToken.tokenPath,
          status: "changed",
          oldValue: figmaValue,
          newValue: codeValue,
        });
      } else {
        entries.push({
          tokenPath: codeToken.tokenPath,
          status: "in_sync",
        });
      }
      continue;
    }

    // Try rename match: check if there's a Figma artifact with the old tokenPath
    const oldPath = reverseRenames[codeToken.tokenPath];
    if (oldPath) {
      const oldFigmaVar = figmaVarByPath.get(oldPath);
      const oldFigmaStyle = figmaStyleByPath.get(oldPath);
      const oldArtifact = oldFigmaVar ?? oldFigmaStyle;

      if (oldArtifact) {
        matchedFigmaPaths.add(oldPath);
        entries.push({
          tokenPath: codeToken.tokenPath,
          status: "renamed",
          oldName: oldArtifact.name,
          newName: codeToken.figmaName,
        });
        continue;
      }
    }

    // No match → new
    entries.push({
      tokenPath: codeToken.tokenPath,
      status: "new",
    });
  }

  // Find orphaned Figma artifacts (have tokenPath but no code match)
  for (const v of figmaState.variables) {
    if (!matchedFigmaPaths.has(v.tokenPath)) {
      // Check if it was renamed away (old path in rename map)
      if (!renames[v.tokenPath]) {
        entries.push({
          tokenPath: v.tokenPath,
          status: "orphaned",
        });
      }
    }
  }
  for (const s of figmaState.textStyles) {
    if (!matchedFigmaPaths.has(s.tokenPath)) {
      if (!renames[s.tokenPath]) {
        entries.push({
          tokenPath: s.tokenPath,
          status: "orphaned",
        });
      }
    }
  }

  // Compute summary
  const summary: DiffSummary = {
    total: entries.length,
    new: entries.filter(e => e.status === "new").length,
    changed: entries.filter(e => e.status === "changed").length,
    renamed: entries.filter(e => e.status === "renamed").length,
    orphaned: entries.filter(e => e.status === "orphaned").length,
    inSync: entries.filter(e => e.status === "in_sync").length,
  };

  return { entries, summary };
}
