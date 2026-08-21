import { describe, it, expect, beforeEach } from 'vitest';
import { Camera } from '../src/Camera';

describe('Camera', () => {
  let camera: Camera;

  beforeEach(() => {
    // 800x600 viewport, 2000x1200 level
    camera = new Camera({
      viewportWidth: 800,
      viewportHeight: 600,
      levelWidth: 2000,
      levelHeight: 1200,
      deadzoneWidth: 80,
      deadzoneHeight: 60,
      lookAheadDistance: 40,
      smoothing: 8,
    });
  });

  it('initializes at (0, 0) and transforms coordinates accurately', () => {
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);

    const screenPos = camera.worldToScreen(100, 150);
    expect(screenPos).toEqual({ x: 100, y: 150 });

    const worldPos = camera.screenToWorld(100, 150);
    expect(worldPos).toEqual({ x: 100, y: 150 });
  });

  it('snapTo centers camera on target and clamps within bounds', () => {
    camera.snapTo(1000, 600);
    // Centered: 1000 - 400 = 600, 600 - 300 = 300
    expect(camera.x).toBe(600);
    expect(camera.y).toBe(300);

    // Coordinate transforms reflect camera offset
    expect(camera.worldToScreen(600, 300)).toEqual({ x: 0, y: 0 });
    expect(camera.screenToWorld(0, 0)).toEqual({ x: 600, y: 300 });

    // Snap to negative or out of bounds clamps correctly
    camera.snapTo(0, 0);
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);

    camera.snapTo(3000, 2000);
    expect(camera.x).toBe(2000 - 800); // 1200
    expect(camera.y).toBe(1200 - 600); // 600
  });

  it('stays static when player moves within deadzone region', () => {
    camera.snapTo(1000, 600);
    const startX = camera.x;
    const startY = camera.y;

    // Center target is (1000, 600). Deadzone is width 80 (±40), height 60 (±30).
    // Target moves within deadzone: x=1020 (+20), y=610 (+10) with facing 1
    // Update with dt
    camera.update(1020, 610, 1, 0.016);
    // Since deadzone moves with lookahead, let's test pure deadzone with lookAheadDistance = 0
    const staticCamera = new Camera({
      viewportWidth: 800,
      viewportHeight: 600,
      levelWidth: 2000,
      levelHeight: 1200,
      deadzoneWidth: 80,
      deadzoneHeight: 60,
      lookAheadDistance: 0,
      smoothing: 8,
    });
    staticCamera.snapTo(1000, 600);
    const initX = staticCamera.x;
    const initY = staticCamera.y;

    staticCamera.update(1020, 615, 1, 0.016);
    expect(staticCamera.x).toBe(initX);
    expect(staticCamera.y).toBe(initY);

    staticCamera.update(980, 585, -1, 0.016);
    expect(staticCamera.x).toBe(initX);
    expect(staticCamera.y).toBe(initY);
  });

  it('shifts goal position and lerps smoothly when exiting deadzone horizontally', () => {
    const staticCamera = new Camera({
      viewportWidth: 800,
      viewportHeight: 600,
      levelWidth: 2000,
      levelHeight: 1200,
      deadzoneWidth: 80,
      deadzoneHeight: 60,
      lookAheadDistance: 0,
      smoothing: 8,
    });
    staticCamera.snapTo(1000, 600);
    const initialX = staticCamera.x;

    // Move player far to right outside deadzone (targetX = 1200)
    staticCamera.update(1200, 600, 1, 0.1);
    expect(staticCamera.x).toBeGreaterThan(initialX);
    // Smooth lerp: does not snap all the way to target goal immediately
    expect(staticCamera.x).toBeLessThan(1200 - 400);
  });

  it('shifts deadzone forward in player facing direction with look-ahead', () => {
    camera.snapTo(1000, 600);
    // Player facing right (+1) over multiple frames
    for (let i = 0; i < 60; i++) {
      camera.update(1000, 600, 1, 0.016);
    }
    const rightLookAheadX = camera.x;

    // Player turns left (-1)
    for (let i = 0; i < 60; i++) {
      camera.update(1000, 600, -1, 0.016);
    }
    const leftLookAheadX = camera.x;

    // Looking left should place camera x further left than looking right
    expect(leftLookAheadX).toBeLessThan(rightLookAheadX);
  });

  it('clamps camera position to level boundaries', () => {
    camera.snapTo(100, 100);
    camera.update(10, 10, -1, 1.0);
    expect(camera.x).toBe(0);
    expect(camera.y).toBe(0);

    camera.snapTo(1950, 1150);
    camera.update(2000, 1200, 1, 1.0);
    expect(camera.x).toBe(2000 - 800);
    expect(camera.y).toBe(1200 - 600);
  });

  it('calculates getVisibleTileBounds with 1-tile safety margin and bounds clamping', () => {
    const tileSize = 32;
    // Camera at x=100, y=100, viewport 800x600, level 2000x1200
    camera.x = 100;
    camera.y = 100;

    const bounds = camera.getVisibleTileBounds(tileSize);
    // startCol: floor(100/32) - 1 = 3 - 1 = 2
    // endCol: ceil((100 + 800) / 32) + 1 = ceil(900/32) + 1 = 29 + 1 = 30
    // startRow: floor(100/32) - 1 = 2
    // endRow: ceil((100 + 600) / 32) + 1 = ceil(700/32) + 1 = 22 + 1 = 23
    expect(bounds.startCol).toBe(2);
    expect(bounds.endCol).toBe(30);
    expect(bounds.startRow).toBe(2);
    expect(bounds.endRow).toBe(23);

    // At edge x=0, y=0: startCol and startRow clamp to 0
    camera.x = 0;
    camera.y = 0;
    const edgeBounds = camera.getVisibleTileBounds(tileSize);
    expect(edgeBounds.startCol).toBe(0);
    expect(edgeBounds.startRow).toBe(0);
  });
});
