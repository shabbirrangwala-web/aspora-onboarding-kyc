# Lab

Everything about building and evolving the design system — documentation, exploration tools, and generation pipelines.

## Documentation

Four areas, each with a clear purpose and owner.

### `thinking/`

Strategic documents — architecture decisions, working plans, parking lots for deferred items. Written and maintained by the team. These evolve over time.

**Convention:** No date prefix in filenames. Include a `Last updated: YYYY-MM-DD` line at the top of each document.

### `research/`

Audits, investigations, and reference material that informed decisions. These are snapshots — they reflect what was true at the time of writing.

**Convention:** `YYYY-MM-DD-` prefix in filenames (e.g., `2026-03-17-native-app-token-audit.md`).

### `specs/`

Design specifications — the "what and why" for each piece of work. Scoped to a workstream, validated through review. Written by Claude during brainstorming sessions.

**Convention:** `YYYY-MM-DD-` prefix in filenames (e.g., `2026-03-17-repo-setup-design.md`).

### `plans/`

Implementation plans — the "how and in what order" for each piece of work. Step-by-step execution guides with exact files, commands, and verification steps. Written by Claude from approved specs.

**Convention:** `YYYY-MM-DD-` prefix in filenames (e.g., `2026-03-17-repo-setup-plan.md`).

## Tooling

### `pipelines/`

Token generation tools. The color pipeline (OKLCH ramp generation from brand anchors) lives here. Future typography and spacing generation will follow.

### `figma-plugin/`

Consolidated Figma plugin that pushes all foundation tokens (color, typography, spacing, etc.) to Figma as variables with proper scopes and modes.

### `viewer/`

Lightweight browser-based workbench for seeing all tokens and foundations at a glance. Not documentation — a development tool.
