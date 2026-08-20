# Project Research Summary

**Project:** ArcadeTub v8.0 — Tank 1990 (Battle City) Retro Papercraft Arcade  
**Domain:** 2D Top-Down Tactical Grid Action / Arcade Minigame  
**Researched:** 2026-08-20  
**Confidence:** HIGH  

## Executive Summary

Tank 1990 is a grid-constrained 2D tactical arcade shooter built to replicate classic NES *Battle City* mechanics with ArcadeTub's modern papercraft aesthetic. Core gameplay relies on 26×26 sub-tile destruction (quarter-tile brick chipping), 4-tier tank power-up progression, wave-based enemy tank AI targeting a destructible Eagle base HQ, and zero-dependency procedural rendering and audio.

Expert implementations separate pure deterministic simulation logic (grid math, bullet sweeping, AABB collision, AI decision trees) from rendering and I/O. The architecture deploys standard HTML5 Canvas 2D multi-layer rendering (ground -> entities -> grass canopy -> particles/HUD) and procedural Web Audio API chiptune synthesis. All logic runs inside `games/tank-1990/` with zero external runtime dependencies and full Vitest unit testability.

The primary technical risks are: (1) corner-catching movement jitter when turning in narrow corridors, (2) whole-tile brick destruction breaking corridor carving, (3) high-speed bullet tunneling and dropped bullet-vs-bullet cancellation, and (4) enemy AI corner-sticking deadlocks. These are mitigated by 4px orthogonal grid snap assists, 4-quadrant sub-tile bitmasking, 120Hz sub-step bullet sweeps, and grid-node AI steering with anti-reversal bias.

## Key Findings

### Recommended Stack

The game relies entirely on vanilla TypeScript 5.8+ and native web platform APIs within Vite 7 workspace tooling. No third-party physics, game engine, or audio libraries are needed or allowed.

**Core technologies:**
- **HTML5 Canvas 2D API:** Hardware-accelerated multi-pass procedural rendering for cardboard cutouts, dynamic drop shadows, confetti debris, and foreground canopy occlusion.
- **Procedural Web Audio API:** Zero-asset chiptune synthesizer generating square, pulse, sawtooth, and filtered noise buffers for authentic 8-bit shots, crunches, explosions, and fanfares.
- **Custom AABB & 26×26 Bitmask Grid:** Deterministic grid physics with quadrant-level sub-tile destruction without runtime physics engine overhead.
- **Browser localStorage API:** Local campaign stage progression, high scores, and persistent settings.
- **Vitest + Happy DOM:** Fast headless unit testing of grid destruction, bullet ballistics, tank upgrade stats, and AI state machines.

### Expected Features

**Must have (table stakes):**
- **26×26 Sub-Tile Grid & Quarter-Tile Chipping:** 13×13 macro-tiles subdivided into 8×8 px quadrants; bullets destroy 1–2 quadrants per hit.
- **Defensible Eagle HQ Base:** Instant defeat condition upon destruction; support for brick perimeter and Shovel temporary steel fortification.
- **Terrain Modifiers:** Water blocks tanks but allows bullets; trees/grass provide visual camouflage layer over entities; ice causes inertia drift.
- **4-Tier Player Progression:** Basic (slow single shot) -> Fast (speed shot) -> Heavy (dual fast shots) -> Super Cannon (destroys steel and trees).
- **4 Enemy Archetypes:** Basic Tank, Fast Cruiser, Power Tank (flashing drop trigger), and Heavy Armor Tank (4 hits with palette changes).
- **Power-Up Drop System:** Star, Shovel, Grenade, Clock (freeze), Helmet (shield), Extra Life, plus Tank 1990 Pistol and Boat.
- **Ballistics Mechanics:** Continuous sweep bullet collision and mid-air bullet-vs-bullet mutual cancellation.
- **Grid Auto-Alignment Assist:** Sub-tile orthogonal snap threshold ($\le 4\text{px}$) to prevent corner snagging.
- **Stage Progression & Tally Screen:** 20-tank enemy queue HUD, 3 top spawn points, stage transition curtains, and score breakdown screen.
- **Mobile Virtual Controls:** Responsive 4-way D-Pad with angular hysteresis and tactile Fire button.

**Should have (competitive differentiators):**
- **Tactile Papercraft Visuals:** Cardboard chassis, rolling track creases, layered depth shadows, and paper confetti explosion bursts.
- **Tank 1990 Pirate Hack Powerups:** Instant Tier 4 Pistol upgrade and Water-crossing Boat power-up.
- **Screen Shake & Confetti Particles:** Tactile feedback on heavy cannon shots and base explosions.
- **Endless Mode / Stage Select:** Quick navigation to any unlocked stage (1–35).

**Defer (v2+):**
- **Custom Map Editor:** Unnecessary complexity for launch; 35 curated classic stages provide complete campaign.
- **Online 2-Player Co-op:** Out of scope for standalone instant-play catalog architecture.

### Architecture Approach

The architecture isolates pure game simulation logic into testable TypeScript modules orchestrated by `Tank1990Scene`. The scene handles the game loop, coordinates updates across subsystems, and renders via `TankRenderer`.

**Major components:**
1. **GridMap:** Encapsulates 26×26 micro-tile map state, sub-tile damage bitmasks, tile querying, and steel destruction rules.
2. **TankController:** Manages player tank state, 4 upgrade tiers, orthogonal alignment snapping, and ice sliding physics.
3. **BulletManager:** Manages projectile pooling, 120Hz sub-stepping, bullet-vs-bullet cancellation, and tile/tank collisions.
4. **EnemySpawner & TankEnemyAI:** Handles stage 20-tank wave queue, 3 spawn portals, AI movement steering, and flashing bonus tank triggers.
5. **PowerUpSystem:** Manages power-up drop positions, pickup collision, active timers (freeze, shield, shovel base fortification).
6. **GameState:** Manages score, lives, current stage index, kill tallies, high scores, and game flow state machine.
7. **TankRenderer & Particles:** Multi-pass Canvas 2D papercraft rendering engine and particle confetti pool.
8. **TankAudio:** Zero-asset procedural Web Audio synthesizer with dynamics compression.
9. **TouchControls:** 4-way virtual D-pad and Fire button with multi-touch pointer tracking and gesture isolation.

### Critical Pitfalls

1. **Corner-Catching Movement Jitter (Corridor Glitch):** Tanks get stuck when turning into narrow 2-tile corridors without exact pixel alignment. *Mitigation:* Implement smooth orthogonal snap assist ($\le 4\text{px}$) when switching movement axes.
2. **Whole-Tile Destruction vs Sub-Tile Micro-Chipping:** Destroying full 16×16 blocks instead of 8×8 quadrants breaks narrow corridor tunneling. *Mitigation:* Model terrain as 26×26 micro-grid with quadrant damage bitmasks.
3. **Bullet Tunneling & Missed Bullet-vs-Bullet Collisions:** Fast bullets skipping frames or passing through each other at low frame rates. *Mitigation:* Use 120Hz sub-step ray-segment sweeping and pairwise bullet collision checks.
4. **Enemy AI Getting Trapped in Infinite Turn Loops:** Tanks vibrating against corners or clustering at spawns. *Mitigation:* Trigger direction decisions only at grid-aligned nodes with minimum direction-hold timers and anti-reversal bias.
5. **Shovel Fortification State Leaks:** Base walls respawning broken bricks when temporary steel expires. *Mitigation:* Track pre-shovel tile damage state; only revert undamaged steel back to brick.

## Implications for Roadmap

Suggested phase structure for Milestone v8.0:

### Phase 1: GridMap Engine & Sub-Tile Destruction
**Rationale:** Core game world representation must exist before entity movement, combat, or rendering can be built.  
**Delivers:** 26×26 micro-tile data structure, sub-tile brick chipping bitmasks, steel/water/grass/ice tile behaviors, Eagle HQ entity state, stage loader for 35 campaign maps, and complete unit test suite.  
**Addresses:** 26×26 Sub-Tile Grid, Quarter-Tile Brick Destruction, Defensible Eagle HQ, Terrain Modifiers.  
**Avoids:** Whole-tile destruction pitfall (Pitfall 2).

### Phase 2: Player Tank Kinematics & Upgrade Tiers
**Rationale:** Player movement, grid alignment, and tier upgrade progression are foundational for ballistics and combat.  
**Delivers:** TankController, 4 cardinal movement states, smooth corner auto-alignment snapping, ice sliding physics, 4 upgrade tier stat definitions, invulnerability shields, and player tests.  
**Addresses:** 4-Tier Player Upgrades, Grid Corner Snapping / Alignment Assist, Ice Sliding.  
**Avoids:** Corner-catching corridor glitch (Pitfall 1) and Ice tile clipping (Pitfall 9).

### Phase 3: Ballistics System & Combat Collisions
**Rationale:** Projectile simulation depends on GridMap and TankController, and is prerequisite for enemy combat and base defense.  
**Delivers:** BulletManager projectile pool, 120Hz sub-step physics sweep, bullet-vs-bullet cancellation, tile micro-chipping integration, Eagle destruction triggers, and ballistics test suite.  
**Addresses:** Bullet-vs-Bullet Cancellation, Tier 4 Armor-Piercing Cannon, Base Destruction Win/Loss Condition.  
**Avoids:** Bullet tunneling and dropped cancellation misses (Pitfall 3).

### Phase 4: Enemy AI, Wave Spawner & Power-Up System
**Rationale:** Game loop requires enemies, combat difficulty progression, and power-up drop economy.  
**Delivers:** EnemySpawner with 20-tank wave queue, 4 enemy classes (Basic, Fast, Rapid, Heavy Armor), node-based directional AI state machine, flashing bonus tanks, PowerUpSystem (Star, Shovel, Grenade, Clock, Helmet, Tank, Pistol, Boat), shovel fortification timer manager, and AI/powerup tests.  
**Addresses:** 4 Enemy Archetypes, Flashing Enemy Tanks, Core Powerup Drops, Shovel Base Fortification, AI Pathing.  
**Avoids:** AI corner trapping/vibrating (Pitfall 4) and Shovel wall regeneration state leaks (Pitfall 7).

### Phase 5: Game Flow, State Machine & Tally HUD
**Rationale:** Ties simulation modules into a complete playable campaign loop before visual/audio polish.  
**Delivers:** GameState machine (title, stage intro curtain, active play, stage complete tally, game over, victory), HUD sidebar (enemy queue icons, lives, stage number, score), high score persistence in `localStorage`, and campaign progression.  
**Addresses:** 20-Enemy Wave HUD, Stage Clear Tally Screen, Quick Stage Selector / Campaign Flow.  
**Avoids:** State desynchronization between stages.

### Phase 6: Tactile Papercraft Renderer & Particle FX
**Rationale:** Dedicated visual pipeline renders simulation state using ArcadeTub's papercraft aesthetic.  
**Delivers:** TankRenderer multi-pass Canvas 2D engine (ground -> entities -> grass canopy -> overlays), procedural cardboard cutout drawing, drop shadows, rolling track creases, confetti explosion particle bursts, muzzle sparks, and screen shake.  
**Addresses:** Tactile 2D Papercraft Visuals, Grass Canopy Camouflage, Screen Shake & Particle Debris, Retina High-DPI Scaling.  
**Avoids:** Single-layer rendering errors (Pitfall 3 in Architecture) and Canvas blurriness on Retina displays (Pitfall 8).

### Phase 7: Procedural 8-Bit Web Audio Engine
**Rationale:** Audio effects are wired to established combat and game state events with zero external asset dependencies.  
**Delivers:** `TankAudio` procedural chiptune synthesizer with master DynamicsCompressor, shared dynamic engine loop oscillator, sound effect voice pooling (max 4 concurrent SFX), user-gesture resume handlers, and audio test coverage.  
**Addresses:** Procedural 8-Bit Web Audio (shot pop, brick crunch, steel clang, explosions, powerup chirps, stage jingles).  
**Avoids:** Web Audio voice stealing, distortion, and mobile context suspension (Pitfall 5).

### Phase 8: Mobile Touch Controls & Responsive Viewport
**Rationale:** Mobile ergonomics and cross-device scaling ensure the game is fully playable on touchscreen and desktop viewports.  
**Delivers:** `TouchControls` component with 4-way virtual D-Pad (angular hysteresis, deadzone snapping), tactile Fire button, multi-touch isolation, CSS `touch-action: none`, and letterboxed 416×416 aspect ratio scaling.  
**Addresses:** Mobile Virtual Touch Controls, Responsive Viewport Scaling.  
**Avoids:** Virtual D-Pad latency, diagonal drift, and gesture interference (Pitfall 6).

### Phase 9: Hub Catalog Registration, E2E Verification & Integration
**Rationale:** Final phase embeds the standalone game into ArcadeTub launcher, builds distribution bundle, and executes end-to-end test verification.  
**Delivers:** Workspace registration in `src/data/games.ts`, SVG icon and screenshot, Vite multi-page configuration, full Vitest suite run, and Playwright automated gameplay validation.  
**Addresses:** Standalone packaging, zero runtime dependency verification, bundle budget compliance (<350KB).

### Phase Ordering Rationale

- **Bottom-Up Logic Dependency:** GridMap (Phase 1) -> Tank Kinematics (Phase 2) -> Ballistics (Phase 3) -> AI & Powerups (Phase 4) -> Game State (Phase 5). Simulation logic is completely functional and unit-tested before UI layers.
- **Separation of Presentation & Audio:** Canvas 2D Papercraft Renderer (Phase 6) and Web Audio (Phase 7) consume pure simulation events without mutating core state.
- **Platform Ergonomics Last:** Mobile touch controls (Phase 8) and Catalog integration (Phase 9) finalize platform packaging and verification.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Grid & Destruction):** Verify 4-quadrant micro-chipping bitmask algorithms against authentic Battle City ROM collision bounding boxes.
- **Phase 4 (Enemy AI & Powerups):** Fine-tune directional steering weights and Shovel fortification state caching to match authentic behavior.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Player Kinematics):** Standard grid alignment and cardinal axis snapping patterns.
- **Phase 3 (Ballistics):** Standard 120Hz sub-stepping projectile pool and AABB sweep checks.
- **Phase 5 (Game State & HUD):** Standard finite state machine and localStorage persistence.
- **Phase 6 (Papercraft Renderer):** Well-established ArcadeTub Canvas 2D papercraft rendering conventions.
- **Phase 7 (Procedural Web Audio):** Well-established `AudioSynthesizer` chiptune synthesis patterns in repo.
- **Phase 8 (Touch Controls):** Standard ArcadeTub virtual D-Pad pointer tracking.
- **Phase 9 (Hub Integration):** Standard repo entrypoint and catalog registration procedure.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero runtime dependencies, native Canvas 2D, Web Audio API, TypeScript 5.8+, Vite 7 verified against workspace conventions. |
| Features | HIGH | Exact match to Battle City / Tank 1990 ROM mechanics and ArcadeTub platform requirements. |
| Architecture | HIGH | Clear separation of pure simulation logic and I/O; 100% testable architecture verified against existing games. |
| Pitfalls | HIGH | Specific edge cases (corner snapping, sub-tile chipping, tunneling, audio clipping, shovel leaks) fully documented with test strategies. |

**Overall confidence:** HIGH

### Gaps to Address

- **Ice Sliding Acceleration Tuning:** Calibrate exact friction and slide duration so tanks feel slippery on Ice without getting stuck inside adjacent solid tiles.
- **Audio Master Gain Staging on Mobile Safari:** Validate procedural oscillator gain levels with `DynamicsCompressorNode` across low-end mobile devices during rapid explosion sequences.

## Sources

### Primary (HIGH confidence)
- Namco *Battle City* (1985 NES) / Yanshan Software *Tank 1990* Technical ROM Specifications.
- ArcadeTub Project Architecture (`.planning/PROJECT.md`) & `packages/game-engine/`, `packages/playables-adapter/`.
- HTML5 Canvas 2D Game Architecture & Fixed Timestep Physics Standards.

### Secondary (MEDIUM confidence)
- W3C Web Audio API Dynamics Compression & Voice Pool Management Guidelines.
- TouchEvent & PointerEvent Mobile Virtual Joystick Hysteresis Best Practices.

---
*Research completed: 2026-08-20*  
*Ready for roadmap: yes*
