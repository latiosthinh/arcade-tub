import { Rect, Direction } from './types';
import { TileMap } from './TileMap';

export interface Projectile {
  id: string;
  type: 'star' | 'air_bullet' | 'cutter' | 'fireball' | 'beam_arc' | 'spark_field' | 'needle_burst';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: Direction;
  damage: number;
  bouncesRemaining: number;
  lifeTimer: number;
  maxLife: number;
  isDead: boolean;
  piercing?: boolean;
}

export class ProjectileManager {
  private projectiles: Projectile[] = [];
  private nextId = 1;

  spawnStar(x: number, y: number, facing: Direction): Projectile {
    const star: Projectile = {
      id: `proj_${this.nextId++}`,
      type: 'star',
      x,
      y,
      vx: facing * 240,
      vy: -60,
      width: 14,
      height: 14,
      facing,
      damage: 3,
      bouncesRemaining: 3,
      lifeTimer: 0,
      maxLife: 4.0,
      isDead: false,
    };
    this.projectiles.push(star);
    return star;
  }

  spawnAirBullet(x: number, y: number, facing: Direction): Projectile {
    const bullet: Projectile = {
      id: `proj_${this.nextId++}`,
      type: 'air_bullet',
      x,
      y,
      vx: facing * 180,
      vy: 0,
      width: 10,
      height: 10,
      facing,
      damage: 1,
      bouncesRemaining: 0,
      lifeTimer: 0,
      maxLife: 0.35,
      isDead: false,
    };
    this.projectiles.push(bullet);
    return bullet;
  }

  spawnCutter(x: number, y: number, facing: Direction): Projectile {
    const cutter: Projectile = {
      id: `proj_${this.nextId++}`,
      type: 'cutter',
      x,
      y,
      vx: facing * 200,
      vy: 0,
      width: 12,
      height: 12,
      facing,
      damage: 2,
      bouncesRemaining: 0,
      lifeTimer: 0,
      maxLife: 1.2,
      isDead: false,
      piercing: true,
    };
    this.projectiles.push(cutter);
    return cutter;
  }

  getProjectiles(): Projectile[] {
    return this.projectiles.filter((p) => !p.isDead);
  }

  update(dt: number, tileMap: TileMap): void {
    for (const p of this.projectiles) {
      if (p.isDead) continue;

      p.lifeTimer += dt;
      if (p.lifeTimer >= p.maxLife) {
        p.isDead = true;
        continue;
      }

      if (p.type === 'cutter') {
        // Cutter slows down and reverses direction
        const halfLife = p.maxLife / 2;
        if (p.lifeTimer > halfLife) {
          p.vx = -p.facing * 200;
        }
      }

      if (p.type === 'star') {
        // Apply gravity to star
        p.vy += 400 * dt;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Check tile collision for star bounce
      if (p.type === 'star') {
        const hits = tileMap.queryRect({
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
        });

        for (const hit of hits) {
          if (tileMap.isSolid(hit.col, hit.row)) {
            if (p.bouncesRemaining > 0) {
              p.vy = -Math.abs(p.vy) * 0.8;
              p.vx = -p.vx * 0.8;
              p.bouncesRemaining -= 1;
            } else {
              p.isDead = true;
            }
            break;
          }
        }
      }
    }

    this.projectiles = this.projectiles.filter((p) => !p.isDead);
  }

  clear(): void {
    this.projectiles = [];
  }
}
