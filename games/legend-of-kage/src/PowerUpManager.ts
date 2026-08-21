import { Point, Rect } from './types';

export interface PowerUpItem {
  id: string;
  type: 'crystal_ball' | 'scroll';
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export class PowerUpManager {
  private items: PowerUpItem[] = [];
  private nextId = 1;

  spawnItem(type: 'crystal_ball' | 'scroll', x: number, y: number): PowerUpItem {
    const item: PowerUpItem = {
      id: `pw_${this.nextId++}`,
      type,
      x,
      y,
      width: 16,
      height: 16,
      collected: false,
    };
    this.items.push(item);
    return item;
  }

  getItems(): PowerUpItem[] {
    return this.items.filter((i) => !i.collected);
  }

  checkPickup(playerBounds: Rect): PowerUpItem | null {
    for (const item of this.items) {
      if (item.collected) continue;

      const overlap =
        playerBounds.x < item.x + item.width &&
        playerBounds.x + playerBounds.width > item.x &&
        playerBounds.y < item.y + item.height &&
        playerBounds.y + playerBounds.height > item.y;

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
