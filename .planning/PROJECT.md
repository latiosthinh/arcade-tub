# Project: ArcadeTub (formerly Arcade Carnival)

## Purpose
Collection of browser-based retro-modern tactile arcade minigames packaged for web embedding, mobile standalone install (PWA), and instant play. Each game lives in its own folder, shares a common Playables/web adapter layer, and launches from the central ArcadeTub hub launcher with zero runtime dependencies.

## Current Milestone: v9.0 — Kirby's Adventure: Papercraft Platformer

**Goal:** Build a Kirby's Adventure-inspired side-scrolling platformer with inhale/copy-ability mechanics in the ArcadeTub papercraft aesthetic.

**Target Features:**
1. **Platformer Physics Engine:** Gravity, ground/wall/ceiling tile collision, slopes, one-way platforms, scrolling camera with room transitions.
2. **Kirby Core Mechanics:** Inhale vacuum cone, swallow to copy abilities, spit star projectile, multi-jump float puffs (6 max), ducking slide kick.
3. **Copy Ability System:** Each ability overrides attack moveset — Sword slash combo, Fire dash, Ice freeze breath, Beam whip, Cutter boomerang, Stone invulnerable drop, Spark electric field, Needle spike burst.
4. **Enemy AI & Ability Grants:** Waddle Dee (walk), Waddle Doo (beam), Blade Knight (sword), Hot Head (fire), Chilly (ice), Poppy Bros (bomb), Sparky (spark) — each grants corresponding ability on inhale+swallow.
5. **Boss Encounters:** Whispy Woods (tree shake + apple drop), Kracko (lightning + rain), Meta Knight (sword duel) with multi-phase attack patterns.
6. **World & Stage Progression:** 4–6 themed worlds (Green Greens, Ice Cream Island, Butter Building, etc.), 4–6 stages per world, hidden bonus rooms, world map navigation.
7. **Papercraft Visuals & Procedural Audio:** Cardboard Kirby with squash-stretch, origami enemies, corrugated terrain tiles, tissue-paper parallax sky, confetti ability transformations, procedural Web Audio (inhale whoosh, float puff, ability jingles, boss drums).
8. **Mobile Virtual Controls:** Left-side virtual D-pad, right-side Inhale + Jump buttons, responsive touch with haptic feedback.
9. **Hub & Catalog Integration:** Standalone HTML/TS entry under `games/kirby-adventure/`, Vite multi-page config, catalog metadata & SVG screenshot, unit tests.

## Previous Milestones
- v1.0–v3.0: Foundation, 12 games, Cyber-Arcade UI/UX refactor
- v4.0–v5.0: 15 games total + 2D Papercraft visual overhaul
- v6.0: CrazyGames Replication (12 games: basket, drift, helix, square bird, etc. -> 27 games total)
- v6.1: ArcadeTub Rebranding, No-Brain casual pack, Zen Koi Pond, PWA standalone install & mobile fullscreen theater mode (34 games total)
- v7.0: Sensory Antistress Sandbox (8 games: bubble-pop, soap-carve, sand-zen, fidget-spin, liquid-sort, pop-it, grass-mow, hydraulic-crush -> 42 games total)
- v8.0: Tank 1990 (Battle City) Retro Papercraft Arcade (43 games total)

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
