"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { SpacingScale } from "@/components/design-system/ScaleViz";
import { Card } from "@/components/ui/card";

export default function SpacingPage() {
  return (
    <PageShell title="Spacing">
      <Card padding="lg">
        <SpacingScale />
      </Card>
      <Card padding="lg">
        <p className="type-bodySm text-on-surface-tertiary">
          12-step scale in px. Used for padding, gaps, and margins. Values: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80.
        </p>
      </Card>
    </PageShell>
  );
}
