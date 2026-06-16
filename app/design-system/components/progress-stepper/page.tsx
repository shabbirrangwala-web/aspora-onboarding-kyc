"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { ProgressStepper } from "@/components/ui/progress-stepper";

export default function ProgressStepperPage() {
  return (
    <PageShell title="Progress Stepper">
      <Card padding="lg" className="flex flex-col gap-16">
        {/* Default */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Default</span>
          <ProgressStepper
            steps={[
              {
                title: "Identity verified",
                description: "Your identity has been confirmed.",
                status: "completed",
              },
              {
                title: "Link bank account",
                description: "Connect your bank to fund your account.",
                status: "in-progress",
              },
              {
                title: "Fund account",
                description: "Deposit funds to start investing.",
                status: "not-started",
              },
            ]}
          />
        </div>
      </Card>
    </PageShell>
  );
}
