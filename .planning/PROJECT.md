# Project: Arcade Carnival

## Purpose
Collection of browser-based arcade minigames packaged for web embedding and instant play. Each game lives in its own folder, shares a common Playables/web adapter layer, and launches from a modern cyber-arcade hub launcher. Original names, procedural audio, and custom UI.

## Current Milestone: v4.0 Action & Arcade Expansion

**Goal:** Implement 3 new classic arcade minigames (Snake Eat, Bug Climb Tree, Car Race), add Arrow Mode to Type Strike for mobile/directional play, integrate all into the central catalog, and verify 100% test coverage and bundle budget.

**Target Features & Games:**
1. `type-strike` Arrow / Directional Mode: Mode toggle for arrow key sequences (↑ ↓ ← → / WASD) alongside word typing.
2. `games/snake-eat/` - Cyber Snake: Smooth neon grid movement, energy food pellets, speed growth, tail collision, combo points.
3. `games/bug-climb/` - Bug Climb Tree: Fast-paced Left/Right trunk switcher dodging falling branch hazards with time pressure.
4. `games/car-race/` - Neon Highway Car Race: Multi-lane traffic dodger with Up/Down or Left/Right lane switching and slipstream boosts.
5. Catalog Registration: SVG screenshots, metadata, and bundle verification (< 200KB).

## All Games (15 Total)
| Folder | Game | Genre | Mechanic Summary |
|--------|------|-------|------------------|
| `safe-cracker/` | Safe Cracker | Clicker/timing | Rotating indicator on a dial; tap when it hits the target zone. Yellow zones score, blue zones add time. |
| `brick-blitz/` | Brick Blitz | Breakout | Paddle at bottom, ball bounces off bricks. 3 lives, +1UP blocks, bonus blocks. Levels with brick layouts. |
| `sky-hopper/` | Sky Hopper | Vertical platformer | Auto-bounce off platforms going up. Avoid obstacles, collect power-ups (rocket, spring). Horizontal screen wrap. |
| `crate-catch/` | Crate Catch | Catcher/stacker | Two-lane platform catches falling crates. Color-matched to tracks. Multiplier stack banking. |
| `type-strike/` | Type Strike | Typing / Arrows defense | Enemies approach; type the word OR arrow sequence to destroy with lasers. Mode toggle. |
| `memory-cards/` | Memory Cards | Card Match | Flip cards to find matching cyber glyph pairs, combo multiplier chain, round countdown. |
| `memory-boxes/` | Memory Boxes | Sequence Memory | Flashing grid of neon boxes; repeat sequence of increasing length under timer. |
| `pop-balloon/` | Pop Balloon | Clicker Action | Ascending neon energy balloons; pop to score, avoid hazard spike bombs, chain color combos. |
| `space-racer/` | Space Racer | Speed Runner | High-speed space highway, steer ship through asteroid gates and hit turbo boost pads. |
| `virus-defense/` | Virus Defense | Radial Defense | Aim defense cannon 360° to eliminate mutating pathogen clusters before they breach cell nucleus. |
| `flappy-fish/` | Flappy Fish | Hydrodynamic Flapper | Tap/Space to flap underwater, navigate through neon coral reefs, collect pearl bubbles. |
| `game-2048/` | 2048 Neon | Tile Puzzle | Slide numbers on 4x4 neon grid; combine matching tiles to reach 2048 and beyond. |
| `snake-eat/` | Cyber Snake | Grid Classic | Guide neon cyber-snake, consume energy bits, grow tail, avoid walls and self-collision. |
| `bug-climb/` | Bug Climb | Rapid Climber | Bug climbs tree trunk; tap Left/Right arrow to dodge oncoming branches under urgent countdown. |
| `car-race/` | Neon Highway | Traffic Racer | Steer cyber-car across multi-lane highway, dodge oncoming traffic, slipstream draft for speed. |

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
