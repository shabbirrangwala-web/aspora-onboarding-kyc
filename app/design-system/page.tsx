"use client";

import Link from "next/link";
import {
  Palette,
  Type,
  Space,
  Circle,
  RectangleHorizontal,
  TextCursorInput,
  LayoutGrid,
  Tag,
  UserCircle,
  SquareAsterisk,
  Rows3,
  PanelBottomOpen,
  List,
  Bell,
  AlertTriangle,
  Navigation,
  Minus,
  Image,
  CheckSquare,
  Loader2,
  ListOrdered,
  ToggleLeft,
  MessageSquare,
  SplitSquareHorizontal,
  LayoutList,
  Shapes,
} from "lucide-react";

const foundations = [
  { name: "Colors", href: "/design-system/foundations/colors", icon: Palette, description: "Surface, on-surface, status, brand ramps" },
  { name: "Typography", href: "/design-system/foundations/typography", icon: Type, description: "Display, header, title, body, label, number, overline" },
  { name: "Spacing", href: "/design-system/foundations/spacing", icon: Space, description: "12-step scale: 4–80px" },
  { name: "Radius", href: "/design-system/foundations/radius", icon: Circle, description: "8-step scale: 4–full" },
  { name: "Icons", href: "/design-system/foundations/icons", icon: Shapes, description: "144 brand + 1809 system icons" },
];

const components = [
  { name: "Alert", href: "/design-system/components/alert", icon: AlertTriangle, description: "Section & inline, 5 color variants" },
  { name: "Bottom bar", href: "/design-system/components/bottom-bar", icon: Navigation, description: "Tab bar navigation with live activity" },
  { name: "Button", href: "/design-system/components/button", icon: RectangleHorizontal, description: "Standard, pill, destructive, swipe" },
  { name: "Content container", href: "/design-system/components/content-container", icon: Image, description: "Initials, icon, image — 4 sizes" },
  { name: "Divider", href: "/design-system/components/divider", icon: Minus, description: "Content and section dividers" },
  { name: "Input", href: "/design-system/components/input", icon: TextCursorInput, description: "Text, search, masked, code, multiline, phone" },
  { name: "List item", href: "/design-system/components/list-item", icon: List, description: "6 types: navigation, radio, toggle, checkbox, button" },
  { name: "Navbar", href: "/design-system/components/navbar", icon: LayoutList, description: "Page & bottom sheet, search active, stacked title" },
  { name: "Selector", href: "/design-system/components/selector", icon: CheckSquare, description: "Checkbox, radio, toggle" },
  { name: "Tag", href: "/design-system/components/tag", icon: Tag, description: "4 sizes × 5 colors × solid/tinted" },
];

const molecules = [
  { name: "Action prompt", href: "/design-system/components/action-prompt", icon: MessageSquare, description: "CTA card with progress indicator" },
  { name: "Loader", href: "/design-system/components/loader", icon: Loader2, description: "Circular ring and fill spinners" },
  { name: "Progress stepper", href: "/design-system/components/progress-stepper", icon: ListOrdered, description: "Vertical steps with status indicators" },
  { name: "Segmented controller", href: "/design-system/components/segmented-controller", icon: SplitSquareHorizontal, description: "Pill track with animated segments" },
  { name: "Snackbar", href: "/design-system/components/snackbar", icon: Bell, description: "Dark toast with optional action" },
  { name: "Tabs", href: "/design-system/components/tabs", icon: Rows3, description: "Underline tabs with animated indicator" },
  { name: "Section header", href: "/design-system/components/section-header", icon: LayoutGrid, description: "Default and small with subtitle" },
];

export default function DesignSystemIndex() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-surface-primary pb-80">
      <header className="flex flex-col gap-4 px-16 pt-48 pb-24">
        <span className="type-overline text-on-surface-tertiary">Origin</span>
        <h1 className="type-headerLg text-on-surface-primary">Design system</h1>
        <p className="type-bodySm text-on-surface-secondary">Foundations and components, built from Figma specs.</p>
      </header>

      <Section title="Foundations">
        {foundations.map((item) => (
          <NavCard key={item.name} {...item} />
        ))}
      </Section>

      <Section title="Components">
        {components.map((item) => (
          <NavCard key={item.name} {...item} />
        ))}
      </Section>

      <Section title="Molecules">
        {molecules.map((item) => (
          <NavCard key={item.name} {...item} />
        ))}
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-8 px-16 py-12">
      <h2 className="type-overline text-on-surface-tertiary">{title}</h2>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function NavCard({
  name,
  href,
  icon: Icon,
  description,
}: {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-12 rounded-16 px-12 py-12 transition-colors hover:bg-overlay-light-hover active:bg-overlay-light-pressed"
    >
      <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-12 bg-surface-tertiary text-on-surface-primary">
        <Icon className="h-20 w-20" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="type-labelHeavyLg text-on-surface-primary">{name}</span>
        <span className="type-labelMd truncate text-on-surface-tertiary">{description}</span>
      </div>
    </Link>
  );
}
