---
id: SEED-005
status: dormant
planted: 2026-08-20
planted_during: Milestone v7.0 (Post Phase 47)
trigger_when: Planning Milestone v8.0 or Retro 8-Bit / Classic Arcade recreation milestone
scope: Large
---

# SEED-005: Tank 1990 (Battle City) Retro Papercraft Arcade

## Why This Matters

- **Nostalgic Appeal:** Tank 1990 (Battle City) is an iconic arcade classic with instantly recognizable gameplay mechanics (eagle base defense, destructible brick/steel walls, distinct enemy tank classes, power-up drops).
- **Papercraft Aesthetic Fit:** Retro 8-bit grid-based destruction maps perfectly to layered cardboard cutouts, crumpled paper rubble, origami tanks, and tactile explosion confetti.
- **Deep Gameplay Loop:** Introduces strategic positioning, multi-tier tank upgrades (speed, rapid-fire, armor-piercing steel blast), base fortification (shovel iron walls), co-op/solo defense, and stage-based progression.
- **Engine Synergy:** Leverages existing grid collision logic, spatial partitioning, procedural audio synthesizers (8-bit chiptune paper booms, motor hums), and mobile touch D-Pad/virtual joystick controls.

## When to Surface

**Trigger:** Planning Milestone v8.0 or Retro 8-Bit / Classic Arcade recreation milestone

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:
- Planning Milestone v8.0 or a dedicated Retro Arcade Classics milestone.
- Adding classic 2D tactical combat or base-defense action games to ArcadeTub.
- Expanding the `🎮 Action / Arcade` catalog (`#/category/action` or `#/category/arcade`).
- Implementing local 2-player or co-op gameplay modes.

## Scope Estimate

**Large** — Comprehensive retro arcade game with full game loop, multiple levels, and editor capabilities:
- **Core Systems & Physics:**
  - Tile grid system (13x13 or 26x26 sub-tiles): Bricks (destructible), Steel (requires max tier blast), Water (tanks blocked, bullets pass), Trees/Grass (camo concealment), Ice (inertia slide).
  - Eagle Base HQ defense with destructible perimeter and instant defeat state.
- **Entity AI & Combat:**
  - Player Tank: 4 upgrade tiers (Standard, Speed Tank, Heavy Cannon, Armor-Piercing Triple-Star).
  - Enemy AI: 4 distinct enemy types (Basic, Fast Cruiser, Power Tank with bonus drops, Heavy Armor Tank).
  - Power-up Drop System: Grenade (clear screen), Clock (freeze enemies), Shovel (reinforce HQ), Star (upgrade tier), Helmet (invulnerability shield), Tank (extra life), Gun/Boat (terrain traversing).
- **Visuals & Audio:**
  - Layered cardboard origami tank sprites with animated rolling treads and muzzle flash.
  - Paper confetti particle explosions and crumbling brick debris.
  - Procedural Web Audio: chiptune engine hum, radar spawn chime, missile whistle, cardboard wall shatter, base alarm.
- **Stage Progression & Editor:**
  - Stage generator with 20+ authentic stage layouts.
  - (Optional bonus) Custom Map Construction stage editor.

## Breadcrumbs

Related code and decisions found in the current codebase:
- `src/data/games.ts` (Catalog game definitions and category routing)
- `packages/game-engine/src/GameLoop.ts` (Fixed timestep rendering and update ticks)
- `packages/game-engine/src/InputManager.ts` (Keyboard, mouse, and mobile touch D-Pad binding)
- `packages/game-engine/src/AudioSynthesizer.ts` (Procedural Web Audio chiptune & sound FX)
- `packages/game-engine/src/SceneManager.ts` (Scene lifecycle and state management)
- `src/hub.ts` & `src/views/GameView.ts` (Game shell embedding and canvas viewports)
- `games/brick-blitz/` (Grid-based brick destruction mechanics reference)
- `games/virus-defense/` (Wave-based enemy spawner & defensive combat reference)

## Notes

- Keep the game modular under `games/tank-1990/` with standalone canvas rendering adhering to the zero-dependency web canvas pattern.
- Touch controls need a smooth virtual 4-way D-Pad and responsive Shoot button on mobile viewport.
- Multi-tier tank sprite rendering can use SVG path drawing or 2D canvas procedural drawing with paper cutout drop shadows (`box-shadow` / `filter: drop-shadow`).

## Status
Planted: 2026-08-20
Active: Dormant (Ready for Milestone v8.0 / Retro Arcade milestone planning)
