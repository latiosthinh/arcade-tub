# Phase 8: Design System & Visual Foundation - Context

## Objective
Establish retro-modern cyber-arcade CSS token palette, shared stylesheet structure across hub, embed kit, and standalone game shells, and persistent CRT scanline/bloom visual overlay with user toggle in localStorage.

## Decisions

- **D-01 (CSS Design Tokens Architecture)**: Create `src/styles/tokens.css` containing semantic custom properties for cyber-arcade palette:
  - Deep cyber darks: `--bg-primary: #0a0a12`, `--bg-surface: #121324`, `--bg-card: #181a30`, `--bg-card-hover: #222544`
  - Neon accents: `--neon-cyan: #00f0ff`, `--neon-pink: #ff007f`, `--neon-yellow: #ffe600`, `--neon-green: #00ff88`, `--neon-purple: #9d00ff`
  - Glow filters & shadows: `--glow-cyan: 0 0 12px rgba(0, 240, 255, 0.45)`, `--glow-pink: 0 0 12px rgba(255, 0, 127, 0.45)`
  - Cyber typography: Clean geometric / monospace fallbacks (`system-ui`, `'Courier New'`, monospace, sans-serif) and standardized type scale (`--font-display`, `--font-mono`, `--font-sans`, `--text-xs` to `--text-3xl`).
  - Standardized border radii (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`) and borders (`--border-subtle`, `--border-accent`).

- **D-02 (Shared Stylesheet Integration)**: 
  - Create `src/styles/arcade.css` or modular theme files that build on top of `tokens.css`.
  - Update `src/hub.css` (or new modular CSS structure) to consume `tokens.css` rather than hardcoded `--yt-*` variables.
  - Link `tokens.css` / shared styling into `embed.html` and standalone game templates (`games/*/index.html`) so UI chrome, fonts, and controls share visual DNA without breaking iframe isolation.

- **D-03 (CRT Scanline & Bloom Visual Overlay)**:
  - Implement a lightweight, zero-dependency CRT visual overlay in CSS and TypeScript (`src/styles/crt.css` and `src/crt.ts` / overlay toggle).
  - Uses CSS pseudo-elements / fixed overlay with `pointer-events: none`, subtle scanline gradient, vignette, and optional flicker / bloom.
  - Include toggle controller that persists preference in `localStorage.getItem('arcade_crt_mode')` ('on' | 'off').
  - Ensure overlay does not impede performance, canvas frame rates, or touch interactions.

- **D-04 (Zero Runtime Dependencies)**:
  - Everything in Phase 8 must be pure CSS custom properties, native CSS gradients/pseudo-elements, and lightweight vanilla TypeScript.
  - Zero external CSS libraries or frameworks.

## Deferred Ideas
- Dynamic full light/dark theme switcher (deferred per FUT-01).
- Custom SVG animated badge illustrations (deferred per FUT-02).
