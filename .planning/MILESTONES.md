# Milestones

## v2.0: Unique UI/UX Refactor (Shipped 2026-08-17)

**Goal:** Overhaul webapp from YouTube-dark clone to a distinct, memorable Arcade Carnival visual brand with modern vanilla TS UX architecture.

**Shipped:**
- Cyber-arcade CSS token system (`tokens.css`, `theme.css`) and persistent CRT scanline/bloom overlay (`crt.css`, `crt.ts`)
- Lightweight zero-dependency reactive architecture: `BaseComponent` lifecycle, typed `Store`, `HashRouter` (`#/`, `#/game/:id`, `#/embed`), and View Transitions API wrapper
- Modular UI component library: `AppHeader` (`/` shortcut search), responsive desktop `AppSidebar` & mobile `BottomNav` (>=48px touch targets), `FilterChips`, `GameCard` with neon hover glow & high score display, and live filtered `GameGrid`
- Dedicated `GameView` player with skeleton shimmer loader, iframe lifecycle isolation (`about:blank` + pause on teardown), auto-focus delegation, `Escape` catalog exit, and theater mode (`T` shortcut)
- `EmbedView` interactive integration kit with live sandbox preview and embed code generators
- Procedural Web Audio UI sound effects synthesizer (`ui-audio.ts`) with reactive trigger integration
- 43 test files, 284 unit tests passing (100% pass rate)
- Total bundle: 54.02 KB gzipped (< 200 KB budget, 73% under limit)
- Roadmap archive: `.planning/milestones/v2.0-ROADMAP.md`
- Requirements archive: `.planning/milestones/v2.0-REQUIREMENTS.md`
- Audit: `.planning/v2.0-MILESTONE-AUDIT.md` (passed)

## v1.0: Arcade Carnival (Shipped 2026-08-17)

**Goal:** 5 browser-based HTML5 Canvas arcade minigames packaged for YouTube Playables with shared game engine, playables adapter, and central hub launcher.

**Shipped:**
- 5 Canvas minigames: Safe Cracker, Brick Blitz, Sky Hopper, Crate Catch, Type Strike
- Shared `@arcade-carnival/game-engine` (GameLoop, InputManager, SceneManager, procedural Web Audio)
- Shared `@arcade-carnival/playables-adapter` (YouTube Playables lifecycle + localStorage fallback)
- Central hub launcher (`index.html`, `src/hub.ts`, `src/hub.css`) with search, filter, theater mode
- Embed kit (`embed.html`) with `<arcade-game>` web component
- 27 test files, 191 unit tests passing
- Total bundle 37.84 KB gzipped (< 200 KB per-game budget)
- Audit: `.planning/v1.0-MILESTONE-AUDIT.md` (passed)
