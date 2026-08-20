# Phase 54: Mobile Virtual Controls & Responsive Viewport - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning
**Mode:** Auto-generated context

<domain>
## Phase Boundary
Deliver responsive 4-way virtual D-Pad with angular hysteresis, dedicated Fire button, multi-touch isolation, and pixel-crisp 416×416 aspect ratio scaling across mobile and desktop viewports.
Requirements: MOBILE-01, MOBILE-02, MOBILE-03.
</domain>

<decisions>
## Implementation Decisions
- TouchController / VirtualDPad: Cardinal 4-way direction calculation with 45-degree quadrant boundaries and deadzone hysteresis to prevent accidental diagonal jitter.
- Multi-touch isolation: separate active pointer IDs for D-Pad and Fire button (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`) with `touch-action: none`.
- Viewport / Aspect Ratio Scaler `ViewportManager.ts`: Scales the 416x416 game arena + side HUD panel onto any screen (portrait, landscape, desktop) while preserving integer/crisp canvas pixel ratios.
- 100% Vitest unit test coverage.
</decisions>
