export interface Snowball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  alive: boolean;
}

export interface SnowballSplash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
}

export class SnowballPhysics {
  public snowballs: Snowball[] = [];
  public splashes: SnowballSplash[] = [];
  public width: number;
  public height: number;
  public gravity: number = 650; // px/s^2

  private nextId: number = 1;
  private maxSplashes: number = 200;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
  }

  public launchFromSlingshot(
    anchorX: number,
    anchorY: number,
    dragX: number,
    dragY: number,
    powerMultiplier: number = 8.5
  ): Snowball {
    const pullX = anchorX - dragX;
    const pullY = anchorY - dragY;
    const vx = pullX * powerMultiplier;
    const vy = pullY * powerMultiplier;

    return this.launchDirect(anchorX, anchorY, vx, vy);
  }

  public launchDirect(x: number, y: number, vx: number, vy: number): Snowball {
    return this.launchCustomBall(x, y, vx, vy, 18);
  }

  public launchCustomBall(x: number, y: number, vx: number, vy: number, radius: number): Snowball {
    const ball: Snowball = {
      id: this.nextId++,
      x,
      y,
      vx,
      vy,
      radius,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 8,
      alive: true
    };

    this.snowballs.push(ball);
    return ball;
  }

  public predictTrajectory(
    startX: number,
    startY: number,
    vx: number,
    vy: number,
    steps: number = 16,
    dt: number = 0.05
  ): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = [];
    let curX = startX;
    let curY = startY;
    let curVy = vy;

    for (let i = 0; i < steps; i++) {
      points.push({ x: curX, y: curY });
      curX += vx * dt;
      curVy += this.gravity * dt;
      curY += curVy * dt;
    }

    return points;
  }

  public spawnSplash(x: number, y: number, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      if (this.splashes.length >= this.maxSplashes) {
        this.splashes.shift();
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      this.splashes.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        radius: 2 + Math.random() * 4,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6
      });
    }
  }

  public update(dt: number): void {
    // Update snowballs
    for (let i = this.snowballs.length - 1; i >= 0; i--) {
      const b = this.snowballs[i];
      if (!b.alive) {
        this.snowballs.splice(i, 1);
        continue;
      }

      b.vy += this.gravity * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rotation += b.vRot * dt;

      // Cull if out of screen bounds
      if (b.x < -100 || b.x > this.width + 100 || b.y > this.height + 100) {
        this.snowballs.splice(i, 1);
      }
    }

    // Update splashes
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.vy += this.gravity * 0.5 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) {
        this.splashes.splice(i, 1);
      }
    }
  }

  public reset(): void {
    this.snowballs = [];
    this.splashes = [];
  }
}
