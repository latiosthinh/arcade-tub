# Phase 7: Polish & Deploy - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver cross-game polish, Web Audio API procedural sound synthesizer (no external audio files required), hub UI enhancement with live score badges, and production static packaging.
Deliverables:
- Procedural Web Audio SFX in `packages/game-engine/src/AudioSynthesizer.ts`:
  - `playClick()`, `playScore()`, `playBounce()`, `playExplosion()`, `playPowerup()`, `playError()`, `playVictory()`
  - Mute/Unmute toggle preserved in localStorage
  - Integrate sound effects into all 5 games
- Hub Page Enhancement:
  - Display stored personal high scores on each game card
  - "Back to Arcade Hub" navigation button on every game view
  - Keyboard shortcut overlay (press `?` or `H`)
- Bundle Size & Performance:
  - Validate total bundle per game < 200KB gzipped
  - Run full test suite across monorepo

</domain>

<decisions>
## Implementation Decisions

### Procedural Web Audio
- Zero asset downloads — pure OscillatorNode + GainNode frequency envelopes
- `AudioSynthesizer` singleton in `packages/game-engine`

### Cross-Game Navigation
- Every game includes a floating retro "← Hub" button in top-left (or press Escape -> "Return to Hub")

</decisions>

<canonical_refs>
- `packages/game-engine/src/index.ts`
- `packages/playables-adapter/src/index.ts`
</canonical_refs>
