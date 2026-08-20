# ROADMAP.md — Milestone v8.0: Tank 1990 (Battle City) Retro Papercraft Arcade

## Overview
Deliver a faithful, highly responsive browser recreation of the classic Tank 1990 / Battle City arcade tactical shooter featuring distinctive tactile papercraft visuals, procedural 8-bit Web Audio, authentic destructible grid mechanics, 4-tier tank progression, smart enemy AI, stage campaigns, and seamless mobile touch controls with zero external dependencies.

---

## Phases

- [x] **Phase 48: GridMap Engine & Sub-Tile Destruction** - 26×26 microgrid, 4-quadrant sub-tile brick chipping, terrain behaviors, Eagle HQ entity, and 35 authentic stage map loaders.
- [x] **Phase 49: Player Tank Kinematics & Upgrade Tiers** - 4-way cardinal steering with corridor auto-alignment snapping, 4 upgrade tiers, invulnerability shields, and lives/respawn cycles.
- [ ] **Phase 50: Ballistics System & Combat Collisions** - 120Hz sub-stepping projectile simulation, bullet-vs-bullet cancellation, tier-dependent terrain penetration, and damage resolution.
- [ ] **Phase 51: Enemy AI, Wave Spawner & Power-Up System** - 20-tank wave queue, 4 enemy classes, grid-node steering AI, flashing bonus drops, 8 tactical powerup items, and shovel fortification timers.
- [ ] **Phase 52: Game Flow, State Machine & Tally HUD** - Title screen, stage intro curtains, HUD sidebar, end-stage kill tally screen, victory/defeat sequence, and localStorage high score persistence.
- [ ] **Phase 53: Tactile Papercraft Visuals & Procedural Web Audio** - Multi-pass Canvas 2D cardboard rendering, confetti explosion bursts, and zero-asset procedural 8-bit Web Audio synthesis with dynamics compression.
- [ ] **Phase 54: Mobile Virtual Controls & Responsive Viewport** - 4-way virtual D-Pad with angular hysteresis, dedicated Fire button, multi-touch isolation, and 416×416 aspect ratio scaling.
- [ ] **Phase 55: Hub Catalog Registration, Test Suite & Integration** - Standalone packaging in `games/tank-1990/`, catalog registration with custom SVG screenshot, Vite multi-page config, and full Vitest suite verification.

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 48. GridMap Engine & Sub-Tile Destruction | 2/2 | Complete | 2026-08-20 |
| 49. Player Tank Kinematics & Upgrade Tiers | 2/2 | Complete | 2026-08-20 |
| 50. Ballistics System & Combat Collisions | 2/2 | Complete | 2026-08-20 |
| 51. Enemy AI, Wave Spawner & Powerups | 0/2 | Not started | - |
| 52. Game Flow, State Machine & Tally HUD | 0/2 | Not started | - |
| 53. Papercraft Visuals & Procedural Audio | 0/2 | Not started | - |
| 54. Mobile Virtual Controls & Viewport | 0/2 | Not started | - |
| 55. Hub Integration & Milestone Audit | 0/2 | Not started | - |

---

## Phase Details

### Phase 48: GridMap Engine & Sub-Tile Destruction
**Goal**: System maintains 26×26 microgrid world representation, sub-tile brick chipping bitmasks, terrain modifiers (water, trees, ice), defensible Eagle HQ, and stage loader for 35 campaign maps.
**Depends on**: Nothing (first phase of v8.0)
**Requirements**: GRID-01, GRID-02, GRID-03, GRID-04, GRID-05, GRID-06, GRID-07
**Success Criteria** (what must be TRUE):
  1. 26×26 tile grid correctly models Empty, Brick, Steel, Water, Trees, and Ice terrain cells on a 416×416 arena.
  2. Brick walls chip away in 4 independent sub-tile quadrants (8×8px) when struck by projectiles.
  3. Water blocks tank traversal while permitting bullet flight; Trees provide visual camouflage; Ice induces low-friction sliding drift.
  4. Eagle Base HQ (2×2 footprint) triggers instant defeat/game over when destroyed.
  5. 35 authentic stage map layouts load accurately into grid memory.
**Plans**: 2 plans
Plans:
- [x] 48-01-PLAN.md — GridMap core engine, tile types, bitmask chipping, terrain query methods, Eagle HQ state
- [x] 48-02-PLAN.md — 35 authentic stage map data encodings, stage loader, and comprehensive Vitest unit test suite
**UI hint**: yes

### Phase 49: Player Tank Kinematics & Upgrade Tiers
**Goal**: User can steer player tank with smooth corridor auto-alignment snapping, progress through 4 upgrade tiers, gain extra lives, and trigger invulnerability shield bubbles on spawn.
**Depends on**: Phase 48
**Requirements**: TANK-01, TANK-02, TANK-03, TANK-04
**Success Criteria** (what must be TRUE):
  1. User can steer player tank in 4 cardinal directions and smoothly navigate 1-tile corridors via orthogonal corner auto-snapping (≤4px deadzone).
  2. Player tank progresses through 4 tiers: Tier 1 (Basic), Tier 2 (Fast), Tier 3 (Heavy dual-shot), Tier 4 (Armor-piercing cannon destroying steel/trees).
  3. Player tank spawns and respawns with active temporary invulnerability shield bubble.
  4. System tracks player lives counter, awards extra lives, and cycles through player death and respawn.
**Plans**: 2 plans
Plans:
- [x] 49-01-PLAN.md — PlayerTank core class, 4-way kinematics, corner snapping, ice sliding drift, upgrade tiers, shield timer, and lives management
- [x] 49-02-PLAN.md — Comprehensive Vitest unit test suite covering kinematics, corner snapping, ice drift, upgrade progression, shield expiration, and respawn cycle

### Phase 50: Ballistics System & Combat Collisions
**Goal**: Simulate high-velocity projectiles with continuous sub-stepping collision sweep, mid-air bullet cancellation, tier-dependent terrain destruction, and enemy damage resolution.
**Depends on**: Phase 48, Phase 49
**Requirements**: COMBAT-01, COMBAT-02, COMBAT-03, COMBAT-04
**Success Criteria** (what must be TRUE):
  1. Projectiles travel at high speeds without tunneling through walls or entities via 120Hz sub-stepping.
  2. Intersecting opposing projectiles collide and cancel each other out in mid-air with spark bursts.
  3. Bullets deal tier-specific damage to terrain (standard shots chip bricks; tier-4 shots penetrate steel and clear trees).
  4. Projectiles register accurate hits against enemy tanks, deducting armor hit points.
**Plans**: TBD

### Phase 51: Enemy AI, Wave Spawner & Power-Up System
**Goal**: Manage 20-tank wave queue with 4 distinct enemy archetypes, goal-oriented grid-node steering AI, flashing bonus tank drops, 8 tactical powerup items, and base fortification timers.
**Depends on**: Phase 48, Phase 49, Phase 50
**Requirements**: ENEMY-01, ENEMY-02, ENEMY-03, ENEMY-04, ENEMY-05, ENEMY-06
**Success Criteria** (what must be TRUE):
  1. Spawner manages 20-tank wave queue with up to 4 concurrent active enemy tanks across 3 top portals.
  2. 4 enemy classes (Basic, Fast Cruiser, Power Tank, Heavy Armor Tank) exhibit distinct speeds, firing rates, and hit points with visual color degradation.
  3. Enemy AI navigates grid intersections with pathing bias towards player/base and zero corner vibration loops.
  4. Flashing tanks drop collectible tactical powerups (Star, Shovel, Grenade, Clock, Helmet, Tank, Gun, Boat).
  5. Shovel powerup temporarily fortifies base perimeter with steel and cleanly restores original undamaged brick state upon 20s timeout.
**Plans**: 2 plans
Plans:
- [ ] 51-01-PLAN.md — EnemyTank, EnemySpawner, grid-node steering AI, and flashing tank powerup drop mechanics
- [ ] 51-02-PLAN.md — PowerUpSystem managing all 8 tactical items, shovel base fortification terrain caching/restoration, and comprehensive Vitest unit test suite

### Phase 52: Game Flow, State Machine & Tally HUD
**Goal**: Orchestrate full arcade loop including title screen, stage select, stage intro curtains, active HUD side panel, end-stage kill tally screen, victory/defeat sequence, and localStorage high score persistence.
**Depends on**: Phase 48, Phase 49, Phase 50, Phase 51
**Requirements**: LOOP-01, LOOP-02, LOOP-03, LOOP-04, LOOP-05, LOOP-06
**Success Criteria** (what must be TRUE):
  1. User can navigate title screen with Game Start, Stage Select (1–35), and high score display.
  2. Stage intro curtain ("STAGE X") displays before each round.
  3. Active HUD side panel displays remaining enemy reserve tank icons, player lives, current stage number, and real-time score.
  4. Clearing a stage presents end-stage kill tally screen breaking down points earned per enemy class destroyed.
  5. Victory advances to next stage; defeat shows Game Over banner and restart prompt; personal best high scores persist in localStorage.
**Plans**: TBD
**UI hint**: yes

### Phase 53: Tactile Papercraft Visuals & Procedural Web Audio
**Goal**: Render tactile 2D papercraft cardboard aesthetic across multi-pass canvas layers, generate confetti explosion bursts, and synthesize procedural 8-bit Web Audio with master dynamics compression.
**Depends on**: Phase 48, Phase 49, Phase 50, Phase 51, Phase 52
**Requirements**: VISUAL-01, VISUAL-02, VISUAL-03, VISUAL-04, VISUAL-05
**Success Criteria** (what must be TRUE):
  1. Tanks and terrain render as layered cardboard cutouts with drop shadows, rolling tread trails, and turret recoil animations.
  2. Multi-pass canvas composition correctly orders Ground -> Entities & Powerups -> Grass Canopy Overlay -> Particle FX -> HUD Overlay.
  3. Explosions, wall chipping, and bullet impacts emit paper confetti particles and muzzle sparks.
  4. Procedural 8-bit Web Audio synthesizes engine hums, shot pops, wall crumble crunch, steel clangs, explosions, item pickup fanfares, and base destruction alarm without external assets.
  5. Master DynamicsCompressor routes all audio channels to prevent clipping and distortion during heavy explosion sequences.
**Plans**: TBD
**UI hint**: yes

### Phase 54: Mobile Virtual Controls & Responsive Viewport
**Goal**: Deliver responsive 4-way virtual D-Pad with angular hysteresis, dedicated Fire button, multi-touch isolation, and pixel-crisp 416×416 aspect ratio scaling across mobile and desktop viewports.
**Depends on**: Phase 49, Phase 52, Phase 53
**Requirements**: MOBILE-01, MOBILE-02, MOBILE-03
**Success Criteria** (what must be TRUE):
  1. On-screen 4-way virtual D-Pad provides responsive cardinal steering with angular hysteresis deadzone.
  2. Dedicated touch Fire button enables responsive single-tap and rapid firing.
  3. Multi-touch handling allows holding D-Pad direction while tapping Fire without gesture stutter or screen scrolling.
  4. Game arena scales with crisp pixel art aspect ratio preservation across mobile portrait, landscape, and desktop viewports.
**Plans**: TBD
**UI hint**: yes

### Phase 55: Hub Catalog Registration, Test Suite & Integration
**Goal**: Package Tank 1990 in `games/tank-1990/`, register in catalog with custom SVG screenshot, wire Vite multi-page config, and execute 100% passing Vitest test suite.
**Depends on**: Phase 48, Phase 49, Phase 50, Phase 51, Phase 52, Phase 53, Phase 54
**Requirements**: INTEG-01, INTEG-02, INTEG-03, INTEG-04
**Success Criteria** (what must be TRUE):
  1. Game is packaged in standalone directory `games/tank-1990/` with zero runtime dependencies.
  2. Game is registered in `src/data/games.ts` with metadata, tags (`action`, `retro`, `arcade`), and custom SVG screenshot.
  3. Game is wired into `vite.config.ts` multi-page input build configuration.
  4. Comprehensive Vitest unit tests covering grid micro-chipping, corner-snapping, projectile sweeps, enemy AI node routing, and powerup mechanics achieve 100% pass rate.
**Plans**: TBD
**UI hint**: yes

---

## Completed Milestones
- [Milestone v7.0: Sensory Antistress Sandbox](v7.0-MILESTONE-AUDIT.md) (Completed)
- [Milestone v6.0: CrazyGames Minigame Replication](milestones/v6.0-ROADMAP.md) (Archived)
- [Milestone v5.0: 2D Papercraft Visual Overhaul](milestones/v5.0-ROADMAP.md) (Archived)
- [Milestone v4.0: Catalog Expansion](milestones/v4.0-ROADMAP.md) (Archived)
- [Milestone v3.0: 7 New Games](milestones/v3.0-ROADMAP.md) (Archived)
- [Milestone v2.0: Cyber-Arcade UI/UX Refactor](milestones/v2.0-ROADMAP.md) (Archived)
- [Milestone v1.0: Foundation & 5 Games](milestones/v1.0-ROADMAP.md) (Archived)
