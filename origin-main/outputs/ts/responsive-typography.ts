/**
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
  { step: '100', mobile: 12,    tablet: 13,    desktopFloor: 14,  desktopCeil: 14 },
  { step: '200', mobile: 12,    tablet: 13,    desktopFloor: 14,  desktopCeil: 15 },
  { step: '300', mobile: 14,    tablet: 15,    desktopFloor: 16,  desktopCeil: 17 },
  { step: '350', mobile: 16,    tablet: 18,    desktopFloor: 20,  desktopCeil: 22 },
  { step: '400', mobile: 16,    tablet: 17,    desktopFloor: 18,  desktopCeil: 20 },
  { step: '450', mobile: 18,    tablet: 20,    desktopFloor: 22,  desktopCeil: 24 },
  { step: '500', mobile: 20,    tablet: 22,    desktopFloor: 24,  desktopCeil: 28 },
  { step: '600', mobile: 24,    tablet: 28,    desktopFloor: 32,  desktopCeil: 36 },
  { step: '700', mobile: 24,    tablet: 26,    desktopFloor: 36,  desktopCeil: 40 },
  { step: '800', mobile: 32,    tablet: 36,    desktopFloor: 44,  desktopCeil: 48 },
  { step: '900', mobile: 36,    tablet: 40,    desktopFloor: 52,  desktopCeil: 56 },
  { step: '1000', mobile: 36,    tablet: 40,    desktopFloor: 48,  desktopCeil: 56 },
  { step: '1100', mobile: 45,    tablet: 52,    desktopFloor: 64,  desktopCeil: 72 },
  { step: '1200', mobile: 57,    tablet: 64,    desktopFloor: 84,  desktopCeil: 92 },
];

/* ── Line height ratios (unitless) ── */

export type LineHeightStep = {
  step: string;
  value: number;
};

export const LINE_HEIGHT_SCALE: LineHeightStep[] = [
  { step: '100', value: 1 },
  { step: '110', value: 1.1 },
  { step: '120', value: 1.2 },
  { step: '130', value: 1.3 },
  { step: '140', value: 1.4 },
  { step: '150', value: 1.5 },
  { step: '160', value: 1.6 },
  { step: '090', value: 0.9 },
  { step: '095', value: 0.95 },
];

/* ── Letter spacing ── */

export const LETTER_SPACING = [
  { step: 'tight-4',  value: '-2%' },
  { step: 'tight-3',  value: '-1.7%' },
  { step: 'tight-2',  value: '-1%' },
  { step: 'tight-1',  value: '-0.9%' },
  { step: 'tight-0',  value: '-0.6%' },
  { step: 'none',     value: '0%' },
  { step: 'wide-1',   value: '0.5%' },
  { step: 'wide-2',   value: '1.5%' },
] as const;

/* ── Clamp generator ── */

export function generateClamp(floor: number, ceil: number): string {
  if (floor === ceil) return `${round(floor / 16)}rem`;
  const range = BREAKPOINTS.ceiling - BREAKPOINTS.desktop;
  const slope = ((ceil - floor) / range) * 100;
  const intercept = floor - ((ceil - floor) / range) * BREAKPOINTS.desktop;
  return `clamp(${round(floor / 16)}rem, ${round(intercept / 16)}rem + ${round(slope)}vw, ${round(ceil / 16)}rem)`;
}

function round(n: number): string {
  return (Math.round(n * 10000) / 10000).toString();
}

/* ── CSS generator ── */

export function generateResponsiveCSS(): string {
  const lines: string[] = [];

  lines.push('/* ═══ Responsive Typography Primitives ═══');
  lines.push('   Auto-generated from Origin foundations');
  lines.push('   Mobile-first: base → tablet (735px) → desktop (1069px) */\n');

  lines.push(':root {');
  for (const s of FONT_SIZE_SCALE) lines.push(`  --typo-fs-${s.step}: ${round(s.mobile / 16)}rem;`);
  for (const s of LINE_HEIGHT_SCALE) lines.push(`  --typo-lh-${s.step}: ${round(s.mobile / 16)}rem;`);
  for (const s of LETTER_SPACING) {
    const em = parseFloat(s.value) / 100;
    lines.push(`  --typo-ls-${s.step}: ${em === 0 ? '0' : parseFloat(em.toFixed(4)) + 'em'};`);
  }
  lines.push('}\n');

  lines.push('@media (min-width: 735px) {');
  lines.push('  :root {');
  for (const s of FONT_SIZE_SCALE) if (s.tablet !== s.mobile) lines.push(`    --typo-fs-${s.step}: ${round(s.tablet / 16)}rem;`);
  for (const s of LINE_HEIGHT_SCALE) if (s.tablet !== s.mobile) lines.push(`    --typo-lh-${s.step}: ${round(s.tablet / 16)}rem;`);
  lines.push('  }');
  lines.push('}\n');

  lines.push('@media (min-width: 1069px) {');
  lines.push('  :root {');
  for (const s of FONT_SIZE_SCALE) lines.push(`    --typo-fs-${s.step}: ${generateClamp(s.desktopFloor, s.desktopCeil)};`);
  for (const s of LINE_HEIGHT_SCALE) lines.push(`    --typo-lh-${s.step}: ${generateClamp(s.desktopFloor, s.desktopCeil)};`);
  lines.push('  }');
  lines.push('}');

  return lines.join('\n');
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
  { name: 'display.s',             category: 'Display',         size: 'S', fontSize: '1000', fontWeight: 900, lineHeight: '100', letterSpacing: 'tight-2', textCase: 'uppercase' },
  { name: 'display.m',             category: 'Display',         size: 'M', fontSize: '1100', fontWeight: 900, lineHeight: '100', letterSpacing: 'tight-2', textCase: 'uppercase' },
  { name: 'display.l',             category: 'Display',         size: 'L', fontSize: '1200', fontWeight: 900, lineHeight: '095', letterSpacing: 'tight-2', textCase: 'uppercase' },
  { name: 'header.s',              category: 'Header',          size: 'S', fontSize: '700', fontWeight: 700, lineHeight: '120', letterSpacing: 'tight-2' },
  { name: 'header.m',              category: 'Header',          size: 'M', fontSize: '800', fontWeight: 700, lineHeight: '120', letterSpacing: 'tight-2' },
  { name: 'header.l',              category: 'Header',          size: 'L', fontSize: '900', fontWeight: 700, lineHeight: '120', letterSpacing: 'tight-2' },
  { name: 'title.s',               category: 'Title',           size: 'S', fontSize: '400', fontWeight: 600, lineHeight: '140', letterSpacing: 'tight-0' },
  { name: 'title.m',               category: 'Title',           size: 'M', fontSize: '450', fontWeight: 600, lineHeight: '130', letterSpacing: 'tight-1' },
  { name: 'title.l',               category: 'Title',           size: 'L', fontSize: '500', fontWeight: 600, lineHeight: '120', letterSpacing: 'tight-3' },
  { name: 'label.s',               category: 'Label',           size: 'S', fontSize: '100', fontWeight: 400, lineHeight: '140', letterSpacing: 'wide-1' },
  { name: 'label.m',               category: 'Label',           size: 'M', fontSize: '200', fontWeight: 400, lineHeight: '140', letterSpacing: 'none' },
  { name: 'label.l',               category: 'Label',           size: 'L', fontSize: '300', fontWeight: 400, lineHeight: '140', letterSpacing: 'tight-0' },
  { name: 'label-heavy.s',         category: 'Label Heavy',     size: 'S', fontSize: '100', fontWeight: 500, lineHeight: '140', letterSpacing: 'wide-1' },
  { name: 'label-heavy.m',         category: 'Label Heavy',     size: 'M', fontSize: '200', fontWeight: 500, lineHeight: '140', letterSpacing: 'none' },
  { name: 'label-heavy.l',         category: 'Label Heavy',     size: 'L', fontSize: '300', fontWeight: 500, lineHeight: '140', letterSpacing: 'tight-0' },
  { name: 'label-mono.s',          category: 'Label Mono',      size: 'S', fontSize: '100', fontWeight: 400, lineHeight: '140', letterSpacing: 'wide-1' },
  { name: 'label-mono.m',          category: 'Label Mono',      size: 'M', fontSize: '200', fontWeight: 400, lineHeight: '140', letterSpacing: 'none' },
  { name: 'label-mono.l',          category: 'Label Mono',      size: 'L', fontSize: '300', fontWeight: 400, lineHeight: '140', letterSpacing: 'tight-0' },
  { name: 'label-mono-heavy.s',    category: 'Label Mono Heavy', size: 'S', fontSize: '100', fontWeight: 500, lineHeight: '140', letterSpacing: 'wide-1' },
  { name: 'label-mono-heavy.m',    category: 'Label Mono Heavy', size: 'M', fontSize: '200', fontWeight: 500, lineHeight: '140', letterSpacing: 'none' },
  { name: 'label-mono-heavy.l',    category: 'Label Mono Heavy', size: 'L', fontSize: '300', fontWeight: 500, lineHeight: '140', letterSpacing: 'tight-0' },
  { name: 'body.s',                category: 'Body',            size: 'S', fontSize: '200', fontWeight: 400, lineHeight: '150', letterSpacing: 'none' },
  { name: 'body.m',                category: 'Body',            size: 'M', fontSize: '300', fontWeight: 400, lineHeight: '150', letterSpacing: 'tight-0' },
  { name: 'body.l',                category: 'Body',            size: 'L', fontSize: '400', fontWeight: 400, lineHeight: '150', letterSpacing: 'tight-1' },
  { name: 'number.s',              category: 'Number',          size: 'S', fontSize: '200', fontWeight: 500, lineHeight: '140', letterSpacing: 'none', tnum: true },
  { name: 'number.m',              category: 'Number',          size: 'M', fontSize: '300', fontWeight: 500, lineHeight: '140', letterSpacing: 'tight-0', tnum: true },
  { name: 'number.l',              category: 'Number',          size: 'L', fontSize: '400', fontWeight: 500, lineHeight: '140', letterSpacing: 'tight-1', tnum: true },
  { name: 'number.display-xs',     category: 'Number',          size: 'DISPLAY-XS', fontSize: '800', fontWeight: 900, lineHeight: '100', letterSpacing: 'tight-2', textCase: 'uppercase' },
  { name: 'number.display-s',      category: 'Number',          size: 'DISPLAY-S', fontSize: '1000', fontWeight: 900, lineHeight: '100', letterSpacing: 'tight-2', textCase: 'uppercase' },
  { name: 'number.display-m',      category: 'Number',          size: 'DISPLAY-M', fontSize: '1100', fontWeight: 900, lineHeight: '100', letterSpacing: 'tight-2', textCase: 'uppercase' },
  { name: 'number.display-l',      category: 'Number',          size: 'DISPLAY-L', fontSize: '1200', fontWeight: 900, lineHeight: '095', letterSpacing: 'tight-2', textCase: 'uppercase' },
  { name: 'overline.standard',     category: 'Overline',        size: '-', fontSize: '100', fontWeight: 600, lineHeight: '140', letterSpacing: 'wide-2', textCase: 'uppercase' },
  { name: 'overline.l',            category: 'Overline',        size: 'L', fontSize: '200', fontWeight: 600, lineHeight: '140', letterSpacing: 'wide-2', textCase: 'uppercase' },
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
