# Phase 59: Enemy AI & Ability Grants - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

8 distinct enemy types with state-machine AI patrol and attack patterns, each mapped to a copy ability grant on inhale+swallow.

Covers requirements: ENMY-01, ENMY-02, ENMY-03, ENMY-04, ENMY-05, ENMY-06, ENMY-07, ENMY-08.
</domain>

<decisions>
## Implementation Decisions

### 1. Enemy Base Architecture
- `interface EnemyEntity`:
  - `readonly id: string`
  - `readonly type: EnemyType`
  - `readonly abilityGrant: AbilityType | null`
  - `x: number, y: number, width: number, height: number`
  - `velX: number, velY: number, facing: Direction`
  - `hp: number, isDead: boolean, isFrozen: boolean`
  - `update(tileMap: TileMap, player: KirbyEntity, delta: number): EnemyAttackResult | null`
  - `render(ctx: CanvasRenderingContext2D, camera: Camera): void`
  - `takeDamage(amount: number, knockbackDir?: Direction): boolean` (returns true if killed)
  - `canBeInhaled(): boolean`

### 2. 8 Enemy Implementations & AI Behaviors
1. **Waddle Dee (ENMY-01):** Patrol walker. Moves left/right at slow speed (0.75 px/f), turns at ledge edges and walls. No attacks. Grants `null` on copy.
2. **Waddle Doo (ENMY-02):** Beam walker. Patrols like Waddle Dee, stops when player is within line-of-sight (~100px), charges for 0.5s, fires Beam whip arc attack toward player. Grants `'beam'` on copy.
3. **Blade Knight (ENMY-03):** Sword patrol. Armored walker. When player approaches within ~80px, dashes forward and performs sword slash. Takes 2 hits or 1 heavy hit. Grants `'sword'` on copy.
4. **Hot Head (ENMY-04):** Fire spitter. Patrols slowly. Periodically stops, turns toward player, and shoots a traveling fireball projectile (or short flame breath). Grants `'fire'` on copy.
5. **Chilly (ENMY-05):** Snowman freeze aura. Stationary or slow slide. Emits expanding ice crystal aura that freezes or damages player on contact. Grants `'ice'` on copy.
6. **Sparky (ENMY-06):** Electric hopper. Bounces continuously across terrain. Periodically pulses a radial electrical field around itself. Grants `'spark'` on copy.
7. **Sir Kibble (ENMY-07):** Cutter knight. Armored walker with cutter helmet. Throws a returning boomerang cutter blade at player when in horizontal range (~120px). Grants `'cutter'` on copy.
8. **Rocky (ENMY-08):** Stone hopper/crusher. Hops slowly. When player walks beneath or near Rocky on elevated ledge, transforms into heavy stone and slams down. Invulnerable during drop. Grants `'stone'` on copy.

### 3. Enemy Manager & Spawn System
- `EnemyManager`:
  - Manages active enemies in the current room.
  - Spawns enemies from room metadata / ASCII symbols (`'E'` = Waddle Dee, `'B'` = Waddle Doo, `'K'` = Blade Knight, `'H'` = Hot Head, `'C'` = Chilly, `'S'` = Sparky, `'T'` = Sir Kibble, `'R'` = Rocky).
  - Handles enemy-tile collision, enemy-player contact damage, enemy-projectile damage, enemy-inhale capture.
  - Despawns defeated enemies with paper scrap particle bursts and score rewards.

</decisions>

<code_context>
## Existing Code Insights

- `games/kirby-adventure/src/types.ts`: Add `EnemyType`, `EnemyEntity`, `EnemyAttackResult`.
- `games/kirby-adventure/src/KirbyActions.ts`: Connect inhale capture to `EnemyEntity` (pull toward mouth, capture into `MouthContent`).
- `games/kirby-adventure/src/KirbyScene.ts`: Integrate `EnemyManager`, handle player-enemy collisions, damage resolution, ability copy on swallow.

</code_context>

<specifics>
## Specific Ideas

- Directory structure: `games/kirby-adventure/src/enemies/` with:
  - `EnemyBase.ts` — Common movement, gravity, tile collision, and damage logic.
  - `WaddleDee.ts`, `WaddleDoo.ts`, `BladeKnight.ts`, `HotHead.ts`, `Chilly.ts`, `Sparky.ts`, `SirKibble.ts`, `Rocky.ts`.
  - `EnemyManager.ts` — Room entity orchestrator.
- Comprehensive Vitest test suite covering each enemy's AI state transitions, attacks, tile collision, damage handling, and ability grant mapping.

</specifics>

<deferred>
## Deferred Ideas

- Bosses (Whispy Woods, Kracko, Dedede) → Phase 60.
- Full multi-room stage level layout → Phase 61.
- Detailed origami visuals & audio SFX → Phase 62.

</deferred>
