# Phase 2: Safe Cracker - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a fully playable Safe Cracker clicker/timing minigame in `games/safe-cracker/`.
Mechanics:
- Circular dial / lock tumbler with rotating indicator/pointer
- Target zones appear on the dial:
  - Yellow zone: +1,000 points
  - Blue zone: +1.5s time extension
- Controls:
  - Left-click or Space: Tap/Pick when needle enters highlighted zone
  - Right-click (hold) or Shift: Speed boost for faster rotation
  - Miss penalty: Briefly disables lock pick for 0.4s
  - Escape: Pause menu
- Game loop:
  - 30-second starting timer
  - Every successful pick narrows target zones and increases base speed
  - High score tracked via shared Playables adapter (localStorage fallback)
  - Game over screen with final score, high score, and restart button

</domain>

<decisions>
## Implementation Decisions

### Visual Style
- Dark metallic vault/safe aesthetic (steampunk/cyberpunk neon dial)
- Glowing rotating needle indicator (amber/gold)
- High-contrast target zones (neon yellow for points, cyan for time bonus)
- Particle burst effects on successful picks

### Physics & Timing
- Fixed 60fps loop via shared `GameLoop`
- Needle rotation speed ramps up smoothly: base speed + (score / 3000) * speedFactor
- Hit detection: angle-based angular overlap with target arc

### Code Structure
- `games/safe-cracker/src/Dial.ts` — tumbler geometry, target zones, rotating pointer
- `games/safe-cracker/src/GameState.ts` — score, time remaining, streak, speed multiplier
- `games/safe-cracker/src/SafeCrackerScene.ts` — rendering, input handling, particle effects
- `games/safe-cracker/src/main.ts` — entry point, scene registration

</decisions>

<canonical_refs>
## Canonical References
- `packages/game-engine/src/index.ts` — GameLoop, InputManager, SceneManager
- `packages/playables-adapter/src/index.ts` — score and save APIs
</canonical_refs>

<deferred>
## Deferred Ideas
- Multi-tumbler combination locks (keep single dial for MVP)
- SFX audio synthesis (Phase 7)
</deferred>
