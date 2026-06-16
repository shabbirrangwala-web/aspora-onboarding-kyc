# AI consumption layer — deep research (2026-03-11)

## The landscape

There are four distribution patterns for making design systems AI-consumable, each with real production implementations.

---

## Pattern 1: MCP servers (dynamic, queryable)

AI tools connect to a server that exposes design system knowledge on demand. The tool only loads what's needed for the current task.

### Production implementations

**Atlassian (`@atlaskit/ads-mcp`)**
- npm package, zero config: `npx -y @atlaskit/ads-mcp`
- Exposes: design tokens, component APIs (Box, Inline, Stack, Flex, Grid, Heading, Button, etc.), icon library, accessibility guidance
- Has an `ads_plan` tool that returns exact import paths, usage docs, token values, and accessibility requirements *before* code generation begins
- Result: Atlassian redesigned their homepage from Figma mockup to production React in 20 minutes using Figma MCP + ADS MCP
- Source: https://www.atlassian.com/blog/developer/redesigning-homepage-20-minutes-with-rovo-dev

**Figma MCP Server**
- Remote: `https://mcp.figma.com/mcp` or local via desktop app
- 13 tools including `get_design_context`, `get_variable_defs`, `get_code_connect_map`, `create_design_system_rules`, `get_screenshot`
- `create_design_system_rules` auto-generates CLAUDE.md / .cursor/rules from your Figma design system
- Code Connect integration: generates import statements and component usage code from Figma frames
- Limitation: `get_variable_defs` only returns default mode values (no Light/Dark switching)
- Source: https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/

**shadcn MCP Server**
- `npx shadcn@latest mcp` — works with Claude Code, Cursor, VS Code, Codex
- Supports multiple registries via `components.json` with namespacing (`@acme`, `@internal`)
- `registry:mcp` variant serves custom registries with auth support
- Source: https://ui.shadcn.com/docs/mcp

**IBM Carbon MCP**
- Exposes: components, tokens, icons, migration guides, documentation
- Enables conversational querying within IDE
- Source: https://carbondesignsystem.com/developing/carbon-mcp/overview/

**Storybook MCP (`@storybook/addon-mcp`)**
- Generates a Component Manifest — structured JSON with component APIs, prop types, usage examples
- Without MCP: a component task consumes 50K-100K tokens for context; manifest delivers same info in a fraction
- Can be hosted remotely on Chromatic
- Source: https://storybook.js.org/blog/storybook-mcp-sneak-peek/

**Southleft Design Systems MCP (open source)**
- Hosted on Cloudflare Workers + Supabase pgvector
- 188+ curated entries, vector similarity search, sub-100ms queries
- 4 tools: `search_design_knowledge`, `search_chunks`, `browse_by_category`, `get_all_tags`
- Source: https://github.com/southleft/design-systems-mcp

**Synergy Design System MCP (`@synergy-design-system/mcp`)**
- For Angular, React, Vue, and vanilla Web Components
- Tools: list components, get usage details, get iconsets, get design tokens, get CSS utilities
- Source: https://www.npmjs.com/package/@synergy-design-system/mcp

**zeroheight MCP** — enterprise-only, hosted remote MCP connecting docs to Claude/Cursor
**Knapsack MCP** — enterprise, GA planned March 2026, serves Fortune 1000 companies

### Trade-offs
| Dimension | MCP Server | Static Files |
|-----------|-----------|-------------|
| Freshness | Always current | Can drift |
| Token efficiency | Loads only what's needed | Fixed payload every session |
| Setup complexity | Server infrastructure needed | Just commit files |
| Works offline | No (unless local) | Yes |
| Cross-tool support | Varies | Universal |
| Consuming project access | Works without repo access | Must be copied/bundled |

Cursor's dynamic context discovery reduced total agent tokens by **46.9%** by loading MCP tool descriptions on-demand instead of statically.
Source: https://cursor.com/blog/dynamic-context-discovery

---

## Pattern 2: Static context files

Context committed directly into consuming projects. Universal compatibility but requires sync.

### Lovable `.lovable/`
```
.lovable/
├── system.md          (max ~500 lines)
└── rules/
    ├── components/    (button.md, input.md, modal.md)
    ├── patterns/      (forms.md, navigation.md)
    └── styling/       (colors.md, typography.md)
```
- Design system project owns the folder; connected projects inherit read-only
- Source: https://docs.lovable.dev/features/design-systems

### Cursor `.cursor/rules/*.mdc`
- YAML frontmatter + markdown body
- Activation modes: Always Applied, Auto Attached (glob patterns), Agent Requested, Manual
- Source: https://cursor.com/docs/context/rules

### CLAUDE.md
- Read automatically at conversation start; hierarchical (root + subdirectory)
- At 95% context capacity, Claude auto-summarizes
- Source: https://code.claude.com/docs/en/best-practices

### AGENTS.md
- Used by 60,000+ repos; supported by Codex, Claude Code, Gemini CLI, Cursor
- Research: reduces median agent runtime by 28.64% and output tokens by 16.58%
- Source: https://agents.md/, https://arxiv.org/abs/2601.20404

### llms.txt
- 844,000+ websites implemented; useful for API docs, no design system-specific adoption yet
- Source: https://www.mintlify.com/blog/what-is-llms-txt

### Cross-tool sync
- **rulesync**: Write `.rulesync/*.md` once, generate for all tools (`npx rulesync generate`)
- **rule-porter**: Converts between .cursor/rules, CLAUDE.md, AGENTS.md, Copilot instructions

---

## Pattern 3: Registry / package

### shadcn registry (most mature distribution pattern)
- `registry.json` with `items[]` array, each item has name, description, type, files, dependencies, cssVars
- Types: `registry:base`, `registry:block`, `registry:component`, `registry:theme`, `registry:style`, etc.
- `cssVars` object carries design tokens: `{ theme: {}, light: {}, dark: {} }`
- Deploy as Next.js app with `/r/{name}.json` endpoints
- v0 consumes natively; Cursor via `registry:mcp`; private auth supported
- Vercel provides a starter template
- Source: https://ui.shadcn.com/docs/registry/registry-item-json

### Storybook component manifest
- Static JSON generated during build, hostable on Chromatic
- MCP addon wraps it for AI consumption
- Source: https://storybook.js.org/addons/@storybook/addon-mcp

### npm package with bundled AI context
- Ship CLAUDE.md, .cursor/rules/, .lovable/rules/ inside the package
- `@ai-coders/context` consolidates context across tools from single source

---

## Pattern 4: Hybrid (what actually works best)

### Hardik Pandya's three-layer system (most practical guide found)
Source: https://hvpandya.com/llm-design-systems

**Three-layer token indirection:**
1. Upstream DS tokens: `--ds-text: #292A2E`
2. Project aliases with fallbacks: `--color-text: var(--ds-text, #292A2E)`
3. Components reference only aliases: `color: var(--color-text)`

**Spec file structure:**
```
specs/
├── foundations/     (color.md, spacing.md, typography.md, etc.)
├── tokens/          (master map of every CSS variable with usage guidance)
├── atoms/           (8-section template per component)
├── molecules/
├── organisms/
└── patterns/
```

**8-section component spec:** metadata, overview, anatomy, tokens used, props/API, states, code examples, cross-references

**Automated audit script:** scans CSS for hardcoded values, suggests correct tokens, returns exit code 1 for CI

**Real result (Atlaskit project):** 418 hardcoded values reduced to 0, 64 spec files, 230+ tokens mapped, "10th AI session produces same visual quality as 1st"

### Codified context research (arxiv 2602.20478)
Academic validation of layered context on a 108K-line codebase:

- **Hot memory (constitution):** ~660-line markdown, loaded every session
- **Warm memory (agents):** 19 specialized agents (9,300 lines total)
- **Cold memory (knowledge base):** 34 markdown spec docs (~16,250 lines) served via MCP with keyword search

Over 80% of human prompts were 100 words or fewer — pre-loaded context reduces in-prompt explanation burden. Context infrastructure = 24.2% of codebase size.

---

## Context window optimization

### Context rot (Chroma research, 2025)
Source: https://research.trychroma.com/context-rot

- Tested 18 models (Claude Opus 4, GPT-4.1, Gemini 2.5, Qwen3)
- Performance degrades with longer inputs across ALL models
- **A focused 300-token context often outperforms an unfocused 113,000-token context**
- Three mechanisms: lost-in-the-middle, attention dilution, distractor interference
- Claude models show lowest hallucination rates

### Anthropic's recommendations
Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

- Find the smallest set of high-signal tokens that maximize desired outcome
- Structure at the "right altitude" — specific enough to guide, flexible enough for heuristics
- Use XML tags or markdown headers for sections
- Return token-efficient results from tools

### Layered loading strategy
1. **Always loaded (~500-660 lines):** Core conventions, token taxonomy, forbidden patterns
2. **Auto-attached (by file glob):** Component-specific rules triggered by what you're editing
3. **On-demand (via MCP):** Detailed specs retrieved when agent asks
4. **Cold storage:** Full docs, never pre-loaded

---

## The sync problem

### Build-time generation
- Figma's `create_design_system_rules` generates CLAUDE.md/.cursor/rules from live Figma data
- Style Dictionary v4: validate → build → test → publish → notify
- Storybook component manifest auto-generated during build

### Drift detection
- Hardik Pandya: sync routine pins DS package versions, detects upstream updates, flags affected spec files
- Token audit scripts scan for hardcoded values, return exit code 1 for CI

### Cross-tool sync
- `rulesync`: single source `.rulesync/*.md` generates for all tools
- Source: https://github.com/dyoshikawa/rulesync

---

## Emerging / creative approaches

### RAG for design systems
- Southleft's MCP uses pgvector for semantic search across design system knowledge
- 761+ content chunks with embeddings, hybrid search, sub-100ms queries
- Replicable with your own content

### Spec-driven development (GitHub)
- `spec-kit`: structured markdown specs as center of engineering process
- `requirements.md`, `design.md`, `tasks.md` as source of truth for agents
- Source: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/

### Design system skills (Claude Code)
- Markdown files with instructions + reference material + optional scripts
- No server, no API — documents loaded into context when relevant
- Can be shipped as part of design system package
- Source: https://pixelflips.com/blog/your-design-systems-got-skills

### MCP apps (emerging)
- Successor to MCP-UI: agents render interactive interfaces inside host environment
- Could enable visual design system browsing within AI tools

---

## Key takeaways

1. **MCP is the primary pattern** — Atlassian, IBM Carbon, Figma, shadcn, Storybook, zeroheight, Knapsack all have production MCP servers
2. **Static files still matter** — universal compatibility, work offline, easy to audit
3. **Registry pattern (shadcn) is the best distribution mechanism** — works with v0, Cursor, Claude Code
4. **Layered context beats dumping everything** — 300 focused tokens > 113K unfocused tokens
5. **Build-time generation solves sync** — don't hand-maintain AI context, generate it from source of truth
6. **The Hardik Pandya spec approach is the most practical how-to** for structured AI consumption
7. **Token indirection matters** — project aliases with fallbacks mean consuming projects aren't brittle to DS changes
