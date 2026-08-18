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
- **Plans:** 2 plans
Plans:
- [ ] 27-01-PLAN.md — Test harness and update game shells 1-8 (safe-cracker, brick-blitz, sky-hopper, crate-catch, type-strike, memory-cards, memory-boxes, pop-balloon)
- [ ] 27-02-PLAN.md — Update game shells 9-15 (space-racer, virus-defense, flappy-fish, game-2048, snake-eat, bug-climb, car-race) and full verification
- **Status:** In progress

#### Phase 28: Simple Game Renderers (5 games)
- **Goal:** Convert canvas renderers for safe-cracker, memory-cards, memory-boxes, game-2048, pop-balloon to papercraft sprites, backgrounds, and overlays.
- **Requirements:** [CRAFT-05, CRAFT-08]
- **Files:** `games/{safe-cracker,memory-cards,memory-boxes,game-2048,pop-balloon}/src/*Renderer.ts`, `*Scene.ts`, `src/data/games.ts`
- **Plans:** 2/2 complete
Plans:
- [x] 28-01-PLAN.md — Papercraft conversion for safe-cracker, memory-cards, and memory-boxes
- [x] 28-02-PLAN.md — Papercraft conversion for game-2048, pop-balloon, metadata update, and verification
- **Status:** Complete

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
| 27. Game Shell HTML | In progress |
| 28. Simple Renderers (5) | Complete |
| 29. Mid Renderers (5) | Not started |
| 30. Complex Renderers (5) + Audit | Not started |
