/**
 * Generates DTCG-format color primitives from brand anchor definitions.
 * Same OKLCH algorithm as the original color-theory pipeline.
 *
 * Reads:  foundations/color/anchors.json
 * Writes: foundations/color/primitives.json (W3C DTCG format)
 *
 * Usage: npm run generate
 */

import { parse, oklch, rgb, clampChroma, formatHex } from "culori";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOUNDATIONS_DIR = resolve(__dirname, "../../../foundations/color");

// ── Constants ──

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 975, 1000] as const;

const LIGHTNESS_MAP: Record<number, number> = {
  50: 1.0, 100: 0.975, 200: 0.935, 300: 0.85, 400: 0.76, 500: 0.65,
  600: 0.54, 700: 0.43, 800: 0.33, 900: 0.23, 950: 0.18, 975: 0.15, 1000: 0.12,
};

const ALPHA_STEPS = [100, 70, 40, 16, 8] as const;

// ── Types ──

interface AnchorConfig {
  hex: string;
  step?: number;
  isNeutral?: boolean;
  neutralChromaMax?: number;
}

interface ColorStep {
  step: number;
  hex: string;
  isAnchor: boolean;
}

// ── OKLCH Helpers ──

function hexToOklch(hex: string) {
  const parsed = parse(hex);
  if (!parsed) throw new Error(`Cannot parse color: ${hex}`);
  const o = oklch(parsed);
  if (!o) throw new Error(`Cannot convert to OKLCH: ${hex}`);
  return { l: o.l, c: o.c || 0, h: o.h || 0 };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function rgbToHex(r: number, g: number, b: number, a: number): string {
  const rr = Math.round(clamp01(r) * 255).toString(16).padStart(2, "0");
  const gg = Math.round(clamp01(g) * 255).toString(16).padStart(2, "0");
  const bb = Math.round(clamp01(b) * 255).toString(16).padStart(2, "0");
  if (a >= 1) return `#${rr}${gg}${bb}`;
  const aa = Math.round(clamp01(a) * 255).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}${aa}`;
}

// ── Ramp Generation ──

function generateRamp(config: AnchorConfig): ColorStep[] {
  const anchor = hexToOklch(config.hex);
  const hue = anchor.h;
  const isNeutral = config.isNeutral || false;

  // Find which step the anchor naturally sits closest to
  let anchorStep = 500;
  let minDist = Infinity;
  for (const [step, l] of Object.entries(LIGHTNESS_MAP)) {
    const dist = Math.abs(anchor.l - l);
    if (dist < minDist) {
      minDist = dist;
      anchorStep = parseInt(step);
    }
  }

  return STEPS.map((step) => {
    // Chromatic ramps use 0.985 at step 50 for a barely-there tint; neutral stays 1.0
    const targetL = step === 50 && !isNeutral ? 0.985 : LIGHTNESS_MAP[step];
    let chroma: number;

    if (isNeutral) {
      const maxC = config.neutralChromaMax || 0.012;
      const t = Math.max(0, (1.0 - targetL) / 0.88);
      chroma = maxC * Math.pow(t, 0.7);
    } else {
      const anchorC = anchor.c;
      const distFromAnchor = Math.abs(targetL - anchor.l);
      const maxDist = Math.max(anchor.l - 0.12, 0.97 - anchor.l);
      const normalizedDist = maxDist > 0 ? distFromAnchor / maxDist : 0;
      const falloff = 1 - 0.75 * Math.pow(normalizedDist, 1.5);
      chroma = anchorC * Math.max(0.12, falloff);
    }

    // At the anchor step, use the exact original hex for brand fidelity
    const useOriginal = step === anchorStep && !isNeutral;

    if (useOriginal) {
      const p = parse(config.hex)!;
      const rgbColor = rgb(p)!;
      return {
        step,
        hex: config.hex.toLowerCase(),
        isAnchor: true,
      };
    }

    const color = { mode: "oklch" as const, l: targetL, c: chroma, h: hue };
    const clamped = clampChroma(color, "oklch");
    const rgbColor = rgb(clamped)!;
    return {
      step,
      hex: formatHex(rgbColor),
      isAnchor: false,
    };
  });
}

function generateAlphaRamp(r: number, g: number, b: number): ColorStep[] {
  return ALPHA_STEPS.map((step) => {
    const a = step / 100;
    return { step, hex: rgbToHex(r, g, b, a), isAnchor: false };
  });
}

// ── DTCG Output ──

function buildDtcgPrimitives(ramps: Record<string, ColorStep[]>): object {
  const color: Record<string, any> = { "$type": "color" };

  for (const [rampName, steps] of Object.entries(ramps)) {
    const rampObj: Record<string, any> = {};
    for (const step of steps) {
      const entry: Record<string, string> = { "$value": step.hex };
      if (step.isAnchor) {
        entry["$description"] = "Brand anchor";
      }
      rampObj[String(step.step)] = entry;
    }
    color[rampName] = rampObj;
  }

  return { color };
}

// ── Main ──

// Read anchors
const anchorsPath = resolve(FOUNDATIONS_DIR, "anchors.json");
const anchors: Record<string, AnchorConfig> = JSON.parse(readFileSync(anchorsPath, "utf-8"));

// Generate chromatic ramps
const ramps: Record<string, ColorStep[]> = {};
for (const [name, config] of Object.entries(anchors)) {
  ramps[name] = generateRamp(config);
}

// Generate alpha ramps
ramps["white-alpha"] = generateAlphaRamp(1, 1, 1);
ramps["black-alpha"] = generateAlphaRamp(0, 0, 0);

// Build DTCG and write
const dtcg = buildDtcgPrimitives(ramps);
const outPath = resolve(FOUNDATIONS_DIR, "primitives.json");
writeFileSync(outPath, JSON.stringify(dtcg, null, 2) + "\n");

// Summary
const totalColors = Object.values(ramps).reduce((sum, r) => sum + r.length, 0);
console.log(`Generated ${Object.keys(ramps).length} ramps, ${totalColors} colors total`);
console.log(`Output: ${outPath}`);

// Verification: print anchor steps
for (const [name, ramp] of Object.entries(ramps)) {
  const anchor = ramp.find(s => s.isAnchor);
  if (anchor) {
    console.log(`  ${name}: anchor at step ${anchor.step} = ${anchor.hex}`);
  } else {
    console.log(`  ${name}: no anchor (neutral/alpha)`);
  }
}
