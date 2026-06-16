"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { ActionPrompt } from "@/components/ui/action-prompt";

export default function ActionPromptPage() {
  return (
    <PageShell title="Action Prompt">
      <Card padding="lg" className="flex flex-col gap-16">
        {/* Neutral */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Neutral</span>
          <ActionPrompt
            color="neutral"
            title="Complete your profile"
            description="Finish setting up your account to unlock all features."
            currentStep={1}
            totalSteps={3}
            primaryAction="Continue"
          />
        </div>

        {/* With two actions */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">With two actions</span>
          <ActionPrompt
            color="neutral"
            title="Verify your identity"
            description="Upload a government-issued ID to proceed."
            currentStep={2}
            totalSteps={3}
            primaryAction="Verify now"
            secondaryAction="Later"
          />
        </div>

        {/* Color variants */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Color variants</span>
          <div className="flex flex-col gap-12">
            <ActionPrompt
              color="accent"
              title="New feature available"
              primaryAction="Try it"
            />
            <ActionPrompt
              color="success"
              title="Transfer complete"
              primaryAction="View details"
            />
            <ActionPrompt
              color="warning"
              title="Action required"
              primaryAction="Review"
            />
            <ActionPrompt
              color="error"
              title="Payment failed"
              primaryAction="Retry"
            />
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
