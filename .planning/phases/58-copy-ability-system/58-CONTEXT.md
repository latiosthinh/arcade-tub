# Phase 58: Copy Ability System - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

8 unique copy abilities override Kirby's attack with distinct movesets, animations, and hitboxes via strategy-pattern composition, plus ability drop mechanics.

Covers requirements: ABIL-01, ABIL-02, ABIL-03, ABIL-04, ABIL-05, ABIL-06, ABIL-07, ABIL-08, ABIL-09.
</domain>

<decisions>
## Implementation Decisions

### 1. Ability Interface Contract (Strategy Pattern)
- `interface CopyAbility`:
  - `readonly type: AbilityType` ('sword' | 'fire' | 'ice' | 'beam' | 'cutter' | 'stone' | 'spark' | 'needle')
  - `readonly displayName: string`
  - `readonly hatColor: string`
  - `activate(kirby: KirbyEntity): void` — Called when attack button pressed
  - `update(kirby: KirbyEntity, delta: number): AbilityAttackResult | null` — Per-frame update during attack
  - `render(ctx: CanvasRenderingContext2D, kirby: KirbyEntity, camera: Camera): void` — Draw ability FX (blade, flame, etc.)
  - `renderHat(ctx: CanvasRenderingContext2D, kirby: KirbyEntity, camera: Camera): void` — Draw ability hat on Kirby's head
  - `isAttacking(): boolean`
  - `cancel(): void`
  - `dispose(): void`

### 2. 8 Ability Movesets
1. **Sword (ABIL-01):** Ground: 3-hit combo (Chop → Slash → Final Sword Beam, rapid B taps). Air: 360° spin slash with circular hitbox.
2. **Fire (ABIL-02):** Ground hold: continuous horizontal flame breath (~48px reach) damaging enemies in path. Dash+Attack: Fire Dash / fireball tackle (Kirby engulfs in flame, launches forward 60px with invulnerability).
3. **Ice/Freeze (ABIL-03):** Ground hold: freezing breath cone. Enemies hit freeze into solid Ice Cube blocks. Kirby can kick the ice block as a sliding projectile that bowls over other enemies.
4. **Beam (ABIL-04):** Attack press: whip-like electrical wave sweeping from top-front to bottom-front (~60px arc) hitting airborne and grounded enemies.
5. **Cutter (ABIL-05):** Attack press: launches papercraft Boomerang Cutter projectile that flies forward ~100px then loops back to Kirby. Pierces through enemies.
6. **Stone (ABIL-06):** Attack press: transforms Kirby into heavy cardboard stone block. Falls rapidly with extreme gravity. Invulnerable while in stone form. Deals heavy ground impact shockwave. Press B again or jump to exit.
7. **Spark (ABIL-07):** Hold B or mash D-Pad: surrounds Kirby in expanding spherical electrical field (~32px radius). Continues as long as button is held.
8. **Needle (ABIL-08):** Hold B: sharp paper quills erupt from Kirby in 8 directions (~24px reach). Stationary area denial. Deflects weak enemy projectiles.

### 3. Ability Loss & Ability Star (ABIL-09)
- When Kirby takes damage while holding an ability:
  - The ability is removed from Kirby (`kirby.ability = null`).
  - An `AbilityStar` entity spawns, bouncing away with random upward/sideways velocity.
  - The Ability Star bounces on tiles for ~180 frames (3.0s), flashing faster in the final 1.0s before popping/vanishing.
  - If Kirby inhales the Ability Star and swallows it before it vanishes, he regains the ability.
  - Voluntarily discard: dedicated drop button (Select key or Drop touch button) drops ability as bouncing star.

</decisions>

<code_context>
## Existing Code Insights

- `games/kirby-adventure/src/types.ts`: Extend `AbilityType`, add `CopyAbility` interface, `AbilityAttackResult`, `AbilityStar` entity type.
- `games/kirby-adventure/src/KirbyActions.ts`: Route attack button to active `CopyAbility` if present, fallback to inhale if no ability.
- `games/kirby-adventure/src/KirbyScene.ts`: Wire ability state, render ability hats, handle ability star drop and re-inhale.

</code_context>

<specifics>
## Specific Ideas

- Directory structure: `games/kirby-adventure/src/abilities/` with:
  - `AbilityRegistry.ts` — Factory for creating ability instances by type.
  - `SwordAbility.ts`, `FireAbility.ts`, `IceAbility.ts`, `BeamAbility.ts`, `CutterAbility.ts`, `StoneAbility.ts`, `SparkAbility.ts`, `NeedleAbility.ts`.
  - `AbilityStar.ts` — Bouncing pickup entity.
- Unit test per ability covering activation, frame progression, hitbox output, and cancellation.

</specifics>

<deferred>
## Deferred Ideas

- Enemy binding (which enemy gives which ability) → Phase 59.
- Boss interactions → Phase 60.
- Procedural audio jingles for abilities → Phase 62.

</deferred>
