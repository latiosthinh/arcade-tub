import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KirbyScene } from '../src/KirbyScene';
import { TileType } from '../src/types';

describe('KirbyScene', () => {
  let scene: KirbyScene;

  beforeEach(() => {
    scene = new KirbyScene();
    scene.init(800, 600);
  });

  it('initializes rooms, camera, and physics on init', () => {
    expect(scene.roomManager.hasRoom('stage-1-1')).toBe(true);
    expect(scene.roomManager.hasRoom('stage-1-cave')).toBe(true);
    expect(scene.roomManager.activeRoom?.id).toBe('stage-1-1');

    expect(scene.camera.viewportWidth).toBe(800);
    expect(scene.camera.viewportHeight).toBe(600);

    expect(scene.physics.x).toBeGreaterThan(0);
    expect(scene.physics.y).toBeGreaterThan(0);
  });

  it('updates physics, handles movement, and keeps camera tracking', () => {
    const initialX = scene.physics.x;
    
    // Simulate pressing right
    scene.setCustomInput({
      left: false,
      right: true,
      up: false,
      down: false,
      jump: false,
      jumpJustPressed: false,
      jumpJustReleased: false,
    });

    scene.update(0.016);
    expect(scene.physics.x).toBeGreaterThan(initialX);
    expect(scene.physics.facing).toBe(1);
  });

  it('triggers door transition when overlapping door and pressing up', () => {
    const activeRoom = scene.roomManager.activeRoom!;
    const door = activeRoom.doors[0];
    const tileSize = activeRoom.tileMap.tileSize;

    // Position player directly at door
    scene.physics.x = door.col * tileSize;
    scene.physics.y = door.row * tileSize;

    // Press UP
    scene.setCustomInput({
      left: false,
      right: false,
      up: true,
      down: false,
      jump: false,
      jumpJustPressed: false,
      jumpJustReleased: false,
    });

    scene.update(0.016);
    expect(scene.roomManager.isTransitioning()).toBe(true);
    expect(scene.roomManager.state).toBe('fade_out');

    // Run transition forward through switch
    scene.update(0.35);
    expect(scene.roomManager.activeRoom?.id).toBe('stage-1-cave');
  });

  it('renders canvas elements without crashing', () => {
    const mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    expect(() => scene.render(mockCtx)).not.toThrow();
    expect(mockCtx.fillRect).toHaveBeenCalled();
  });
});
