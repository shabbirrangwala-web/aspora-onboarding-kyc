"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PillButton } from "@/components/ui/pill-button";

export default function CardPage() {
  return (
    <PageShell title="Card">
      <Section title="Variants">
        <Card variant="raised" padding="lg">
          <CardHeader><CardTitle>Raised</CardTitle><CardDescription>Default surface for content blocks. bg-surface-secondary.</CardDescription></CardHeader>
        </Card>
        <Card variant="outline" padding="lg">
          <CardHeader><CardTitle>Outline</CardTitle><CardDescription>Lower-emphasis grouping. border-border-primary.</CardDescription></CardHeader>
        </Card>
        <Card variant="flat" padding="lg">
          <CardHeader><CardTitle>Flat</CardTitle><CardDescription>bg-surface-tertiary for subtle contrast.</CardDescription></CardHeader>
        </Card>
      </Section>

      <Section title="Padding">
        <Card variant="raised" padding="sm"><p className="type-labelMd text-on-surface-secondary">sm — 12px</p></Card>
        <Card variant="raised" padding="md"><p className="type-labelMd text-on-surface-secondary">md — 16px</p></Card>
        <Card variant="raised" padding="lg"><p className="type-labelMd text-on-surface-secondary">lg — 20px</p></Card>
        <Card variant="raised" padding="xl"><p className="type-labelMd text-on-surface-secondary">xl — 24px</p></Card>
      </Section>

      <Section title="Composed">
        <Card variant="raised" padding="lg">
          <CardHeader>
            <CardTitle>Featured</CardTitle>
            <CardDescription>With header, content, and footer actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="type-bodySm text-on-surface-secondary">
              Cards compose Header, Content, and Footer slots. Each slot is optional.
            </p>
          </CardContent>
          <CardFooter>
            <PillButton hierarchy="primary" size="xsmall">Action</PillButton>
            <PillButton hierarchy="tertiary" size="xsmall" hideTrailingArrow>Cancel</PillButton>
          </CardFooter>
        </Card>
      </Section>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-12">
      <h2 className="type-overline text-on-surface-tertiary">{title}</h2>
      <div className="flex flex-col gap-12">{children}</div>
    </div>
  );
}
