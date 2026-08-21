# Phase 66: Enemy AI Hierarchy, Wave Spawner & Boss Encounters - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Continuous waves of 4 distinct ninja/monk enemy types and the Yukinosuke Sorcerer boss challenge the player from all directions.

Covers requirements: ENMY-01, ENMY-02, ENMY-03, ENMY-04, ENMY-05, ENMY-06.
</domain>

<decisions>
## Implementation Decisions

### 1. Enemy Archetypes
1. **Red Ninja (ENMY-01):** Ground patrol runner (speed $120\text{px/s}$) with short forward leaps toward player. Dies in 1 hit.
2. **Blue Ninja (ENMY-02):** Agile canopy leaper. Leaps between branches and throws shurikens at player when within $180\text{px}$.
3. **White Ninja (ENMY-03):** Shadow leaper with high smoke leaps and 3-way shuriken spread attacks.
4. **Fire Monk (ENMY-04):** Ground-based monk that breathes streams of fire or throws flame projectiles ($200\text{px/s}$).
5. **Sorcerer / Yukinosuke Boss (ENMY-05):** Multi-phase boss (HP: 8). Teleports across chamber and casts tracking magic orbs.

### 2. Wave Spawner System (ENMY-06)
- Spawns enemies from off-screen top, left, and right buffers based on stage progression and kill count.
- Maximum 6 concurrent active enemies on screen to maintain clean 60 FPS performance.

</decisions>
