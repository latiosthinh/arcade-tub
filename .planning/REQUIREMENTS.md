# Requirements: Milestone v6.0 — CrazyGames Minigame Replication

## 1. Scope Overview
Replicate and adapt the top 12 popular minigames from CrazyGames (`https://www.crazygames.com/t/mini`) into Arcade Carnival's 2D Papercraft aesthetic with procedural Web Audio, zero external assets, touch/keyboard controls, unit tests, and hub catalog registration.

## 2. Minigame Requirements

### Wave 1: Core Reflex & Physics (Phases 31–33)
- **REQ-601 [Paper Basket]**: Tap-to-flap ball physics, trajectory arcing, moving cardboard hoops, net rim bounce, swish clean score multipliers.
- **REQ-602 [Drift Boss]**: One-button press-and-hold right turn / release left turn, isometric zigzag track generation, coin pickups, edge fall detection.
- **REQ-603 [Helix Jump]**: Drag/arrow left-right tower rotation, bouncing ink droplet, segmented cardboard floor cutouts, paint splatter death hazards.
- **REQ-604 [Square Bird]**: Auto-runner, tap to spawn stacked paper square blocks under bird, clear cliffs and fences, fever mode landing bonus.

### Wave 2: Hyper-Casual & Party (Phases 34–36)
- **REQ-605 [Layers Roll]**: Forward roll peeling paper layers, expanding roll diameter, color gates, shaving hurdles, end-of-run length scoring.
- **REQ-606 [12 MiniBattles]**: 1-button party minigame engine with 12 rapid minigames (Quick Draw, Balloon Pop, Soccer, Tug of War, Lava Jump, etc.) against CPU or P2.
- **REQ-607 [Dino Runner]**: Endless paper desert runner, jump (Up/Space), duck/crouch (Down), origami cactus barriers and flying pterodactyls, day/night paper shifts.
- **REQ-608 [Snow Rider]**: Pseudo-3D downhill sledding runner, left/right steering, cardboard pine trees, snow ramps, snowman obstacles, gift box pickups.

### Wave 3: Puzzle & Strategy (Phases 37–39)
- **REQ-609 [Potion Merge]**: Drop flask physics into cauldron grid (Suika/Watermelon merge style), merge matching potion tiers into supreme elixir.
- **REQ-610 [Mahjong Paper]**: Classic 3D layer tile matching puzzle, free-edge detection, papercraft kanji/symbol glyphs, shuffle and hint helpers.
- **REQ-611 [Subway Runner]**: 3-lane vertical runner with swipe/arrow lane shifts, jump over cardboard barricades, roll under signs, collect paper ticket tokens.
- **REQ-612 [Prism Laser]**: Grid-based laser reflection optics, rotate 45° paper mirrors and beam splitters to illuminate crystal targets.

### Wave 4: Hub & Integration (Phase 40)
- **REQ-613 [Catalog Integration]**: Register all 12 games in `src/data/games.ts` (expanding to 27 games total).
- **REQ-614 [SVG Card Previews]**: Create 12 authentic 2D Papercraft SVG screenshot illustrations in `src/data/screenshots.ts`.
- **REQ-615 [Genre Filters & Shells]**: Update genre tags and verify responsive standalone HTML shells for all 12 new games.
- **REQ-616 [Test Coverage & Build]**: Maintain 100% test pass rate across all new game logic and pass bundle size audit (< 250KB gzipped).

### Wave 5: Game Mechanic Polish (Phase 41)
- **REQ-617 [Square Bird Timed Blocks]**: Egg blocks have limited lifetime (3.0s), showing visual cracking wear, then expire and trigger crumble particles + gravity fall.
- **REQ-618 [Square Bird Infinity Mode]**: Endless procedural obstacle streaming, game mode toggle (Levels vs Infinite), and persistent high score tracking.
