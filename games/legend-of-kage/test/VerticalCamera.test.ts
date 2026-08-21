import { describe, it, expect } from 'vitest';
import { VerticalCamera } from '../src/VerticalCamera';

describe('VerticalCamera (PHYS-05)', () => {
  it('tracks vertical leaps with upward-biased look-ahead', () => {
    const camera = new VerticalCamera({ viewportWidth: 800, viewportHeight: 600, stageHeight: 1200 });
    camera.x = 100;
    camera.y = 600;

    // Player leaps up rapidly
    camera.update(400, 200, -800, 0.1);

    expect(camera.y).toBeLessThan(600); // Camera moved up
  });

  it('clamps coordinates to stage boundaries', () => {
    const camera = new VerticalCamera({ viewportWidth: 800, viewportHeight: 600, stageWidth: 1000, stageHeight: 800 });
    camera.update(2000, -500, 0, 0.1);

    expect(camera.x).toBeLessThanOrEqual(200);
    expect(camera.y).toBe(0);
  });
});
