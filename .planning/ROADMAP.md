# Roadmap: Arcade Carnival

## Overview

Build 5 arcade minigames for YouTube Playables from shared scaffold to polished release. Phase 1 sets up the monorepo, shared adapter, and hub. Phases 2–6 implement one game each. Phase 7 polishes, integrates saves, and prepares deployment.

## Phases

- [ ] **Phase 1: Foundation** - Monorepo scaffold, Playables adapter, hub menu shell
- [ ] **Phase 2: Safe Cracker** - Clicker/timing minigame
- [ ] **Phase 3: Brick Blitz** - Breakout minigame
- [ ] **Phase 4: Sky Hopper** - Vertical platformer minigame
- [ ] **Phase 5: Crate Catch** - Catcher/stacker minigame
- [ ] **Phase 6: Type Strike** - Typing defense minigame
- [ ] **Phase 7: Polish & Deploy** - Cross-game polish, saves, packaging, deploy

## Phase Details

### Phase 1: Foundation
**Goal**: Working monorepo with shared Playables adapter, canvas game loop boilerplate, and hub menu that links to placeholder game pages
**Depends on**: Nothing (first phase)
**Requirements**: REQ-01, REQ-02, REQ-04, REQ-08, REQ-10
**Success Criteria** (what must be TRUE):
  1. `pnpm dev` launches hub page listing 5 game cards
  2. Clicking a game card navigates to its placeholder canvas page
  3. Playables adapter exports `initPlayables()`, `reportScore()`, `saveData()`, `loadData()` with localStorage fallback
  4. `pnpm build` produces per-game static bundles in `dist/`
  5. `pnpm typecheck` passes with zero errors
**Plans**: 3 plans
Plans:
- [ ] 01-01-PLAN.md — Monorepo scaffold, workspace config, Vite multi-page build
- [ ] 01-02-PLAN.md — Playables adapter + game engine implementations
- [ ] 01-03-PLAN.md — Hub menu page with arcade-themed game cards

### Phase 2: Safe Cracker
**Goal**: Fully playable Safe Cracker game — rotating dial indicator, timed target zones, scoring, speed ramp, game over
**Depends on**: Phase 1
**Requirements**: REQ-03, REQ-05, REQ-06, REQ-07, REQ-09
**Success Criteria** (what must be TRUE):
  1. Dial indicator rotates; clicking in yellow zone awards 1000 points
  2. Blue zone hit adds +1.5s to timer
  3. Speed increases every 3000 points
  4. Game over when timer hits 0; high score saved to localStorage
  5. Escape pauses; restart button on game-over screen
**Plans**: TBD

### Phase 3: Brick Blitz
**Goal**: Fully playable Brick Blitz breakout game — paddle, ball, bricks, lives, levels
**Depends on**: Phase 1
**Requirements**: REQ-03, REQ-05, REQ-06, REQ-07, REQ-09
**Success Criteria** (what must be TRUE):
  1. Paddle moves with A/D or arrow keys; Space launches ball
  2. Ball bounces off paddle, walls, and bricks; bricks destroyed on hit
  3. 3 lives; +1UP block grants extra life
  4. Level clears when all bricks destroyed; next level loads new layout
  5. Score: 5/block, 50/bonus, 500/level clear
**Plans**: TBD

### Phase 4: Sky Hopper
**Goal**: Fully playable Sky Hopper vertical platformer — platforms, obstacles, power-ups, story + infinite modes
**Depends on**: Phase 1
**Requirements**: REQ-03, REQ-05, REQ-06, REQ-07, REQ-09
**Success Criteria** (what must be TRUE):
  1. Character auto-bounces upward off platforms; A/D moves horizontally
  2. Screen wraps horizontally
  3. Obstacles (jester, bird, spire) kill on contact; can be crushed by landing on them or destroyed with projectile (W/Up)
  4. Power-ups (rocket, spring, jump pad) boost height
  5. Story mode ends at fixed height; infinite mode scores by altitude
**Plans**: TBD

### Phase 5: Crate Catch
**Goal**: Fully playable Crate Catch game — two-lane platform, falling crates, bombs, stacking multiplier
**Depends on**: Phase 1
**Requirements**: REQ-03, REQ-05, REQ-06, REQ-07, REQ-09
**Success Criteria** (what must be TRUE):
  1. Platform moves left/right; Up/Down switches lane (front/back row)
  2. Crates fall and stack on platform with basic physics
  3. Bombs explode on contact, scatter crates
  4. Space banks stacked crates for points (100/150/200 by size); stack height = multiplier
  5. Game ends when too many crates lost
**Plans**: TBD

### Phase 6: Type Strike
**Goal**: Fully playable Type Strike typing defense — enemies with words, typing destroys them, streak multiplier
**Depends on**: Phase 1
**Requirements**: REQ-03, REQ-05, REQ-06, REQ-07, REQ-09
**Success Criteria** (what must be TRUE):
  1. Enemies approach from right with words displayed above them
  2. Typing the word correctly destroys the enemy; longer words = more points
  3. Streak multiplier increases per correct word; resets on miss
  4. 60-second rounds
  5. Game over if enemy reaches the left edge; high score saved
**Plans**: TBD

### Phase 7: Polish & Deploy
**Goal**: Cross-game polish, persistent high scores via Playables save API, deploy pipeline, final QA
**Depends on**: Phase 2, Phase 3, Phase 4, Phase 5, Phase 6
**Requirements**: REQ-10, REQ-11, REQ-12
**Success Criteria** (what must be TRUE):
  1. All 5 games accessible from hub and individually deployable
  2. High scores persist across sessions (localStorage + Playables bridge)
  3. Bundle size per game < 200KB gzipped
  4. Hub and game menus keyboard-navigable with ARIA labels
  5. Deploy script outputs production-ready static bundle
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Safe Cracker | 0/TBD | Not started | - |
| 3. Brick Blitz | 0/TBD | Not started | - |
| 4. Sky Hopper | 0/TBD | Not started | - |
| 5. Crate Catch | 0/TBD | Not started | - |
| 6. Type Strike | 0/TBD | Not started | - |
| 7. Polish & Deploy | 0/TBD | Not started | - |
