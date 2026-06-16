"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { SnackbarProvider, useSnackbar } from "@/components/ui/snackbar";
import { PillButton } from "@/components/ui/pill-button";
import { Card } from "@/components/ui/card";

export default function SnackbarPage() {
  return (
    <SnackbarProvider>
      <SnackbarContent />
    </SnackbarProvider>
  );
}

function SnackbarContent() {
  const { show } = useSnackbar();

  return (
    <PageShell title="Snackbar">
      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Default</span>
          <p className="type-bodySm text-on-surface-secondary">Dark surface with label. Auto-dismiss after 4s.</p>
        </div>
        <div className="flex flex-wrap gap-8">
          <PillButton
            hierarchy="primary"
            size="xsmall"
            hideTrailingArrow
            onClick={() => show({ label: "Changes saved" })}
          >
            Basic
          </PillButton>
          <PillButton
            hierarchy="secondary"
            size="xsmall"
            hideTrailingArrow
            onClick={() => show({ label: "Item deleted", showIcon: true })}
          >
            With icon
          </PillButton>
          <PillButton
            hierarchy="secondary"
            size="xsmall"
            hideTrailingArrow
            onClick={() =>
              show({
                label: "Message sent",
                actionLabel: "Undo",
                onAction: () => {},
              })
            }
          >
            With action
          </PillButton>
          <PillButton
            hierarchy="secondary"
            size="xsmall"
            hideTrailingArrow
            onClick={() =>
              show({ label: "Processing transfer…", loading: true, duration: 6000 })
            }
          >
            Loading
          </PillButton>
        </div>
      </Card>
    </PageShell>
  );
}
