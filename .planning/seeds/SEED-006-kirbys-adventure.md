---
id: SEED-006
status: dormant
planted: 2026-08-21
planted_during: Milestone v8.0 (Post Phase 55, Tank 1990 complete)
trigger_when: Understanding current project style and planning a Kirby's Adventure-style platformer game
scope: Large
---

# SEED-006: Kirby's Adventure — Papercraft Platformer

## Why This Matters

- **Iconic Platformer Archetype:** Kirby's Adventure introduced copy abilities, inhale/spit mechanics, and approachable difficulty — a widely beloved NES classic that expands ArcadeTub into side-scrolling platformers.
- **Papercraft Aesthetic Fit:** Kirby's round, simple silhouette and colorful world translate perfectly to layered cardboard cutouts — puffy paper Kirby, folded origami enemies, corrugated terrain blocks, tissue-paper clouds, and confetti star projectiles.
- **New Gameplay Category:** ArcadeTub has no side-scrolling platformer with character abilities. This adds a deep action-platformer loop: inhale enemies, copy their powers, traverse themed worlds with boss fights.
- **Engine Growth:** Forces building reusable platformer primitives (gravity, tile collision, scrolling camera, hitbox system) that unlock future platformer seeds.

## When to Surface

**Trigger:** Understanding current project style and planning a Kirby's Adventure-style platformer game

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:
- Planning a platformer or side-scroller game milestone
- Adding classic NES/retro game recreations to the catalog
- Expanding the `arcade` or `action` category with character-ability-based games
- Building shared platformer engine primitives (gravity, tile collision, scrolling camera)

## Scope Estimate

**Large** — Full side-scrolling platformer with ability system, multiple worlds, and boss encounters:

### Research Phase
- Study Kirby's Adventure mechanics: inhale, swallow, copy abilities, float, slide, spit star
- Catalog copy abilities to implement (Sword, Fire, Ice, Spark, Beam, Cutter, Stone, Needle, etc.)
- Analyze level design patterns: terrain tiles, hazards, doors, bonus rooms, mid-bosses
- Define papercraft visual language: how each ability transforms Kirby's appearance in cardboard style
- Map controls to mobile touch (virtual D-pad + inhale/jump buttons)

### Core Systems
- **Platformer Physics:** Gravity, ground/wall/ceiling tile collision, slopes, one-way platforms
- **Scrolling Camera:** Horizontal auto-follow with vertical look-ahead, room transitions
- **Kirby Core Mechanics:**
  - Inhale: vacuum cone hitbox, capture enemy state
  - Swallow: consume captured enemy → gain copy ability
  - Spit: launch star projectile from captured enemy
  - Float: multi-jump puff inflation (6 puffs max), air puff attack
  - Slide: ducking slide kick
- **Copy Ability System:** Each ability overrides Kirby's attack with unique moveset (Sword slash combo, Fire dash, Ice freeze breath, Beam whip, etc.)
- **Enemy AI:** Waddle Dee (walk), Waddle Doo (beam), Blade Knight (sword), Hot Head (fire), Poppy Bros (bomb toss), etc. — each grants its corresponding ability
- **Boss Encounters:** Whispy Woods (tree shake attack), Kracko (lightning/rain), Meta Knight (sword duel)

### Visuals & Audio
- Layered cardboard Kirby with puff/squash-stretch on inhale/float
- Paper cutout enemies with fold-crease details and drop shadows
- Corrugated cardboard terrain tiles, tissue-paper sky parallax
- Confetti particle effects for ability transformations and enemy defeats
- Procedural Web Audio: kirby inhale whoosh, puff float, ability activation jingles, boss theme drums

### Level Structure
- World map with 4-6 themed worlds (Green Greens, Ice Cream Island, Butter Building, etc.)
- 4-6 stages per world with progressive difficulty
- Hidden switches/doors for bonus rooms and 1-ups

## Breadcrumbs

Related code and decisions found in the current codebase:

- `packages/game-engine/src/GameLoop.ts` — Fixed timestep loop, reusable for platformer update/render
- `packages/game-engine/src/InputManager.ts` — Keyboard + touch input, needs D-pad + action button mapping
- `packages/game-engine/src/AudioSynthesizer.ts` — Procedural Web Audio base for ability SFX
- `packages/game-engine/src/SceneManager.ts` — Scene transitions for world map → stage → boss
- `games/dino-runner/` — Closest existing side-scroller, has ground collision and jump mechanics
- `games/sky-hopper/` — Vertical movement and platform landing reference
- `games/bug-climb/` — Vertical scrolling and obstacle avoidance patterns
- `games/brick-blitz/` — Grid-based collision detection reference
- `games/tank-1990/` — Complex entity system, multi-type enemies, power-ups, stage progression — closest in complexity
- `src/data/games.ts` — Game catalog registry for new entry
- `vite.config.ts` — Multi-page build config, add new game entry

## Notes

- No external dependencies — pure Canvas 2D rendering matching existing papercraft style
- Copy ability system is the core differentiator; start with 4-5 abilities, expand later
- Mobile touch controls: left-side virtual D-pad, right-side Inhale + Jump buttons
- Consider level data as JSON tile maps (reuse grid pattern from tank-1990)
- Could reuse tank-1990's sub-stepping physics approach for precise platformer collision
- Kirby's float mechanic (multi-jump) makes the game accessible — matches ArcadeTub's casual-friendly approach

## Status
Planted: 2026-08-21
Active: Dormant (Ready for platformer milestone planning)
