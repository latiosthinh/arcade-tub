import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initPlayables,
  reportScore,
  saveData,
  loadData,
  onPause,
  onResume,
} from '../src/index';

describe('playables-adapter', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('fallback localStorage mode', () => {
    it('saves and loads data via localStorage when not in playables host', () => {
      saveData('level', '5');
      expect(localStorage.getItem('arcade-carnival-level')).toBe('5');
      expect(loadData('level')).toBe('5');
      expect(loadData('unknown')).toBeNull();
    });

    it('reports score to localStorage when not in playables host', () => {
      reportScore(1500);
      expect(localStorage.getItem('arcade-carnival-score')).toBe('1500');
    });
  });

  describe('lifecycle hooks and postMessage', () => {
    it('registers message listener on initPlayables and triggers pause/resume', () => {
      let paused = false;
      let resumed = false;

      onPause(() => {
        paused = true;
      });
      onResume(() => {
        resumed = true;
      });

      initPlayables();

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'pause' },
        })
      );
      expect(paused).toBe(true);

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'resume' },
        })
      );
      expect(resumed).toBe(true);
    });

    it('loads data from host load message', () => {
      initPlayables();

      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: 'load',
            data: { highScore: '9999' },
          },
        })
      );

      expect(loadData('highScore')).toBe('9999');
    });
  });
});
