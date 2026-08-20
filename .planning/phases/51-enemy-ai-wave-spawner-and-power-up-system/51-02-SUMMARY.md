---
phase: 51-enemy-ai-wave-spawner-and-power-up-system
plan: 02
subsystem: tank-1990
tags:
  - enemy-ai
  - wave-spawner
  - power-ups
  - vitest
dependency_graph:
  requires:
    - 51-01
  provides:
    - PowerUpSystem
    - EnemyTankTests
    - EnemySpawnerTests
    - PowerUpSystemTests
  affects:
    - games/tank-1990/src/PowerUpSystem.ts
    - games/tank-1990/test/EnemyTank.test.ts
    - games/tank-1990/test/EnemySpawner.test.ts
    - games/tank-1990/test/PowerUpSystem.test.ts
tech_stack:
  added: []
  patterns:
    - Snapshot state caching and restoration for dynamic terrain transformations (Shovel powerup)
    - AABB bounding box collision resolution for collectible powerup entities
    - Unit testing for stateful AI steering, wave spawners, and tactical item triggers with Vitest
key_files:
  created:
    - games/tank-1990/src/PowerUpSystem.ts
    - games/tank-1990/test/EnemyTank.test.ts
    - games/tank-1990/test/EnemySpawner.test.ts
    - games/tank-1990/test/PowerUpSystem.test.ts
  modified: []
decisions:
  - Capped active powerups on the field to 1 at a time, overwriting previous uncollected drops to prevent clutter.
  - Eagle HQ fortification caches exact cell masks (including partial quadrant chipping) and cleanly restores layout when timer elapses.
metrics:
  duration: 4m
  completed_date: 2026-08-20
---

# Phase 51 Plan 02: PowerUpSystem & Comprehensive Vitest Test Suites Summary

PowerUpSystem managing all 8 tactical items with Shovel terrain caching/restoration alongside 100% passing Vitest test coverage across EnemyTank, EnemySpawner, and PowerUpSystem.

## Key Changes

1. **PowerUpSystem (`games/tank-1990/src/PowerUpSystem.ts`)**:
   - Manages spawning and pickup detection for all 8 powerup items: `STAR`, `SHOVEL`, `GRENADE`, `CLOCK`, `HELMET`, `TANK`, `GUN`, `BOAT`.
   - Resolves AABB collisions against `PlayerTank` bounding box.
   - Applies stat upgrades, weapon tiers, invulnerability shields, extra lives, boat traversal, full-field enemy freeze, and full-field enemy destruction.
   - Shovel Eagle HQ base perimeter caching snapshots the 8 perimeter tiles surrounding HQ into a Map before converting them to STEEL, restoring them after 20s.
   - Emits pickup event callbacks awarding 500 bonus points.

2. **Unit Test Suites (`games/tank-1990/test/`)**:
   - `EnemyTank.test.ts`: verified all 4 enemy archetypes (`BASIC`, `FAST`, `POWER`, `ARMOR`), 4-hit armor color degradation (`GREEN` -> `YELLOW` -> `ORANGE` -> `WHITE`), flashing tank bonus drops on damage, clock freeze logic, and kinematics/obstacle boundaries.
   - `EnemySpawner.test.ts`: verified 20-tank wave queues, concurrency capping at 4 active tanks, 3 top portal rotations, 4th/11th/18th flashing bonus tank spawns, and bulk `freezeAll` / `killAll` calls.
   - `PowerUpSystem.test.ts`: verified random and specific item spawns, single-item cap, AABB pickup, all 8 powerup effects, and Eagle HQ perimeter caching and restoration.

## Deviations from Plan

None - plan executed exactly as specified.

## Verification

Ran `npm test -- games/tank-1990`:
All 6 test files (87 tests) passed with 100% pass rate.

## Self-Check: PASSED
- `games/tank-1990/src/PowerUpSystem.ts` exists on disk.
- `games/tank-1990/test/EnemyTank.test.ts` exists on disk.
- `games/tank-1990/test/EnemySpawner.test.ts` exists on disk.
- `games/tank-1990/test/PowerUpSystem.test.ts` exists on disk.
- Commits `bb8482d` and `3a1fd39` confirmed in git log.
