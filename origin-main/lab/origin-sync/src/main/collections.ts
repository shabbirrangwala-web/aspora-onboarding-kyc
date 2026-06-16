export async function findOrCreateCollection(
  name: string,
  options?: { hidden?: boolean },
): Promise<any> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  // Case-insensitive match — prevents duplicate collections from naming changes
  const existing = collections.find(
    (c: any) => c.name.toLowerCase() === name.toLowerCase(),
  );

  if (existing) {
    // Update name to canonical casing if it differs
    if (existing.name !== name) {
      existing.name = name;
    }
    if (options?.hidden !== undefined) {
      existing.hiddenFromPublishing = options.hidden;
    }
    return existing;
  }

  const col = figma.variables.createVariableCollection(name);
  if (options?.hidden) {
    col.hiddenFromPublishing = true;
  }
  return col;
}

export function findModeByName(
  collection: any,
  name: string,
): string | null {
  const mode = collection.modes.find((m: any) => m.name === name);
  return mode?.modeId ?? null;
}

export async function ensureModes(
  collection: any,
  firstName: string,
  secondName: string,
): Promise<{ lightModeId: string; darkModeId: string }> {
  let firstModeId = findModeByName(collection, firstName);
  let secondModeId = findModeByName(collection, secondName);

  if (!firstModeId) {
    collection.renameMode(collection.defaultModeId, firstName);
    firstModeId = collection.defaultModeId;
  }

  if (!secondModeId) {
    secondModeId = collection.addMode(secondName);
  }

  return { lightModeId: firstModeId, darkModeId: secondModeId };
}
