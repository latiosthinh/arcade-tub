# Phase 65: Dual Weapon Combat, Shuriken Engine & Sword Deflection - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Player can simultaneously throw 8-directional shurikens and execute katana sword slashes that deflect/destroy incoming enemy projectiles, collect power-up scrolls and crystal balls, and handle single-hit kill arcade combat.

Covers requirements: CMBT-01, CMBT-02, CMBT-03, CMBT-04, CMBT-05.
</domain>

<decisions>
## Implementation Decisions

### 1. Dual Weapon Simultaneous Operation
- **Button A (Shuriken):** Rapid-fire paper star projectile traveling in current input direction (8-way vector). Velocity: $480\text{px/s}$. Cooldown: 120ms. Max active player shurikens: 4 on screen.
- **Button B (Sword):** Fast Katana slash arc (160ms duration). Generates 140° frontal melee hitbox (~32px reach). Kills adjacent enemies in one hit.

### 2. Deflection & Parrying Matrix
- While sword slash is active, any intersecting enemy projectile (shuriken, dart, fireball) is canceled.
- Deflected enemy shurikens reverse trajectory into player-owned stars or shatter into paper scraps with a metallic chime.

### 3. Power-Up Pickups
- **Crystal Ball (Red/Blue):** Grants 8 seconds of sparkling invincibility.
- **Ninjutsu Scroll:** Triggers screen-clearing lightning/earthquake spell, instantly eliminating all active enemies on screen.

### 4. Single-Hit Death & Lives Loop
- 1-hit kill on unblocked enemy body contact or incoming projectile.
- 3 starting lives, respawn with 2.0s post-spawn i-frames. Game over on 0 lives.

</decisions>
