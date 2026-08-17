# Feature Landscape: Modern Arcade Game Launcher Hub (v2.0 Refactor)

**Domain:** Web-based Arcade Hub / Minigame Launcher (YouTube Playables compatible)
**Researched:** 2026-08-17
**Overall confidence:** HIGH

## Table Stakes (Must-Haves)

Features users expect for basic usability and stability. Missing features make the hub feel broken, clunky, or unpolished.

| Feature | Why Expected | Complexity | Dependency / Impact on Existing Hub | Notes |
|---------|--------------|------------|-------------------------------------|-------|
| **URL Hash Routing (`#/` & `#/game/:id`)** | Essential browser navigation. Back/forward buttons currently break and reset state. Direct link sharing to games requires deep linking. | Low | Replaces `activePlayingGame` state in `src/hub.ts` with `hashchange` listener and router. | Table stakes UX fix. Must support browser history popstate/hashchange. |
| **Component DOM Diffing / Targeted Updates** | Full `innerHTML` redraw on keystroke/filter drops focus, interrupts active DOM state, and prevents CSS transition continuity. | Medium | Refactors `renderUI()` into discrete component mount/update lifecycle (header, filter chips, grid, player). | Preserves input focus naturally without hacky `document.getElementById('search-input')?.focus()`. |
| **Iframe Loading Skeleton & Ready Signal** | Launching an iframe currently shows a blank white/black box before game assets initialize. | Low | Wraps `#active-game-frame` in loader container; listens to `postMessage` or iframe `load` event. | Shows arcade-themed spinner or skeleton card until canvas renders first frame. |
| **Mobile-First Responsive Shell (Bottom Nav Bar)** | Below 900px, existing sidebar disappears completely, leaving mobile users with no top-level navigation. | Medium | Replaces `.yt-sidebar` media queries in `src/hub.css` with a fixed bottom action bar on viewports `< 768px`. | Includes touch-friendly tap targets (minimum 44x44px), sticky bottom bar for Home / Search / Embed kit. |
| **Unified Design Tokens (Hub + Embed Kit)** | Currently `embed.html` uses an independent inline stylesheet disconnected from `src/hub.css`. | Low | Extracts core CSS variables into shared token stylesheet imported by both `index.html` and `embed.html`. | Tokens for colors, borders, typography, shadows, elevation, and spacing. |
| **Mute/Audio Persistence & State Sync** | Hub header sound toggle must accurately reflect audio system status and persist preference across sessions. | Low | Existing `audio.toggleMute()` in `packages/game-engine` wired to `localStorage` + UI indicator. | High score and mute preference sync cleanly. |
| **Keyboard Accessibility & Focus States** | Keyboard users need Escape to exit player/theater mode, Arrow/Tab navigation across game cards. | Low | Add global keydown listener (`Escape` -> `window.closeGame()`, `/` -> focus search). | Polishes navigation ergonomics. |

## Differentiators

Features that establish a distinct visual brand identity, elevate Arcade Carnival above generic dark-themed dashboards, and deliver tactile game feel.

| Feature | Value Proposition | Complexity | Dependency / Impact on Existing Hub | Notes |
|---------|-------------------|------------|-------------------------------------|-------|
| **Retro-Modern Arcade Design System** | Replaces YouTube-dark clone aesthetic (`#0f0f0f`, `--yt-*` classes) with custom neon cyber-arcade styling (synthwave purples, glowing cyan/amber accents, pixel/display typography). | Medium | Replaces all `.yt-*` class hierarchies and CSS variable sets across `src/hub.css` and HTML templates. | High brand recognition; distinct visual identity tailored to minigames. |
| **View Transitions / Micro-Animations** | Smooth fluid transitions between grid view and theater/player view; hover tilt and glow on game cards. | Medium | Native CSS `view-transition-name` / FLIP animation triggers during route swap. | Hardware-accelerated CSS transforms. Zero runtime library overhead. |
| **Synthesized UI Audio Feedback** | Satisfying retro synthesizer beeps, clicks, and swooshes on card hover, filter toggle, modal open, and game launch. | Low | Extends existing Web Audio synthesis in `packages/game-engine` (`audio.playClick()`, `audio.playChime()`). | Zero external audio asset downloads; synthesized dynamically via Web Audio API. |
| **Interactive Game Card Badges & Score Highlights** | Dynamic glow borders for personal best high scores, "NEW", "HOT", and genre badges with animated pulse. | Low | Enhances `.yt-card` rendering in `renderFeedView()`. | Connects directly to local storage high scores. |
| **Scanline / CRT Toggle Effect** | Optional retro CRT monitor filter (scanlines, subtle curvature, bloom) over launcher or game iframe. | Low | Pure CSS overlay class on main wrapper (`mix-blend-mode`, scanline gradient). | Can be toggled on/off in settings/header for immersion. |
| **Game Trailer / Animated Canvas Previews** | Lightweight animated canvas thumbnail or CSS sprite animation on card hover instead of static emoji icon. | Medium | Game card components mount micro canvas or animated SVG preview on pointer hover. | Vastly improves visual polish and click-through appeal. |

## Anti-Features (What NOT to Build)

Features that add bloat, violate constraints, or introduce unwanted friction.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **External UI Frameworks (React, Vue, Svelte, Tailwind)** | Violates core project constraint: zero runtime dependencies, bundle budget < 200KB gzipped. | Use vanilla TypeScript components with native template literals and scoped CSS custom properties. |
| **Heavy Raster / Video Background Assets** | Bloats bundle size, slows down initial load on mobile connections, causes frame drops on mid-range devices. | Use CSS gradients, SVG geometric motifs, and procedural canvas effects. |
| **Heavy Audio MP3/WAV Asset Packs** | Adds asset weight and network latency for simple UI clicks. | Synthesize all UI sound effects procedurally via existing Web Audio API engine. |
| **Complex Multi-Page Architecture / Full Framework SPA** | Over-engineering for 5 minigames; adds unnecessary routing complexity. | Clean hash-based router (`#/`, `#/game/:id`, `#/embed`) in vanilla TypeScript. |
| **User Account / Cloud Auth System** | Out of scope for YouTube Playables standalone environment; Playables SDK handles player identity via adapter. | Use `localStorage` + `@arcade-carnival/playables-adapter` for score persistence. |
| **Intrusive Interstitial Launch Overlays / Countdown Clocks** | Adds friction between click and gameplay. Playables need instant play. | Immediate iframe insertion with responsive skeleton placeholder while loading. |

## Feature Dependencies

```
Shared Design Tokens (CSS) ──┬──> Retro-Modern Arcade Shell (HTML/CSS)
                             ├──> Unified Embed Kit Styling
                             └──> Mobile Bottom Nav Bar

DOM Component Refactor ─────┬──> URL Hash Router (Deep Linking & History)
                             ├──> Iframe Loading Skeleton State
                             └──> View Transitions (Grid <-> Player)

Web Audio Synth Engine ─────> UI Sound Effects (Hover / Launch / Filter)
```

## MVP Recommendation for v2.0

### Priority 1: Table Stakes UX Foundation
1. **URL Hash Routing:** Instant back/forward support and direct links (`#/game/brick-blitz`).
2. **DOM Component Architecture:** Eliminate full `innerHTML` re-renders; targeted DOM updates.
3. **Responsive Mobile Shell:** Mobile bottom navigation bar replacing hidden sidebar.
4. **Iframe Loading State:** Skeleton loader preventing black/white flashes on game load.

### Priority 2: Brand Identity & Polish (Differentiators)
1. **Arcade Carnival Visual Theme:** Replace all `--yt-*` CSS vars with retro-modern arcade design tokens.
2. **Synthesized UI Audio:** Hook Web Audio clicks and hover blips to UI interactions.
3. **Card Micro-Interactions:** Smooth card hover elevation, glow borders, and transition into player view.
4. **Unified Embed Kit:** Align `embed.html` with new brand design tokens.

### Defer to v2.1+ / Future
- Animated canvas thumbnail previews on hover (adds rendering overhead; static icons + CSS glows sufficient for v2.0).
- CRT scanline shader customizer (keep as simple CSS toggle or defer).

## Sources
- `.planning/PROJECT.md` — Core constraints, game list, tech stack.
- `.planning/seeds/SEED-001-unique-ui-ux-refactor.md` — Problem analysis of YouTube-dark clone and v2.0 refactor goals.
- `src/hub.ts` & `src/hub.css` — Existing implementation analysis.
