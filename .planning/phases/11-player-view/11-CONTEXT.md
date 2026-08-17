# Phase 11: Game Player View & Embed Kit - Context

## Objectives
Implement the dedicated `GameView` container and player experience for `#/game/:id`:
1. **PLAY-01**: `GameView` container view that loads minigames via iframe with skeleton loading placeholder until game signals readiness or iframe fires `load`.
2. **PLAY-02**: Enforce strict iframe lifecycle cleanup (message listener unbind, `src = 'about:blank'`, canceling animation loops, removing DOM nodes) to eliminate memory leaks and zombie loops.
3. **PLAY-03**: Automatically delegate keyboard focus to canvas upon iframe mount and bind `Escape` shortcut to return to `#/`.
4. **PLAY-04**: Implement theater mode toggle (`T` keyboard shortcut and player header button) to expand game viewport without tearing down running game state.
5. **App Shell Integration**: Wire up `src/main.ts` and `index.html` router orchestration, switching between `CatalogView`, `GameView`, and `EmbedView`.

## Decisions & Architecture
- **ArcadeEmbed / Iframe Bridge**: Reuse `packages/playables-adapter/src/embed.ts` or instantiate structured iframe with `allow="autoplay; fullscreen"`.
- **Skeleton Loader**: Render arcade-themed shimmering skeleton placeholder while iframe is loading (`.ac-skeleton-loader`). Remove/hide skeleton once `load` event or `game-ready` message fires.
- **Teardown**: On `GameView.destroy()`, postMessage `{ type: 'pause' }`, set `iframe.src = 'about:blank'`, unbind window event listeners (escape key, theater shortcut, message handlers), remove iframe from DOM.
- **Keyboard Handling**:
  - Auto-focus iframe on mount (`iframe.focus()` / `iframe.contentWindow?.focus()`).
  - Listen for `Escape` on window and inside iframe messages to navigate to `#/`.
  - Listen for `KeyT` (`t` or `T`) when not focused in input to toggle `store.setState({ isTheaterMode: !isTheaterMode })`.
- **Theater Mode**:
  - Controlled reactively via `Store.getState().isTheaterMode`.
  - Updates CSS layout classes on `.ac-player-frame-wrapper` and `.ac-player-view` without reloading or recreating iframe.
- **App Bootstrap (`src/main.ts`)**:
  - Instantiate `Store<AppState>`, `HashRouter`, `AppHeader`, `AppSidebar`, `BottomNav`, and main view slot.
  - Route `#/` -> `CatalogView`
  - Route `#/game/:id` -> `GameView`
  - Route `#/embed` -> `EmbedView` (or embed docs container)
  - Replace legacy `src/hub.ts` in `index.html` with `src/main.ts`.
