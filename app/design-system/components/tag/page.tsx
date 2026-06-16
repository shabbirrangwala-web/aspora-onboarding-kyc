"use client";

import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { TrendingUp } from "lucide-react";

export default function TagPage() {
  return (
    <PageShell title="Tag">
      <Card padding="lg" className="flex flex-col gap-16">
        {/* Sizes */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Sizes</span>
          <div className="flex flex-wrap items-center gap-8">
            <Tag size="xsmall" color="neutral" type="solid">XSmall</Tag>
            <Tag size="small" color="neutral" type="solid">Small</Tag>
            <Tag size="medium" color="neutral" type="solid">Medium</Tag>
            <Tag size="large" color="neutral" type="solid">Large</Tag>
          </div>
        </div>

        {/* Colors - Solid */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Colors — Solid</span>
          <div className="flex flex-wrap items-center gap-8">
            <Tag size="small" color="neutral" type="solid">Neutral</Tag>
            <Tag size="small" color="accent" type="solid">Accent</Tag>
            <Tag size="small" color="success" type="solid">Success</Tag>
            <Tag size="small" color="warning" type="solid">Warning</Tag>
            <Tag size="small" color="error" type="solid">Error</Tag>
          </div>
        </div>

        {/* Colors - Tinted */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Colors — Tinted</span>
          <div className="flex flex-wrap items-center gap-8">
            <Tag size="small" color="neutral" type="tinted">Neutral</Tag>
            <Tag size="small" color="accent" type="tinted">Accent</Tag>
            <Tag size="small" color="success" type="tinted">Success</Tag>
            <Tag size="small" color="warning" type="tinted">Warning</Tag>
            <Tag size="small" color="error" type="tinted">Error</Tag>
          </div>
        </div>

        {/* With icons */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">With icons</span>
          <div className="flex flex-wrap items-center gap-8">
            <Tag size="small" color="success" type="solid" leadingIcon={<TrendingUp className="h-full w-full" />}>+12.4%</Tag>
            <Tag size="medium" color="accent" type="tinted" leadingIcon={<TrendingUp className="h-full w-full" />}>Trending</Tag>
            <Tag size="large" color="warning" type="solid" leadingIcon={<TrendingUp className="h-full w-full" />}>Rising</Tag>
          </div>
        </div>

        {/* Dismissible */}
        <div className="flex flex-col gap-4">
          <span className="type-overline text-on-surface-tertiary">Dismissible</span>
          <div className="flex flex-wrap items-center gap-8">
            <Tag size="small" color="neutral" type="tinted" showTrailingIcon>Removable</Tag>
            <Tag size="medium" color="accent" type="solid" showTrailingIcon>Dismiss me</Tag>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
