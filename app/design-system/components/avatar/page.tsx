"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default function AvatarPage() {
  return (
    <PageShell title="Avatar">
      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Sizes</span>
          <div className="flex items-end gap-12">
            <Avatar size="xs" fallback="SS" />
            <Avatar size="sm" fallback="SS" />
            <Avatar size="md" fallback="SS" />
            <Avatar size="lg" fallback="SS" />
            <Avatar size="xl" fallback="SS" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Initials fallback</span>
          <div className="flex gap-12">
            <Avatar size="lg" fallback="Shreeyash Salunke" />
            <Avatar size="lg" fallback="Hakeeb" />
            <Avatar size="lg" fallback="P" />
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
