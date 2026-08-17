# Milestones

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
