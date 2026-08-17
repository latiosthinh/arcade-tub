# Milestone v3.0 Requirements: Game Catalog Expansion

## Memory Cards
- [ ] **MC-01**: Cyber memory cards model & logic (grid shuffle, 2-card flip state machine, pair matching, streak combo multiplier, round timer, 100% unit tests)
- [ ] **MC-02**: Memory Cards canvas presentation (holographic card flip animations, particle sparkles on match, audio feedback, high score saving)

## Memory Boxes
- [ ] **MB-01**: Memory boxes sequence model (increasing pattern sequence generator, step-by-step playback state, player input matching, life tracking, 100% unit tests)
- [ ] **MB-02**: Memory Boxes canvas presentation (neon grid buttons with light-up pulses, audio tone synthesis, round fanfare, high score saving)

## Pop Balloon
- [ ] **PB-01**: Pop balloon physics & logic (balloon ascent mechanics, point values by color, combo chain timer, hazard spike bomb explosions, 100% unit tests)
- [ ] **PB-02**: Pop balloon canvas presentation (colorful neon balloons with shine & wobble, pop particles, floating points HUD, high score saving)

## Space Racer
- [ ] **SR-01**: Space racer kinematics & logic (ship steering, speed acceleration, obstacle asteroid collisions, turbo boost gates, distance/time scoring, 100% unit tests)
- [ ] **SR-02**: Space racer canvas presentation (warp starfield pseudo-3D perspective, turbo trail flames, collision shake, high score saving)

## Virus Defense
- [ ] **VD-01**: Virus defense combat model (360° turret targeting, projectile trajectory, multi-vector pathogen swarm kinematics, nucleus HP, 100% unit tests)
- [ ] **VD-02**: Virus defense canvas presentation (cellular arena, rotating laser cannon, pathogen explosion debris, wave HUD, high score saving)

## Flappy Fish
- [ ] **FF-01**: Flappy fish physics model (hydrodynamic flap velocity, gravity & water drag, coral reef gap collision detection, score trigger on pipe pass, 100% unit tests)
- [ ] **FF-02**: Flappy fish canvas presentation (underwater bubble ambient, animated fin flap, glowing coral pillars, high score saving)

## 2048 Neon
- [ ] **G2048-01**: 2048 puzzle matrix model (4x4 directional slide & merge algorithms, random 2/4 tile spawn, score calculation, gameover & 2048 win detection, 100% unit tests)
- [ ] **G2048-02**: 2048 canvas presentation (smooth tile slide & merge pop animations, color-tiered neon value tiles, keyboard & swipe touch input, high score saving)

## Hub Integration & Packaging
- [ ] **HUB-01**: Register all 7 new games in `GAMES` catalog (`src/data/games.ts`) with metadata, genres, and high-fidelity SVG screenshots in `src/data/screenshots.ts`
- [ ] **HUB-02**: Multi-page Vite build configuration, standalone game HTML templates, total bundle size audit (< 200KB gzipped), and 100% test pass rate across all 12 games

## Out of Scope
- Multiplayer/online matchmaking (static browser requirement)
- External raster asset packs (bundle size constraint)

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MC-01 | Phase 13 | Pending |
| MC-02 | Phase 13 | Pending |
| MB-01 | Phase 14 | Pending |
| MB-02 | Phase 14 | Pending |
| PB-01 | Phase 15 | Pending |
| PB-02 | Phase 15 | Pending |
| SR-01 | Phase 16 | Pending |
| SR-02 | Phase 16 | Pending |
| VD-01 | Phase 17 | Pending |
| VD-02 | Phase 17 | Pending |
| FF-01 | Phase 18 | Pending |
| FF-02 | Phase 18 | Pending |
| G2048-01 | Phase 19 | Pending |
| G2048-02 | Phase 19 | Pending |
| HUB-01 | Phase 20 | Pending |
| HUB-02 | Phase 20 | Pending |

