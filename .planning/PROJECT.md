# Project: Arcade Carnival

## Purpose
Collection of browser-based arcade minigames packaged for web embedding and instant play. Each game lives in its own folder, shares a common Playables/web adapter layer, and launches from a central hub launcher. Original names, procedural audio, custom UI, and 2D Papercraft visual theme.

## Current Milestone: v6.0 — CrazyGames Minigame Replication (12 Minigames)

**Goal:** Expand Arcade Carnival by replicating the top 12 minigame mechanics from CrazyGames (https://www.crazygames.com/t/mini) into our tactile 2D Papercraft theme with zero external assets, procedural Web Audio, mobile/keyboard support, and high score tracking.

**12 Target Minigames:**
1. `paper-basket` (Tap-Tap Shots) — Tap-to-bounce trajectory physics basketball into moving cardboard hoops.
2. `drift-boss` (Drift Boss) — 1-button hold/release timing drift on isometric zigzag cardboard tracks.
3. `helix-jump` (Helix Jump) — Rotate cylindrical paper tower to bounce paint drop through cardboard gaps.
4. `square-bird` (Square Bird) — Tap to drop paper egg blocks and clear terrain obstacles.
5. `layers-roll` (Layers Roll) — Roll ribbon gathering construction paper layers and shaving through gates.
6. `mini-battles` (12 MiniBattles) — Fast 1-button party duels against AI / Local P2.
7. `dino-runner` (Chrome Dino) — Endless runner ducking & jumping origami pterodactyls and cactus hazards.
8. `snow-rider` (Snow Rider) — Pseudo-3D sled slalom weaving through paper pine trees and gift boxes.
9. `potion-merge` (Potion Merge) — Drop & merge physics flasks to create grand origami alchemy recipes.
10. `mahjong-paper` (Mahjong Solitaire) — Match free craft tile pairs with paper symbol patterns.
11. `subway-runner` (Bus/Subway Runner) — 3-lane paper commuter runner jumping trains and sliding under barricades.
12. `prism-laser` (PRISM) — Rotate paper mirrors to refract color laser beams into crystal targets.

## Previous Milestones
- v1.0–v3.0: Foundation, 12 games, UI/UX refactor
- v4.0: 15 games total (snake, bug climb, car race, type strike arrows), catalog expansion
- v5.0: 2D Papercraft visual overhaul across all 15 game renderers and hub site

## Tech Stack
- **Build:** Vite 7 + TypeScript + pnpm workspaces
- **Rendering:** Canvas 2D API (no engine dependency)
- **Audio:** Procedural Web Audio synthesis (zero external audio files)
- **Styling:** Custom CSS design system (tokens, scoped CSS, papercraft theme)
- **Testing:** Vitest for game logic unit tests
- **Deploy:** Cloudflare Pages

## Constraints
- Zero runtime dependencies — fully static vanilla TS + CSS
- Each game folder is self-contained under `games/<game-id>/`
- Shared code in `packages/playables-adapter/` and `packages/game-engine/`
- Bundle size budget: < 250KB gzipped total
- Runs 60fps on mid-range mobile & desktop
- 100% test pass rate
