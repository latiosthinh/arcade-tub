export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  isDebris?: boolean;
  angle?: number;
  vRot?: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public maxParticles: number = 300; // T-03-03 mitigate: limit active particles

  public emitShatter(x: number, y: number, color: string, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const vx = (Math.random() - 0.5) * 240;
      const vy = -150 + Math.random() * 200;
      const size = 4 + Math.random() * 4;
      const life = 0.5 + Math.random() * 0.5;
      const angle = Math.random() * Math.PI * 2;
      const vRot = (Math.random() - 0.5) * 10;

      this.particles.push({
        x,
        y,
        vx,
        vy,
        color,
        size,
        life,
        maxLife: life,
        isDebris: true,
        angle,
        vRot,
      });
    }
  }

  public emitSparks(x: number, y: number, color: string, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = 180 + Math.random() * 80;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 2;
      const life = 0.25 + Math.random() * 0.15;

      this.particles.push({
        x,
        y,
        vx,
        vy,
        color,
        size,
        life,
        maxLife: life,
        isDebris: false,
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.isDebris) {
        p.vy += 300 * dt; // Gravity
        p.angle = (p.angle || 0) + (p.vRot || 0) * dt;
      }

      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.isDebris) {
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.angle) {
          ctx.rotate(p.angle);
        }
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  public clear(): void {
    this.particles = [];
  }
}
