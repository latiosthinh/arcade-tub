# ROADMAP.md — Milestone v6.0: CrazyGames Minigame Replication (12 Games)

## Overview
Expand catalog from 15 to 27 games by replicating the top 12 minigames from CrazyGames in 2D Papercraft aesthetic.

---

### Phase 31: Paper Basket (`games/paper-basket/`) [COMPLETED]
- Tap-to-flap trajectory ball physics, moving cardboard hoop rims, swish score multiplier, countdown shot clock.
- Unit tests for bounce math, hoop scoring, and game state.

### Phase 32: Cardboard Drift (`games/drift-boss/`) [COMPLETED]
- One-button hold/release drift steering on isometric zigzag cardboard road, coin collection, edge falling.
- Unit tests for drift timing, turn physics, and track procedural generation.

### Phase 33: Helix Jump (`games/helix-jump/`) [COMPLETED]
- Rotational cylinder paper tower, bouncing paint droplet, gap drop combos, red cardboard hazard plates.
- Unit tests for rotation math, gap traversal, and impact physics.

### Phase 34: Square Bird (`games/square-bird/`) [COMPLETED]
- Auto-runner with instant block stacking underneath paper bird, cliff clearance, perfect landing fever mode.
- Unit tests for stack height, obstacle collisions, and fever speed multipliers.

### Phase 35: Layers Roll (`games/layers-roll/`) [COMPLETED]
- Rolling paper roll accumulating colored construction paper layers, obstacle trimmer teeth, finish ribbon line.
- Unit tests for radius scaling, trimming mechanics, and final score multiplier.

### Phase 36: 12 MiniBattles (`games/mini-battles/`) [COMPLETED]
- 1-Button 2-player/CPU party engine with 12 quick arcade duel modes (Duel, Tug, Soccer, Lava, Balloon, etc.).
- Unit tests for mini-battle mode rotations, input triggers, and round scoring.

### Phase 37: Dino Runner & Snow Rider (`games/dino-runner/`, `games/snow-rider/`) [COMPLETED]
- `dino-runner`: Endless desert runner, duck/jump controls, cactus & pterodactyl spawners.
- `snow-rider`: Pseudo-3D downhill sledding, slalom obstacle weaving, gift pickups.
- Unit tests for speed scaling, obstacles, and pseudo-3D projection.

### Phase 38: Potion Merge & Mahjong Paper (`games/potion-merge/`, `games/mahjong-paper/`) [COMPLETED]
- `potion-merge`: 2D physics flask drop & merge tiers into grand elixir.
- `mahjong-paper`: Layered tile matching puzzle, free-edge logic, hint & shuffle.
- Unit tests for merge collision, board generation, and match verification.

### Phase 39: Subway Runner & Prism Laser (`games/subway-runner/`, `games/prism-laser/`) [COMPLETED]
- `subway-runner`: 3-lane vertical runner with jump/slide mechanics and paper train obstacles.
- `prism-laser`: Optics puzzle rotating paper mirrors to reflect and split laser beams.
- Unit tests for lane kinematics and beam tracing.

### Phase 40: Hub Catalog Integration & Final Milestone Audit [COMPLETED]
- Register all 12 games in `src/data/games.ts` (total 27 games).
- Add 12 authentic 2D Papercraft SVG screenshots to `src/data/screenshots.ts`.
- Verify HTML shells, responsive scaling, and run bundle audit.
- Full test suite run (100% pass target, 806/806 tests passing).

### Phase 41: Square Bird Timed Blocks & Infinity Mode (`games/square-bird/`) [COMPLETED]
- Block expiration mechanics: egg blocks decay after a set duration (3s) and dissolve with crumble particle effects and audio.
- Infinite survival mode: dynamic procedural obstacle streaming ahead of player and separate infinite high score tracking.
- Interactive mode selection overlay on ready screen (Levels vs Infinite Mode).
- **Plans:** 2 plans
- [x] 41-01-PLAN.md — Timed block decay physics, obstacle streaming generator, infinite mode state & unit tests
- [x] 41-02-PLAN.md — Block cracking animations, expiration particles/audio, ready overlay mode selector & HUD

### Phase 42: No-Brain Arcade Minigames Pack (`games/`)
- Build 6 casual, satisfying papercraft minigames:
  1. `rainbow-draw`: Freeform rainbow line drawer, auto-smoothing curves, and scratch-off reveal mode.
  2. `firework-pop`: Blank space tap-anywhere fireworks launcher with procedural particle bursts and sound.
  3. `fruit-flood`: Ninja fruit infinite flood slicer with multi-blade physics and juice splatters.
  4. `snow-smash`: Snowball catapult demolishing layered cardboard structures and targets.
  5. `mosquito-swat`: Fast reflex net swiper catching buzzing mosquito swarms with combo streaks.
  6. `tic-tac-toe`: Papercraft 3x3 tic-tac-toe vs Xiaomi Mimo SG API / Minimax AI & local 2P.
- Central catalog registration, SVG screenshot illustrations, and full test suite passing.
- **Plans:** 3 plans
- [ ] 42-01-PLAN.md — Build Rainbow Draw & Firework Pop minigames with unit tests
- [ ] 42-02-PLAN.md — Build Fruit Flood & Snow Smash minigames with unit tests
- [ ] 42-03-PLAN.md — Build Mosquito Swat & Tic-Tac-Toe (Xiaomi Mimo SG API) minigames, catalog integration & SVG screenshots


---

## Completed Milestones
- [Milestone v5.0: 2D Papercraft Visual Overhaul](milestones/v5.0-ROADMAP.md) (Archived)
- [Milestone v4.0: Catalog Expansion](milestones/v4.0-ROADMAP.md) (Archived)
- [Milestone v3.0: 7 New Games](milestones/v3.0-ROADMAP.md) (Archived)
- [Milestone v2.0: Cyber-Arcade UI/UX Refactor](milestones/v2.0-ROADMAP.md) (Archived)
- [Milestone v1.0: Foundation & 5 Games](milestones/v1.0-ROADMAP.md) (Archived)
