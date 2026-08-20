# Phase 41 Plan 01: Timed Egg Decay & Infinite Mode Mechanics Summary

Timed egg block decay physics, endless procedural obstacle streaming, and dual game mode state machine with localStorage persistence implemented in Square Bird.

## Key Changes

- **BirdPhysics.ts**:
  - Added `lifeTime` and `maxLifeTime` fields to `EggBlock` (default 3.0s duration).
  - Configurable `eggDuration` parameter in `BirdConfig`.
  - Added `onEggExpire` callback handler in `BirdPhysics`.
  - Updated `update(dt, groundY)` loop to tick down egg block timers, remove expired blocks, emit expiration callbacks, and pull bird and remaining stack downwards via gravity.
- **ObstacleGenerator.ts**:
  - Implemented `generateAhead(currentX, bufferDistance)` for procedural infinite obstacle generation with dynamic difficulty progression.
  - Implemented `cullBehind(camX, cullOffset)` to remove off-screen passed obstacles and protect memory bounds.
- **GameState.ts**:
  - Added `mode: 'levels' | 'infinite'` and `startMode(mode, level)`.
  - Added `infiniteHighScore` persisted via `@arcade-carnival/playables-adapter` (`loadData` / `saveData`).
  - Added continuous streaming and culling loop inside `update(dt)`.
- **embed.ts**:
  - Added safe guard for non-browser/test environments when extending `HTMLElement`.
- **SquareBird.test.ts**:
  - 100% test coverage added for egg block timers, expiration event emission, vertical physics settling, infinite obstacle streaming, culling, and high score persistence.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] HTMLElement undefined in NodeJS Vitest environment for playables-adapter embed**
- **Found during:** Task 2 verification
- **Issue:** `packages/playables-adapter/src/embed.ts` extended `HTMLElement` at root level which throws in node vitest environments without DOM globals.
- **Fix:** Guarded `ArcadeGameElement` base class with fallback `(typeof HTMLElement !== 'undefined' ? HTMLElement : class {})`.
- **Files modified:** `packages/playables-adapter/src/embed.ts`
- **Commit:** `32b575d`

## Known Stubs

None.

## Self-Check: PASSED
- `games/square-bird/src/BirdPhysics.ts` exists and tested
- `games/square-bird/src/ObstacleGenerator.ts` exists and tested
- `games/square-bird/src/GameState.ts` exists and tested
- `games/square-bird/test/SquareBird.test.ts` exists and all 16 tests pass
- Entire suite (107 files, 811 tests) passing cleanly.
