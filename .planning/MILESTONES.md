# Milestones

## v10.0: The Legend of Kage — Papercraft Ninja Action (Shipped 2026-08-21)

**Goal:** Build a Legend of Kage-inspired vertical-scrolling ninja action game with super-jump tree combat, dual shuriken + sword deflection weapons, 4-stage loop with seasonal visual cycle, in the ArcadeTub papercraft aesthetic.

**Shipped:**
- Super-jump physics engine (~3-screen leap height, apex gravity hang, air drift control, swept one-way branch platform landing, bamboo trunk sliding, castle wall-jumping).
- Asymmetric velocity-scaled vertical camera with top-biased look-ahead.
- Dual-weapon combat: 8-directional paper shurikens + 140° katana sword slash with projectile deflection matrix.
- Power-up pickups: Crystal Balls (invincibility) and Ninjutsu Scrolls (screen-clearing magic).
- 1-hit kill arcade combat loop with 3 lives and checkpoint respawn.
- 4 Enemy types (Red Ninja, Blue Ninja, White Ninja, Fire Monk) and multi-phase Sorcerer Boss (Yukinosuke).
- Continuous wave spawner with off-screen edge drops.
- 4-Stage progression: Bamboo Forest → Castle Moat → Castle Interior → Boss Chamber with Princess Kiri rescue cutscenes.
- 4-Season loop cycle: Spring (sakura petals) → Summer (deep green) → Autumn (maple leaves) → Winter (snow).
- Papercraft visuals with origami ninjas, corrugated cardboard scenery, and dynamic weather particles.
- Zero-asset procedural Web Audio SFX (sword slash, metallic clash, shuriken whoosh, jump wind, victory fanfare).
- Multi-touch mobile virtual controls (D-pad + Shuriken + Sword buttons).
- 23 unit tests passing in `games/legend-of-kage/test/` (111 total across catalog). Production bundle: 7.46 KB gzipped.
- Central catalog expanded to 45 games under `retro` category.
- Audit: `.planning/v10.0-MILESTONE-AUDIT.md` (passed).

---

## v9.0: Kirby's Adventure — Papercraft Platformer (Shipped 2026-08-21)

**Goal:** Build a Kirby's Adventure-inspired side-scrolling platformer with inhale/copy-ability mechanics, 8 enemy types, 3 multi-phase bosses, 4 themed worlds (20 stages), and full papercraft cardboard visual aesthetic with procedural Web Audio — zero external dependencies.

**Shipped:**
- Platformer physics engine with axis-separated AABB tile collision, variable jump, coyote time, jump buffering, and one-way platforms.
- Kirby core mechanics: vacuum cone inhale, mouth-full capture, spit star (3 bounces), swallow-to-copy, float puffs (6 max), air bullet exhale, and grounded slide attack.
- 8 Strategy-pattern Copy Abilities: Sword (3-hit combo + spin), Fire (breath + dash), Ice (freeze cone), Beam (whip arc), Cutter (boomerang), Stone (invulnerable drop), Spark (radial field), Needle (spike burst).
- AbilityStar drop on damage with 3-second re-inhale window and voluntary discard.
- 8 Enemy types with state-machine AI and exact ability grants (Waddle Dee, Waddle Doo, Blade Knight, Hot Head, Chilly, Sparky, Sir Kibble, Rocky).
- 3 Multi-phase Boss encounters with HP bars, vulnerability windows, and attack telegraphs (Whispy Woods, Kracko, King Dedede).
- 4 Themed Worlds with 20 stages, multi-room tilemaps, door transitions, hidden bonus rooms, and localStorage progression save.
- Papercraft visuals (squash-stretch Kirby, origami enemies, corrugated tiles, 3-layer parallax, confetti particles, ability hats).
- Zero-asset procedural Web Audio SFX for all actions, abilities, damage, and jingles.
- Multi-touch mobile virtual controls (D-pad + Jump + Attack + Discard), HUD overlay, stage splash banner, and Goal Game springboard minigame.
- 76 unit tests passing (100% pass rate). Production bundle size: 4.76 KB gzipped.
- Central catalog expanded to 44 games.
- Audit: `.planning/v9.0-MILESTONE-AUDIT.md` (passed).

---

## v8.0: Tank 1990 (Battle City) Retro Papercraft Arcade (Shipped 2026-08-20)

**Goal:** Add Arrow Mode to Type Strike, build 3 new classic arcade minigames (Cyber Snake, Bug Climb Tree, Neon Highway Car Race), and expand catalog to 15 games.

**Shipped:**
- Type Strike Arrow Mode: Full directional sequence defense (`↑ ↓ ← →` / WASD) with ready screen mode toggle.
- 3 New Canvas minigames:
  1. `games/snake-eat/`: Cyber Snake with smooth grid movement, energy food pellets, speed growth, and particle bursts.
  2. `games/bug-climb/`: Bug Climb Tree fast-paced Left/Right trunk climber dodging branch hazards under urgent countdown.
  3. `games/car-race/`: Neon Highway multi-lane traffic racer with Up/Down throttle, Left/Right lane shifting, and slipstream drafting.
- Central catalog expanded to 15 games with custom vector SVG screenshots and genre filter updates.
- 88 test files, 574 unit tests passing (100% pass rate).
- Total distribution bundle: 128.21 KB gzipped across all 15 games + hub + embed (< 200 KB budget).
- Audit: `.planning/v4.0-MILESTONE-AUDIT.md` (passed).

---

## v3.0: Game Catalog Expansion (7 New Games) (Shipped 2026-08-18)

**Goal:** Expand Arcade Carnival catalog from 5 to 12 complete HTML5 Canvas arcade minigames with procedural Web Audio, standalone builds, persistent high scores, and cyber-arcade SVG screenshots.

**Shipped:**
- 7 Canvas minigames: Memory Cards, Memory Boxes, Pop Balloon, Space Racer, Virus Defense, Flappy Fish, 2048 Neon.
- 73 test files, 471 unit tests passing.
- Total bundle: 105.93 KB gzipped.
- Audit: `.planning/v3.0-MILESTONE-AUDIT.md` (passed).

---

## v2.0: Unique UI/UX Refactor (Shipped 2026-08-17)

**Goal:** Overhaul webapp from YouTube-dark clone to a distinct, memorable Arcade Carnival visual brand with modern vanilla TS UX architecture.

**Shipped:**
- Cyber-arcade CSS design token system (`tokens.css`, `theme.css`).
- Zero-dependency `BaseComponent` lifecycle + typed pub/sub `Store`.
- Client-side `HashRouter` with View Transitions API wrapper.
- Dedicated `GameView` player with skeleton loader, clean iframe lifecycle management, and theater mode.
- 43 test files, 283 unit tests passing.
- Audit: `.planning/v2.0-MILESTONE-AUDIT.md` (passed).

---

## v1.0: Arcade Carnival (Shipped 2026-08-17)

**Goal:** 5 browser-based HTML5 Canvas arcade minigames packaged for YouTube Playables with shared game engine, playables adapter, and central hub launcher.

**Shipped:**
- 5 Canvas minigames: Safe Cracker, Brick Blitz, Sky Hopper, Crate Catch, Type Strike.
- 27 test files, 191 unit tests passing.
- Audit: `.planning/v1.0-MILESTONE-AUDIT.md` (passed).
