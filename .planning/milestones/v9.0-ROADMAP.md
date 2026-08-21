# ROADMAP.md — Milestone v9.0: Kirby's Adventure — Papercraft Platformer

## Overview
Build a Kirby's Adventure-inspired side-scrolling platformer with inhale/copy-ability mechanics, 8 enemy types, 3 multi-phase bosses, 4 themed worlds (20 stages), and full papercraft cardboard visual aesthetic with procedural Web Audio — zero external dependencies.

---

## Phases

- [x] **Phase 56: Tilemap Engine & Core Platformer Physics** — Tile grid collision (AABB sweep), gravity, jump, one-way platforms, dash, scrolling camera, room transitions via doors.
- [x] **Phase 57: Kirby Core Mechanics & Health System** — Inhale vacuum cone, spit star projectile, swallow-to-copy trigger, float puffs (6 max), air bullet exhale, slide attack, 6HP health, lives, invincibility frames.
- [x] **Phase 58: Copy Ability System** — Strategy-pattern ability interface, 8 unique ability movesets (Sword, Fire, Ice, Beam, Cutter, Stone, Spark, Needle), ability loss on damage with bouncing Ability Star re-inhale window.
- [x] **Phase 59: Enemy AI & Ability Grants** — 8 enemy types with state-machine patrol/attack AI (Waddle Dee, Waddle Doo, Blade Knight, Hot Head, Chilly, Sparky, Sir Kibble, Rocky), each granting corresponding copy ability on inhale+swallow.
- [x] **Phase 60: Boss Encounters** — 3 multi-phase bosses with HP bars, telegraphed attack patterns, and vulnerability windows (Whispy Woods, Kracko, King Dedede).
- [x] **Phase 61: World Map, Stage Data & Progression** — 4 themed worlds (Green Greens, Ice Cream Island, Butter Building, Orange Ocean), 4 stages + 1 boss per world, JSON tilemap data, door-connected rooms, world map navigation, hidden bonus rooms, localStorage auto-save.
- [x] **Phase 62: Papercraft Visuals & Procedural Audio** — Cardboard Kirby with squash-stretch, origami enemies, corrugated terrain tiles, parallax backgrounds, confetti particles, ability hat visuals, procedural Web Audio SFX and jingles.
- [x] **Phase 63: Mobile Controls, HUD, Polish & Catalog Integration** — Virtual D-pad + Jump + Attack buttons with multi-touch, HUD (HP/lives/ability/score), stage intro splash, goal game, standalone `games/kirby-adventure/` packaging, catalog registration, Vitest suite.

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 56. Tilemap Engine & Core Platformer Physics | 2/2 | Complete | 2026-08-21 |
| 57. Kirby Core Mechanics & Health System | 2/2 | Complete | 2026-08-21 |
| 58. Copy Ability System | 2/2 | Complete | 2026-08-21 |
| 59. Enemy AI & Ability Grants | 2/2 | Complete | 2026-08-21 |
| 60. Boss Encounters | 2/2 | Complete | 2026-08-21 |
| 61. World Map, Stage Data & Progression | 2/2 | Complete | 2026-08-21 |
| 62. Papercraft Visuals & Procedural Audio | 2/2 | Complete | 2026-08-21 |
| 63. Mobile Controls, HUD, Polish & Integration | 2/2 | Complete | 2026-08-21 |

---

## Phase Details

### Phase 56: Tilemap Engine & Core Platformer Physics
**Goal**: Player can walk, run, jump, and dash through scrollable tile-based levels with solid AABB collision, one-way platforms, and room transitions via doors.
**Depends on**: Nothing (first phase of v9.0)
**Requirements**: PHYS-01, PHYS-02, PHYS-03, PHYS-04, PHYS-05, PHYS-06
**Success Criteria** (what must be TRUE):
  1. Player moves left/right with gravity, lands on solid ground, and cannot pass through walls or ceilings via axis-separated AABB tile collision.
  2. One-way platforms allow jump-through from below and solid landing from above.
  3. Double-tap direction triggers dash at 1.5x walk speed affecting jump distance.
  4. Camera follows player horizontally with deadzone centering and clamps at room boundaries.
  5. Door entities trigger room transitions with fade/wipe effect when player presses Up.
**Plans**: TBD
**UI hint**: yes

### Phase 57: Kirby Core Mechanics & Health System
**Goal**: Player can inhale enemies, spit stars, swallow to trigger copy, float with puffs, slide attack, and take/heal damage with lives and invincibility frames.
**Depends on**: Phase 56
**Requirements**: KRBY-01, KRBY-02, KRBY-03, KRBY-04, KRBY-05, HLTH-01, HLTH-02, HLTH-03
**Success Criteria** (what must be TRUE):
  1. Inhale creates vacuum cone hitbox that pulls enemies toward Kirby; wall blocks suction.
  2. Spit launches captured enemy as bouncing star projectile that damages other enemies.
  3. Swallow (Down while mouth full) triggers copy ability grant from enemy's `abilityGrant` field.
  4. Float allows up to 6 upward puffs while airborne; air bullet exhale ends float and damages enemies.
  5. Slide attack (Down+Attack grounded) moves Kirby low and fast, passing under overhangs and damaging enemies.
  6. Player has 6 HP segments; food items heal; Maxim Tomato full heals; damage triggers ~1.5s invincibility frames with sprite blink.
  7. Player starts with 3 lives; death respawns at room start; 0 lives triggers Game Over flow.
**Plans**: TBD
**UI hint**: yes

### Phase 58: Copy Ability System
**Goal**: 8 unique copy abilities override Kirby's attack with distinct movesets, animations, and hitboxes via strategy-pattern composition.
**Depends on**: Phase 56, Phase 57
**Requirements**: ABIL-01, ABIL-02, ABIL-03, ABIL-04, ABIL-05, ABIL-06, ABIL-07, ABIL-08, ABIL-09
**Success Criteria** (what must be TRUE):
  1. Ability interface defines `activate()`, `update()`, `render()`, `getHitbox()` contract; Kirby delegates attack to active ability.
  2. Sword: 3-hit ground combo + aerial spin slash with distinct hitboxes per swing.
  3. Fire: horizontal flame breath + fire dash that damages enemies in path.
  4. Ice/Freeze: freeze cone that encases enemies in ice block; kick frozen enemy as projectile.
  5. Beam: whip arc at medium range with diagonal coverage.
  6. Cutter: boomerang throw that travels forward and returns to player.
  7. Stone: invulnerable transformation + heavy drop with area damage on landing.
  8. Spark: expanding electric field on hold (B); damages enemies entering radius.
  9. Needle: spike burst in all directions; stationary area denial.
  10. Taking damage ejects current ability as bouncing Ability Star; ~3s window to re-inhale before it vanishes.
**Plans**: TBD

### Phase 59: Enemy AI & Ability Grants
**Goal**: 8 distinct enemy types with state-machine AI patrol and attack patterns, each mapped to a copy ability grant on inhale+swallow.
**Depends on**: Phase 56, Phase 57, Phase 58
**Requirements**: ENMY-01, ENMY-02, ENMY-03, ENMY-04, ENMY-05, ENMY-06, ENMY-07, ENMY-08
**Success Criteria** (what must be TRUE):
  1. Waddle Dee walks patrol pattern on platforms, turns at edges, grants no ability.
  2. Waddle Doo walks and periodically fires beam attack toward player; grants Beam on copy.
  3. Blade Knight walks and slashes when player is in melee range; grants Sword on copy.
  4. Hot Head walks and breathes fire forward; grants Fire on copy.
  5. Chilly stands stationary emitting freeze aura that damages nearby player; grants Freeze on copy.
  6. Sparky bounces erratically with electric field; grants Spark on copy.
  7. Sir Kibble walks and throws cutter boomerang; grants Cutter on copy.
  8. Rocky walks slowly and performs stone drop attack; grants Stone on copy.
**Plans**: TBD

### Phase 60: Boss Encounters
**Goal**: 3 multi-phase bosses with HP bars, telegraphed attack patterns, vulnerability windows, and defeat sequences.
**Depends on**: Phase 56, Phase 57, Phase 58, Phase 59
**Requirements**: BOSS-01, BOSS-02, BOSS-03
**Success Criteria** (what must be TRUE):
  1. Whispy Woods: stationary tree boss with apple drop + air blow attacks; shakes before each attack (telegraph); HP bar visible; drops apples that can be inhaled and spit back.
  2. Kracko: aerial boss with horizontal movement, lightning bolt strikes, and rain drop attacks; phase transitions at HP thresholds change movement speed and attack frequency.
  3. King Dedede: ground boss with hammer swing, jump slam, and inhale attacks; hammer swing has wind-up telegraph; jump slam creates shockwave; inhale mirrors Kirby's mechanic.
  4. All bosses show clear HP bar, have invincibility frames after hits, and trigger victory sequence on defeat.
**Plans**: TBD
**UI hint**: yes

### Phase 61: World Map, Stage Data & Progression
**Goal**: 4 themed worlds with navigable world maps, 20 JSON tilemap stages connected by doors, hidden bonus rooms, and localStorage save/load.
**Depends on**: Phase 56, Phase 57, Phase 58, Phase 59, Phase 60
**Requirements**: WRLD-01, WRLD-02, WRLD-03, WRLD-04, WRLD-05, WRLD-06
**Success Criteria** (what must be TRUE):
  1. World map displays walkable node graph; player moves between stage nodes; completed stages marked with star.
  2. 4 themed worlds (Green Greens, Ice Cream Island, Butter Building, Orange Ocean) each have 4 stages + 1 boss stage = 20 total.
  3. Each stage loads from JSON tilemap data with rooms connected by door entities; entering door transitions to linked room.
  4. Boss node unlocks after clearing all 4 stages in a world.
  5. Hidden bonus rooms accessible through secret doors behind breakable walls; contain food caches or 1-Up items.
  6. Game progress auto-saves to localStorage: last world unlocked, stages completed, completion percentage.
**Plans**: TBD
**UI hint**: yes

### Phase 62: Papercraft Visuals & Procedural Audio
**Goal**: Render full papercraft cardboard aesthetic with squash-stretch Kirby, origami enemies, corrugated terrain, parallax backgrounds, confetti particles, ability hats, and procedural Web Audio SFX.
**Depends on**: Phase 56, Phase 57, Phase 58, Phase 59, Phase 60, Phase 61
**Requirements**: VISL-01, VISL-02, VISL-03, VISL-04, VISL-05, VISL-06, AUDI-01, AUDI-02
**Success Criteria** (what must be TRUE):
  1. Kirby renders as cardboard cutout with squash-stretch deformation on inhale (widen), float (round), land (squash), damage (crumple); layered paper shadow.
  2. Enemies render as origami paper cutouts with crease lines, drop shadows, and rotation wobble; death = unfold/crumple animation.
  3. Terrain tiles render as corrugated cardboard cross-sections with per-world theme colors (green grass, ice frost, stone grey, ocean blue).
  4. 2-3 parallax background layers scroll at different speeds with tissue-paper translucency (globalAlpha).
  5. Confetti paper particles burst on ability gain, enemy defeat, and boss defeat; screen shake on heavy impacts.
  6. Ability-specific papercraft hat rendered on Kirby's head (Sword = green nightcap, Fire = flame crown, etc.).
  7. Procedural Web Audio synthesizes inhale whoosh, float puff, spit pop, ability activation jingle, damage yelp, boss theme, stage clear fanfare, game over jingle — zero external assets.
**Plans**: TBD
**UI hint**: yes

### Phase 63: Mobile Controls, HUD, Polish & Catalog Integration
**Goal**: Deliver mobile virtual controls, HUD overlay, stage presentation polish, and full ArcadeTub hub integration with Vite build and test suite.
**Depends on**: Phase 56, Phase 57, Phase 58, Phase 59, Phase 60, Phase 61, Phase 62
**Requirements**: CTRL-01, CTRL-02, CTRL-03, CTRL-04, INTG-01, INTG-02, INTG-03
**Success Criteria** (what must be TRUE):
  1. Left-side virtual D-pad + right-side Jump + Inhale/Attack buttons with multi-touch support; no gesture stutter or screen scrolling.
  2. HUD overlay displays HP bar (6 segments), lives count, current ability icon, and score.
  3. Stage intro splash shows "Stage X-Y" title card with world theme art for 1.5s before stage loads.
  4. Goal game timing minigame at end of each stage determines bonus reward (1-Up, food, nothing).
  5. Game packaged as standalone entry under `games/kirby-adventure/` with `index.html`, `package.json`, `tsconfig.json`.
  6. Game registered in `src/data/games.ts` with metadata, category tags (`action`, `arcade`, `platformer`), and custom SVG screenshot.
  7. Vitest unit tests cover core game logic (physics, abilities, enemies, bosses) with 100% pass rate.
**Plans**: TBD
**UI hint**: yes

---

## Completed Milestones
- [Milestone v8.0: Tank 1990 (Battle City)](v8.0-MILESTONE-AUDIT.md) (Completed)
- [Milestone v7.0: Sensory Antistress Sandbox](v7.0-MILESTONE-AUDIT.md) (Completed)
- [Milestone v6.0: CrazyGames Minigame Replication](milestones/v6.0-ROADMAP.md) (Archived)
- [Milestone v5.0: 2D Papercraft Visual Overhaul](milestones/v5.0-ROADMAP.md) (Archived)
- [Milestone v4.0: Catalog Expansion](milestones/v4.0-ROADMAP.md) (Archived)
- [Milestone v3.0: 7 New Games](milestones/v3.0-ROADMAP.md) (Archived)
- [Milestone v2.0: Cyber-Arcade UI/UX Refactor](milestones/v2.0-ROADMAP.md) (Archived)
- [Milestone v1.0: Foundation & 5 Games](milestones/v1.0-ROADMAP.md) (Archived)
