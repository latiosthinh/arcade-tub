# ROADMAP.md — Milestone v6.0: CrazyGames Minigame Replication (12 Games)

## Overview
Expand catalog from 15 to 27 games by replicating the top 12 minigames from CrazyGames in 2D Papercraft aesthetic.

---

### Phase 31: Paper Basket (`games/paper-basket/`)
- Tap-to-flap trajectory ball physics, moving cardboard hoop rims, swish score multiplier, countdown shot clock.
- Unit tests for bounce math, hoop scoring, and game state.

### Phase 32: Cardboard Drift (`games/drift-boss/`)
- One-button hold/release drift steering on isometric zigzag cardboard road, coin collection, edge falling.
- Unit tests for drift timing, turn physics, and track procedural generation.

### Phase 33: Helix Jump (`games/helix-jump/`)
- Rotational cylinder paper tower, bouncing paint droplet, gap drop combos, red cardboard hazard plates.
- Unit tests for rotation math, gap traversal, and impact physics.

### Phase 34: Square Bird (`games/square-bird/`)
- Auto-runner with instant block stacking underneath paper bird, cliff clearance, perfect landing fever mode.
- Unit tests for stack height, obstacle collisions, and fever speed multipliers.

### Phase 35: Layers Roll (`games/layers-roll/`)
- Rolling paper roll accumulating colored construction paper layers, obstacle trimmer teeth, finish ribbon line.
- Unit tests for radius scaling, trimming mechanics, and final score multiplier.

### Phase 36: 12 MiniBattles (`games/mini-battles/`)
- 1-Button 2-player/CPU party engine with 12 quick arcade duel modes (Duel, Tug, Soccer, Lava, Balloon, etc.).
- Unit tests for mini-battle mode rotations, input triggers, and round scoring.

### Phase 37: Dino Runner & Snow Rider (`games/dino-runner/`, `games/snow-rider/`)
- `dino-runner`: Endless desert runner, duck/jump controls, cactus & pterodactyl spawners.
- `snow-rider`: Pseudo-3D downhill sledding, slalom obstacle weaving, gift pickups.
- Unit tests for speed scaling, obstacles, and pseudo-3D projection.

### Phase 38: Potion Merge & Mahjong Paper (`games/potion-merge/`, `games/mahjong-paper/`)
- `potion-merge`: 2D physics flask drop & merge tiers into grand elixir.
- `mahjong-paper`: Layered tile matching puzzle, free-edge logic, hint & shuffle.
- Unit tests for merge collision, board generation, and match verification.

### Phase 39: Subway Runner & Prism Laser (`games/subway-runner/`, `games/prism-laser/`)
- `subway-runner`: 3-lane vertical runner with jump/slide mechanics and paper train obstacles.
- `prism-laser`: Optics puzzle rotating paper mirrors to reflect and split laser beams.
- Unit tests for lane kinematics and beam tracing.

### Phase 40: Hub Catalog Integration & Final Milestone Audit
- Register all 12 games in `src/data/games.ts` (total 27 games).
- Add 12 authentic 2D Papercraft SVG screenshots to `src/data/screenshots.ts`.
- Verify HTML shells, responsive scaling, and run bundle audit.
- Full test suite run (100% pass target).

---

## Completed Milestones
- [Milestone v5.0: 2D Papercraft Visual Overhaul](milestones/v5.0-ROADMAP.md) (Archived)
- [Milestone v4.0: Catalog Expansion](milestones/v4.0-ROADMAP.md) (Archived)
- [Milestone v3.0: 7 New Games](milestones/v3.0-ROADMAP.md) (Archived)
- [Milestone v2.0: Cyber-Arcade UI/UX Refactor](milestones/v2.0-ROADMAP.md) (Archived)
- [Milestone v1.0: Foundation & 5 Games](milestones/v1.0-ROADMAP.md) (Archived)
