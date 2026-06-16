"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { PillButton } from "@/components/ui/pill-button";
import { Card } from "@/components/ui/card";

export default function ToastPage() {
  return (
    <ToastProvider>
      <ToastContent />
    </ToastProvider>
  );
}

function ToastContent() {
  const { show } = useToast();

  return (
    <PageShell title="Toast">
      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Variants</span>
          <p className="type-bodySm text-on-surface-secondary">Tap to trigger each variant. Auto-dismiss after 3s.</p>
        </div>
        <div className="flex flex-wrap gap-8">
          <PillButton hierarchy="primary" size="xsmall" hideTrailingArrow onClick={() => show({ title: "Heads up", description: "Markets close in 30 min." })}>Neutral</PillButton>
          <PillButton hierarchy="secondary" size="xsmall" hideTrailingArrow onClick={() => show({ title: "Saved", description: "Your changes are live.", variant: "success" })}>Success</PillButton>
          <PillButton hierarchy="secondary" size="xsmall" hideTrailingArrow onClick={() => show({ title: "Heads up", description: "Verification expires in 24h.", variant: "warning" })}>Warning</PillButton>
          <PillButton hierarchy="secondary" size="xsmall" hideTrailingArrow onClick={() => show({ title: "Something went wrong", description: "Try again.", variant: "error" })}>Error</PillButton>
        </div>
      </Card>
    </PageShell>
  );
}
