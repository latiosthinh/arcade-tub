# Requirements: Milestone v8.0 — Tank 1990 (Battle City) Retro Papercraft Arcade

## Core Value
Deliver a faithful, highly responsive browser recreation of the classic Tank 1990 / Battle City arcade tactical shooter featuring distinctive tactile papercraft visuals, procedural 8-bit Web Audio, authentic destructible grid mechanics, 4-tier tank progression, smart enemy AI, stage campaigns, and seamless mobile touch controls with zero external dependencies.

---

## Active Requirements

### Grid Terrain & Destruction Engine
- [x] **GRID-01**: System maintains a 26×26 sub-tile microgrid (16×16px cells on 416×416 field) supporting 6 terrain types: Empty, Brick, Steel, Water, Trees/Grass, and Ice.
- [x] **GRID-02**: System supports 4-quadrant sub-tile bitmask chipping for Brick walls when hit by projectiles.
- [x] **GRID-03**: System implements impassable Water barriers that block tank movement but permit projectile flight.
- [x] **GRID-04**: System supports Trees/Grass canopy tiles rendered above entity layer for visual camouflage concealment.
- [x] **GRID-05**: System supports Ice tiles causing low-friction sliding drift when tanks navigate over them.
- [x] **GRID-06**: System manages Eagle Base HQ entity with destructible 2×2 footprint, instant Game Over on destruction, and destroyed papercraft state.
- [x] **GRID-07**: System encodes and loads 35 authentic stage map layouts into the grid engine.

### Player Tank Kinematics & Upgrades
- [x] **TANK-01**: User can steer player tank in 4 cardinal directions with orthogonal corner auto-snapping ($\le 4\text{px}$ deadzone) to smoothly navigate 1-tile corridors without snagging.
- [x] **TANK-02**: User progresses through 4 distinct tank upgrade tiers: Tier 1 (Basic slow single-shot), Tier 2 (Speed Tank), Tier 3 (Heavy Tank with 2 concurrent rapid bullets), Tier 4 (Armor-Piercing Super Tank capable of destroying Steel walls and mowing Trees).
- [x] **TANK-03**: System manages spawn invulnerability shield bubble timer on player spawn and respawn.
- [x] **TANK-04**: System manages player lives counter, extra lives gain, and death/respawn cycle.

### Ballistics & Combat Collisions
- [ ] **COMBAT-01**: System simulates projectile trajectory with 120Hz sub-stepping or continuous ray-sweep to prevent collision tunneling.
- [ ] **COMBAT-02**: System cancels intersecting opposing projectiles upon collision with micro spark particle burst.
- [ ] **COMBAT-03**: System applies tier-dependent projectile damage to terrain (regular shot chips bricks; tier-4 heavy shot penetrates steel and clears trees).
- [ ] **COMBAT-04**: System detects bullet hits on enemy tanks, dealing damage and accounting for armor hit points.

### Enemy AI, Spawner & Powerups
- [x] **ENEMY-01**: System manages a 20-tank wave queue with up to 4 concurrent enemy tanks spawning at 3 top spawn portals.
- [x] **ENEMY-02**: System implements 4 distinct enemy archetypes: Basic Tank (slow, low points), Fast Cruiser (high speed), Power Tank (rapid-fire), and Heavy Armor Tank (requires 4 hits to destroy, color changes per hit).
- [x] **ENEMY-03**: System executes grid-node steering AI with goal-oriented pathing bias (targeting player or Eagle HQ) and anti-oscillation direction locking.
- [x] **ENEMY-04**: System spawns flashing bonus tanks (4th, 11th, 18th spawns) that drop a random tactical powerup upon taking damage.
- [x] **ENEMY-05**: User can collect 8 tactical powerup items: Star (upgrade tier), Shovel (fortifies base perimeter with steel for 20s), Grenade (instantly destroys all active enemies on screen), Clock (freezes all enemies for 10s), Helmet (temporary invulnerability shield for 10s), Tank (grants +1 extra life), Gun (instantly promotes to Tier 4), and Boat (enables crossing water terrain).
- [x] **ENEMY-06**: System manages shovel fortification timeout restoration, caching underlying terrain state without leaving empty voids.

### Stage Progression, Game Flow & HUD
- [ ] **LOOP-01**: System displays title screen with Game Start, Stage Select, and high score display.
- [ ] **LOOP-02**: System renders stage intro curtain transition ("STAGE X") before each round.
- [ ] **LOOP-03**: System renders active HUD side panel showing remaining enemy reserve tank icons, player lives, current stage number, and current score.
- [ ] **LOOP-04**: System presents end-stage kill tally screen breaking down points earned per enemy tank class destroyed.
- [ ] **LOOP-05**: System manages victory sequence (advancing to next stage) and defeat sequence (Game Over banner and restart prompt).
- [ ] **LOOP-06**: System persists personal best high scores in `localStorage`.

### Tactile Papercraft Visuals & Procedural Web Audio
- [ ] **VISUAL-01**: System renders layered cardboard cutouts with drop shadows, rolling tread trails, and turret recoil animations.
- [ ] **VISUAL-02**: System generates paper confetti burst particles for explosions, brick debris crumbs, and bullet sparks.
- [ ] **VISUAL-03**: System executes multi-pass canvas composition: Ground Layer -> Entities & Powerups -> Grass Canopy Overlay -> Particle FX -> HUD Overlay.
- [ ] **VISUAL-04**: System synthesizes procedural 8-bit Web Audio with zero external audio assets: chiptune engine pitch-shifted hums, sharp shot pops, crunchy wall crumble, metallic steel clangs, explosion booms, item pickup fanfares, and base destruction alarm.
- [ ] **VISUAL-05**: Audio subsystem routes all sounds through a master `DynamicsCompressorNode` to prevent clipping and distortion during high-volume particle explosions.

### Mobile Virtual Controls & Responsive Viewport
- [ ] **MOBILE-01**: System provides responsive touch controls with 4-way cardinal virtual D-Pad (with angular hysteresis deadzone) and dedicated Fire button.
- [ ] **MOBILE-02**: System scales the 416×416 game arena with pixel-crisp aspect ratio preservation inside mobile and desktop viewports.
- [ ] **MOBILE-03**: Touch input handles multi-touch simultaneously (holding D-Pad direction while tapping Fire) without gesture stutter or screen scrolling.

### Catalog Registration, Test Suite & Integration
- [ ] **INTEG-01**: Game is packaged in standalone directory `games/tank-1990/` with zero runtime dependencies.
- [ ] **INTEG-02**: Game is registered in `src/data/games.ts` with metadata, tags (`action`, `retro`, `arcade`), and custom SVG screenshot.
- [ ] **INTEG-03**: Game is wired into `vite.config.ts` multi-page input build configuration.
- [ ] **INTEG-04**: System provides comprehensive Vitest unit tests covering grid micro-chipping, kinematics corner-snapping, projectile sweeps, enemy AI node routing, and powerup mechanics with 100% test pass rate.

---

## Future Requirements (Deferred)
- **MAP-01**: In-game custom stage construction level editor with export/import capability.
- **COOP-01**: Local 2-player split-controls co-op base defense mode.

---

## Out of Scope
- **Online Multiplayer**: Real-time networked multiplayer over WebSockets is out of scope for the static client architecture.
- **External Sprite Assets**: All tanks, terrain, and icons are rendered procedurally via Canvas 2D / SVG paths to maintain zero-asset design constraint.

---

## Traceability Matrix

| Requirement | Phase | Status |
|---|---|---|
| **GRID-01** | Phase 48 | Complete |
| **GRID-02** | Phase 48 | Complete |
| **GRID-03** | Phase 48 | Complete |
| **GRID-04** | Phase 48 | Complete |
| **GRID-05** | Phase 48 | Complete |
| **GRID-06** | Phase 48 | Complete |
| **GRID-07** | Phase 48 | Complete |
| **TANK-01** | Phase 49 | Pending |
| **TANK-02** | Phase 49 | Pending |
| **TANK-03** | Phase 49 | Pending |
| **TANK-04** | Phase 49 | Pending |
| **COMBAT-01** | Phase 50 | Pending |
| **COMBAT-02** | Phase 50 | Pending |
| **COMBAT-03** | Phase 50 | Pending |
| **COMBAT-04** | Phase 50 | Pending |
| **ENEMY-01** | Phase 51 | Complete |
| **ENEMY-02** | Phase 51 | Complete |
| **ENEMY-03** | Phase 51 | Complete |
| **ENEMY-04** | Phase 51 | Complete |
| **ENEMY-05** | Phase 51 | Complete |
| **ENEMY-06** | Phase 51 | Complete |
| **LOOP-01** | Phase 52 | Pending |
| **LOOP-02** | Phase 52 | Pending |
| **LOOP-03** | Phase 52 | Pending |
| **LOOP-04** | Phase 52 | Pending |
| **LOOP-05** | Phase 52 | Pending |
| **LOOP-06** | Phase 52 | Pending |
| **VISUAL-01** | Phase 53 | Pending |
| **VISUAL-02** | Phase 53 | Pending |
| **VISUAL-03** | Phase 53 | Pending |
| **VISUAL-04** | Phase 53 | Pending |
| **VISUAL-05** | Phase 53 | Pending |
| **MOBILE-01** | Phase 54 | Pending |
| **MOBILE-02** | Phase 54 | Pending |
| **MOBILE-03** | Phase 54 | Pending |
| **INTEG-01** | Phase 55 | Pending |
| **INTEG-02** | Phase 55 | Pending |
| **INTEG-03** | Phase 55 | Pending |
| **INTEG-04** | Phase 55 | Pending |
