# Phase 61: World Map, Stage Data & Progression - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

4 themed worlds with navigable world maps, 20 JSON/TS tilemap stages connected by doors, hidden bonus rooms, and localStorage save/load.

Covers requirements: WRLD-01, WRLD-02, WRLD-03, WRLD-04, WRLD-05, WRLD-06.
</domain>

<decisions>
## Implementation Decisions

### 1. 4 Themed Worlds
1. **World 1: Green Greens (Vegetable Valley):** Lush grassy hills, rolling meadows, tree foliage. Boss: Whispy Woods.
2. **World 2: Ice Cream Island:** Tropical shoreline, palm trees, sandy beaches, floating ice floes. Boss: Kracko.
3. **World 3: Butter Building:** Tower interiors, cardboard mechanical gears, elevated walkways. Boss: King Dedede.
4. **World 4: Orange Ocean:** Sunset sea cliffs, naval vessels, sunset horizons. Final Boss Gauntlet.

### 2. World Map Navigation & Node Graph
- `WorldMapScene`:
  - Displays grid/node map for current world.
  - Nodes: Stage 1, Stage 2, Stage 3, Stage 4, Boss Stage, Bonus Door.
  - Kirby can walk between connected unlocked nodes.
  - Clearing a stage marks the node with a Star and unlocks the next connected path.
  - Clearing all 4 stages unlocks the Boss arena.

### 3. Stage & Room Data Architecture
- `stages/`: TypeScript stage definitions with ASCII tile grids, entity spawns (enemies, food, doors), and theme palettes.
- Multi-room connectivity: Doors specify `targetRoom` and `targetSpawn`.

### 4. Progression & Save System
- `SaveManager`:
  - Persists to `localStorage.getItem('arcade_kirby_save')`.
  - Tracks: `unlockedWorlds: number`, `completedStages: Record<string, boolean>`, `highScore: number`, `completionPercent: number`.

</decisions>

<code_context>
## Existing Code Insights

- `games/kirby-adventure/src/RoomManager.ts`: Room loader, already supports door transitions.
- `games/kirby-adventure/src/TileMap.ts`: ASCII map loader.
- `games/kirby-adventure/src/types.ts`: Add `WorldData`, `StageNode`, `SaveState`.

</code_context>

<specifics>
## Specific Ideas

- Create `src/stages/` with:
  - `World1Stages.ts`, `World2Stages.ts`, `World3Stages.ts`, `World4Stages.ts`.
  - `StageRegistry.ts`.
  - `SaveManager.ts`.
  - `WorldMapScene.ts`.
- Vitest tests covering stage loading, node unlocking, save/load persistence, and completion percentage calculation.

</specifics>
