# Phase 6: Type Strike - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a fully playable Type Strike typing defense minigame in `games/type-strike/`.
Mechanics:
- Defense layout:
  - Base/Defender on left edge of the screen
  - Automatons/Cyber Drones advance steadily from right to left in multiple lanes
- Typing mechanics:
  - Each enemy displays a prompt word above its head
  - Keystroke matching:
    - Typing the first letter of an enemy's word "targets" that enemy (locks focus)
    - Subsequent correct letters advance the typed progress (highlighting matched letters in green)
    - Completing the word destroys the enemy with an explosion effect and awards points
    - Failing a word or pressing an invalid key resets streak multiplier to 1x
  - Word length & tier scaling:
    - Short words (3-4 letters): 100 pts
    - Medium words (5-7 letters): 250 pts
    - Long tech words (8+ letters): 500 pts
  - Streak multiplier:
    - +1x multiplier per consecutive correct word destroyed (max 8x multiplier)
    - Any incorrect key during an active lock resets multiplier to 1x
- Game duration & Win/Loss:
  - 60-second survival round
  - 3 Base Shields (lives): If an enemy reaches the left base boundary, 1 shield is lost and the enemy self-destructs
  - Game over if all 3 shields lost or 60s timer expires
  - Final score saved to Playables adapter / localStorage

</domain>

<decisions>
## Implementation Decisions

### Aesthetic
- Cyberpunk command center terminal (matrix green, cyan, neon red)
- Laser beam strikes from defender to targeted enemy as letters are typed
- CRT scanline overlay, explosion particles on enemy defeat

### Dictionary & Vocabulary
- Tech, arcade, and gaming vocabulary (e.g. `BYTE`, `CODE`, `TURBO`, `CYBER`, `MATRIX`, `PIXEL`, `QUANTUM`, `OVERLOAD`, `PROTOCOL`, `SYNTHESIS`)

### Code Structure
- `games/type-strike/src/Dictionary.ts` — curated word tiers, random selector avoiding duplicate active words
- `games/type-strike/src/Enemy.ts` — position, speed, lane, word string, matched character index
- `games/type-strike/src/TypingEngine.ts` — keystroke routing, target locking, prefix matching, streak tracking
- `games/type-strike/src/GameState.ts` — round timer, score, streak multiplier, base shields, high scores
- `games/type-strike/src/TypeStrikeScene.ts` — scene lifecycle, laser render, CRT scanlines, particle bursts
- `games/type-strike/src/main.ts` — entry point

</decisions>

<canonical_refs>
- `packages/game-engine/src/index.ts`
- `packages/playables-adapter/src/index.ts`
</canonical_refs>
