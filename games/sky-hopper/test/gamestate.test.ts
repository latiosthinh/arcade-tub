import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState.js';
import * as playables from '@arcade-carnival/playables-adapter';

describe('GameState', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('initializes in ready status with default story mode settings', () => {
    const gs = new GameState();
    expect(gs.status).toBe('ready');
    expect(gs.mode).toBe('story');
    expect(gs.altitude).toBe(0);
    expect(gs.maxAltitude).toBe(0);
    expect(gs.score).toBe(0);
    expect(gs.targetAltitude).toBe(5000);
  });

  it('sets mode to infinite and updates targetAltitude to Infinity', () => {
    const gs = new GameState();
    gs.setMode('infinite');
    expect(gs.mode).toBe('infinite');
    expect(gs.targetAltitude).toBe(Infinity);
  });

  it('calculates altitude and updates maxAltitude and score', () => {
    const gs = new GameState();
    gs.start('story');
    expect(gs.status).toBe('playing');

    // World Y = 500 -> 0m
    gs.updateAltitude(500);
    expect(gs.altitude).toBe(0);
    expect(gs.maxAltitude).toBe(0);
    expect(gs.score).toBe(0);

    // Climbed 1000px up -> world Y = -500 -> (500 - (-500)) / 10 = 100m
    gs.updateAltitude(-500);
    expect(gs.altitude).toBe(100);
    expect(gs.maxAltitude).toBe(100);
    expect(gs.score).toBe(100);
    expect(gs.highScore).toBe(100);

    // Falling down to Y = 0 (50m) does not reduce maxAltitude or score
    gs.updateAltitude(0);
    expect(gs.altitude).toBe(50);
    expect(gs.maxAltitude).toBe(100);
    expect(gs.score).toBe(100);
  });

  it('triggers victory in story mode when target altitude reached', () => {
    const gs = new GameState();
    gs.start('story');

    // Target is 5000m -> world Y = -49500 -> (500 - (-49500)) / 10 = 5000m
    gs.updateAltitude(-49500);

    expect(gs.status).toBe('victory');
    expect(gs.altitude).toBe(5000);
    // Score = 5000 + 2500 clear bonus = 7500
    expect(gs.score).toBe(7500);
    expect(gs.highScore).toBe(7500);
  });

  it('triggers game over and persists high score and reports score', () => {
    const saveSpy = vi.spyOn(playables, 'saveData');
    const reportSpy = vi.spyOn(playables, 'reportScore');

    const gs = new GameState();
    gs.start('infinite');
    gs.updateAltitude(-1500); // 200m
    gs.addScore(150); // bonus points

    expect(gs.score).toBe(350);

    gs.triggerGameOver();

    expect(gs.status).toBe('gameover');
    expect(saveSpy).toHaveBeenCalledWith('sky-hopper-highscore', '350');
    expect(reportSpy).toHaveBeenCalledWith(350);
  });

  it('adds bonus points and updates high score correctly', () => {
    const gs = new GameState();
    gs.start('story');
    gs.addScore(100);
    expect(gs.score).toBe(100);
    expect(gs.bonusPoints).toBe(100);
    expect(gs.highScore).toBe(100);
  });

  it('handles pause, resume, and restart cycles', () => {
    const gs = new GameState();
    gs.start('story');
    expect(gs.status).toBe('playing');

    gs.pause();
    expect(gs.status).toBe('paused');

    gs.resume();
    expect(gs.status).toBe('playing');

    gs.updateAltitude(-500);
    expect(gs.maxAltitude).toBe(100);

    gs.restart();
    expect(gs.status).toBe('playing');
    expect(gs.altitude).toBe(0);
    expect(gs.maxAltitude).toBe(0);
    expect(gs.score).toBe(0);
  });
});
