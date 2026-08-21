# Phase 60: Boss Encounters - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

3 multi-phase bosses with HP bars, telegraphed attack patterns, vulnerability windows, and defeat sequences.

Covers requirements: BOSS-01, BOSS-02, BOSS-03.
</domain>

<decisions>
## Implementation Decisions

### 1. Boss Architecture
- `abstract class BossBase`:
  - `name: string`
  - `hp: number, maxHp: number`
  - `x: number, y: number, width: number, height: number`
  - `phase: number` (1, 2, or 3 based on HP thresholds)
  - `isDefeated: boolean, isInvulnerable: boolean`
  - `update(dt: number, playerBounds: Rect, tileMap: TileMap): BossAttackResult | null`
  - `takeDamage(amount: number): boolean`
  - `render(ctx: CanvasRenderingContext2D, camera: Camera): void`

### 2. 3 Boss Encounters
1. **Whispy Woods (BOSS-01):**
   - World 1 Boss. Stationary apple tree at right side of arena.
   - HP: 10.
   - Attacks:
     - Apple Drop: Shakes leaves (telegraph), drops 2-3 apples that bounce. Kirby can inhale apples and spit them back for 3 damage.
     - Air Puff: Inhales and blows large air bullets horizontally across bottom of arena. Kirby must jump or duck.
   - Phase 2 (HP <= 5): Shakes faster, drops roots from ground, blows double air puffs.

2. **Kracko (BOSS-02):**
   - World 2 Boss. Aerial spiked cycloptic cloud.
   - HP: 12.
   - Attacks:
     - Lightning Strike: Charges eye (telegraph), fires vertical lightning bolts straight down.
     - Rain Beam: Sweeps across top of screen dropping rain drops.
     - Swoop: Dives in parabolic arc across bottom of arena.
     - Spawns Waddle Doo enemy drops that player can inhale for Beam ability.
   - Phase 2 (HP <= 6): Faster movement, multi-lightning strike.

3. **King Dedede (BOSS-03):**
   - World 3/4 Boss. Penguin king with giant hammer.
   - HP: 16.
   - Attacks:
     - Hammer Swing: Wind-up, heavy forward hammer slam with ground spark shockwave.
     - Super Jump: Jumps high off-screen, slams down with massive shockwaves on both sides.
     - Inhale: Opens mouth and inhales toward player (pulls Kirby in, must run away).
     - Hover Float: Inflates and floats across arena, exhales air bullet.
   - Phase 2 (HP <= 8): Faster charge speed, triple hammer combo, larger shockwaves.

</decisions>

<code_context>
## Existing Code Insights

- `games/kirby-adventure/src/types.ts`: Add `BossType`, `BossAttackResult`.
- `games/kirby-adventure/src/Projectile.ts`: Bosses spawn projectiles (apples, lightning, shockwaves).
- `games/kirby-adventure/src/KirbyScene.ts`: Wire Boss HUD (bottom boss HP bar), arena bounds locking, victory dance sequence.

</code_context>

<specifics>
## Specific Ideas

- Directory structure: `games/kirby-adventure/src/bosses/` with:
  - `BossBase.ts`
  - `WhispyWoods.ts`
  - `Kracko.ts`
  - `KingDedede.ts`
  - `BossManager.ts`
- Vitest tests covering boss HP transitions, attack timers, telegraph phases, and defeat state.

</specifics>
