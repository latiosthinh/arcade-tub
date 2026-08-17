# Phase 3: Brick Blitz - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a fully playable Brick Blitz breakout minigame in `games/brick-blitz/`.
Mechanics:
- Paddle at bottom: moves with A/D, Left/Right arrows, or mouse drag
- Ball launch: Space or Left-Click launches ball from paddle
- Ball physics:
  - Bounces off left, top, right walls
  - Bottom edge = life loss
  - Bounces off paddle with angle determined by offset from paddle center
  - Bounces off bricks using AABB collision resolution
- Bricks:
  - Standard brick: 1 hit to destroy, 5 points
  - Durable brick: 2-3 hits, 10-15 points
  - Bonus brick (+50 pts): sparkling golden brick
  - +1UP brick: grants +1 extra life on destruction
- Progression:
  - 3 lives to start
  - Multiple levels with increasing brick densities and arrangements
  - Clearing all destructible bricks = +500 points bonus + advances to next level
- UI & Controls:
  - Score, Lives, Level display in top HUD
  - Escape: Pause menu
  - Game over screen with high-score save and restart button

</domain>

<decisions>
## Implementation Decisions

### Aesthetic
- Neon synthwave / retro arcade palette
- Glowing neon bricks (cyan, magenta, yellow, green)
- Ball trail particles and brick shatter debris on hit

### Code Structure
- `games/brick-blitz/src/Ball.ts` — ball position, velocity, trail, radius, launch logic
- `games/brick-blitz/src/Paddle.ts` — width, speed, collision response with ball
- `games/brick-blitz/src/BrickGrid.ts` — level layouts, brick types, AABB intersection
- `games/brick-blitz/src/GameState.ts` — score, lives, current level, high score
- `games/brick-blitz/src/BrickBlitzScene.ts` — scene lifecycle, rendering, input
- `games/brick-blitz/src/main.ts` — entry point

</decisions>

<canonical_refs>
## Canonical References
- `packages/game-engine/src/index.ts`
- `packages/playables-adapter/src/index.ts`
</canonical_refs>
