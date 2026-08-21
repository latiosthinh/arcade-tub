# Phase 67: 4-Stage Progression, Seasonal Loop & Cutscenes - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Complete 4-stage game loop that advances through 4 seasonal variations upon rescuing Princess Kiri.

Covers requirements: STAG-01, STAG-02, STAG-03, STAG-04, STAG-05, STAG-06.
</domain>

<decisions>
## Implementation Decisions

### 1. 4-Stage Architecture
- **Stage 1 (Bamboo Forest):** Vertical/horizontal scrolling hybrid through tall tree canopies ($1200\text{px} \times 800\text{px}$). Clear condition: kill 8 ninjas or reach eastern forest shrine.
- **Stage 2 (Castle Moat):** Stone wall climbing over water moat hazard. Clear condition: scale the castle parapet.
- **Stage 3 (Castle Interior):** Indoor stairs and corridors with close-quarters combat. Clear condition: defeat interior guards.
- **Stage 4 (Boss Chamber):** Boss chamber duel against Sorcerer Yukinosuke. Defeat boss to rescue Princess Kiri.

### 2. 4-Season Cycle Loop (STAG-05)
- Completing Stage 4 triggers Princess Kiri rescue cutscene, then advances season index:
  1. **Spring (Loop 1):** Cherry blossoms (sakura pink), lush mint trees.
  2. **Summer (Loop 2):** Deep forest green, golden sunlight, faster enemy spawn speed.
  3. **Autumn (Loop 3):** Crimson maple leaves, amber foliage, fire monk density increase.
  4. **Winter (Loop 4):** White paper snowflakes, frosted slate castle, elite white ninjas.

### 3. Save & High Score Persistence (STAG-06)
- Persists loop count, personal best score, and highest stage reached to `localStorage`.

</decisions>
