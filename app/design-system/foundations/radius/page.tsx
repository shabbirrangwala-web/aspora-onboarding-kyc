"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { RadiusScale } from "@/components/design-system/ScaleViz";
import { Card } from "@/components/ui/card";

export default function RadiusPage() {
  return (
    <PageShell title="Radius">
      <Card padding="lg">
        <RadiusScale />
      </Card>
      <Card padding="lg">
        <p className="type-bodySm text-on-surface-tertiary">
          8-step scale. Values: 4, 8, 12, 16, 20, 24, 36, full (9999px). Buttons and pills use full. Cards use 16. Inputs use 12.
        </p>
      </Card>
    </PageShell>
  );
}
