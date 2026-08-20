# Phase 52: Game Flow, State Machine & Tally HUD - Context

**Gathered:** 2026-08-20
**Status:** Ready for planning
**Mode:** Auto-generated context

<domain>
## Phase Boundary
Orchestrate full arcade loop including title screen, stage select, stage intro curtains, active HUD side panel, end-stage kill tally screen, victory/defeat sequence, and localStorage high score persistence.
Requirements: LOOP-01, LOOP-02, LOOP-03, LOOP-04, LOOP-05, LOOP-06.
</domain>

<decisions>
## Implementation Decisions
- Finite state machine managing game states: `TITLE`, `STAGE_INTRO`, `PLAYING`, `PAUSED`, `STAGE_TALLY`, `GAME_OVER`, `VICTORY`.
- GameFlow / StateManager class coordinating stage selection, round start curtain animation timers, active game HUD data bindings (remaining enemy icons, player lives, stage number, current score, high score).
- End-stage score tally calculator: animated points roll-up per enemy class destroyed (Basic: 100, Fast: 200, Power: 300, Armor: 400), total tanks killed, bonus calculation.
- High score persistence with `localStorage` fallback.
- 100% Vitest unit test coverage.
</decisions>
