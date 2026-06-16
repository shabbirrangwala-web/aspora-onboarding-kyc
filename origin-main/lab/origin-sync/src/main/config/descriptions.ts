const DESCRIPTIONS: Record<string, string> = {
  "color.brand.maroon":  "Pair with on-brand/light",
  "color.brand.crimson": "Pair with on-brand/light",
  "color.brand.teal":    "Pair with on-brand/light",
  "color.brand.blue":    "Pair with on-brand/light",
  "color.brand.peach":   "Pair with on-brand/dark",
  "color.brand.gold":    "Pair with on-brand/dark",
  "color.brand.lime":    "Pair with on-brand/dark",
  "radius.full": "Fully rounded — produces pill/capsule shapes",
};

export function getTokenDescription(tokenPath: string): string | undefined {
  return DESCRIPTIONS[tokenPath];
}
