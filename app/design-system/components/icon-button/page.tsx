"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { IconButton } from "@/components/ui/icon-button";
import { Card } from "@/components/ui/card";
import { Search, Bell, Settings, Star, Heart, Plus } from "lucide-react";

export default function IconButtonPage() {
  return (
    <PageShell title="Icon button">
      <Card padding="lg" className="flex flex-col gap-16">
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Variants</span>
          <div className="flex gap-8">
            <IconButton variant="primary" aria-label="Search"><Search className="h-20 w-20" /></IconButton>
            <IconButton variant="secondary" aria-label="Bell"><Bell className="h-20 w-20" /></IconButton>
            <IconButton variant="ghost" aria-label="Settings"><Settings className="h-20 w-20" /></IconButton>
            <IconButton variant="outline" aria-label="Star"><Star className="h-20 w-20" /></IconButton>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Sizes</span>
          <div className="flex items-center gap-8">
            <IconButton variant="primary" size="sm" aria-label="Plus"><Plus className="h-16 w-16" /></IconButton>
            <IconButton variant="primary" size="md" aria-label="Plus"><Plus className="h-20 w-20" /></IconButton>
            <IconButton variant="primary" size="lg" aria-label="Plus"><Plus className="h-24 w-24" /></IconButton>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Disabled</span>
          <div className="flex gap-8">
            <IconButton variant="primary" disabled aria-label="Heart"><Heart className="h-20 w-20" /></IconButton>
            <IconButton variant="secondary" disabled aria-label="Heart"><Heart className="h-20 w-20" /></IconButton>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
