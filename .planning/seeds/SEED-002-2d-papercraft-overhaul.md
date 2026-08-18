# SEED-002: 2D Papercraft Visual Overhaul

## Idea
Replace the current vintage storybook aesthetic with a full **2D Papercraft** visual identity — every game, the hub catalog, player view, and all UI components rendered as if cut from colored construction paper, layered with visible paper edges, tape strips, staples, and hand-torn textures. Games themselves (canvas renderers) would draw sprites, backgrounds, HUDs, and overlays using papercraft materials: folded paper cars, origami fish, cut-out balloons, cardboard bricks, etc.

## Why
The current vintage storybook style uses flat warm colors and ink borders but still feels like a conventional 2D game. A papercraft aesthetic would create a **distinctive tactile identity** that stands out — everything looks handmade, like a child's art project. This would:
- Create strong visual cohesion across all 15 games
- Appeal to younger audiences and parents
- Differentiate from every other browser game hub
- Allow layered depth effects (paper shadow layers, folded edges)

## Trigger Conditions
Surface this seed when:
- Starting a new milestone after the current vintage style is stable and shipped
- User requests a visual refresh or "next level" design pass
- Planning a v2.0 or v3.0 milestone

## Scope Estimate
- **Hub & UI CSS:** Replace tokens, theme, all component CSS with papercraft textures, torn-edge borders, tape/staple decorations, craft-paper color palette
- **15 game renderers:** Each game's Scene/Renderer TypeScript files need full canvas redraw — sprites as paper cutouts, backgrounds as layered construction paper, HUDs as sticky-note overlays
- **Game index.html shells:** Update all 15 game containers
- **Estimated effort:** 3-5 phases across 1 milestone

## Breadcrumbs
- Hub design tokens: `src/styles/tokens.css`, `src/styles/theme.css`
- Hub component CSS: `src/styles/components/*.css`
- Game catalog data: `src/data/games.ts`
- Game renderers (canvas): `games/*/src/*Renderer.ts`, `games/*/src/*Scene.ts`
- Game shell HTML: `games/*/index.html`

## Status
Planted: 2026-08-18
Activated: 2026-08-18 — Milestone v5.0
