# Technology Stack: UI/UX Refactor

**Project:** Arcade Carnival (v2.0 UI/UX Refactor)  
**Researched:** 2026-08-17  
**Constraint Gate:** Strict 0 runtime dependencies, bundle < 200KB gzipped, vanilla TS + pure CSS.

---

## Recommended Stack

### 1. Core Architecture & Component Pattern
| Technology / Pattern | Version / API | Purpose | Why (Over Alternatives) |
|---|---|---|---|
| **Vanilla TS Custom Elements (Web Components)** | Web Components Standard (Custom Elements v1, `HTMLElement`, `customElements.define`) | Encapsulated UI components (`<arcade-hub>`, `<game-card>`, `<game-player>`, `<nav-bar>`) | Zero dependencies. Native lifecycle hooks (`connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`). Standard DOM operations. No VDOM overhead. |
| **Light DOM + Scoped CSS Custom Properties** | Native CSS / DOM | Component styling & token inheritance | Avoids Shadow DOM event retargeting, form/accessibility friction, and styling barrier overhead while preserving CSS custom property cascading across components. |
| **Tagged Template Literal DOM Builder** | Pure TS utility (< 40 LOC) | Safe, declarative DOM updates with template cloning | Eliminates full `innerHTML` re-renders and lost focus states. Uses `<template>` cloning or targeted DOM diffing/patching without adding npm packages like Lit or HyperHTML. |

### 2. Styling & Design System
| Technology / Token Pattern | Standard / Spec | Purpose | Why |
|---|---|---|---|
| **CSS Custom Properties (Tokens)** | CSS Custom Properties Level 1 | Theming (Arcade Carnival retro-modern neon/carnival palette, spacing, typography, radii, elevation) | Instant theme switches, zero runtime CSS-in-JS engine overhead, accessible via JS `element.style.setProperty`. |
| **Native CSS Nesting & Modern Selectors** | CSS Nesting Module Level 1, `:has()`, `:is()` | Scoped, organized component stylesheets | Supported in all modern browsers (Chrome 120+, Safari 17.2+, Firefox 117+). Eliminates build-time PostCSS/Sass preprocessing dependencies. |
| **CSS View Transitions API** | `document.startViewTransition()` | Smooth page/view transitions (Hub Grid <-> Game Player, Filter transitions) | Browser-native GPU-accelerated transition engine. Fallbacks gracefully if unsupported (`if (!document.startViewTransition) { updateDOM(); return; }`). Zero KB payload cost. |
| **System & Local Pixel/Retro Web Fonts** | `font-display: swap`, WOFF2 / `@font-face` / System fallbacks | Carnival arcade brand identity | High performance, zero external CDN blocking (e.g. no Google Fonts runtime fetches). Self-contained assets. |

### 3. Routing & State Management
| Technology | API / Spec | Purpose | Why |
|---|---|---|---|
| **Hash Router + History API** | `window.location.hash`, `hashchange`, `history.pushState` | Client-side routing (`#/`, `#/game/:id`, `#/embed`) with back/forward history support | Works seamlessly on static file servers, GitHub Pages, and inside YouTube Playables iframe without requiring server URL rewrites (which fail on 404 for path-based SPAs). |
| **Vanilla Pub/Sub Reactive Store** | Native TS EventTarget / Minimal Observer (< 25 LOC) | Cross-component state sync (active game, audio mute, filter query, search term, theater mode) | Native `EventTarget` or tiny typed listener list. Zero KB bundle impact. Decouples header, search bar, and game player. |

### 4. Vector Graphics & Asset Strategy
| Technology / Asset Type | Format | Purpose | Why |
|---|---|---|---|
| **Inline SVG Sprites & Utility Functions** | Raw SVG / `<svg><use href="#..."></use></svg>` | Sharp arcade icons, pixel badges, control buttons | Crisp at any DPI/resolution, zero font-file parsing overhead, 100% styleable via CSS `currentColor` and custom properties. |
| **Procedural Canvas / SVG Thumbnails** | Native Canvas 2D / SVG | Dynamic game previews & animated carnival backdrops | Zero raster image payloads (PNG/JPG). Keeps build well below the 200KB gzipped budget. |

---

## What NOT to Add (Strict Anti-Stack)

| Library / Tool | Why Excluded | What Native Pattern Replaces It |
|---|---|---|
| **React / Preact / Vue / Svelte** | Adds 3KB–45KB runtime runtime weight, build complexity, and breaks zero-dep requirement | Vanilla TS Custom Elements + Tagged template literals |
| **Tailwind CSS / PostCSS** | Unnecessary tooling overhead, extra config, generates utility clutter | Pure CSS with Custom Properties, CSS Nesting, and Flex/Grid |
| **Lit / Haunted / FAST** | 5KB–15KB runtime dependency, extra abstractions | Native `class extends HTMLElement` with light DOM |
| **Navigo / Page.js / Universal Router** | Third-party routing dependency | 30-line vanilla `hashchange` listener router |
| **Lucide / FontAwesome / Material Icons** | Heavy font/SVG bundles (100KB+) | Curated inline SVG symbols + arcade-tailored SVG sprites |
| **Zustand / Redux / Nano Stores** | External state manager libraries | Native `EventTarget` or 20-line TS reactive store |

---

## Native Architecture Recipes

### 1. Minimal Zero-Dependency Hash Router
```typescript
type RouteHandler = (params: Record<string, string>) => void;

export class ArcadeRouter {
  private routes: { pattern: RegExp; keys: string[]; handler: RouteHandler }[] = [];

  on(path: string, handler: RouteHandler) {
    const keys: string[] = [];
    const regexStr = path.replace(/:([a-zA-Z0-9_-]+)/g, (_, key) => {
      keys.push(key);
      return '([a-zA-Z0-9_-]+)';
    });
    this.routes.push({ pattern: new RegExp(`^#${regexStr}$`), keys, handler });
    return this;
  }

  start() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }

  navigate(hash: string) {
    window.location.hash = hash.startsWith('#') ? hash : `#${hash}`;
  }

  private resolve() {
    const hash = window.location.hash || '#/';
    for (const route of this.routes) {
      const match = hash.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.keys.forEach((key, idx) => {
          params[key] = match[idx + 1];
        });
        route.handler(params);
        return;
      }
    }
  }
}
```

### 2. View Transitions API Helper (Smooth Screen Flips)
```typescript
export function transitionView(updateDom: () => void): void {
  if (!('startViewTransition' in document) || typeof document.startViewTransition !== 'function') {
    updateDom();
    return;
  }
  document.startViewTransition(() => {
    updateDom();
  });
}
```

### 3. Lightweight Base Custom Element
```typescript
export abstract class BaseElement extends HTMLElement {
  protected connectedCallback(): void {
    this.render();
  }

  abstract render(): void;

  protected setStyleProperty(prop: string, value: string): void {
    this.style.setProperty(prop, value);
  }
}
```

---

## Installation & Build Commands

No new runtime npm packages needed. Existing `devDependencies` cover all tasks.

```bash
# Verify existing dev toolchain
pnpm build
pnpm test
pnpm audit-bundle
```

---

## Sources & Standards
- [MDN Web Docs: View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [MDN Web Docs: Web Components & Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [MDN Web Docs: CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN Web Docs: CSS Nesting Module](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting)
