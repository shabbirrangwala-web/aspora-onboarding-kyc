"use client";

import { useState } from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { SegmentedController } from "@/components/ui/segmented-controller";

export default function SegmentedControllerPage() {
  const [value3, setValue3] = useState("Buy");
  const [value2, setValue2] = useState("Day");

  return (
    <PageShell title="Segmented Controller">
      <Card padding="lg" className="flex flex-col gap-16">
        {/* 3 segments */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">3 segments</span>
          <SegmentedController
            segments={["Buy", "Sell", "Convert"]}
            value={value3}
            onChange={setValue3}
          />
        </div>

        {/* 2 segments */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">2 segments</span>
          <SegmentedController
            segments={["Day", "Week"]}
            value={value2}
            onChange={setValue2}
          />
        </div>
      </Card>
    </PageShell>
  );
}
