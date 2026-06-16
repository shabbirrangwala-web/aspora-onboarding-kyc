"use client";

import { cn } from "@/lib/utils";

interface SwatchProps {
  name: string;
  cssVar: string;
  textCssVar?: string;
  border?: boolean;
}

export function ColorSwatch({ name, cssVar, textCssVar, border }: SwatchProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "flex h-56 items-end rounded-12 p-8",
          border && "border border-border-primary"
        )}
        style={{
          backgroundColor: `var(${cssVar})`,
          color: textCssVar ? `var(${textCssVar})` : undefined,
        }}
      >
        <span className="type-labelMd opacity-90">{cssVar}</span>
      </div>
      <span className="type-labelHeavyMd text-on-surface-primary">{name}</span>
    </div>
  );
}

interface SwatchGroupProps {
  title: string;
  swatches: SwatchProps[];
}

export function SwatchGroup({ title, swatches }: SwatchGroupProps) {
  return (
    <div className="flex flex-col gap-12">
      <h3 className="type-overline text-on-surface-tertiary">{title}</h3>
      <div className="grid grid-cols-2 gap-12">
        {swatches.map((s) => (
          <ColorSwatch key={s.cssVar} {...s} />
        ))}
      </div>
    </div>
  );
}

export function BrandRamp({ name, cssVarPrefix }: { name: string; cssVarPrefix: string }) {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 975, 1000];
  return (
    <div className="flex flex-col gap-4">
      <span className="type-labelHeavyMd text-on-surface-primary capitalize">{name}</span>
      <div className="flex h-32 overflow-hidden rounded-8">
        {steps.map((s) => (
          <div
            key={s}
            className="flex-1"
            style={{ backgroundColor: `var(${cssVarPrefix}-${s})` }}
            title={`${cssVarPrefix}-${s}`}
          />
        ))}
      </div>
    </div>
  );
}
