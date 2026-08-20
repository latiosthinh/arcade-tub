# Architecture Patterns: Tank 1990 (Battle City) Retro Papercraft Arcade

**Domain:** 2D Top-Down Grid Tactical Action / Arcade Game
**Scope:** Standalone game package `games/tank-1990/` integrated into ArcadeTub hub
**Researched:** 2026-08-20
**Overall Confidence:** HIGH (verified against workspace conventions, existing mini-games, and game-engine / playables-adapter architecture)

---

## 1. System Integration & Workspace Architecture

Tank 1990 conforms to ArcadeTub's zero-dependency, modular game architecture.

### Directory Structure

```
YoutubeGames/
├── packages/
│   ├── game-engine/          # Core GameLoop, AudioSynthesizer, InputManager
│   └── playables-adapter/    # Hub storage & lifecycle (loadData/saveData, pause/resume)
├── src/data/games.ts         # Central catalog registration (slug: 'tank-1990')
└── games/
    └── tank-1990/
        ├── index.html        # Entry HTML, canvas setup, viewport styling
        ├── package.json      # Workspace package configuration
        ├── tsconfig.json     # TypeScript project reference
        ├── src/
        │   ├── main.ts               # App entrypoint (GameLoop & Playables wiring)
        │   ├── Tank1990Scene.ts      # Orchestrator Scene implementing GameScene
        │   ├── GameState.ts          # Pure state machine (scores, lives, stage, status)
        │   ├── GridMap.ts            # 13x13 / 26x26 tile grid, destructible sub-tiles
        │   ├── TankController.ts     # Player & base tank physics, 4 upgrade tiers
        │   ├── EnemySpawner.ts       # Wave generator, AI pathing, enemy types
        │   ├── BulletManager.ts      # Ballistics, collision detection, bullet cancellation
        │   ├── PowerUpSystem.ts      # Spawn drops, timers, active powerup modifiers
        │   ├── TouchControls.ts      # On-screen 4-way D-pad & Fire virtual controls
        │   ├── TankAudio.ts          # Procedural 8-bit Web Audio synthesizer
        │   ├── TankRenderer.ts       # Tactile papercraft Canvas 2D renderer
        │   └── Particles.ts          # Paper confetti bursts, smoke, muzzle flash
        └── test/
            ├── gridmap.test.ts
            ├── tank.test.ts
            ├── bullets.test.ts
            ├── enemy-spawner.test.ts
            ├── powerups.test.ts
            └── gamestate.test.ts
```

---

## 2. Component Boundaries & Responsibilities

Clean separation between pure deterministic simulation logic and rendering/audio guarantees 100% testability with Vitest.

| Component | Pure Logic vs I/O | Primary Responsibilities | Communicates With |
|---|---|---|---|
| **Tank1990Scene** | Orchestrator | Glues subsystems together, implements `GameScene` interface (`update(dt)`, `render(ctx)`, `resize()`), wires lifecycle | GameLoop, Playables, all subsystems |
| **GameState** | Pure Logic | Stage tracker, lives count, kill tallies, high score persistence (`localStorage`), victory/defeat transitions | Tank1990Scene, TankRenderer |
| **GridMap** | Pure Logic | 26x26 sub-tile collision grid (Brick, Steel, Water, Grass/Forest, Ice, Eagle HQ). Handles micro-chipping of bricks and steel destruction | TankController, BulletManager, TankRenderer |
| **TankController** | Pure Logic | Player tank kinematics, tier 1-4 stats, grid snap/alignment, slide physics on Ice, direction changes, invulnerability timer | GridMap, BulletManager, PowerUpSystem |
| **EnemySpawner** | Pure Logic | Stage enemy queue (20 tanks per stage: Basic, Fast, Power, Armor), spawn timers, randomized directional AI with line-of-sight targeting | GridMap, BulletManager, PowerUpSystem |
| **BulletManager** | Pure Logic | Active bullets array, speed calculation, bullet-bullet cancellation, tile collision triggers, base eagle hit detection | GridMap, TankController, EnemySpawner, Particles |
| **PowerUpSystem** | Pure Logic | Power-up spawn logic (Star, Shovel, Grenade, Clock, Helmet, Tank), active power-up timers (freeze, base steel fortification) | GridMap, TankController, EnemySpawner, GameState |
| **TouchControls** | DOM / Input | Virtual 4-way D-Pad + Fire button for touchscreens with multi-touch pointer tracking | Tank1990Scene, TankController |
| **TankAudio** | Web Audio (I/O) | Zero external assets. Procedural chiptune sfx: tank engine hum, shot pop, brick crumble, explosion, power-up jingle, eagle destroyed alert | Tank1990Scene |
| **TankRenderer** | Canvas 2D (I/O) | Papercraft visual styling, cardboard cutouts, drop shadows, rolling tracks, grass overlay layer, HUD banner, score tally screen | GridMap, TankController, EnemySpawner, BulletManager, Particles |
| **Particles** | Logic + Canvas | Confetti bursts, paper scrap explosions, muzzle sparks, smoke trails | TankRenderer, Tank1990Scene |

---

## 3. Data Flow

```
[User Input] (Keyboard / Virtual D-Pad / Touch Fire)
         │
         ▼
[Tank1990Scene.handleInput()] ──► [TankController.setIntent(direction, fire)]
         │
         ▼ (Fixed / Dynamic Delta Time loop)
[Tank1990Scene.update(dt)]
  ├─► [PowerUpSystem.update(dt)] ── (Ticks timers: Freeze, Fortification, Buffs)
  ├─► [TankController.update(dt, GridMap)] ── (Grid align, ice slide, bounds check)
  ├─► [EnemySpawner.update(dt, GridMap, playerPos)] ── (AI decision trees, spawns)
  ├─► [BulletManager.update(dt, GridMap, tanks, eagle)] ── (Moves, checks hitboxes)
  │      ├─► Bullet vs Bullet cancellation
  │      ├─► Bullet vs Tile (degrade Brick / destroy Steel if Tier 4)
  │      ├─► Bullet vs Enemy / Player (apply damage / drop powerup)
  │      └─► Bullet vs Eagle HQ (trigger gameover if hit)
  ├─► [GameState.update(dt)] ── (Win/loss conditions, stage transition check)
  ├─► [Particles.update(dt)]
  └─► [TankAudio] (Triggers queued audio events: shoot, hit, explode, powerup)
         │
         ▼
[Tank1990Scene.render(ctx)]
  ├─► [TankRenderer.renderBackground()] (Paper cutting mat / parchment)
  ├─► [TankRenderer.renderBaseTiles(GridMap)] (Bricks, Steel, Water, Ice, Eagle)
  ├─► [TankRenderer.renderPowerUps(PowerUpSystem)]
  ├─► [TankRenderer.renderTanks(Player & Enemies)] (Papercraft cutout styling)
  ├─► [TankRenderer.renderBullets(BulletManager)]
  ├─► [TankRenderer.renderOverlays(GridMap)] (Grass / Forest top occlusion layer)
  ├─► [TankRenderer.renderParticles(Particles)]
  ├─► [TankRenderer.renderHUD(GameState, remainingEnemies)]
  └─► [TouchControls.render(ctx)] (If touch mode active)
```

---

## 4. Key Patterns & Implementation Details

### Pattern 1: Sub-Tile Destruction Matrix (26x26 Micro-Grid)
**What:** Standard Battle City uses 13x13 macro-tiles (each containing 2x2 sub-tiles = 26x26 grid of 16x16px units on 416x416 field). Each brick macro-tile is broken down into 4 quadrants allowing bullets to carve corridors.
**Why:** Authentic retro gameplay feel; tanks require a 2x2 sub-tile clearance to pass.

```typescript
export const enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  GRASS = 4,
  ICE = 5,
  EAGLE = 6,
  EAGLE_DESTROYED = 7
}

export class GridMap {
  public static readonly COLS = 26;
  public static readonly ROWS = 26;
  public static readonly TILE_SIZE = 16; // 416x416 playfield

  private grid: Uint8Array;

  constructor() {
    this.grid = new Uint8Array(GridMap.COLS * GridMap.ROWS);
  }

  public getTile(col: number, row: number): TileType {
    if (col < 0 || col >= GridMap.COLS || row < 0 || row >= GridMap.ROWS) return TileType.STEEL;
    return this.grid[row * GridMap.COLS + col];
  }

  public damageTile(col: number, row: number, canDestroySteel: boolean): boolean {
    const tile = this.getTile(col, row);
    if (tile === TileType.BRICK) {
      this.grid[row * GridMap.COLS + col] = TileType.EMPTY;
      return true;
    }
    if (tile === TileType.STEEL && canDestroySteel) {
      this.grid[row * GridMap.COLS + col] = TileType.EMPTY;
      return true;
    }
    return false;
  }
}
```

### Pattern 2: Smooth Grid Alignment & Cornering
**What:** Tanks move freely in 4 cardinal directions, but when changing axis (e.g. Horizontal to Vertical), tank position automatically snaps/drifts to the nearest half-tile axis.
**Why:** Prevents getting stuck on 1-pixel corners in narrow 2-tile corridors.

```typescript
export function alignToAxis(pos: number, tileSize: number, snapThreshold = 4): number {
  const rem = pos % tileSize;
  if (rem < snapThreshold) return pos - rem;
  if (rem > tileSize - snapThreshold) return pos + (tileSize - rem);
  return pos;
}
```

### Pattern 3: Top-Layer Camo Occlusion
**What:** Grass/Forest tiles do not block bullets or tanks, but they must render *above* tanks, bullets, and power-ups.
**Why:** The renderer executes a multi-pass pass:
1. Pass 1: Ground tiles (Dirt, Ice, Water, Bricks, Steel, Eagle).
2. Pass 2: Entities (Power-ups, Tanks, Bullets, Shadows).
3. Pass 3: Canopy tiles (Grass / Trees).
4. Pass 4: Foreground particles, HUD, Overlays.

### Pattern 4: Papercraft Visual Filter Pipeline
**What:** Procedural cardboard aesthetic without heavy sprite textures.
**Implementation:**
- Soft offset drop-shadows on tanks (`shadowColor = 'rgba(40, 20, 10, 0.35)'`, `shadowBlur = 4`, `shadowOffsetY = 3`).
- Fiber grain and corrugated paper creases drawn via stroke math.
- Destructible bricks split with jagged craft cuts.
- Explosions produce rotating angular cardboard confetti chips.

---

## 5. Anti-Patterns to Avoid

| Anti-Pattern | Consequence | Correct Approach |
|---|---|---|
| **Physics coupled to Canvas** | Untestable logic, broken simulations under frame drops. | Pure TypeScript classes with zero Canvas/DOM references in `GridMap`, `TankController`, `BulletManager`. |
| **Float-only bounding box collision** | Tanks slip through sub-tile gaps or get wedged at corners. | Dual representation: Continuous `(x, y)` position with AABB checked against quantized 26x26 tile grid. |
| **External audio asset loading** | Increases bundle size, creates network latency/CORS risks. | Procedural Web Audio synthesis using `AudioSynthesizer` or custom Web Audio Oscillator nodes. |
| **Single-layer rendering** | Tanks appear on top of trees/grass, ruining ambush mechanics. | Explicit 2-pass terrain rendering (Ground layer then Foliage canopy layer). |
| **Monolithic Scene class** | Unmaintainable 2000+ line files. | Delegate strictly to dedicated managers (`BulletManager`, `EnemySpawner`, `GridMap`, `TankRenderer`). |

---

## 6. Build Order & Phase Roadmap Recommendations

1. **Phase 1: GridMap & Terrain Destruction Engine**
   - 26x26 grid data structure, tile types, sub-tile damage/carving math, stage level loader, unit tests.
2. **Phase 2: Player Tank Kinematics & Upgrade Tiers**
   - 4-way movement, grid corner auto-alignment, ice sliding, tier 1-4 stats, invulnerability shields.
3. **Phase 3: Ballistics & Combat System**
   - BulletManager, bullet-bullet cancellation, tile penetration, muzzle flash, damage calculation.
4. **Phase 4: Enemy AI & Wave Spawner**
   - Wave queue (20 tanks), 4 enemy types, direction decision algorithm, power tank flashing.
5. **Phase 5: Power-Up System & Base Defense**
   - Drops (Star, Shovel, Grenade, Clock, Helmet, Tank), fortification timers, Eagle HQ defense state.
6. **Phase 6: Papercraft Canvas Renderer & Visual FX**
   - Cardboard cutout drawing, multi-layer rendering (grass canopy), confetti particles, screen shake.
7. **Phase 7: Web Audio Synthesis & SFX**
   - Procedural 8-bit chiptune sound effects (engine hum, shot pop, explosions, jingles).
8. **Phase 8: Virtual Touch Controls & Mobile Responsive Viewport**
   - Responsive canvas scaling (416x416 native aspect), on-screen 4-way D-Pad + Fire button.
9. **Phase 9: Hub Catalog Integration, E2E & Final Polish**
   - Add to `src/data/games.ts`, Vite multi-page build test, Playwright E2E verification.
