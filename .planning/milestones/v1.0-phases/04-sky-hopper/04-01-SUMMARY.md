---
phase: 04-sky-hopper
plan: 01
subsystem: physics-and-entities
tags:
  - physics
  - kinematics
  - platforms
  - procedural-generation
  - obstacles
  - camera
dependency_graph:
  requires: []
  provides:
    - Player
    - Projectile
    - Camera
    - PlatformManager
    - Platform
    - PlatformType
    - PlatformCollisionResult
    - ObstacleManager
    - Obstacle
    - ObstacleType
    - ObstacleInteractionResult
  affects:
    - games/sky-hopper/src/Player.ts
    - games/sky-hopper/src/Camera.ts
    - games/sky-hopper/src/PlatformManager.ts
    - games/sky-hopper/src/ObstacleManager.ts
tech-stack:
  added: []
  patterns:
    - Upward-only 1D vertical camera scrolling
    - Swept interval vertical collision check to prevent high-speed tunneling
    - Procedural altitude-based platform and obstacle distribution
    - Rocket invulnerability state machine
key-files:
  created:
    - games/sky-hopper/src/Player.ts
    - games/sky-hopper/src/Camera.ts
    - games/sky-hopper/src/PlatformManager.ts
    - games/sky-hopper/src/ObstacleManager.ts
    - games/sky-hopper/test/player.test.ts
    - games/sky-hopper/test/camera.test.ts
    - games/sky-hopper/test/platforms.test.ts
    - games/sky-hopper/test/obstacles.test.ts
  modified: []
decisions:
  - "Player screen wrap resets to exact left/right boundary smoothly (-width to screenWidth and vice-versa)"
  - "Platform collision detects falling crossings with top interval tolerance of 10px to guarantee zero tunneling"
  - "Downward drone stomp zone calibrated to upper 60% of drone height while player vy > 0"
  - "Camera y monotonically decreases only, locking progress and making falls lethal below viewport"
metrics:
  duration: "4m"
  completed_date: "2026-08-17"
---

# Phase 04 Plan 01: Sky Hopper Core Physics and Entities Summary

Delivered complete deterministic physics and procedural generation logic for Sky Hopper: Player kinematics, screen wrap, auto-bounce, super jump, 3s rocket boost mode, upward projectile shooting, upward-only Camera tracking, PlatformManager multi-tier procedural generation with breakable/moving/spring platforms, and ObstacleManager flying drones, spire mines, and bouncy balloons with stomping and projectile collision detection.

## Key Changes

1. **Player & Kinematics (`Player.ts`)**:
   - Gravity acceleration (`1000 px/s^2`), horizontal inertia with damping, and smooth edge-to-edge screen wrapping.
   - Normal bounce (`-650 px/s`) and super bounce (`-1100 px/s`).
   - Rocket powerup state (`-1200 px/s`, gravity bypass, 3.0s duration).
   - Upward projectile firing (`-900 px/s`) with 0.25s cooldown.

2. **Upward-Only Camera (`Camera.ts`)**:
   - Follows player vertical climb with offset 320px.
   - Monotonically decreases Y coordinate (never descends when player drops).
   - World-to-screen coordinate transformers and out-of-bounds bottom culling.

3. **Platform Procedural Generation & Landing Math (`PlatformManager.ts`)**:
   - Spawns starter sequence and generates reachable platforms (gap 65-105px) ahead of camera.
   - Altitude-tiered distribution of standard, fragile (breaks on bounce), moving (bounces at edges), and spring platforms.
   - 5% chance of rocket boosters on standard platforms.
   - One-way top-down landing detection (`prevBottom` / `currBottom` interval check) preventing upward jumping blockage or downward tunneling.

4. **Obstacle Dynamics (`ObstacleManager.ts`)**:
   - Generates flying drones, stationary spire mines, and balloons above ground baseline.
   - Upward projectile collisions destroy obstacles and award score (drone: 100pts, spire: 150pts, balloon: 50pts).
   - Rocket mode grants obstacle invulnerability and instant destruction.
   - Downward falling stomp kills drones and bounces player; lateral/bottom drone touches and spire mines cause lethal player death.
   - Balloon collision produces non-lethal repulsion impulse.

## Test Coverage

- `player.test.ts`: 8 unit tests covering gravity, damping, wrapping, jumping, rocket timers, and shooting.
- `camera.test.ts`: 6 unit tests verifying upward-only tracking, screen transformations, and bounds culling.
- `platforms.test.ts`: 9 unit tests checking procedural reachability, moving patrol boundaries, fragile decay, spring bounce, and rocket collection.
- `obstacles.test.ts`: 8 unit tests validating projectile destruction, rocket invulnerability, drone stomp zone, lethal mines, and balloon deflections.

All 89 tests across the repository pass cleanly with 100% typecheck safety.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
- `games/sky-hopper/src/Player.ts`: FOUND
- `games/sky-hopper/src/Camera.ts`: FOUND
- `games/sky-hopper/src/PlatformManager.ts`: FOUND
- `games/sky-hopper/src/ObstacleManager.ts`: FOUND
- `games/sky-hopper/test/player.test.ts`: FOUND
- `games/sky-hopper/test/camera.test.ts`: FOUND
- `games/sky-hopper/test/platforms.test.ts`: FOUND
- `games/sky-hopper/test/obstacles.test.ts`: FOUND
- Commit `53bd30f`: FOUND
- Commit `04c84d3`: FOUND
- Commit `f27fee0`: FOUND
