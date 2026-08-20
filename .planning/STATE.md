# State: ArcadeTub

## Current Position

Phase: 55 - Hub Catalog Registration, Test Suite & Integration
Plan: 02 complete
Status: Milestone v8.0 complete, all 55 phases finished
Last activity: 2026-08-20 — Executed Plan 55-02 (Full platform regression testing, bundle audit test update, and build verification)

## Progress

- Milestone: v8.0 — Tank 1990 (Battle City) Retro Papercraft Arcade (COMPLETE)
- Phase: 55 / 55 (Phase 55 complete)
- Catalog Size: 43 games active and verified.
- Total v8.0 Requirements: 35 requirements across 8 phases (100% complete).

## Performance Metrics

- Test Suite: 100% pass rate (1130/1130 total repository unit tests passing; 192/192 Tank 1990 unit tests passing)
- Bundle Budget: Strictly < 350KB gzipped target across hub + all 43 games (actual ~260KB gzipped)
- Asset Dependency: Zero external assets (pure Canvas 2D + Web Audio API synthesis)

## Key Decisions

- Grid Resolution: 26×26 sub-tiles (16×16px cells on 416×416 field) subdivided into 4 quadrants for authentic sub-tile chipping.
- Movement Assist: ≤4px orthogonal snap deadzone to eliminate corridor corner catching.
- Ballistics: 120Hz sub-stepping continuous ray sweep to prevent bullet tunneling and guarantee bullet-vs-bullet cancellation.
- PowerUp Management: Single active powerup cap on field; Eagle HQ base perimeter caching snapshots and restores partial quadrant masks on shovel timeout.
- State Machine & Game Flow: Finite state machine with 7 explicit states (TITLE, STAGE_INTRO, PLAYING, PAUSED, STAGE_TALLY, GAME_OVER, VICTORY), 2.0s curtain timer auto-transition, safe localStorage score persistence with 20000 fallback, and stage clamping across 1..35.
- Rendering: Multi-pass Canvas 2D (Ground -> Entities/Powerups -> Grass Canopy -> Particles/HUD) for camouflage occlusion.
- Audio: Pure procedural Web Audio API chiptune synthesis with master `DynamicsCompressorNode`.
- Controls: Multi-touch pointer isolation with ±10° angular hysteresis buffer on 45° boundaries and letterboxed aspect-ratio viewport projection.


