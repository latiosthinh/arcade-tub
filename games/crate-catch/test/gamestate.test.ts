import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState.js';
import * as playablesAdapter from '@arcade-carnival/playables-adapter';

describe('GameState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes in ready status with correct default values', () => {
    const gs = new GameState();
    expect(gs.status).toBe('ready');
    expect(gs.hp).toBe(100);
    expect(gs.maxHp).toBe(100);
    expect(gs.missedCrates).toBe(0);
    expect(gs.maxMissedCrates).toBe(5);
    expect(gs.score).toBe(0);
    expect(gs.round).toBe(1);
    expect(gs.bankedCratesCount).toBe(0);
  });

  it('starts game and resets round stats', () => {
    const gs = new GameState();
    gs.hp = 20;
    gs.missedCrates = 4;
    gs.score = 500;
    gs.start();

    expect(gs.status).toBe('playing');
    expect(gs.hp).toBe(100);
    expect(gs.missedCrates).toBe(0);
    expect(gs.score).toBe(0);
    expect(gs.round).toBe(1);
    expect(gs.bankedCratesCount).toBe(0);
  });

  it('handles cart damage and triggers game over at 0 HP', () => {
    const gs = new GameState();
    gs.start();

    gs.damageCart(35);
    expect(gs.hp).toBe(65);
    expect(gs.status).toBe('playing');

    gs.damageCart(70);
    expect(gs.hp).toBe(0);
    expect(gs.status).toBe('gameover');
  });

  it('repairs cart without exceeding maxHp', () => {
    const gs = new GameState();
    gs.start();
    gs.damageCart(50);
    expect(gs.hp).toBe(50);

    gs.repairCart(35);
    expect(gs.hp).toBe(85);

    gs.repairCart(35);
    expect(gs.hp).toBe(100);
  });

  it('tracks missed crates and triggers game over when hitting 5 missed crates', () => {
    const gs = new GameState();
    gs.start();

    for (let i = 0; i < 4; i++) {
      gs.registerMissedCrate();
      expect(gs.status).toBe('playing');
    }
    expect(gs.missedCrates).toBe(4);

    gs.registerMissedCrate();
    expect(gs.missedCrates).toBe(5);
    expect(gs.status).toBe('gameover');
  });

  it('adds banked score, updates high score, and scales rounds every 1500 points', () => {
    const gs = new GameState();
    gs.start();

    gs.addBankedScore(1200, 3);
    expect(gs.score).toBe(1200);
    expect(gs.bankedCratesCount).toBe(3);
    expect(gs.highScore).toBe(1200);
    expect(gs.round).toBe(1);

    gs.addBankedScore(600, 2);
    expect(gs.score).toBe(1800);
    expect(gs.bankedCratesCount).toBe(5);
    expect(gs.highScore).toBe(1800);
    expect(gs.round).toBe(2);

    gs.addBankedScore(3000, 6);
    expect(gs.score).toBe(4800);
    expect(gs.round).toBe(4);
  });

  it('triggers game over, saves high score, and reports score to adapter', () => {
    const saveSpy = vi.spyOn(playablesAdapter, 'saveData');
    const reportSpy = vi.spyOn(playablesAdapter, 'reportScore');

    const gs = new GameState();
    gs.start();
    gs.addBankedScore(2500, 5);
    gs.triggerGameOver();

    expect(gs.status).toBe('gameover');
    expect(saveSpy).toHaveBeenCalledWith('crate-catch-highscore', '2500');
    expect(reportSpy).toHaveBeenCalledWith(2500);
  });

  it('supports pause, resume, and restart controls', () => {
    const gs = new GameState();
    gs.start();
    expect(gs.status).toBe('playing');

    gs.pause();
    expect(gs.status).toBe('paused');

    gs.resume();
    expect(gs.status).toBe('playing');

    gs.restart();
    expect(gs.status).toBe('playing');
    expect(gs.score).toBe(0);
  });

  it('loads saved high score on creation if available', () => {
    localStorage.setItem('arcade-carnival-crate-catch-highscore', '4500');
    const gs = new GameState();
    expect(gs.highScore).toBe(4500);
  });
});
