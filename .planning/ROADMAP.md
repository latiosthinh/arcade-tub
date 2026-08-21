# ROADMAP.md — Milestone v10.0: The Legend of Kage — Papercraft Ninja Action

## Overview
Recreate the 1985 Taito arcade classic *The Legend of Kage* with high-flying super-jump tree combat, dual shuriken + sword deflection mechanics, 4-stage progression, 4-season visual loop, and zero-dependency Canvas 2D papercraft presentation.

---

## Phases

- [ ] **Phase 64: Super-Jump Kinematics, Tree Traversal & Vertical Camera** — 3-screen super-jump physics with apex hang, one-way tree branch landing, bamboo trunk sliding, castle wall-jumping, and velocity-scaled asymmetric vertical camera.
- [ ] **Phase 65: Dual Weapon Combat, Shuriken Engine & Sword Deflection** — 8-way paper shuriken projectiles, 140° katana sword slash, projectile deflection matrix, crystal ball/scroll power-ups, and single-hit death/respawn loop.
- [ ] **Phase 66: Enemy AI Hierarchy, Wave Spawner & Boss Encounters** — Red/Blue/White ninjas, Fire Monks, Sorcerer boss (Yukinosuke), continuous edge wave spawner.
- [ ] **Phase 67: 4-Stage Progression, Seasonal Loop & Cutscenes** — Bamboo Forest, Castle Moat, Castle Interior, Boss Chamber, 4-season palette loop (Spring/Summer/Autumn/Winter), Princess Kiri rescue cutscenes, localStorage persistence.
- [ ] **Phase 68: Papercraft Visuals, Procedural Audio, Touch Controls & Hub Integration** — Origami characters, seasonal confetti weather, procedural Web Audio SFX, virtual mobile controls, standalone `games/legend-of-kage/` packaging, catalog registration under `retro`, Vitest suite.

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 64. Super-Jump Kinematics & Vertical Camera | 0/0 | Pending | — |
| 65. Dual Weapon Combat & Deflection | 0/0 | Pending | — |
| 66. Enemy AI & Wave Spawner | 0/0 | Pending | — |
| 67. Stage Progression & Seasonal Loop | 0/0 | Pending | — |
| 68. Papercraft Visuals, Audio & Integration | 0/0 | Pending | — |

---

## Phase Details

### Phase 64: Super-Jump Kinematics, Tree Traversal & Vertical Camera
**Goal**: Player can execute ~3-screen super-jumps with full air control, land on one-way tree branches, slide on bamboo trunks, wall-jump up castle walls, and have the camera track vertical leaps smoothly without whiplash.
**Depends on**: Nothing (first phase of v10.0)
**Requirements**: PHYS-01, PHYS-02, PHYS-03, PHYS-04, PHYS-05
**Success Criteria**:
  1. Player launches into ~3-screen super-jumps ($|v_y| \approx 850\text{px/s}$) with piecewise gravity reduction near apex for floaty ninja hang time.
  2. Player steers horizontally mid-air with responsive air drift damping.
  3. Player lands cleanly on one-way branch platforms from above and passes through from below without tunneling.
  4. Player can grip castle walls in Stage 2, slide down with friction, and kick off into upward wall-jumps.
  5. Vertical camera tracks rapid ascent with velocity-scaled lerp (0.25-0.35) and top-biased look-ahead deadzone.

### Phase 65: Dual Weapon Combat, Shuriken Engine & Sword Deflection
**Goal**: Player can simultaneously throw 8-directional shurikens and execute katana sword slashes that deflect/destroy incoming enemy projectiles.
**Depends on**: Phase 64
**Requirements**: CMBT-01, CMBT-02, CMBT-03, CMBT-04, CMBT-05
**Success Criteria**:
  1. Player throws paper shurikens in 8 cardinal/diagonal directions based on input vector, grounded or mid-air.
  2. Katana slash triggers 140° frontal melee hitbox with rapid 160ms execution.
  3. Sword slash cancels incoming enemy shuriken/fire projectiles, reversing them or converting them to paper scrap particles with clash audio.
  4. Collecting Crystal Balls grants temporary invincibility; Ninjutsu scrolls trigger screen-clearing lightning/earthquake.
  5. Unblocked enemy attacks result in instant 1-hit death with life deduction and checkpoint respawn.

### Phase 66: Enemy AI Hierarchy, Wave Spawner & Boss Encounters
**Goal**: Continuous waves of 4 distinct ninja/monk enemy types and the Yukinosuke Sorcerer boss challenge the player from all directions.
**Depends on**: Phase 64, Phase 65
**Requirements**: ENMY-01, ENMY-02, ENMY-03, ENMY-04, ENMY-05, ENMY-06
**Success Criteria**:
  1. Red Ninjas patrol terrain and perform low lunging leaps toward player.
  2. Blue Ninjas jump between elevated branches and throw aimed shurikens.
  3. White Ninjas perform high smoke-screen leaps and throw spread shurikens.
  4. Fire Monks breathe streams of ground fire and cast traveling flame projectiles.
  5. Sorcerer boss teleports across chamber and casts tracking magic orbs with vulnerability windows.
  6. Wave spawner maintains continuous enemy density from top and side off-screen buffers.

### Phase 67: 4-Stage Progression, Seasonal Loop & Cutscenes
**Goal**: Complete 4-stage game loop that advances through 4 seasonal variations upon rescuing Princess Kiri.
**Depends on**: Phase 64, Phase 65, Phase 66
**Requirements**: STAG-01, STAG-02, STAG-03, STAG-04, STAG-05, STAG-06
**Success Criteria**:
  1. Stage 1 (Bamboo Forest), Stage 2 (Castle Moat), Stage 3 (Castle Interior), and Stage 4 (Boss Chamber) transition seamlessly.
  2. Rescuing Princess Kiri triggers victory fanfare and intermission sequence.
  3. Completing all 4 stages advances season loop: Spring → Summer → Autumn → Winter with altered palette colors and enemy aggression scaling.
  4. Loop counter, high score, and progression persist across browser sessions in localStorage.

### Phase 68: Papercraft Visuals, Procedural Audio, Touch Controls & Hub Integration
**Goal**: Full tactile origami presentation, procedural Web Audio SFX, virtual mobile controls, and catalog registration in ArcadeTub.
**Depends on**: Phase 64, Phase 65, Phase 66, Phase 67
**Requirements**: VISL-01, VISL-02, AUDI-01, CTRL-01, INTG-01
**Success Criteria**:
  1. Origami ninja characters, corrugated cardboard trees/castles, and paper scroll stage transitions render smoothly at 60 FPS.
  2. Dynamic weather particles reflect current season (sakura petals, pollen drift, maple leaves, snowflake cutouts).
  3. Procedural Web Audio synthesizes blade clash, shuriken whoosh, jump wind, fire crackle, and victory fanfare with zero external audio assets.
  4. Mobile virtual controls provide responsive D-pad + independent Shuriken & Sword buttons with multi-touch support.
  5. Standalone game packaged in `games/legend-of-kage/`, wired into `vite.config.ts`, registered in `src/data/games.ts` under `retro`, and passes all Vitest tests.

---

## Completed Milestones
- [Milestone v9.0: Kirby's Adventure](v9.0-MILESTONE-AUDIT.md) (Completed)
- [Milestone v8.0: Tank 1990](v8.0-MILESTONE-AUDIT.md) (Completed)
- [Milestone v7.0: Sensory Antistress Sandbox](v7.0-MILESTONE-AUDIT.md) (Completed)
