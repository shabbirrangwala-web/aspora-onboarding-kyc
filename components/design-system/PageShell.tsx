"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageShell({
  title,
  back = "/design-system",
  children,
}: {
  title: string;
  back?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-surface-primary pb-80">
      <header className="sticky top-0 z-30 flex items-center gap-8 border-b border-border-primary bg-surface-primary/95 px-16 py-12 backdrop-blur">
        <Link href={back} aria-label="Back" className="rounded-full p-8 hover:bg-overlay-light-hover">
          <ArrowLeft className="h-20 w-20 text-on-surface-primary" />
        </Link>
        <h1 className="type-titleMd text-on-surface-primary">{title}</h1>
      </header>
      <div className="flex flex-col gap-32 px-16 py-24">{children}</div>
    </main>
  );
}
