import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/GameState.js';

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
  });

  it('initializes with default values and ready status', () => {
    expect(state.status).toBe('ready');
    expect(state.score).toBe(0);
    expect(state.round).toBe(1);
    expect(state.lives).toBe(3);
    expect(state.streak).toBe(0);
    expect(state.playerStepIndex).toBe(0);
    expect(state.roundTimer).toBe(GameState.MAX_ROUND_TIME);
  });

  it('starts a new game properly', () => {
    state.start();
    expect(state.status).toBe('playback');
    expect(state.score).toBe(0);
    expect(state.round).toBe(1);
    expect(state.lives).toBe(3);
    expect(state.sequence.length).toBe(3);
  });

  it('switches to player turn when playback completes', () => {
    state.start();
    state.startPlayerTurn();
    expect(state.status).toBe('player_turn');
    expect(state.playerStepIndex).toBe(0);
    expect(state.roundTimer).toBe(GameState.MAX_ROUND_TIME);
  });

  it('validates player steps and calculates score on round completion', () => {
    state.start();
    const seq = state.sequence; // length 3
    state.startPlayerTurn();

    // First step correct
    const res1 = state.submitStep(seq[0]);
    expect(res1.correct).toBe(true);
    expect(res1.roundCompleted).toBe(false);
    expect(res1.gameOver).toBe(false);
    expect(state.playerStepIndex).toBe(1);

    // Second step correct
    const res2 = state.submitStep(seq[1]);
    expect(res2.correct).toBe(true);
    expect(res2.roundCompleted).toBe(false);
    expect(state.playerStepIndex).toBe(2);

    // Third step correct (round clear)
    const res3 = state.submitStep(seq[2]);
    expect(res3.correct).toBe(true);
    expect(res3.roundCompleted).toBe(true);
    expect(res3.gameOver).toBe(false);
    expect(res3.pointsAwarded).toBeGreaterThan(0);
    expect(state.status).toBe('round_complete');
    expect(state.streak).toBe(1);

    // Advance to next round
    state.advanceRound();
    expect(state.round).toBe(2);
    expect(state.sequence.length).toBe(4);
    expect(state.status).toBe('playback');
  });

  it('handles wrong step: deducts life, resets streak and step index, and transitions to gameover at 0 lives', () => {
    state.start();
    const seq = state.sequence;
    state.startPlayerTurn();

    // Wrong step
    const wrongId = (seq[0] + 1) % 9;
    const res = state.submitStep(wrongId);
    expect(res.correct).toBe(false);
    expect(res.roundCompleted).toBe(false);
    expect(res.gameOver).toBe(false);
    expect(state.lives).toBe(2);
    expect(state.streak).toBe(0);
    expect(state.playerStepIndex).toBe(0);

    // Deduct remaining lives
    state.submitStep(wrongId);
    expect(state.lives).toBe(1);

    const fatalRes = state.submitStep(wrongId);
    expect(fatalRes.correct).toBe(false);
    expect(fatalRes.gameOver).toBe(true);
    expect(state.lives).toBe(0);
    expect(state.status).toBe('gameover');
  });

  it('deducts life when round timer expires during player turn', () => {
    state.start();
    state.startPlayerTurn();

    state.update(GameState.MAX_ROUND_TIME + 0.1);
    expect(state.lives).toBe(2);
    expect(state.roundTimer).toBe(GameState.MAX_ROUND_TIME);

    state.update(GameState.MAX_ROUND_TIME + 0.1);
    expect(state.lives).toBe(1);

    state.update(GameState.MAX_ROUND_TIME + 0.1);
    expect(state.lives).toBe(0);
    expect(state.status).toBe('gameover');
  });

  it('handles pause and resume', () => {
    state.start();
    state.startPlayerTurn();

    state.pause();
    expect(state.status).toBe('paused');

    // Update while paused does nothing
    state.update(5.0);
    expect(state.roundTimer).toBe(GameState.MAX_ROUND_TIME);

    state.resume();
    expect(state.status).toBe('player_turn');
  });

  it('ignores input during non-player_turn states', () => {
    state.start(); // status: playback
    const res = state.submitStep(0);
    expect(res.correct).toBe(false);
    expect(res.pointsAwarded).toBe(0);
    expect(state.lives).toBe(3);
  });
});
