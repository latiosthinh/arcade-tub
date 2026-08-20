# Technology Stack: Tank 1990 (Battle City) Retro Papercraft Arcade

**Project:** ArcadeTub v8.0 — Tank 1990  
**Domain:** 2D Top-Down Tactical Arcade Game  
**Researched:** 2026-08-20  
**Overall Confidence:** HIGH

---

## Stack Decision Summary

| Area | Selection | Rationale |
|------|-----------|-----------|
| **Runtime Dependencies** | **0 (Zero)** | Adheres to strict platform constraints (<350KB total budget across 43 games). |
| **Language & Build** | TypeScript 5.8+ & Vite 7 | Standard across repository. |
| **Graphics Engine** | HTML5 Canvas 2D API | Grid-based tilemap and papercraft vector sprites rendered natively with sub-pixel crispness and high performance. |
| **Audio Engine** | Procedural Web Audio API (`AudioContext`) | Zero MP3/WAV assets. 8-bit chiptune synthesis (square, pulse, sawtooth, noise) via custom procedural class. |
| **Storage** | Browser `localStorage` | Persistent high scores, stage unlock progression, settings. |
| **Testing** | Vitest + Happy DOM | Fast unit testing of grid physics, AI steering, item drop rates, bullet collisions. |

---

## 1. Grid & Level Representation Data Formats

### 1.1 Coordinates & Resolution
- **Standard NES/Arcade Grid:** 13 × 13 macro-tiles (each macro-tile is 2 × 2 micro-tiles = 26 × 26 micro-tiles).
- **Internal Micro-Tile Unit:** 16 × 16 px (26 × 26 grid = 416 × 416 px game canvas viewport, scaled responsively with letterboxing).
- **Micro-Tile Sub-division for Destruction:** 
  - Each micro-tile is further 2 × 2 sub-tiles (8 × 8 px) allowing authentic 4-quadrant destructible brick chipping.

### 1.2 Tile Types & Bitmask Encodings
```typescript
export enum TileType {
  EMPTY = 0,
  BRICK = 1,       // Destructible by standard bullets (sub-tile chipping)
  STEEL = 2,       // Indestructible by standard bullets (destructible only by Tier 4 AP cannon)
  WATER = 3,       // Blocks tank navigation, permits bullet traversal
  TREES = 4,       // Visual camouflage layer over entities (drawn in foreground pass)
  ICE = 5,         // Reduces friction / introduces slide velocity
  BASE_EAGLE = 6,  // Player base HQ (vulnerable)
  BASE_DESTROYED = 7
}

// 4-bit bitmask per brick micro-tile for 4 quadrants [Top-Left, Top-Right, Bottom-Left, Bottom-Right]
// 0b1111 (15) = full brick, 0b0000 (0) = fully cleared
export type BrickQuadrantMask = number;
```

### 1.3 Stage Definition Format
Compact string array or run-length encoded 26×26 array per stage:
```typescript
export interface StageConfig {
  stageNumber: number;
  // 26 strings of 26 characters (or 13x13 macro-tile ASCII template)
  // '.' = empty, '#' = brick, '@' = steel, '~' = water, '%' = trees, '-' = ice, 'E' = base
  map: string[];
  enemyWaves: {
    totalCount: number; // typically 20 tanks per stage
    distribution: {
      basic: number;
      fast: number;
      power: number;
      heavy: number;
    };
    bonusItemSpawns: number[]; // indices of tanks carrying item power-up drops
  };
}
```

---

## 2. Procedural Web Audio Synthesis Parameters

All sound effects synthesized via Web Audio API oscillators, noise buffers, and gain/filter nodes. Zero external audio files.

| Sound Effect | Waveform / Node | Frequency / Ramp | Duration | Synthesis Technique |
|--------------|-----------------|------------------|----------|---------------------|
| **Player Shot** | Pulse / Square | 440 Hz → 110 Hz exp ramp | 0.08s | Rapid downward pitch drop with bandpass filter (1200 Hz). |
| **Bullet Clang (Steel)** | High Triangle / Square | 1200 Hz → 900 Hz | 0.04s | Sharp high-metallic click with instant decay. |
| **Brick Crunch** | Noise Buffer (White) | Bandpass (400–800 Hz) | 0.10s | Low-pass filtered noise burst with exponential volume cutoff. |
| **Small Explosion (Tank hit)** | Sawtooth + Noise | 150 Hz → 40 Hz + Noise burst | 0.25s | Combined low-frequency crunch with distortion gain. |
| **HQ Base Destroyed** | Sawtooth + White Noise | 220 Hz → 30 Hz | 0.80s | Long rumbling downward explosion cascade. |
| **Power-up Item Spawn** | Sine / Arpeggio | [440, 554, 659, 880] Hz | 0.20s | Rapid 4-note ascending chiptune chirp (50ms per note). |
| **Power-up Pickup** | Square / Arpeggio | [523, 659, 783, 1046, 1318] Hz | 0.35s | Ascending fanfare burst. |
| **Engine Hum (Idle / Moving)** | Low Frequency Sawtooth | 55 Hz (Idle) / 82 Hz (Drive) | Loop | LFO pitch modulation (4 Hz vibrato) with low master gain. |
| **Alert / Base Danger** | Square / Siren | 880 Hz ↔ 440 Hz square LFO | 0.50s | Alternating 2-tone alarm pulse. |
| **Stage Intro Jingle** | Pulse / Chiptune sequence | Classic Battle City fanfare notes | 1.8s | Multi-note procedural scheduler with square wave timbre. |

---

## 3. Mobile Virtual Controls & Touch Architecture

### 3.1 Input Abstraction
Unifies Keyboard (Arrow keys / WASD / Space / J) and Touch Virtual Controls into a single state contract.

```typescript
export interface TankInputState {
  moveDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';
  firePressed: boolean;
  fireJustPressed: boolean;
  pauseJustPressed: boolean;
}
```

### 3.2 Virtual Control Layout
- **Left Thumb Zone:** 4-Way Cross D-Pad / Floating Directional Pad.
  - Multi-touch pointer tracking with dead-zone snapping to Cardinal axes (no diagonals permitted in Battle City).
  - Visual tactile papercraft feedback (depressed state, subtle drop-shadow change).
- **Right Thumb Zone:** Action Button (Fire `A`) + Utility Button (Pause / Turbo).
  - Fast touchstart event listener with `touch-action: none` and passive false to prevent browser gesture latency or page scrolling.

---

## 4. Dependencies & Library Evaluation

| Requirement | Proposed Solution | Why No NPM Package Needed |
|-------------|-------------------|---------------------------|
| **Rendering** | Vanilla HTML5 Canvas 2D | Grid renderer, layered entity pipeline (Floor -> Water -> Tanks/Bullets -> Explosion Confetti -> Trees Foreground -> UI Overlay) is clean and fast in < 400 lines of TS. |
| **Physics & Collision** | Custom AABB + 26×26 Grid Spatial Hash | Standard tile grid collision + Axis-Aligned Bounding Box (AABB) checks between tanks and bullets take ~100 lines of pure math without heavy engines like Matter.js or Arcade Physics. |
| **Audio** | Procedural `TankAudioSynthesizer` | Extends repo's Web Audio synthesizer pattern; zero audio latency and 0 bytes network transfer. |
| **Touch Controls** | Custom Virtual Pad Component (`VirtualDPad`) | PointerEvent listeners on overlay Canvas/DOM elements with touch identifier tracking. |
| **Testing** | Vitest (already installed) | Unit tests run headlessly in milliseconds. |

---

## 5. Architectural Checklist for Tank 1990

1. **Self-Contained Module:** Located in `games/tank-1990/`.
2. **Standard Folder Layout:**
   - `games/tank-1990/index.html`
   - `games/tank-1990/package.json`
   - `games/tank-1990/tsconfig.json`
   - `games/tank-1990/src/main.ts`
   - `games/tank-1990/src/TankGameScene.ts`
   - `games/tank-1990/src/GridMap.ts`
   - `games/tank-1990/src/TankPlayer.ts`
   - `games/tank-1990/src/TankEnemyAI.ts`
   - `games/tank-1990/src/BulletSystem.ts`
   - `games/tank-1990/src/PowerupManager.ts`
   - `games/tank-1990/src/PapercraftRenderer.ts`
   - `games/tank-1990/src/TankAudio.ts`
   - `games/tank-1990/src/VirtualControls.ts`
   - `games/tank-1990/test/grid.test.ts`
   - `games/tank-1990/test/collision.test.ts`
   - `games/tank-1990/test/tank-upgrades.test.ts`
   - `games/tank-1990/test/enemy-ai.test.ts`
