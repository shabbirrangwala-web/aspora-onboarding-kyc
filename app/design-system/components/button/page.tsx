"use client";

import * as React from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { StandardButton } from "@/components/ui/button";
import { PillButton } from "@/components/ui/pill-button";
import { DestructiveButton } from "@/components/ui/destructive-button";
import { SwipeButton } from "@/components/ui/swipe-button";
import { Card } from "@/components/ui/card";

export default function ButtonPage() {
  return (
    <PageShell title="Button">
      <Section title="Standard button" description="Full-width CTA. Hierarchy: Primary / Secondary / Tertiary. States: Default, Pressed, Disabled, Loading.">
        <Subsection label="Hierarchy">
          <div className="flex flex-col gap-12">
            <StandardButton hierarchy="primary">Continue</StandardButton>
            <StandardButton hierarchy="secondary">Continue</StandardButton>
            <StandardButton hierarchy="tertiary">Continue</StandardButton>
          </div>
        </Subsection>
        <Subsection label="Disabled">
          <div className="flex flex-col gap-12">
            <StandardButton hierarchy="primary" disabled>Continue</StandardButton>
            <StandardButton hierarchy="secondary" disabled>Continue</StandardButton>
            <StandardButton hierarchy="tertiary" disabled>Continue</StandardButton>
          </div>
        </Subsection>
        <Subsection label="Loading">
          <div className="flex flex-col gap-12">
            <StandardButton hierarchy="primary" loading>Continue</StandardButton>
            <StandardButton hierarchy="secondary" loading>Continue</StandardButton>
          </div>
        </Subsection>
      </Section>

      <Section title="Pill button" description="Compact inline action. Sizes: Small / XSmall. Hierarchy: Primary / Contrast / Secondary / Tertiary. Trailing arrow.">
        <Subsection label="Small">
          <div className="flex flex-wrap gap-8">
            <PillButton hierarchy="primary" size="small">Send money</PillButton>
            <PillButton hierarchy="contrast" size="small">Send money</PillButton>
            <PillButton hierarchy="secondary" size="small">Send money</PillButton>
            <PillButton hierarchy="tertiary" size="small">Send money</PillButton>
          </div>
        </Subsection>
        <Subsection label="XSmall">
          <div className="flex flex-wrap gap-8">
            <PillButton hierarchy="primary" size="xsmall">Send money</PillButton>
            <PillButton hierarchy="contrast" size="xsmall">Send money</PillButton>
            <PillButton hierarchy="secondary" size="xsmall">Send money</PillButton>
            <PillButton hierarchy="tertiary" size="xsmall">Send money</PillButton>
          </div>
        </Subsection>
        <Subsection label="Pressed (tap to see)">
          <div className="flex flex-wrap gap-8">
            <PillButton hierarchy="primary" size="small">Send money</PillButton>
            <PillButton hierarchy="secondary" size="small">Send money</PillButton>
          </div>
        </Subsection>
        <Subsection label="Disabled">
          <div className="flex flex-wrap gap-8">
            <PillButton hierarchy="primary" size="small" disabled>Send money</PillButton>
            <PillButton hierarchy="contrast" size="small" disabled>Send money</PillButton>
            <PillButton hierarchy="secondary" size="small" disabled>Send money</PillButton>
            <PillButton hierarchy="tertiary" size="small" disabled>Send money</PillButton>
          </div>
        </Subsection>
      </Section>

      <Section title="Destructive button" description="Full-width danger action. Hierarchy: Primary (solid red) / Tertiary (text red, underlined).">
        <Subsection label="Default">
          <div className="flex flex-col gap-12">
            <DestructiveButton hierarchy="primary">Delete</DestructiveButton>
            <DestructiveButton hierarchy="tertiary">Delete</DestructiveButton>
          </div>
        </Subsection>
        <Subsection label="Disabled">
          <div className="flex flex-col gap-12">
            <DestructiveButton hierarchy="primary" disabled>Delete</DestructiveButton>
            <DestructiveButton hierarchy="tertiary" disabled>Delete</DestructiveButton>
          </div>
        </Subsection>
        <Subsection label="Loading">
          <DestructiveButton hierarchy="primary" loading>Delete</DestructiveButton>
        </Subsection>
      </Section>

      <Section title="Swipe button" description="Drag-to-confirm gesture. States: Default / Swiping / Completed.">
        <Subsection label="Default (drag to confirm)">
          <SwipeButton label="Swipe to confirm" completedLabel="Confirmed" />
        </Subsection>
      </Section>
    </PageShell>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <h2 className="type-titleLg text-on-surface-primary">{title}</h2>
        <p className="type-bodySm text-on-surface-tertiary">{description}</p>
      </div>
      <div className="flex flex-col gap-16">{children}</div>
    </div>
  );
}

function Subsection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card padding="lg" className="flex flex-col gap-12">
      <span className="type-overline text-on-surface-tertiary">{label}</span>
      {children}
    </Card>
  );
}
