# ROADMAP.md

## Milestone v5.0: 2D Papercraft Visual Overhaul
Goal: Replace entire visual identity (hub + all 15 games) with handmade 2D papercraft aesthetic.

#### Phase 26: Hub Papercraft Design System & CSS
- **Goal:** Replace all hub CSS tokens, theme primitives, and component styles with papercraft design language (craft-paper palette, torn-edge borders, tape/staple accents, cardboard shadows, craft fonts).
- **Requirements:** [CRAFT-01, CRAFT-02, CRAFT-03]
- **Files:** `src/styles/tokens.css`, `src/styles/theme.css`, `src/styles/components/*.css`, `src/hub.css`, `index.html`
- **Plans:** 2/2 complete
- **Status:** Complete

#### Phase 27: Game Shell HTML Containers (15 games)
- **Goal:** Update all 15 `games/*/index.html` with papercraft backgrounds, cardboard canvas frames, craft fonts.
- **Requirements:** [CRAFT-04]
- **Files:** `games/*/index.html`
- **Plans:** TBD
- **Status:** Not started

#### Phase 28: Simple Game Renderers (5 games)
- **Goal:** Convert canvas renderers for safe-cracker, memory-cards, memory-boxes, game-2048, pop-balloon to papercraft sprites, backgrounds, and overlays.
- **Requirements:** [CRAFT-05, CRAFT-08]
- **Files:** `games/{safe-cracker,memory-cards,memory-boxes,game-2048,pop-balloon}/src/*Renderer.ts`, `*Scene.ts`, `src/data/games.ts`
- **Plans:** TBD
- **Status:** Not started

#### Phase 29: Mid-Complexity Game Renderers (5 games)
- **Goal:** Convert canvas renderers for brick-blitz, crate-catch, type-strike, flappy-fish, sky-hopper to papercraft.
- **Requirements:** [CRAFT-06, CRAFT-08]
- **Files:** `games/{brick-blitz,crate-catch,type-strike,flappy-fish,sky-hopper}/src/*Renderer.ts`, `*Scene.ts`
- **Plans:** TBD
- **Status:** Not started

#### Phase 30: Complex Game Renderers (5 games) + Final Audit
- **Goal:** Convert canvas renderers for snake-eat, bug-climb, car-race, space-racer, virus-defense. Final build audit, test verification, and Cloudflare deploy.
- **Requirements:** [CRAFT-07, CRAFT-08, CRAFT-09]
- **Files:** `games/{snake-eat,bug-climb,car-race,space-racer,virus-defense}/src/*Renderer.ts`, `*Scene.ts`
- **Plans:** TBD
- **Status:** Not started

## Progress

| Phase | Status |
|-------|--------|
| 26. Hub Papercraft CSS | Complete |
| 27. Game Shell HTML | Not started |
| 28. Simple Renderers (5) | Not started |
| 29. Mid Renderers (5) | Not started |
| 30. Complex Renderers (5) + Audit | Not started |
