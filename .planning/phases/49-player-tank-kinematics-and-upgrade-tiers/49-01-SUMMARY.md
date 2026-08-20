# Phase 49 Plan 01: Player Tank Kinematics & Upgrade Tiers Summary

`PlayerTank` entity and kinematics system with 4-way cardinal steering, <=4px corridor corner auto-alignment, ice sliding drift physics, 4 upgrade tiers, spawn invulnerability bubble timer, and lives/respawn management.

## Key Changes

1. **`games/tank-1990/src/types.ts`**:
   - Added `TankTier` enum (`TIER_1` Basic, `TIER_2` Fast, `TIER_3` Heavy Dual-Shot, `TIER_4` Super Tank).
   - Added `TankTierStats` and `TANK_TIER_CONFIGS` mapping speeds (64 to 96 px/s), bullet velocities (160 to 280 px/s), active bullets (1 to 2), and special traits (`canDestroySteel`, `canCutTrees`).
   - Added `PlayerTankState` interface and physics constants (`TANK_SIZE = 28`, `SPAWN_X = 128`, `SPAWN_Y = 384`, `SPAWN_SHIELD_DURATION = 3.0`, `CORNER_SNAP_THRESHOLD = 4`, `ICE_SLIDE_DECEL = 180`).

2. **`games/tank-1990/src/PlayerTank.ts`**:
   - Implemented `PlayerTank` class.
   - Lifecycle: `spawn()`, `respawn()`, `kill()`, `upgradeTier()`, `setTier()`, `setShield()`, `addLife()`, `setBoat()`.
   - Corner Snapping: Orthogonal alignment assist within <= 4px deadzone for seamless turning into 16px corridors without wall snagging.
   - Kinematics & Ice Physics: Clamped dt movement with solid collision checking and continuous momentum drift on `TileType.ICE`.
   - Water traversal support with `boatActive`.

3. **`games/tank-1990/test/PlayerTank.test.ts`**:
   - 11 unit tests covering spawn coordinates, shield bubble protection, tier progression, corner snapping, ice drifting, and water traversal.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Shield timer decrement was clamped to max safeDt (0.1s)**
- **Found during:** Task 2 verification
- **Issue:** Large dt updates in tests or background tab recovery reduced shieldTimer by only 0.1s instead of full elapsed duration.
- **Fix:** Used full elapsed `dt` for timer deduction while keeping kinematic step clamped to `safeDt` (0.1s).
- **Files modified:** `games/tank-1990/src/PlayerTank.ts`
- **Commit:** bef3e5f

## Verification

- `npx tsc --noEmit --project games/tank-1990/tsconfig.json` passed with 0 errors.
- `npx vitest run games/tank-1990/test/` passed (29/29 tests across GridMap and PlayerTank suites).

## Self-Check: PASSED
- FOUND: `games/tank-1990/src/types.ts`
- FOUND: `games/tank-1990/src/PlayerTank.ts`
- FOUND: `games/tank-1990/test/PlayerTank.test.ts`
- FOUND commit `3547f35`: feat(49-01): define tank types, tier configurations, and player state
- FOUND commit `bef3e5f`: feat(49-01): implement PlayerTank kinematics, snapping, ice slide, and tiers
