"use client";

import * as React from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Sheet } from "@/components/ui/sheet";
import { StandardButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SheetPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <PageShell title="Sheet">
      <Card padding="lg" className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Bottom sheet</span>
          <p className="type-bodySm text-on-surface-secondary">Drag-to-dismiss. Spring animation. Scrim overlay. Max 430px width.</p>
        </div>
        <StandardButton hierarchy="secondary" onClick={() => setOpen(true)}>Open sheet</StandardButton>
      </Card>

      <Sheet open={open} onOpenChange={setOpen} title="Confirm trade">
        <p className="type-bodyMd text-on-surface-secondary">
          You are buying 0.0421 BTC at the current market price.
        </p>
        <div className="grid grid-cols-2 gap-8 pt-12">
          <StandardButton hierarchy="tertiary" onClick={() => setOpen(false)}>Cancel</StandardButton>
          <StandardButton hierarchy="primary" onClick={() => setOpen(false)}>Confirm</StandardButton>
        </div>
      </Sheet>
    </PageShell>
  );
}
