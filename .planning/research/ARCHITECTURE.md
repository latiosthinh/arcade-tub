# Architecture Patterns: UI/UX Refactor

**Domain:** Vanilla TypeScript Webapp UI/UX Architecture (Arcade Carnival Hub & Embed Kit)  
**Researched:** 2026-08-17  
**Overall Confidence:** HIGH (verified with native DOM API, TypeScript standard library, existing project structure)

---

## Recommended Architecture

Arcade Carnival v2.0 UI architecture replaces the monolithic innerHTML string-template loop in `src/hub.ts` with a **zero-dependency modular Component + Store + HashRouter** architecture in vanilla TypeScript.

```
+-------------------------------------------------------------------------+
|                              Browser URL                                |
|                             (#/game/brick-blitz)                         |
+------------------------------------+------------------------------------+
                                     |
                                     v
                          +---------------------+
                          |     HashRouter      |
                          | (popstate/hashchange|
                          +----------+----------+
                                     | dispatches route
                                     v
+-------------------------------------------------------------------------+
|                               AppState Store                            |
|  - currentRoute: { path, params }                                       |
|  - activeFilter: 'all' | 'action' | 'arcade' | 'casual'                 |
|  - searchQuery: string                                                  |
|  - isMuted: boolean                                                     |
|  - isTheaterMode: boolean                                               |
|  - highScores: Record<string, number>                                   |
+------------------------------------+------------------------------------+
                                     | subscribe() notifies
                                     v
+-------------------------------------------------------------------------+
|                              App Shell                                  |
|  +--------------------+----------------------------------------------+  |
|  | Header Component   | AudioToggle, SearchBar, BrandLogo            |  |
|  +--------------------+----------------------------------------------+  |
|  | Sidebar / BottomNav| Navigation Links (Home, Games, Embed Docs)   |  |
|  +--------------------+----------------------------------------------+  |
|  | Main View Container| (View Transitions API / CSS Fade Swap)       |  |
|  |                    |                                              |  |
|  |   [CatalogView]    | HeroBanner, FilterChipsBar, GameGrid, Cards  |  |
|  |        OR          |                                              |  |
|  |    [GameView]      | PlayerHeader, ArcadeEmbed Iframe, HighScore  |  |
|  |        OR          |                                              |  |
|  |   [EmbedDocView]   | Live Embed Sandbox, Code Snippets            |  |
|  +--------------------+----------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                         Design Token System                             |
|  tokens.css (Primitives) -> theme.css (Semantics) -> Component CSS      |
|  (Shared across index.html Hub, embed.html Kit, and Game Canvas Shells) |
+-------------------------------------------------------------------------+
```

---

### Component Boundaries

| Component / Module | Responsibility | Communicates With |
|--------------------|---------------|-------------------|
| `core/Store.ts` | Central reactive state container with pub/sub subscriptions | All Views & Components |
| `core/Router.ts` | Listens to `hashchange`, parses paths and `:id` params, drives View changes | `Store.ts`, View instances |
| `core/Component.ts` | Base interface/class providing `mount()`, `update()`, `destroy()` lifecycle | DOM Nodes, Parent Views |
| `components/AppHeader.ts` | Top brand navbar, global search input, mute toggle, quick stats | `Store.ts`, `Router.ts` |
| `components/AppSidebar.ts` | Desktop left sidebar navigation with active indicator | `Router.ts` |
| `components/BottomNav.ts` | Mobile-first bottom dock navigation (< 768px viewports) | `Router.ts` |
| `components/HeroBanner.ts` | Featured playable marquee card with instant launch action | `Router.ts`, `Store.ts` |
| `components/FilterChips.ts` | Genre filter bar with scrollable chip list | `Store.ts` |
| `components/GameGrid.ts` | Responsive grid container rendering individual `GameCard` instances | `GameCard.ts`, `Store.ts` |
| `components/GameCard.ts` | Visual arcade card, hover glow, thumbnail badge, score display | `Router.ts` |
| `views/CatalogView.ts` | Main arcade feed combining Hero, Chips, and GameGrid | `Component.ts`, `Store.ts` |
| `views/GameView.ts` | Dedicated game player view wrapping `ArcadeEmbed` lifecycle | `ArcadeEmbed`, `Store.ts`, `Router.ts` |
| `views/EmbedView.ts` | Live embed kit sandbox and integration docs | `ArcadeEmbed`, `Store.ts` |

---

### Data Flow

1. **User Action / URL Change:** User clicks game card, enters search text, or navigates via back/forward browser history.
2. **Router / Action Dispatch:**
   - Hash changes trigger `Router.handleRoute()`, which updates `store.setState({ route })`.
   - UI input dispatches actions directly to `Store` (e.g. `store.setSearch(query)` or `store.toggleAudio()`).
3. **State Broadcast:** `Store` publishes updated immutable state to registered subscribers.
4. **Targeted View Update:**
   - On route change: Old view `destroy()` is called (cleaning up iframe/listeners), new view `mount()` is called inside `#view-container`.
   - On state change within current view (e.g. search filter): Only affected DOM nodes update via `update(state)` (e.g. card visibility or chip active class) without destroying the DOM tree or resetting input focus.
5. **Score & Storage Sync:**
   - `GameView` subscribes to postMessage events from `ArcadeEmbed`.
   - Incoming scores persist via `saveData()` and update high score badges in `Store`.

---

## Patterns to Follow

### Pattern 1: Component Lifecycle Model (Mount / Update / Destroy)
**What:** Pure TypeScript component class with explicit DOM lifecycle hooks. Avoids `innerHTML` destruction of the entire tree on every state change, preventing input focus drops, iframe reload flashes, and memory leaks.  
**When:** Every UI building block (cards, banners, views, controls).

**Example:**
```typescript
// src/core/Component.ts
export interface Component<P = void, S = void> {
  element: HTMLElement;
  mount(parent: HTMLElement): HTMLElement;
  update(props: P, state?: S): void;
  destroy(): void;
}

export abstract class BaseComponent<P = void> implements Component<P> {
  public element: HTMLElement;
  protected unbinds: Array<() => void> = [];

  constructor(tagName: keyof HTMLElementTagNameMap = 'div', className = '') {
    this.element = document.createElement(tagName);
    if (className) this.element.className = className;
  }

  public mount(parent: HTMLElement): HTMLElement {
    parent.appendChild(this.element);
    return this.element;
  }

  public abstract update(props: P): void;

  public destroy(): void {
    for (const unbind of this.unbinds) unbind();
    this.unbinds = [];
    this.element.remove();
  }

  protected addListener<K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void
  ): void {
    target.addEventListener(type, listener as EventListener);
    this.unbinds.push(() => target.removeEventListener(type, listener as EventListener));
  }
}
```

---

### Pattern 2: Lightweight Single-Store Pub/Sub
**What:** Zero-dependency, type-safe observable state store. Dispatches state updates and notifies subscribers. Supports partial state updates (`setState(partial)`).  
**When:** Managing global app state (route, search query, genre filter, audio mute status, high scores).

**Example:**
```typescript
// src/core/Store.ts
export interface AppState {
  route: { path: string; params: Record<string, string> };
  activeFilter: string;
  searchQuery: string;
  isMuted: boolean;
  isTheaterMode: boolean;
  highScores: Record<string, number>;
}

type Listener<T> = (state: T, prevState: T) => void;

export class Store<T extends object> {
  private state: T;
  private listeners = new Set<Listener<T>>();

  constructor(initialState: T) {
    this.state = Object.freeze({ ...initialState });
  }

  public getState(): Readonly<T> {
    return this.state;
  }

  public setState(patch: Partial<T>): void {
    const prevState = this.state;
    this.state = Object.freeze({ ...prevState, ...patch });
    for (const listener of this.listeners) {
      listener(this.state, prevState);
    }
  }

  public subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
```

---

### Pattern 3: Native Hash Router with View Transition Support
**What:** Client-side hash routing (`#/`, `#/game/:id`, `#/embed`) using `window.location.hash` and `hashchange`/`popstate`. Handles parameters and wraps view swaps with `document.startViewTransition()` when supported.  
**When:** Routing between catalog, game player, and embed documentation.

**Example:**
```typescript
// src/core/Router.ts
export interface RouteHandler {
  (params: Record<string, string>): void;
}

interface RouteRule {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class HashRouter {
  private routes: RouteRule[] = [];
  private notFoundHandler: RouteHandler = () => {};

  public on(path: string, handler: RouteHandler): this {
    const paramNames: string[] = [];
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({
      pattern: new RegExp(`^#?${regexPath}$`),
      paramNames,
      handler
    });
    return this;
  }

  public notFound(handler: RouteHandler): this {
    this.notFoundHandler = handler;
    return this;
  }

  public navigate(hash: string): void {
    window.location.hash = hash.startsWith('#') ? hash : `#${hash}`;
  }

  public start(): void {
    const dispatch = () => {
      const hash = window.location.hash || '#/';
      let matched = false;

      for (const route of this.routes) {
        const match = hash.match(route.pattern);
        if (match) {
          const params: Record<string, string> = {};
          route.paramNames.forEach((name, i) => {
            params[name] = decodeURIComponent(match[i + 1]!);
          });

          // Transition wrapper
          if ('startViewTransition' in document && typeof document.startViewTransition === 'function') {
            document.startViewTransition(() => route.handler(params));
          } else {
            route.handler(params);
          }
          matched = true;
          break;
        }
      }

      if (!matched) {
        this.notFoundHandler({});
      }
    };

    window.addEventListener('hashchange', dispatch);
    dispatch();
  }
}
```

---

### Pattern 4: 3-Tier CSS Design Token System
**What:** Centralized CSS token architecture with Primitives, Semantics, and Scoped Component classes. Enables unified styling between the hub app, embed kit, and future themes.  
**When:** All styling across the application.

**Token Hierarchy:**
```
src/styles/
├── tokens.css      <-- Level 1: Primitives (Colors, Fonts, Spacing, Glows)
├── theme.css       <-- Level 2: Semantic mappings (--color-surface, --color-accent)
├── base.css        <-- Reset & typography rules
└── components/     <-- Level 3: Component styles (.ac-card, .ac-header, .ac-badge)
```

**Example:**
```css
/* src/styles/tokens.css */
:root {
  /* Primitive Palettes */
  --ac-palette-purple-900: #0d0714;
  --ac-palette-purple-800: #190e28;
  --ac-palette-purple-700: #2a1845;
  --ac-palette-neon-cyan: #00f0ff;
  --ac-palette-neon-magenta: #ff007f;
  --ac-palette-neon-gold: #ffd700;
  --ac-palette-neon-lime: #00ff88;

  /* Typography */
  --ac-font-display: 'Press Start 2P', 'Chakra Petch', system-ui, sans-serif;
  --ac-font-sans: 'Chakra Petch', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Spacing */
  --ac-space-xs: 4px;
  --ac-space-sm: 8px;
  --ac-space-md: 16px;
  --ac-space-lg: 24px;
  --ac-space-xl: 32px;

  /* Radii */
  --ac-radius-sm: 6px;
  --ac-radius-md: 12px;
  --ac-radius-lg: 20px;
  --ac-radius-full: 9999px;

  /* Glow Effects */
  --ac-glow-cyan: 0 0 15px rgba(0, 240, 255, 0.4), 0 0 30px rgba(0, 240, 255, 0.15);
  --ac-glow-magenta: 0 0 15px rgba(255, 0, 127, 0.4), 0 0 30px rgba(255, 0, 127, 0.15);
  --ac-glow-gold: 0 0 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.15);
}

/* src/styles/theme.css */
:root {
  --ac-bg-app: var(--ac-palette-purple-900);
  --ac-bg-surface: var(--ac-palette-purple-800);
  --ac-bg-surface-raised: var(--ac-palette-purple-700);
  --ac-border-subtle: rgba(255, 255, 255, 0.1);
  --ac-border-active: var(--ac-palette-neon-cyan);

  --ac-text-primary: #ffffff;
  --ac-text-secondary: #a79bb7;
  --ac-text-accent: var(--ac-palette-neon-cyan);

  --ac-brand-primary: var(--ac-palette-neon-magenta);
  --ac-brand-secondary: var(--ac-palette-neon-cyan);
}
```

---

### Pattern 5: Clean Iframe Player Lifecycle Isolation
**What:** Encapsulating `ArcadeEmbed` and iframe postMessage bindings into a dedicated `GameView` lifecycle. On unmount/destroy, the iframe is paused and removed from the DOM, guaranteeing background audio stops and memory is freed.  
**When:** Switching between games and returning to the catalog.

**Example:**
```typescript
// src/views/GameView.ts
import { BaseComponent } from '../core/Component';
import { ArcadeEmbed } from '@arcade-carnival/playables-adapter';
import { GameItem } from '../data/games';
import { store } from '../main';

export class GameView extends BaseComponent {
  private embed: ArcadeEmbed | null = null;
  private currentGame: GameItem | null = null;

  constructor() {
    super('div', 'ac-player-view');
  }

  public setGame(game: GameItem): void {
    this.currentGame = game;
    this.render();
  }

  private render(): void {
    if (!this.currentGame) return;
    this.destroyEmbed();

    this.element.innerHTML = `
      <div class="ac-player-header">
        <button class="ac-btn-back" id="player-back-btn">
          <span class="ac-btn-icon">←</span> Back to Carnival
        </button>
        <div class="ac-player-title-box">
          <span class="ac-player-icon">${this.currentGame.icon}</span>
          <h2>${this.currentGame.title}</h2>
          <span class="ac-badge ac-badge-genre">${this.currentGame.genre}</span>
        </div>
        <button class="ac-btn-theater" id="player-theater-btn">
          ${store.getState().isTheaterMode ? '⤢ Default' : '⤡ Theater'}
        </button>
      </div>

      <div class="ac-player-frame-wrapper ${store.getState().isTheaterMode ? 'theater' : ''}" id="iframe-target"></div>

      <div class="ac-player-details">
        <div class="ac-details-content">
          <p>${this.currentGame.description}</p>
          <div class="ac-tags-row">
            ${this.currentGame.features.map(f => `<span class="ac-tag">✦ ${f}</span>`).join('')}
          </div>
        </div>
        <div class="ac-score-widget">
          <span class="ac-score-label">BEST SCORE</span>
          <span class="ac-score-value" id="game-best-score">
            ${(store.getState().highScores[this.currentGame.id] ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    `;

    const target = this.element.querySelector('#iframe-target') as HTMLElement;
    this.embed = new ArcadeEmbed({
      container: target,
      game: this.currentGame.id as any,
      width: '100%',
      height: '100%',
      onScore: (score) => {
        const best = Math.max(score, store.getState().highScores[this.currentGame!.id] ?? 0);
        const scores = { ...store.getState().highScores, [this.currentGame!.id]: best };
        store.setState({ highScores: scores });
        const el = this.element.querySelector('#game-best-score');
        if (el) el.textContent = best.toLocaleString();
      }
    });

    this.element.querySelector('#player-back-btn')?.addEventListener('click', () => {
      window.location.hash = '#/';
    });
    this.element.querySelector('#player-theater-btn')?.addEventListener('click', () => {
      store.setState({ isTheaterMode: !store.getState().isTheaterMode });
    });
  }

  public update(): void {
    // Re-render theater mode styles without rebuilding iframe
    const wrapper = this.element.querySelector('.ac-player-frame-wrapper');
    const theaterBtn = this.element.querySelector('#player-theater-btn');
    if (wrapper) {
      wrapper.classList.toggle('theater', store.getState().isTheaterMode);
    }
    if (theaterBtn) {
      theaterBtn.textContent = store.getState().isTheaterMode ? '⤢ Default' : '⤡ Theater';
    }
  }

  private destroyEmbed(): void {
    if (this.embed) {
      this.embed.pause();
      this.embed.destroy();
      this.embed = null;
    }
  }

  public override destroy(): void {
    this.destroyEmbed();
    super.destroy();
  }
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Monolithic `#app.innerHTML` Repainting
**What:** Calling `app.innerHTML = renderUI()` whenever state (e.g. search string, audio mute, genre tab) changes.  
**Why bad:**
1. Wipes the active game iframe, killing running canvas loops, WebAudio contexts, and unsaved in-memory game progress.
2. Drops focus and cursor position from text search inputs on every keystroke.
3. Causes DOM thrashing, reflows, and eliminates CSS transition smoothness.  
**Instead:** Mount permanent layout shell (Header, Navigation, ViewContainer) once. Switch active views via the router, and update stateful elements via localized DOM element property setters (`textContent`, `classList`).

### Anti-Pattern 2: Global `window.actionName` Function Attachment
**What:** Attaching global handlers like `window.launchGame = ...` or `window.setFilter = ...` for HTML inline `onclick` attributes.  
**Why bad:** Pollutes the global namespace, bypasses TypeScript compile-time safety, causes tight coupling, and breaks modularity.  
**Instead:** Use `addEventListener` inside component classes with automated cleanup via `unbinds` array during `destroy()`.

### Anti-Pattern 3: Hardcoded Inline Styles in Embed & Hub Pages
**What:** Inline CSS blocks with independent color schemes (like in current `embed.html` and `src/hub.css`).  
**Why bad:** Visual drift, duplicate maintenance, inconsistent brand aesthetic.  
**Instead:** Both `index.html` and `embed.html` import `src/styles/tokens.css` and `src/styles/theme.css`.

---

## Recommended Directory Structure

```
src/
├── core/
│   ├── Component.ts          # BaseComponent lifecycle abstract class
│   ├── Store.ts              # Reactive pub/sub store & AppState types
│   ├── Router.ts             # Hash router with param matching & ViewTransitions
│   └── events.ts             # Shared event bus / typed event definitions
├── data/
│   └── games.ts              # GameItem metadata definitions and catalog data
├── components/
│   ├── AppHeader.ts          # Top arcade navbar, search, mute toggle
│   ├── AppSidebar.ts         # Desktop navigation sidebar
│   ├── BottomNav.ts          # Mobile navigation bar (< 768px)
│   ├── FilterChips.ts        # Genre filter chip bar
│   ├── HeroBanner.ts         # Featured arcade hero marquee
│   ├── GameCard.ts           # Individual minigame card with hover effects
│   └── GameGrid.ts           # Grid container rendering GameCard instances
├── views/
│   ├── CatalogView.ts        # Home arcade catalog feed
│   ├── GameView.ts           # Dedicated iframe game player view
│   └── EmbedView.ts          # Embed kit interactive sandbox & code guide
├── styles/
│   ├── tokens.css            # Tier 1: Primitives (palette, fonts, radii, glows)
│   ├── theme.css             # Tier 2: Semantics (--ac-bg-surface, --ac-brand-*)
│   ├── base.css              # Typography & resets
│   ├── layout.css            # Grid, header, sidebar, mobile bottom-bar
│   └── components/
│       ├── header.css
│       ├── cards.css
│       ├── hero.css
│       ├── player.css
│       └── embed.css
└── main.ts                   # App entrypoint (initializes Store, Router, AppShell)
```

---

## Migration Strategy (Phase-by-Phase)

1. **Step 1: CSS Token Foundation**
   - Create `src/styles/tokens.css`, `src/styles/theme.css`, and `src/styles/base.css`.
   - Map legacy `--yt-*` variables to retro-arcade `--ac-*` tokens.
   - Link tokens into `embed.html` to unify styling immediately.

2. **Step 2: Core Architecture Primitives**
   - Implement `src/core/Component.ts`, `src/core/Store.ts`, and `src/core/Router.ts`.
   - Write unit tests in `test/core/` for Router param parsing and Store pub/sub.

3. **Step 3: Componentization & Views**
   - Extract `GAMES` list into `src/data/games.ts`.
   - Implement `AppHeader`, `AppSidebar`, `BottomNav`, `GameCard`, and `GameGrid`.
   - Implement `CatalogView` and `GameView`.
   - Replace `src/hub.ts` with clean `src/main.ts` bootstrap.

4. **Step 4: Mobile & Transitions Polish**
   - Add CSS media queries for BottomNav dock navigation on mobile.
   - Configure View Transitions API animations (slide/crossfade between views).

5. **Step 5: Cleanup & Deprecation**
   - Remove legacy `src/hub.css` and obsolete monolithic references.
   - Verify all existing Vitest test suites (191 tests) continue passing with zero regressions.

---

## Scalability Considerations

| Concern | 5 Games (Current) | 25 Games (Catalog Scale) | 100+ Games (Platform Scale) |
|---------|-------------------|--------------------------|-----------------------------|
| **DOM Nodes** | ~40 nodes in grid; full DOM render instant | Direct DOM rendering < 200 nodes; fast | Virtualized grid rendering (`IntersectionObserver` lazy cards) |
| **Routing** | 3 routes (`#/`, `#/game/:id`, `#/embed`) | Same routing rules; handles dynamic slugs automatically | Same routing rules; add category sub-routes (`#/category/:genre`) |
| **Search & Filtering** | In-memory array `.filter()` on keystroke (< 1ms) | In-memory array `.filter()` (< 2ms) | Tokenized search index / MiniSearch / WebWorker indexing |
| **Bundle Size** | Core TS runtime < 10KB unminified, 0 dependencies | Core TS runtime remains < 10KB | Core TS runtime remains < 10KB |

---

## Sources

- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) — HIGH confidence
- [MDN: Window hashchange event](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event) — HIGH confidence
- [Arcade Carnival Codebase: `packages/playables-adapter/src/embed.ts`](../../packages/playables-adapter/src/embed.ts) — HIGH confidence
- [Arcade Carnival Codebase: `src/hub.ts`](../../src/hub.ts) — HIGH confidence
