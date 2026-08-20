# Phase 49: Player Tank Kinematics & Upgrade Tiers - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning
**Mode:** Auto-generated context

<domain>
## Phase Boundary
User can steer player tank with smooth corridor auto-alignment snapping, progress through 4 upgrade tiers, gain extra lives, and trigger invulnerability shield bubbles on spawn.
Requirements: TANK-01, TANK-02, TANK-03, TANK-04.
</domain>

<decisions>
## Implementation Decisions
- PlayerTank controller managing (x, y), orientation (0=UP, 1=RIGHT, 2=DOWN, 3=LEFT), speed, bounding box (28x28 or 30x30 inside 32x32 cell).
- Orthogonal corner auto-alignment snapping (<= 4px) when changing direction at corridor intersections.
- Ice sliding physics: inertia drift deceleration when navigating over ICE tiles.
- 4 Upgrade tiers: TIER_1 (Basic slow single bullet), TIER_2 (Speed Tank), TIER_3 (Heavy dual bullet), TIER_4 (Armor-piercing high velocity, demolishes Steel & Trees).
- Shield state timer and respawn lifecycle.
- Zero DOM/Canvas dependencies for logic; 100% Vitest unit test coverage.
</decisions>
