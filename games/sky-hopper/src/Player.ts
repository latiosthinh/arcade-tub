export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alive: boolean;
}

export class Player {
  x: number = 384;
  y: number = 500;
  vx: number = 0;
  vy: number = 0;
  width: number = 32;
  height: number = 32;
  gravity: number = 1000;
  jumpVelocity: number = -650;
  superJumpVelocity: number = -1100;
  moveSpeed: number = 1400;
  maxVx: number = 400;
  facing: 'left' | 'right' = 'right';
  isRocketing: boolean = false;
  rocketTimer: number = 0;
  rocketSpeed: number = -1200;
  projectiles: Projectile[] = [];
  shootCooldown: number = 0;

  private nextProjId: number = 0;

  reset(startX: number = 384, startY: number = 500): void {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 'right';
    this.isRocketing = false;
    this.rocketTimer = 0;
    this.projectiles = [];
    this.shootCooldown = 0;
  }

  moveLeft(dt: number): void {
    this.vx = Math.max(-this.maxVx, this.vx - this.moveSpeed * dt);
    this.facing = 'left';
  }

  moveRight(dt: number): void {
    this.vx = Math.min(this.maxVx, this.vx + this.moveSpeed * dt);
    this.facing = 'right';
  }

  applyFriction(dt: number): void {
    this.vx *= Math.pow(0.02, dt);
    if (Math.abs(this.vx) < 5) {
      this.vx = 0;
    }
  }

  bounce(superBounce: boolean = false): void {
    this.vy = superBounce ? this.superJumpVelocity : this.jumpVelocity;
  }

  activateRocket(duration: number = 3.0): void {
    this.isRocketing = true;
    this.rocketTimer = duration;
    this.vy = this.rocketSpeed;
  }

  shoot(): boolean {
    if (this.shootCooldown > 0) {
      return false;
    }
    this.projectiles.push({
      id: `p_${++this.nextProjId}`,
      x: this.x + this.width / 2,
      y: this.y,
      vx: 0,
      vy: -900,
      radius: 4,
      alive: true,
    });
    this.shootCooldown = 0.25;
    return true;
  }

  update(dt: number, screenWidth: number = 800): void {
    if (this.shootCooldown > 0) {
      this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    }

    if (this.isRocketing) {
      this.rocketTimer -= dt;
      this.vy = this.rocketSpeed;
      if (this.rocketTimer <= 0) {
        this.isRocketing = false;
        this.vy = this.jumpVelocity;
      }
    } else {
      this.vy += this.gravity * dt;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Screen wrap
    if (this.x + this.width < 0) {
      this.x = screenWidth;
    } else if (this.x > screenWidth) {
      this.x = -this.width;
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p || !p.alive) {
        this.projectiles.splice(i, 1);
        continue;
      }
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      // Filter out offscreen projectiles (relative to player or absolute)
      if (p.y < this.y - 1200) {
        p.alive = false;
        this.projectiles.splice(i, 1);
      }
    }
  }
}
