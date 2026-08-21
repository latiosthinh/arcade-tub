# Phase 57: Kirby Core Mechanics & Health System - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Player can inhale enemies, spit stars, swallow to trigger copy, float with puffs, slide attack, and take/heal damage with lives and invincibility frames.

Covers requirements: KRBY-01, KRBY-02, KRBY-03, KRBY-04, KRBY-05, HLTH-01, HLTH-02, HLTH-03.
</domain>

<decisions>
## Implementation Decisions

### 1. Inhale & Capture System
- **Suction Cone:** Triangular/trapezoidal hitbox in front of Kirby (~60px wide, ~120px reach). Active while holding Attack (B) key.
- **Suction Force:** Entities inside the cone (enemies, stars, food) get pulled toward Kirby's mouth at accelerating speed (~2-5 px/frame). Solid wall tiles block suction rays.
- **Mouth Full State:** When an entity reaches Kirby's mouth, it enters the mouth-full state (`MouthContent`). Kirby expands visually, movement speed reduced to 0.75x, jump height slightly lower. Cannot inhale another entity.
- **Spit Star:** Pressing Attack (B) while mouth full spits the content as a star projectile traveling horizontally at high speed (~6 px/frame). Star damages enemies on contact, bounces off solid tiles up to 3 times, then vanishes.
- **Swallow:** Pressing Down while mouth full swallows the content. If content has an `abilityGrant` field (e.g., `'sword'`), triggers copy ability grant event. If food, restores HP. If normal enemy with no ability, swallowed for points.

### 2. Float & Air Bullet
- **Multi-Jump Float:** Pressing Up/Jump while airborne inflates Kirby into float state. Up to 6 puffs max. Each puff gives an upward impulse (~-3.0 px/frame). While floating, gravity is reduced (~0.08 px/frame²), descent speed is slow (~1.0 px/frame).
- **Air Bullet Exhale:** Pressing Attack (B) while floating exhales Kirby back to normal state, firing an air puff projectile downward/forward. The air puff travels short distance (~40px) and damages weak enemies.

### 3. Slide Attack
- **Input:** Press Down + Attack (or Down + Jump) while grounded.
- **Mechanics:** Kirby slides horizontally forward in current facing direction at high speed (~4.0 px/frame) for ~18 frames (0.3s).
- **Hitbox:** Hitbox height is cut in half (from 16px to 8px), allowing Kirby to pass under low 1-tile gaps. Deals damage to enemies in path.

### 4. Health & Lives System
- **HP Structure:** 6 HP segments (maximum 6). Regular enemy contact deals 1-2 damage. Spikes/hazards deal 2 damage. Bottomless pits cause instant life loss.
- **Healing:** Food items restore 1-2 HP. Maxim Tomato fully restores all 6 HP.
- **Lives:** Player starts with 3 lives. 1-Up item awards +1 life. On life loss, player respawns at the current room's entrance with full HP and default normal state. 0 lives triggers Game Over screen with continue prompt.
- **Invincibility Frames (i-frames):** Taking damage triggers ~90 frames (1.5s) of invulnerability. Kirby's sprite flashes/blinks (alpha oscillation). Contact with enemies during i-frames deals no damage. Kirby gets a small knockback impulse (~-2 px horizontal, -3 px vertical).

</decisions>

<code_context>
## Existing Code Insights

- `games/kirby-adventure/src/types.ts`: Core types, add `MouthContent`, `HealthState`, `Projectile`, `InhaleCone`.
- `games/kirby-adventure/src/KirbyPhysics.ts`: Physics update, integrate float gravity modification, slide hitbox modification, and knockback velocity.
- `games/kirby-adventure/src/KirbyScene.ts`: Scene orchestrator, wire inhale cone rendering, projectile updates, damage resolution, and health HUD.

</code_context>

<specifics>
## Specific Ideas

- Modular entities: `InhaleSystem.ts`, `ProjectileManager.ts`, `HealthSystem.ts`.
- Integrate seamlessly with existing `KirbyPhysics.ts` and `TileMap.ts` from Phase 56.
- Comprehensive Vitest tests covering inhale cone detection, swallow/spit, float puff counter, slide attack, health damage/healing, and i-frame timing.

</specifics>

<deferred>
## Deferred Ideas

- Concrete copy ability movesets (Sword slash, Fire dash, etc.) → Phase 58.
- Specific enemy classes (Waddle Dee, Blade Knight, etc.) → Phase 59.
- Boss damage and attacks → Phase 60.

</deferred>
