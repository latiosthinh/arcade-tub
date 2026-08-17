export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public rings: ShockwaveRing[] = [];
  public readonly maxParticles: number = 200;
  public readonly maxRings: number = 20;

  public emit(
    x: number,
    y: number,
    count: number,
    color: string,
    speed = 160,
    size = 3,
    maxLife = 0.5
  ): void {
    const safeCount = Math.max(0, Math.floor(count));
    for (let i = 0; i < safeCount; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.4 + Math.random() * 0.6);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size,
        life: maxLife,
        maxLife,
      });
    }
  }

  public emitRing(
    x: number,
    y: number,
    maxRadius = 50,
    color = '#00f0ff',
    maxLife = 0.4
  ): void {
    if (this.rings.length >= this.maxRings) {
      this.rings.shift();
    }
    this.rings.push({
      x,
      y,
      radius: 0,
      maxRadius,
      color,
      life: maxLife,
      maxLife,
    });
  }

  public update(dt: number): void {
    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;

    for (const p of this.particles) {
      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.life -= safeDt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const r of this.rings) {
      r.life -= safeDt;
      const progress = Math.max(0, Math.min(1, 1 - r.life / r.maxLife));
      r.radius = r.maxRadius * progress;
    }
    this.rings = this.rings.filter((r) => r.life > 0);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0 && this.rings.length === 0) return;

    ctx.save();

    // Render rings
    for (const r of this.rings) {
      const alpha = Math.max(0, Math.min(1, r.life / r.maxLife));
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2 + alpha * 2;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Render burst particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  public clear(): void {
    this.particles = [];
    this.rings = [];
  }
}
