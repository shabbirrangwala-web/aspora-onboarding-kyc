"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { TypeSpecimen } from "@/components/design-system/TypeSpecimen";
import { Card } from "@/components/ui/card";

export default function TypographyPage() {
  return (
    <PageShell title="Typography">
      <Section title="Display">
        <TypeSpecimen className="type-displayLg" label="Display Lg — Heavy 900, uppercase" sample="ORIGIN" />
        <TypeSpecimen className="type-displayMd" label="Display Md" sample="ORIGIN" />
        <TypeSpecimen className="type-displaySm" label="Display Sm" sample="ORIGIN" />
      </Section>

      <Section title="Header">
        <TypeSpecimen className="type-headerLg" label="Header Lg — Bold 700" />
        <TypeSpecimen className="type-headerMd" label="Header Md" />
        <TypeSpecimen className="type-headerSm" label="Header Sm" />
      </Section>

      <Section title="Title">
        <TypeSpecimen className="type-titleLg" label="Title Lg — SemiBold 600" />
        <TypeSpecimen className="type-titleMd" label="Title Md" />
        <TypeSpecimen className="type-titleSm" label="Title Sm" />
      </Section>

      <Section title="Body">
        <TypeSpecimen className="type-bodyLg" label="Body Lg — Regular 400" sample="The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs." />
        <TypeSpecimen className="type-bodyMd" label="Body Md" sample="The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs." />
        <TypeSpecimen className="type-bodySm" label="Body Sm" sample="The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs." />
      </Section>

      <Section title="Label">
        <TypeSpecimen className="type-labelLg" label="Label Lg — Regular 400" />
        <TypeSpecimen className="type-labelMd" label="Label Md" />
        <TypeSpecimen className="type-labelSm" label="Label Sm" />
      </Section>

      <Section title="Label heavy">
        <TypeSpecimen className="type-labelHeavyLg" label="Label Heavy Lg — Medium 500" />
        <TypeSpecimen className="type-labelHeavyMd" label="Label Heavy Md" />
        <TypeSpecimen className="type-labelHeavySm" label="Label Heavy Sm" />
      </Section>

      <Section title="Number">
        <TypeSpecimen className="type-numberLg" label="Number Lg — Medium 500, tabular-nums" sample="1,234,567.89" />
        <TypeSpecimen className="type-numberMd" label="Number Md" sample="1,234,567.89" />
        <TypeSpecimen className="type-numberSm" label="Number Sm" sample="1,234,567.89" />
      </Section>

      <Section title="Number display">
        <TypeSpecimen className="type-displayLg font-mono" label="Number Display Lg" sample="$42,069.00" />
        <TypeSpecimen className="type-displayMd font-mono" label="Number Display Md" sample="$42,069.00" />
        <TypeSpecimen className="type-displaySm font-mono" label="Number Display Sm" sample="$42,069.00" />
      </Section>

      <Section title="Overline">
        <TypeSpecimen className="type-overline" label="Overline — SemiBold 600, uppercase, wide tracking" sample="OVERLINE TEXT" />
        <TypeSpecimen className="type-overlineLg" label="Overline Lg" sample="OVERLINE TEXT" />
      </Section>

      <Card padding="lg" className="mt-12">
        <p className="type-bodySm text-on-surface-tertiary">
          Typography is responsive across 3 breakpoints (mobile → tablet → desktop) via CSS clamp(). All sizes use rem for accessibility. Haffer is the primary typeface; Haffer Mono for tabular/code content.
        </p>
      </Card>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-12">
      <h2 className="type-overline text-on-surface-tertiary">{title}</h2>
      <Card padding="lg" className="flex flex-col gap-12">
        {children}
      </Card>
    </div>
  );
}
