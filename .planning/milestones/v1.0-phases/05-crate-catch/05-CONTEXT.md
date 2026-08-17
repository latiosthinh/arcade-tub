# Phase 5: Crate Catch - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a fully playable Crate Catch catcher/stacking minigame in `games/crate-catch/`.
Mechanics:
- Two-lane platform cart:
  - Yellow lane: Front track
  - Blue lane: Back track
  - Up/Down arrows or W/S: Switch between front and back tracks
  - Left/Right arrows or A/D: Move cart left/right along active track
- Falling Items (fall on matching track):
  - Small Crate: 100 base pts
  - Medium Crate: 150 base pts
  - Large Heavy Crate: 200 base pts
  - Golden Crate: 500 base pts
  - Repair Kit: Restores cart health
  - Magnetic Shield: Prevents stacked crates from falling off when shaken
  - Bombs: Explode upon touching cart/crates, knocking off unbanked crates and dealing cart damage
- Stacking & Banking:
  - Crates land on the cart and stack vertically with physical wobble
  - Stacking crates higher increases the multiplier (1x for 1 crate, 2x for 2, 3x for 3, up to 10x multiplier)
  - Space: **ASSEMBLE / BANK** — instantly banks all currently stacked crates for multiplied score and clears cart for safe new stacks
- Win/Loss Conditions:
  - 3 Lives / Cart Durability bar
  - Losing 5 crates off the screen or health dropping to 0 = Game Over
  - Progressive rounds with faster fall speeds and heavier bomb density

</domain>

<decisions>
## Implementation Decisions

### Aesthetic
- Industrial steampunk factory with glowing conveyor tracks
- Wood & bronze crates with glowing energy bands
- Sparks, smoke, and mechanical gear animations

### Code Structure
- `games/crate-catch/src/Cart.ts` — 2-lane tracking, horizontal physics, balance wobble
- `games/crate-catch/src/FallingItemManager.ts` — spawner, physics falling, crate types, bombs, power-ups
- `games/crate-catch/src/StackPhysics.ts` — vertical stacking, tilt/wobble calculation, banking score math
- `games/crate-catch/src/GameState.ts` — score, multiplier, cart HP, lost crates count, persistence
- `games/crate-catch/src/CrateCatchScene.ts` — scene lifecycle, rendering, input handling, HUD
- `games/crate-catch/src/main.ts` — entry point

</decisions>

<canonical_refs>
- `packages/game-engine/src/index.ts`
- `packages/playables-adapter/src/index.ts`
</canonical_refs>
