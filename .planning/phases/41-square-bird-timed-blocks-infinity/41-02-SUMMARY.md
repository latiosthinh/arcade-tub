# Phase 41 Plan 02: Egg Decay Visuals, Expiration Feedback, Mode Selection, and HUD Summary

Tactile visual decay indicators, audio cues, expiration crumble particles, ready screen mode selector, and mode-specific HUD for Square Bird.

## Key Changes

1. **Egg Block Decay Visuals (`BirdRenderer.ts`)**:
   - Added pulsing warning highlight (amber/white flash) and origami crack lines across egg blocks nearing expiration (`lifeTime < 1.0s` or ratio < 0.33).
   - Added expiration countdown notch at top of decaying blocks.
2. **Decay Particles & Audio Cue (`BirdParticles.ts`, `BirdAudio.ts`)**:
   - Added `emitEggExpire` creating kraft paper specks dispersing on block timeout with particle capping (T-41-04 mitigation).
   - Added `playEggExpire` Web Audio synthesized filtered noise crumble click.
3. **Interactive Mode Selector & Overlays (`SquareBirdScene.ts`)**:
   - Wired `onEggExpire` callbacks from `BirdPhysics` to particles and audio.
   - Built interactive ready overlay with clickable/touchable buttons: `[1] LEVELS` and `[2] INFINITE`.
   - Added keyboard shortcut switching (`1`/`L`, `2`/`I`, `Space`).
   - Added game over stats display with high score tracking and "NEW BEST!" callout for infinite mode.
4. **Mode-Specific HUD (`BirdRenderer.ts`)**:
   - Differentiates `STAGE X` with progress bar in levels mode vs `DIST: Xm • BEST: Y` and `∞ INFINITE SURVIVAL` badge in infinite mode.

## Verification

- Vitest unit test suite covering physics, obstacle generation, mode switching, and decay triggers:
  `npx vitest run games/square-bird/test/SquareBird.test.ts` (17/17 tests passing).

## Self-Check: PASSED
- `BirdRenderer.ts` contains `lifeTime` and mode-specific badges.
- `BirdParticles.ts` contains `emitEggExpire`.
- `BirdAudio.ts` contains `playEggExpire`.
- `SquareBirdScene.ts` contains `startSelectedMode` and mode selection buttons.
- Commits exist: `721e5d7`, `e6036f6`.
