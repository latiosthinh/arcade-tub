# SEED-003: CrazyGames Minigame Catalog Replication

## Idea
Expand the Arcade Carnival library with popular mechanics inspired by top minigames featured on CrazyGames (e.g., *Tap-Tap Shots*, *Drift Boss*, *Helix Jump*, *Square Bird*, *Layers Roll*, *12 MiniBattles*). Replicate and adapt these core gameplay loops into our 2D Papercraft aesthetic (layered construction paper, cardboard cutouts, ink outlines, procedural Web Audio, zero external assets).

## Why
- Expands catalog variety into hyper-casual reflex, physics, and timing genres with proven player retention.
- Re-interprets popular web minigame mechanics through a consistent, tactile 2D Papercraft identity.
- Keeps games lightweight, instant-play, mobile-friendly, and fully playable with keyboard, mouse, and touch.

## Candidate Minigame Archetypes & Themes
1. **Paper Basket (Tap-Tap Shots)**: Physics trajectory basketball / paper ball tossing into moving cardboard hoops with streak combos.
2. **Cardboard Drift (Drift Boss)**: One-button timing turn/drift on isometric zigzag cardboard tracks.
3. **Origami Tower Jump (Helix Jump)**: Rotating cylinder/helix paper tower with cutout safe zones and paint splatter hazards.
4. **Paper Stack Bird (Square Bird)**: Auto-runner laying paper block stacks to surmount cardboard terrain obstacles.
5. **Roll Ribbon (Layers Roll)**: Expanding paper ribbon roll that gathers paper layers and trims through obstacle gates.
6. **Cardboard Duel (12 MiniBattles)**: 2-player local / single-button party minigames (tug-of-war, paper quick-draw, finger flick).

## Trigger Conditions
Surface this seed when:
- Planning a major catalog expansion milestone (v6.0+).
- Expanding into physics/single-button hyper-casual genres.
- Looking for fresh mechanics to add 4-6 new minigames.

## Scope Estimate
- **Game Engines & Scenes:** 4-6 new game packages under `games/` (e.g., `games/paper-basket/`, `games/drift-boss/`, etc.).
- **Visuals:** 2D Papercraft canvas renderers (origami cutouts, layered craft backgrounds, sticky note HUDs).
- **Catalog Integration:** Register metadata in `src/data/games.ts` and SVG screenshots in `src/data/screenshots.ts`.
- **Audio:** Web Audio procedural synth profiles for bounces, drifts, and scores.
- **Estimated effort:** 4-6 phases across 1 milestone.

## Breadcrumbs
- CrazyGames Minigames reference: https://www.crazygames.com/t/mini
- Game template and engine: `packages/game-engine/`, `packages/playables-adapter/`
- Hub catalog registry: `src/data/games.ts`
- Papercraft SVG preview bank: `src/data/screenshots.ts`

## Status
Planted: 2026-08-18
Active: No (Deferred for future catalog expansion milestone)
