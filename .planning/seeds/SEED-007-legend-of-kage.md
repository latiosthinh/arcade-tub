---
id: SEED-007
status: dormant
planted: 2026-08-21
planted_during: Milestone v9.0 (Post Phase 63, Kirby's Adventure complete)
trigger_when: Planning next retro milestone or adding ninja/samurai action games to ArcadeTub
scope: Large
---

# SEED-007: The Legend of Kage — Papercraft Ninja Action

## Why This Matters

- **Iconic Retro Arcade Classic:** The Legend of Kage (1985 Taito) is a beloved vertical-scrolling ninja action game with instantly recognizable super-jump tree combat, shuriken throwing, and sword melee. It expands the Retro Classics category alongside Tank 1990 and Kirby's Adventure.
- **Unique Vertical Gameplay:** Unlike any existing ArcadeTub game, Kage's core mechanic is massive vertical leaps through multi-story tree canopies with full mid-air combat — a completely fresh platformer feel.
- **Papercraft Aesthetic Fit:** Feudal Japan's bamboo forests, castle walls, and origami ninjas translate perfectly to the ArcadeTub cardboard style — folded paper shuriken stars, corrugated castle walls, layered cardboard tree canopies, and tissue-paper cherry blossom confetti.
- **Seasonal Cycle Differentiator:** Each game loop cycles through Spring (cherry blossoms) → Summer (deep green) → Autumn (falling orange leaves) → Winter (paper snow), creating visually striking variety through simple palette swaps of the papercraft materials.

## When to Surface

**Trigger:** Planning next retro milestone or adding ninja/samurai action games to ArcadeTub

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:
- Planning a new Retro Classics milestone after Kirby's Adventure
- Adding fast-paced melee combat or ninja-themed action games
- Expanding the `retro` category with classic arcade recreations
- Building vertical-scrolling platformer mechanics or super-jump physics

## Scope Estimate

**Large** — Full retro arcade game with 4-stage loop, seasonal visual cycle, and boss encounters:

### Research Phase
- Study Legend of Kage arcade mechanics: super-jump height, air control, shuriken trajectories, sword deflection physics
- Catalog enemy spawn wave patterns per stage (forest, moat, castle, boss)
- Analyze seasonal palette cycle and parallax layer structure
- Map controls to mobile touch (virtual D-pad + Shuriken + Sword buttons)
- Define papercraft visual language: origami ninja sprites, cardboard bamboo forests, paper scroll castle interiors

### Core Systems
- **Super Jump Physics:** Massive vertical leap (~3 screen heights), full horizontal air control, gravity arc, tree collision landing
- **Dual Weapon Combat:**
  - Shuriken: rapid-fire paper star projectiles in 4/8 directions, works while airborne
  - Sword: short-range melee slash hitbox, deflects incoming enemy shuriken
- **Tree & Canopy System:** Tall procedural bamboo trees, branch platforms, canopy collision zones for landing mid-air
- **Enemy Wave Spawner:** Continuous ninja waves spawning from screen edges, falling from above, rushing from sides — arcade pressure loop
- **4 Enemy Types:** Red ninja (basic), Blue ninja (faster), Monk (ground projectiles), White ninja (elite)
- **2 Boss Encounters:** Fire-breathing Monk (ranged fire projectiles), Crystal Ball Wizard (teleport + magic orbs)

### Stage Structure
- **Stage 1 — Bamboo Forest:** Vertical scrolling, tree-to-tree combat, parallax cardboard forest layers
- **Stage 2 — Castle Moat / Wall:** Horizontal climbing, water hazard below, stone cardboard walls
- **Stage 3 — Castle Interior:** Horizontal corridor, tighter combat spaces, paper scroll unrolling backdrop
- **Stage 4 — Boss Chamber:** Boss fight arena, rescue princess, victory fanfare

### Seasonal Visual Cycle
- **Spring:** Pink cherry blossom confetti particles, light green paper leaves
- **Summer:** Deep green cardboard canopy, bright warm palette
- **Autumn:** Orange/red falling paper leaf particles, warm amber tones
- **Winter:** White paper snow particles, bare cardboard branch silhouettes

### Visuals & Audio
- Origami ninja player with folded paper limb animation
- Colored origami enemy ninjas (red/blue/white paper)
- Classic folded paper shuriken star projectiles
- Corrugated cardboard castle walls with stamped stone texture
- Layered parallax cardboard mountain/forest backgrounds
- Procedural Web Audio: sword clash clangs, shuriken whoosh, jump wind, boss fire crackle, seasonal wind ambience

### Integration
- Standalone `games/legend-of-kage/` with Canvas 2D, zero dependencies
- Hub catalog registration under `retro` category
- Mobile virtual controls (D-pad + Shuriken + Sword buttons)
- Vitest unit test suite

## Breadcrumbs

Related code and decisions found in the current codebase:

- `packages/game-engine/src/GameLoop.ts` — Fixed timestep loop, reusable for arcade update/render
- `packages/game-engine/src/InputManager.ts` — Keyboard + touch input binding
- `packages/game-engine/src/AudioSynthesizer.ts` — Procedural Web Audio base for ninja SFX
- `games/kirby-adventure/src/KirbyPhysics.ts` — Platformer gravity, jump physics, tile collision (adapt for super-jump)
- `games/kirby-adventure/src/Camera.ts` — Scrolling camera with deadzone (adapt for vertical scrolling)
- `games/kirby-adventure/src/Projectile.ts` — Projectile manager pattern (adapt for multi-directional shuriken)
- `games/kirby-adventure/src/enemies/EnemyBase.ts` — Enemy state machine AI base class
- `games/kirby-adventure/src/enemies/EnemyManager.ts` — Wave-based enemy spawning and collision
- `games/kirby-adventure/src/ParticleEmitter.ts` — Confetti particle system (adapt for seasonal leaf/snow/blossom particles)
- `games/kirby-adventure/src/KirbyRenderer.ts` — Parallax background and papercraft rendering patterns
- `games/tank-1990/src/TankRenderer.ts` — Multi-pass Canvas 2D cardboard rendering reference
- `games/tank-1990/src/TouchControls.ts` — Mobile virtual D-pad + button layout reference
- `src/data/games.ts` — Game catalog registry (add 45th game under `retro` category)
- `vite.config.ts` — Multi-page build config (add new game entry)

## Notes

- Single-hit death (no HP bar) makes the game intense and arcade-authentic — simpler health system than Kirby
- Super-jump physics is the core differentiator — must feel weightless and responsive, not sluggish
- Tree collision system needs careful design: landing on branches mid-jump, sliding down trunks
- Seasonal palette swap is low-effort, high-impact visual variety (just swap confetti colors + leaf tints per loop)
- Enemy wave pressure should feel relentless — constant spawning from all directions
- Sword deflection of incoming shuriken is a critical "feel good" mechanic — needs satisfying audio + particle burst
- Could reuse Kirby's `EnemyBase` pattern but with simpler AI (charge at player, throw shuriken, die in one hit)

## Status
Planted: 2026-08-21
Active: Dormant (Ready for next Retro Classics milestone planning)
