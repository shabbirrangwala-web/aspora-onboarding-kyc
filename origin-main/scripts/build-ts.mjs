#!/usr/bin/env node
/**
 * BUILD WEB OUTPUTS
 *
 * Reads foundations/ JSON and generates ready-to-use TypeScript, CSS,
 * JSON, Tailwind, and AI context files in outputs/.
 *
 * IMPORTANT — separate web and mobile typography files:
 *   - foundations/typography/primitives.json + semantic.json     → mobile apps (iOS, Android)
 *   - foundations/typography/web-primitives.json + web-semantic.json → web interfaces (CSS, TS, Tailwind)
 *
 * This build script uses web-primitives.json + web-semantic.json for all web outputs.
 * Mobile platform teams consume primitives.json + semantic.json directly.
 * Web primitives start as a copy of mobile primitives but will migrate to rem.
 *
 * Usage: node scripts/build-ts.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FOUNDATIONS = resolve(ROOT, 'foundations');
const OUT_TS = resolve(ROOT, 'outputs/ts');
const OUT_CSS = resolve(ROOT, 'outputs/css');

function read(path) {
  return JSON.parse(readFileSync(resolve(FOUNDATIONS, path), 'utf-8'));
}

/** Web typography primitives (web-primitives.json → "web-typography" root key) */
function readWebTypoPrims() {
  return read('typography/web-primitives.json')['web-typography'];
}

/** Web semantic typography tokens (web-semantic.json → "web-typography" root key) */
function readWebTypoSem() {
  return read('typography/web-semantic.json')['web-typography'];
}

function pad(str, len = 14) {
  return str + ' '.repeat(Math.max(1, len - str.length));
}

/** Convert px integer to rem string (base 16). Used for CSS font-size/line-height output. */
function rem(px) {
  if (px === 0) return '0';
  const val = px / 16;
  return `${parseFloat(val.toFixed(4))}rem`;
}

// ─── Typography: responsive-typography.ts ────────────────────────

function buildResponsiveTypography() {
  const typo = readWebTypoPrims();
  const sem = readWebTypoSem();

  function buildScale(scaleObj) {
    return Object.entries(scaleObj)
      .filter(([k]) => k !== '$type' && k !== '$description')
      .map(([step, token]) => {
        const base = parseInt(token.$value);
        const r = token.$extensions?.['tech.vance.origin']?.responsive;
        return {
          step,
          mobile: base,
          tablet: r ? parseInt(r.tablet) : base,
          desktopFloor: r ? parseInt(r.desktopFloor) : base,
          desktopCeil: r ? parseInt(r.desktopCeil) : base,
        };
      });
  }

  /** Build unitless ratio scale (for line heights that don't have responsive variants) */
  function buildRatioScale(scaleObj) {
    return Object.entries(scaleObj)
      .filter(([k]) => k !== '$type' && k !== '$description')
      .map(([step, token]) => ({ step, value: parseFloat(token.$value) }));
  }

  const fontSizes = buildScale(typo.fontSize);
  const lineHeights = buildRatioScale(typo.lineHeight);
  const letterSpacing = Object.entries(typo.letterSpacing)
    .filter(([k]) => k !== '$type' && k !== '$description')
    .map(([step, token]) => ({ step, value: token.$value }));

  const fontWeightMap = {};
  for (const [name, token] of Object.entries(typo.fontWeight)) {
    if (name !== '$type') fontWeightMap[name] = token.$value;
  }

  // Semantic tokens
  const semanticTokens = [];
  for (const [category, group] of Object.entries(sem)) {
    if (category === '$type') continue;
    for (const [size, token] of Object.entries(group)) {
      if (size === '$type') continue;
      const val = token.$value;
      const ext = token.$extensions?.['tech.vance.origin'] || {};
      semanticTokens.push({
        name: `${category}.${size}`,
        category: category.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
        size: size === 'standard' ? '-' : size.toUpperCase(),
        fontSize: val.fontSize.match(/\.(\d+)\}$/)?.[1] || '',
        fontWeight: fontWeightMap[val.fontWeight.match(/\.([\w]+)\}$/)?.[1]] || 400,
        lineHeight: val.lineHeight.match(/\.(\d+)\}$/)?.[1] || '',
        letterSpacing: val.letterSpacing.match(/\.([\w-]+)\}$/)?.[1] || '',
        textCase: ext.textCase || undefined,
        tnum: ext.openTypeFeatures?.tnum || undefined,
      });
    }
  }

  const fsLines = fontSizes.map(s =>
    `  { step: '${s.step}', ${pad(`mobile: ${s.mobile},`)} ${pad(`tablet: ${s.tablet},`)} ${pad(`desktopFloor: ${s.desktopFloor},`)} desktopCeil: ${s.desktopCeil} },`
  ).join('\n');

  const lhLines = lineHeights.map(s =>
    `  { step: '${s.step}', value: ${s.value} },`
  ).join('\n');

  const lsLines = letterSpacing.map(s =>
    `  { step: '${s.step}',${' '.repeat(Math.max(1, 9 - s.step.length))}value: '${s.value}' },`
  ).join('\n');

  const semLines = semanticTokens.map(t => {
    let l = `  { name: '${t.name}',`;
    l += `${' '.repeat(Math.max(1, 22 - t.name.length))}category: '${t.category}',`;
    l += `${' '.repeat(Math.max(1, 16 - t.category.length))}size: '${t.size}',`;
    l += ` fontSize: '${t.fontSize}', fontWeight: ${t.fontWeight}, lineHeight: '${t.lineHeight}', letterSpacing: '${t.letterSpacing}'`;
    if (t.textCase) l += `, textCase: '${t.textCase}'`;
    if (t.tnum) l += `, tnum: true`;
    l += ` },`;
    return l;
  }).join('\n');

  return `/**
 * RESPONSIVE TYPOGRAPHY — Generated from Origin foundations
 *
 * DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs
 */

/* ── Breakpoints ── */

export const BREAKPOINTS = {
  mobile: 734,
  tablet: 1068,
  desktop: 1069,
  ceiling: 1440,
} as const;

/* ── Font size scales ── */

export type ScaleStep = {
  step: string;
  mobile: number;
  tablet: number;
  desktopFloor: number;
  desktopCeil: number;
};

export const FONT_SIZE_SCALE: ScaleStep[] = [
${fsLines}
];

/* ── Line height ratios (unitless) ── */

export type LineHeightStep = {
  step: string;
  value: number;
};

export const LINE_HEIGHT_SCALE: LineHeightStep[] = [
${lhLines}
];

/* ── Letter spacing ── */

export const LETTER_SPACING = [
${lsLines}
] as const;

/* ── Clamp generator ── */

export function generateClamp(floor: number, ceil: number): string {
  if (floor === ceil) return \`\${round(floor / 16)}rem\`;
  const range = BREAKPOINTS.ceiling - BREAKPOINTS.desktop;
  const slope = ((ceil - floor) / range) * 100;
  const intercept = floor - ((ceil - floor) / range) * BREAKPOINTS.desktop;
  return \`clamp(\${round(floor / 16)}rem, \${round(intercept / 16)}rem + \${round(slope)}vw, \${round(ceil / 16)}rem)\`;
}

function round(n: number): string {
  return (Math.round(n * 10000) / 10000).toString();
}

/* ── CSS generator ── */

export function generateResponsiveCSS(): string {
  const lines: string[] = [];

  lines.push('/* ═══ Responsive Typography Primitives ═══');
  lines.push('   Auto-generated from Origin foundations');
  lines.push('   Mobile-first: base → tablet (735px) → desktop (1069px) */\\n');

  lines.push(':root {');
  for (const s of FONT_SIZE_SCALE) lines.push(\`  --typo-fs-\${s.step}: \${round(s.mobile / 16)}rem;\`);
  for (const s of LINE_HEIGHT_SCALE) lines.push(\`  --typo-lh-\${s.step}: \${round(s.mobile / 16)}rem;\`);
  for (const s of LETTER_SPACING) {
    const em = parseFloat(s.value) / 100;
    lines.push(\`  --typo-ls-\${s.step}: \${em === 0 ? '0' : parseFloat(em.toFixed(4)) + 'em'};\`);
  }
  lines.push('}\\n');

  lines.push('@media (min-width: 735px) {');
  lines.push('  :root {');
  for (const s of FONT_SIZE_SCALE) if (s.tablet !== s.mobile) lines.push(\`    --typo-fs-\${s.step}: \${round(s.tablet / 16)}rem;\`);
  for (const s of LINE_HEIGHT_SCALE) if (s.tablet !== s.mobile) lines.push(\`    --typo-lh-\${s.step}: \${round(s.tablet / 16)}rem;\`);
  lines.push('  }');
  lines.push('}\\n');

  lines.push('@media (min-width: 1069px) {');
  lines.push('  :root {');
  for (const s of FONT_SIZE_SCALE) lines.push(\`    --typo-fs-\${s.step}: \${generateClamp(s.desktopFloor, s.desktopCeil)};\`);
  for (const s of LINE_HEIGHT_SCALE) lines.push(\`    --typo-lh-\${s.step}: \${generateClamp(s.desktopFloor, s.desktopCeil)};\`);
  lines.push('  }');
  lines.push('}');

  return lines.join('\\n');
}

/* ── Semantic tokens ── */

export type SemanticTypoToken = {
  name: string;
  category: string;
  size: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
  textCase?: 'uppercase';
  tnum?: boolean;
};

export const SEMANTIC_TOKENS: SemanticTypoToken[] = [
${semLines}
];

/* ── Resolve at breakpoint ── */

type Breakpoint = 'mobile' | 'tablet' | 'desktopFloor' | 'desktopCeil';

export function resolveToken(token: SemanticTypoToken, bp: Breakpoint) {
  const fs = FONT_SIZE_SCALE.find(s => s.step === token.fontSize)!;
  const lh = LINE_HEIGHT_SCALE.find(s => s.step === token.lineHeight)!;
  const ls = LETTER_SPACING.find(s => s.step === token.letterSpacing)!;
  return {
    fontSize: fs[bp],
    lineHeight: lh[bp],
    letterSpacing: ls.value,
    fontWeight: token.fontWeight,
    textCase: token.textCase,
    tnum: token.tnum,
  };
}
`;
}

// ─── Typography: typography.ts (R tokens) ────────────────────────

function buildTypography() {
  const typo = readWebTypoPrims();
  const sem = readWebTypoSem();

  const fontWeightMap = {};
  for (const [name, token] of Object.entries(typo.fontWeight)) {
    if (name !== '$type') fontWeightMap[name] = token.$value;
  }

  const entries = [];
  for (const [category, group] of Object.entries(sem)) {
    if (category === '$type') continue;
    for (const [size, token] of Object.entries(group)) {
      if (size === '$type') continue;
      const val = token.$value;
      const ext = token.$extensions?.['tech.vance.origin'] || {};

      const fsStep = val.fontSize.match(/\.(\d+)\}$/)?.[1] || '';
      const lhStep = val.lineHeight.match(/\.(\d+)\}$/)?.[1] || '';
      const lsStep = val.letterSpacing.match(/\.([\w-]+)\}$/)?.[1] || '';
      const fwName = val.fontWeight.match(/\.([\w]+)\}$/)?.[1] || '';

      const catCamel = category.replace(/-(\w)/g, (_, c) => c.toUpperCase());
      let key;
      if (size === 'standard') {
        key = catCamel;
      } else if (size.includes('-')) {
        const sizeMap = { s: 'Sm', m: 'Md', l: 'Lg' };
        const parts = size.split('-');
        key = catCamel + parts.map((p, i) => i === 0 ? p[0].toUpperCase() + p.slice(1) : (sizeMap[p] || p[0].toUpperCase() + p.slice(1))).join('');
      } else {
        const sizeMap = { s: 'Sm', m: 'Md', l: 'Lg' };
        key = catCamel + (sizeMap[size] || size[0].toUpperCase() + size.slice(1));
      }

      const props = [`fs: '${fsStep}'`, `lh: '${lhStep}'`, `w: ${fontWeightMap[fwName] || 400}`, `ls: '${lsStep}'`];
      if (ext.textCase === 'uppercase') props.push(`uc: true`);
      if (ext.openTypeFeatures?.tnum) props.push(`tnum: true`);

      entries.push({ key, category, props: `{ ${props.join(', ')} }` });
    }
  }

  let currentCat = '';
  const lines = entries.map(e => {
    let prefix = '';
    if (e.category !== currentCat) {
      currentCat = e.category;
      const label = e.category.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
      prefix = `  /* ${label} */\n`;
    }
    const padding = ' '.repeat(Math.max(1, 18 - e.key.length));
    return `${prefix}  ${e.key}:${padding}${e.props},`;
  }).join('\n');

  return `/**
 * TYPOGRAPHY TOKENS — Generated from Origin foundations
 *
 * DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs
 */

import type React from 'react';

export type RToken = {
  fs: string;   // font-size step
  lh: string;   // line-height step
  w: number;    // font-weight
  ls: string;   // letter-spacing step
  uc?: boolean; // uppercase
  tnum?: boolean;
};

export const R = {
${lines}
} satisfies Record<string, RToken>;

export function rs(token: RToken): React.CSSProperties {
  return {
    fontSize: \`var(--typo-fs-\${token.fs})\`,
    lineHeight: \`var(--typo-lh-\${token.lh})\`,
    fontWeight: token.w,
    letterSpacing: \`var(--typo-ls-\${token.ls})\`,
    textTransform: token.uc ? 'uppercase' : undefined,
    fontVariantNumeric: token.tnum ? 'tabular-nums' : undefined,
  };
}
`;
}

// ─── Colors ──────────────────────────────────────────────────────

function buildColors() {
  const prims = read('color/primitives.json').color;
  const anchors = read('color/anchors.json');
  const light = read('color/semantic.light.json').color;
  const dark = read('color/semantic.dark.json').color;

  const rampLines = [];
  for (const [name, ramp] of Object.entries(prims)) {
    if (name === '$type') continue;
    const steps = Object.entries(ramp)
      .filter(([k]) => k !== '$type' && k !== '$description')
      .map(([step, t]) => `    ${step}: '${t.$value}',`)
      .join('\n');
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : `'${name}'`;
    rampLines.push(`  ${safeKey}: {\n${steps}\n  },`);
  }

  const anchorLines = Object.entries(anchors)
    .map(([name, d]) => {
      const props = [`hex: '${d.hex}'`];
      if (d.step) props.push(`step: ${d.step}`);
      if (d.isNeutral) props.push(`isNeutral: true`);
      if (d.neutralChromaMax !== undefined) props.push(`neutralChromaMax: ${d.neutralChromaMax}`);
      return `  ${name}: { ${props.join(', ')} },`;
    }).join('\n');

  // Parse {color.ramp.step} into [ramp, step] tuple
  function parseAlias(ref) {
    const match = ref.match(/^\{color\.(.+?)\.(.+?)\}$/);
    if (!match) return null;
    return [match[1], match[2]];
  }

  function flatten(obj, prefix = '') {
    const out = [];
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$type') continue;
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && v.$value) {
        const alias = parseAlias(v.$value);
        out.push({ path, ref: alias ? { ramp: alias[0], step: alias[1] } : null, raw: alias ? null : v.$value });
      } else if (typeof v === 'object') {
        out.push(...flatten(v, path));
      }
    }
    return out;
  }

  const lightTokens = flatten(light);
  const darkTokens = flatten(dark);

  // Generate semantic entries that reference primitives
  function semanticEntry(t) {
    if (t.ref) {
      const safeRamp = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(t.ref.ramp) ? t.ref.ramp : `'${t.ref.ramp}'`;
      return `  '${t.path}': COLOR_PRIMITIVES[${typeof safeRamp === 'string' && safeRamp.startsWith("'") ? safeRamp : `'${safeRamp}'`}][${t.ref.step}],`;
    }
    return `  '${t.path}': '${t.raw}' as const,`;
  }

  const lightLines = lightTokens.map(semanticEntry).join('\n');
  const darkLines = darkTokens.map(semanticEntry).join('\n');

  return `/**
 * COLOR TOKENS — Generated from Origin foundations
 *
 * DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs
 *
 * Architecture: semantic tokens reference primitives at runtime.
 * Changing a primitive value propagates to all semantic consumers.
 */

export const COLOR_PRIMITIVES = {
${rampLines.join('\n')}
} as const;

export const COLOR_ANCHORS = {
${anchorLines}
} as const;

/** Semantic light mode — every value references COLOR_PRIMITIVES */
export const SEMANTIC_LIGHT = {
${lightLines}
} as const;

/** Semantic dark mode — every value references COLOR_PRIMITIVES */
export const SEMANTIC_DARK = {
${darkLines}
} as const;

/** Resolve a semantic token to its hex value */
export function resolveColor(token: keyof typeof SEMANTIC_LIGHT, mode: 'light' | 'dark' = 'light'): string {
  return mode === 'dark' ? SEMANTIC_DARK[token as keyof typeof SEMANTIC_DARK] : SEMANTIC_LIGHT[token];
}

export type ColorRamp = keyof typeof COLOR_PRIMITIVES;
export type ColorStep = keyof (typeof COLOR_PRIMITIVES)['neutral'];
export type SemanticColorToken = keyof typeof SEMANTIC_LIGHT;
`;
}

// ─── Spacing ─────────────────────────────────────────────────────

function buildSpacing() {
  const entries = Object.entries(read('spacing/primitives.json').spacing)
    .filter(([k]) => k !== '$type')
    .map(([step, t]) => `  '${step}': '${t.$value}',`).join('\n');

  return `/**
 * SPACING TOKENS — Generated from Origin foundations
 *
 * DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs
 */

export const SPACING = {
${entries}
} as const;

export type SpacingStep = keyof typeof SPACING;
`;
}

// ─── Radius ──────────────────────────────────────────────────────

function buildRadius() {
  const entries = Object.entries(read('radius/primitives.json').radius)
    .filter(([k]) => k !== '$type')
    .map(([step, t]) => `  '${step}': '${t.$value}',`).join('\n');

  return `/**
 * RADIUS TOKENS — Generated from Origin foundations
 *
 * DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs
 */

export const RADIUS = {
${entries}
} as const;

export type RadiusStep = keyof typeof RADIUS;
`;
}

// ─── Barrel ──────────────────────────────────────────────────────

function buildBarrel() {
  return `/**
 * ORIGIN DESIGN SYSTEM — TypeScript outputs
 *
 * DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs
 */

// Typography
export { R, rs, type RToken } from './typography';
export {
  BREAKPOINTS,
  FONT_SIZE_SCALE,
  LINE_HEIGHT_SCALE,
  LETTER_SPACING,
  SEMANTIC_TOKENS,
  generateClamp,
  generateResponsiveCSS,
  resolveToken,
  type ScaleStep,
  type SemanticTypoToken,
} from './responsive-typography';

// Color
export {
  COLOR_PRIMITIVES,
  COLOR_ANCHORS,
  SEMANTIC_LIGHT,
  SEMANTIC_DARK,
  type ColorRamp,
  type ColorStep,
} from './colors';

// Spacing
export { SPACING, type SpacingStep } from './spacing';

// Radius
export { RADIUS, type RadiusStep } from './radius';
`;
}

// ─── CSS Tokens ──────────────────────────────────────────────────

function buildCSS() {
  const prims = read('color/primitives.json').color;
  const light = read('color/semantic.light.json').color;
  const dark = read('color/semantic.dark.json').color;
  const spacing = read('spacing/primitives.json').spacing;
  const radius = read('radius/primitives.json').radius;
  const typo = readWebTypoPrims();
  const typoSem = readWebTypoSem();

  const lines = [];
  lines.push('/**');
  lines.push(' * ORIGIN DESIGN TOKENS — CSS Custom Properties (Web)');
  lines.push(' *');
  lines.push(' * DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs');
  lines.push(' *');
  lines.push(' * Typography uses rem units (base 16) for accessibility.');
  lines.push(' * Sourced from web-semantic.json + web-primitives.json (web interfaces).');
  lines.push(' * Mobile apps use semantic.json + primitives.json (px) directly.');
  lines.push(' *');
  lines.push(' * Primitives → semantic references. Change a primitive,');
  lines.push(' * all semantics update automatically.');
  lines.push(' */\n');

  // ── Color primitives ──
  lines.push('/* ═══ Color Primitives ═══ */\n:root {');
  for (const [name, ramp] of Object.entries(prims)) {
    if (name === '$type') continue;
    for (const [step, t] of Object.entries(ramp)) {
      if (step === '$type' || step === '$description') continue;
      lines.push(`  --color-${name}-${step}: ${t.$value};`);
    }
  }

  // ── Spacing ──
  lines.push('\n  /* ═══ Spacing ═══ */');
  for (const [step, t] of Object.entries(spacing)) {
    if (step === '$type') continue;
    lines.push(`  --space-${step}: ${t.$value};`);
  }

  // ── Radius ──
  lines.push('\n  /* ═══ Radius ═══ */');
  for (const [step, t] of Object.entries(radius)) {
    if (step === '$type') continue;
    lines.push(`  --radius-${step}: ${t.$value};`);
  }

  // ── Font weights ──
  lines.push('\n  /* ═══ Font Weights ═══ */');
  for (const [name, t] of Object.entries(typo.fontWeight)) {
    if (name === '$type') continue;
    lines.push(`  --typo-fw-${name}: ${t.$value};`);
  }

  lines.push('}\n');

  // ── Semantic light (default) ──
  function parseAlias(ref) {
    const match = ref.match(/^\{color\.(.+?)\.(.+?)\}$/);
    return match ? [match[1], match[2]] : null;
  }

  function flattenSemantic(obj, prefix = '') {
    const out = [];
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$type') continue;
      const path = prefix ? `${prefix}-${k}` : k;
      if (v && v.$value) {
        const alias = parseAlias(v.$value);
        out.push({ prop: `--${path}`, ref: alias, raw: alias ? null : v.$value });
      } else if (typeof v === 'object') {
        out.push(...flattenSemantic(v, path));
      }
    }
    return out;
  }

  const lightTokens = flattenSemantic(light);
  const darkTokens = flattenSemantic(dark);

  lines.push('/* ═══ Semantic — Light (default) ═══ */\n:root {');
  for (const t of lightTokens) {
    if (t.ref) {
      lines.push(`  ${t.prop}: var(--color-${t.ref[0]}-${t.ref[1]});`);
    } else {
      lines.push(`  ${t.prop}: ${t.raw};`);
    }
  }
  lines.push('}\n');

  lines.push('/* ═══ Semantic — Dark ═══ */\n.dark {');
  for (const t of darkTokens) {
    if (t.ref) {
      lines.push(`  ${t.prop}: var(--color-${t.ref[0]}-${t.ref[1]});`);
    } else {
      lines.push(`  ${t.prop}: ${t.raw};`);
    }
  }
  lines.push('}\n');

  // ── Responsive typography ──
  const fontSizes = Object.entries(typo.fontSize)
    .filter(([k]) => k !== '$type' && k !== '$description')
    .map(([step, token]) => {
      const base = parseInt(token.$value);
      const r = token.$extensions?.['tech.vance.origin']?.responsive;
      return { step, mobile: base, tablet: r ? parseInt(r.tablet) : base, desktopFloor: r ? parseInt(r.desktopFloor) : base, desktopCeil: r ? parseInt(r.desktopCeil) : base };
    });

  const lineHeights = Object.entries(typo.lineHeight)
    .filter(([k]) => k !== '$type' && k !== '$description')
    .map(([step, token]) => ({ step, value: parseFloat(token.$value) }));

  const letterSpacing = Object.entries(typo.letterSpacing)
    .filter(([k]) => k !== '$type' && k !== '$description')
    .map(([step, token]) => ({ step, value: token.$value }));

  function clamp(floor, ceil) {
    if (floor === ceil) return rem(floor);
    const range = 1440 - 1069;
    const slope = ((ceil - floor) / range) * 100;
    const intercept = floor - ((ceil - floor) / range) * 1069;
    const r = (n) => (Math.round(n * 10000) / 10000).toString();
    return `clamp(${rem(floor)}, ${r(intercept / 16)}rem + ${r(slope)}vw, ${rem(ceil)})`;
  }

  lines.push('/* ═══ Responsive Typography (rem — scales with browser font-size) ═══ */\n:root {');
  lines.push('  /* Font sizes — mobile */');
  for (const s of fontSizes) lines.push(`  --typo-fs-${s.step}: ${rem(s.mobile)};`);
  lines.push('\n  /* Line heights — unitless ratios */');
  for (const s of lineHeights) lines.push(`  --typo-lh-${s.step}: ${s.value};`);
  lines.push('\n  /* Letter spacing */');
  for (const s of letterSpacing) {
    const em = parseFloat(s.value) / 100;
    lines.push(`  --typo-ls-${s.step}: ${em === 0 ? '0' : parseFloat(em.toFixed(4)) + 'em'};`);
  }
  lines.push('}\n');

  lines.push('@media (min-width: 735px) {\n  :root {');
  lines.push('    /* Font sizes — tablet */');
  for (const s of fontSizes) if (s.tablet !== s.mobile) lines.push(`    --typo-fs-${s.step}: ${rem(s.tablet)};`);
  /* Line heights are unitless ratios — no tablet overrides needed */
  lines.push('  }\n}\n');

  lines.push('@media (min-width: 1069px) {\n  :root {');
  lines.push('    /* Font sizes — desktop (fluid clamp) */');
  for (const s of fontSizes) lines.push(`    --typo-fs-${s.step}: ${clamp(s.desktopFloor, s.desktopCeil)};`);
  /* Line heights are unitless ratios — no desktop overrides needed */
  lines.push('  }\n}\n');

  // ── Semantic typography (role-based, delegates to primitives) ──
  const fontWeightMap = {};
  for (const [name, t] of Object.entries(typo.fontWeight)) {
    if (name !== '$type') fontWeightMap[name] = t.$value;
  }

  lines.push('/* ═══ Semantic Typography ═══ */');
  lines.push('/* Role-based tokens that reference responsive primitives above.');
  lines.push('   Use these in CSS — they automatically adapt across breakpoints. */\n:root {');

  for (const [category, group] of Object.entries(typoSem)) {
    if (category === '$type') continue;

    for (const [size, token] of Object.entries(group)) {
      if (size === '$type') continue;
      const val = token.$value;
      const ext = token.$extensions?.['tech.vance.origin'] || {};

      // Build camelCase name: "label-heavy" + "s" → "labelHeavySm"
      const catCamel = category.replace(/-(\w)/g, (_, c) => c.toUpperCase());
      const sizeMap = { s: 'Sm', m: 'Md', l: 'Lg' };
      let name;
      if (size === 'standard') {
        name = catCamel;
      } else if (size.includes('-')) {
        const parts = size.split('-');
        name = catCamel + parts.map(p => (sizeMap[p] || p[0].toUpperCase() + p.slice(1))).join('');
      } else {
        name = catCamel + (sizeMap[size] || size[0].toUpperCase() + size.slice(1));
      }

      const fsStep = val.fontSize.match(/\.(\d+)\}$/)?.[1] || '';
      const lhStep = val.lineHeight.match(/\.(\d+)\}$/)?.[1] || '';
      const lsStep = val.letterSpacing.match(/\.([\w-]+)\}$/)?.[1] || '';
      const fwName = val.fontWeight.match(/\.([\w]+)\}$/)?.[1] || '';

      lines.push(`  /* ${category} ${size} */`);
      lines.push(`  --type-${name}-size: var(--typo-fs-${fsStep});`);
      lines.push(`  --type-${name}-lh: var(--typo-lh-${lhStep});`);
      lines.push(`  --type-${name}-weight: ${fontWeightMap[fwName] || 400};`);
      lines.push(`  --type-${name}-ls: var(--typo-ls-${lsStep});`);
      if (ext.textCase === 'uppercase') {
        lines.push(`  --type-${name}-transform: uppercase;`);
      }
      if (ext.openTypeFeatures?.tnum) {
        lines.push(`  --type-${name}-tnum: tabular-nums;`);
      }
    }
  }

  lines.push('}');

  return lines.join('\n');
}

// ─── JSON Tokens ─────────────────────────────────────────────────

function buildJSON() {
  const prims = read('color/primitives.json').color;
  const light = read('color/semantic.light.json').color;
  const dark = read('color/semantic.dark.json').color;
  const spacing = read('spacing/primitives.json').spacing;
  const radius = read('radius/primitives.json').radius;
  const typo = readWebTypoPrims();
  const typoSem = readWebTypoSem();

  // Flatten color primitives
  const colorPrimitives = {};
  for (const [name, ramp] of Object.entries(prims)) {
    if (name === '$type') continue;
    colorPrimitives[name] = {};
    for (const [step, t] of Object.entries(ramp)) {
      if (step === '$type' || step === '$description') continue;
      colorPrimitives[name][step] = t.$value;
    }
  }

  // Flatten semantics
  function flattenSemantic(obj, prefix = '') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$type') continue;
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && v.$value) { out[path] = v.$value; }
      else if (typeof v === 'object') { Object.assign(out, flattenSemantic(v, path)); }
    }
    return out;
  }

  // Flatten spacing/radius
  function flattenSimple(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$type') continue;
      out[k] = v.$value;
    }
    return out;
  }

  // Font weights
  const fontWeights = {};
  for (const [name, t] of Object.entries(typo.fontWeight)) {
    if (name !== '$type') fontWeights[name] = t.$value;
  }

  // Typography scales
  const fontSizes = {};
  for (const [step, token] of Object.entries(typo.fontSize)) {
    if (step === '$type' || step === '$description') continue;
    const r = token.$extensions?.['tech.vance.origin']?.responsive;
    fontSizes[step] = {
      mobile: parseInt(token.$value),
      tablet: r ? parseInt(r.tablet) : parseInt(token.$value),
      desktopFloor: r ? parseInt(r.desktopFloor) : parseInt(token.$value),
      desktopCeil: r ? parseInt(r.desktopCeil) : parseInt(token.$value),
    };
  }

  return JSON.stringify({
    $generated: 'Origin design tokens. DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs',
    color: { primitives: colorPrimitives, semantic: { light: flattenSemantic(light), dark: flattenSemantic(dark) } },
    spacing: flattenSimple(spacing),
    radius: flattenSimple(radius),
    typography: { fontWeights, fontSizes },
  }, null, 2);
}

// ─── Tailwind Theme ──────────────────────────────────────────────

function buildTailwind() {
  const spacing = read('spacing/primitives.json').spacing;
  const radius = read('radius/primitives.json').radius;

  const spacingEntries = Object.entries(spacing)
    .filter(([k]) => k !== '$type')
    .map(([step, t]) => `    '${step}': '${t.$value}',`).join('\n');

  const radiusEntries = Object.entries(radius)
    .filter(([k]) => k !== '$type')
    .map(([step, t]) => `    '${step}': '${t.$value}',`).join('\n');

  return `/**
 * ORIGIN TAILWIND THEME — Generated from Origin foundations
 *
 * DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs
 *
 * Usage: import into tailwind.config and spread into theme.extend
 */

export default {
  spacing: {
${spacingEntries}
  },
  borderRadius: {
${radiusEntries}
  },
  colors: {
    surface: {
      base: 'var(--surface-base)',
      raised: 'var(--surface-raised)',
      sunken: 'var(--surface-sunken)',
      overlay: 'var(--surface-overlay)',
      contrast: 'var(--surface-contrast)',
    },
    'on-surface': {
      primary: 'var(--on-surface-primary)',
      secondary: 'var(--on-surface-secondary)',
      tertiary: 'var(--on-surface-tertiary)',
      disabled: 'var(--on-surface-disabled)',
      contrast: 'var(--on-surface-contrast)',
    },
    border: {
      DEFAULT: 'var(--border-default)',
      subtle: 'var(--border-subtle)',
      strong: 'var(--border-strong)',
      disabled: 'var(--border-disabled)',
      contrast: 'var(--border-contrast)',
    },
    interactive: {
      primary: 'var(--interactive-primary)',
      secondary: 'var(--interactive-secondary)',
      disabled: 'var(--interactive-disabled)',
      contrast: 'var(--interactive-contrast)',
    },
    error: {
      solid: 'var(--error-solid)',
      light: 'var(--error-light)',
      'on-solid': 'var(--error-on-solid)',
      'on-light': 'var(--error-on-light)',
      border: 'var(--error-border)',
    },
    success: {
      solid: 'var(--success-solid)',
      light: 'var(--success-light)',
      'on-solid': 'var(--success-on-solid)',
      'on-light': 'var(--success-on-light)',
      border: 'var(--success-border)',
    },
    warning: {
      solid: 'var(--warning-solid)',
      light: 'var(--warning-light)',
      'on-solid': 'var(--warning-on-solid)',
      'on-light': 'var(--warning-on-light)',
      border: 'var(--warning-border)',
    },
    accent: {
      solid: 'var(--accent-solid)',
      light: 'var(--accent-light)',
      'on-solid': 'var(--accent-on-solid)',
      'on-light': 'var(--accent-on-light)',
      border: 'var(--accent-border)',
    },
    brand: {
      maroon: 'var(--brand-maroon)',
      crimson: 'var(--brand-crimson)',
      teal: 'var(--brand-teal)',
      blue: 'var(--brand-blue)',
      peach: 'var(--brand-peach)',
      gold: 'var(--brand-gold)',
      lime: 'var(--brand-lime)',
    },
  },
};
`;
}

// ─── AI Context ──────────────────────────────────────────────────

function buildAI() {
  const prims = read('color/primitives.json').color;
  const light = read('color/semantic.light.json').color;
  const spacing = read('spacing/primitives.json').spacing;
  const radius = read('radius/primitives.json').radius;
  const typo = readWebTypoPrims();
  const typoSem = readWebTypoSem();

  const lines = [];
  lines.push('# Origin Design System: Token Reference (Web)');
  lines.push('');
  lines.push('> Auto-generated from web-semantic.json (web interfaces). Mobile apps use semantic.json.');
  lines.push('> DO NOT EDIT. Regenerate with: node scripts/build-ts.mjs');
  lines.push('');

  // Color ramps
  lines.push('## Color Primitives');
  lines.push('');
  for (const [name, ramp] of Object.entries(prims)) {
    if (name === '$type') continue;
    const steps = Object.entries(ramp).filter(([k]) => k !== '$type' && k !== '$description');
    lines.push(`### ${name}`);
    lines.push(`| Step | Value |`);
    lines.push(`|------|-------|`);
    for (const [step, t] of steps) lines.push(`| ${step} | \`${t.$value}\` |`);
    lines.push('');
  }

  // Semantic colors
  lines.push('## Semantic Colors (Light)');
  lines.push('');
  lines.push('Naming convention: `{category}-{variant}` where variants are:');
  lines.push('- `solid`: filled background');
  lines.push('- `light`: subtle background');
  lines.push('- `on-solid`: text on solid background');
  lines.push('- `on-light`: text on light background');
  lines.push('- `border`: border color');
  lines.push('');
  lines.push('Status categories: `error` (red), `success` (green), `warning` (yellow), `accent` (blue, used for informational).');
  lines.push('');

  function flattenForDoc(obj, prefix = '') {
    const out = [];
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$type') continue;
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && v.$value) out.push({ path, ref: v.$value });
      else if (typeof v === 'object') out.push(...flattenForDoc(v, path));
    }
    return out;
  }

  lines.push('| Token | References |');
  lines.push('|-------|------------|');
  for (const t of flattenForDoc(light)) {
    lines.push(`| \`--${t.path.replace(/\./g, '-')}\` | \`${t.ref}\` |`);
  }
  lines.push('');

  // Spacing
  lines.push('## Spacing (4px grid)');
  lines.push('');
  lines.push('| Step | Value |');
  lines.push('|------|-------|');
  for (const [step, t] of Object.entries(spacing)) {
    if (step === '$type') continue;
    lines.push(`| ${step} | ${t.$value} |`);
  }
  lines.push('');

  // Radius
  lines.push('## Radius');
  lines.push('');
  lines.push('| Step | Value |');
  lines.push('|------|-------|');
  for (const [step, t] of Object.entries(radius)) {
    if (step === '$type') continue;
    lines.push(`| ${step} | ${t.$value} |`);
  }
  lines.push('');

  // Typography
  lines.push('## Typography');
  lines.push('');
  lines.push('Responsive breakpoints: mobile (default) -> tablet (735px) -> desktop (1069px, fluid clamp to 1440px)');
  lines.push('');
  lines.push('### Semantic Roles');
  lines.push('');
  lines.push('| Token | Font Size Step | Line Height Step | Weight | Letter Spacing | Extras |');
  lines.push('|-------|---------------|-----------------|--------|---------------|--------|');

  const fontWeightMap = {};
  for (const [name, t] of Object.entries(typo.fontWeight)) {
    if (name !== '$type') fontWeightMap[name] = t.$value;
  }

  for (const [category, group] of Object.entries(typoSem)) {
    if (category === '$type') continue;
    for (const [size, token] of Object.entries(group)) {
      if (size === '$type') continue;
      const val = token.$value;
      const ext = token.$extensions?.['tech.vance.origin'] || {};
      const fsStep = val.fontSize.match(/\.(\d+)\}$/)?.[1] || '';
      const lhStep = val.lineHeight.match(/\.(\d+)\}$/)?.[1] || '';
      const lsStep = val.letterSpacing.match(/\.([\w-]+)\}$/)?.[1] || '';
      const fwName = val.fontWeight.match(/\.([\w]+)\}$/)?.[1] || '';
      const extras = [];
      if (ext.textCase === 'uppercase') extras.push('uppercase');
      if (ext.openTypeFeatures?.tnum) extras.push('tabular-nums');
      lines.push(`| ${category}.${size} | ${fsStep} | ${lhStep} | ${fontWeightMap[fwName] || 400} | ${lsStep} | ${extras.join(', ') || '-'} |`);
    }
  }
  lines.push('');

  // Conventions
  lines.push('## Conventions');
  lines.push('');
  lines.push('- Sentence case everywhere (headings, buttons, labels)');
  lines.push('- No em dashes: use colons, commas, periods, or parentheses');
  lines.push('- No italic: Haffer has no italic cuts');
  lines.push('- Use semantic tokens by role: body = readable content, label = metadata, title = structural headings');
  lines.push('- Dark mode: add `class="dark"` to any element');
  lines.push('- Brand photography uses `on-brand-light` tokens (white text)');
  lines.push('');

  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────

const OUT_JSON = resolve(ROOT, 'outputs/json');
const OUT_TW = resolve(ROOT, 'outputs/tailwind');
const OUT_AI = resolve(ROOT, 'outputs/ai');

mkdirSync(OUT_TS, { recursive: true });
mkdirSync(OUT_CSS, { recursive: true });
mkdirSync(OUT_JSON, { recursive: true });
mkdirSync(OUT_TW, { recursive: true });
mkdirSync(OUT_AI, { recursive: true });

const tsFiles = [
  ['responsive-typography.ts', buildResponsiveTypography()],
  ['typography.ts', buildTypography()],
  ['colors.ts', buildColors()],
  ['spacing.ts', buildSpacing()],
  ['radius.ts', buildRadius()],
  ['index.ts', buildBarrel()],
];

for (const [name, content] of tsFiles) {
  const path = resolve(OUT_TS, name);
  writeFileSync(path, content, 'utf-8');
  console.log(`  outputs/ts/${name}`);
}

const cssContent = buildCSS();
writeFileSync(resolve(OUT_CSS, 'tokens.css'), cssContent, 'utf-8');
console.log(`  outputs/css/tokens.css`);

const jsonContent = buildJSON();
writeFileSync(resolve(OUT_JSON, 'tokens.json'), jsonContent, 'utf-8');
console.log(`  outputs/json/tokens.json`);

const twContent = buildTailwind();
writeFileSync(resolve(OUT_TW, 'theme.js'), twContent, 'utf-8');
console.log(`  outputs/tailwind/theme.js`);

const aiContent = buildAI();
writeFileSync(resolve(OUT_AI, 'design-system.md'), aiContent, 'utf-8');
console.log(`  outputs/ai/design-system.md`);

console.log('\nBuild complete.');
