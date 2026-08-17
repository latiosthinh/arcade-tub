# Project: Arcade Carnival

## Purpose
Collection of browser-based arcade minigames packaged for web embedding and instant play. Each game lives in its own folder, shares a common Playables/web adapter layer, and launches from a modern cyber-arcade hub launcher. Original names, procedural audio, and custom UI.

## Current Milestone: v3.0 Game Catalog Expansion

**Goal:** Expand Arcade Carnival catalog from 5 to 12 complete HTML5 Canvas arcade minigames, each with standalone architecture, unit tests, procedural Web Audio, persistent high scores, and cyber-arcade visual presentation.

**Target Games:**
1. `games/memory-cards/` - Cyber memory match cards (pairs, streak combos, timer)
2. `games/memory-boxes/` - Simon-says / memory pattern sequence reproduction
3. `games/pop-balloon/` - Rapid-fire clicker/shooter balloon popping with hazards & combos
4. `games/space-racer/` - High-speed space obstacle dodge, turbo boost gates, time trial
5. `games/virus-defense/` - Cellular/cyber virus defense shooter (turret aim, antibodies, power-ups)
6. `games/flappy-fish/` - Underwater obstacle avoider physics game with hydrodynamic bounce
7. `games/game-2048/` - Neon grid sliding tile puzzle (swipe/arrow controls, merging math, animations)

## All Games (12 Total)
| Folder | Game | Genre | Mechanic Summary |
|--------|------|-------|------------------|
| `safe-cracker/` | Safe Cracker | Clicker/timing | Rotating indicator on a dial; tap when it hits the target zone. Yellow zones score, blue zones add time. Speed increases. |
| `brick-blitz/` | Brick Blitz | Breakout | Paddle at bottom, ball bounces off bricks. 3 lives, +1UP blocks, bonus blocks. Levels with brick layouts. |
| `sky-hopper/` | Sky Hopper | Vertical platformer | Auto-bounce off platforms going up. Avoid obstacles, collect power-ups (rocket, spring). Horizontal screen wrap. |
| `crate-catch/` | Crate Catch | Catcher/stacker | Two-lane platform catches falling crates. Color-matched to tracks. Multiplier stack banking. |
| `type-strike/` | Type Strike | Typing defense | Enemies approach; type the word on them to destroy with lasers. Streak multiplier. 60s rounds. |
| `memory-cards/` | Memory Cards | Card Match | Flip cards to find matching cyber glyph pairs, combo multiplier chain, round countdown. |
| `memory-boxes/` | Memory Boxes | Sequence Memory | Flashing grid of neon boxes; repeat sequence of increasing length under timer. |
| `pop-balloon/` | Pop Balloon | Clicker Action | Ascending neon energy balloons; pop to score, avoid hazard spike bombs, chain color combos. |
| `space-racer/` | Space Racer | Speed Runner | High-speed space highway, steer ship through asteroid gates and hit turbo boost pads. |
| `virus-defense/` | Virus Defense | Radial Defense | Aim defense cannon 360° to eliminate mutating pathogen clusters before they breach the cell nucleus. |
| `flappy-fish/` | Flappy Fish | Hydrodynamic Flapper | Tap/Space to flap underwater, navigate through neon coral reefs, collect pearl bubbles. |
| `game-2048/` | 2048 Neon | Tile Puzzle | Slide numbers on 4x4 neon grid; combine matching tiles to reach 2048 and beyond. |

## Tech Stack
- **Build:** Vite 7 + TypeScript + pnpm workspaces
- **Rendering:** Canvas 2D API (no engine dependency)
- **Audio:** Procedural Web Audio synthesis (zero audio files)
- **Styling:** Custom CSS design system (tokens, scoped CSS, retro-modern arcade aesthetic)
- **Testing:** Vitest for game logic unit tests
- **Deploy:** Static hosting (Vercel / GitHub Pages / any CDN)

## Constraints
- Zero runtime dependencies — fully static vanilla TS + CSS
- Each game folder is self-contained (own entry point, assets, game loop)
- Shared code lives in `packages/playables-adapter/` and `packages/game-engine/`
- Bundle size budget: < 200KB gzipped total
- Must run at 60fps on mid-range mobile
- All unit tests must pass 100% across all games

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
