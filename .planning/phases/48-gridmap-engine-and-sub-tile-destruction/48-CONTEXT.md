# Phase 48: GridMap Engine & Sub-Tile Destruction - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning
**Mode:** Auto-generated context

<domain>
## Phase Boundary
System maintains 26×26 microgrid world representation, sub-tile brick chipping bitmasks, terrain modifiers (water, trees, ice), defensible Eagle HQ, and stage loader for 35 campaign maps.
Requirements: GRID-01, GRID-02, GRID-03, GRID-04, GRID-05, GRID-06, GRID-07.
</domain>

<decisions>
## Implementation Decisions
- 26×26 microgrid (16×16px cells on 416×416 arena).
- Tile types: EMPTY=0, BRICK=1, STEEL=2, WATER=3, TREES=4, ICE=5, EAGLE=6.
- 4-quadrant sub-tile destruction bitmasks: 0b1111 (full) down to 0b0000 (destroyed).
- Pure logic decoupled into `games/tank-1990/src/GridMap.ts` and `games/tank-1990/src/stages.ts`.
- 100% Vitest unit test coverage.
</decisions>
