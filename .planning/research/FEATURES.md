# Feature Landscape

**Domain:** Retro Arcade Action Platformer / The Legend of Kage Papercraft Tribute
**Researched:** 2026-08-21
**Overall Confidence:** HIGH (Verified against original 1985 Taito Arcade & NES release mechanics, Speedrun documentation, and ArcadeTub modular architecture)

## Feature Landscape

### Table Stakes (Users Expect These)

Features players expect from a faithful *The Legend of Kage* adaptation. Missing any makes the ninja action feel hollow or inaccurate.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Super-Jump Physics Engine** | Core identity of Kage. Leaps reach ~2.5–3 screen heights with smooth gravity arc, rapid ascent, and full horizontal air drift control. | HIGH | Needs custom non-linear physics curve. Player can change direction mid-air and trigger attacks while rising or falling. |
| **Tree Trunk & Branch Collision** | Vertical navigation in Forest. Player can land on branch platforms, climb/slide on bamboo trunks, leap from treetops, or fall to forest floor. | MEDIUM | One-way platform landing on branches + vertical pole/trunk grip detection. |
| **Dual-Weapon Combat System** | Simultaneous melee and ranged combat: button A throws shuriken (paper star), button B performs short-range katana sword slash. | MEDIUM | Distinct cooldowns. Sword slash has fast startup, shuriken has projectile travel time. |
| **Sword Deflection / Parrying** | Slashing an incoming enemy shuriken or projectile destroys/deflects it. Core survival loop. | MEDIUM | Sword slash hitbox cancels overlapping enemy projectile entities with clash sound and paper particle burst. |
| **Multi-Directional Shuriken Throwing** | Throw shurikens in 4 cardinal and 4 diagonal directions based on movement input (grounded or mid-air). | LOW | Directional vector calculation based on D-pad input during throw frame. |
| **4-Stage Gameplay Loop** | Iconic 4-scene progression: Stage 1 Bamboo Forest (vertical/horizontal hybrid) → Stage 2 Castle Moat (water hazard & high stone wall climbing) → Stage 3 Castle Interior/Corridor (stairs/chambers vertical climbing) → Stage 4 Boss Sanctuary/Chamber (rooftop/treetop rescue). | HIGH | Each stage has distinct scrolling logic (vertical, horizontal, interior stair climber, arena). |
| **Seasonal Visual Cycle (4 Loops)** | Completing all 4 stages advances the season: Spring (Cherry Blossoms) → Summer (Lush Green) → Autumn (Falling Leaves) → Winter (Snow). | MEDIUM | Palette and particle swap per loop cycle. Reuses stage layouts with altered environmental assets and particle overlays. |
| **Core Enemy Archetypes** | Red Ninjas (basic runners/jumpers), Blue Ninjas (fast runners, aggressive shuriken throwers), White Ninjas (stealth/smoke bomb leapers), Fire Monks (ground-based fire-breathing attacks), Sorcerer/Yukinosuke (bosses). | HIGH | State-machine driven AI with spawning queues, jump arcs, and attack timers. |
| **Single-Hit Death & Lives System** | Arcade authenticity: any unblocked enemy contact, blade, or projectile kills Kage in one hit. Start with 3 lives. | LOW | Crisp respawn flow at current stage checkpoint or ground level. Game over on 0 lives with continue screen. |
| **Power-Up Items (Orbs / Scrolls)** | Red/Blue Crystal Balls and Ninjutsu Scrolls dropping from monks or hidden triggers granting temporary invincibility, full-screen enemy clear (Ninjutsu earthquake/lightning), or speed/shuriken upgrades. | MEDIUM | Timed buff state machine modifying player speed, invulnerability frames, and clearing active enemy pool. |
| **Rescuing Princess Kiri** | End of Stage 4 triggers Princess rescue sequence, followed by her immediate re-kidnapping (or brief intermission cutscene) setting up the next season loop. | LOW | Scripted cutscene/transition event before advancing loop counter and season index. |
| **Mobile Virtual Controls** | Touchscreen virtual D-pad + independent Shuriken & Sword action buttons, responsive multi-touch support. | MEDIUM | Follows ArcadeTub touch overlay patterns (`TouchControls.ts`). |
| **Procedural Web Audio SFX** | Blade slash whoosh, metallic deflection clash, jump wind gust, monk fire crackle, stage completion jingle, death thud. Zero external audio assets. | MEDIUM | Procedural synthesis via `AudioSynthesizer` (white noise bursts, frequency-modulated square/saw oscillators). |

---

### Differentiators (Competitive Advantage)

Unique mechanics and aesthetic twists elevating the game within ArcadeTub's 2D Papercraft aesthetic.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Tactile Origami & Cardboard Papercraft Aesthetic** | Handcrafted folded paper ninjas (crease lines, paper shadows), corrugated cardboard trees/castles, and cut-paper layered foliage. | MEDIUM | Multi-layer 2D Canvas rendering with procedural drop shadows, paper grain texture, and crease outlines. |
| **Dynamic Seasonal Paper Confetti Weather** | Spring pink cherry blossom petals, Summer pollen drift, Autumn spinning origami maple leaves, Winter falling paper snowflake cutouts. | LOW | High-performance particle engine with 2D rotation, turbulence sway, and depth layers. |
| **Dynamic Paper-Slice Deflection FX** | Deflected shurikens fold in half or slice into confetti confetti scraps with a paper-tear snap sound. | LOW | Enhances the visceral feel of sword parrying without adding complex physics. |
| **Corrugated Castle Wall Climbing** | Climbing castle walls in Stage 2 shows realistic paper grip animation and cardboard dust particles when sliding or wall-jumping. | MEDIUM | Wall-stick/slide state machine allowing vertical leaps up the stone tower. |
| **Scroll Unrolling Stage Transitions** | Transitions between stages stylized as traditional Japanese emakimono (horizontal picture scrolls) rolling and unrolling across screen. | LOW | Canvas wipe effect simulating painted parchment unrolling over the viewport. |
| **Responsive Dual-Action Touch Ergonomics** | Optimized thumb placement allowing fluid simultaneous jumping, slashing, and angled shuriken firing on mobile screens. | MEDIUM | Slide-to-attack and button chord gestures tuned for fast twitch arcade inputs. |

---

### Anti-Features (Avoid to Prevent Scope Creep & Bloat)

Features intentionally excluded to protect the arcade rhythm, maintain the 350KB bundle budget, and keep pure vanilla Canvas 2D performance.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **Complex Health Bar / RPG Stats** | Modern games often give players HP bars and upgrade trees. | Ruins the intense, fast-paced "one mistake kills" arcade tension of original *Legend of Kage*. | Retain 1-hit death with crystal ball invincibility and Ninjutsu scroll power-up pickups. |
| **Heavy External Physics Engines (Matter.js, Box2D)** | Realistic ragdolls or complex rigid-body branch interactions. | Bloats bundle size, violates zero-dependency constraint, makes super-jump floatiness unpredictable. | Custom lightweight kinematic physics (~150 lines) with fixed-timestep Euler integration. |
| **Complex Multi-Button Combos / Fighting Game Inputs** | Players might expect fighting game style special moves (e.g., quarter-circle fireball). | Overcomplicates virtual mobile controls and dilutes classic 2-button arcade simplicity. | Stick to D-pad + Shuriken + Sword with directional modifiers (e.g., Up+Slash = vertical slice). |
| **Endless Procedural Roguelike Generation** | Endless replayability through randomly assembled forest rooms. | Kage relies on rhythmic pacing, specific enemy spawn patterns, and tight vertical stage progression. | Curated 4-stage layouts with procedural enemy wave triggers and 4 seasonal loop variations. |
| **Raster Spritesheets & MP3 Audio Files** | Pre-rendered graphics and recorded audio tracks. | Violates ArcadeTub zero-asset rule, blows bundle budget, causes asset loading latency. | 100% procedural Canvas 2D vector drawing and Web Audio API synthesizer. |
| **True 3D / WebGL Camera Angles** | Cinematic 3D tree swinging or 3D camera rotation. | Overkill for retro 2D arcade tribute, adds runtime overhead and heavy math dependencies. | 3-layer 2D parallax cardboard layers with Canvas depth scaling. |

---

## Feature Dependencies

```
[Custom Kinematic Physics Engine]
    ├── [Super-Jump Arc & Mid-Air Air-Steering]
    │       ├── [Tree Canopy & Branch Platform Collision]
    │       └── [Castle Wall Grip & Wall-Jump]
    └── [Ground Run & Fall Acceleration]

[Dual-Weapon Combat Engine]
    ├── [Multi-Directional Shuriken Spawner]
    └── [Sword Slash Hitbox System]
            └── [Projectile Deflection & Parrying Matrix]
                    └── [Paper Slice FX & Audio Clash]

[Enemy AI & Wave Spawner]
    ├── [Enemy State Machine (Patrol, Leap, Ambush, Attack)]
    │       ├── [Red Ninja: Basic Grunt (Ground Run + Low Leap)]
    │       ├── [Blue Ninja: Agile Assassin (Fast Leap + Shuriken Throw)]
    │       ├── [White Ninja: Elite Shadow (Smoke Teleport + High Shuriken)]
    │       ├── [Fire Monk: Ranged Threat (Ground Stand + Fireball Breath)]
    │       └── [Sorcerer / Yukinosuke: Boss AI (Teleport, Multi-Fire, Blade Combo)]
    └── [Stage Spawn Director (Edge Spawns, Tree Drops, Wave Pacing)]

[Stage & Progression Framework]
    ├── [4-Stage Layout Engine]
    │       ├── [Stage 1: Bamboo Forest (Vertical/Horizontal Trees)]
    │       ├── [Stage 2: Castle Moat (Moat Water, High Walls)]
    │       ├── [Stage 3: Castle Interior (Corridors, Stairs, Tight Combat)]
    │       └── [Stage 4: Boss Chamber / Sanctuary (Boss Fight + Rescue)]
    └── [Seasonal Loop Cycle (Loop 1: Spring → Loop 2: Summer → Loop 3: Autumn → Loop 4: Winter)]
            └── [Palette Switcher & Seasonal Particle Emitter]

[Player State & Power-Ups]
    ├── [1-Hit Death, Respawn, Lives System]
    └── [Power-Up Drops (Crystal Orb Invincibility, Ninjutsu Scroll Screen-Clear)]

[Presentation & Controls]
    ├── [Papercraft Canvas 2D Renderer (Origami Ninjas, Cardboard Stages)]
    ├── [Procedural Web Audio Sound Engine]
    └── [Mobile Virtual D-Pad + Dual Action Buttons]
```

### Dependency Notes

- **Sword Deflection requires Sword Slash Hitbox System & Projectile Spawner:** Collision detection must evaluate overlapping active slash bounding boxes with incoming hostile projectile velocities before registering player damage.
- **Tree Canopy & Branch Collision requires Custom Kinematic Physics:** Super-jump velocity and falling deceleration determine whether player lands on top of one-way branch colliders or drops through.
- **Seasonal Loop Cycle requires 4-Stage Layout Engine:** The loop system wraps the 4 distinct stage scenes and reapplies visual theme tokens upon completing Stage 4.

---

## MVP Definition

### Launch With (v10.0 MVP)

- [x] **Super-Jump Physics:** Full 3-screen vertical jump, crisp gravity curve, mid-air steering.
- [x] **Tree & Branch Navigation:** Bamboo forest trunks, branch one-way platforms, treetop landing.
- [x] **Dual-Weapon Combat:** 8-direction Shuriken throwing + Melee Sword Slash.
- [x] **Sword Deflection:** Slash parries and destroys incoming enemy shurikens.
- [x] **Core Enemy Quartet:** Red Ninja, Blue Ninja, Fire Monk, Sorcerer Boss.
- [x] **4-Stage Core Loop:** Bamboo Forest, Castle Moat, Castle Interior, Boss Chamber.
- [x] **4-Season Visual Cycle:** Spring (Sakura), Summer (Green), Autumn (Leaves), Winter (Snow).
- [x] **Power-Up Items:** Red Crystal (Invincibility), Scroll (Screen-clear Ninjutsu).
- [x] **Papercraft 2D Aesthetics:** Origami sprites, corrugated textures, layered parallax backdrops.
- [x] **Procedural Audio & Mobile Controls:** Web Audio SFX + Virtual D-pad/Dual buttons.
- [x] **Hub Integration & Unit Tests:** Standalone `games/legend-of-kage/`, catalog registration, Vitest suites.

### Add After Validation (v10.1 Polish)

- [ ] **White Ninja Stealth/Smoke Ambush:** Extra elite enemy variant spawning in higher loops.
- [ ] **Bonus Target Scoring & Score Multipliers:** Consecutive mid-air kills awarding escalating multiplier points (100 -> 200 -> 400 -> 800 -> 1600).
- [ ] **Secret Scroll Drops:** Hidden scrolls revealed by slashing specific tree leaves or wall sconces.

### Future Consideration (v11.0+)

- [ ] **Challenge Modes:** Boss Rush mode, Endless Tree Jump Survival mode.
- [ ] **Alternate Ninja Characters:** Playable Kunoichi (faster, lighter shurikens) or Samurai (heavy blade, armor).

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Super-Jump & Air Steering | HIGH | MEDIUM | P1 |
| Tree / Branch Collision & Climbing | HIGH | MEDIUM | P1 |
| Dual-Weapon Combat & Shuriken Throwing | HIGH | LOW | P1 |
| Sword Deflection Mechanic | HIGH | LOW | P1 |
| 4-Stage Loop & Stage Transition System | HIGH | HIGH | P1 |
| Core Enemy Types (Red, Blue, Monk, Boss) | HIGH | MEDIUM | P1 |
| Seasonal Visual & Particle Cycle | HIGH | MEDIUM | P1 |
| Power-Ups (Crystal Ball & Ninjutsu Scroll) | MEDIUM | LOW | P1 |
| Papercraft Procedural Visuals & SFX | HIGH | MEDIUM | P1 |
| Mobile Virtual Touch Controls | HIGH | LOW | P1 |
| White Ninja Stealth Teleport | MEDIUM | MEDIUM | P2 |
| Consecutive Air Kill Multiplier Score | MEDIUM | LOW | P2 |
| Secret Stage Item Triggers | LOW | LOW | P3 |

---

## Competitor Feature Analysis

| Feature | Original 1985 Arcade (Taito) | NES / Famicom Port | Our Papercraft Implementation |
|---------|------------------------------|-------------------|------------------------------|
| **Super-Jump** | Fixed height with moderate mid-air steering. | Slightly floaty, single-screen camera snap. | Smooth responsive physics curve, camera leading, full directional air control. |
| **Deflection** | Automatic slash collision with enemy projectiles. | Exact hit frame required. | Forgiving, tactile slash hitbox with paper-slice particle burst and audio clash. |
| **Stage Progression** | 4-scene loop repeated endlessly across 4 seasons. | 4-scene loop with Princess rescue intermissions. | 4-stage progression with smooth emakimono scroll wipe transitions and 4 distinct seasonal papercraft palettes. |
| **Graphics & Audio** | 8-bit / 16-bit arcade pixel art and FM synth chip. | 8-bit Famicom chiptune + tile sprites. | 100% Procedural Canvas 2D origami cutouts, cardboard textures, confetti weather, Web Audio synth. |
| **Controls** | 8-way arcade joystick + 2 buttons. | NES D-pad + A/B buttons. | Virtual mobile D-pad + Dual Buttons with responsive multi-touch + Keyboard bindings. |

---

## Sources

- *The Legend of Kage* Arcade (1985) & NES (1986) gameplay mechanics and speedrun technical breakdown
- StrategyWiki: *The Legend of Kage* Walkthrough, Enemy Behaviors, and Item Spawns (https://strategywiki.org/wiki/The_Legend_of_Kage)
- ArcadeTub Codebase: `packages/game-engine/`, `packages/playables-adapter/`, and `games/kirby-adventure/` architecture
- ArcadeTub Seed Specification: `SEED-007-legend-of-kage.md`

---
*Feature research for: The Legend of Kage — Papercraft Ninja Action*
*Researched: 2026-08-21*
