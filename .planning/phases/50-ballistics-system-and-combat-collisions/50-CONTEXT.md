# Phase 50: Ballistics System & Combat Collisions - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning
**Mode:** Auto-generated context

<domain>
## Phase Boundary
Simulate high-velocity projectiles with continuous sub-stepping collision sweep, mid-air bullet cancellation, tier-dependent terrain destruction, and enemy damage resolution.
Requirements: COMBAT-01, COMBAT-02, COMBAT-03, COMBAT-04.
</domain>

<decisions>
## Implementation Decisions
- Projectile pool / manager handling active player & enemy bullets.
- 120Hz sub-stepping / ray-segment sweep to prevent bullet tunneling.
- Mid-air bullet-vs-bullet cancellation: colliding opposing bullets destroy each other and spawn spark particle trigger.
- Tier-dependent terrain damage: standard bullets chip 1-2 quadrants of brick; Tier 4 armor-piercing bullets destroy steel tiles (or reduce 4 quadrants of steel to empty) and clear tree canopy tiles.
- Damage resolution on tanks (shield check, hit point deduction, armor flash).
- 100% Vitest unit test coverage.
</decisions>
