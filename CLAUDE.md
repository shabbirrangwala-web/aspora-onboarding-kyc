# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build — run this to verify no type/compile errors
npm run lint     # ESLint via next lint
```

No test suite. Use `npm run build` to catch type errors before considering a change done.

## Project overview

A **mobile-first design prototype** for Aspora's KYC flow, built on the Origin design system. It is frontend-only — no backend, no auth, all data mocked. Target viewport: 390–430px.

The repo contains two distinct directories:

| Path | Purpose |
|------|---------|
| `/` (root) | The active Next.js app — KYC flow screens and Origin design system showcase |
| `origin-main/` | Read-only snapshot of the Origin design system repo (tokens, guidelines, outputs). Never edit this. |

## Architecture

**Stack:** Next.js 14.2 (App Router) · TypeScript · Tailwind CSS · Framer Motion · TradingView Lightweight Charts · Lucide React

**Token pipeline:**
- `app/tokens.css` — all Origin CSS custom properties (color, spacing, radius, typography). Source of truth for design tokens.
- `app/globals.css` — imports tokens, declares Haffer/Haffer Mono `@font-face` rules, exposes `.type-*` utility classes.
- `tailwind.config.ts` — maps CSS vars to Tailwind color/spacing/radius/font scales. All semantic tokens are available as Tailwind classes.

**Component structure:**
- `components/ui/` — production UI components built from Figma spec (Origin design system)
- `components/design-system/` — showcase helper components (PageShell, ColorSwatch, etc.) used only in the `/design-system` route
- `lib/utils.ts` — exports `cn()` (clsx + tailwind-merge)
- `lib/tokens/` — TypeScript token exports from Origin

**Routing (`app/`):**
- `/` — Home / directory page (tabs: Latest Explorations · Component Design System)
- `/design-system` — Index of all foundations and components
- `/design-system/foundations/<name>` — colors · typography · spacing · radius · icons
- `/design-system/components/<name>` — one page per component (see `app/design-system/components/`)

## Key conventions

**Always use semantic tokens — never raw hex or primitive ramps.** Use Tailwind classes like `bg-surface-primary`, `text-on-surface-secondary`, `border-border-primary`. The semantic color palette is fully mapped in `tailwind.config.ts`.

**Typography via utility classes.** Use `.type-*` classes defined in `globals.css` (e.g. `type-headerLg`, `type-bodySm`, `type-labelHeavyLg`, `type-overline`). Do not construct font styles manually.

**Spacing and radius from the defined scales only.** Tailwind spacing is 4–80px in discrete steps; border-radius is 4–full. Do not introduce arbitrary values.

**Mobile-first layout.** All pages use `max-w-[430px] mx-auto`. Do not build for wider viewports.

**`"use client"` on interactive pages.** Framer Motion and hooks require client components.

## Origin icon assets

- `origin-main/outputs/icons/outlined/` — 1,809 outlined SVGs
- `origin-main/outputs/icons/filled/` — filled variants
- `origin-main/outputs/icons/keys.json` — icon name index
- `scripts/process-figma-icons.mjs` / `scripts/write-icons.mjs` — pipeline for importing new icons
