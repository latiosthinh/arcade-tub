export type SlopeItemType = 'pine-tree' | 'snowman' | 'snowball' | 'gift' | 'rock';

export interface SlopeItem {
  id: number;
  type: SlopeItemType;
  x: number; // Lateral position (-0.8 to 0.8)
  z: number; // Distance ahead of player (0 to 1000)
  size: number;
  collected?: boolean;
}

export interface SlopeGeneratorOptions {
  maxZ?: number;
  minSpacing?: number;
}

export class SlopeGenerator {
  public items: SlopeItem[] = [];
  public maxZ: number;
  public minSpacing: number;
  private nextId: number = 1;
  private lastSpawnZ: number = 200;

  constructor(options: SlopeGeneratorOptions = {}) {
    this.maxZ = options.maxZ ?? 1000;
    this.minSpacing = options.minSpacing ?? 70;
    this.reset();
  }

  public reset(): void {
    this.items = [];
    this.nextId = 1;
    this.lastSpawnZ = 200;
    // Pre-populate slope ahead
    while (this.lastSpawnZ < this.maxZ) {
      this.spawnItem(this.lastSpawnZ);
      this.lastSpawnZ += this.minSpacing + Math.random() * 60;
    }
  }

  public spawnItem(z: number): SlopeItem {
    const types: SlopeItemType[] = ['pine-tree', 'pine-tree', 'snowman', 'rock', 'gift'];
    // Randomize item type
    const roll = Math.random();
    let type: SlopeItemType = 'pine-tree';
    if (roll < 0.35) {
      type = 'pine-tree';
    } else if (roll < 0.55) {
      type = 'snowman';
    } else if (roll < 0.75) {
      type = 'rock';
    } else {
      type = 'gift';
    }

    const item: SlopeItem = {
      id: this.nextId++,
      type,
      x: (Math.random() - 0.5) * 1.6, // Range -0.8 to 0.8
      z,
      size: type === 'pine-tree' ? 1.2 : type === 'gift' ? 0.9 : 1.0,
      collected: false,
    };

    this.items.push(item);
    return item;
  }

  public update(dt: number, speed: number): void {
    const deltaZ = speed * dt;

    // Move all items closer to player (z decreases)
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.z -= deltaZ;

      // Rolling snowball animation / motion
      if (item.type === 'snowball') {
        item.x += Math.sin(item.z * 0.05) * 0.01;
      }

      // Remove items that passed behind player
      if (item.z < -10) {
        this.items.splice(i, 1);
      }
    }

    // Maintain item stream up to maxZ
    let highestZ = this.items.length > 0 ? Math.max(...this.items.map(i => i.z)) : 0;
    while (highestZ < this.maxZ) {
      const nextZ = Math.max(highestZ + this.minSpacing, 100);
      this.spawnItem(nextZ);
      highestZ = nextZ + (this.minSpacing + Math.random() * 40);
    }
  }
}
