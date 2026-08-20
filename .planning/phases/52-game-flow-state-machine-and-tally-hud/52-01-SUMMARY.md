---
phase: 52-game-flow-state-machine-and-tally-hud
plan: 01
subsystem: games/tank-1990
tags: [game-flow, state-machine, score-manager, hud, tally, battle-city]
dependency_graph:
  requires:
    - 50-01
    - 51-01
  provides:
    - GameFlow
    - ScoreManager
    - GameState
    - HUDState
    - StageTallyResult
  affects:
    - games/tank-1990/src/types.ts
    - games/tank-1990/src/ScoreManager.ts
    - games/tank-1990/src/GameFlow.ts
tech_stack:
  added: []
  patterns:
    - Pure TypeScript zero-dependency finite state machine
    - Safe localStorage persistence with error handling and fallback
    - End-stage kill tally breakdown calculator per enemy archetype
key_files:
  created:
    - games/tank-1990/src/ScoreManager.ts
    - games/tank-1990/src/GameFlow.ts
  modified:
    - games/tank-1990/src/types.ts
decisions:
  - "ScoreManager defaults high score to 20000 with safe localStorage parsing and write protection."
  - "GameFlow handles complete state cycle (TITLE, STAGE_INTRO, PLAYING, PAUSED, STAGE_TALLY, GAME_OVER, VICTORY) with configurable curtain and tally timers."
  - "Stage selection and advancement clamps strictly to [1, 35] bounds."
metrics:
  duration: "4m"
  completed_date: "2026-08-20"
---

# Phase 52 Plan 01: Game Flow State Machine and Tally HUD Summary

Implemented the finite state machine game flow, score tracking, end-stage kill tally calculator, localStorage high score persistence, stage intro curtain timer, and active HUD data coordinator for Tank 1990.

## Implementation Details

1. **`games/tank-1990/src/types.ts`**:
   - Added `GameState` enum (`TITLE`, `STAGE_INTRO`, `PLAYING`, `PAUSED`, `STAGE_TALLY`, `GAME_OVER`, `VICTORY`).
   - Added `KillTallyStats`, `EnemyTallyRow`, `StageTallyResult`, `HUDState`, and `TitleOption` types.

2. **`games/tank-1990/src/ScoreManager.ts`**:
   - Point accumulation per kill (`BASIC: 100`, `FAST: 200`, `POWER: 300`, `ARMOR: 400`) and arbitrary bonuses.
   - Stage kill tally tracking and `calculateStageTally` generator.
   - Robust `localStorage` read/write with quota/sandbox exception guarding and default 20000 fallback.

3. **`games/tank-1990/src/GameFlow.ts`**:
   - Finite state machine coordinating transitions across all game lifecycle states.
   - 2.0s stage intro curtain countdown timer auto-advancing to `PLAYING`.
   - Campaign progression clamping across 35 stages with `VICTORY` trigger on Stage 35 completion.
   - Real-time `getHUDState()` snapshot binder for sidebar rendering.

## Verification

- TypeScript check passed cleanly: `npx tsc -p games/tank-1990/tsconfig.json --noEmit`
- All 87 existing unit and integration tests continue to pass: `npx vitest run`

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
- `games/tank-1990/src/types.ts`: FOUND
- `games/tank-1990/src/ScoreManager.ts`: FOUND
- `games/tank-1990/src/GameFlow.ts`: FOUND
- Commits `2235681`, `f5209d0`, `02c33f1`: FOUND
