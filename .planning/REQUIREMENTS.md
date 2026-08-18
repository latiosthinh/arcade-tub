# Milestone v4.0 Requirements: Action & Arcade Expansion

## Type Strike Arrow Mode
- [x] **TS-ARR-01**: Type Strike Arrow Mode support (mode toggle between Word and Arrow sequence mode, arrow symbol formatting `↑ ↓ ← →` on drone badges, input handling for ArrowUp/Down/Left/Right and WASD, 100% unit tests)
- [x] **TS-ARR-02**: Type Strike Arrow Mode UI & Canvas rendering (arrow badge visuals, mode toggle in ready screen, sound triggers)

## Cyber Snake (Snake Eat)
- [x] **SNK-01**: Snake Eat grid model & logic (grid matrix movement, food pellet spawner, snake growth, self & wall collision math, score & speed scaling, 100% unit tests)
- [x] **SNK-02**: Snake Eat canvas presentation & packaging (neon segmented snake glow, particle eating bursts, procedural audio, standalone HTML & Vite rollup input)

## Bug Climb Tree
- [ ] **BUG-01**: Bug Climb Tree model & logic (trunk column state, branch hazard generation on left/right sides, Left/Right arrow tap side-switching, urgent timer bar, height scoring, 100% unit tests)
- [ ] **BUG-02**: Bug Climb Tree canvas presentation & packaging (animated climbing bug, falling branch obstacles, wood chop particle effects, procedural audio, standalone HTML & Vite rollup input)

## Neon Highway (Car Race)
- [ ] **CAR-01**: Car Race traffic & kinematics model (multi-lane vertical highway, Up/Down speed control and Left/Right lane switching, oncoming traffic spawning with variable speeds, near-miss draft bonus, distance scoring, 100% unit tests)
- [ ] **CAR-02**: Car Race canvas presentation & packaging (scrolling neon asphalt road, sports car rendering with headlights, traffic collision explosions, engine audio, standalone HTML & Vite rollup input)

## Catalog Integration & Release Audit
- [ ] **HUB-CAT-01**: Register 3 new games in `GAMES` catalog (`src/data/games.ts`) with metadata, genres, and high-fidelity SVG screenshots in `src/data/screenshots.ts`
- [ ] **HUB-CAT-02**: Multi-page Vite build configuration, bundle size audit (< 200KB gzipped), and 100% test pass rate across all 15 games

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TS-ARR-01 | Phase 21 | Complete |
| TS-ARR-02 | Phase 21 | Complete |
| SNK-01 | Phase 22 | Complete |
| SNK-02 | Phase 22 | Complete |
| BUG-01 | Phase 23 | Pending |
| BUG-02 | Phase 23 | Pending |
| CAR-01 | Phase 24 | Pending |
| CAR-02 | Phase 24 | Pending |
| HUB-CAT-01 | Phase 25 | Pending |
| HUB-CAT-02 | Phase 25 | Pending |
