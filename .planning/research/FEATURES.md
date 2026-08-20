# Feature Landscape

**Domain:** 2D Grid Tactical Arcade / Tank 1990 (Battle City) Papercraft Minigame
**Researched:** 2026-08-20
**Overall Confidence:** HIGH (Directly derived from authentic Battle City / Tank 1990 ROM mechanics & ArcadeTub architecture)

## Table Stakes

Features required for authentic Battle City / Tank 1990 gameplay. Missing any makes the game feel broken or counterfeit.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **13x13 (26x26 Sub-tile) Terrain Grid** | Core game world structure. Bricks, steel, water, trees/grass, ice, and eagle base. | Med | Sub-tile (8x8) destruction precision needed for brick chipping. |
| **Quarter-Tile Brick Destruction** | Bullets chip away portions of brick walls (4x4 or 8x8 blocks) rather than full 16x16 tiles. | Med | Essential for carving narrow corridors and shooting around corners. |
| **Defensible Eagle / Phoenix HQ** | Central win/lose condition at bottom. If destroyed by player or enemy bullet, instant Game Over. | Low | Must support brick wall perimeter and base destroyed sprite/confetti state. |
| **Terrain Modifiers (Water, Trees, Ice)** | Water blocks tank passage but lets bullets fly. Trees conceal tanks. Ice causes movement drift. | Med | Water requires raycast check for bullets vs AABB for tanks. Ice needs sliding inertia vector. |
| **4-Tier Player Tank Upgrades** | Tier 1 (Slow single shot) → Tier 2 (Fast single shot) → Tier 3 (Dual fast shots) → Tier 4 (Armor-piercing cannon). | Med | Tier 4 destroys steel and clears trees/grass. Loss of tier or life on death. |
| **4 Enemy Tank Archetypes** | Basic Tank (100pt), Fast Cruiser (200pt), Rapid Fire Tank (300pt), Heavy Armor Tank (400pt, 4 hits). | Med | Heavy tank changes color palette (green → yellow → red) per hit. |
| **Flashing / Bonus Enemy Tanks** | 4th, 11th, 18th spawned enemies flash red/white. Destroying one drops a random powerup. | Low | Fixed sequence per 20-tank wave. Spawns item at random free map coordinate. |
| **Core Powerup Drops** | Star (tier upgrade), Shovel (temporary steel base), Grenade (screen clear), Clock (enemy freeze), Helmet (shield), Tank (+1 life). | Med | Shovel requires timed revert from steel back to brick (flashing warning before revert). |
| **Bullet-vs-Bullet Cancellation** | Two opposing bullets colliding head-on destroy each other mid-air. | Low | Core tactical defense mechanic against enemy incoming fire. |
| **Grid Corner Snapping / Alignment Assist** | Tanks turning perpendicular to narrow corridors auto-snap to sub-tile grid without snagging. | Med | Prevents clunky mobile/keyboard controls where tanks get stuck on 1-pixel corner overhangs. |
| **20-Enemy Wave Progression & HUD** | 20 enemy tanks queued per stage, 3 spawn points at top, max 4-6 simultaneous active enemies. | Med | HUD sidebar shows remaining enemy tank icons, player lives, stage number, score. |
| **Stage Clear Tally Screen** | Classic end-of-stage animated breakdown showing kill counts per enemy class and point totals. | Low | Essential retro pacing and satisfaction loop before loading next stage. |
| **Virtual Touch Controls (Mobile)** | 4-way D-Pad / virtual joystick + tactile Fire button with multi-touch support. | Med | Zero-latency, large tap targets, haptic feedback on shot/hit. |
| **Procedural 8-Bit Web Audio** | Engine hum, shot pop, brick crunch, steel ricochet, powerup jingle, stage start fanfare. | Low | Pure Web Audio API synthesis with zero external audio assets. |

## Differentiators

Features that elevate the title within ArcadeTub's unique platform ecosystem without compromising classic feel.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Tactile 2D Papercraft Visuals** | Cardboard cutout tank chassis, rolling paper track ripples, layered shadow offsets, and confetti explosions. | Med | Aligns with ArcadeTub v5.0+ design language; distinctive and modern yet nostalgic. |
| **Tank 1990 Gun & Boat Powerups** | Pistol powerup (instant Tier 4 upgrade) and Boat powerup (cross water terrain). | Low | High nostalgic value for players who grew up playing the 1990 pirate hack. |
| **Screen Shake & Particle Debris** | Tactile impact when firing heavy cannon, destroying armor tanks, or exploding the base. | Low | Canvas 2D particle burst system with zero performance overhead. |
| **Smart AI Pathfinding Variety** | Base-seeking AI bias vs Player-hunting AI bias vs Random roamers depending on tank type. | Med | Keeps tactical pressure high without feeling unfair or robotic. |
| **Quick Stage Selector & Endless Mode** | Play any unlocked campaign stage (1–35) or endless procedural challenge. | Low | Stored in `localStorage`. Fits instant-play casual web portal expectations. |

## Anti-Features

Features explicitly avoided to preserve scope, performance, and retro authenticity.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Complex Box2D/Matter.js Physics** | Overkill for grid-based tile collision; adds unnecessary bundle weight and breaks grid snapping. | Custom lightweight 2D AABB / sub-tile bitmask collision. |
| **Realtime Online Multiplayer (WebSockets)** | High server cost, networking desync, lag compensation complexity for twitch shooter. | Focus on high-polish single-player arcade campaign with local high scores. |
| **Complex 3D Meshes / WebGL Engines (Three.js/Babylon)** | Violates zero runtime dependency constraint; hurts 350KB bundle limit and low-end mobile performance. | Pure Canvas 2D isometric/top-down papercraft rendering with layered shadows. |
| **External Audio Assets (MP3/WAV/OGG)** | Increases load times, creates asset 404 risks, violates zero asset dependency rule. | Procedural Web Audio API sound synthesis (custom 8-bit oscillator / noise synth). |
| **Overly Complex Custom Map Editor** | High UI complexity, low engagement for casual instant-play minigame catalog. | Ship 35 authentic curated stage layouts stored as compact RLE string arrays. |

## Feature Dependencies

```
[13x13 / 26x26 Sub-Tile Grid Engine]
    ├── [Brick Sub-Tile Chipping & Steel Tiles]
    │       ├── [Bullet-Tile Collision]
    │       └── [Tier 4 Super Cannon Destruction]
    ├── [Special Terrain: Water / Grass / Ice]
    │       ├── [Water Passage Blocking & Bullet Pass-through]
    │       ├── [Grass Visual Camouflage Overlay]
    │       └── [Ice Sliding Inertia Controller]
    └── [Eagle Base HQ Entity]
            └── [Base Destruction Win/Loss Condition]

[Player & Enemy Tank Entity Controller]
    ├── [Grid Movement & Corner Snapping]
    ├── [Tank Upgrade Tier State (Tiers 1-4)]
    ├── [Bullet Pool & Bullet-vs-Bullet Collision]
    └── [Enemy Wave Spawner & AI Behaviors]
            ├── [Flashing Tank Trigger]
            │       └── [Power-up Drop Manager]
            │               ├── [Star / Gun / Helmet / Tank]
            │               ├── [Shovel Base Fortification]
            │               └── [Grenade & Clock Screen Effects]
            └── [Damage & Color State for Heavy Armor Tanks]

[Game Flow & UI]
    ├── [Stage Intro / Transition Curtain]
    ├── [HUD Overlay (Lives, Enemy Queue, Stage, Score)]
    ├── [Stage Tally Summary Screen]
    ├── [Mobile Virtual D-Pad & Fire Touch Controls]
    └── [Web Audio Procedural Sound Engine]
```

## MVP Recommendation

Prioritize for Milestone v8.0:

1. **Phase 1: Grid & Terrain Destruction Engine**
   - 26x26 sub-tile map model with brick chipping, steel, water, grass, ice, and eagle base.
2. **Phase 2: Player Tank & Projectile Mechanics**
   - 4 upgrade tiers, smooth grid turning/snapping, bullet-vs-bullet cancellation, muzzle flash.
3. **Phase 3: Enemy AI, Wave Spawner & Powerups**
   - 4 enemy types (Basic, Fast, Rapid, Heavy Armor), flashing bonus tanks, 6 classic powerups + Tank 1990 pistol/boat.
4. **Phase 4: Stage Sequence, Tally Screen & HUD**
   - 20-tank wave logic, stage intro/clear transitions, end-stage tally counter, high scores.
5. **Phase 5: Papercraft Visual Polish & Web Audio Synthesizer**
   - Cardboard textures, drop shadows, confetti debris, 8-bit oscillator audio cues.
6. **Phase 6: Mobile Virtual Controls & Catalog Integration**
   - Virtual D-Pad, touch buttons, responsive viewport scaling, Vitest suite, Playwright test.

Defer:
- **Custom Map Editor:** Defer to future tool milestone; built-in 35 stages are sufficient for full retro campaign.
- **2-Player Co-op Mode:** Defer to separate local multiplayer initiative across ArcadeTub.

## Sources

- Original *Battle City* (Namco 1985) NES ROM technical specifications & grid structure.
- *Tank 1990* (Yanshan Software) powerup and terrain mechanics.
- ArcadeTub Project Architecture (`.planning/PROJECT.md`) & Canvas 2D micro-engine standards.
