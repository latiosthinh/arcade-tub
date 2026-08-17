import { describe, it, expect, beforeEach } from 'vitest';
import { FloatingScoreManager } from '../src/FloatingScore';

describe('FloatingScoreManager', () => {
  let manager: FloatingScoreManager;

  beforeEach(() => {
    manager = new FloatingScoreManager(20);
  });

  it('spawns floating score label with initial position and color', () => {
    manager.spawn(100, 200, '+150 x1.5!', '#00f0ff');
    expect(manager.getCount()).toBe(1);
    const items = manager.getItems();
    expect(items[0].text).toBe('+150 x1.5!');
    expect(items[0].x).toBe(100);
    expect(items[0].y).toBe(200);
    expect(items[0].alpha).toBe(1.0);
  });

  it('updates position upwards and fades alpha', () => {
    manager.spawn(100, 200, '+300', '#f59e0b');
    manager.update(0.4); // halfway through 0.8s duration
    const item = manager.getItems()[0];
    expect(item.y).toBeLessThan(200); // drifted upwards
    expect(item.alpha).toBeLessThan(1.0);
    expect(item.alpha).toBeGreaterThan(0);
  });

  it('purges items when lifetime expires', () => {
    manager.spawn(100, 200, '+100', '#ec4899');
    expect(manager.getCount()).toBe(1);
    manager.update(1.0); // beyond duration
    expect(manager.getCount()).toBe(0);
  });

  it('respects maximum item cap', () => {
    const smallMgr = new FloatingScoreManager(5);
    for (let i = 0; i < 10; i++) {
      smallMgr.spawn(i * 10, 100, `+${i}`, '#ffffff');
    }
    expect(smallMgr.getCount()).toBeLessThanOrEqual(5);
  });
});
