"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { CircularLoader } from "@/components/ui/circular-loader";

export default function LoaderPage() {
  return (
    <PageShell title="Circular Loader">
      <Card padding="lg" className="flex flex-col gap-16">
        {/* Ring - Sizes */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Ring — Sizes</span>
          <div className="flex items-center gap-16">
            <CircularLoader size="small" type="ring" />
            <CircularLoader size="medium" type="ring" />
            <CircularLoader size="large" type="ring" />
            <CircularLoader size="xlarge" type="ring" />
          </div>
        </div>

        {/* Fill */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Fill</span>
          <div className="flex items-center gap-16">
            <CircularLoader size="small" type="fill" />
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
