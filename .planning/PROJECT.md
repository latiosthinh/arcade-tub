# Project: ArcadeTub (formerly Arcade Carnival)

## Purpose
Collection of browser-based retro-modern tactile arcade minigames packaged for web embedding, mobile standalone install (PWA), and instant play. Each game lives in its own folder, shares a common Playables/web adapter layer, and launches from the central ArcadeTub hub launcher with zero runtime dependencies.

## Current Milestone: v10.0 — The Legend of Kage: Papercraft Ninja Action

**Goal:** Build a Legend of Kage-inspired vertical-scrolling ninja action game with super-jump tree combat, dual shuriken + sword weapons, 4-stage loop with seasonal visual cycle, in the ArcadeTub papercraft aesthetic.

**Target Features:**
1. **Super-Jump Physics Engine:** Massive vertical leaps (~3 screen heights), full horizontal air control, gravity arc, tree branch collision landing, fast ground run.
2. **Dual Weapon Combat:** Shuriken rapid-fire paper star projectiles (4/8 directional, airborne), Sword short-range melee slash (deflects incoming enemy shuriken).
3. **Tree & Canopy System:** Tall procedural bamboo trees, branch platforms, canopy collision zones for mid-air landing and vertical traversal.
4. **Enemy Wave Spawner:** Continuous ninja waves spawning from screen edges — Red ninja (basic), Blue ninja (faster), Monk (ground fire projectiles), White ninja (elite).
5. **Boss Encounters:** Fire-breathing Monk (ranged fire projectiles), Crystal Ball Wizard (teleport + magic orbs) — pattern-based multi-phase fights.
6. **4-Stage Loop:** Bamboo Forest (vertical scrolling) → Castle Moat/Wall (horizontal climbing) → Castle Interior (corridor combat) → Boss Chamber (arena fight + princess rescue).
7. **Seasonal Palette Cycle:** Spring cherry blossoms → Summer deep green → Autumn falling orange leaves → Winter paper snow — palette swap per game loop.
8. **Papercraft Visuals & Procedural Audio:** Origami ninja player/enemies, folded paper shuriken, corrugated castle walls, layered parallax cardboard forests, seasonal confetti particles, procedural Web Audio (sword clash, shuriken whoosh, jump wind, boss fire).
9. **Mobile Virtual Controls:** D-pad + Shuriken + Sword buttons with multi-touch.
10. **Hub & Catalog Integration:** Standalone `games/legend-of-kage/`, Vite multi-page config, catalog metadata under `retro` category, unit tests.

## Previous Milestones
- v1.0–v3.0: Foundation, 12 games, Cyber-Arcade UI/UX refactor
- v4.0–v5.0: 15 games total + 2D Papercraft visual overhaul
- v6.0: CrazyGames Replication (12 games: basket, drift, helix, square bird, etc. -> 27 games total)
- v6.1: ArcadeTub Rebranding, No-Brain casual pack, Zen Koi Pond, PWA standalone install & mobile fullscreen theater mode (34 games total)
- v7.0: Sensory Antistress Sandbox (8 games: bubble-pop, soap-carve, sand-zen, fidget-spin, liquid-sort, pop-it, grass-mow, hydraulic-crush -> 42 games total)
- v8.0: Tank 1990 (Battle City) Retro Papercraft Arcade (43 games total)
- v9.0: Kirby's Adventure: Papercraft Platformer (44 games total)

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
