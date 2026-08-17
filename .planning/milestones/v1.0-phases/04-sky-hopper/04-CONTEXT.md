# Phase 4: Sky Hopper - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a fully playable Sky Hopper vertical platformer minigame in `games/sky-hopper/`.
Mechanics:
- Character auto-bounces upward upon landing on solid surfaces
- Horizontal movement: A/D or Left/Right arrow keys (inertia and acceleration)
- Screen wrap: exiting left side enters on the right side and vice-versa
- Platforms:
  - Standard green platform (solid, permanent)
  - Fragile cloud platform (crumbles after 1 bounce)
  - Moving platform (moves left/right)
  - Spring-loaded platform / Bounce pad (launches player 2.5x higher)
- Items & Power-ups:
  - Coil Spring: attached to platforms, gives super bounce
  - Rocket Booster: auto-pilots player upward at high speed for 3 seconds, invincible
- Obstacles:
  - Birds / Jester drones: fly horizontally, lethal on touch, can be stomped from above or shot
  - Floating Spire mines: lethal on touch
  - Balloons: bounce player away forcefully
- Attack:
  - W or Up arrow: Throw projectile (energy dart/shiv) upward to destroy enemies and balloons
- Modes:
  - Story Mode: Climb to reach the mothership/airship at altitude 5,000m to win
  - Infinite Mode: Endless climb, score based on highest altitude reached
- Camera:
  - Smooth vertical scrolling that only moves upward (falling off the bottom of the viewport = game over)

</domain>

<decisions>
## Implementation Decisions

### Aesthetic
- Vibrant neon sky gradient (sunset purple to deep space blue)
- Glowing retro-cyber platform sprites & particle exhausts

### Code Structure
- `games/sky-hopper/src/Player.ts` — physics, gravity, velocity, horizontal wrapping, bounce logic, projectile toss
- `games/sky-hopper/src/PlatformManager.ts` — procedural generation of platforms ahead of camera, recycling bottom platforms
- `games/sky-hopper/src/ObstacleManager.ts` — enemies, flying drones, balloons, projectiles, collision checks
- `games/sky-hopper/src/Camera.ts` — upward-only viewport tracking
- `games/sky-hopper/src/GameState.ts` — altitude, mode (story/infinite), score, win/loss, Playables adapter bridge
- `games/sky-hopper/src/SkyHopperScene.ts` — game loop integration, rendering, particle trails, input
- `games/sky-hopper/src/main.ts` — entry point

</decisions>

<canonical_refs>
- `packages/game-engine/src/index.ts`
- `packages/playables-adapter/src/index.ts`
</canonical_refs>
