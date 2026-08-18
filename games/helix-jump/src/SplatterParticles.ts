export interface SplatterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  isStuck?: boolean;
}

export class SplatterParticleSystem {
  public particles: SplatterParticle[] = [];

  constructor() {}

  public emitInkBurst(
    x: number,
    y: number,
    color: string = '#E74C3C',
    count: number = 24,
    speedMultiplier: number = 1
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (60 + Math.random() * 220) * speedMultiplier;
      const radius = 2 + Math.random() * 6;
      const maxLife = 0.4 + Math.random() * 0.5;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        radius,
        color,
        alpha: 1,
        life: 0,
        maxLife
      });
    }
  }

  public emitTierDebris(x: number, y: number, color: string, count: number = 18): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 0.2) + Math.random() * Math.PI * 0.6; // downward & outward
      const dir = Math.random() > 0.5 ? 1 : -1;
      const speed = 120 + Math.random() * 280;
      const maxLife = 0.6 + Math.random() * 0.6;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 20,
        vx: dir * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 100,
        radius: 4 + Math.random() * 8,
        color,
        alpha: 1,
        life: 0,
        maxLife
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 450 * dt; // gravity
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraY: number, screenCenterX: number, screenCenterY: number): void {
    ctx.save();
    for (const p of this.particles) {
      const screenX = screenCenterX + (p.x - screenCenterX);
      const screenY = screenCenterY + (p.y - cameraY);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Cardboard/ink outline
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#2B2118';
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  public reset(): void {
    this.particles = [];
  }
}
