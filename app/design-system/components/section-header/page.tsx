"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { SectionHeader } from "@/components/ui/section-header";
import { PillButton } from "@/components/ui/pill-button";
import { Card } from "@/components/ui/card";

export default function SectionHeaderPage() {
  return (
    <PageShell title="Section header">
      <Card padding="none" className="flex flex-col overflow-hidden">
        <div className="px-20 pt-16">
          <span className="type-overline text-on-surface-tertiary">Default size</span>
        </div>
        <SectionHeader
          title="Your portfolio"
          subtitle="Updated just now"
          showDivider
        />
      </Card>

      <Card padding="none" className="flex flex-col overflow-hidden">
        <div className="px-20 pt-16">
          <span className="type-overline text-on-surface-tertiary">Small size</span>
        </div>
        <SectionHeader
          size="small"
          title="Recent transactions"
          subtitle="Last 30 days"
          showDivider
        />
      </Card>

      <Card padding="none" className="flex flex-col overflow-hidden">
        <div className="px-20 pt-16">
          <span className="type-overline text-on-surface-tertiary">With action</span>
        </div>
        <SectionHeader
          title="Watchlist"
          action={
            <PillButton hierarchy="secondary" size="xsmall" hideTrailingArrow>
              See all
            </PillButton>
          }
          showDivider
        />
      </Card>

      <Card padding="none" className="flex flex-col overflow-hidden">
        <div className="px-20 pt-16">
          <span className="type-overline text-on-surface-tertiary">Title only</span>
        </div>
        <SectionHeader title="Settings" />
      </Card>
    </PageShell>
  );
}
