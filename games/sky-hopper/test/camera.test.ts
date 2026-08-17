import { describe, it, expect, beforeEach } from 'vitest';
import { Camera } from '../src/Camera.js';

describe('Camera', () => {
  let camera: Camera;

  beforeEach(() => {
    camera = new Camera();
  });

  it('initializes with default viewport and offset', () => {
    expect(camera.y).toBe(0);
    expect(camera.viewportWidth).toBe(800);
    expect(camera.viewportHeight).toBe(600);
    expect(camera.targetOffset).toBe(320);
  });

  it('resets based on initial player position', () => {
    camera.reset(500);
    expect(camera.y).toBe(500 - 320); // 180
  });

  it('scrolls upward when player climbs above threshold', () => {
    camera.reset(500); // camera.y = 180
    camera.update(400, 0.016); // targetY = 400 - 320 = 80 < 180
    expect(camera.y).toBe(80);
  });

  it('strictly enforces upward-only scrolling (never scrolls downward when player falls)', () => {
    camera.reset(500); // camera.y = 180
    camera.update(300, 0.016); // targetY = -20
    expect(camera.y).toBe(-20);

    // Player falls to y = 600
    camera.update(600, 0.016); // targetY = 280 > -20
    expect(camera.y).toBe(-20); // Must remain at lowest y (highest climb)
  });

  it('transforms world coordinates to screen coordinates and vice-versa', () => {
    camera.y = 100;
    expect(camera.toScreenY(250)).toBe(150);
    expect(camera.toWorldY(150)).toBe(250);
  });

  it('accurately detects out-of-bounds bottom culling and visibility', () => {
    camera.y = 100;
    // Viewport is [100, 700]
    expect(camera.isOutOfBounds(701)).toBe(true);
    expect(camera.isOutOfBounds(650)).toBe(false);

    expect(camera.isVisible(150, 20)).toBe(true);
    expect(camera.isVisible(750, 20)).toBe(false);
    expect(camera.isVisible(50, 20)).toBe(false);
    expect(camera.isVisible(90, 20)).toBe(true); // 90 + 20 = 110 >= 100
  });
});
