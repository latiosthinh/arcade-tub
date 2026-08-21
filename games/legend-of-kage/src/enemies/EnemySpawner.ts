import { EnemyBase } from './EnemyBase';
import { RedNinja } from './RedNinja';
import { BlueNinja } from './BlueNinja';
import { WhiteNinja } from './WhiteNinja';
import { FireMonk } from './FireMonk';
import { SorcererBoss } from './SorcererBoss';
import { ProjectileManager } from '../ProjectileManager';
import { TreeCanopy } from '../TreeCanopy';
import { Rect } from '../types';

export class EnemySpawner {
  private enemies: EnemyBase[] = [];
  private nextId = 1;
  private spawnCooldown = 1.5;
  private maxActiveEnemies = 6;
  killCount = 0;

  spawn(type: 'red_ninja' | 'blue_ninja' | 'white_ninja' | 'fire_monk' | 'sorcerer_boss', x: number, y: number): EnemyBase {
    const id = `en_${this.nextId++}`;
    let enemy: EnemyBase;

    switch (type) {
      case 'red_ninja':
        enemy = new RedNinja(id, x, y);
        break;
      case 'blue_ninja':
        enemy = new BlueNinja(id, x, y);
        break;
      case 'white_ninja':
        enemy = new WhiteNinja(id, x, y);
        break;
      case 'fire_monk':
        enemy = new FireMonk(id, x, y);
        break;
      case 'sorcerer_boss':
        enemy = new SorcererBoss(id, x, y);
        break;
    }

    this.enemies.push(enemy);
    return enemy;
  }

  getEnemies(): EnemyBase[] {
    return this.enemies.filter((e) => !e.isDead);
  }

  update(
    dt: number,
    playerX: number,
    playerY: number,
    canopy: TreeCanopy,
    projectiles: ProjectileManager,
    stageWidth = 1200,
    stageFloorY = 560
  ): void {
    this.spawnCooldown -= dt;

    if (this.spawnCooldown <= 0 && this.getEnemies().length < this.maxActiveEnemies) {
      // Spawn random ninja from offscreen edge
      const spawnX = Math.random() < 0.5 ? Math.max(20, playerX - 350) : Math.min(stageWidth - 40, playerX + 350);
      const spawnY = Math.random() < 0.6 ? 100 : stageFloorY - 24;

      const types: Array<'red_ninja' | 'blue_ninja' | 'white_ninja' | 'fire_monk'> = [
        'red_ninja',
        'red_ninja',
        'blue_ninja',
        'fire_monk',
      ];
      const selected = types[Math.floor(Math.random() * types.length)];
      this.spawn(selected, spawnX, spawnY);
      this.spawnCooldown = 2.0;
    }

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      enemy.update(dt, playerX, playerY, canopy, projectiles, stageFloorY);
    }

    this.enemies = this.enemies.filter((e) => !e.isDead);
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
