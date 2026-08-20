# State: ArcadeTub

## Current Position

Phase: 48 - GridMap Engine & Sub-Tile Destruction
Plan: 02 complete (Phase 48 fully executed)
Status: Completed
Last activity: 2026-08-20 — Executed Plan 48-02 (Authentic 35-stage layouts and unit test suite)

## Progress

- Milestone: v8.0 — Tank 1990 (Battle City) Retro Papercraft Arcade
- Phase: 48 / 55 (1/8 phases complete)
- Catalog Size: 42 games currently active, targeting 43.
- Total v8.0 Requirements: 35 requirements across 8 phases.

## Performance Metrics

- Test Suite: 100% pass rate (18/18 GridMap & Stages tests passing)
- Bundle Budget: < 350KB gzipped target across hub + all 43 games
- Asset Dependency: Zero external assets (pure Canvas 2D + Web Audio API synthesis)

## Key Decisions

- Grid Resolution: 26×26 sub-tiles (16×16px cells on 416×416 field) subdivided into 4 quadrants for authentic sub-tile chipping.
- Movement Assist: ≤4px orthogonal snap deadzone to eliminate corridor corner catching.
- Ballistics: 120Hz sub-stepping continuous ray sweep to prevent bullet tunneling and guarantee bullet-vs-bullet cancellation.
- Rendering: Multi-pass Canvas 2D (Ground -> Entities/Powerups -> Grass Canopy -> Particles/HUD) for camouflage occlusion.
- Audio: Pure procedural Web Audio API chiptune synthesis with master `DynamicsCompressorNode`.

