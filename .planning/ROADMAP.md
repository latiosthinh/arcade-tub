# ROADMAP.md — Milestone v7.0: Sensory Antistress Sandbox (8 Games)

## Overview
Expand ArcadeTub by implementing 8 dedicated sensory antistress sandbox minigames (`bubble-pop`, `soap-carve`, `sand-zen`, `fidget-spin`, `liquid-sort`, `pop-it`, `grass-mow`, `hydraulic-crush`) with procedural ASMR Web Audio, zero cognitive load, and full PWA/fullscreen integration.

---

### Phase 43: Bubble Wrap Pop & Pop-It Fidget (`games/bubble-pop/`, `games/pop-it/`)
- `bubble-pop`: Grid bubble sheet with swipe popping, golden rainbow burst chords, and fresh sheet reload.
- `pop-it`: Multi-shape geometric push-bubble toy boards with reversible rubbery pop physics and board flipping.
- Unit tests for cell state matrices, flip state machine, and audio trigger mappings.

### Phase 44: Soap Carver & Hydraulic Press (`games/soap-carve/`, `games/hydraulic-crush/`)
- `soap-carve`: Layered soap shaving cutter with curly peel particles, carving depth progression, and hidden figurine discovery.
- `hydraulic-crush`: Downward hydraulic piston mechanics, squash accordion deformation, squishy splatter physics.
- Unit tests for shaving depth grids, piston pressure math, and deformation states.

### Phase 45: Sand Zen & Color Water Sort (`games/sand-zen/`, `games/liquid-sort/`)
- `sand-zen`: Granular sand falling particle simulator, sand hopper dispenser, rake dragging, and dune repose.
- `liquid-sort`: Liquid test tube stacking, pouring transfer validation, stratification checks, and undo history.
- Unit tests for cellular automaton / granular sand grid and water sort transfer rules.

### Phase 46: Fidget Spinner & Grass Mower (`games/fidget-spin/`, `games/grass-mow/`)
- `fidget-spin`: Angular inertia velocity solver, RPM tachometer, neon light trail renderer, and harmonic bearing hum.
- `grass-mow`: Grid mowing terrain, blade cutting confetti effects, yard path clearing metrics.
- Unit tests for rotational physics deceleration and lawn grid cutting coverage.

### Phase 47: Antistress Hub Integration & Final Milestone Audit
- Register all 8 games in `src/data/games.ts` (bringing total catalog to **42 games**).
- Author 8 authentic 2D Papercraft SVG screenshots in `src/data/screenshots.ts`.
- Register all 8 HTML entries in `vite.config.ts`.
- Run full test suite and bundle size verification (<300KB gzipped).

---

## Completed Milestones
- [Milestone v6.0: CrazyGames Minigame Replication](milestones/v6.0-ROADMAP.md) (Archived)
- [Milestone v5.0: 2D Papercraft Visual Overhaul](milestones/v5.0-ROADMAP.md) (Archived)
- [Milestone v4.0: Catalog Expansion](milestones/v4.0-ROADMAP.md) (Archived)
- [Milestone v3.0: 7 New Games](milestones/v3.0-ROADMAP.md) (Archived)
- [Milestone v2.0: Cyber-Arcade UI/UX Refactor](milestones/v2.0-ROADMAP.md) (Archived)
- [Milestone v1.0: Foundation & 5 Games](milestones/v1.0-ROADMAP.md) (Archived)
