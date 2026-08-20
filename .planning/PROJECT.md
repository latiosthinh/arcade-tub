# Project: ArcadeTub (formerly Arcade Carnival)

## Purpose
Collection of browser-based retro-modern tactile arcade minigames packaged for web embedding, mobile standalone install (PWA), and instant play. Each game lives in its own folder, shares a common Playables/web adapter layer, and launches from the central ArcadeTub hub launcher with zero runtime dependencies.

## Current Milestone: v7.0 — Sensory Antistress Sandbox (8 Minigames)

**Goal:** Expand the `🧠 Relax & No-Brain` category with 8 tactile, ASMR-inspired sensory sandbox games emphasizing zero cognitive pressure, rich procedural Web Audio harmonics, elastic particle responses, and instant stress relief.

**8 Target Antistress Minigames:**
1. `bubble-pop` (Bubble Wrap Pop) — Endless tactile bubble wrap sheets with micro-plops and golden rainbow pop bursts.
2. `soap-carve` (Soap & Wood Carver) — Peel curly ribbon shavings with crisp cutting ASMR to reveal hidden origami figurines.
3. `sand-zen` (Sand Zen Sandbox) — Granular sand streams, zen rake patterns, funnels, and soothing dune avalanches.
4. `fidget-spin` (Fidget Spinner Speed) — High-RPM swipe physics, bearing upgrades, and glowing neon light trails.
5. `liquid-sort` (Color Water Sort) — Stratified color liquid test-tube sorting with zero fail-state stress.
6. `pop-it` (Pop-It Fidget Toy) — Geometric silicone bubble boards with tactile rubbery snaps and infinite board flipping.
7. `grass-mow` (Grass Mower Swirl) — Steer mini cardboard mower across paper grass spirals, shredding lawn into confetti ribbons.
8. `hydraulic-crush` (Hydraulic Press Crusher) — Hold space or tap to smash squishy papercraft objects with elastic accordion physics and splatters.

## Previous Milestones
- v1.0–v3.0: Foundation, 12 games, Cyber-Arcade UI/UX refactor
- v4.0–v5.0: 15 games total + 2D Papercraft visual overhaul
- v6.0: CrazyGames Replication (12 games: basket, drift, helix, square bird, etc. -> 27 games total)
- v6.1: ArcadeTub Rebranding, No-Brain casual pack, Zen Koi Pond, PWA standalone install & mobile fullscreen theater mode (34 games total)

## Tech Stack
- **Build:** Vite 7 + TypeScript + pnpm workspaces
- **Rendering:** Canvas 2D API (no engine dependency)
- **Audio:** Procedural Web Audio synthesis (zero external audio files)
- **Styling:** Custom CSS design system (tokens, scoped CSS, papercraft theme)
- **Testing:** Vitest for game logic unit tests
- **Deploy:** Cloudflare Pages / Static Hosting

## Constraints
- Zero runtime dependencies — fully static vanilla TS + CSS
- Each game folder is self-contained under `games/<game-id>/`
- Shared code in `packages/playables-adapter/` and `packages/game-engine/`
- Bundle size budget: < 300KB gzipped total
- Runs 60fps on mid-range mobile & desktop
- 100% test pass rate
