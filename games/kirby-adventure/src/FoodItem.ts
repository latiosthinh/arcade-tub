import { Rect } from './types';

export interface FoodEntity {
  id: string;
  type: 'food' | 'maxim_tomato';
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export class FoodItemManager {
  private items: FoodEntity[] = [];
  private nextId = 1;

  addItem(type: 'food' | 'maxim_tomato', x: number, y: number): FoodEntity {
    const item: FoodEntity = {
      id: `food_${this.nextId++}`,
      type,
      x,
      y,
      width: 14,
      height: 14,
      collected: false,
    };
    this.items.push(item);
    return item;
  }

  getItems(): FoodEntity[] {
    return this.items.filter((item) => !item.collected);
  }

  checkCollision(bounds: Rect): FoodEntity | null {
    for (const item of this.items) {
      if (item.collected) continue;

      const overlap =
        bounds.x < item.x + item.width &&
        bounds.x + bounds.width > item.x &&
        bounds.y < item.y + item.height &&
        bounds.y + bounds.height > item.y;

      if (overlap) {
        item.collected = true;
        return item;
      }
    }
    return null;
  }

  clear(): void {
    this.items = [];
  }
}
