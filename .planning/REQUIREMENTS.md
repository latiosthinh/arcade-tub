# Milestone v2.0 Requirements: Unique UI/UX Refactor

## Design System & Tokens
- [x] **DS-01**: Retro-modern cyber-arcade CSS token palette (colors, surfaces, neon glow, typography, borders)
- [x] **DS-02**: Shared design tokens file imported across hub (`index.html`), embed kit (`embed.html`), and game shells
- [x] **DS-03**: CRT scanline / bloom visual overlay toggle with persistent preference in localStorage

## Core Architecture & Routing
- [x] **ARCH-01**: BaseComponent lifecycle (`mount`, `update`, `destroy`, event listener unbinds) eliminating full-page innerHTML rebuilds
- [x] **ARCH-02**: Typed lightweight pub/sub Store managing route, search, active filter, audio mute, and high scores
- [x] **ARCH-03**: Zero-dependency HashRouter supporting routes `#/` (catalog), `#/game/:id` (player), `#/embed` with browser back/forward history
- [x] **ARCH-04**: View Transitions wrapper using `document.startViewTransition()` with graceful fallback for seamless view morphs

## Hub Views & Components
- [x] **COMP-01**: AppHeader with brand logo, search input with focus shortcut (`/`), sound toggle, and embed docs link
- [x] **COMP-02**: Sidebar navigation for desktop and bottom navigation bar for mobile (<768px) with touch-friendly targets (48px min)
- [x] **COMP-03**: Search bar and FilterChips with active state indicators and live catalog filtering without DOM thrashing
- [x] **COMP-04**: Redesigned GameCard with genre badges, persistent high score display, play-on-hover glow, and keyboard focus outlines

## Player View & Lifecycle
- [x] **PLAY-01**: GameView component with skeleton loader while game iframe initializes
- [x] **PLAY-02**: Clean iframe lifecycle management (explicit teardown, `about:blank`, removing message listeners, stopping zombie loops)
- [x] **PLAY-03**: Auto-focus game canvas on iframe mount with keyboard delegation (Escape to exit player view)
- [x] **PLAY-04**: Theater mode toggle with keyboard shortcut (`T`) expanding game viewport

## Audio & Polish
- [x] **POL-01**: Procedural Web Audio UI sound effects (button click, card hover, game launch, view transition) via existing AudioSynthesizer
- [x] **POL-02**: Bundle budget verification (< 200KB gzipped total) and 100% test pass rate across all 191+ tests

## Future Requirements (Deferred)
- **FUT-01**: Full dark/light arcade theme switcher
- **FUT-02**: Custom animated SVG badges for achievements
- **FUT-03**: Full-bleed featured game hero banner carousel

## Out of Scope
- Framework migration (React/Vue/Svelte) — strict zero-dependency constraint
- User accounts / backend auth / cloud leaderboard — static-first platform constraint
- Heavy image/video asset pack — bundle budget constraint (<200KB)

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DS-01 | Phase 8 | Complete |
| DS-02 | Phase 8 | Complete |
| DS-03 | Phase 8 | Complete |
| ARCH-01 | Phase 9 | Complete |
| ARCH-02 | Phase 9 | Complete |
| ARCH-03 | Phase 9 | Complete |
| ARCH-04 | Phase 9 | Complete |
| COMP-01 | Phase 10 | Complete |
| COMP-02 | Phase 10 | Complete |
| COMP-03 | Phase 10 | Complete |
| COMP-04 | Phase 10 | Complete |
| PLAY-01 | Phase 11 | Complete |
| PLAY-02 | Phase 11 | Complete |
| PLAY-03 | Phase 11 | Complete |
| PLAY-04 | Phase 11 | Complete |
| POL-01 | Phase 12 | Complete |
| POL-02 | Phase 12 | Complete |
