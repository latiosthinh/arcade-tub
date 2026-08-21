# Requirements: ArcadeTub v9.0 — Kirby's Adventure: Papercraft Platformer

**Defined:** 2026-08-21
**Core Value:** Browser-based retro-modern tactile arcade minigames with zero runtime dependencies

## v9.0 Requirements

Requirements for Milestone v9.0. Each maps to roadmap phases.

### Platformer Physics

- [x] **PHYS-01**: Player can walk left/right on flat terrain with gravity pulling downward
- [x] **PHYS-02**: Player can jump and land on solid ground, walls, and ceilings via AABB tile collision
- [x] **PHYS-03**: Player can jump through one-way platforms from below and land on them from above
- [x] **PHYS-04**: Player can dash at 1.5x speed by double-tapping a direction
- [x] **PHYS-05**: Camera follows player horizontally with deadzone and clamps at room boundaries
- [x] **PHYS-06**: Player can transition between rooms via door entities with fade/wipe

### Kirby Core Mechanics

- [x] **KRBY-01**: Player can inhale enemies via vacuum cone hitbox that pulls enemies toward Kirby
- [x] **KRBY-02**: Player can spit captured enemy as star projectile that damages other enemies
- [x] **KRBY-03**: Player can swallow captured enemy to gain their copy ability
- [x] **KRBY-04**: Player can float by pressing jump while airborne (up to 6 puffs) and exhale air bullet attack
- [x] **KRBY-05**: Player can slide attack by pressing down+attack while grounded, passing under low overhangs

### Copy Abilities

- [x] **ABIL-01**: Sword ability overrides attack with 3-hit combo and aerial spin slash
- [x] **ABIL-02**: Fire ability overrides attack with horizontal flame breath and fire dash
- [x] **ABIL-03**: Ice/Freeze ability overrides attack with freeze cone and kick frozen enemy
- [x] **ABIL-04**: Beam ability overrides attack with whip arc at medium range
- [x] **ABIL-05**: Cutter ability overrides attack with boomerang throw that returns to player
- [x] **ABIL-06**: Stone ability overrides attack with invulnerable drop and area damage
- [x] **ABIL-07**: Spark ability overrides attack with electric field radius on hold
- [x] **ABIL-08**: Needle ability overrides attack with spike burst stationary area denial
- [x] **ABIL-09**: Taking damage causes current ability to bounce out as Ability Star with brief re-inhale window

### Enemies

- [x] **ENMY-01**: Waddle Dee walks patrol pattern with no ability grant
- [x] **ENMY-02**: Waddle Doo walks and fires beam attack, grants Beam on copy
- [x] **ENMY-03**: Blade Knight walks and slashes, grants Sword on copy
- [x] **ENMY-04**: Hot Head walks and breathes fire, grants Fire on copy
- [x] **ENMY-05**: Chilly stands stationary with freeze aura, grants Freeze on copy
- [x] **ENMY-06**: Sparky bounces with electric field, grants Spark on copy
- [x] **ENMY-07**: Sir Kibble walks and throws cutter, grants Cutter on copy
- [x] **ENMY-08**: Rocky walks and drops stone, grants Stone on copy

### Bosses

- [x] **BOSS-01**: Whispy Woods has multi-phase attacks (apple drop + air blow) with HP bar and vulnerability windows
- [x] **BOSS-02**: Kracko has aerial movement with lightning bolts and rain drop attacks
- [x] **BOSS-03**: King Dedede has hammer swing, jump slam, and inhale attacks with phase transitions

### World & Stages

- [ ] **WRLD-01**: Player can navigate a world map with walkable nodes between stages
- [ ] **WRLD-02**: Game has 4 themed worlds with 4 stages + 1 boss stage each (20 total)
- [ ] **WRLD-03**: Each stage contains rooms connected by doors with JSON tilemap data
- [ ] **WRLD-04**: Completed stages are marked and boss node unlocks after clearing all stages
- [ ] **WRLD-05**: Hidden bonus rooms accessible through secret doors behind breakable walls
- [ ] **WRLD-06**: Game progress auto-saves to localStorage (last world unlocked, completion %)

### Health & Lives

- [x] **HLTH-01**: Player has 6 HP segments with damage from enemies and food item healing
- [x] **HLTH-02**: Player starts with 3 lives; death respawns at room start; 0 lives triggers Game Over
- [x] **HLTH-03**: Player gets invincibility frames (flashing/blinking) for ~1.5s after taking damage

### Visuals

- [ ] **VISL-01**: Kirby rendered as papercraft cardboard with squash-stretch on inhale/float/land/damage
- [ ] **VISL-02**: Enemies rendered as origami paper cutouts with crease lines and drop shadows
- [ ] **VISL-03**: Terrain tiles rendered as corrugated cardboard with per-world themes
- [ ] **VISL-04**: Multi-layer parallax scrolling background with tissue-paper translucency
- [ ] **VISL-05**: Confetti particle effects on ability gain, enemy defeat, and boss defeat
- [ ] **VISL-06**: Ability-specific papercraft hat rendered on Kirby when ability is active

### Audio

- [ ] **AUDI-01**: Procedural Web Audio SFX for inhale, float puff, spit, ability activation, damage, boss theme
- [ ] **AUDI-02**: Stage clear fanfare and game over jingle via procedural synthesis

### Controls & HUD

- [ ] **CTRL-01**: Mobile virtual controls with left D-pad + right Jump + Inhale/Attack buttons with multi-touch
- [ ] **CTRL-02**: HUD displays HP bar, lives count, current ability icon, and score
- [ ] **CTRL-03**: Stage intro splash shows "Stage X-Y" title card before stage loads
- [ ] **CTRL-04**: Goal game timing minigame at end of each stage for bonus rewards

### Integration

- [ ] **INTG-01**: Game packaged as standalone entry under `games/kirby-adventure/` with Vite multi-page config
- [ ] **INTG-02**: Game registered in hub catalog with metadata, category tag, and SVG screenshot
- [ ] **INTG-03**: Unit tests cover core game logic with 100% pass rate

## Future Requirements

Deferred to post-v9.0. Tracked but not in current roadmap.

### Additional Content

- **FUTR-01**: Additional copy abilities beyond initial 8 (Tornado, Hammer, Wheel, etc.)
- **FUTR-02**: Sub-games (Crane Game, Quick Draw) accessible from world map
- **FUTR-03**: 100% completion tracking with bonus ending
- **FUTR-04**: Additional worlds beyond initial 4 (Grape Garden, Yogurt Yard, Orange Ocean)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full 24-ability roster from NES original | Scope explosion — 8 curated abilities cover all archetypes |
| 7 worlds / 40+ stages (full NES scope) | Content bloat — 4 worlds × 5 stages = 20 stages sufficient |
| Physics engine library (Matter.js, Box2D) | Violates zero-dependency constraint, overkill for tile AABB |
| Sprite sheets / external image assets | Violates zero-dependency constraint — procedural Canvas 2D only |
| External audio files (MP3/WAV) | Same constraint — procedural Web Audio synthesis only |
| Online multiplayer / co-op | Server infrastructure complexity, single-player focus |
| Complex slope physics | Minimal gameplay value vs physics complexity |
| Mid-bosses (Bonkers, Mr. Frosty) | 3 full bosses sufficient — mid-bosses multiply scope |
| Swimming / water sections | Doubles physics system complexity for minimal value |
| Level editor / custom maps | High UI complexity, low engagement for instant-play catalog |
| WebGL / Three.js / 3D rendering | Violates zero-dependency constraint, overkill for 2D papercraft |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PHYS-01 | Phase 56 | Complete |
| PHYS-02 | Phase 56 | Complete |
| PHYS-03 | Phase 56 | Complete |
| PHYS-04 | Phase 56 | Complete |
| PHYS-05 | Phase 56 | Complete |
| PHYS-06 | Phase 56 | Complete |
| KRBY-01 | Phase 57 | Complete |
| KRBY-02 | Phase 57 | Complete |
| KRBY-03 | Phase 57 | Complete |
| KRBY-04 | Phase 57 | Complete |
| KRBY-05 | Phase 57 | Complete |
| HLTH-01 | Phase 57 | Complete |
| HLTH-02 | Phase 57 | Complete |
| HLTH-03 | Phase 57 | Complete |
| ABIL-01 | Phase 58 | Complete |
| ABIL-02 | Phase 58 | Complete |
| ABIL-03 | Phase 58 | Complete |
| ABIL-04 | Phase 58 | Complete |
| ABIL-05 | Phase 58 | Complete |
| ABIL-06 | Phase 58 | Complete |
| ABIL-07 | Phase 58 | Complete |
| ABIL-08 | Phase 58 | Complete |
| ABIL-09 | Phase 58 | Complete |
| ENMY-01 | Phase 59 | Complete |
| ENMY-02 | Phase 59 | Complete |
| ENMY-03 | Phase 59 | Complete |
| ENMY-04 | Phase 59 | Complete |
| ENMY-05 | Phase 59 | Complete |
| ENMY-06 | Phase 59 | Complete |
| ENMY-07 | Phase 59 | Complete |
| ENMY-08 | Phase 59 | Complete |
| BOSS-01 | Phase 60 | Complete |
| BOSS-02 | Phase 60 | Complete |
| BOSS-03 | Phase 60 | Complete |
| WRLD-01 | Phase 61 | Pending |
| WRLD-02 | Phase 61 | Pending |
| WRLD-03 | Phase 61 | Pending |
| WRLD-04 | Phase 61 | Pending |
| WRLD-05 | Phase 61 | Pending |
| WRLD-06 | Phase 61 | Pending |
| VISL-01 | Phase 62 | Pending |
| VISL-02 | Phase 62 | Pending |
| VISL-03 | Phase 62 | Pending |
| VISL-04 | Phase 62 | Pending |
| VISL-05 | Phase 62 | Pending |
| VISL-06 | Phase 62 | Pending |
| AUDI-01 | Phase 62 | Pending |
| AUDI-02 | Phase 62 | Pending |
| CTRL-01 | Phase 63 | Pending |
| CTRL-02 | Phase 63 | Pending |
| CTRL-03 | Phase 63 | Pending |
| CTRL-04 | Phase 63 | Pending |
| INTG-01 | Phase 63 | Pending |
| INTG-02 | Phase 63 | Pending |
| INTG-03 | Phase 63 | Pending |

**Coverage:**
- v9.0 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-21*
*Last updated: 2026-08-21 after roadmap creation*
