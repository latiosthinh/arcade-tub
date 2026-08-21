import { describe, it, expect, beforeEach } from 'vitest';
import { FoodItemManager } from '../src/FoodItem';

describe('FoodItemManager', () => {
  let manager: FoodItemManager;

  beforeEach(() => {
    manager = new FoodItemManager();
  });

  it('spawns and retrieves food items', () => {
    manager.addItem('food', 50, 100);
    manager.addItem('maxim_tomato', 150, 100);

    const items = manager.getItems();
    expect(items.length).toBe(2);
    expect(items[0].type).toBe('food');
    expect(items[1].type).toBe('maxim_tomato');
  });

  it('detects collision and marks collected', () => {
    manager.addItem('food', 50, 50);
    const hit = manager.checkCollision({ x: 45, y: 45, width: 20, height: 20 });
    expect(hit).not.toBeNull();
    expect(hit?.type).toBe('food');
    expect(manager.getItems().length).toBe(0);
  });
});
