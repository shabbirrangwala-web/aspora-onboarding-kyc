"use client";

import * as React from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function AlertPage() {
  return (
    <PageShell title="Alert">
      <Section title="Section variants">
        <div className="flex flex-col gap-12">
          <Alert type="section" color="neutral" title="Neutral" body="This is a neutral section alert with additional context." />
          <Alert type="section" color="success" title="Success" body="Your transfer has been completed successfully." />
          <Alert type="section" color="warning" title="Warning" body="Your account verification is pending review." />
          <Alert type="section" color="error" title="Error" body="We couldn't process your payment. Please try again." />
          <Alert type="section" color="accent" title="Accent" body="New feature available! Try our investment tools." />
        </div>
      </Section>

      <Section title="Inline variants">
        <div className="flex flex-col gap-12">
          <Alert type="inline" color="neutral" title="Neutral inline alert" />
          <Alert type="inline" color="success" title="Success inline alert" />
          <Alert type="inline" color="warning" title="Warning inline alert" />
          <Alert type="inline" color="error" title="Error inline alert" />
          <Alert type="inline" color="accent" title="Accent inline alert" />
        </div>
      </Section>

      <Section title="With action">
        <Alert
          type="section"
          color="neutral"
          title="Complete your profile"
          body="Add your bank details to start sending money."
          actionLabel="Send money"
          onAction={() => {}}
        />
      </Section>

      <Section title="Dismissible">
        <Alert
          type="section"
          color="neutral"
          title="Scheduled maintenance"
          body="We'll be performing maintenance on May 10th from 2-4am UTC."
          canDismiss
          onDismiss={() => {}}
        />
      </Section>

      <Section title="Icon only">
        <Alert
          type="section"
          color="neutral"
          title="Compact alert with icon and title only"
        />
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
