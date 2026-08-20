# GSD Plan — Phase 45: Sand Zen & Color Water Sort

## Phase Overview
- **Phase**: 45-sand-zen-and-color-water-sort
- **Requirements**:
  - `FR-03`: Sand Zen Sandbox (`games/sand-zen/`) — Cellular automaton granular sand falling physics, sand hopper dispenser, zen rake dragging, funnels & obstacles, dune angle of repose, harmonic chime audio.
  - `FR-05`: Color Water Sort (`games/liquid-sort/`) — Test tube liquid sorting puzzle, pouring transfer rules, stratification checks, undo history, procedural liquid glug Web Audio.
  - Shell and unit tests verification with Vitest.

---

### Plan Breakdown
1. **`45-01-PLAN.md` — Sand Zen Sandbox (`games/sand-zen/`)**
   - Cellular automaton granular falling sand physics grid with dune angle of repose, color blending, and funnel mechanics (`SandGrid.ts`).
   - Interactive Zen rake tool, sand hopper continuous dispenser, obstacle funnels (`ZenTools.ts`).
   - Procedural harmonic sand chime and granular cascade Web Audio (`SandAudio.ts`).
   - Interactive Canvas scene (`SandZenScene.ts`), standalone HTML shell, and comprehensive Vitest unit tests (`SandZen.test.ts`).
2. **`45-02-PLAN.md` — Color Water Sort (`games/liquid-sort/`)**
   - Test tube container state, color layer stratification, transfer validation, win condition checker, and undo history stack (`WaterSortEngine.ts`).
   - Level generator and puzzle layouts (`LevelGenerator.ts`).
   - Procedural liquid glug, trickle, and victory chord Web Audio (`LiquidAudio.ts`).
   - Smooth pouring bezier stream renderer, test tube tilt animation, interactive Canvas scene (`LiquidSortScene.ts`), standalone HTML shell, and comprehensive Vitest unit tests (`LiquidSort.test.ts`).
