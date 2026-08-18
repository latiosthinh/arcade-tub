# REQUIREMENTS.md — v5.0 2D Papercraft Visual Overhaul

## Design System
- **[CRAFT-01] Papercraft Design Token System:** CSS variables for craft-paper color palette (kraft brown, construction paper primaries, cardboard tan, manila, cream), torn-edge clip-path borders, layered cardboard drop shadows (`box-shadow: 3px 3px 0px` + slight offset layers), tape-strip decorative accents, staple/pin UI details, hand-cut wobble border effects.
- **[CRAFT-02] Papercraft Typography:** Hand-drawn/craft-style Google Fonts (e.g. Patrick Hand, Indie Flower, or Cabin Sketch for headings; Nunito or Quicksand for body), consistent across hub and in-game canvas text rendering.

## Hub & Shell
- **[CRAFT-03] Hub Site Papercraft Transformation:** Header, search box, filter chips, game cards, player view, score cards, details panel, and bottom nav — all restyled as construction paper cutouts with cardboard frames, tape strip joins, and layered paper depth.
- **[CRAFT-04] Game Shell HTML Containers:** All 15 `games/*/index.html` files updated with craft-paper backgrounds, cardboard-framed canvases, and papercraft Google Fonts loaded.

## In-Game Canvas Renderers
- [x] **[CRAFT-05] Simple Game Renderers (5 games):** `safe-cracker`, `memory-cards`, `memory-boxes`, `game-2048`, `pop-balloon` — canvas backgrounds as layered construction paper, sprites as paper cutouts with visible edges, HUD text in craft fonts, overlays on sticky-note cards.
- **[CRAFT-06] Mid-Complexity Game Renderers (5 games):** `brick-blitz`, `crate-catch`, `type-strike`, `flappy-fish`, `sky-hopper` — paper cutout paddles/bricks/crates/fish/platforms, cardboard pillar obstacles, torn-paper particle effects, sticky-note score panels.
- **[CRAFT-07] Complex Game Renderers (5 games):** `snake-eat`, `bug-climb`, `car-race`, `space-racer`, `virus-defense` — origami/folded paper car sprites, paper-cutout ladybug, construction paper road/trunk/arena, craft-paper starfield, cardboard HUD gauges.

## Metadata & Catalog
- [x] **[CRAFT-08] Game Catalog Data Update:** `src/data/games.ts` titles, descriptions, icons, theme colors, and banner gradients updated to match papercraft visual language.

## Quality Gates
- **[CRAFT-09] Build & Test Integrity:** All 574 unit tests pass, Vite production build succeeds, bundle < 200KB gzipped, deployed to Cloudflare Pages.
