"use client";

import * as React from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Navbar } from "@/components/ui/navbar";
import { SearchInput } from "@/components/ui/input";

export default function NavbarPage() {
  return (
    <PageShell title="Navbar">
      <Section title="Page — back">
        <Navbar
          type="page"
          title="Settings"
          leadingIcon="back"
        />
      </Section>

      <Section title="Page — with subtitle">
        <Navbar
          type="page"
          title="Transfer"
          subtitle="To GBP account"
          leadingIcon="back"
        />
      </Section>

      <Section title="Bottom sheet">
        <Navbar
          type="bottom-sheet"
          title="Select account"
          leadingIcon="close"
        />
      </Section>

      <Section title="With divider">
        <Navbar
          type="page"
          title="Notifications"
          showDivider
          leadingIcon="back"
        />
      </Section>

      <Section title="Stacked title">
        <Navbar
          type="page"
          leadingIcon="back"
          stackedTitle="Portfolio"
          showDivider
        />
      </Section>

      <Section title="With trailing">
        <Navbar
          type="page"
          title="Account"
          leadingIcon="back"
          trailing={<span className="text-[14px] font-medium text-interactive-primary">Edit</span>}
          showTrailing
        />
      </Section>

      <Section title="Search active — page">
        <Navbar
          type="page"
          searchActive
          searchContent={<SearchInput placeholder="Search" className="w-full" />}
        />
      </Section>

      <Section title="Search active — bottom sheet">
        <Navbar
          type="bottom-sheet"
          searchActive
          searchContent={<SearchInput placeholder="Search" className="w-full" />}
        />
      </Section>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-12">
      <h2 className="type-overline text-on-surface-tertiary">{title}</h2>
      <div className="overflow-hidden rounded-16 bg-surface-primary">
        {children}
      </div>
    </div>
  );
}
