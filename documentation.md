# Project Documentation

> Living document — updated each conversation to maintain project history.

---

## Project Overview

- **Type:** Mobile-first design prototype
- **Viewport:** 390–430px
- **Approach:** Frontend & design-first — no backend, no auth, all data mocked
- **Built with:** Vibe-coded using Claude

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.35 | App Router, `app/` directory |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^3.4.1 | Utility-first styling, mobile-first |
| Framer Motion | ^12.34.5 | Transitions, micro-interactions, gestures |
| TradingView Lightweight Charts | ^5.1.0 | Candlestick, line, area, volume charts (mock data) |
| Lucide React | ^0.576.0 | Icons |

---

## Conversation Log

### 2026-05-03 — Project Kickoff

- Established project direction: frontend/design-first, no backend, fully mocked
- Target viewport: 390–430px mobile
- Created this documentation file for cross-conversation history
- Tech stack confirmed: Next.js 14 (App Router) + TS + Tailwind + Framer Motion + TradingView Lightweight Charts + Lucide

### 2026-05-03 — Origin design system seeded

**Source:** `/origin-main/outputs/` (canonical token outputs from the Origin design system).

**Project scaffolding**
- Next.js 14.2.35 App Router project initialized at repo root
- Configs: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `.gitignore`
- All deps installed; production build passes; dev server responds 200 on `/` and `/design-system`

**Tokens wired**
- `app/tokens.css` — full Origin CSS custom properties (color primitives + ramps, semantic light/dark, spacing 4–80, radius 4–full + responsive typography vars + semantic type roles)
- `app/globals.css` — imports tokens, sets base typography, exposes `.type-*` utility classes for every Origin type role (display, header, title, body, label, label-heavy, number, overline)
- `tailwind.config.ts` — full semantic color palette mapped to CSS vars (surface, on-surface, border, interactive, error/success/warning/accent, on-brand, overlay, brand anchors), spacing & radius scales, font sizes
- `lib/tokens/` — TS exports re-exported from Origin (colors, typography, spacing, radius). `responsive-typography.ts` excluded due to upstream type bug; not needed (CSS vars handle responsiveness)
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

**Components built (`components/ui/`)**
1. **Button** — `primary`/`secondary`/`ghost`/`outline`/`destructive` × `sm`/`md`/`lg`/`icon` + loading/leftIcon/rightIcon/fullWidth
2. **Input** — label/helper/error states + `leadingIcon`/`trailingIcon` slots
3. **Card** + CardHeader/Title/Description/Content/Footer — `raised`/`outline`/`flat` × padding presets
4. **Badge** — `neutral`/`solid`/`accent`/`success`/`warning`/`error`
5. **Avatar** — sizes `xs`–`xl`, image with initials fallback
6. **IconButton** — shares Button-style variants
7. **Tabs** — Framer Motion animated indicator (segmented control)
8. **Sheet** — bottom sheet with drag-to-dismiss (Framer Motion)
9. **ListItem** — leading/trailing slots, optional chevron, optional press
10. **Toast** — `ToastProvider` + `useToast()`, neutral/success/warning/error variants

All components consume **semantic tokens only** (e.g. `bg-surface-primary`, `text-on-surface-primary`) — no raw hex or primitive ramps.

**Showcase page**
- Route: `/design-system` (linked from `/`)
- Locked to 430px max width, 390px mobile-first
- Sections: Foundations (surface · on-surface · status · brand ramps · typography · spacing · radius), Components (every primitive with variants), Iconography (Lucide grid; 1,954 Origin SVGs available in `origin-main/outputs/icons/outlined/` for later wiring)

### 2026-05-03 — Figma bridge connected & buttons rebuilt from spec

**Figma bridge**
- Resolved stale MCP server processes (`pkill -f figma-console-mcp`)
- User reimported plugin manifest; bridge connected on port 9223
- Used `figma_get_component_for_development_deep` to pull exact button specs from Origin Figma file

**Buttons rebuilt from Figma spec**
Replaced the single generic `Button` with 4 distinct components matching Figma's architecture:
1. **StandardButton** (`components/ui/button.tsx`) — full-width pill (rounded-full), px-24 py-16, 16/24 semibold. Hierarchies: primary/secondary/tertiary. States: default/pressed(scale)/disabled/loading.
2. **PillButton** (`components/ui/pill-button.tsx`) — compact inline, trailing ArrowRight. Sizes: small/xsmall. Hierarchies: primary/contrast/secondary/tertiary. `hideTrailingArrow` prop.
3. **DestructiveButton** (`components/ui/destructive-button.tsx`) — full-width pill, same dimensions as Standard. Hierarchies: primary(bg-error-solid)/tertiary(underlined red text).
4. **SwipeButton** (`components/ui/swipe-button.tsx`) — 56px height, draggable thumb, Framer Motion progress fill, completed checkmark state.

**Haffer fonts wired**
- `@font-face` declarations in `globals.css` for Haffer (variable + 6 static weights) and Haffer Mono (variable + 6 static weights)
- CSS vars: `--font-sans: "Haffer"`, `--font-mono: "Haffer Mono"`

### 2026-05-03 — Design system restructured into index + detail pages

**Architecture change:** Single monolithic showcase page → index page with linked detail pages.

**Index page** (`/design-system`)
- NavCard grid with links to all foundations and components
- Two sections: "Foundations" and "Components"
- Each NavCard shows name and description, links to its detail page

**Shared layout** (`components/design-system/PageShell.tsx`)
- Sticky header with back arrow + title
- 430px max-width centered layout
- Used by all detail pages

**Foundation detail pages** (4):
- `/design-system/foundations/colors` — surface, on-surface, border, interactive, status, brand ramp swatches
- `/design-system/foundations/typography` — all 24 type roles with specimens
- `/design-system/foundations/spacing` — visual scale 4–80
- `/design-system/foundations/radius` — visual scale 4–full

**Component detail pages** (10):
- `/design-system/components/button` — StandardButton (primary/secondary/tertiary × default/disabled/loading), PillButton (hierarchies × sizes), DestructiveButton, SwipeButton
- `/design-system/components/input` — default/with icons/error/disabled states
- `/design-system/components/card` — raised/outline/flat variants, padding presets
- `/design-system/components/badge` — neutral/solid/accent/success/warning/error
- `/design-system/components/avatar` — sizes xs–xl, image + initials fallback
- `/design-system/components/icon-button` — variants + sizes + disabled
- `/design-system/components/tabs` — 3-tab and 2-tab examples
- `/design-system/components/sheet` — bottom sheet with drag-to-dismiss demo
- `/design-system/components/list-item` — various slot configurations
- `/design-system/components/toast` — neutral/success/warning/error trigger buttons

### 2026-05-03 — Full Figma component audit & rebuild

**Approach:** Inspected every component page in the Figma file (`Origin components`) via Desktop Bridge. Used `figma_get_component_for_development_deep` to extract exact specs (padding, spacing, typography, colors with bound variable tokens, children structure) for each component. Built/rebuilt all components to match Figma exactly.

**New components built from Figma spec** (`components/ui/`):
1. **Alert** (`alert.tsx`) — Type=Section|Inline × Color=Neutral|Success|Warning|Error|Accent. Optional icon, dismiss, action pill button.
2. **Bottom bar** (`bottom-bar.tsx`) — Tab bar navigation, pill-shaped bg-surface-secondary, active tab bg-surface-primary. Optional live activity slot.
3. **Content container** (`content-container.tsx`) — Avatar-like circle. Content type=Initials|Icon|Image × Size=32|40|48|64. Optional badge.
4. **Divider** (`divider.tsx`) — 1px line, optional inset for list items.
5. **Navbar** (`navbar.tsx`) — Type=Page|BottomSheet. Leading back/close button, title+subtitle, trailing slot, divider.
6. **Checkbox** (`checkbox.tsx`) — 24×24, rounded-8. Selected/disabled states with interactive-primary fill.
7. **Radio** (`radio.tsx`) — 24×24 circle. Selected shows 8×8 inner dot.
8. **Toggle** (`toggle.tsx`) — 40×24 pill track with 20×20 animated thumb. Framer Motion spring.
9. **Tag** (`tag.tsx`) — Size=XSmall|Small|Medium|Large × Color=Neutral|Accent|Warning|Success|Error × Type=Solid|Tinted. Leading/trailing icon slots.
10. **Action prompt** (`action-prompt.tsx`) — CTA card with progress ring, title+description, 1-2 action buttons. 5 color variants.
11. **Circular loader** (`circular-loader.tsx`) — Size=Small|Medium|Large|XLarge × Type=Ring|Fill. CSS spin animation.
12. **Progress stepper** (`progress-stepper.tsx`) — Vertical steps with connecting lines. Status=Completed|InProgress|NotStarted.
13. **Segmented controller** (`segmented-controller.tsx`) — Pill track bg-surface-secondary, animated active segment. Framer Motion layoutId.
14. **Snackbar** (`snackbar.tsx`) — Dark surface-contrast bg, p-12, rounded-12, shadow. SnackbarProvider+useSnackbar() hook. State=Default|Loading.
15. **Section header** (`section-header.tsx`) — Size=Default(22/28 semibold)|Small(16/24). Title, subtitle, action slot, divider.

**Rebuilt components to match Figma spec:**
- **Input** (`input.tsx`) — Added SearchInput (pill-shaped), MaskedInput (password with eye toggle), CodeInput (4-digit OTP boxes). Updated Text input: label 12/16 medium, container h-48 border-[1.5px] rounded-12, value 16/24 regular.
- **List item** (`list-item.tsx`) — Updated to py-16 px-20 gap-16. Added tertiary text slot. Primary: 14/20 medium, Secondary/Tertiary: 14/20 regular.
- **Tabs** (`tabs.tsx`) — Changed from segmented control to underline indicator style. px-20, gap-16, py-12 per tab. Active: 4px bottom bar animated with layoutId.

**Index page updated** — Now lists 17 Figma-defined components (removed Badge, Avatar, IconButton, Sheet, Toast from index since they're not in the Figma file. Pages still exist but are not linked).

**Detail pages created** (13 new):
- `/design-system/components/alert`
- `/design-system/components/bottom-bar`
- `/design-system/components/content-container`
- `/design-system/components/divider`
- `/design-system/components/navbar`
- `/design-system/components/selector` (Checkbox + Radio + Toggle)
- `/design-system/components/tag`
- `/design-system/components/action-prompt`
- `/design-system/components/loader`
- `/design-system/components/progress-stepper`
- `/design-system/components/segmented-controller`
- `/design-system/components/snackbar`
- `/design-system/components/section-header`

**Verification**
- ✅ `npx next build` — all 32 routes compile and generate static pages cleanly (0 errors)
- ✅ Production build sizes: ~100–150 kB first load JS per page

**Open follow-ups**
- **Origin SVG icons** — 1,954 outlined icons available in `origin-main/outputs/icons/outlined/`; user wants these brought into the library (next task)
- **App migration** — future: migrate existing app screens onto these design system components
