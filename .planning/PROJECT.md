# Project: Arcade Carnival

## Purpose
Collection of 5 browser-based arcade minigames packaged for YouTube Playables. Each game lives in its own folder, shares a common Playables adapter layer, and launches from a hub menu. Original names and UI — no third-party IP.

## Games
| Folder | Game | Genre | Mechanic Summary |
|--------|------|-------|------------------|
| `safe-cracker/` | Safe Cracker | Clicker/timing | Rotating indicator on a dial; tap when it hits the target zone. Yellow zones score, blue zones add time. Speed increases. |
| `brick-blitz/` | Brick Blitz | Breakout | Paddle at bottom, ball bounces off bricks. 3 lives, +1UP blocks, bonus blocks. Levels with brick layouts. |
| `sky-hopper/` | Sky Hopper | Vertical platformer | Auto-bounce off platforms going up. Avoid obstacles, collect power-ups (rocket, spring). Horizontal screen wrap. Story mode (reach top) + infinite mode. |
| `crate-catch/` | Crate Catch | Catcher/stacker | Two-lane platform catches falling crates. Avoid bombs. Stack height = score multiplier. Space to bank crates. |
| `type-strike/` | Type Strike | Typing defense | Enemies approach; type the word on them to destroy. Streak multiplier, reset on miss. 60s rounds. |

## Tech Stack
- **Build:** Vite 7 + TypeScript + pnpm workspaces
- **Rendering:** Canvas 2D API (no engine dependency)
- **Platform:** YouTube Playables (iframe, static assets, lifecycle hooks via postMessage)
- **Styling:** Minimal CSS for hub menu; games use canvas full-bleed
- **Testing:** Vitest for game logic unit tests
- **Deploy:** Static hosting (Vercel / GitHub Pages / any CDN)

## Constraints
- No server-side code — fully static
- Each game folder is self-contained (own entry point, assets, game loop)
- Shared code lives in `packages/playables-adapter/` (score reporting, save/load, lifecycle)
- Hub page at root `index.html` links to each game
- Keyboard-only controls (no mouse required except Safe Cracker click)
- Must run at 60fps on mid-range mobile
