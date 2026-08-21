import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KageScene } from '../src/KageScene';

describe('KageScene (Phase 68)', () => {
  let scene: KageScene;

  beforeEach(() => {
    scene = new KageScene();
    scene.init(800, 600);
  });

  it('updates scene, executes super-jumps, and slashes sword', () => {
    scene.physics.grounded = true;
    scene.setCustomInput({
      left: false,
      right: true,
      up: false,
      down: false,
      jump: true,
      jumpJustPressed: true,
      shuriken: false,
      shurikenJustPressed: false,
      sword: true,
      swordJustPressed: true,
    });

    scene.update(0.016);
    expect(scene.physics.vy).toBeLessThan(0); // Leaping
    expect(scene.combat.isSlashing).toBe(true);
  });

  it('renders canvas elements without crashing', () => {
    const mockGradient = {
      addColorStop: vi.fn(),
    };

    const mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      globalAlpha: 1,
      createLinearGradient: vi.fn(() => mockGradient),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
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
  });
});
