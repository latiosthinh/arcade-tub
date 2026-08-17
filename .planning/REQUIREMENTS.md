# Requirements: Arcade Carnival

## Functional

- [x] **REQ-01**: Hub page lists all 5 games with thumbnails; clicking launches the game in-browser
- [x] **REQ-02**: Each game lives in its own folder with independent entry point and build
- [x] **REQ-03**: Games implement mechanics faithful to spec (see PROJECT.md game table)
- [x] **REQ-04**: Shared Playables adapter handles YouTube lifecycle (game ready, pause, resume, save/load score)
- [x] **REQ-05**: Keyboard controls per game: Safe Cracker (mouse click + right-click hold), Brick Blitz (A/D/arrows + Space), Sky Hopper (A/D/arrows + W/Up to throw), Crate Catch (arrows/WASD + Space), Type Strike (full keyboard typing)
- [x] **REQ-06**: Score tracking with local high-score persistence (localStorage, bridged to Playables save API when available)
- [x] **REQ-07**: Each game has pause (Escape) and game-over state with restart option

## Non-Functional

- [x] **REQ-08**: TypeScript strict mode, no `any`
- [x] **REQ-09**: Vitest unit tests for core game logic (scoring, collision, timing)
- [x] **REQ-10**: Production build outputs static assets per game (deployable independently or as bundle)
- **REQ-11**: 60fps on mid-range devices; total bundle per game < 200KB gzipped
- [x] **REQ-12**: Accessible — ARIA labels on hub, high-contrast game UI, keyboard-navigable menus
