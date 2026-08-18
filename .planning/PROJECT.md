# Project: Arcade Carnival

## Purpose
Collection of browser-based arcade minigames packaged for web embedding and instant play. Each game lives in its own folder, shares a common Playables/web adapter layer, and launches from a central hub launcher. Original names, procedural audio, and custom UI.

## Current Milestone: v5.0 — 2D Papercraft Visual Overhaul

**Goal:** Replace the entire visual identity — hub site and all 15 game canvas renderers — with a **2D Papercraft** aesthetic. Everything looks handmade from colored construction paper, cardboard, tape strips, and torn paper edges. Sprites are paper cutouts, backgrounds are layered craft paper, HUDs are sticky-note overlays.

**Key Deliverables:**
1. Hub CSS design system: papercraft color palette, torn-edge borders, tape/staple decorations, construction paper textures
2. All 15 game HTML shells: craft-paper backgrounds, cardboard-bordered canvases
3. All 15 game canvas renderers: paper cutout sprites, layered cardboard backgrounds, sticky-note HUD overlays, craft-paper overlays
4. Game catalog metadata: updated titles, descriptions, icons to match papercraft theme

## Previous Milestones
- v1.0–v3.0: Foundation, 12 games, UI/UX refactor
- v4.0: 15 games total (snake, bug climb, car race, type strike arrows), catalog expansion
- Post-v4.0: Vintage storybook style applied (warm paper, ink borders, Lora/Comfortaa fonts)

## All Games (15 Total)
| Folder | Game | Genre |
|--------|------|-------|
| `safe-cracker/` | Safe Cracker | Clicker/timing |
| `brick-blitz/` | Brick Blitz | Breakout |
| `sky-hopper/` | Sky Hopper | Vertical platformer |
| `crate-catch/` | Crate Catch | Catcher/stacker |
| `type-strike/` | Type Strike | Typing / Arrows defense |
| `memory-cards/` | Memory Cards | Card Match |
| `memory-boxes/` | Memory Boxes | Sequence Memory |
| `pop-balloon/` | Pop Balloon | Clicker Action |
| `space-racer/` | Space Racer | Speed Runner |
| `virus-defense/` | Virus Defense | Radial Defense |
| `flappy-fish/` | Flappy Fish | Hydrodynamic Flapper |
| `game-2048/` | 2048 | Tile Puzzle |
| `snake-eat/` | Storybook Snake | Grid Classic |
| `bug-climb/` | Ladybug Climb | Rapid Climber |
| `car-race/` | Vintage Speedway | Traffic Racer |

## Tech Stack
- **Build:** Vite 7 + TypeScript + pnpm workspaces
- **Rendering:** Canvas 2D API (no engine dependency)
- **Audio:** Procedural Web Audio synthesis (zero audio files)
- **Styling:** Custom CSS design system (tokens, scoped CSS)
- **Testing:** Vitest for game logic unit tests
- **Deploy:** Cloudflare Pages

## Constraints
- Zero runtime dependencies — fully static vanilla TS + CSS
- Each game folder is self-contained (own entry point, assets, game loop)
- Shared code lives in `packages/playables-adapter/` and `packages/game-engine/`
- Bundle size budget: < 200KB gzipped total
- Must run at 60fps on mid-range mobile
- All 574 unit tests must pass 100%
