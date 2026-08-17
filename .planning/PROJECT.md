# Project: Arcade Carnival

## Purpose
Collection of 5 browser-based arcade minigames packaged for YouTube Playables. Each game lives in its own folder, shares a common Playables adapter layer, and launches from a hub menu. Original names and UI — no third-party IP.

## Current State: v2.0 Shipped (2026-08-17)

**Current Release:** v2.0: Unique UI/UX Refactor
- Cyber-arcade visual brand with design tokens and CRT toggle
- Zero-dependency reactive vanilla TS component architecture (`BaseComponent`, `Store`, `HashRouter`, View Transitions)
- Mobile-first responsive navigation (bottom bar on mobile, sidebar on desktop)
- Isolated game iframe player with skeleton loader, theater mode, and clean teardown
- Procedural Web Audio UI sound effects
- 284 unit tests passing, 54.02 KB gzipped production bundle

<details>
<summary>v2.0 Milestone Details</summary>

**Target features delivered:**
- Unique visual identity & design system (retro-modern arcade theme, custom typography, tokens)
- Lightweight component-based Hub architecture (clean DOM updates, no full innerHTML rebuilds)
- Modern UX: smooth view transitions, URL hash routing (back/forward button support), loading states
- Responsive redesign with mobile-first navigation (bottom bar on mobile, full touch support)
- Unified embed kit & docs page using shared design tokens
- Zero-dependency constraint preserved (vanilla TS + CSS)

</details>

## Next Milestone Goals (v2.1 / Future Backlog)
- Dark/Light arcade theme toggle variant (`FUT-01`)
- Custom animated SVG achievement badges (`FUT-02`)
- Full-bleed featured game hero carousel (`FUT-03`)
- Additional minigame expansion candidates

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
- **Styling:** Custom CSS design system (tokens, scoped CSS, retro-modern arcade aesthetic)
- **Testing:** Vitest for game logic unit tests
- **Deploy:** Static hosting (Vercel / GitHub Pages / any CDN)

## Constraints
- Zero runtime dependencies — fully static vanilla TS + CSS
- Each game folder is self-contained (own entry point, assets, game loop)
- Shared code lives in `packages/playables-adapter/` and `packages/game-engine/`
- Bundle size budget: < 200KB gzipped total
- Must run at 60fps on mid-range mobile
- All existing 191 tests must continue passing

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
