# State: ArcadeTub

## Current Position

Phase: 52 - Game Flow, State Machine & Tally HUD
Plan: 02 complete
Status: Phase Complete
Last activity: 2026-08-20 — Executed Plan 52-02 (ScoreManager & GameFlow unit test suites)

## Progress

- Milestone: v8.0 — Tank 1990 (Battle City) Retro Papercraft Arcade
- Phase: 52 / 55 (5/8 phases complete, Phase 52 Plans 01 & 02 completed)
- Catalog Size: 42 games currently active, targeting 43.
- Total v8.0 Requirements: 35 requirements across 8 phases.

## Performance Metrics

- Test Suite: 100% pass rate (120/120 GridMap, PlayerTank, BulletManager, EnemyTank, EnemySpawner, PowerUpSystem, ScoreManager, GameFlow tests passing)
- Bundle Budget: < 350KB gzipped target across hub + all 43 games
- Asset Dependency: Zero external assets (pure Canvas 2D + Web Audio API synthesis)

## Key Decisions

- Grid Resolution: 26×26 sub-tiles (16×16px cells on 416×416 field) subdivided into 4 quadrants for authentic sub-tile chipping.
- Movement Assist: ≤4px orthogonal snap deadzone to eliminate corridor corner catching.
- Ballistics: 120Hz sub-stepping continuous ray sweep to prevent bullet tunneling and guarantee bullet-vs-bullet cancellation.
- PowerUp Management: Single active powerup cap on field; Eagle HQ base perimeter caching snapshots and restores partial quadrant masks on shovel timeout.
- State Machine & Game Flow: Finite state machine with 7 explicit states (TITLE, STAGE_INTRO, PLAYING, PAUSED, STAGE_TALLY, GAME_OVER, VICTORY), 2.0s curtain timer auto-transition, safe localStorage score persistence with 20000 fallback, and stage clamping across 1..35.
- Rendering: Multi-pass Canvas 2D (Ground -> Entities/Powerups -> Grass Canopy -> Particles/HUD) for camouflage occlusion.
- Audio: Pure procedural Web Audio API chiptune synthesis with master `DynamicsCompressorNode`.


