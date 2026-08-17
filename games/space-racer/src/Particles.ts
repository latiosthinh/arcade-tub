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
  shape: 'circle' | 'line' | 'spark';
  length?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number;

  constructor(maxParticles: number = 150) {
    this.maxParticles = maxParticles;
  }

  public getCount(): number {
    return this.particles.length;
  }

  public emitThruster(x: number, y: number, tilt: number, isBoosting: boolean = false): void {
    const count = isBoosting ? 4 : 2;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const spread = (Math.random() - 0.5) * 12;
      const baseVy = isBoosting ? 250 + Math.random() * 150 : 150 + Math.random() * 100;
      const vx = -tilt * 100 + (Math.random() - 0.5) * 40;
      const colors = isBoosting
        ? ['#ec4899', '#f43f5e', '#a855f7', '#ffffff']
        : ['#00f0ff', '#38bdf8', '#0284c7', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)] ?? '#00f0ff';

      this.particles.push({
        x: x + spread,
        y: y + 20,
        vx,
        vy: baseVy,
        size: isBoosting ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: isBoosting ? 0.4 + Math.random() * 0.2 : 0.25 + Math.random() * 0.15,
        shape: 'spark',
      });
    }
  }

  public emitExplosion(x: number, y: number, colorOverride?: string): void {
    const count = 25;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 240;
      const colors = ['#ff4444', '#f59e0b', '#fbbf24', '#ffffff'];
      const color = colorOverride ?? colors[Math.floor(Math.random() * colors.length)] ?? '#ff4444';

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.4,
        shape: 'circle',
      });
    }
  }

  public emitNearMiss(x: number, y: number): void {
    const count = 12;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 120;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2,
        color: '#00f0ff',
        alpha: 1.0,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        shape: 'spark',
      });
    }
  }

  public emitGateClear(x: number, y: number): void {
    const count = 20;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: '#22c55e',
        alpha: 1.0,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3,
        shape: 'spark',
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
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  public clear(): void {
    this.particles = [];
  }
}
