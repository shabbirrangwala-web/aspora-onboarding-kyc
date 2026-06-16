// manifest.mjs — Generates icon manifest and keys allowlist from processed icon data.
// Pure data transformation — no file I/O.

const ID_FORMAT = 'origin.icon.{id}.{variant}';
const VARIANTS = ['outlined', 'filled'];

/**
 * Build the icon manifest object.
 *
 * @param {Array<{ id: string, aliases: string[] }>} icons
 * @param {{ package: string, version: string, combo: object }} sourceInfo
 * @returns {object} Manifest with id_format, source, and sorted icons array
 */
export function buildManifest(icons, sourceInfo) {
  const sorted = [...icons].sort((a, b) => a.id.localeCompare(b.id));

  return {
    id_format: ID_FORMAT,
    source: sourceInfo,
    icons: sorted.map((icon) => ({
      id: icon.id,
      aliases: icon.aliases,
      variants: {
        outlined: `outputs/icons/outlined/${icon.id}.svg`,
        filled: `outputs/icons/filled/${icon.id}.svg`,
      },
    })),
  };
}

/**
 * Build the keys allowlist from a manifest.
 *
 * @param {object} manifest — Output of buildManifest
 * @returns {{ id_format: string, keys: string[] }}
 */
export function buildKeys(manifest) {
  const keys = [];

  for (const icon of manifest.icons) {
    for (const variant of VARIANTS) {
      keys.push(`origin.icon.${icon.id}.${variant}`);
    }
  }

  keys.sort();

  return {
    id_format: ID_FORMAT,
    keys,
  };
}
