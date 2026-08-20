# Requirements: Milestone v7.0 — Sensory Antistress Sandbox (8 Minigames)

## 1. Functional Requirements

### FR-01: Bubble Wrap Pop (`bubble-pop`)
- Grid of interactive papercraft bubble cells with pop states and pop sounds.
- Multi-touch swipe/drag popping and cursor sweeps.
- Rare golden rainbow pop bubbles that trigger chord cascade harmonies.
- Infinite regeneration / fresh sheet reset button.

### FR-02: Soap & Wood Carver (`soap-carve`)
- 3D layered pastel soap bar / wood block sliceable by dragging gesture.
- Shaving curl physics that peel off with procedural scraping/cutting sound effects.
- Progressive carving depth revealing hidden collectible origami figurines.

### FR-03: Sand Zen Sandbox (`sand-zen`)
- Interactive granular physics simulation with falling multi-color glowing sand streams.
- Tools: Zen Rake, Color Hopper, Sand Funnels, Clear Basin.
- Natural dune angle of repose and satisfying granular avalanches.

### FR-04: Fidget Spinner Speed (`fidget-spin`)
- Angular momentum physics spinner with inertia and low bearing friction.
- Swipe velocity tracker calculating RPM, max speed, and total revolutions.
- Unlocks: neon blade trails, harmonic hum pitch scaling with RPM.

### FR-05: Color Water Sort (`liquid-sort`)
- Test tubes with layered colored liquid pigments.
- Tap source tube then destination tube to pour top matching color.
- Undo, restart, and procedural soothing liquid glug sound effects.

### FR-06: Pop-It Fidget Toy (`pop-it`)
- Geometric silicone board (Heart, Star, Hexagon, Bear) with 2-way dimple buttons.
- Rubbery pop tactile audio on press and automatic board flip when cleared.
- Multi-color pastel / rainbow themes.

### FR-07: Grass Mower Swirl (`grass-mow`)
- Steerable mini cardboard lawn mower with simple directional touch / arrow controls.
- Tall layered paper grass blades sliced into airborne confetti ribbons.
- Mowing percentage tracker with garden pattern generation.

### FR-08: Hydraulic Press Crusher (`hydraulic-crush`)
- Hydraulic stamping press operated by holding click/space/touch.
- Squishy papercraft targets (Rubber Duck, Clock, Can, Watermelon, Diamond).
- Elastic accordion flattening animation, splatter particle burst, and hydraulic hiss audio.

## 2. Platform & Catalog Integration

### FR-09: Hub Catalog Registration & Categories
- Register all 8 games under `src/data/games.ts` assigned to `nobrain` / `casual` categories.
- Create 8 custom 2D Papercraft SVG screenshot illustrations in `src/data/screenshots.ts`.
- Register all 8 HTML entry points in `vite.config.ts` multi-page build configuration.

### FR-10: Quality & Production Budgets
- 100% test pass rate across all new physics and state engines with Vitest.
- Total production bundle size strictly under 300KB gzipped budget.
- Full mobile standalone PWA support and edge-to-edge fullscreen theater mode.
