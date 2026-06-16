"use client";

import * as React from "react";
import { PageShell } from "@/components/design-system/PageShell";
import { Card } from "@/components/ui/card";
import { ContentContainer } from "@/components/ui/content-container";
import { User } from "lucide-react";

export default function ContentContainerPage() {
  return (
    <PageShell title="Content Container">
      <Section title="Sizes">
        <div className="flex items-end gap-16">
          <ContentContainer size={32} initials="AB" />
          <ContentContainer size={40} initials="AB" />
          <ContentContainer size={48} initials="AB" />
          <ContentContainer size={64} initials="AB" />
        </div>
      </Section>

      <Section title="With icon">
        <ContentContainer size={48} icon={<User className="h-24 w-24" />} />
      </Section>

      <Section title="With image">
        <ContentContainer size={48} imageSrc="https://i.pravatar.cc/96" imageAlt="User avatar" />
      </Section>

      <Section title="Custom colors">
        <div className="flex items-center gap-16">
          <ContentContainer size={48} initials="AB" bgColor="bg-success-solid" fgColor="text-on-surface-inverse" />
          <ContentContainer size={48} initials="CD" bgColor="bg-error-solid" fgColor="text-on-surface-inverse" />
          <ContentContainer size={48} initials="EF" bgColor="bg-warning-solid" fgColor="text-on-surface-inverse" />
          <ContentContainer size={48} initials="GH" bgColor="bg-accent-solid" />
        </div>
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
