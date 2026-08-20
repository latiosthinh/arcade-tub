# Phase 42: No-Brain Arcade Minigames Research

## Overview & Scope
Goal: Build 6 instant-fun, high-satisfaction "no-brain" casual minigames in Arcade Carnival's 2D Papercraft aesthetic:
1. `rainbow-draw` (Draw Anything / Scratch Reveal): Freeform rainbow brush lines, auto-smoothing spline curves, and scratch-off craft paper eraser mode revealing underlying picture.
2. `firework-pop` (Blank Space Fireworks): Click/tap anywhere on canvas to launch vibrant, multi-stage paper confetti rocket fireworks with crackle physics and harmonic audio booms.
3. `fruit-flood` (Ninja Fruit Infinite Flood): Endless blade swipe cutting through an intense continuous flood of colorful papercraft fruits with slice physics and juice particle splatters.
4. `snow-smash` (Snowball Target Destroyer): Catapult/throw paper snowballs at fragile cardboard structures, towers, and figurines until they shake, crack, and shatter into pieces.
5. `mosquito-swat` (Catch Mosquito Net): Fast reflex net swiping and tapping to catch buzzing origami mosquitoes and pests before they escape the screen.
6. `tic-tac-toe` (Paper Tic-Tac-Toe vs AI): 3x3 cardboard grid with local 2-player or AI computer mode integrating Xiaomi Mimo SG API with local minimax fallback when offline/no key.

---

## Technical Stack & Architecture

### Common Standards
- **Engine**: `@arcade-carnival/game-engine` (`GameLoop`, `GameScene`, `InputManager`)
- **Storage/Adapter**: `@arcade-carnival/playables-adapter` (`loadData`, `saveData`, `reportScore`, `onPause`, `onResume`)
- **Visuals**: Pure 2D Canvas API (zero external assets, kraft paper palettes, cardboard cutouts, dashed strokes)
- **Audio**: Web Audio API procedural synthesis (zero MP3/WAV files)
- **Testing**: Vitest unit test suites covering core math, state machines, physics, and scoring.

---

## Game-Specific Mechanics & Algorithms

### 1. `rainbow-draw`
- **Canvas Resolution**: 800x600 responsive.
- **Draw Modes**:
  - **Rainbow Stroke**: HSL hue auto-incrementing on mouse/pointer move, smooth quadratic Bézier interpolation between sampled points.
  - **Auto Adjust Line**: Smoothing algorithm using Catmull-Rom or Douglas-Peucker point decimation on pointer release for clean geometric lines.
  - **Scratch & Reveal**: Top opaque kraft paper mask layer cleared using `ctx.globalCompositeOperation = 'destination-out'` revealing an authentic underlying papercraft illustration (origami animal or carnival castle).
- **Controls**: Mouse drag / Touch swipe, toolbar buttons for mode toggles, brush size slider, and clear canvas.

### 2. `firework-pop`
- **Mechanics**: Click/tap anywhere on dark parchment night sky to trigger ascending rocket shell.
- **Explosion Types**: Ring burst, willow sparkle, crackle confetti, heart paper shape, double ring.
- **Audio Synthesis**: Pitch-swept oscillator whoosh + noise burst + low-pass resonant rumble for explosions.
- **Auto/Idle Mode**: Auto-launches random colorful fireworks when idle for > 2 seconds.

### 3. `fruit-flood`
- **Mechanics**: Endless mode with flood rate scaling. Fruits (watermelon, orange, banana, strawberry, kiwi, dragonfruit, pineapple) catapult from screen edges.
- **Blade Slice**: Tracks recent pointer trail points. Segment-segment intersection against circular fruit hitboxes.
- **Slice Splitting**: Sliced fruits split into 2 half-polygons with angular velocity and juice droplet particles.
- **Combos**: Slicing 3+ fruits in a single swipe grants combo chime, score multiplier, and freeze/fever moments.

### 4. `snow-smash`
- **Mechanics**: Drag-and-release slingshot or direct tap targeting to throw physics snowballs.
- **Destructible Targets**: Multi-layer cardboard structures (pyramids, stacked boxes, snowman, paper castle) with health/durability tiers.
- **Impact Physics**: Impulse force transfer, fracture cracks rendered on hit, tumbling physics, and collapse when support blocks break.

### 5. `mosquito-swat`
- **Mechanics**: Swarm of erratic origami mosquitoes flying across screen with Perlin-like pseudo-random trajectory sine curves.
- **Swatter / Net**: Swiping pointer moves net; tapping or fast sweeping catches insects in radius.
- **Powerups**: Bug spray smoke bomb (clears radius), electric swatter combo frenzy, time freeze clock.
- **Combos**: Catching multiple bugs in one swipe increases streak multiplier.

### 6. `tic-tac-toe`
- **Mechanics**: 3x3 cardboard grid with hand-drawn X and O papercraft chalk marks.
- **AI Opponent**:
  - Primary: Xiaomi Mimo SG API integration via serverless proxy or direct client fetch with API key configured in `.env` (`XIAOMI_MIMO_API_KEY` / `VITE_XIAOMI_MIMO_API_KEY`).
  - Offline/Fallback: Local Minimax algorithm with adjustable difficulty (Easy = random, Medium = 50% optimal, Hard = unbeatable Minimax).
- **Modes**: Player vs Computer (AI), Local 2-Player (Pass & Play).

---

## Threat Model & Security Register
- **API Key Protection**: Never commit `.env`. Provide fallback to Minimax so game is 100% playable even without API key.
- **Input Sanitization**: Validate API response coordinates to guarantee 0-2 integer index bounds.
- **Memory Management**: Cap particle counts in fireworks and fruit slice trails (max 300 active particles).
