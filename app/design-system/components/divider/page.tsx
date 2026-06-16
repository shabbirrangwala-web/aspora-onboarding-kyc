"use client";

import * as React from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";

export default function DividerPage() {
  return (
    <PageShell title="Divider">
      <Section title="Content (1px)">
        <Divider type="content" />
      </Section>

      <Section title="Section (4px)">
        <Divider type="section" />
      </Section>

      <Section title="With inset">
        <Divider inset={56} />
      </Section>

      <Section title="In context">
        <div className="flex flex-col">
          <div className="flex items-center gap-12 py-12">
            <div className="h-40 w-40 shrink-0 rounded-full bg-accent-solid" />
            <div className="flex flex-col gap-2">
              <span className="type-labelMd text-on-surface-primary">Alice Johnson</span>
              <span className="type-bodySm text-on-surface-secondary">Received $250.00</span>
            </div>
          </div>
          <Divider inset={56} />
          <div className="flex items-center gap-12 py-12">
            <div className="h-40 w-40 shrink-0 rounded-full bg-success-solid" />
            <div className="flex flex-col gap-2">
              <span className="type-labelMd text-on-surface-primary">Bob Smith</span>
              <span className="type-bodySm text-on-surface-secondary">Sent $120.00</span>
            </div>
          </div>
          <Divider inset={56} />
          <div className="flex items-center gap-12 py-12">
            <div className="h-40 w-40 shrink-0 rounded-full bg-warning-solid" />
            <div className="flex flex-col gap-2">
              <span className="type-labelMd text-on-surface-primary">Carol Davis</span>
              <span className="type-bodySm text-on-surface-secondary">Pending $80.00</span>
            </div>
          </div>
        </div>
      </Section>
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
