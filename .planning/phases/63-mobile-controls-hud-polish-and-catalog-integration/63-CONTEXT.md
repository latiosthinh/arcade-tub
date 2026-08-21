# Phase 63: Mobile Controls, HUD, Polish & Catalog Integration - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Virtual D-pad + Jump + Attack buttons with multi-touch, HUD (HP/lives/ability/score), stage intro splash, goal game, standalone `games/kirby-adventure/` packaging, catalog registration, Vitest suite, and Vite build configuration.

Covers requirements: CTRL-01, CTRL-02, CTRL-03, CTRL-04, INTG-01, INTG-02, INTG-03.
</domain>

<decisions>
## Implementation Decisions

### 1. Mobile Virtual Controls (`TouchControls.ts`)
- Left side: 4-way virtual D-pad with angular deadzone.
- Right side: Jump button (A), Inhale/Attack button (B), Discard button (X).
- Multi-touch handling: Supports simultaneous D-pad hold + button taps without gesture stutter or screen scroll.

### 2. HUD Overlay & Presentation
- Top bar: HP segments, lives, score, world/stage number, current ability name/hat icon.
- Stage Intro Splash: "Stage 1-1: Vegetable Valley" banner on level start (1.5s).
- Goal Game: End of stage springboard timing minigame rewarding 1-Up, Maxim Tomato, or points.

### 3. Catalog & Standalone Packaging
- `games/kirby-adventure/index.html` — HTML5 canvas wrapper.
- `games/kirby-adventure/src/main.ts` — Game entry point bootstrapping `GameLoop` and `KirbyScene`.
- Register in `src/data/games.ts` under `action` and `arcade` categories with custom SVG screenshot.
- Wire into `vite.config.ts` multi-page input bundle.

</decisions>

<code_context>
## Existing Code Insights

- `src/data/games.ts`: Catalog array of 43 games. Add 44th game: `kirby-adventure`.
- `vite.config.ts`: Multi-page entries list. Add `kirby-adventure: resolve(__dirname, 'games/kirby-adventure/index.html')`.
- `games/tank-1990/index.html`: Standalone game HTML reference.

</code_context>
