# Domain Pitfalls: Battle City / Tank 1990 (HTML5 Canvas)

**Domain:** 2D Grid-Based Tank Action / Battle City Retro Clone
**Researched:** 2026-08-20
**Target Architecture:** TypeScript, Native Canvas 2D, Procedural Web Audio API, Zero Runtime Dependencies

---

## Critical Pitfalls

Mistakes that cause movement stutter, broken terrain destruction, AI deadlocks, and game-breaking state desync.

### Pitfall 1: Coordinate-Free Grid Movement & Corner Catching (The Corridor Glitch)
**What goes wrong:** Tank gets stuck when turning into 1-tile or 2-tile corridors unless player reaches exact integer pixel alignment. Tank fails to turn or stops dead when pressing perpendicular direction near wall corners.
**Why it happens:** Original NES Battle City uses a 13x13 macro-grid (16x16 px) composed of 26x26 micro-tiles (8x8 px). A tank is 16x16 px (2x2 sub-tiles). When moving along X and pressing Y, if `tank.x % subTileSize !== 0`, perpendicular bounding box collides with adjacent wall corner.
**Consequences:** Sluggish, frustrating controls. Game feels unresponsive compared to original NES physics.
**Prevention:**
- Implement "Corner Assisted Snapping / Auto-Alignment" on turn:
  - When switching axes (e.g. Horizontal to Vertical), if orthogonal offset `offset = tank.x % halfTileSize` is within snapping threshold ($\le 4\text{ px}$ in 16px tile scale), smoothly pull tank coordinate to nearest grid line instead of rejecting turn.
  - Constrain 1D movement along current heading while clamping orthogonal axis to grid coordinate.
**Detection:** Tank cannot cleanly turn corners while holding diagonal/turn inputs in maze sections.
**Test Cases to Write:**
- `test('tank turns up into corridor when 3px off-center snaps to grid line')`
- `test('tank rejects turn when obstacle is strictly blocking turn radius')`

### Pitfall 2: Whole-Tile Destruction vs 4-Quadrant Sub-Tile Micro-Chipping
**What goes wrong:** A bullet hit wipes out entire 16x16 brick block instead of chipping only the struck 8x8 or 4x8 sub-quadrant. Bullets pass through partially chipped walls or get blocked by empty space.
**Why it happens:** Treating grid map as coarse 13x13 matrix rather than 26x26 micro-grid (or 52x52 bitmask) with quadrant destructibility.
**Consequences:** Narrow tunnels (half-brick tunneling) become impossible; high-tier tank gameplay and authentic tactical shooting fail.
**Prevention:**
- Store terrain as 26x26 micro-tile grid (8x8 px sub-tiles).
- Each 16x16 block consists of 4 micro-tiles: Top-Left, Top-Right, Bottom-Left, Bottom-Right.
- Bullets have 3-4px hitbox. Upon collision:
  - Calculate exact micro-tiles intersecting bullet front edge.
  - A standard shot destroys up to 2 adjacent 8x8 micro-tiles along collision front.
  - Tier 4 armor-piercing shot chips steel sub-tiles in same quadrant format.
**Detection:** Firing at top corner of brick wall destroys entire block; tanks cannot carve narrow half-lane path.
**Test Cases to Write:**
- `test('bullet moving UP hitting bottom edge of brick block destroys only bottom-left and bottom-right micro-tiles')`
- `test('bullet passes through carved half-corridor without colliding with destroyed micro-tiles')`

### Pitfall 3: Bullet Tunneling & Bullet-vs-Bullet Cancellation Misses
**What goes wrong:** Fast bullets (player tier 2+ or fast enemies) skip collision frames, passing through thin walls or through each other without canceling.
**Why it happens:** Discrete Euler step (`pos += vel * dt`) where bullet speed (e.g., 240-360 px/s) exceeds bullet bounding box diameter (3-4 px) per frame at variable frame rates ($dt > 16.6\text{ms}$).
**Consequences:** Player and enemy fire directly through each other; walls fail to register hits; base eagle destroyed through intact steel barrier.
**Prevention:**
- Fixed timestep sub-stepping for projectile physics (e.g. 120Hz physics tick or raymarching segment between `prevPos` and `newPos`).
- Segment-box sweep against micro-tile grid.
- Bullet-to-bullet cancellation check: pairwise line-segment intersection or bounding-box overlap check after movement step.
**Detection:** Bullets passing through each other when fired head-to-head; bullets teleporting through 4px chipped walls.
**Test Cases to Write:**
- `test('opposing bullets on same line cancel each other and spawn collision sparks')`
- `test('high-velocity bullet does not tunnel through 8px steel wall at 30fps delta time')`

### Pitfall 4: Enemy AI Getting Trapped in Infinite Turn Loops or Wall Corners
**What goes wrong:** Enemy tanks jitter against corners, get stuck in infinite ping-pong direction flips, or clump together in spawn corners.
**Why it happens:** Naive random direction picking upon collision immediately chooses reverse direction or perpendicular blocked direction every frame.
**Consequences:** Dumb, static enemies; game difficulty drops to zero; stage becomes non-interactive.
**Prevention:**
- Replicate authentic NES Battle City AI state machine:
  1. Direction choice happens only at grid alignment nodes (`x % tileSize === 0 && y % tileSize === 0`) or upon obstacle collision.
  2. Maintain direction lock timer (minimum movement duration before choosing new direction unless blocked).
  3. Weighted direction picking:
     - 60-70% bias towards Player HQ (Eagle base at bottom center) or Player tank.
     - 20% bias to continue forward.
     - 10% bias for lateral patrol.
     - Never reverse $180^\circ$ immediately unless forward and both flanks are completely blocked.
  4. Periodic random shooting timer (1.0 - 2.5s) + instant fire trigger if player or base is in direct line of sight.
**Detection:** 3 enemy tanks stuck vibrating in top-left spawn point.
**Test Cases to Write:**
- `test('enemy AI at intersection does not select 180-degree reverse if forward path is clear')`
- `test('blocked enemy picks valid unblocked orthogonal direction within 1 tick')`

---

## Moderate Pitfalls

### Pitfall 5: Web Audio Voice Stealing & Audio Distortion / Clipping
**What goes wrong:** Continuous engine hums, rapid fire pops, explosion noise bursts, and alarm beeps cause harsh digital clipping or crash audio context on mobile browsers.
**Why it happens:** Creating new `OscillatorNode` / `AudioBufferSourceNode` without gain staging or master limiter; leaking untracked oscillator nodes; mobile browsers suspending `AudioContext` on start.
**Consequences:** Ear-piercing crackles, distorted audio output, mobile silent failure.
**Prevention:**
- Master gain node set to 0.7 max with `DynamicsCompressorNode` on master bus.
- Monophonic or capped voice pool for sound effects (max 4 concurrent SFX).
- Single shared engine loop oscillator with dynamic frequency modulation (`frequency.setTargetAtTime`) rather than instantiating new audio nodes per frame.
- Proper user-gesture resume handler (`audioCtx.resume()`) wired to first touch/click.
**Detection:** Audio crackles when Grenade power-up explodes 4 tanks at once.
**Test Cases to Write:**
- `test('audio manager caps concurrent sound effects to max pool limit')`
- `test('engine sound modulates frequency without reallocating AudioNodes')`

### Pitfall 6: Touch Control Virtual D-Pad Latency & Diagonal Drift
**What goes wrong:** Virtual D-Pad feels floaty, sticks in previous direction on finger roll, or emits unwanted diagonals that halt tank grid alignment.
**Why it happens:** Raw `touchmove` angle calculations without deadzone hysteresis and 4-way orthogonal clamping; default browser gesture handling causing zoom/scroll delays.
**Consequences:** Unplayable on mobile devices; tank stops unexpectedly mid-combat.
**Prevention:**
- Explicit 4-way direction quadrant mapping with angular hysteresis (switching direction requires crossing a $\pm 15^\circ$ threshold beyond $45^\circ$ axis).
- CSS `touch-action: none; user-select: none;` on canvas container.
- Direct pointer event tracking with explicit Pointer ID binding (prevent multi-touch interference between D-pad and Fire button).
**Detection:** Rolling thumb from RIGHT to UP causes tank to stop moving for 300ms.
**Test Cases to Write:**
- `test('virtual dpad maps (x: 0.8, y: 0.3) strictly to RIGHT direction')`
- `test('multi-touch fire button tap does not interrupt active dpad pointer movement')`

### Pitfall 7: Base Fortification (Shovel Powerup) State Leak & Timer Overwrite
**What goes wrong:** Collecting Shovel turns HQ perimeter to steel. When effect expires, destroyed wall tiles revert to original brick instead of remaining air, or picking a second Shovel resets base to brick prematurely.
**Why it happens:** Failing to snapshot terrain state before Shovel application, or overlapping timer callbacks restoring stale tile maps.
**Consequences:** Exploitative wall regeneration or accidental Eagle exposure.
**Prevention:**
- Distinct layer for Base Defense Wall state.
- Keep track of pre-shovel damage state: micro-tiles that were already empty air before Shovel activation must NOT magically turn into brick when Shovel expires.
- Reset/extend active countdown timer ID when picking another Shovel during active fortification.
- Revert steel tiles back to brick ONLY if the steel tile was intact; air remains air.
**Detection:** Destroying brick around base, grabbing Shovel, waiting for timer to expire -> previously destroyed brick respawns.
**Test Cases to Write:**
- `test('shovel expiry preserves previously destroyed micro-tile air gaps')`
- `test('picking second shovel extends timer without flashing back to brick')`

---

## Minor Pitfalls

### Pitfall 8: Canvas Pixel Blurriness on High-DPI Displays (Papercraft Texture Crispness)
**What goes wrong:** Crisp pixel art / papercraft textures and grid edges appear blurry or smudged on Retina / high-DPI screens.
**Why it happens:** Canvas internal resolution (`canvas.width`) matches CSS display size (`canvas.style.width`) instead of device pixel ratio (`window.devicePixelRatio`).
**Prevention:**
- Scale canvas backing buffer by `window.devicePixelRatio` (capped at 2.0 or 3.0).
- Set `ctx.imageSmoothingEnabled = false` for pixel crispness or render procedural vector paper shapes scaled to virtual 1000x1000 coordinate space.

### Pitfall 9: Ice Tile Sliding Physics Breaking Grid Collision
**What goes wrong:** Tank entering ice tiles slides into walls and gets permanently embedded inside solid tiles.
**Why it happens:** Applying sliding momentum as simple delta translation without running grid-boundary collision checks during slide frames.
**Prevention:**
- Treat ice slide state as an autonomous forward velocity pulse with standard collision clipping per tick. Stop slide immediately upon obstacle contact.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 1: Grid & Micro-Tile Engine** | Whole-tile collision instead of 8x8 sub-tile chipping; corner catching on turn | 26x26 micro-grid bitmask; orthogonal coordinate snapping algorithm ($\le 4\text{px}$). |
| **Phase 2: Entity & Projectile Physics** | Bullet tunneling at variable frame rates; bullet cancellation failure | 120Hz sub-step physics tick; line segment sweep collision; bullet-vs-bullet pairing. |
| **Phase 3: Enemy AI & Spawners** | AI getting stuck in corners or vibrating in place | Grid-node direction choices; minimum forward duration timer; anti-reverse bias. |
| **Phase 4: Power-ups & State Transitions** | Shovel timer overwrite regenerating destroyed walls; Clock freeze breaking spawner | Fortification delta-state mask; Clock freeze flag decoupling timer logic from render loop. |
| **Phase 5: Audio & Tactile Mobile Polish** | Web Audio clipping; D-Pad diagonal deadlocks | Master DynamicsCompressor; 4-way orthogonal hysteresis clamp; touch-action none. |

---

## Sources

- NES Battle City (Namco 1985 / YSB 1990) disassembly & technical specification analysis.
- HTML5 Canvas 2D Game Engine Best Practices (Fixed Timestep & Micro-Tile Bitmasks).
- W3C Web Audio API Dynamics Compression & Oscillator Node Lifecycle guidelines.
