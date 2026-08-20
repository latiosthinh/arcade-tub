# SEED-004: Hyper-Casual No-Brain & Satisfying Antistress Minigames

## Idea
Introduce a dedicated collection of 8-10 hyper-casual, highly satisfying "no-brain" sensory sandbox minigames into ArcadeTub. These emphasize tactile sensory feedback, zero cognitive load, rhythmic repetition, ASMR-style procedural Web Audio, and instant stress relief.

## Why
- Players often seek low-stakes, satisfying loops (popping, squishing, cutting, peeling, sorting, pouring) to unwind without complex rules or fail states.
- Perfect fit for mobile/touch devices and web browsers with instant gratification and zero barrier to entry.
- Expands the `🧠 Relax & No-Brain` category with distinct toy-like interactions.

## Candidate Minigame Concepts & Loops

1. **Bubble Wrap Pop (`bubble-pop`)**:
   - Endless grid of papercraft bubble wrap sheets. Click, swipe, or roll cursor to pop bubbles with crisp tactile micro-plops, variable pitch harmonic chords, and golden rainbow hidden pop bubbles.
2. **Soap / Wood Carving Shredder (`soap-carve`)**:
   - Drag or swipe knife across a 3D-styled layered pastel soap block or cardboard sculpture to peel curly ribbon shavings with ASMR scraping sounds until a hidden origami figurine is revealed.
3. **Sand / Grain Kinetic Pour (`sand-zen`)**:
   - Sand zen sandbox with falling multi-color glowing particle sand streams. Drag rake or fingers to build colorful dunes, place cardboard funnels, and watch hypnotic granular physics avalanches.
4. **Fidget Spinner Speed Loop (`fidget-spin`)**:
   - Swipe vigorously left or right to spin multi-bearing papercraft spinners, build RPM gauges, unlock blazing neon trail glows, and upgrade bearing smoothness.
5. **Color Water Sort (`liquid-sort`)**:
   - Tap test tubes to pour and separate stratified colored papercraft liquids until each tube holds a single solid pure pigment.
6. **Pop-It Fidget Toy (`pop-it`)**:
   - Multi-shaped geometric silicone/papercraft push-bubble boards (hearts, unicorns, stars). Tap to depress bubbles with rubbery snap sounds, then flip the board over for infinite reverse popping.
7. **Lawn Mower / Grass Cut (`grass-mow`)**:
   - Steer a tiny buzzing cardboard lawn mower across overgrown construction paper lawn spirals, vacuuming fresh grass confetti ribbons in satisfying grid-clearing sweeps.
8. **Hydraulic Press Crusher (`hydraulic-crush`)**:
   - Place various squishy papercraft objects (rubber ducks, alarm clocks, soda cans, diamonds) under a heavy stamping press. Hold space/tap to smash them flat with exaggerated elastic splatter particles and accordion compressions.
9. **Balloon Inflate & Float (`balloon-pump`)**:
   - Rapid-tap pump handle to inflate oversized carnival balloons with funny wobble physics until they soar across the sky or pop in a blast of confetti.
10. **Magnetic Slime Pull (`magnetic-slime`)**:
    - Interactive fluid/blob surface with soft-body spring physics. Drag magnetic wand to stretch gooey paper pulp slime tendrils, gather iron filings, and slice elastic stretchy bridges.

## Trigger Conditions
Surface this seed when:
- Planning Milestone v7.0 or a dedicated **Antistress / Toy Sandbox** milestone.
- Expanding the `🧠 Relax & No-Brain` category (`#/category/nobrain`).
- Developing quick, low-maintenance casual web games with high viral replayability.

## Scope Estimate
- **Engine & Physics:** 8-10 lightweight canvas scenes under `games/` utilizing procedural particles, spring meshes, and granular physics.
- **Audio:** Custom procedural ASMR Web Audio synthesizers (bubble pops, blade scrapes, granular clicks, rubbery snaps).
- **Catalog Integration:** Multi-page Vite registration, route wiring, SVG preview screenshots, and mobile touch gesture mapping.
- **Estimated effort:** 2-3 waves across 1 milestone.

## Breadcrumbs
- Category Hub Route: `#/category/nobrain`
- Related Games: `games/rainbow-draw/`, `games/firework-pop/`, `games/koi-pond/`, `games/fruit-flood/`
- Physics & Particle Utils: `packages/game-engine/src/AudioSynthesizer.ts`

## Status
Planted: 2026-08-20
Active: No (Ready for next Relax/Antistress Milestone planning)
