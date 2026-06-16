"use client";

import * as React from "react";
import { useState } from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { BottomBar } from "@/components/ui/bottom-bar";

export default function BottomBarPage() {
  const [activeTab1, setActiveTab1] = useState("home");
  const [activeTab2, setActiveTab2] = useState("invest");

  return (
    <PageShell title="Bottom Bar">
      <Section title="Default">
        <BottomBar activeId={activeTab1} onTabPress={setActiveTab1} />
      </Section>

      <Section title="Different tab">
        <BottomBar activeId={activeTab2} onTabPress={setActiveTab2} />
      </Section>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-12">
      <h2 className="type-overline text-on-surface-tertiary">{title}</h2>
      <Card padding="none" className="overflow-hidden">
        {children}
      </Card>
    </div>
  );
}
