export interface SplatterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number; // 1.0 down to 0
  decay: number;
  isGoo: boolean;
}

export interface WallStain {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  alpha: number;
}

export class CrushSplatterSystem {
  public particles: SplatterParticle[] = [];
  public stains: WallStain[] = [];
  private boundsWidth: number;
  private boundsHeight: number;
  private maxParticles: number = 250;
  private maxStains: number = 30;

  constructor(boundsWidth: number = 800, boundsHeight: number = 600) {
    this.boundsWidth = boundsWidth;
    this.boundsHeight = boundsHeight;
  }

  public setBounds(w: number, h: number): void {
    this.boundsWidth = w;
    this.boundsHeight = h;
  }

  public spawnSplatter(
    originX: number,
    originY: number,
    color: string,
    particleCount: number = 30,
    explosionForce: number = 10.0,
    isJuicy: boolean = true
  ): void {
    const toSpawn = Math.min(60, particleCount);

    for (let i = 0; i < toSpawn; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // FIFO eviction for T-44-04
      }

      // Strong lateral burst angle
      const angle = (Math.random() - 0.5) * Math.PI * 1.4 - Math.PI * 0.5; // Fan upwards and outwards
      const speed = (0.4 + Math.random() * 0.8) * explosionForce * 40;

      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: Math.sin(angle) * speed * 0.6,
        radius: isJuicy ? 3 + Math.random() * 6 : 2 + Math.random() * 4,
        color,
        alpha: 1.0,
        life: 1.0,
        decay: 0.4 + Math.random() * 0.6,
        isGoo: isJuicy
      });
    }
  }

  public update(dt: number): void {
    const safeDt = Math.max(0.001, Math.min(0.1, dt));
    const gravity = 450;
    const floorY = this.boundsHeight * 0.88;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decay * safeDt;
      p.alpha = Math.max(0, p.life);

      p.vy += gravity * safeDt;
      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;

      // Check wall impact
      if (p.x <= this.boundsWidth * 0.15 || p.x >= this.boundsWidth * 0.85) {
        this.addStain(p.x, p.y, p.radius * 2, p.radius * 1.2, p.color);
        p.life = 0;
      }

      // Floor impact
      if (p.y >= floorY) {
        p.y = floorY;
        p.vx *= 0.3; // high friction
        p.vy = 0;
        if (Math.random() < 0.2) {
          this.addStain(p.x, p.y, p.radius * 2.5, p.radius * 0.8, p.color);
        }
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public addStain(x: number, y: number, radiusX: number, radiusY: number, color: string): void {
    if (this.stains.length >= this.maxStains) {
      this.stains.shift(); // FIFO eviction
    }
    this.stains.push({
      x,
      y,
      radiusX,
      radiusY,
      color,
      alpha: 0.85
    });
  }

  public clear(): void {
    this.particles = [];
    this.stains = [];
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Render stains
    for (const stain of this.stains) {
      ctx.save();
      ctx.globalAlpha = stain.alpha;
      ctx.fillStyle = stain.color;
      ctx.beginPath();
      ctx.ellipse(stain.x, stain.y, stain.radiusX, stain.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
