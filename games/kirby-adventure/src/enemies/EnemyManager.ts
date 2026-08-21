import { EnemyBase } from './EnemyBase';
import { WaddleDee } from './WaddleDee';
import { WaddleDoo } from './WaddleDoo';
import { BladeKnight } from './BladeKnight';
import { HotHead } from './HotHead';
import { Chilly } from './Chilly';
import { Sparky } from './Sparky';
import { SirKibble } from './SirKibble';
import { Rocky } from './Rocky';
import { EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class EnemyManager {
  private enemies: EnemyBase[] = [];
  private nextId = 1;

  spawn(type: EnemyType, x: number, y: number): EnemyBase {
    const id = `enemy_${this.nextId++}`;
    let enemy: EnemyBase;

    switch (type) {
      case 'waddle_dee':
        enemy = new WaddleDee(id, x, y);
        break;
      case 'waddle_doo':
        enemy = new WaddleDoo(id, x, y);
        break;
      case 'blade_knight':
        enemy = new BladeKnight(id, x, y);
        break;
      case 'hot_head':
        enemy = new HotHead(id, x, y);
        break;
      case 'chilly':
        enemy = new Chilly(id, x, y);
        break;
      case 'sparky':
        enemy = new Sparky(id, x, y);
        break;
      case 'sir_kibble':
        enemy = new SirKibble(id, x, y);
        break;
      case 'rocky':
        enemy = new Rocky(id, x, y);
        break;
    }

    this.enemies.push(enemy);
    return enemy;
  }

  getEnemies(): EnemyBase[] {
    return this.enemies.filter((e) => !e.isDead);
  }

  update(dt: number, tileMap: TileMap, playerBounds: Rect) {
    const attacks = [];
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const attack = enemy.update(dt, tileMap, playerBounds);
      if (attack) {
        attacks.push(attack);
      }
    }
    this.enemies = this.enemies.filter((e) => !e.isDead);
    return attacks;
  }

  checkCollision(bounds: Rect): EnemyBase | null {
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const overlap =
        bounds.x < enemy.x + enemy.width &&
        bounds.x + bounds.width > enemy.x &&
        bounds.y < enemy.y + enemy.height &&
        bounds.y + bounds.height > enemy.y;

      if (overlap) return enemy;
    }
    return null;
  }

  clear(): void {
    this.enemies = [];
  }
}
