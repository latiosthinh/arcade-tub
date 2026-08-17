# Requirements: Arcade Carnival

## Functional

- **REQ-01**: Hub page lists all 5 games with thumbnails; clicking launches the game in-browser
- **REQ-02**: Each game lives in its own folder with independent entry point and build
- **REQ-03**: Games implement mechanics faithful to spec (see PROJECT.md game table)
- **REQ-04**: Shared Playables adapter handles YouTube lifecycle (game ready, pause, resume, save/load score)
- **REQ-05**: Keyboard controls per game: Safe Cracker (mouse click + right-click hold), Brick Blitz (A/D/arrows + Space), Sky Hopper (A/D/arrows + W/Up to throw), Crate Catch (arrows/WASD + Space), Type Strike (full keyboard typing)
- **REQ-06**: Score tracking with local high-score persistence (localStorage, bridged to Playables save API when available)
- **REQ-07**: Each game has pause (Escape) and game-over state with restart option

## Non-Functional

- **REQ-08**: TypeScript strict mode, no `any`
- **REQ-09**: Vitest unit tests for core game logic (scoring, collision, timing)
- **REQ-10**: Production build outputs static assets per game (deployable independently or as bundle)
- **REQ-11**: 60fps on mid-range devices; total bundle per game < 200KB gzipped
- **REQ-12**: Accessible — ARIA labels on hub, high-contrast game UI, keyboard-navigable menus
