"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function BadgePage() {
  return (
    <PageShell title="Badge">
      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">All variants</span>
          <div className="flex flex-wrap gap-8">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="solid">Solid</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Usage examples</span>
          <div className="flex flex-wrap gap-8">
            <Badge variant="success">+12.4%</Badge>
            <Badge variant="error">-3.2%</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="accent">New</Badge>
            <Badge variant="neutral">v0.1</Badge>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
