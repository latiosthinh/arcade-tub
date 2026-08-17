# Research Summary: UI/UX Refactor (Arcade Carnival v2.0)

**Project:** Arcade Carnival  
**Domain:** Vanilla TypeScript Webapp UI/UX Architecture, Game Launcher & Embed Kit  
**Synthesized:** 2026-08-17  
**Overall Confidence:** HIGH  

---

## Executive Summary

Arcade Carnival v2.0 replaces YouTube-dark clone interface (`#0f0f0f`, `--yt-*` classes, monolithic `innerHTML` re-renders) with custom retro-modern cyber-arcade design system and modular component architecture. All work enforces strict project constraints: zero runtime npm dependencies, bundle budget under 200KB gzipped, and pure CSS custom properties with native Web Components / TypeScript classes.

Recommended technical approach combines 3-tier CSS design token hierarchy (`tokens.css`, `theme.css`, `components/*.css`), lightweight reactive pub/sub store (< 25 LOC), zero-dependency hash router (`#/`, `#/game/:id`, `#/embed`) with native View Transitions API support, and explicit component lifecycle hooks (`mount`, `update`, `destroy`). Games run inside isolated iframes managed by `@arcade-carnival/playables-adapter` with skeleton loading states and clean teardown.

Primary technical risks focus on iframe audio context locks under browser autoplay policies, memory leaks from uncleaned `requestAnimationFrame` loops in detached iframes, keyboard focus desynchronization between parent hub and game canvases, and broken browser back/forward history navigation. Mitigations include explicit `allow="autoplay; fullscreen"` iframe attributes, setting `iframe.src = 'about:blank'` on teardown, automatic canvas focus delegation, and hash router route diffing.

---

## Key Findings

### 1. Technology Stack (`STACK.md`)
- **Core Architecture:** Vanilla TypeScript Custom Elements / `BaseComponent` lifecycle classes with light DOM. Standard DOM operations, no virtual DOM, zero dependencies.
- **Styling & Tokens:** Native CSS custom properties, CSS nesting module, modern selectors (`:has()`, `:is()`), and CSS View Transitions API (`document.startViewTransition()`).
- **Routing & State:** Minimal hash router (`window.location.hash`, `hashchange`) and typed pub/sub `Store` (< 30 LOC) using immutable state patches.
- **Strict Anti-Stack:** No React, Vue, Svelte, Tailwind, Lit, Navigo, Lucide, or external state libraries. All UI sound effects procedurally synthesized via existing `AudioSynthesizer` Web Audio engine.

### 2. Feature Priorities (`FEATURES.md`)
- **Table Stakes (Must-Haves):**
  - URL Hash Routing (`#/`, `#/game/:id`, `#/embed`) with browser history navigation.
  - Targeted DOM updates (eliminate full `innerHTML` redraws and input focus loss).
  - Iframe loading skeleton placeholder with ready signal.
  - Mobile-first responsive navigation (bottom dock nav bar on `< 768px` viewports).
  - Unified CSS design tokens across main hub, embed kit (`embed.html`), and game shells.
  - Audio mute persistence via `localStorage` synchronized with UI status.
  - Keyboard accessibility shortcuts (`Escape` to close/exit, `/` to focus search).
- **Differentiators (High Value):**
  - Retro-modern neon arcade brand identity (synthwave purples, glowing cyan/magenta/gold accents).
  - View Transitions API page flips and card hover glow micro-interactions.
  - Synthesized Web Audio feedback for UI clicks, card hover, and game launch.
  - Interactive high-score badges and dynamic genre tags.
- **Anti-Features / Deferred:**
  - Defer heavy raster backgrounds, video previews, animated canvas hover thumbnails, and external audio MP3 packs.

### 3. Architecture Blueprint (`ARCHITECTURE.md`)
- **Component Lifecycle:** Standard `BaseComponent` with `element`, `mount(parent)`, `update(props)`, and `destroy()` (which cleans registered event listeners via `unbinds` array).
- **State Flow:** Unidirectional data flow. User action -> Store patch -> Store subscriber notification -> Localized DOM mutation.
- **View Container Routing:**
  - `CatalogView`: HeroBanner, FilterChips, GameGrid, GameCard instances.
  - `GameView`: Header bar, theater mode toggle, `ArcadeEmbed` wrapper, high-score widget.
  - `EmbedView`: Live interactive sandbox and embed documentation.
- **Iframe Lifecycle Isolation:** Explicit teardown sequence (`embed.pause()`, `embed.destroy()`, `iframe.src = 'about:blank'`, node removal) preventing zombie execution loops.

### 4. Critical Pitfalls & Mitigations (`PITFALLS.md`)
- **Autoplay & AudioContext Lock:** Browsers lock nested iframe audio. Solution: Add `allow="autoplay; fullscreen"` to iframe, resume AudioContext on first canvas interaction, broadcast mute state via `postMessage`.
- **Zombie Frame Leaks:** Detached iframes retain `requestAnimationFrame` loops. Solution: Set `iframe.src = 'about:blank'` before removal; invoke explicit `destroy()` methods.
- **Focus & Keyboard Desync:** Keystrokes trapped in parent or missing in canvas. Solution: Explicit `iframe.focus()` on launch; prevent default on game control keys (Space, Arrows).
- **Back Button Trapping:** Iframes adding internal history entries. Solution: Keep iframes static; handle navigation entirely through parent hash routing.
- **CSS Token Boundary:** CSS variables do not pierce iframe DOMs. Solution: Shared `tokens.css` file imported by parent and standalone game entry points.
- **Test Integrity:** 191 existing Vitest tests must remain passing throughout refactoring. Engine APIs must not change.

---

## Implications for Roadmap

### Suggested Phase Breakdown

```
Phase 1: Design Tokens & CSS Foundation
  ├── Deliverable: src/styles/tokens.css, theme.css, base.css, layout.css
  ├── Features: Unified tokens across hub & embed.html, neon palette, responsive typography
  └── Pitfall Mitigations: Cross-iframe token consistency (Pitfall 5)

Phase 2: Core Architecture & State Management
  ├── Deliverable: src/core/Component.ts, src/core/Store.ts, src/core/Router.ts
  ├── Features: Typed pub/sub store, zero-dependency hash router, View Transitions wrapper
  └── Pitfall Mitigations: Prevent innerHTML re-renders (Pitfall 6), clean route handling (Pitfall 4)

Phase 3: Component Library & Catalog View
  ├── Deliverable: AppHeader, AppSidebar, BottomNav, FilterChips, HeroBanner, GameCard, GameGrid
  ├── Features: Search input stability, genre filtering, responsive mobile bottom dock (<768px)
  └── Pitfall Mitigations: Input focus preservation (Pitfall 6), mobile bottom nav spacing (Pitfall 10)

Phase 4: Game Player View & Embed Kit Integration
  ├── Deliverable: src/views/GameView.ts, src/views/EmbedView.ts, skeleton loader
  ├── Features: Deep linking (#/game/:id), theater mode, score reporting sync, embed sandbox
  └── Pitfall Mitigations: Zombie frame cleanup (Pitfall 2), autoplay unlock (Pitfall 1), focus trap (Pitfall 3)

Phase 5: Audio Synthesis, Micro-Interactions & Polish
  ├── Deliverable: UI audio hooks, card hover glow, CRT scanline toggle, View Transitions polish
  ├── Features: Dynamic Web Audio clicks/chimes, hardware-accelerated animations
  └── Pitfall Mitigations: Bundle budget verification <200KB (Pitfall 9), zero test regressions (Pitfall 8)
```

### Research Flags for Planning

| Phase | Research Need | Rationale |
|-------|---------------|-----------|
| **Phase 1: Design Tokens** | Skip research | Standard CSS custom property hierarchy; well documented. |
| **Phase 2: Core Architecture** | Skip research | Concrete recipes for `Store` and `Router` established in ARCHITECTURE.md. |
| **Phase 3: Catalog View & Components** | Skip research | Standard DOM component patterns. |
| **Phase 4: Player View & Embed** | Low research | Adapter integration known; verify `postMessage` protocol with `ArcadeEmbed`. |
| **Phase 5: Audio & Polish** | Low research | Web Audio synthesizer exists in `packages/game-engine`; verify mobile audio unlock. |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Zero-dependency TypeScript and native CSS APIs verified against browser compatibility targets. |
| **Features** | HIGH | Clear table stakes and differentiators defined; seed requirements mapped. |
| **Architecture** | HIGH | Component lifecycle, store, router, and file structure fully specified with code blueprints. |
| **Pitfalls** | HIGH | Iframe lifecycle, Web Audio policies, and DOM focus hazards identified with exact mitigations. |

### Gaps to Address During Implementation
1. **Mobile Safe Area & Address Bar Dynamics:** Ensure `100dvh` and `env(safe-area-inset-bottom)` prevent canvas clipping on mobile devices.
2. **PostMessage Contract Validation:** Verify full bidirectional score and mute synchronization between `ArcadeEmbed` and child games.
3. **Vitest Suite Continuity:** Maintain continuous verification of all 191 existing unit tests during migration from `src/hub.ts` to `src/main.ts`.

---

## Sources

- `.planning/seeds/SEED-001-unique-ui-ux-refactor.md` — UI/UX refactor problem statement and vision
- `.planning/PROJECT.md` — Core constraints, game registry, bundle targets
- `packages/playables-adapter/src/embed.ts` — Host embed iframe wrapper implementation
- `packages/game-engine/src/audio/AudioSynthesizer.ts` — Web Audio procedural synthesis engine
- [MDN Web Docs: View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [MDN Web Docs: Window hashchange event](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event)
- [W3C Web Audio Autoplay Policy](https://www.w3.org/TR/webaudio/#autoplay-policy)
