# Phase 62: Papercraft Visuals & Procedural Audio - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Cardboard Kirby with squash-stretch, origami enemies, corrugated terrain tiles, parallax backgrounds, confetti particles, ability hat visuals, and procedural Web Audio SFX/music — zero external assets.

Covers requirements: VISL-01, VISL-02, VISL-03, VISL-04, VISL-05, VISL-06, AUDI-01, AUDI-02.
</domain>

<decisions>
## Implementation Decisions

### 1. Papercraft Canvas 2D Renderer (`KirbyRenderer.ts`)
- **Cardboard Kirby:** Rendered procedurally with pink radial cardboard gradient, drop shadow underneath, dark ink outline, and squash-stretch deformation:
  - Inhale: width expands by 1.3x, height compresses by 0.9x.
  - Float: balloon puff roundness (radius expands to 1.25x).
  - Land: squash flat (height 0.7x, width 1.3x for 3 frames).
  - Damage: crumpled origami wobble + alpha blink.
- **Ability Hats:** Rendered on Kirby's head (Sword: green knight nightcap + gold jewel, Fire: flame crown with yellow embers, Ice: frosted cyan tiara, Beam: jester two-tone hat, Cutter: metallic headband blade, Stone: brown rock crown, Spark: electric antenna with sparks, Needle: spiked golden band).
- **Corrugated Terrain:** Cardboard pattern with edge highlight and drop shadows.
- **Parallax Background:** 3 layers (Sky gradient, distant cardboard mountains at 0.2x scroll, mid cardboard clouds/hills at 0.5x scroll) with tissue-paper globalAlpha.
- **Confetti Particle Emitter:** Confetti bursts on ability gain, enemy defeats, and boss victories.

### 2. Procedural Web Audio (`KirbyAudio.ts`)
- Zero external audio files — 100% Web Audio API oscillator synthesis:
  - `playInhale()`: Low-frequency filtered white noise / wind swirl.
  - `playSpit()`: Pop frequency chirp with fast pitch drop.
  - `playFloat()`: Gentle airy puff chime.
  - `playJump()`: Upward frequency slide.
  - `playAbilityGain()`: 4-note ascending fanfare chime.
  - `playDamage()`: Crunchy cardboard tear/crumple sound.
  - `playBossTheme()`: Procedural 8-bit bassline and drum loop.
  - `playStageClear()`: Classic Kirby victory jingle notes.
  - `playGameOver()`: Descending sad minor chord sequence.

</decisions>

<code_context>
## Existing Code Insights

- `packages/game-engine/src/AudioSynthesizer.ts`: Web Audio API base synthesizer.
- `games/tank-1990/src/TankRenderer.ts`: Canvas 2D multi-pass cardboard rendering and confetti particle system reference.

</code_context>
