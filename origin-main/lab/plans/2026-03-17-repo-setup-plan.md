# Repo setup implementation plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the Origin design system repo with proper directory structure, README, CLAUDE.md, and push to Vance-Club/origin on GitHub.

**Architecture:** Flat scaffold with `.gitkeep` placeholders. Docs migrate from root into lab subdirectories (thinking, research). Git init on `main`, push to GitHub.

**Tech Stack:** Git, GitHub CLI (`gh`)

**Spec:** `lab/specs/2026-03-17-repo-setup-design.md`

---

### Task 1: Git init and .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Initialize git repo**

Run: `git init -b main`

- [ ] **Step 2: Create .gitignore**

```
node_modules/
dist/
.DS_Store
.claude/
*.local.json
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: init repo with gitignore"
```

---

### Task 2: Directory scaffold

**Files:**
- Create: all directories with `.gitkeep` files

- [ ] **Step 1: Create all directories**

```bash
# Foundations
mkdir -p foundations/{color,typography,spacing,motion,iconography,photography,voice,illustration}

# Components
mkdir -p components/{product,editorial}

# Outputs
mkdir -p outputs/{json,css,tailwind,ai}

# Strategy
mkdir -p strategy

# Workspace
mkdir -p lab/{thinking,research,specs,plans,pipelines,figma-plugin,viewer}

# Migration
mkdir -p migration
```

- [ ] **Step 2: Add .gitkeep to empty directories**

```bash
for dir in \
  foundations/color foundations/typography foundations/spacing foundations/motion \
  foundations/iconography foundations/photography foundations/voice foundations/illustration \
  components/product components/editorial \
  outputs/json outputs/css outputs/tailwind outputs/ai \
  strategy \
  lab/pipelines lab/figma-plugin lab/viewer \
  migration; do
  touch "$dir/.gitkeep"
done
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: add directory scaffold"
```

---

### Task 3: Migrate docs to lab

**Files:**
- Move: `current-working-plan-v1.md` → `lab/thinking/`
- Move: `design-system-architecture.md` → `lab/thinking/`
- Move: `for-later.md` → `lab/thinking/`
- Move: `ai-consumption-research.md` → `lab/research/2026-03-11-ai-consumption-research.md`
- Move: `native-app-token-audit.md` → `lab/research/2026-03-17-native-app-token-audit.md`

- [ ] **Step 1: Move thinking docs**

```bash
mv current-working-plan-v1.md lab/thinking/
mv design-system-architecture.md lab/thinking/
mv for-later.md lab/thinking/
```

- [ ] **Step 2: Move and rename research docs with date prefix**

```bash
mv ai-consumption-research.md lab/research/2026-03-11-ai-consumption-research.md
mv native-app-token-audit.md lab/research/2026-03-17-native-app-token-audit.md
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: migrate docs to lab structure"
```

---

### Task 4: lab/README.md

**Files:**
- Create: `lab/README.md`

- [ ] **Step 1: Write lab README**

Documents the four documentation areas, their purpose, ownership, and dating conventions:
- `thinking/` — strategic docs (user), no date prefix, `Last updated:` header
- `research/` — reference material (user), `YYYY-MM-DD-` prefix
- `specs/` — design specs (claude), `YYYY-MM-DD-` prefix
- `plans/` — implementation plans (claude), `YYYY-MM-DD-` prefix
- `pipelines/`, `figma-plugin/`, `viewer/` — tooling (described briefly)

- [ ] **Step 2: Commit**

```bash
git add lab/README.md
git commit -m "docs: add lab README with structure conventions"
```

---

### Task 5: package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@vance-club/origin",
  "description": "Origin — Aspora's design system. Foundations, tokens, guidelines, and tooling.",
  "version": "0.0.1",
  "private": true
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add package.json"
```

---

### Task 6: README.md

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write first-pass README**

Content should cover:
- What Origin is (Aspora's design system — foundations, tokens, guidelines, tooling)
- Three-repo architecture (origin, design site, brand-lab)
- Repo structure overview (foundations, components, outputs, strategy, lab, migration)
- What this repo owns vs. what lives elsewhere
- Current status (early setup, color foundations established via color-theory)

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add first-pass README"
```

---

### Task 7: CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

Content should cover:
- Project name and purpose
- Repo structure and what each top-level directory contains
- Workspace documentation structure (thinking, research, specs, plans)
- Key decisions (code is source of truth, no component source code, manual token consumption)
- Conventions (token JSON in foundations/, guidelines as markdown, outputs are generated)
- The team (Hakeeb — design system, Suddo — brand-lab/docs, Paul — iOS, Sergei — Android)

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md project context"
```

---

### Task 8: Create GitHub remote and push

- [ ] **Step 1: Create repo on GitHub**

```bash
gh repo create Vance-Club/origin --private --description "Origin — Aspora's design system. Foundations, tokens, guidelines, and tooling."
```

- [ ] **Step 2: Add remote and push**

```bash
git remote add origin https://github.com/Vance-Club/origin.git
git push -u origin main
```

- [ ] **Step 3: Verify**

```bash
gh repo view Vance-Club/origin
```
