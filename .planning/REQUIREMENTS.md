# Requirements: ArcadeTub v10.0 — The Legend of Kage: Papercraft Ninja Action

**Defined:** 2026-08-21
**Core Value:** Browser-based retro-modern tactile arcade minigames with zero runtime dependencies

## v10.0 Requirements

Requirements for Milestone v10.0. Each maps to roadmap phases.

### Physics & Traversal

- [x] **PHYS-01**: Player can super-jump ~2.5–3 screen heights with piecewise gravity arc and apex hang
- [x] **PHYS-02**: Player can steer horizontally mid-air during jump with responsive air control
- [x] **PHYS-03**: Player can land on one-way tree branch platforms and slide down bamboo trunks
- [x] **PHYS-04**: Player can cling to vertical castle walls and wall-jump upward in Stage 2
- [x] **PHYS-05**: Vertical camera follows player with asymmetric upward velocity scaling and look-ahead deadzone

### Dual Weapon Combat

- [x] **CMBT-01**: Player can throw paper shuriken stars in 8 directions (grounded and mid-air)
- [x] **CMBT-02**: Player can perform rapid short-range sword melee slash with 140° frontal arc
- [x] **CMBT-03**: Sword slash destroys/deflects incoming enemy shuriken with clash sound and paper scrap burst
- [x] **CMBT-04**: Player can collect Red/Blue crystal balls and Ninjutsu scrolls for invincibility and screen-clear
- [x] **CMBT-05**: Player dies in single hit on unblocked enemy contact or projectile with 3 lives pool and checkpoint respawn

### Enemy AI & Wave Spawner

- [ ] **ENMY-01**: Red Ninja patrols ground and performs low leaps toward player
- [ ] **ENMY-02**: Blue Ninja leaps rapidly between tree branches and throws shurikens at player
- [ ] **ENMY-03**: White Ninja performs high smoke leaps and ambushes with rapid shuriken spread
- [ ] **ENMY-04**: Fire Monk breathes streams of ground fire and casts fireballs
- [ ] **ENMY-05**: Sorcerer / Yukinosuke boss teleports across arena and casts tracking magic orbs
- [ ] **ENMY-06**: Spawner generates continuous enemy waves from off-screen top and side edges

### Stages & Seasonal Progression

- [ ] **STAG-01**: Stage 1 Bamboo Forest features vertical/horizontal scrolling through tall canopy
- [ ] **STAG-02**: Stage 2 Castle Moat features water hazard below and vertical castle wall climbing
- [ ] **STAG-03**: Stage 3 Castle Interior features multi-level indoor stairways and corridors
- [ ] **STAG-04**: Stage 4 Boss Chamber features boss duel arena and Princess Kiri rescue sequence
- [ ] **STAG-05**: Completing all 4 stages advances the 4-season cycle: Spring (sakura) → Summer (green) → Autumn (maple) → Winter (snow)
- [ ] **STAG-06**: Game progress, high score, and loop count auto-save to localStorage

### Visuals, Audio, Controls & Integration

- [ ] **VISL-01**: Origami ninja characters, corrugated cardboard trees/castles, and paper scroll transitions
- [ ] **VISL-02**: Dynamic weather particles: sakura petals (Spring), pollen (Summer), maple leaves (Autumn), snow (Winter)
- [ ] **AUDI-01**: Procedural Web Audio SFX for sword clash, shuriken whoosh, jump wind, fire crackle, and victory fanfare
- [ ] **CTRL-01**: Mobile virtual controls with D-pad + independent Shuriken & Sword action buttons and multi-touch support
- [ ] **INTG-01**: Standalone packaging under `games/legend-of-kage/`, Vite multi-page config, catalog registration in `retro` category, and Vitest suite

## Future Requirements

Deferred to post-v10.0. Tracked but not in current roadmap.

### Additional Content

- **FUTR-01**: Additional weapon types (Grappling hook, Kusarigama chain-sickle)
- **FUTR-02**: Secret subterranean bonus caves with coin chests
- **FUTR-03**: Endless Survival Mode with infinite scaling enemy waves

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Complex HP Bar / RPG Stats | Ruins intense 1-hit kill arcade rhythm of original Legend of Kage |
| Physics engine library (Matter.js, Box2D) | Violates zero-dependency constraint; custom kinematics (~150 LOC) sufficient |
| Complex fighting game multi-button combos | Overcomplicates virtual mobile controls |
| Endless procedural roguelike generation | Kage relies on tight 4-stage rhythmic pacing and curated wave spawns |
| Raster spritesheets & MP3 audio files | Violates zero-asset constraint; procedural Canvas 2D + Web Audio only |
| True 3D / WebGL rendering | Violates zero-dependency constraint; 2D parallax cardboard layers sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PHYS-01 | Phase 64 | Complete |
| PHYS-02 | Phase 64 | Complete |
| PHYS-03 | Phase 64 | Complete |
| PHYS-04 | Phase 64 | Complete |
| PHYS-05 | Phase 64 | Complete |
| CMBT-01 | Phase 65 | Complete |
| CMBT-02 | Phase 65 | Complete |
| CMBT-03 | Phase 65 | Complete |
| CMBT-04 | Phase 65 | Complete |
| CMBT-05 | Phase 65 | Complete |
| ENMY-01 | Phase 66 | Pending |
| ENMY-02 | Phase 66 | Pending |
| ENMY-03 | Phase 66 | Pending |
| ENMY-04 | Phase 66 | Pending |
| ENMY-05 | Phase 66 | Pending |
| ENMY-06 | Phase 66 | Pending |
| STAG-01 | Phase 67 | Pending |
| STAG-02 | Phase 67 | Pending |
| STAG-03 | Phase 67 | Pending |
| STAG-04 | Phase 67 | Pending |
| STAG-05 | Phase 67 | Pending |
| STAG-06 | Phase 67 | Pending |
| VISL-01 | Phase 68 | Pending |
| VISL-02 | Phase 68 | Pending |
| AUDI-01 | Phase 68 | Pending |
| CTRL-01 | Phase 68 | Pending |
| INTG-01 | Phase 68 | Pending |

**Coverage:**
- v10.0 requirements: 22 total (27 mapped IDs)
- Mapped to phases: 27
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-21*
*Last updated: 2026-08-21 after roadmap creation*
