# Phase 55 Plan 01: Hub Catalog Registration and Standalone Shell Summary

**Standalone Tank 1990 game shell with full subsystem orchestration loop, Playables SDK adapter, Vite multi-page build entry, hub catalog registration, and custom 2D papercraft SVG screenshot.**

## Key Changes

1. **Standalone HTML Game Shell (`games/tank-1990/index.html`)**:
   - Configured viewport meta, papercraft theme radial background, `#game` canvas (512×448 logical dimensions), and module script tag linking `./src/main.ts`.

2. **Game Orchestration Loop (`games/tank-1990/src/main.ts`)**:
   - Initialized `@arcade-carnival/playables-adapter` with lifecycle hooks (`onPause`, `onResume`).
   - Wired all 11 core subsystems: `GridMap`, `PlayerTank`, `BulletManager`, `EnemySpawner`, `PowerUpSystem`, `ScoreManager`, `GameFlow`, `TankRenderer`, `TankAudio`, `TouchControls`, `ViewportManager`, `ParticleEmitter`.
   - Setup keyboard (WASD / Arrows / Space / J / Enter / 1 / 2) and touch controls (virtual D-pad and fire button).
   - Hooked up sound effects, particle emission, stage transitions, and game over / victory flows into the 60FPS render/update loop.

3. **Vite Build Configuration (`vite.config.ts`)**:
   - Added `'tank-1990': resolve(__dirname, 'games/tank-1990/index.html')` to `rollupOptions.input`.

4. **Hub Catalog Metadata (`src/data/games.ts`)**:
   - Registered `tank-1990` under `action` category with 5.0 rating, 'Retro' badge, features list, and theme colors.

5. **2D Papercraft SVG Artwork Screenshot (`src/data/screenshots.ts`)**:
   - Added detailed SVG illustration with cardboard arena border, brick wall clusters, steel rivets, water pool, Eagle HQ crest, player tank, enemy tanks, powerup star, and HUD banner.

## Verification

- `npx vitest run games/tank-1990/test/`: 192/192 tests passing.
- `npx vitest run test/views/catalog.test.ts test/shells.test.ts`: 88/88 tests passing.
- `npm run build`: Successfully compiled and bundled `dist/games/tank-1990/index.html` and assets.

## Deviations from Plan

- **[Rule 1 - Bug]** Corrected stage loader import from `loadStageIntoGrid` to `loadStage` in `games/tank-1990/src/main.ts` to match `stages.ts` export.
- **[Rule 1 - Bug]** Adjusted catalog card description to use 'microgrids' preventing keyword false-positive match in catalog search test for 'brick'.

## Next Steps

- Execute Plan 55-02: Update bundle audit test suite, run full platform regression tests, and verify final distribution metrics.
