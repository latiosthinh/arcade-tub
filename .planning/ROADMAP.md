# Roadmap: Arcade Carnival

## Overview

Arcade Carnival delivers 5 browser-based HTML5 Canvas arcade minigames packaged for YouTube Playables with a shared game engine, playables adapter, and central launcher. Milestone v1.0 shipped all 5 games and infrastructure. Milestone v2.0 overhauls the webapp with a custom retro-modern cyber-arcade design system, lightweight component architecture, client-side routing, responsive mobile-first navigation, and procedural UI audio.

## Phases

- [x] **Phase 1: Foundation** - Monorepo scaffold, Playables adapter, hub menu shell
- [x] **Phase 2: Safe Cracker** - Clicker/timing minigame
- [x] **Phase 3: Brick Blitz** - Breakout minigame
- [x] **Phase 4: Sky Hopper** - Vertical platformer minigame
- [x] **Phase 5: Crate Catch** - Catcher/stacker minigame
- [x] **Phase 6: Type Strike** - Typing defense minigame
- [x] **Phase 7: Polish & Deploy** - Cross-game polish, saves, packaging, deploy
- [x] **Phase 8: Design System & Visual Foundation** - Cyber-arcade CSS tokens, shared styles, CRT overlay
- [x] **Phase 9: Core Architecture & Routing** - Component lifecycle, pub/sub store, hash router, view transitions
- [x] **Phase 10: Hub Views & Component Library** - Header, responsive nav, search/filters, game cards
- [ ] **Phase 11: Game Player View & Embed Kit** - Player view, skeleton loading, iframe lifecycle, theater mode
- [ ] **Phase 12: Audio Feedback & Production Verification** - Procedural UI audio, bundle audit, test suite verification

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
- [x] 01-01-PLAN.md — Monorepo scaffold, workspace config, Vite multi-page build
- [x] 01-02-PLAN.md — Playables adapter + game engine implementations
- [x] 01-03-PLAN.md — Hub menu page with arcade-themed game cards

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
**Plans**: 2 plans
Plans:
- [x] 02-01-PLAN.md — Core game models, dial collision math, game state, and unit tests
- [x] 02-02-PLAN.md — Particle system, canvas scene rendering, input binding, and adapter wiring

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
**Plans**: 2 plans
Plans:
- [x] 03-01-PLAN.md — Core breakout physics, ball/paddle math, brick AABB collisions, and unit tests
- [x] 03-02-PLAN.md — Game state, level progression, particle effects, canvas scene, and adapter wiring

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
**Plans**: 2 plans
Plans:
- [x] 04-01-PLAN.md — Core physics, player kinematics, screen wrap, camera, platform generator & obstacle combat
- [x] 04-02-PLAN.md — Game state, story & infinite climb modes, particle effects, canvas scene, and adapter wiring

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
**Plans**: 2 plans
Plans:
- [x] 05-01-PLAN.md — Core 2-lane cart kinematics, vertical stacking physics, wobble math, and falling items manager
- [x] 05-02-PLAN.md — Game state, steampunk particle effects, canvas factory scene, HUD, and Playables integration

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
**Plans**: 2 plans
Plans:
- [x] 06-01-PLAN.md — Core dictionary tiers, enemy kinematics, typing engine target locking, prefix advancement, and unit tests
- [x] 06-02-PLAN.md — Game state, laser strike particles, cyberpunk canvas terminal scene, HUD, overlays, and Playables integration

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
**Plans**: 3 plans
Plans:
- [x] 07-01-PLAN.md — Procedural Web Audio synthesizer singleton and sound presets
- [x] 07-02-PLAN.md — Game sound integration, hub high scores, and navigation polish
- [x] 07-03-PLAN.md — Bundle size audit, production asset packaging, and end-to-end verification

### Phase 8: Design System & Visual Foundation
**Goal**: Establish retro-modern cyber-arcade CSS token palette, shared stylesheet structure across hub, embed kit, and game shells, and persistent CRT visual overlay
**Depends on**: Phase 7
**Requirements**: DS-01, DS-02, DS-03
**Success Criteria** (what must be TRUE):
  1. Hub, embed kit, and standalone game shells share unified color palette, surface colors, neon glows, and arcade typography defined in `tokens.css`
  2. CRT scanline / bloom visual overlay renders across the hub and preserves user toggle preference across sessions in `localStorage`
  3. Design token stylesheet is imported cleanly without breaking iframe boundaries or introducing CSS specificity conflicts
**Plans**: 2 plans
Plans:
- [x] 08-01-PLAN.md — Create cyber-arcade tokens.css and theme.css
- [x] 08-02-PLAN.md — CRT scanline/bloom overlay and shared tokens integration across templates
**UI hint**: yes

### Phase 9: Core Architecture & Routing
**Goal**: Implement zero-dependency component lifecycle base class, reactive pub/sub state management, hash-based URL routing, and view transitions wrapper
**Depends on**: Phase 8
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04
**Success Criteria** (what must be TRUE):
  1. `BaseComponent` lifecycle (`mount`, `update`, `destroy`) cleanly attaches DOM nodes and removes event listeners without memory leaks
  2. Typed pub/sub `Store` manages route, search query, active genre filter, sound mute state, and high scores with targeted subscriber updates
  3. `HashRouter` handles `#/`, `#/game/:id`, and `#/embed` with browser back and forward history navigation
  4. View Transitions API wrapper executes smooth transitions between views with instant fallback on unsupported browsers
**Plans**: 2 plans
Plans:
- [x] 09-01-PLAN.md — Core types, BaseComponent lifecycle class, and typed pub/sub Store
- [x] 09-02-PLAN.md — View transitions wrapper and zero-dependency HashRouter
**UI hint**: yes

### Phase 10: Hub Views & Component Library
**Goal**: Build modular hub components including brand header, responsive desktop sidebar / mobile bottom dock, search & filter chips, and interactive game cards
**Depends on**: Phase 9
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. `AppHeader` displays brand logo, search input with `/` shortcut focus, sound toggle, and embed docs link
  2. Responsive navigation renders sidebar on desktop (>=768px) and touch-friendly bottom navigation bar on mobile (<768px, >=48px touch targets)
  3. Search bar and `FilterChips` filter game cards dynamically without input focus loss or full DOM rebuilds
  4. `GameCard` renders arcade genre badges, persistent high score display, play-on-hover neon glow, and keyboard focus rings
**Plans**: 2 plans
Plans:
- [x] 10-01-PLAN.md — Game catalog data, AppHeader with `/` search shortcut, AppSidebar, and responsive BottomNav
- [x] 10-02-PLAN.md — FilterChips, GameCard with high score display & glow, GameGrid, and CatalogView container feed
**UI hint**: yes

### Phase 11: Game Player View & Embed Kit
**Goal**: Implement dedicated game player view with skeleton loading, robust iframe lifecycle management, canvas focus delegation, and theater mode
**Depends on**: Phase 10
**Requirements**: PLAY-01, PLAY-02, PLAY-03, PLAY-04
**Success Criteria** (what must be TRUE):
  1. Navigating to `#/game/:id` displays `GameView` with skeleton placeholder until game iframe signals load completion
  2. Iframe teardown unbinds message listeners, resets `src` to `about:blank`, and stops running `requestAnimationFrame` loops on view exit
  3. Game canvas receives automatic focus on iframe mount, with `Escape` shortcut exiting player view back to catalog
  4. Theater mode toggle button and `T` keyboard shortcut expand game viewport to maximized layout
**Plans**: 2 plans
Plans:
- [ ] 11-01-PLAN.md — GameView component, player & skeleton styles, focus delegation, and theater mode
- [ ] 11-02-PLAN.md — EmbedView component, main app SPA bootstrapper, index.html integration, and routing tests
**UI hint**: yes

### Phase 12: Audio Feedback & Production Verification
**Goal**: Integrate procedural UI sound effects via Web Audio, verify bundle size budgets, and ensure 100% test pass rate
**Depends on**: Phase 11
**Requirements**: POL-01, POL-02
**Success Criteria** (what must be TRUE):
  1. Procedural Web Audio synthesizer plays audio feedback on button clicks, card hovers, game launch, and view transitions
  2. Sound mute toggle silences all UI audio and synchronizes mute state with running game frames
  3. Total gzipped distribution bundle size remains strictly under 200KB
  4. 100% of all 191+ Vitest unit tests pass across engine, adapter, and games with zero regressions
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-08-17 |
| 2. Safe Cracker | 2/2 | Complete | 2026-08-17 |
| 3. Brick Blitz | 2/2 | Complete | 2026-08-17 |
| 4. Sky Hopper | 2/2 | Complete | 2026-08-17 |
| 5. Crate Catch | 2/2 | Complete | 2026-08-17 |
| 6. Type Strike | 2/2 | Complete | 2026-08-17 |
| 7. Polish & Deploy | 3/3 | Complete | 2026-08-17 |
| 8. Design System & Visual Foundation | 2/2 | Complete | 2026-08-17 |
| 9. Core Architecture & Routing | 2/2 | Complete | 2026-08-17 |
| 10. Hub Views & Component Library | 2/2 | Complete | 2026-08-17 |
| 11. Game Player View & Embed Kit | 0/0 | Not started | - |
| 12. Audio Feedback & Production Verification | 0/0 | Not started | - |
