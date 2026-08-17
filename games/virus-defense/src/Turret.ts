export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  distanceTraveled: number;
  maxDistance: number;
  active: boolean;
}

export class Turret {
  public x: number;
  public y: number;
  public angle: number;
  public cooldown: number;
  public fireRate: number;
  public projectileSpeed: number;
  public barrelLength: number;
  public projectiles: Projectile[];
  private nextProjectileId: number;

  constructor(x = 400, y = 300) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.cooldown = 0;
    this.fireRate = 0.15; // seconds between shots
    this.projectileSpeed = 600; // px/sec
    this.barrelLength = 32;
    this.projectiles = [];
    this.nextProjectileId = 1;
  }

  public aimAt(targetX: number, targetY: number): void {
    this.angle = Math.atan2(targetY - this.y, targetX - this.x);
  }

  public fire(): Projectile | null {
    if (this.cooldown > 0) {
      return null;
    }

    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    const startX = this.x + cos * this.barrelLength;
    const startY = this.y + sin * this.barrelLength;

    const projectile: Projectile = {
      id: this.nextProjectileId++,
      x: startX,
      y: startY,
      vx: cos * this.projectileSpeed,
      vy: sin * this.projectileSpeed,
      radius: 4,
      damage: 1,
      distanceTraveled: 0,
      maxDistance: 600,
      active: true,
    };

    this.projectiles.push(projectile);
    this.cooldown = this.fireRate;
    return projectile;
  }

  public update(dt: number): void {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
    }

    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      if (!p.active) continue;

      const stepDist = this.projectileSpeed * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.distanceTraveled += stepDist;

      if (
        p.distanceTraveled >= p.maxDistance ||
        p.x < -50 ||
        p.x > 850 ||
        p.y < -50 ||
        p.y > 650
      ) {
        p.active = false;
      }
    }

    // Filter out inactive
    this.projectiles = this.projectiles.filter((p) => p.active);
  }

  public reset(): void {
    this.angle = 0;
    this.cooldown = 0;
    this.projectiles = [];
  }
}
