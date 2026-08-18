# Roadmap: Arcade Carnival

## Overview

Arcade Carnival is a cyber-arcade collection of 15 browser-based HTML5 Canvas minigames built with vanilla TypeScript, Canvas 2D, procedural Web Audio, and zero runtime dependencies. Milestone v4.0 expands the catalog from 12 to 15 games (Cyber Snake, Bug Climb Tree, Neon Highway Car Race), adds Arrow Mode to Type Strike, and performs a complete release audit.

## Milestone v4.0 Phases

- [x] **Phase 21: Type Strike Arrow Mode** — Mode toggle, arrow sequence badges (↑ ↓ ← → / WASD), directional input & lasers (TS-ARR-01, TS-ARR-02)
- [x] **Phase 22: Cyber Snake Minigame** — Grid matrix movement, food pellets, tail growth, wall/self collision, particle effects (SNK-01, SNK-02)
- [x] **Phase 23: Bug Climb Tree Minigame** — Trunk side-switching, procedural branch obstacles, urgent timer bar, chop particles (BUG-01, BUG-02)
- [ ] **Phase 24: Neon Highway Car Race Minigame** — Multi-lane traffic dodger, speed control, slipstream draft bonus, crash FX (CAR-01, CAR-02)
- [ ] **Phase 25: Catalog Expansion & Release Audit** — 15-game catalog registry, SVG screenshots, multi-page Vite build, bundle audit (<200KB), 100% test pass (HUB-CAT-01, HUB-CAT-02)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1–7. v1.0 Foundation & 5 Core Games | 17/17 | Complete | 2026-08-17 |
| 8–12. v2.0 Unique UI/UX Refactor | 10/10 | Complete | 2026-08-17 |
| 13–20. v3.0 Game Catalog Expansion (7 Games) | 16/16 | Complete | 2026-08-18 |
| 21. Type Strike Arrow Mode | 2/2 | Complete | 2026-08-18 |
| 22. Cyber Snake Minigame | 2/2 | Complete | 2026-08-18 |
| 23. Bug Climb Tree Minigame | 2/2 | Complete | 2026-08-18 |
| 24. Neon Highway Car Race Minigame | 0/2 | Not started | - |
| 25. Catalog Expansion & Release Audit | 0/2 | Not started | - |

## Phase Details

### Phase 21: Type Strike Arrow Mode
**Goal**: Players can play Type Strike using arrow sequences / WASD direction keys alongside traditional word typing.
**Depends on**: Phase 20
**Requirements**: TS-ARR-01, TS-ARR-02
**Success Criteria** (what must be TRUE):
  1. Player can toggle between "WORDS" and "ARROWS" mode on Type Strike ready screen.
  2. In Arrow mode, drone badges render arrow glyph sequences (`↑ ↓ ← →`) matching directional targets.
  3. Pressing directional inputs (Arrow keys or WASD) matches and clears sequence steps, firing defense lasers on sequence completion.
  4. Scoring, multipliers, laser effects, and sound synthesis operate consistently across both modes with 100% test coverage.
**Plans**: 2 plans

Plans:
- [x] 21-01-PLAN.md — Domain logic & unit tests for Arrow Mode (Dictionary, TypingEngine, Enemy)
- [x] 21-02-PLAN.md — Canvas UI, Mode toggle button, Arrow glyph badges, input & audio wiring

### Phase 22: Cyber Snake Minigame
**Goal**: Deliver complete playable Cyber Snake game on neon grid with food pellets, tail growth, speed scaling, and particle effects.
**Depends on**: Phase 21
**Requirements**: SNK-01, SNK-02
**Success Criteria** (what must be TRUE):
  1. Player can steer neon cyber-snake across grid matrix using Arrow keys, WASD, or touch swipe without 180° instant reverse collision.
  2. Consuming energy food pellets extends tail length, adds score, accelerates game speed, and triggers neon eating particle bursts.
  3. Colliding with grid boundary walls or own tail triggers game over state and records high score.
  4. Standalone HTML entry and Vite rollup build bundle cleanly with procedural Web Audio eating/crash sounds.
**Plans**: 2 plans

Plans:
- [x] 22-01-PLAN.md — Grid matrix math, Snake kinematics & 180° direction buffer, FoodSpawner, GameState & 100% unit tests (SNK-01)
- [x] 22-02-PLAN.md — SnakeAudio, ParticleSystem, SnakeRenderer neon UI, controls & Vite packaging (SNK-02)

### Phase 23: Bug Climb Tree Minigame
**Goal**: Deliver complete playable Bug Climb Tree minigame with trunk side-switching, falling branch hazards, countdown timer, and climbing animations.
**Depends on**: Phase 22
**Requirements**: BUG-01, BUG-02
**Success Criteria** (what must be TRUE):
  1. Player can tap Left or Right arrows / A or D keys to switch bug sides on the trunk while ascending.
  2. Branch obstacles spawn procedurally on left or right sides; colliding with a branch immediately ends the run.
  3. Urgent countdown timer bar drains continuously and replenishes with successful climbing steps.
  4. Procedural audio, chop particles, animated bug sprite, and high score tracking work in standalone build.
**Plans**: TBD
**UI hint**: yes

### Phase 24: Neon Highway Car Race Minigame
**Goal**: Deliver complete playable Neon Highway Car Race minigame with multi-lane traffic navigation, acceleration/braking, draft boosts, and engine audio.
**Depends on**: Phase 23
**Requirements**: CAR-01, CAR-02
**Success Criteria** (what must be TRUE):
  1. Player can steer sports car across multiple vertical highway lanes and adjust speed with Up/Down or W/S keys.
  2. Oncoming traffic vehicles spawn at variable speeds in different lanes; dodging them close awards slipstream draft bonus points.
  3. Colliding with traffic triggers explosion visual effects, procedural crash audio, and game over screen.
  4. Standalone HTML entry and Vite rollup build bundle cleanly with smooth scrolling road canvas.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 24-01-PLAN.md — Multi-lane highway geometry, PlayerCar physics (100-350 km/h), TrafficManager & drafting bonus, GameState & 100% unit tests (CAR-01)
- [ ] 24-02-PLAN.md — CarAudio engine pitch bend & crash FX, Particles, HighwayRenderer synthwave visuals, CarRaceScene controls & Vite packaging (CAR-02)

### Phase 25: Catalog Expansion & Release Audit
**Goal**: Integrate all 3 new games into hub catalog with metadata and SVG screenshots, verify multi-page build, ensure bundle < 200KB, and 100% tests pass across all 15 games.
**Depends on**: Phase 21, Phase 22, Phase 23, Phase 24
**Requirements**: HUB-CAT-01, HUB-CAT-02
**Success Criteria** (what must be TRUE):
  1. Central catalog lists all 15 games with genre tags, accurate metadata, and sharp custom vector SVG screenshots.
  2. Multi-page Vite build generates standalone bundles for all 15 games, hub, and embed views.
  3. Total gzipped distribution bundle remains strictly under the 200 KB budget.
  4. Vitest test suite executes across all 15 games with 100% pass rate.
**Plans**: TBD
**UI hint**: yes
