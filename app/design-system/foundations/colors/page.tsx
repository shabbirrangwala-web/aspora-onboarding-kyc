"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { SwatchGroup, BrandRamp } from "@/components/design-system/ColorSwatch";

export default function ColorsPage() {
  return (
    <PageShell title="Colors">
      <Section title="Surface">
        <SwatchGroup
          title="Surface"
          swatches={[
            { name: "primary", cssVar: "--surface-primary", textCssVar: "--on-surface-primary", border: true },
            { name: "secondary", cssVar: "--surface-secondary", textCssVar: "--on-surface-primary", border: true },
            { name: "tertiary", cssVar: "--surface-tertiary", textCssVar: "--on-surface-primary", border: true },
            { name: "overlay", cssVar: "--surface-overlay", textCssVar: "--on-surface-primary", border: true },
            { name: "contrast", cssVar: "--surface-contrast", textCssVar: "--on-surface-contrast" },
          ]}
        />
      </Section>

      <Section title="On-surface">
        <SwatchGroup
          title="On-surface"
          swatches={[
            { name: "primary", cssVar: "--on-surface-primary", textCssVar: "--surface-primary" },
            { name: "secondary", cssVar: "--on-surface-secondary", textCssVar: "--surface-primary" },
            { name: "tertiary", cssVar: "--on-surface-tertiary", textCssVar: "--surface-primary" },
            { name: "disabled", cssVar: "--on-surface-disabled", textCssVar: "--surface-primary" },
            { name: "contrast", cssVar: "--on-surface-contrast", textCssVar: "--surface-contrast", border: true },
          ]}
        />
      </Section>

      <Section title="Border">
        <SwatchGroup
          title="Border"
          swatches={[
            { name: "primary", cssVar: "--border-primary", textCssVar: "--on-surface-primary" },
            { name: "secondary", cssVar: "--border-secondary", textCssVar: "--on-surface-primary" },
            { name: "disabled", cssVar: "--border-disabled", textCssVar: "--on-surface-primary" },
            { name: "contrast", cssVar: "--border-contrast", textCssVar: "--surface-primary" },
          ]}
        />
      </Section>

      <Section title="Interactive">
        <SwatchGroup
          title="Interactive"
          swatches={[
            { name: "primary", cssVar: "--interactive-primary", textCssVar: "--interactive-contrast" },
            { name: "secondary", cssVar: "--interactive-secondary", textCssVar: "--on-surface-primary", border: true },
            { name: "disabled", cssVar: "--interactive-disabled", textCssVar: "--on-surface-disabled", border: true },
            { name: "contrast", cssVar: "--interactive-contrast", textCssVar: "--interactive-primary", border: true },
          ]}
        />
      </Section>

      <Section title="Status">
        {(["error", "success", "warning", "accent"] as const).map((s) => (
          <SwatchGroup
            key={s}
            title={s}
            swatches={[
              { name: "solid", cssVar: `--${s}-solid`, textCssVar: `--${s}-on-solid` },
              { name: "light", cssVar: `--${s}-light`, textCssVar: `--${s}-on-light` },
              { name: "border", cssVar: `--${s}-border`, textCssVar: "--surface-primary" },
            ]}
          />
        ))}
      </Section>

      <Section title="Brand ramps">
        <BrandRamp name="neutral" cssVarPrefix="--color-neutral" />
        <BrandRamp name="maroon" cssVarPrefix="--color-maroon" />
        <BrandRamp name="crimson" cssVarPrefix="--color-crimson" />
        <BrandRamp name="peach" cssVarPrefix="--color-peach" />
        <BrandRamp name="gold" cssVarPrefix="--color-gold" />
        <BrandRamp name="lime" cssVarPrefix="--color-lime" />
        <BrandRamp name="teal" cssVarPrefix="--color-teal" />
        <BrandRamp name="blue" cssVarPrefix="--color-blue" />
        <BrandRamp name="red" cssVarPrefix="--color-red" />
        <BrandRamp name="green" cssVarPrefix="--color-green" />
        <BrandRamp name="yellow" cssVarPrefix="--color-yellow" />
      </Section>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-12">
      <h2 className="type-titleMd text-on-surface-primary">{title}</h2>
      <div className="flex flex-col gap-16">{children}</div>
    </div>
  );
}
