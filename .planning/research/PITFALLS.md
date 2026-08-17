# Domain Pitfalls: UI/UX Refactor for Minigame Hub & Canvas Games

**Domain:** Vanilla TypeScript Game Hub, Iframe Management, Hash Routing, Canvas UI/UX
**Researched:** 2026-08-17
**Overall confidence:** HIGH

---

## Critical Pitfalls

Mistakes that cause system instability, audio breakage, memory leaks, or platform rejection.

### Pitfall 1: Browser Autoplay Policy & AudioContext Suspension Across Iframe Boundaries
**What goes wrong:**
Audio does not play when a user navigates to a game or clicks inside the game iframe. Web Audio `AudioContext` stays in `suspended` state. In YouTube Playables or modern browsers, nested iframe audio policies are strict. If the parent page creates an `AudioContext` or toggles audio, child iframes running their own `AudioSynthesizer` remain unaware or locked.
**Why it happens:**
Browsers require user gesture activation on the specific `window` frame where the `AudioContext` is created. If the parent hub initializes audio on a button click, the iframe's `AudioContext` is NOT unlocked unless a gesture occurs inside the iframe or the parent delegates permission via iframe `allow="autoplay"`. Furthermore, navigating between hub and iframe without resuming the iframe's context causes silence.
**Consequences:**
Silent gameplay, broken sound effects, rejected submission on YouTube Playables.
**Prevention:**
1. Explicitly add `allow="autoplay; fullscreen"` attribute on all game iframes.
2. In each game scene / entry point, attach a one-time user pointerdown/keydown listener that calls `audio.initContext()` or `ctx.resume()`.
3. In `playables-adapter`, broadcast audio mute/unmute state changes from host to iframe via `postMessage({ type: 'mute', muted })` and sync `AudioSynthesizer` instances.
**Detection:**
Browser console warning: `The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.`

---

### Pitfall 2: Iframe Lifecycle Leaks & Double Game Loops (Zombie Frames)
**What goes wrong:**
Navigating back to the hub from a game leaves `requestAnimationFrame` loops, event listeners (`keydown`, `keyup`, `resize`), and audio nodes running in detached iframes. Memory usage grows with every game launch, degrading frame rate from 60fps to under 20fps.
**Why it happens:**
Replacing `innerHTML` or removing an iframe element without invoking explicit teardown (`GameLoop.destroy()`, `InputManager.destroy()`, `cancelAnimationFrame()`) leaves async event loops and DOM references active until garbage collection, which may never occur if closures retain references to `window` or global singletons.
**Consequences:**
App lag, audio overlap (sounds playing from previously closed games), memory leaks, mobile tab crashes.
**Prevention:**
1. Never rely on raw `innerHTML = ''` for iframe teardown.
2. Maintain explicit view lifecycle hooks (`mount()`, `unmount()`).
3. Set `iframe.src = 'about:blank'` before removing the iframe from DOM to immediately terminate its JavaScript execution context and audio thread.
4. Call `embed.destroy()` which cleans up `window.removeEventListener('message', ...)`.
**Detection:**
Performance tab / memory profiling showing detached DOM trees, accumulating `requestAnimationFrame` callbacks, or sounds playing after closing a game.

---

### Pitfall 3: Keyboard and Focus Trap Desynchronization (Canvas vs Parent Hub)
**What goes wrong:**
When launching keyboard-intensive games like *Type Strike* or *Safe Cracker* (Spacebar / Typing), keystrokes are captured by the parent hub (triggering hub scrolling or search input shortcuts) instead of reaching the canvas inside the iframe, or vice-versa (player cannot Tab or Escape back to hub controls).
**Why it happens:**
Iframe focus is not automatically transferred on mount. Clicking outside the iframe loses focus without restoring it to the active canvas when returning. Also, default browser actions (Space scrolling page down, Arrow keys panning) intercept game inputs.
**Consequences:**
Game feels unresponsive; player loses game immediately (e.g. Type Strike misses letters, Crate Catch misses drop keys); accessible navigation fails.
**Prevention:**
1. Call `iframe.focus()` or `iframe.contentWindow.focus()` immediately upon game launch / view transition.
2. Inside `InputManager.ts` / game loop, call `event.preventDefault()` specifically for recognized gameplay keys (Space, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Enter, Tab if controlled).
3. Handle Escape key inside the iframe to send a `postMessage({ type: 'close' })` or yield focus back to the parent hub.
**Detection:**
Pressing Spacebar scrolls the parent container instead of executing in-game jump/bank action; pressing keyboard letters in Type Strike does nothing until clicking canvas.

---

### Pitfall 4: Hash Routing Conflicts with Embedded Iframe Navigation & Back Button Trap
**What goes wrong:**
Using `window.location.hash` (e.g., `#/games/brick-blitz`) causes infinite loops, unexpected iframe reloads, or broken browser Back/Forward navigation when games themselves modify URLs or when navigating between hub views.
**Why it happens:**
If an iframe changes its own `src` or internal history, browser history adds an entry for the iframe. Clicking the browser "Back" button navigates the iframe's internal history instead of the top-level hub route, trapping the user. Conversely, re-rendering the whole page on `hashchange` destroys and recreates the running game iframe.
**Consequences:**
User clicks "Back" button expecting Hub home, but nothing happens or iframe reloads with lost game state; UI flickers.
**Prevention:**
1. Use top-level hash routing (`window.addEventListener('hashchange', ...)`) only for hub-level state (`#/`, `#/game/safe-cracker`, `#/embed`, `#/settings`).
2. Keep game iframes static (never change iframe internal location/history).
3. Avoid full page rebuilds in `hashchange`: inspect diff of target route vs current route. If route changes from `#/game/A` to `#/`, unmount game view cleanly; if parameters change, update state without tearing down unrelated DOM trees.
**Detection:**
Browser back button takes 2-3 clicks to exit a game, or pressing back button reloads the game canvas from scratch instead of returning to feed.

---

### Pitfall 5: CSS Design Token Cascading Failure Across Iframe Boundary
**What goes wrong:**
Parent hub defines custom CSS variables (`--ac-primary`, `--ac-font-arcade`, `--ac-bg-dark`), but game iframes and embed components render with default browser fonts, broken styles, or mismatched colors.
**Why it happens:**
CSS custom properties do not cross iframe boundaries. An iframe has an isolated DOM and CSSOM.
**Consequences:**
Inconsistent styling, broken retro-modern theme in games vs hub, duplicated CSS files that get out of sync.
**Prevention:**
1. Package design tokens into a standalone CSS file (`packages/theme/tokens.css` or `src/styles/tokens.css`) imported by both `index.html` (hub), `embed.html`, and every `games/*/index.html`.
2. Do not rely on parent DOM stylesheet inheritance for anything rendered inside an iframe.
3. Use strict CSS token naming conventions with zero runtime JS dependency.
**Detection:**
Visual mismatches between hub badges and in-game UI overlay fonts; missing variables evaluating to initial/fallback values in child frames.

---

## Moderate Pitfalls

Mistakes that cause performance degradation, responsive layout bugs, or test regressions.

### Pitfall 6: Full `innerHTML` Rebuilds Destroying Ephemeral State and Triggering Layout Thrashing
**What goes wrong:**
In `src/hub.ts`, the current implementation calls `renderUI()` on every search input, filter chip click, and audio mute toggle, rebuilding the entire `#app` innerHTML. In the refactored UI, doing this causes input focus loss, scroll position reset, and canvas context destruction.
**Why it happens:**
Treating vanilla DOM like a virtual DOM framework without a diffing engine.
**Consequences:**
Janky UI, dropped frames, search input losing focus on every keystroke (currently worked around by manual `document.getElementById('search-input')?.focus()`), video/canvas flicker.
**Prevention:**
1. Split UI into lightweight component modules (`Header`, `Sidebar`, `GameGrid`, `PlayerView`, `BottomNav`).
2. Only update targeted DOM elements (`element.textContent = ...`, `classList.toggle(...)`, or mounting/unmounting specific view containers).
3. Keep the search input element stable in the DOM; update only the `.yt-game-grid` container during search/filter operations.
**Detection:**
Search input loses cursor position or keyboard closes on mobile; visible flashing when toggling dark mode or audio mute.

---

### Pitfall 7: Canvas Scaling & Aspect Ratio Distortion on Mobile Touch Screens
**What goes wrong:**
Canvas appears blurry on high-DPI (Retina) mobile screens, touch coordinates are offset from visual elements, or bottom virtual navigation bars clip game canvas controls.
**Why it happens:**
`GameLoop.ts` handles aspect ratio using `ResizeObserver` and CSS pixel dimensions, but does not account for `window.devicePixelRatio`, or touch coordinates from `TouchEvent` are not mapped through the `_scale` factor. Additionally, fixed 800x600 canvas in portrait mobile creates massive letterboxing or horizontal overflow.
**Consequences:**
Blurry rendering, impossible touch input (tapping buttons taps 50px away), unplayable on mobile browsers with dynamic address bars.
**Prevention:**
1. Calculate touch/pointer coordinates relative to canvas bounding client rect: `(touch.clientX - rect.left) * (canvas.width / rect.width)`.
2. Use CSS `touch-action: none` on canvas elements to prevent pull-to-refresh and pinch-to-zoom interference.
3. Ensure player view wrapper uses CSS `aspect-ratio: 4 / 3` or responsive flex container with `max-height: calc(100vh - var(--nav-height) - var(--header-height))`.
**Detection:**
Tapping on mobile safe cracker dial or brick blitz paddle registers touches outside the target bounding box; mobile browser attempts to scroll/zoom during swipe controls.

---

### Pitfall 8: Breaking Existing 191 Tests During Refactoring
**What goes wrong:**
Refactoring file structures, module exports, or class signatures in `packages/game-engine` or `packages/playables-adapter` breaks unit tests in `games/*/test/`.
**Why it happens:**
Tightly coupled test assertions expecting specific mock structures, global window properties, or adapter interfaces.
**Consequences:**
Broken test suite, regressions in core game math/physics (angular collision in Safe Cracker, bounce deflection in Brick Blitz, stack physics in Crate Catch).
**Prevention:**
1. Keep game engine logic pure and decoupled from DOM UI.
2. Run `pnpm test` (or `vitest run`) on every incremental phase.
3. Do not modify exported signatures of `initPlayables`, `reportScore`, `saveData`, `loadData`, `onPause`, `onResume`, `AudioSynthesizer`, `InputManager`, or `GameLoop` without updating adapters backward-compatibly.
**Detection:**
`vitest` test failures on CI or local run.

---

## Minor Pitfalls

### Pitfall 9: Bundle Size Bloat via Unused Fonts or Polyfills
**What goes wrong:**
Importing multiple web font weights (e.g. 4 weights of arcade retro pixel fonts + Google Fonts), heavy SVG libraries, or router utility packages blows through the <200KB gzipped budget.
**Why it happens:**
Adding external font formats (`.ttf` instead of compressed `.woff2`) or npm packages for routing/state management.
**Prevention:**
1. Zero runtime dependencies rule: write custom 30-line hash router.
2. Use modern system font fallbacks + single subset `.woff2` font for arcade titles.
3. Keep all icons as inline SVGs or unicode symbols.
**Detection:**
Vite build output showing bundle exceeding budget or slow first contentful paint (FCP).

---

### Pitfall 10: Mobile Bottom Nav Occluding In-Game Action Controls
**What goes wrong:**
On mobile devices, fixed bottom navigation bars overlay the bottom 60px of the screen, hiding paddle controls in Brick Blitz or the bank button in Crate Catch.
**Why it happens:**
Player view container uses `height: 100vh` without accounting for viewport safe areas (`env(safe-area-inset-bottom)`) and the mobile bottom navigation bar height.
**Prevention:**
1. Hide or collapse the bottom navigation bar when a game is in active fullscreen/player view, or reserve explicit padding: `padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))`.
2. Use `dvh` (dynamic viewport height units: `100dvh`) instead of `100vh` to handle mobile browser address bar expand/collapse.
**Detection:**
Bottom controls unreachable on iPhone Safari or Android Chrome when address bar is visible.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Design Tokens & Theme Setup** | Tokens not propagating into game iframes (Pitfall 5) | Create shared `tokens.css` referenced in root and each game `index.html`. |
| **Component Hub Architecture** | `innerHTML` thrashing & focus loss (Pitfall 6) | Build discrete component mount/update pattern; avoid whole-page innerHTML rebuilds. |
| **Hash Router & Navigation** | Back button trap & zombie iframe loops (Pitfall 2, 4) | Explicit unmount/destroy hooks; clean top-level hash router with route diffing. |
| **Iframe & Game Embed Kit** | Autoplay policy lock & focus trapping (Pitfall 1, 3) | Set `allow="autoplay; fullscreen"`, auto-focus iframe on mount, resume AudioContext on first interaction. |
| **Mobile & Touch UX** | Touch coordinate offset & bottom nav occlusion (Pitfall 7, 10) | Use `touch-action: none`, client rect coordinate mapping, and `100dvh` layout with safe-area insets. |
| **Playables Integration & Tests** | Adapter signature breakage (Pitfall 8) | Maintain existing adapter API; run Vitest suite after every phase. |

---

## Sources

- W3C Web Audio Autoplay Policy Specification & MDN Autoplay Guide (HIGH confidence)
- YouTube Playables SDK & Iframe Lifecycle Standards (HIGH confidence)
- Chrome / Safari Mobile Viewport & Touch Event Specifications (HIGH confidence)
- Arcade Carnival Codebase (`src/hub.ts`, `packages/playables-adapter`, `packages/game-engine`, `vitest.config.ts`) (HIGH confidence)
