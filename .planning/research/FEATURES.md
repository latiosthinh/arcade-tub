# Feature Landscape

**Domain:** 2D Side-Scrolling Platformer / Kirby's Adventure Papercraft Tribute
**Researched:** 2026-08-21
**Overall Confidence:** HIGH (Verified against WiKirby authoritative documentation, NES ROM mechanics, and existing ArcadeTub codebase patterns)

## Table Stakes

Features players expect from a Kirby's Adventure tribute. Missing any makes the game feel broken or hollow.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Platformer Physics (Gravity, Ground/Ceiling Collision)** | Core movement loop. Kirby walks, runs, jumps, falls with gravity. AABB tile collision for ground, ceiling, walls. | Med | Existing `DinoPhysics` has gravity+jump but no tile grid collision. Need full tilemap AABB sweep. |
| **Inhale Vacuum Cone** | Kirby's signature move. Press B → triangular suction hitbox extends forward, pulls enemy into mouth. Enemy held in "full mouth" state. | Med | Cone hitbox ~60px wide at base, ~120px reach. Enemies within cone slide toward Kirby. Hold B to sustain inhale. |
| **Swallow to Copy Ability** | Press Down while mouth full → swallow enemy → gain their copy ability. This IS the game. | Med | Each ability-yielding enemy has an `abilityGrant` field. Swallow triggers ability state change + visual hat transform. |
| **Spit Star Projectile** | Press B while mouth full → spit enemy as star projectile. Star travels horizontally, damages other enemies, bounces off walls once. | Low | Alternative to swallowing. Star does 1-hit kill to enemies in path. Basic projectile physics. |
| **Float / Hover (Multi-Jump Puffs)** | Press Up / Jump while airborne → Kirby inflates, gains altitude. Up to 6 puffs max before forced exhale. Defines Kirby's accessible feel. | Med | Each puff gives small upward velocity impulse. Kirby's hitbox enlarges when puffed. Air puff exhale attack (small projectile downward). |
| **Air Bullet (Puff Exhale)** | Press B while floating → Kirby exhales air puff attack, returns to normal fall state. Small projectile damages enemies. | Low | Coupled with float system. Ends float state. |
| **Slide Attack** | Press Down + Jump/Attack while grounded → Kirby slides forward low, damaging enemies. Passes under low overhangs. | Low | Hitbox shifts to low wide rectangle during slide. ~0.3s duration. |
| **Dash / Run** | Double-tap direction → Kirby runs faster. Standard platformer run state. | Low | 1.5x walk speed. Affects jump distance. |
| **Copy Ability Moveset Override** | When ability active, B button triggers ability-specific attack instead of inhale. Each ability has unique animation, hitbox, damage, and behavior. | High | Core system. Minimum 6 abilities for table stakes: Sword, Fire, Ice/Freeze, Beam, Cutter, Stone. |
| **Ability Loss on Damage** | Taking damage → ability bounces out as Ability Star. Brief window to re-inhale star before it vanishes. | Low | Ability Star entity bounces, persists ~3s, then shatters. Critical risk-reward mechanic. |
| **Enemy AI with Ability Grants** | Each enemy type has movement pattern + grants specific ability. Waddle Dee (walk, no ability), Waddle Doo (beam), Blade Knight (sword), Hot Head (fire), Chilly (freeze), Sparky (spark), Sir Kibble (cutter), Rocky (stone). | Med | Minimum 8 enemy types. Simple patrol/charge behaviors. Each mapped to one copy ability. |
| **Health System (6 HP Pips)** | Kirby has 6 HP segments. Enemies deal 1-2 damage. Food items restore HP. Maxim Tomato full heal. 1-Up grants extra life. | Low | Standard health bar. Food drops from defeated enemies or placed in stages. |
| **Scrolling Camera** | Horizontal follow camera with vertical look-ahead. Camera leads Kirby's facing direction. Smooth edge clamping at stage boundaries. | Med | Tank-1990 used fixed viewport. This needs smooth horizontal scroll with deadzone centering. |
| **Stage Structure (Doors, Rooms)** | Stages divided into rooms connected by doors. Enter door with Up. Room transitions fade/wipe. Some rooms scroll, some are single-screen arenas. | Med | Door entities trigger room load. Each room is a tilemap segment. Critical for level design variety. |
| **World Map Navigation** | Overworld hub per world. Kirby walks between stage nodes. Completed stages marked. Boss node at end. | Med | Simple node graph with walk animation between dots. 4 worlds minimum for scope. |
| **Boss Encounters (Multi-Phase)** | Each world ends with boss fight. Boss has HP bar, telegraphed attack patterns, vulnerability windows. Minimum 3 unique bosses. | High | Whispy Woods (stationary, drops apples, blows air), Kracko (mobile, lightning bolts, rain drops), King Dedede (hammer swing, jump slam, inhale). |
| **Invincibility Frames** | After taking damage, Kirby flashes/blinks and is invulnerable for ~1.5s. | Low | Standard i-frame system. Sprite alpha blink during window. |
| **Lives System + Game Over** | Start with 3 lives. Death → respawn at room start. 0 lives → Game Over → continue from world map. | Low | Lives counter in HUD. 1-Up items in stages. |
| **Mobile Virtual Controls (D-Pad + 2 Buttons)** | Left-side D-pad (4-way + diagonals), right-side Jump button + Inhale/Attack button. Large touch targets, multi-touch. | Med | Follows ArcadeTub pattern from tank-1990 `TouchControls.ts`. Need 2 action buttons instead of 1. |
| **Procedural Web Audio SFX** | Inhale whoosh, float puff, spit pop, ability activation jingle, damage yelp, boss theme, stage clear fanfare. Zero external audio files. | Med | Extends `AudioSynthesizer` pattern. ~15 distinct sound cues minimum. |

## Differentiators

Features that elevate the game within ArcadeTub's papercraft ecosystem. Not strictly required, but add significant polish and charm.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Papercraft Kirby with Squash-Stretch** | Cardboard Kirby silhouette deforms on inhale (stretch wide), float (puff round), land (squash flat), damage (crumple). Layered paper shadow underneath. | Med | Core visual identity. Kirby is simple circle/oval — perfect for procedural deformation. Confetti particles on ability transform. |
| **Origami Enemy Designs** | Each enemy rendered as folded paper cutout with crease lines, drop shadows, slight rotation wobble. Death = unfold/crumple animation. | Med | Matches ArcadeTub design language from v5.0+. Paper texture grain overlay on each sprite. |
| **Corrugated Terrain Tiles** | Ground/wall/platform tiles drawn as corrugated cardboard cross-sections. Different tile themes per world (green grass card, ice frosted card, stone grey card). | Med | Tile atlas rendered procedurally in Canvas 2D. Reuses pattern from tank-1990 renderer. |
| **Tissue-Paper Parallax Background** | Multi-layer scrolling background: distant mountains (slow), mid clouds (medium), near foliage (fast). Each layer has tissue-paper texture with translucency. | Low | 2-3 parallax layers with simple offset scroll. Lightweight canvas draw with globalAlpha. |
| **Confetti Particle System** | Ability gain = confetti burst. Enemy defeat = paper scraps scatter. Boss defeat = massive confetti explosion with screen flash. | Low | Reuse `ParticleEmitter` pattern from tank-1990. Paper confetti rectangles with rotation + gravity. |
| **Expanded Copy Abilities (8 Total)** | Beyond minimum 6, add Needle (spike burst, area denial) and Spark (electric field, hold B for radius). | Med | Each additional ability needs unique attack hitbox, animation, and SFX. Adds replay variety. |
| **Hidden Bonus Rooms** | Secret doors behind breakable walls or hidden in ceilings. Lead to ability museums, food caches, or 1-Up rooms. Tracked for completion %. | Low | Adds exploration depth. Simple hidden door entity check against ability/collision. |
| **Goal Game (Stage End Bonus)** | End of each stage: Kirby jumps on springboard, timing determines bonus (1-Up, food, nothing). Classic Kirby stage-end minigame. | Low | Single-screen timing minigame. Satisfying pacing between stages. |
| **Drop Ability on Demand** | Press Select/dedicated button → voluntarily discard current ability as Ability Star. Can re-inhale it. Strategic ability management. | Low | Allows players to swap abilities intentionally. Simple state toggle + star spawn. |
| **Screen Shake on Boss Hits** | Boss attacks and Kirby's heavy hits cause camera shake. Adds impact to combat without any performance cost. | Low | Canvas translate offset oscillation for ~0.15s. Already proven in tank-1990. |
| **Stage Intro Splash** | Brief "Stage X-Y" title card with world theme art before stage loads. Pacing breath between stages. | Low | Simple overlay draw for 1.5s. Matches classic Kirby presentation. |
| **Ability Hat Visuals** | Kirby wears distinct papercraft hat per ability: Sword = green nightcap, Fire = flame crown, Ice = tiara, Beam = jester hat, Cutter = headband blade. | Med | Each hat is simple Canvas 2D shape drawn on Kirby's head. Visual clarity for current ability state. |

## Anti-Features

Features explicitly NOT built. Each would blow scope, hurt performance, or miss the point.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full 24-Ability Roster from NES Original** | NES original had 24 abilities. Building all 24 = massive scope explosion with diminishing returns. Each needs unique attack, animation, hitbox, SFX. | Ship 6-8 curated abilities that demonstrate the copy system well. Sword, Fire, Ice/Freeze, Beam, Cutter, Stone, Spark, Needle cover all archetype variety. |
| **7 Worlds / 40+ Stages (Full NES Scope)** | Original had 7 worlds with 4-7 stages each (41 stages total). Building 40+ unique stage tilemaps = months of level design labor. | 4 worlds, 4 stages each + 1 boss stage = 20 stages total. Enough for complete game arc without content bloat. |
| **Physics Engine Library (Matter.js, Box2D)** | Adds runtime dependency, bloats bundle past 350KB budget, overkill for tile-based AABB platformer collision. | Custom lightweight platformer physics: gravity, AABB tile sweep, one-way platforms. ~200 lines of code. |
| **Sprite Sheet / External Image Assets** | Violates zero-dependency constraint. Creates asset loading complexity, 404 risks, increases bundle size. | All graphics rendered procedurally via Canvas 2D. Kirby is circles + arcs. Enemies are geometric shapes with paper texture overlays. |
| **External Audio Files (MP3/WAV)** | Same dependency/bundle violation. | Procedural Web Audio API synthesis matching existing AudioSynthesizer pattern. |
| **Online Multiplayer / Co-op** | Server infrastructure, WebSocket networking, desync handling, latency compensation. Massive complexity for a single-player platformer tribute. | Single-player only. Focus on polished solo experience. |
| **Complex Slope Physics** | True slope collision (angled surfaces with projected velocity) adds significant physics complexity for minimal gameplay value. | Flat tiles + one-way platforms + step-up ledge tolerance. Keep level design to 90-degree terrain. |
| **Save System with Multiple Slots** | Persistent save management adds localStorage complexity, data migration concerns, UI for slot management. | Single auto-save to localStorage: last world unlocked, high score, completion %. Simple key-value. |
| **Mid-Bosses (Bonkers, Mr. Frosty, etc.)** | Original had ~10 mid-boss types. Each needs unique arena, attack patterns, HP. Scope multiplier on an already-complex boss system. | Full bosses only (one per world). Regular enemies provide sufficient combat variety within stages. |
| **Swimming / Water Sections** | Underwater physics (buoyancy, water surface transition, underwater enemies) doubles the physics system complexity. | Keep stages land-only. Water as visual background element or hazard pit only. |
| **Level Editor / Custom Maps** | High UI complexity, low engagement for casual instant-play catalog game. | Ship curated stages as JSON tile arrays (reuse tank-1990 stage data pattern). |
| **WebGL / Three.js / Any 3D Renderer** | Violates zero-dependency constraint. Overkill for 2D papercraft aesthetic. | Pure Canvas 2D with layered rendering for depth illusion (shadows, parallax). |

## Feature Dependencies

```
[Platformer Physics Engine]
    ├── [Tilemap Collision System (AABB Sweep)]
    │       ├── [Ground/Wall/Ceiling Detection]
    │       ├── [One-Way Platform Pass-Through]
    │       └── [Stage Room Boundaries]
    ├── [Gravity + Jump Mechanics]
    │       └── [Float / Hover Puff System (6 max)]
    │               └── [Air Bullet Exhale Attack]
    └── [Dash / Slide Movement States]

[Inhale / Copy Core System]
    ├── [Vacuum Cone Hitbox + Enemy Capture]
    │       ├── [Spit Star Projectile (mouth full + B)]
    │       └── [Swallow → Copy Ability Grant (mouth full + Down)]
    │               ├── [Copy Ability State Machine]
    │               │       ├── [Sword: 3-hit combo, aerial spin]
    │               │       ├── [Fire: horizontal flame breath, fire dash]
    │               │       ├── [Ice/Freeze: freeze cone, kick frozen enemy]
    │               │       ├── [Beam: whip arc, medium range]
    │               │       ├── [Cutter: boomerang throw, returns]
    │               │       ├── [Stone: invulnerable drop, area damage]
    │               │       ├── [Spark: electric field radius (hold B)]
    │               │       └── [Needle: spike burst, stationary area denial]
    │               ├── [Ability Hat Visual System]
    │               └── [Ability Loss on Damage → Ability Star Bounce]
    └── [Enemy AI with Ability Grants]
            ├── [Waddle Dee: walk patrol, no ability]
            ├── [Waddle Doo: walk + beam attack, grants Beam]
            ├── [Blade Knight: walk + slash, grants Sword]
            ├── [Hot Head: walk + fire breath, grants Fire]
            ├── [Chilly: stationary + freeze aura, grants Freeze]
            ├── [Sparky: bounce + electric field, grants Spark]
            ├── [Sir Kibble: walk + cutter throw, grants Cutter]
            └── [Rocky: walk + stone drop, grants Stone]

[Stage & World Structure]
    ├── [Tilemap Loader (JSON stage data)]
    │       ├── [Room System (doors connect rooms)]
    │       ├── [Scrolling Camera (horizontal follow)]
    │       └── [Terrain Tile Themes per World]
    ├── [World Map Navigation (node graph)]
    │       ├── [Stage Unlock Progression]
    │       └── [Boss Node per World]
    └── [Boss Encounter System]
            ├── [Boss HP Bar + Phase Transitions]
            ├── [Whispy Woods: stationary, apple drop, air blow]
            ├── [Kracko: aerial movement, lightning, rain drop]
            └── [King Dedede: hammer, jump, inhale]

[Game Flow & HUD]
    ├── [Health System (6 HP, food items, Maxim Tomato)]
    ├── [Lives System (3 start, 1-Ups, Game Over)]
    ├── [HUD Overlay (HP, lives, ability icon, score)]
    ├── [Stage Intro Splash + Goal Game]
    ├── [Mobile Virtual Controls (D-pad + Jump + Attack)]
    └── [Procedural Web Audio Sound Engine]

[Papercraft Visual System]
    ├── [Kirby Renderer (squash-stretch, ability hats)]
    ├── [Enemy Renderer (origami cutouts, crease lines)]
    ├── [Tile Renderer (corrugated cardboard themes)]
    ├── [Parallax Background (tissue-paper layers)]
    └── [Confetti Particle System]
```

## MVP Recommendation

Prioritize for Milestone v9.0:

1. **Phase 1: Platformer Physics & Tilemap Engine**
   - Gravity, AABB tile sweep collision, ground/wall/ceiling, one-way platforms, scrolling camera, room transitions.
   - *Foundation — everything depends on this.*

2. **Phase 2: Kirby Core Mechanics (Inhale/Swallow/Float/Slide)**
   - Vacuum cone inhale, mouth-full state, spit star, swallow copy trigger, float puff system (6 max), air bullet, slide attack, dash.
   - *Kirby without inhale isn't Kirby.*

3. **Phase 3: Copy Ability System (6 Abilities)**
   - Ability state machine, moveset override per ability, ability hat visuals, ability loss → star bounce.
   - Start with Sword, Fire, Freeze, Beam, Cutter, Stone.
   - *The differentiating mechanic. Make or break.*

4. **Phase 4: Enemy AI & Ability Grants (8 Types)**
   - Waddle Dee, Waddle Doo, Blade Knight, Hot Head, Chilly, Sparky, Sir Kibble, Rocky.
   - Each with patrol/attack behavior and ability grant mapping.
   - *Populates stages with interactive content.*

5. **Phase 5: Boss Encounters (3 Bosses)**
   - Whispy Woods, Kracko, King Dedede. Multi-phase HP-based attack patterns with vulnerability windows.
   - *Climactic world-ending encounters.*

6. **Phase 6: World Map, Stage Data & Progression**
   - 4 worlds (Green Greens, Ice Cream Island, Butter Building, Orange Ocean), 4 stages + 1 boss each.
   - World map navigation, stage unlock, localStorage save.
   - *Game structure and pacing.*

7. **Phase 7: Papercraft Visuals & Procedural Audio**
   - Cardboard Kirby with squash-stretch, origami enemies, corrugated tiles, parallax backgrounds, confetti particles.
   - Procedural Web Audio for all SFX + boss music.
   - *ArcadeTub visual identity.*

8. **Phase 8: Mobile Controls, HUD, Polish & Catalog Integration**
   - Virtual D-pad + 2 action buttons, health/lives HUD, goal game, stage intro splash, Vitest suite, catalog entry.
   - *Ship-ready integration.*

Defer:
- **Additional Abilities (Spark, Needle):** Add after core 6 are solid. Complexity budget spent on base system.
- **Hidden Bonus Rooms / 100% Completion Tracking:** Post-launch polish. Core game loop works without secrets.
- **Sub-Games (Crane, Quick Draw):** Classic Kirby sub-games are nice-to-have. Not essential for platformer core.

## Sources

- WiKirby: Kirby's Adventure — comprehensive mechanics, controls, ability list, enemy catalog, level structure (https://wikirby.com/wiki/Kirby%27s_Adventure)
- Original Kirby's Adventure NES ROM mechanics analysis (copy abilities, inhale cone, float puff count, boss patterns)
- ArcadeTub codebase: `games/tank-1990/` entity system, `games/dino-runner/` physics, `packages/game-engine/` shared infrastructure
- ArcadeTub `.planning/PROJECT.md` constraints: zero dependencies, Canvas 2D, <350KB bundle, 60fps target
