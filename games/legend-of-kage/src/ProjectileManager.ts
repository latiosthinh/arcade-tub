import { Direction, Point, Rect } from './types';

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  owner: 'player' | 'enemy';
  type: 'shuriken' | 'fireball' | 'magic_orb';
  isDeflected?: boolean;
  isDead: boolean;
  lifeTimer: number;
  maxLife: number;
}

export class ProjectileManager {
  private projectiles: Projectile[] = [];
  private nextId = 1;

  spawnShuriken(x: number, y: number, dirX: number, dirY: number, owner: 'player' | 'enemy' = 'player'): Projectile {
    // Normalize direction vector
    const mag = Math.hypot(dirX, dirY) || 1;
    const speed = owner === 'player' ? 480 : 280;

    const p: Projectile = {
      id: `proj_${this.nextId++}`,
      x,
      y,
      vx: (dirX / mag) * speed,
      vy: (dirY / mag) * speed,
      width: 10,
      height: 10,
      owner,
      type: 'shuriken',
      isDead: false,
      lifeTimer: 0,
      maxLife: 2.0,
    };
    this.projectiles.push(p);
    return p;
  }

  spawnFireball(x: number, y: number, facing: Direction): Projectile {
    const p: Projectile = {
      id: `proj_${this.nextId++}`,
      x,
      y,
      vx: facing * 240,
      vy: 0,
      width: 14,
      height: 14,
      owner: 'enemy',
      type: 'fireball',
      isDead: false,
      lifeTimer: 0,
      maxLife: 3.0,
    };
    this.projectiles.push(p);
    return p;
  }

  getProjectiles(): Projectile[] {
    return this.projectiles.filter((p) => !p.isDead);
  }

  update(dt: number, stageBounds: Rect): void {
    for (const p of this.projectiles) {
      if (p.isDead) continue;
      p.lifeTimer += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (
        p.lifeTimer >= p.maxLife ||
        p.x < stageBounds.x - 40 ||
        p.x > stageBounds.x + stageBounds.width + 40 ||
        p.y < stageBounds.y - 40 ||
        p.y > stageBounds.y + stageBounds.height + 40
      ) {
        p.isDead = true;
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.isDead);
  }

  checkSwordDeflection(swordHitbox: Rect): { deflectedCount: number; deflectedPoints: Point[] } {
    let deflectedCount = 0;
    const deflectedPoints: Point[] = [];

    for (const p of this.projectiles) {
      if (p.isDead || p.owner === 'player') continue;

      const overlap =
        swordHitbox.x < p.x + p.width &&
        swordHitbox.x + swordHitbox.width > p.x &&
        swordHitbox.y < p.y + p.height &&
        swordHitbox.y + swordHitbox.height > p.y;

      if (overlap) {
        p.owner = 'player';
        p.vx = -p.vx * 1.2;
        p.vy = -p.vy * 1.2;
        p.isDeflected = true;
        deflectedCount += 1;
        deflectedPoints.push({ x: p.x + p.width / 2, y: p.y + p.height / 2 });
      }
    }

    return { deflectedCount, deflectedPoints };
  }

  clear(): void {
    this.projectiles = [];
  }
}
