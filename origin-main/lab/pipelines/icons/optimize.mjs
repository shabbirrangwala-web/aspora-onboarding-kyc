/**
 * optimize.mjs — SVGO optimization for SVG distribution.
 *
 * Takes raw SVG strings (from renderToStaticMarkup) and optimizes them
 * for distribution. Strips width/height, keeps viewBox, preserves
 * currentColor and explicit fill colors, avoids merging paths for
 * Android SVG Tiny compatibility.
 */

import { optimize } from 'svgo';

// ---------------------------------------------------------------------------
// SVGO configuration
// ---------------------------------------------------------------------------

const svgoConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep viewBox — consumers size icons via tokens
          removeViewBox: false,
          // Do NOT merge paths — Android SVG Tiny compatibility (per Polaris pattern)
          mergePaths: false,
        },
      },
    },
    // Strip width and height attributes — icons are sized by consumers
    'removeDimensions',
  ],
};

// ---------------------------------------------------------------------------
// optimizeSvg
// ---------------------------------------------------------------------------

/**
 * Optimize a raw SVG string for distribution.
 *
 * - Strips width and height attributes
 * - Keeps viewBox for scaling
 * - Preserves currentColor values (theming)
 * - Preserves explicit fill colors (multi-color brand icons)
 * - Does not merge paths (Android SVG Tiny compatibility)
 *
 * @param {string} svgString — Raw SVG markup
 * @returns {string} Optimized SVG markup
 */
export function optimizeSvg(svgString) {
  const result = optimize(svgString, svgoConfig);
  return result.data;
}
