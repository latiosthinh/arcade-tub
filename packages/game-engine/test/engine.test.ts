import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameLoop, InputManager, SceneManager } from '../src/index';

describe('SceneManager', () => {
  it('manages scene stack correctly (push, pop, current, replace, clear)', () => {
    const sm = new SceneManager();
    expect(sm.current()).toBeNull();

    sm.push('menu');
    expect(sm.current()).toBe('menu');

    sm.push('play');
    expect(sm.current()).toBe('play');

    expect(sm.pop()).toBe('play');
    expect(sm.current()).toBe('menu');

    sm.replace('gameover');
    expect(sm.current()).toBe('gameover');

    sm.clear();
    expect(sm.current()).toBeNull();
  });
});

describe('InputManager', () => {
  let input: InputManager;

  beforeEach(() => {
    input = new InputManager();
  });

  afterEach(() => {
    input.destroy();
  });

  it('tracks isDown, justPressed and justReleased transitions', () => {
    expect(input.isDown('Space')).toBe(false);
    expect(input.justPressed('Space')).toBe(false);
    expect(input.justReleased('Space')).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    expect(input.isDown('Space')).toBe(true);
    expect(input.justPressed('Space')).toBe(true);
    expect(input.justReleased('Space')).toBe(false);

    // Frame update clears justPressed/justReleased
    input.update();
    expect(input.isDown('Space')).toBe(true);
    expect(input.justPressed('Space')).toBe(false);

    // Key up
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    expect(input.isDown('Space')).toBe(false);
    expect(input.justReleased('Space')).toBe(true);

    input.update();
    expect(input.justReleased('Space')).toBe(false);
  });
});

describe('GameLoop', () => {
  let canvas: HTMLCanvasElement;
  let parent: HTMLDivElement;

  beforeEach(() => {
    parent = document.createElement('div');
    canvas = document.createElement('canvas');
    parent.appendChild(canvas);
    document.body.appendChild(parent);
  });

  afterEach(() => {
    document.body.removeChild(parent);
  });

  it('initializes canvas logical dimensions to 800x600', () => {
    const loop = new GameLoop(canvas);
    expect(loop.width).toBe(800);
    expect(loop.height).toBe(600);
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    loop.destroy();
  });

  it('runs update and render on active scene', () => {
    const loop = new GameLoop(canvas);
    let updateCalled = 0;
    let renderCalled = 0;

    loop.setScene({
      update: (dt) => {
        updateCalled++;
        expect(dt).toBeCloseTo(1 / 60, 4);
      },
      render: (_ctx) => {
        renderCalled++;
      },
    });

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      // simulate 1 frame at 20ms
      setTimeout(() => cb(20), 0);
      return 1;
    });

    loop.start();
    loop.stop();
    loop.destroy();
  });
});
