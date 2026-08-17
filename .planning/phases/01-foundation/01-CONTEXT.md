# Phase 1: Foundation - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the monorepo scaffold, shared Playables adapter package, canvas game loop boilerplate, and hub menu page. After this phase, each game folder has a working placeholder canvas page launchable from the hub, and the build pipeline produces per-game static bundles.

</domain>

<decisions>
## Implementation Decisions

### Monorepo Structure
- pnpm workspaces with `packages/` and `games/` directories
- `packages/playables-adapter/` — shared Playables lifecycle + score persistence
- `packages/game-engine/` — shared canvas game loop, input manager, scene manager
- `games/safe-cracker/`, `games/brick-blitz/`, `games/sky-hopper/`, `games/crate-catch/`, `games/type-strike/`
- Root `index.html` is the hub menu

### Playables Adapter API
- `initPlayables()` — registers lifecycle listeners (postMessage from YouTube iframe host)
- `reportScore(score: number)` — sends score to Playables host or falls back to localStorage
- `saveData(key: string, value: string)` — persists via Playables API or localStorage
- `loadData(key: string): string | null` — reads from Playables API or localStorage
- `onPause(cb: () => void)` / `onResume(cb: () => void)` — lifecycle hooks

### Game Engine Shared Module
- `GameLoop` class: fixed timestep (60fps), `update(dt)` + `render(ctx)` callbacks
- `InputManager`: keyboard state tracking (`isDown`, `justPressed`, `justReleased`)
- `SceneManager`: push/pop scenes (menu, playing, paused, game-over)
- Canvas auto-resize to fill container, maintain aspect ratio

### Hub Menu
- CSS grid of 5 game cards (name, thumbnail placeholder, "Play" button)
- Each card links to `/games/{name}/index.html`
- Dark theme, arcade aesthetic (neon accents, pixel-adjacent fonts)

### Build Pipeline
- Vite 7 multi-page build: root hub + each game as separate entry
- `pnpm build` outputs `dist/` with hub + per-game folders
- `pnpm dev` serves hub with HMR
- `pnpm typecheck` runs `tsc --noEmit` across all packages

### Claude's Discretion
- Exact CSS styling of hub page
- Game card placeholder thumbnail design
- Vite config details (plugin choices beyond @vitejs/plugin-vanilla)

</decisions>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<specifics>
## Specific Ideas

- Hub page should feel like an arcade cabinet menu — dark background, glowing card borders
- Each game's placeholder page should show the game name + "Coming Soon" on a canvas with a colored background

</specifics>

<deferred>
## Deferred Ideas

- Sound effects and music (add in Phase 7)
- Gamepad/touch input (keyboard-only for now)
- Animated hub transitions

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-08-17 via direct specification*
