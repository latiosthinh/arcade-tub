# Roadmap: Arcade Carnival (Milestone v3.0)

## Phases

- [x] **Phase 13: Memory Cards Minigame** - Cyber card matching with streak combos, round timer, flip animations, and sound effects
- [x] **Phase 14: Memory Boxes Minigame** - Sequence memory reproduction game with increasing pattern steps, neon pulse feedback, and tone synthesis
- [ ] **Phase 15: Pop Balloon Minigame** - Fast-action ascending balloon pop mechanics with color combo multipliers, hazard bombs, and particle effects
- [x] **Phase 16: Space Racer Minigame** - High-speed orbital obstacle dodging with speed kinematics, turbo boost gates, and pseudo-3D warp starfield
- [x] **Phase 17: Virus Defense Minigame** - 360-degree turret radial defense against mutating pathogen swarms with trajectory physics and nucleus health
- [x] **Phase 18: Flappy Fish Minigame** - Underwater hydrodynamic flapping physics, glowing coral reef obstacles, and pearl bubble score collection
- [x] **Phase 19: 2048 Neon Minigame** - 4x4 sliding number tile puzzle with directional merge logic, spawn algorithms, neon value styling, and swipe support
- [x] **Phase 20: Catalog Integration & Release Audit** - Hub metadata registration, SVG screenshots, multi-page Vite build, bundle budget audit (<200KB), and 100% test verification

## Phase Details

### Phase 13: Memory Cards Minigame
**Goal**: Players can play a complete Memory Cards matching game with card flip animations, combo multipliers, round countdown, and persistent high score
**Depends on**: Existing shared packages (`@arcade-carnival/game-engine`, `@arcade-carnival/playables-adapter`)
**Requirements**: MC-01, MC-02
**Success Criteria** (what must be TRUE):
  1. Player can click/tap cards to flip and reveal cyber glyph pairs on grid
  2. Matching pairs remain revealed and increase score with streak combo multiplier
  3. Mismatched pairs flip back facedown after brief reveal delay
  4. Round ends when all pairs cleared or timer expires, saving high score locally
  5. 100% unit tests pass for card state machine, shuffle logic, and combo calculations
**Plans**: 2 plans
Plans:
- [x] 13-01-PLAN.md — CardGrid data model, cyber glyph pairs, flip/match state machine, GameState timers & combo math, unit test suite
- [x] 13-02-PLAN.md — Holographic 3D card flip canvas rendering, vector cyber glyphs, particle sparkles, procedural audio, MemoryCardsScene wiring & Vite rollup input
**UI hint**: yes

### Phase 14: Memory Boxes Minigame
**Goal**: Players can play a pattern sequence memory game with expanding flash sequences, audio tones, and life tracking
**Depends on**: Existing shared packages (`@arcade-carnival/game-engine`, `@arcade-carnival/playables-adapter`)
**Requirements**: MB-01, MB-02
**Success Criteria** (what must be TRUE):
  1. Player observes neon grid sequence playback with light pulses and distinct audio tones
  2. Player can input sequence by clicking/tapping grid boxes in correct order
  3. Success advances player to longer sequence with round fanfare and score increase
  4. Mistake deducts a life and triggers failure sound effect; game ends at zero lives
  5. 100% unit tests pass for sequence generation, step verification, and life state
**Plans**: 2 plans
Plans:
- [x] 14-01-PLAN.md — SequenceGenerator model, BoxGrid matrix, GameState turn state machine & scoring math, unit test suite
- [x] 14-02-PLAN.md — Neon grid BoxRenderer, synthesized audio pitch tone player, particle wave effects, MemoryBoxesScene wiring & Vite rollup input
**UI hint**: yes

### Phase 15: Pop Balloon Minigame
**Goal**: Players can pop ascending neon balloons to chain color combos while dodging hazard spike bombs
**Depends on**: Existing shared packages (`@arcade-carnival/game-engine`, `@arcade-carnival/playables-adapter`)
**Requirements**: PB-01, PB-02
**Success Criteria** (what must be TRUE):
  1. Player can click/tap ascending balloons to pop them and trigger particle sparkles with audio
  2. Popping same-colored balloons in sequence builds combo multiplier under combo timer
  3. Popping hazard spike bomb detonates explosion and reduces player health/timer
  4. Game tracks score with floating point indicators and saves high score on game over
  5. 100% unit tests pass for ascent kinematics, combo timer window, and collision points
**Plans**: 2 plans
Plans:
- [ ] 15-01-PLAN.md — Balloon & BalloonSpawner kinematics, PopEngine combo multiplier chaining & bomb penalty, GameState 60s timer, unit test suite
- [ ] 15-02-PLAN.md — Glossy neon balloon & spike bomb canvas rendering, PopAudio synthesizer, confetti/explosion particle physics, FloatingScore popups, PopBalloonScene wiring & Vite rollup input
**UI hint**: yes

### Phase 16: Space Racer Minigame
**Goal**: Players can pilot a spacecraft down a high-speed warp track, avoiding asteroids and hitting turbo gates
**Depends on**: Existing shared packages (`@arcade-carnival/game-engine`, `@arcade-carnival/playables-adapter`)
**Requirements**: SR-01, SR-02
**Success Criteria** (what must be TRUE):
  1. Player steers ship horizontally across starfield using keyboard arrow keys or touch/pointer drag
  2. Ship speeds up dynamically, dodging incoming asteroid obstacles with collision shake feedback
  3. Passing through turbo boost gates grants brief invulnerability and high-speed multiplier
  4. Gameover occurs upon fatal crash and records high score based on distance and gates cleared
  5. 100% unit tests pass for speed curves, collision boundaries, and boost mechanics
**Plans**: TBD
**UI hint**: yes

### Phase 17: Virus Defense Minigame
**Goal**: Players can defend a central cellular nucleus by rotating a 360-degree turret and blasting pathogen waves
**Depends on**: Existing shared packages (`@arcade-carnival/game-engine`, `@arcade-carnival/playables-adapter`)
**Requirements**: VD-01, VD-02
**Success Criteria** (what must be TRUE):
  1. Player aims turret 360 degrees using mouse/touch pointer and fires projectiles at incoming pathogens
  2. Pathogens spawn from perimeter in escalating multi-vector waves targeting center nucleus
  3. Direct hits destroy pathogens with debris particle effects and audio feedback
  4. Pathogens breaching center damage nucleus HP; game over triggers when nucleus HP reaches 0
  5. 100% unit tests pass for angle targeting math, projectile trajectory, and wave spawn curves
**Plans**: 2 plans
Plans:
- [x] 17-01-PLAN.md — Turret model with 360-degree aiming, PathogenSwarm kinematics & types, NucleusState health & antibodies, GameState lifecycle & combo math, unit test suite
- [x] 17-02-PLAN.md — Cellular bio-cyber BioArenaRenderer, DefenseAudio procedural synthesizer, bio-luminescent ParticleSystem, VirusDefenseScene wiring & Vite rollup input
**UI hint**: yes

### Phase 18: Flappy Fish Minigame
**Goal**: Players can navigate an underwater fish through glowing coral pillars using buoyancy tap mechanics
**Depends on**: Existing shared packages (`@arcade-carnival/game-engine`, `@arcade-carnival/playables-adapter`)
**Requirements**: FF-01, FF-02
**Success Criteria** (what must be TRUE):
  1. Player taps screen or presses Space to propel fish upward against water gravity and drag
  2. Passing cleanly between glowing coral reef gaps increments score and plays chime
  3. Colliding with top/bottom boundaries or coral structures triggers game over
  4. High score updates and persists locally upon run completion
  5. 100% unit tests pass for hydrodynamic physics calculations and bounding box gap checks
**Plans**: 2 plans
Plans:
- [x] 18-01-PLAN.md — Fish hydrodynamic physics model, PipeManager coral reef scrolling & circle-AABB collisions, pearl pickups, GameState medal tiers, unit test suite
- [x] 18-02-PLAN.md — Deep ocean caustic FishRenderer, animated cyber-fish, glowing coral pillars, FishAudio procedural synthesizer, FlappyFishScene wiring & Vite rollup input
**UI hint**: yes

### Phase 19: 2048 Neon Minigame
**Goal**: Players can solve a 4x4 sliding number puzzle with neon styling, directional swipe controls, and merge mechanics
**Depends on**: Existing shared packages (`@arcade-carnival/game-engine`, `@arcade-carnival/playables-adapter`)
**Requirements**: G2048-01, G2048-02
**Success Criteria** (what must be TRUE):
  1. Player slides grid in 4 directions via arrow keys or touch swipe gestures
  2. Adjacent matching numbers merge into double value with pop animation and point additions
  3. Random 2 or 4 tile spawns in empty cell after valid move
  4. Game detects reaching 2048 win condition and no-more-moves gameover state
  5. 100% unit tests pass for directional slide/merge matrix algorithms and spawn logic
**Plans**: 2 plans
Plans:
- [x] 19-01-PLAN.md — 4x4 matrix slide & merge algorithms, 90/10 spawner, move validation, win & gameover detection, undo snapshot stack, GameState lifecycle, unit test suite
- [x] 19-02-PLAN.md — Color-tiered neon tile visuals, slide & pop merge animations, ParticleSystem sparkles, Audio2048 procedural synthesizer, swipe & keyboard controls, Game2048Scene wiring & Vite rollup input
**UI hint**: yes

### Phase 20: Catalog Integration & Release Audit
**Goal**: All 12 games in the Arcade Carnival collection are integrated in the central hub, fully playable, tested, and under bundle budget
**Depends on**: Phase 13, Phase 14, Phase 15, Phase 16, Phase 17, Phase 18, Phase 19
**Requirements**: HUB-01, HUB-02
**Success Criteria** (what must be TRUE):
  1. Hub displays all 12 games with matching metadata, genre filters, and custom SVG screenshots
  2. All 12 games launch standalone and inside hub iframe player with sound and score saving
  3. Multi-page Vite production build succeeds without errors
  4. Total gzipped bundle size remains under 200KB limit
  5. 100% unit test pass rate across all games and shared packages in workspace
**Plans**: 2 plans
Plans:
- [x] 20-01-PLAN.md — Register 7 new games in GAMES metadata catalog, create authentic SVG screenshots, update FilterChips and GameGrid categories, update catalog unit tests
- [x] 20-02-PLAN.md — Multi-page bundle audit test assertions for 12 games, production Vite build, bundle size audit (<200KB limit), and 100% test pass verification
**UI hint**: yes

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 13. Memory Cards Minigame | 2/2 | Complete | 2026-08-18 |
| 14. Memory Boxes Minigame | 2/2 | Complete | 2026-08-18 |
| 15. Pop Balloon Minigame | 0/0 | Not started | - |
| 16. Space Racer Minigame | 2/2 | Complete | 2026-08-18 |
| 17. Virus Defense Minigame | 2/2 | Complete | 2026-08-18 |
| 18. Flappy Fish Minigame | 2/2 | Complete | 2026-08-18 |
| 19. 2048 Neon Minigame | 2/2 | Complete | 2026-08-18 |
| 20. Catalog Integration & Release Audit | 2/2 | Complete | 2026-08-18 |
