# Phase 68: Papercraft Visuals, Procedural Audio, Touch Controls & Hub Integration - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Full tactile origami presentation, seasonal weather particle engine, procedural Web Audio SFX, virtual mobile controls, standalone `games/legend-of-kage/` packaging, catalog registration in ArcadeTub, and Vitest suite.

Covers requirements: VISL-01, VISL-02, AUDI-01, CTRL-01, INTG-01.
</domain>

<decisions>
## Implementation Decisions

### 1. Papercraft Canvas 2D Renderer (`KageRenderer.ts`)
- Origami player ninja (crimson paper robes, black headband, folded katana sword).
- Colored origami enemy ninjas (red, blue, white) and fire monks.
- Corrugated cardboard trees, bamboo stalks, and stone castle walls.
- Dynamic seasonal weather particles (sakura petals, pollen drift, maple leaves, paper snow).
- Paper scroll unrolling transitions between stages.

### 2. Procedural Web Audio (`KageAudio.ts`)
- Zero external audio files:
  - `playSlash()`: Metallic high-frequency whoosh.
  - `playClash()`: Bright square/triangle resonant ring (sword parrying shuriken).
  - `playShuriken()`: Rapid paper flutter chirp.
  - `playJump()`: Airy ascending wind whistle.
  - `playFire()`: Noise-modulated crackling flame burst.
  - `playVictory()`: Japanese pentatonic fanfare melody.

### 3. Mobile Touch Controls (`TouchControls.ts`)
- Left D-pad (8-directional) + right Shuriken & Sword action buttons + Jump button.
- Multi-touch handling allowing simultaneous running, jumping, and slashing.

### 4. Integration
- `games/legend-of-kage/index.html` (800x600 responsive 4:3 canvas).
- `games/legend-of-kage/src/main.ts` entry point.
- Registered in `src/data/games.ts` as 45th game under `retro` category.
- Wired into `vite.config.ts`.

</decisions>
