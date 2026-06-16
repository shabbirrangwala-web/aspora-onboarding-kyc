/**
 * extract.mjs — SVG extraction from Central Icons React packages.
 *
 * Extracts raw SVG strings, parses aliases from ariaLabel, and discovers
 * all icon modules in a given Central Icons React package.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// pascalToKebab
// ---------------------------------------------------------------------------

/**
 * Convert a PascalCase icon name to kebab-case, stripping the "Icon" prefix.
 *
 * Examples:
 *   IconArrowRight → arrow-right
 *   IconLock       → lock
 *   Icon3dBoxTop   → 3d-box-top
 *   Icon4k         → 4k
 *   IconX          → x
 *   IconAiSlop     → ai-slop
 *   IconAirdrop2   → airdrop-2
 */
export function pascalToKebab(name) {
  // Strip the "Icon" prefix
  const stripped = name.replace(/^Icon/, '');

  // Insert hyphens at word boundaries:
  //  - Before an uppercase letter followed by a lowercase letter (when preceded by something)
  //  - Before a digit sequence when preceded by a letter
  //  - Before a letter sequence when preceded by a digit
  const kebab = stripped
    // Handle transitions from lowercase/digit to uppercase: "aRight" → "a-Right"
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // Handle transitions from consecutive uppercase to uppercase+lowercase: "AISlop" → "AI-Slop"
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // Handle transitions from letter to digit: "Airdrop2" → "Airdrop-2"
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase();

  return kebab;
}

// ---------------------------------------------------------------------------
// extractAliases
// ---------------------------------------------------------------------------

/**
 * Parse the ariaLabel from a Central Icons source file.
 *
 * The ariaLabel is a comma-separated string embedded in the minified source.
 * The first value is the concept id, the rest are aliases.
 *
 * Returns { id: string, aliases: string[] } or null if no ariaLabel found.
 */
export function extractAliases(source) {
  const match = source.match(/ariaLabel:"([^"]+)"/);
  if (!match) return null;

  const parts = match[1].split(',').map((s) => s.trim());
  return {
    id: parts[0],
    aliases: parts.slice(1),
  };
}

// ---------------------------------------------------------------------------
// renderIconToSvg
// ---------------------------------------------------------------------------

/**
 * Render a Central Icons React component to a static SVG string.
 *
 * Calls the component function directly (not as JSX) with an empty props
 * object, then uses renderToStaticMarkup to produce clean SVG markup.
 */
export function renderIconToSvg(IconComponent) {
  return renderToStaticMarkup(IconComponent({}));
}

// ---------------------------------------------------------------------------
// discoverIcons
// ---------------------------------------------------------------------------

/**
 * Walk a Central Icons React package directory and discover all icon module
 * directory names.  Does NOT dynamically import anything — the build script
 * handles imports so discovery stays fast and side-effect-free.
 *
 * @param {string} pkgName — The short package name, e.g. "round-outlined-radius-1-stroke-2"
 * @returns {Promise<string[]>} Array of directory names, e.g. ["IconLock", "IconArrowRight", …]
 */
export async function discoverIcons(pkgName) {
  const thisDir = dirname(fileURLToPath(import.meta.url));
  const baseDir = join(thisDir, 'node_modules', '@central-icons-react', pkgName);

  const entries = await readdir(baseDir, { withFileTypes: true });

  return entries
    .filter(
      (e) => e.isDirectory() && e.name.startsWith('Icon') && e.name !== 'CentralIconBase',
    )
    .map((e) => e.name);
}
