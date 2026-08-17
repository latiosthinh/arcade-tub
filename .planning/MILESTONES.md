# Milestones

## v3.0: Game Catalog Expansion (7 New Games) (Shipped 2026-08-18)

**Goal:** Expand Arcade Carnival catalog from 5 to 12 complete HTML5 Canvas arcade minigames with procedural Web Audio, standalone builds, persistent high scores, and cyber-arcade SVG screenshots.

**Shipped:**
- 7 New Canvas minigames:
  1. `games/memory-cards/`: Cyber memory match cards with 3D flip effect and streak combo multipliers.
  2. `games/memory-boxes/`: Simon-says sequence memory matrix with tone synthesis and speed bonuses.
  3. `games/pop-balloon/`: Rapid neon balloon clicker with color combo chains and spike bomb hazard avoidance.
  4. `games/space-racer/`: High-speed pseudo-3D warp starfield racer with turbo boost gates and asteroid dodging.
  5. `games/virus-defense/`: 360° rotational turret shooter defending central cell nucleus against pathogen swarms.
  6. `games/flappy-fish/`: Hydrodynamic underwater obstacle flapper with glowing coral reef barriers and pearl pickups.
  7. `games/game-2048/`: Neon sliding tile puzzle with color-tiered values, slide/pop animations, and swipe touch input.
- Central catalog updated to 12 games with authentic vector SVG screenshots and genre filter chips.
- 73 test files, 471 unit tests passing (100% pass rate).
- Total distribution bundle: 105.93 KB gzipped across all 12 games + hub + embed (< 200 KB budget).
- Audit: `.planning/v3.0-MILESTONE-AUDIT.md` (passed).

---

## v2.0: Unique UI/UX Refactor (Shipped 2026-08-17)

**Goal:** Overhaul webapp from YouTube-dark clone to a distinct, memorable Arcade Carnival visual brand with modern vanilla TS UX architecture.

**Shipped:**
- Cyber-arcade CSS design token system (`tokens.css`, `theme.css`)
- Zero-dependency `BaseComponent` lifecycle + typed pub/sub `Store`
- Client-side `HashRouter` (`#/`, `#/game/:id`, `#/embed`) with View Transitions API wrapper
- Dedicated `GameView` player with skeleton loader, clean iframe lifecycle management, and theater mode
- Zero-asset procedural UI Web Audio synthesizer (`ui-audio.ts`)
- 43 test files, 283 unit tests passing
- Total bundle: 55.68 KB gzipped (< 200 KB budget)
- Audit: `.planning/v2.0-MILESTONE-AUDIT.md` (passed)

---

## v1.0: Arcade Carnival (Shipped 2026-08-17)

**Goal:** 5 browser-based HTML5 Canvas arcade minigames packaged for YouTube Playables with shared game engine, playables adapter, and central hub launcher.

**Shipped:**
- 5 Canvas minigames: Safe Cracker, Brick Blitz, Sky Hopper, Crate Catch, Type Strike
- Shared `@arcade-carnival/game-engine` & `@arcade-carnival/playables-adapter`
- 27 test files, 191 unit tests passing
- Total bundle: 37.84 KB gzipped
- Audit: `.planning/v1.0-MILESTONE-AUDIT.md` (passed)
