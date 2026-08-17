---
id: SEED-001
status: dormant
planted: 2026-08-17
planted_during: v1.0 (complete)
trigger_when: immediately — next milestone
scope: Large
---

# SEED-001: Refactor webapp to have a unique UI/UX

## Why This Matters

Current hub is a YouTube-dark clone (`#0f0f0f` bg, `--yt-*` CSS vars, Roboto font). It looks like every other dark-themed game launcher. No visual identity distinguishes Arcade Carnival from generic game hubs. A unique design language would make the product memorable and establish brand recognition.

## When to Surface

**Trigger:** Immediately — surface at next milestone (v2.0)

This seed should be presented during `/gsd-new-milestone` when the milestone
scope matches any of these conditions:
- Starting v2.0 or any new major version
- Any milestone focused on user experience or visual design
- Any milestone adding public-facing features or expanding audience

## Scope Estimate

**Large** — Full milestone. Complete visual identity overhaul + UX architecture rework. Current hub is 376 lines of innerHTML rendering + 637 lines of flat CSS, plus a separate embed page with its own inline styles. Touches every user-facing surface.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/hub.ts:1-376` — Hub SPA logic, raw innerHTML rendering, no component model. Every state change rebuilds entire DOM. Search input focus workaround exists.
- `src/hub.css:1-637` — Flat CSS, all `.yt-*` prefixed classes. YouTube-dark theme hardcoded. No CSS modules or scoping.
- `embed.html` — Separate design system with inline `<style>` block. Not unified with hub.
- `index.html` — Hub entry point, loads hub.ts + hub.css.
- `games/*/src/*Scene.ts` — Each game has own canvas rendering. Game visual identity is emoji icons + CSS gradients only.
- `.planning/REQUIREMENTS.md` — All 12 v1.0 requirements met. No UX requirements beyond functional.
- `.planning/v1.0-MILESTONE-AUDIT.md` — v1.0 audit passed, confirms current state is baseline.

## Notes

Key problems to solve in the refactor:

1. **No unique identity** — YT-dark clone look, emoji-only game cards, no custom illustrations or brand elements
2. **innerHTML rendering** — No component model, no virtual DOM, full DOM rebuild on state changes
3. **No transitions/animations** — Hard page swaps between feed and player view
4. **No routing** — State via module variables, browser back button broken
5. **Weak mobile** — Sidebar hides entirely below 900px, no bottom nav replacement, no touch gestures
6. **Flat CSS architecture** — 637 lines in one file, `.yt-*` prefix convention only
7. **Embed page diverged** — Separate design system from hub
8. **No loading states** — Game iframe loads with no indicator or error handling
9. **No theme options** — Hardcoded dark theme only
10. **Static game metadata** — Hardcoded play counts and ratings, not data-driven

Constraint: must stay zero-dependency (no React/Vue/Svelte) per project philosophy. Refactor should use vanilla TS web components or similar lightweight approach.
