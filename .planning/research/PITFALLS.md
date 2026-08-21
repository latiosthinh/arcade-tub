# Domain Pitfalls: Kirby's Adventure Papercraft Platformer (HTML5 Canvas)

**Domain:** Side-Scrolling Platformer with Inhale/Copy-Ability System
**Researched:** 2026-08-21
**Target Architecture:** TypeScript, Canvas 2D, @arcade-carnival/game-engine (GameLoop + InputManager + SceneManager + AudioSynthesizer), Zero Runtime Dependencies
**Confidence:** HIGH — Grounded in existing codebase patterns and well-documented 2D platformer physics pitfalls

---

## Critical Pitfalls

Mistakes that cause broken movement feel, ability system complexity explosion, or game-breaking collision failures.

### Pitfall 1: Fixed-Timestep Accumulator vs Platformer Sub-Pixel Position (The Jitter Bug)

**What goes wrong:** Kirby's horizontal movement stutters visibly — inconsistent pixel jumps every few frames, especially at non-integer velocities. Camera scrolling amplifies the jitter into nauseating screen shake.

**Why it happens:** GameLoop already uses fixed-timestep accumulator (`TICK_RATE = 1000/60`, `~16.66ms`). Update runs at fixed dt but render happens at rAF timing. Position updates accumulate fractional pixels (`x += 145.5 * dt`), but rendering truncates to integer canvas pixels via implicit `fillRect`/`roundRect`. The fractional remainder oscillates between 0-pixel and 1-pixel jumps frame-to-frame.

**Consequences:** Movement looks choppy. Camera jitters. Papercraft aesthetic (hard edges, clean lines) makes sub-pixel errors MORE visible than in anti-aliased games.

**Prevention:**
- Store physics position as float (`player.x: number`), render at `Math.round(player.x)`.
- For camera: apply same rounding to camera offset AFTER lerp/deadzone logic. Never round individual entity positions relative to camera — round the final screen coordinate once.
- Consider render interpolation: pass `accumulator / TICK_RATE` as alpha to render, interpolate between previous and current position. BUT: existing games (sky-hopper, tank-1990) don't do this and work fine because they use integer-friendly speeds. Choose speeds that divide evenly into 16.66ms ticks, or accept the rounding.

**Detection:** Run at exactly 60fps — smooth. Run on 75Hz or 144Hz monitor — visible horizontal jitter on Kirby during walk.

**Symptom:** `player.x` log shows values like 100.0, 102.417, 104.833... rendering alternates between 2px and 3px jumps.

**Phase:** Core physics (Phase 1). Must decide sub-pixel strategy before any movement code.

---

### Pitfall 2: AABB Tile Collision Tunneling & One-Way Platform Edge Cases

**What goes wrong:** Kirby falls through thin platforms when moving fast (inhale-dash, ability knockback). Gets stuck inside walls after ability knockback pushes into geometry. Lands on one-way platforms from below when velocity is near-zero at apex.

**Why it happens:** Standard AABB overlap check at fixed timestep: `newPos = pos + vel * dt`. If `vel * dt > tileSize`, entity skips past collision entirely. One-way platforms need "was player ABOVE platform last frame?" check, but float precision and multi-tick accumulation break this.

**Consequences:** Kirby clips through floors during Sword dash, gets stuck inside walls after Stone ability slam, or can't jump through one-way platforms reliably.

**Prevention:**
- **Swept AABB collision** along movement vector per axis (resolve X first, then Y, or vice-versa — pick one and be consistent).
- **Velocity cap**: `maxFallSpeed = tileSize * 0.8 / dt` ensures entity never moves more than 80% of tile per tick. With 16px tiles at 60fps: `maxFallSpeed = 12.8 / 0.01666 = 768 px/s` — generous enough.
- **One-way platforms**: Check `previousBottom <= platform.top` AND `currentBottom > platform.top` AND `vel.y > 0`. Store `previousY` before physics step. Allow drop-through with down+jump.
- **Corner correction**: When Kirby hits a tile corner within 4px tolerance, nudge horizontally to slide past. Prevents "catching" on tile seams during horizontal movement.

**Detection:** Hold down+right into a tile corner — Kirby vibrates. Use Stone ability mid-air at high speed — clips through floor.

**Phase:** Core physics (Phase 1). Tile collision is foundation — every other system depends on it being solid.

---

### Pitfall 3: Copy Ability Combinatorial Explosion (The N×M Matrix Trap)

**What goes wrong:** Each copy ability needs: unique idle animation, walk animation, attack animation, aerial attack, hitbox shape, projectile type, special input combo, damage values, sound effects, and interaction rules with terrain. 6 abilities × 8 states × 3 animation frames = 144 render cases. Adding one ability adds ~24 new cases. Testing coverage implodes.

**Why it happens:** Treating abilities as monolithic player state variants instead of composable behavior modules. Hardcoding ability logic in a massive switch statement inside `Player.update()`.

**Consequences:** Adding Beam ability takes 3x longer than Sword because of copy-paste drift. Bugs in one ability don't get fixed in others. Attack hitbox timing differs between abilities for no reason.

**Prevention:**
- **Ability interface contract:**
```typescript
interface CopyAbility {
  id: string;
  onActivate(player: Player): void;
  onDeactivate(player: Player): void;
  onAttack(player: Player): AttackHitbox | null;
  onAerialAttack(player: Player): AttackHitbox | null;
  update(player: Player, dt: number): void;
  render(ctx: CanvasRenderingContext2D, player: Player, screenX: number, screenY: number): void;
}
```
- **Shared attack hitbox system**: All abilities emit `AttackHitbox` objects with position, size, damage, knockback. Collision system handles them uniformly. Abilities don't know about enemies.
- **Animation state machine shared across abilities**: `idle → walk → jump → fall → attack → hurt` is the SAME state machine. Abilities only override visual rendering and hitbox timing per state.
- **Start with 3 abilities max**: Normal (no ability), Sword (melee), Beam (ranged). Add more ONLY after the interface proves it works. Kirby's Adventure had ~24 abilities — implementing even 6 is scope-dangerous.

**Detection:** `Player.ts` exceeds 800 lines. Adding Fire ability requires modifying 5+ files. Two abilities have subtly different jump physics because attack code mutates velocity differently.

**Phase:** Ability system design (Phase 2-3). Architecture decision — must be settled before first ability is coded.

---

### Pitfall 4: Camera System Feeling Wrong (Lerp Soup vs Dead-Zone)

**What goes wrong:** Camera either lags behind Kirby (pure lerp = sluggish, player runs off-screen), snaps jarringly (no smoothing), or oscillates when Kirby reverses direction quickly (lerp with wrong parameters).

**Why it happens:** Side-scrolling cameras are fundamentally harder than sky-hopper's vertical camera (which only scrolls up, never down). Horizontal platformers need: forward-look bias, dead-zone so small movements don't scroll, smooth direction reversal, and room transition handling.

**Consequences:** Motion sickness on mobile. Player can't see enemies ahead. Camera fights the player during precision platforming.

**Prevention:**
- **Dead-zone + leading approach** (what Kirby's Adventure actually uses):
```
// Camera only scrolls when player exits center dead-zone
deadZoneLeft = screenWidth * 0.35
deadZoneRight = screenWidth * 0.65
if (player.screenX < deadZoneLeft) camera.x -= deadZoneLeft - player.screenX
if (player.screenX > deadZoneRight) camera.x += player.screenX - deadZoneRight
// Clamp to level bounds
camera.x = clamp(camera.x, 0, levelWidth - screenWidth)
```
- **No Y-axis scrolling** for standard rooms (Kirby games use fixed-height rooms). Vertical scrolling only in tall rooms with explicit vertical dead-zone.
- **Room transitions**: Hard cut or horizontal slide wipe between rooms. Don't try to maintain camera continuity across room boundaries.
- **Existing sky-hopper Camera is vertical-only** (`Camera.y`, `toScreenY`). DO NOT extend it — write a new `SideScrollCamera` class with X+Y support.

**Detection:** Walk right, stop, walk left — camera overshoots then snaps back. Jump repeatedly — camera bobs vertically when it shouldn't in a flat room.

**Phase:** Camera system (Phase 1-2). Camera must be solid before level design begins — everything else looks broken if camera is wrong.

---

### Pitfall 5: InputManager `justPressed` Getting Swallowed Between Fixed-Timestep Ticks

**What goes wrong:** Quick tap inputs (jump, inhale trigger) get missed because `justPressed` was true during an update tick that ran before the accumulator consumed it, then cleared before the next tick.

**Why it happens:** GameLoop accumulator may run 0, 1, or 2+ updates per frame. InputManager.update() clears `_justPressed` set. If called inside the accumulator loop, a frame with 2 update ticks clears `justPressed` after first tick — second tick misses it. But if called outside the loop (like sky-hopper does at line 242), a frame with 0 update ticks still clears it.

**Current pattern in sky-hopper:** `inputManager.update()` is called AFTER the while-loop, once per frame. This means `justPressed` persists across all fixed-timestep ticks within one frame — works for simple games but means `justPressed` can trigger TWICE if accumulator runs 2 ticks.

**Consequences for platformer:** Double-jump triggered when it shouldn't be. Inhale activates and deactivates in same frame. Jump input eaten on laggy frames.

**Prevention:**
- **Input buffering**: Store `jumpBufferTimer` (typically 100ms / 6 frames). When jump pressed, set timer. Consume it when grounded. This is standard platformer feel and also masks the tick-alignment issue entirely.
- **Coyote time**: Allow jump for 80ms after leaving platform edge. Combined with input buffer, makes the `justPressed` tick alignment irrelevant.
- Keep `inputManager.update()` OUTSIDE the accumulator loop (matching sky-hopper pattern). Accept that `justPressed` may span 1-2 physics ticks. Input buffering handles the rest.

**Detection:** Mash jump rapidly while landing — occasional missed jumps. Hold jump while falling off ledge — can't jump even though landed within 2 frames.

**Phase:** Core physics (Phase 1). Input buffering and coyote time are non-negotiable for platformer feel.

---

### Pitfall 6: Inhale Mechanic State Machine Complexity (Inhale → Hold → Swallow/Star-Spit)

**What goes wrong:** Inhale has a multi-step state machine: `neutral → inhaling (suction cone active) → holding (enemy in mouth, can walk but not fly) → swallow (gain ability) OR star-spit (ranged projectile)`. Transitions between states create edge cases: What if Kirby gets hit while holding? What if suction cone catches two enemies? What if Kirby walks off a ledge while inhaling?

**Why it happens:** Inhale is not one action — it's a modal state that affects movement, collision, animation, ability gain, AND projectile spawning. Treating it as a simple "press button → thing happens" leads to contradictory states.

**Consequences:** Kirby gets stuck in "holding" state permanently. Two enemies inhaled simultaneously crash the ability-copy logic. Swallowing during damage invincibility grants ability but also kills Kirby.

**Prevention:**
- **Explicit state machine with entry/exit guards:**
```typescript
enum KirbyState {
  Normal, Inhaling, Holding, Swallowing, StarSpitting,
  Attacking, Hurt, Dead, Floating // (puff-up flying)
}
```
- **Transition table** — enumerate every valid transition. Invalid transitions are rejected, not silently broken:
  - `Hurt` → always drops held enemy, cancels inhale
  - `Inhaling` + enemy contact → `Holding` (store enemy type for ability lookup)
  - `Holding` + attack button → `StarSpitting` (fires star projectile)
  - `Holding` + down button → `Swallowing` (gain copy ability if enemy has one)
  - `Holding` + hit → drop enemy, enter `Hurt`
- **One enemy at a time in mouth.** Kirby's Adventure allows inhaling multiple small enemies but only the last one grants ability. Simplify: first enemy contact during inhale → immediately transition to Holding.
- **Inhale suction cone is a hitbox, not a physics force.** Don't try to simulate actual suction physics — just check if enemy overlaps the cone-shaped AABB in front of Kirby.

**Detection:** Press inhale near two enemies simultaneously — game freezes or grants wrong ability. Get hit while holding enemy — stuck in holding state forever.

**Phase:** Inhale/ability system (Phase 2-3). Must design state machine BEFORE implementing any individual ability.

---

## Moderate Pitfalls

### Pitfall 7: Mobile Touch Controls for Precision Platforming (D-Pad Won't Cut It)

**What goes wrong:** Tank-1990's 4-way D-Pad touch control doesn't work for platformers. Platformers need: analog horizontal movement OR left/right buttons, dedicated jump button, dedicated attack/inhale button, AND up/down for looking/crouching. That's 5+ touch zones vs tank-1990's 2 (dpad + fire).

**Why it happens:** Reusing tank-1990's `TouchControls` class which assumes 4-way cardinal D-Pad. Platformers need simultaneous horizontal hold + jump tap + attack tap. Three independent touch points.

**Prevention:**
- **New touch layout for platformer:**
  - Left side: Left/Right arrow buttons (not analog stick — platformers need discrete directions)
  - Right side bottom: Jump button (large, easy to hit)
  - Right side top: Attack/Inhale button
  - Optional: Up/Down as small contextual buttons (for inhale-swallow, looking up/down)
- **Simultaneous multi-touch**: Player holds Right while tapping Jump. Must track independent pointer IDs per button zone (tank-1990's `TouchControls` already does pointer ID tracking — good pattern to follow).
- **Button size**: Minimum 48px CSS touch targets per WCAG. Jump button should be 64px+ because it's hit most frequently.
- **No virtual joystick**: Analog sticks are terrible for platformers on touch — binary left/right is correct.

**Detection:** Player can't hold right and jump at the same time. Or: jump button too small, player misses 30% of intended jumps.

**Phase:** Mobile controls (Phase 4-5). Can stub with keyboard-only first, but mobile layout must be designed early since it constrains UI.

---

### Pitfall 8: Level Data Size & Management Bloat

**What goes wrong:** Hardcoding level tile maps as TypeScript arrays (like tank-1990's `stages.ts`) works for 35 small 13×13 grids. Kirby levels are 10-20 screens wide × 1-2 screens tall. A single level tile map at 16px tiles is ~160×15 = 2,400 tiles. 8 levels = 19,200 tile entries hardcoded in TypeScript.

**Why it happens:** Following the tank-1990 pattern of `export const STAGES: number[][][] = [...]` for a game with fundamentally different level scale.

**Consequences:** Level files become 50KB+ of TypeScript arrays. Changing one tile requires finding it in a wall of numbers. No visual editing possible.

**Prevention:**
- **JSON level files** loaded at runtime. Each level is a separate `.json` file with tile grid + entity spawn points + room transition triggers.
- **Run-length encoding** for tile data: Kirby levels have large stretches of empty sky and ground. RLE compresses 2400 tiles to ~200 entries.
- **Room-based structure**: Each "room" is one screen worth of tiles. Levels are sequences of rooms with transition doors/doors. This matches how Kirby's Adventure actually works.
- **Keep it simple**: Don't build a level editor. Hand-author JSON. 4-6 short levels is plenty for scope.
- **Lazy load rooms**: Only decode/parse the current room and adjacent rooms. Don't load all 8 levels into memory at startup.

**Detection:** `levels.ts` exceeds 2000 lines. Build size grows 100KB+ from level data alone.

**Phase:** Level system (Phase 2). Must decide format before creating any level content.

---

### Pitfall 9: Performance Death by Particles + Entities + Scrolling on Mobile

**What goes wrong:** Frame rate drops below 30fps on mid-tier mobile during busy scenes: 15 enemies + particle effects + scrolling background + ability projectiles + inhale suction visual.

**Why it happens:** Every game in the collection draws everything every frame with no culling. Sky-hopper draws all platforms in view. This works when viewport shows ~20 entities. A Kirby level with enemies, blocks, collectibles, particles, and scrolling parallax background can hit 100+ draw calls per frame.

**Consequences:** Game feels sluggish on mobile. Battery drain. Touch input latency increases.

**Prevention:**
- **Off-screen culling**: Only draw entities within `camera.x - margin` to `camera.x + screenWidth + margin`. This is the single biggest win. Sky-hopper does basic culling (`if (sy < -30 || sy > h + 30) continue`) — replicate for ALL entity types.
- **Object pooling for particles and projectiles**: Don't allocate/GC particle objects. Pre-allocate pool of 200 particles, reuse dead ones. Existing `ParticleSystem` in sky-hopper uses array push/splice — this causes GC pressure. Use a fixed-size circular buffer instead.
- **Limit simultaneous particles**: Cap at 100 active particles. New particles replace oldest when pool exhausted.
- **Background layers**: Pre-render static background to off-screen canvas once, blit section per frame. Don't redraw gradient + stars + decorations every frame.
- **Entity budget**: Max 12 active enemies per room. Max 4 active projectiles per ability. Hard caps prevent worst-case scenarios.

**Detection:** Profile with Chrome DevTools on throttled CPU (4x slowdown). If frame time exceeds 16ms with 8+ enemies on screen, optimization needed.

**Phase:** Performance (Phase 4-5, after core gameplay works). Don't pre-optimize but design with pools/culling from start.

---

### Pitfall 10: Floating/Flying (Puff-Up) Breaking Level Design

**What goes wrong:** Kirby can fly indefinitely by puffing up and flapping. This trivializes every platforming challenge — players just float over everything. But removing flight removes a core Kirby mechanic.

**Why it happens:** Implementing authentic flight without designing levels around it. In real Kirby games, ceilings, wind currents, enemies above, and ability-locked doors prevent flight from trivializing levels.

**Consequences:** Players never engage with platforming, enemies, or abilities. Just float from entrance to exit.

**Prevention:**
- **Flight is slow**: Puff-up flight speed should be 40-50% of walk speed. Players CAN fly over obstacles but it's SLOWER than platforming through them.
- **Ceiling constraints**: Most rooms have low ceilings. Flight is useful for short vertical gaps, not horizontal traversal.
- **Flight-cancel on inhale/attack**: Kirby drops copy ability when puffing up (authentic to original). Players must choose: fly OR use ability.
- **Enemies in air**: Place flying enemies (Bronto Burts equivalent) in upper areas to punish lazy floating.
- **Consider deferring**: Flight is complex (new state, new controls, new level design constraints). Could be a v2 feature. Core game works without it.

**Detection:** Playtest: does the player ever walk on the ground? If they float through 80% of a level, flight is too strong or ceilings are too high.

**Phase:** Player mechanics (Phase 2) if included, or explicitly deferred to backlog.

---

## Minor Pitfalls

### Pitfall 11: Papercraft Art Style Inconsistency Across 44+ Games

**What goes wrong:** Kirby game uses different papercraft visual language than existing 43 games. Different shadow offsets, line weights, color palette, or edge treatment breaks the collection's cohesive look.

**Prevention:**
- Match existing constants: shadow color `rgba(62, 39, 35, 0.2-0.25)`, stroke `#3E2723` at 1.5-2px, highlight `#FFFDF8`, background parchment gradient `#F4EAD4 → #E8DEC8`.
- Kirby should look like a pink construction-paper cutout with folded-paper edges, same as sky-hopper's green paper player.
- Enemy sprites: folded origami creatures with visible paper texture lines.
- All UI overlays: taped placard pattern matching sky-hopper/tank-1990 overlay style.

**Phase:** Visual design (all phases). Establish palette in Phase 1, enforce throughout.

---

### Pitfall 12: GameLoop Fixed 800×600 Canvas Assumption

**What goes wrong:** GameLoop constructor defaults to `800×600`. Existing games use varied sizes (tank-1990 uses 480×416). Side-scrolling platformer needs wider aspect ratio (e.g., 800×450 or 960×540 for 16:9) to show horizontal space ahead.

**Prevention:**
- Set explicit canvas dimensions in `index.html`: `<canvas id="game" width="800" height="480"></canvas>`. GameLoop reads `getAttribute('width'/'height')` and uses them.
- 800×480 gives ~16:10 aspect ratio, good compromise between horizontal visibility and vertical jump space.
- Test on mobile portrait orientation — GameLoop's contain-mode scaling will letterbox, which is fine.

**Phase:** Project setup (Phase 1). Canvas size affects all layout decisions.

---

### Pitfall 13: Scene Lifecycle Leak When Switching Games

**What goes wrong:** Player navigates away from Kirby game back to game list. Touch event listeners, audio nodes, particle pools, and interval timers keep running in background.

**Why it happens:** Each game creates its own InputManager, event listeners, and potentially audio oscillators. The playables-adapter `onPause` callback exists but games must explicitly clean up.

**Prevention:**
- Implement `destroy()` method on KirbyScene that calls:
  - `inputManager.destroy()` (removes keyboard listeners)
  - Touch control cleanup (remove pointer event listeners)  
  - Cancel any `setInterval`/`setTimeout` timers
  - Disconnect audio nodes
- Follow sky-hopper pattern: `destroy()` removes click handler and calls `inputManager.destroy()`.

**Phase:** Bootstrap (Phase 1). Wire up lifecycle from the start.

---

## Integration Pitfalls with Existing Engine

### Integration 1: GameLoop's `update(dt)` Receives Fixed dt, Not Wall-Clock dt

The GameLoop accumulator already provides fixed `dt = TICK_RATE / 1000 = 0.01666s`. Don't divide by 1000 again. Don't multiply by a second time factor. Sky-hopper's `Player.update(dt)` correctly uses `this.vy += this.gravity * dt` where gravity is `1000` (px/s²) and dt is seconds. Follow same convention.

**Trap:** Writing `player.vy += gravity * dt * dt` (double-applying time) or using `gravity = 9.8` (real-world units meaningless in pixel space).

### Integration 2: InputManager Has No Touch Support

`InputManager` only handles `keydown`/`keyup`. Touch controls must be a separate system (like tank-1990's `TouchControls`). Don't try to inject touch events as fake keyboard events — it creates phantom key-stuck bugs.

**Trap:** Calling `inputManager.isDown('ArrowRight')` for touch input. Touch must feed its own state that the game scene checks alongside keyboard input.

### Integration 3: AudioSynthesizer Singleton Has Limited Sound Palette

`audio` export from game-engine is a singleton `AudioSynthesizer` with 7 methods: `playClick`, `playScore`, `playBounce`, `playExplosion`, `playPowerup`, `playError`, `playVictory`. Kirby needs: inhale whoosh, swallow pop, ability-get jingle, star-spit fire, enemy hit, floating puff, land thud, door transition.

**Prevention:** Create game-specific `KirbyAudio` class (like tank-1990's `TankAudio`) with custom Web Audio synthesis for each Kirby-specific sound. Reuse `audio.playBounce()` for generic bounce, but don't force-fit Kirby sounds into generic methods.

### Integration 4: SceneManager Is String-Based, Not Instance-Based

`SceneManager` stores scene names as strings with `push/pop/replace`. But `GameLoop.setScene()` takes a `GameScene` instance. These are two separate systems that don't talk to each other. Existing games (sky-hopper, tank-1990) don't use `SceneManager` at all — they manage game state internally with enum state machines.

**Trap:** Trying to use `SceneManager` for room transitions and discovering it doesn't actually manage scene objects.

**Prevention:** Use internal game state enum like sky-hopper: `'ready' | 'playing' | 'paused' | 'gameover' | 'victory'`. For room transitions, manage room loading within the single KirbyScene instance.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 1: Core Physics & Tile Collision** | Sub-pixel jitter (Pitfall 1); AABB tunneling (Pitfall 2); canvas size wrong (Pitfall 12) | Round render coords; swept AABB per-axis; set 800×480 canvas. |
| **Phase 2: Player State Machine & Inhale** | Inhale state machine edge cases (Pitfall 6); InputManager `justPressed` misfire (Pitfall 5) | Explicit state transition table; input buffering + coyote time. |
| **Phase 3: Copy Ability System** | Ability combinatorial explosion (Pitfall 3); scope creep beyond 3 abilities | Ability interface contract; hard cap at Normal + Sword + Beam initially. |
| **Phase 4: Camera & Level System** | Camera feel wrong (Pitfall 4); level data bloat (Pitfall 8) | Dead-zone + leading camera; JSON room files with RLE. |
| **Phase 5: Enemies & Combat** | Performance with many entities (Pitfall 9); flight trivializing levels (Pitfall 10) | Off-screen culling; entity budget caps; ceiling constraints. |
| **Phase 6: Mobile & Polish** | Touch control inadequacy (Pitfall 7); art style drift (Pitfall 11) | New 3-zone touch layout; papercraft palette enforcement. |

---

## Scope Containment Warning

**The #1 risk for this game is scope creep.** Kirby's Adventure has 24+ copy abilities, 7 worlds with 40+ stages, mini-games, boss battles, and meta-game collectibles. A reasonable scope for this collection:

| Include | Exclude (defer or cut) |
|---------|----------------------|
| 3 copy abilities (Normal, Sword, Beam) | More than 5 abilities |
| 4-6 rooms per level, 2-3 levels | World map, branching paths |
| 3-4 enemy types | Boss battles (unless very simple) |
| Inhale → Hold → Swallow/Spit core loop | Combining abilities, ability rooms |
| Basic floating/puff-up (simplified) | Full Kirby flight with air puff attacks |
| Touch controls for mobile | Tilt controls, gesture shortcuts |

Every feature beyond this table should require explicit justification.

---

## Sources

- Existing codebase analysis: `@arcade-carnival/game-engine` (GameLoop, InputManager, SceneManager, AudioSynthesizer)
- Existing game patterns: sky-hopper (Camera, Player, ParticleSystem), tank-1990 (TouchControls, ViewportManager, GridMap, types)
- Platform physics best practices: swept AABB, coyote time, input buffering are well-established patterns in 2D platformer development
- Kirby's Adventure (NES, HAL Laboratory 1993) game design analysis for inhale/copy mechanics
