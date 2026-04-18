---
title: "feat: Migrate marketing site to Bridgetown"
type: feat
status: active
date: 2026-04-18
---

# feat: Migrate marketing site to Bridgetown

**Target repo:** `signal-rails-site` (sibling of `signal-rails`)

## Overview

Port the existing single-page static marketing site at `signal-rails-site/` to a Bridgetown project. Visual output, copy, and JS animation behavior unchanged. Goal is to gain Bridgetown's templating, asset pipeline, and dev-server affordances without altering what visitors see.

## Problem Frame

The current site is a single 1571-line `index.html` plus three vendored JS files. That's fine for a one-page ship but resists future change: the CSS lives inline (no asset pipeline, no cache-busting), there is no layout boundary (so masthead/footer cannot be reused), and the dev loop is "edit, hard-reload" with no live reload.

Bridgetown is the Rails-adjacent SSG (ERB-first, Esbuild frontend pipeline, Roda dev server). Migrating now — while there is exactly one page and one CSS block — keeps the diff small and the conversion mechanical. Doing it after content grows is strictly more work.

## Requirements Trace

- **R1.** Visual output of `index.html` reproduces pixel-identically after `bin/bridgetown build`.
- **R2.** All copy, SVG markup, and inline diagrams preserved verbatim.
- **R3.** Hero, demo, and lesson JS animations function unchanged.
- **R4.** Body data-attributes (`data-direction`, `data-font`, `data-accents`) and the CSS that branches on them survive migration.
- **R5.** `bin/bridgetown start` serves the site for local dev; `bin/bridgetown deploy` produces a static `output/` directory hostable on any static host.

## Scope Boundaries

- Out: any new pages, sections, copy changes, design tweaks, additional content (guides/blog/API ref).
- Out: CI, hosting/deploy config, custom domain.
- Out: extracting body content into per-section partials. Single `index.erb` keeps the diff legible. Decomposition is reasonable but unmotivated for one page; defer until adding a second page.
- Out: SCSS/PostCSS preprocessing. Plain CSS extraction matches the source; preprocessing is invented complexity for a 1:1 port.
- Out: replacing the design-tool tweaks scaffold (already stripped during the clone step).

## Context & Research

### Relevant Code and Patterns

- `index.html` (1571 lines) — masthead, statusbar, hero with SVG diagram, ten sections (`#what`, `#how`, `#demo`, `#lessons`, `#neighbors`, `#perf`, `#surface`, `#refs`, `#who`, `#install`), footer.
- `js/hero.js`, `js/demo.js`, `js/lessons.js` — three IIFE modules, no exports, side effects only (query DOM, attach listeners, start intervals, animate SVGs). They expect to run after DOM parse.
- Body markup uses `data-direction`, `data-font`, `data-accents` attributes; CSS reads them via attribute selectors. Defaults in source: `data-direction="readme" data-font="plex" data-accents="true"`.

### External References

- Bridgetown 1.x uses ERB as a default-supported templating engine (no Liquid required). Default frontend bundler is Esbuild, with entry files at `frontend/javascript/index.js` and `frontend/styles/index.css`. Built output goes to `output/`. Dev server is Roda-based. Scaffolding via `bridgetown new`.

## Key Technical Decisions

- **ERB, not Liquid.** Matches author muscle memory and Bridgetown 1.x first-class default.
- **Single `index.erb`, no per-section partials.** One page does not warrant decomposition. Re-evaluate when adding the second page.
- **Layout holds masthead + statusbar + footer.** These are the only obviously reusable pieces across hypothetical future pages. Body content (hero + ten sections) stays in `index.erb`.
- **Extract `<style>` block to one `frontend/styles/index.css`, no preprocessor.** Preserve declaration order to keep cascade behavior identical. Preprocessing is out of scope.
- **Three JS files become side-effect imports from `frontend/javascript/index.js`.** Esbuild bundles them; Bridgetown's `javascript_include_tag` handles cache-busting.
- **`signal-rails-site/` becomes a git repo.** Bridgetown projects are git-tracked by convention; `git init` is part of the bootstrap unit.
- **Plan and source files colocate.** Plan lives at `docs/plans/`; site source lives at `src/` and `frontend/`. The pre-migration files are parked in `_pre_bridgetown/` during the conversion, then deleted in Unit 5.

## Open Questions

### Resolved During Planning

- **Plan location** → `signal-rails-site/docs/plans/` (colocate with the site, mirroring the sibling-of-signal-rails decision made during the initial clone).
- **Git init** → yes, included in Unit 1.
- **Per-section partials** → no. Single `index.erb`.
- **CSS preprocessor** → no. Plain CSS extraction.

### Deferred to Implementation

- **Exact `bridgetown new` invocation.** The CLI flags for selecting ERB and Esbuild (vs Webpack) may differ between Bridgetown 1.x point releases. Implementer confirms against current Bridgetown docs.
- **Whether to scaffold in-place or scaffold-then-merge.** `bridgetown new .` may or may not refuse a non-empty directory. Two safe approaches: (a) move existing files to `_pre_bridgetown/` first, scaffold in-place, then port; (b) scaffold in a sibling temp dir and move files in. Implementer picks based on actual CLI behavior.
- **Hosting target** (GitHub Pages / Cloudflare Pages / Netlify). Affects deploy step but not the migration itself; pick when actually deploying.

## Implementation Units

- [ ] **Unit 1: Bootstrap Bridgetown project**

**Goal:** Stand up an empty, runnable Bridgetown project at `signal-rails-site/` with the source files preserved for porting.

**Requirements:** R5

**Dependencies:** None

**Files:**
- Create: `Gemfile`, `package.json`, `bridgetown.config.yml`, `config/`, `bin/bridgetown`, `Rakefile`, `esbuild.config.js`, `.gitignore` (whatever `bridgetown new` produces)
- Move: `index.html` and `js/` → `_pre_bridgetown/` (or scaffold in a sibling dir and merge — implementer's call)
- Init: `.git/`

**Approach:**
- Park existing source files in `_pre_bridgetown/` to clear the directory for scaffolding.
- Run `bridgetown new . -t erb` (or whichever current invocation selects ERB + Esbuild defaults).
- `git init` and create an initial commit of the scaffold so subsequent units have a clean diff baseline.
- Confirm `bin/bridgetown start` boots and serves the default Bridgetown welcome page.

**Test scenarios:**
- Happy path: `bin/bridgetown start` boots without error; `localhost:4000` shows Bridgetown's default scaffolded page.
- Test expectation: none — visual confirmation of the scaffold is sufficient.

**Verification:** A Bridgetown project boots locally; the original `index.html` and `js/` are preserved in `_pre_bridgetown/` for porting in subsequent units.

---

- [ ] **Unit 2: Port HTML structure into layout + index page**

**Goal:** Reproduce the body markup of the source `index.html` via a Bridgetown layout and a single page template.

**Requirements:** R1, R2, R4

**Dependencies:** Unit 1

**Files:**
- Create: `src/_layouts/default.erb`, `src/index.erb`
- Reference (do not modify): `_pre_bridgetown/index.html`

**Approach:**
- `default.erb` contains: doctype; `<head>` (meta, `<title>`, font preconnect/links, `<%= stylesheet_link_tag %>`, `<%= javascript_include_tag %>`); `<body data-direction="readme" data-font="plex" data-accents="true">`; the masthead block; the statusbar block; `<%= yield %>`; the footer block. Body data-attributes are hardcoded to match source defaults — they are not yet configurable.
- `index.erb` contains front matter (`layout: default`, `title: "upkeep · incremental view maintenance for Rails"`) and the body content from the source: hero through install. Markup is copied verbatim — no semantic rewrite, no abstraction.
- Inline `<style>` and `<script>` references are *not* migrated yet (Units 3 and 4 own those).

**Patterns to follow:**
- Bridgetown layout/page convention; ERB front matter.

**Test scenarios:**
- Happy path: `bin/bridgetown build` produces `output/index.html` whose body markup matches the source structurally — same sections in source order, same SVG content, same data-attributes on body, same nav anchor targets (`#what`, `#how`, etc.).
- Edge case: inline SVGs in the hero diagram, the prior-art section, and the lesson cards render identically — no escaping or HTML-entity surprises.
- Edge case: ERB does not interpret stray `<%` or `%>`-like sequences in the source (e.g., inside `<pre class="code">` blocks that show ERB samples). Verify code-sample blocks render exactly as in the source.
- Test expectation: visual diff between source and built `index.html` is limited to the head (helper-injected tags, dev-mode reload markers) and possibly minor whitespace.

**Verification:** Built `output/index.html` opened alongside the source `_pre_bridgetown/index.html` is visually indistinguishable except for asset URLs in the head.

---

- [ ] **Unit 3: Migrate CSS to the frontend pipeline**

**Goal:** Move the inline `<style>` block out of the document into a Bridgetown-managed CSS asset, served via the Esbuild frontend pipeline.

**Requirements:** R1, R4

**Dependencies:** Unit 2

**Files:**
- Create: `frontend/styles/index.css`
- Modify: `src/_layouts/default.erb` (confirm `<%= stylesheet_link_tag %>` is in the head; remove anything inline that Unit 2 left behind)
- Reference (do not modify): `_pre_bridgetown/index.html`

**Approach:**
- Copy the entire `<style>...</style>` block from the source `index.html` into `frontend/styles/index.css` verbatim. Preserve declaration order — the cascade is sensitive to it.
- Verify `frontend/styles/index.css` is wired through Esbuild (Bridgetown scaffold creates this entry by default).
- Remove any `<style>` block that survived Unit 2's port.

**Test scenarios:**
- Happy path: built page applies the same colors, fonts, spacing, section dividers, and grid layouts as the source.
- Edge case: CSS custom properties (`--paper`, `--ink`, `--orange`, `--blue`, etc.) defined in `:root` resolve correctly throughout the page.
- Edge case: body-attribute branches (`body[data-accents="false"]`, `body[data-direction="paper"]`, `body[data-font="mono"]`, `body[data-font="serif"]`) still cascade — verify by toggling each attribute in devtools and watching the styling change.
- Edge case: media-query breakpoints at 820px and 900px kick in correctly (lessons grid collapses to one column at <900px; bullets/codepair/perf grids collapse to one column at <820px).
- Test expectation: any visible style regression after this unit indicates a CSS extraction error.

**Verification:** Dev-server page is visually identical to the pre-migration source; toggling body data-attributes in devtools produces the same alternate looks documented in the source CSS.

---

- [ ] **Unit 4: Migrate JS to the frontend pipeline**

**Goal:** Move the three IIFE animation modules into Bridgetown's JS pipeline, served as a single bundled asset.

**Requirements:** R3

**Dependencies:** Unit 2

**Files:**
- Create: `frontend/javascript/hero.js`, `frontend/javascript/demo.js`, `frontend/javascript/lessons.js`
- Modify: `frontend/javascript/index.js` (Esbuild entry — add side-effect imports for the three modules)
- Modify: `src/_layouts/default.erb` (confirm `<%= javascript_include_tag %>` is at end of body, matching the source's "scripts after DOM" timing)
- Reference (do not modify): `_pre_bridgetown/js/{hero,demo,lessons}.js`

**Approach:**
- Copy the three JS files verbatim. They are IIFEs with no exports.
- In `frontend/javascript/index.js`, add: `import "./hero";`, `import "./demo";`, `import "./lessons";`. Order does not matter — each module scopes itself to a unique container (`.hero .dgm`, `.demo-shell`, `.lesson-diagram`).
- Bridgetown's default `<%= javascript_include_tag %>` placement at end of `<body>` preserves the source's execution timing.

**Test scenarios:**
- Happy path: hero diagram cycles through its three scenarios at the documented 3.8s interval; the kanban demo's two panes initialize and the ambient activity loop runs; the lesson cards' SVG diagrams animate.
- Happy path: demo button controls (`move-random`, `add`, `rename`, `reset`) respond to clicks; clicking a card cycles its lane; the demo log and KV stats update.
- Edge case: console is clean — no errors about missing DOM elements, no double-init from Esbuild module side effects.
- Edge case: ambient activity in the demo pauses on hover and resumes on mouse leave (per `demo.js` behavior).
- Test expectation: any animation that ran in the source but is silent in the build indicates a bundling or selector-scope regression.

**Verification:** All three JS-driven animations run identically to the source on a fresh dev-server load; no console errors.

---

- [ ] **Unit 5: Visual parity check and cleanup**

**Goal:** Confirm the migrated site matches the source, then remove the temporary holding directory and add a minimal README.

**Requirements:** R1, R2, R3, R4

**Dependencies:** Units 1–4

**Files:**
- Delete: `_pre_bridgetown/`
- Create: `README.md` (one paragraph: "Bridgetown marketing site for upkeep. `bin/bridgetown start` for dev; `bin/bridgetown deploy` for build.")

**Approach:**
- Open built `output/index.html` and source `_pre_bridgetown/index.html` side-by-side at three viewport widths (mobile ~375px, tablet ~768px, desktop ~1280px). Walk every section: masthead, statusbar, hero (including SVG diagram and code-pair), what, how (5 arch rows), demo (2 panes), lessons (6 cards with diagrams), neighbors (compare table), perf (bars + stats), surface (5 API rows), refs (priorart + dl), who, install, footer.
- Once parity is confirmed, delete `_pre_bridgetown/`.
- Add minimal README.

**Test scenarios:**
- Happy path: every section visually matches at all three viewport widths.
- Edge case: media queries kick in correctly at the 820px and 900px breakpoints.
- Edge case: animations behave as in the source after deletion of the originals (no hidden dependency on the parked files).

**Verification:** Original static files are gone; `bin/bridgetown start` is the only way to develop the site; `bin/bridgetown deploy` produces a deployable `output/` directory.

## System-Wide Impact

- **Interaction graph:** `signal-rails-site/` is a self-contained sibling. No impact on `signal-rails` the gem, the benchmark apps, or the test apps.
- **API surface parity:** none — there is no programmatic interface here.
- **Unchanged invariants:** visual output of the marketing site, JS behavior of all three animation scripts, and all copy. The workspace's "nothing shipped until the maintainer says so" rule continues to govern whether the site is publicly announced.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Esbuild alters JS execution semantics for IIFE modules (e.g., tree-shakes them as "dead code", reorders side effects) | Use side-effect imports (`import "./hero"`) explicitly. If Esbuild still strips them, fall back to plain `<script>` tags in the layout pointing at static-asset copies under `src/js/`. |
| CSS cascade order changes when the giant `<style>` block becomes an external stylesheet (FOUC, late-applied font sizing) | Bridgetown places `<%= stylesheet_link_tag %>` in `<head>` by default — same load timing as the original inline block. Verify in Unit 3. |
| Bridgetown CLI behavior differs from documented (versions, flags) | Plan calls out `bridgetown new . -t erb` as the intent; implementer adjusts to current CLI. The shape of the project (layouts, frontend pipeline, output dir) is stable across recent Bridgetown 1.x. |
| ERB misinterprets `<%` / `%>` sequences inside `<pre class="code">` ERB-sample blocks in the source | The source already escapes these (`&lt;%= ... %&gt;`); copying verbatim preserves the escaping. Verify in Unit 2 test scenarios. |

## Documentation / Operational Notes

- After Unit 5, the README documents how to start the dev server and build the site. No deploy/hosting docs in scope.
- Plan completion is the trigger to update workspace memory if a follow-on "marketing site initiative" thread emerges (additional pages, hosting, custom domain, etc.).

## Sources & References

- Source files (pre-migration): `index.html`, `js/hero.js`, `js/demo.js`, `js/lessons.js`
- External: Bridgetown 1.x documentation — ERB defaults, Esbuild frontend pipeline, scaffolding flags
- Related context: prior conversation in this session established the placement of `signal-rails-site/` as a sibling of `signal-rails/` and stripped the design-tool tweaks scaffold from the original `index.html`.
