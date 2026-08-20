# State: ArcadeTub

## Current Position

Phase: 49 - Player Tank Kinematics & Upgrade Tiers
Plan: 02 complete
Status: Complete
Last activity: 2026-08-20 — Executed Plan 49-02 (Comprehensive PlayerTank Vitest unit test suite)

## Progress

- Milestone: v8.0 — Tank 1990 (Battle City) Retro Papercraft Arcade
- Phase: 49 / 55 (2/8 phases complete, Phase 49 completed)
- Catalog Size: 42 games currently active, targeting 43.
- Total v8.0 Requirements: 35 requirements across 8 phases.

## Performance Metrics

- Test Suite: 100% pass rate (38/38 GridMap & PlayerTank tests passing)
- Bundle Budget: < 350KB gzipped target across hub + all 43 games
- Asset Dependency: Zero external assets (pure Canvas 2D + Web Audio API synthesis)

## Key Decisions

- Grid Resolution: 26×26 sub-tiles (16×16px cells on 416×416 field) subdivided into 4 quadrants for authentic sub-tile chipping.
- Movement Assist: ≤4px orthogonal snap deadzone to eliminate corridor corner catching.
- Ballistics: 120Hz sub-stepping continuous ray sweep to prevent bullet tunneling and guarantee bullet-vs-bullet cancellation.
- Rendering: Multi-pass Canvas 2D (Ground -> Entities/Powerups -> Grass Canopy -> Particles/HUD) for camouflage occlusion.
- Audio: Pure procedural Web Audio API chiptune synthesis with master `DynamicsCompressorNode`.

