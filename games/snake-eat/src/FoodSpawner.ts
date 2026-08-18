import { Snake } from './Snake.js';
import { GRID_COLS, GRID_ROWS } from './SnakeGrid.js';

export enum FoodType {
  REGULAR = 'REGULAR',
  GOLDEN = 'GOLDEN',
}

export interface FoodItem {
  x: number;
  y: number;
  type: FoodType;
  lifetime: number;
  maxLifetime: number;
  pulsePhase: number;
}

export interface EatResult {
  type: FoodType;
  points: number;
  grow: number;
}

export class FoodSpawner {
  cols: number;
  rows: number;
  regularFood: FoodItem | null = null;
  bonusFood: FoodItem | null = null;
  bonusSpawnTimer: number = 0;
  bonusLifetime: number = 7.0;
  bonusSpawnInterval: number = 18.0;

  constructor(cols: number = GRID_COLS, rows: number = GRID_ROWS) {
    this.cols = cols;
    this.rows = rows;
  }

  reset(): void {
    this.regularFood = null;
    this.bonusFood = null;
    this.bonusSpawnTimer = 0;
  }

  private getVacantCells(snake: Snake, cols: number = this.cols, rows: number = this.rows): Array<{ x: number; y: number }> {
    const vacant: Array<{ x: number; y: number }> = [];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (snake.occupies(x, y)) continue;
        if (this.regularFood && this.regularFood.x === x && this.regularFood.y === y) continue;
        if (this.bonusFood && this.bonusFood.x === x && this.bonusFood.y === y) continue;
        vacant.push({ x, y });
      }
    }
    return vacant;
  }

  spawnRegular(snake: Snake, cols: number = this.cols, rows: number = this.rows): FoodItem | null {
    const vacant = this.getVacantCells(snake, cols, rows);
    if (vacant.length === 0) {
      this.regularFood = null;
      return null;
    }
    const idx = Math.floor(Math.random() * vacant.length);
    const cell = vacant[idx];
    this.regularFood = {
      x: cell.x,
      y: cell.y,
      type: FoodType.REGULAR,
      lifetime: Infinity,
      maxLifetime: Infinity,
      pulsePhase: 0,
    };
    return this.regularFood;
  }

  spawnBonus(snake: Snake, cols: number = this.cols, rows: number = this.rows): FoodItem | null {
    const vacant = this.getVacantCells(snake, cols, rows);
    if (vacant.length === 0) {
      this.bonusFood = null;
      return null;
    }
    const idx = Math.floor(Math.random() * vacant.length);
    const cell = vacant[idx];
    this.bonusFood = {
      x: cell.x,
      y: cell.y,
      type: FoodType.GOLDEN,
      lifetime: this.bonusLifetime,
      maxLifetime: this.bonusLifetime,
      pulsePhase: 0,
    };
    return this.bonusFood;
  }

  update(dt: number, snake: Snake): { bonusExpired: boolean; bonusSpawned: boolean } {
    let bonusExpired = false;
    let bonusSpawned = false;

    if (this.regularFood) {
      this.regularFood.pulsePhase = (this.regularFood.pulsePhase + dt * 4) % (Math.PI * 2);
    }

    if (this.bonusFood) {
      this.bonusFood.pulsePhase = (this.bonusFood.pulsePhase + dt * 6) % (Math.PI * 2);
      this.bonusFood.lifetime -= dt;
      if (this.bonusFood.lifetime <= 0) {
        this.bonusFood = null;
        bonusExpired = true;
      }
    } else {
      this.bonusSpawnTimer += dt;
      if (this.bonusSpawnTimer >= this.bonusSpawnInterval) {
        this.bonusSpawnTimer = 0;
        if (this.spawnBonus(snake)) {
          bonusSpawned = true;
        }
      }
    }

    return { bonusExpired, bonusSpawned };
  }

  checkEat(headX: number, headY: number): EatResult | null {
    if (this.bonusFood && this.bonusFood.x === headX && this.bonusFood.y === headY) {
      this.bonusFood = null;
      return {
        type: FoodType.GOLDEN,
        points: 50,
        grow: 2,
      };
    }

    if (this.regularFood && this.regularFood.x === headX && this.regularFood.y === headY) {
      this.regularFood = null;
      return {
        type: FoodType.REGULAR,
        points: 10,
        grow: 1,
      };
    }

    return null;
  }
}
