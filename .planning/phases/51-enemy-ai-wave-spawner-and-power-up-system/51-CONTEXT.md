# Phase 51: Enemy AI, Wave Spawner & Power-Up System - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning
**Mode:** Auto-generated context

<domain>
## Phase Boundary
Manage 20-tank wave queue with 4 distinct enemy archetypes, goal-oriented grid-node steering AI, flashing bonus tank drops, 8 tactical powerup items, and base fortification timers.
Requirements: ENEMY-01, ENEMY-02, ENEMY-03, ENEMY-04, ENEMY-05, ENEMY-06.
</domain>

<decisions>
## Implementation Decisions
- EnemyTank class with 4 archetypes: BASIC (slow, 100pts), FAST (high speed, 200pts), POWER (fast bullets, 300pts), ARMOR (4 hp, color degradation green->yellow->orange->white, 400pts).
- EnemySpawner managing 20-tank wave list, 3 top spawn portals, max 4 concurrent active enemies, and flashing bonus flags on 4th, 11th, 18th spawns.
- Grid-node steering AI: decision points at integer tile alignment with goal-bias toward player / base HQ and anti-180deg oscillation turn locks.
- PowerUpSystem managing 8 powerups: STAR, SHOVEL (steel HQ base for 20s with terrain state caching), GRENADE (destroy all screen enemies), CLOCK (freeze enemies 10s), HELMET (invulnerability shield 10s), TANK (+1 extra life), GUN (instant Tier 4 upgrade), BOAT (pass water).
- 100% Vitest unit test coverage.
</decisions>
