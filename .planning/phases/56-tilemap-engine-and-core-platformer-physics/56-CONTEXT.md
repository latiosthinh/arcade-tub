# Phase 56: Tilemap Engine & Core Platformer Physics - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Player can walk, run, jump, and dash through scrollable tile-based levels with solid AABB collision, one-way platforms, and room transitions via doors.

Covers requirements: PHYS-01, PHYS-02, PHYS-03, PHYS-04, PHYS-05, PHYS-06.
</domain>

<decisions>
## Implementation Decisions

### 1. Physics & Collision Architecture
- **Axis-Separated Sweep Collision:** Resolve X-axis collision, then Y-axis collision independently to prevent corner-catching bugs (universal 2D platformer trap).
- **Sub-Pixel Movement:** Store entity positions and velocities as floating-point numbers; round to integer pixels at render time to prevent visual jitter.
- **Tile Size:** 16×16 pixel logical tiles, rendered at 2× or scale-to-fit on canvas (matching NES resolution scale).
- **One-Way Platforms:** Collision only checked when entity is falling (velY > 0) AND entity's previous bottom was above or at platform top (prevY + height <= platformY).

### 2. Player Controls & Kinematics
- **Movement Parameters:** Walk speed ~2.0 px/frame, Dash speed ~3.2 px/frame (1.6×), Jump velocity ~-5.5 px/frame, Gravity ~0.25 px/frame², Terminal velocity ~6.0 px/frame.
- **Variable Jump Height:** Releasing Jump button early cuts upward velocity (if velY < -2.0, set velY = -2.0) for responsive short hops.
- **Coyote Time:** ~4-6 frames (80-100ms) after walking off a ledge where jump is still allowed.
- **Jump Buffering:** ~4-6 frames before landing where pressing jump buffers the jump action.
- **Dash Trigger:** Double-tap left or right within ~12 frames (200ms) activates dash state until stopped or turned.

### 3. Camera System
- **Deadzone Follow:** Camera follows Kirby horizontally with a deadzone box (~40px wide). Camera only moves when Kirby exits the deadzone.
- **Look-Ahead:** Small offset in the direction Kirby is facing (+16px forward).
- **Boundary Clamping:** Camera X is clamped to `[0, roomWidth - viewportWidth]`, Camera Y clamped to `[0, roomHeight - viewportHeight]`.
- **Viewport Size:** Standard 256×240 (NES aspect) or responsive 16:9 box centered with letterboxing.

### 4. Room & Door Transition System
- **Room Structure:** Each room is a standalone tilemap with dimensions, tile array, door list, and spawn points.
- **Door Entities:** Positioned on tilemap with target room ID and target spawn point.
- **Transition Flow:** Player stands in front of door + presses Up → fade-out (0.2s) → load target room → place Kirby at target spawn → fade-in (0.2s) → resume input.

</decisions>

<code_context>
## Existing Code Insights

- `packages/game-engine/src/GameLoop.ts`: Fixed 60fps loop with accumulator. Store float physics, round at render.
- `packages/game-engine/src/InputManager.ts`: Keyboard tracking (`isDown`, `justPressed`).
- `games/tank-1990/`: GridMap and sub-stepping collision patterns, standalone game structure.
- `games/dino-runner/`: Gravity and jump baseline reference.
- `games/sky-hopper/`: Platform landing baseline reference.

</code_context>

<specifics>
## Specific Ideas

- Standalone directory: `games/kirby-adventure/` with standard structure: `main.ts`, `KirbyScene.ts`, `physics/`, `tilemap/`, `camera/`.
- Level data in TypeScript arrays/objects for fast compilation and type safety (same pattern as tank-1990 stages).
- Test suite in `games/kirby-adventure/test/` covering physics, tile collision, one-way platforms, coyote time, and camera clamping.

</specifics>

<deferred>
## Deferred Ideas

- Inhale, copy abilities, enemies, bosses → subsequent phases (57-60).
- Parallax backgrounds and papercraft shaders → Phase 62.
- Mobile virtual controls → Phase 63.

</deferred>
