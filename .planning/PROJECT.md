# Project: ArcadeTub (formerly Arcade Carnival)

## Purpose
Collection of browser-based retro-modern tactile arcade minigames packaged for web embedding, mobile standalone install (PWA), and instant play. Each game lives in its own folder, shares a common Playables/web adapter layer, and launches from the central ArcadeTub hub launcher with zero runtime dependencies.

## Current Milestone: v8.0 — Tank 1990 (Battle City) Retro Papercraft Arcade

**Goal:** Faithfully recreate the iconic Tank 1990 / Battle City arcade tactical action game with a tactile papercraft aesthetic, multi-tier tank upgrades, distinct enemy classes, powerups, destructible terrain, base defense, responsive mobile touch controls, and 100% test coverage.

**Target Features:**
1. **Grid Terrain & Destruction Engine:** 13x13 / 26x26 tile grid with destructible brick walls (sub-tile chipping), indestructible steel (destructible only by tier-4 cannon), water barrier, trees/grass camo concealment, ice inertia sliding, and defensible eagle base HQ.
2. **Combat & Entity Physics:** Player tank with 4 upgrade tiers (Basic, Fast, Heavy Dual-Shot, Armor-Piercing Cannon), smooth grid alignment, bullet vs bullet cancellation, and muzzle flash.
3. **Enemy AI & Spawner:** Wave-based spawner with 4 distinct enemy types (Basic Tank, Fast Cruiser, Power Tank with bonus flashing item drop, Heavy Armor Tank requiring multiple hits).
4. **Power-up Item Drops:** Star (tier upgrade), Shovel (temporary steel base fortification), Grenade (clear all screen enemies), Clock (freeze enemy movement), Helmet (temporary invulnerability), Tank (extra life).
5. **Stage Progression & High Scores:** Authentic multi-stage campaign sequence, score tallying screen, game over / victory flow, and persistent local storage high scores.
6. **Tactile Papercraft Visuals & 8-Bit Web Audio:** Cardboard cutouts, rolling track animations, paper confetti explosion bursts, procedural chiptune engine hums, shot pops, wall crumbling crunch, and alarm alerts.
7. **Mobile Virtual Controls & Responsive Viewport:** On-screen virtual 4-way D-Pad + Fire button with haptic/tactile feedback and zero latency.
8. **Hub & Catalog Integration:** Standalone HTML/TS entry, Vite multi-page config, catalog metadata & SVG screenshot, unit tests, and Playwright verification.

## Previous Milestones
- v1.0–v3.0: Foundation, 12 games, Cyber-Arcade UI/UX refactor
- v4.0–v5.0: 15 games total + 2D Papercraft visual overhaul
- v6.0: CrazyGames Replication (12 games: basket, drift, helix, square bird, etc. -> 27 games total)
- v6.1: ArcadeTub Rebranding, No-Brain casual pack, Zen Koi Pond, PWA standalone install & mobile fullscreen theater mode (34 games total)
- v7.0: Sensory Antistress Sandbox (8 games: bubble-pop, soap-carve, sand-zen, fidget-spin, liquid-sort, pop-it, grass-mow, hydraulic-crush -> 42 games total)

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
- Bundle size budget: < 350KB gzipped total across all 43 games + hub
- Runs 60fps on mid-range mobile & desktop
- 100% test pass rate

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
