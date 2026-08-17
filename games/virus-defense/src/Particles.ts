export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  public particles: Particle[];
  public maxParticles: number;

  constructor(maxParticles = 250) {
    this.particles = [];
    this.maxParticles = maxParticles;
  }

  public burst(x: number, y: number, color: string, count = 16): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      const maxLife = 0.4 + Math.random() * 0.5;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3.5,
        color,
        alpha: 1.0,
        life: 1.0,
        maxLife,
      });
    }
  }

  public spark(x: number, y: number, color = '#22d3ee', count = 8): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 120;
      const maxLife = 0.2 + Math.random() * 0.25;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2,
        color,
        alpha: 1.0,
        life: 1.0,
        maxLife,
      });
    }
  }

  public healSparkles(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    count = 12
  ): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const angle = Math.atan2(targetY - startY, targetX - startX) + (Math.random() - 0.5) * 1.2;
      const speed = 60 + Math.random() * 80;
      const maxLife = 0.5 + Math.random() * 0.4;

      this.particles.push({
        x: startX + (Math.random() - 0.5) * 15,
        y: startY + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        color: '#38bdf8',
        alpha: 1.0,
        life: 1.0,
        maxLife,
      });
    }
  }

  public update(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt / p.maxLife;
      p.alpha = Math.max(0, p.life);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
    }

    this.particles = this.particles.filter((p) => p.life > 0);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  public clear(): void {
    this.particles = [];
  }
}
