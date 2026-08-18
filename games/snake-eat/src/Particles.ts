export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  maxParticles: number;

  constructor(maxParticles: number = 300) {
    this.maxParticles = maxParticles;
  }

  reset(): void {
    this.particles = [];
  }

  emitFoodBurst(x: number, y: number, color: string, count: number = 14): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 140;
      const life = 0.35 + Math.random() * 0.25;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        life,
        maxLife: life,
      });
    }
  }

  emitGoldenBurst(x: number, y: number, count: number = 22): void {
    const goldenPalette = ['#ffe066', '#ffd700', '#fff3b0', '#ffaa00'];
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 180;
      const life = 0.5 + Math.random() * 0.35;
      const color = goldenPalette[Math.floor(Math.random() * goldenPalette.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2.5 + Math.random() * 3.5,
        alpha: 1.0,
        life,
        maxLife: life,
      });
    }
  }

  emitCrashExplosion(segments: Array<{ x: number; y: number }>, cellSize: number = 32): void {
    const colors = ['#00ffff', '#00ffaa', '#ff0055', '#ffffff'];
    for (const seg of segments) {
      const px = seg.x * cellSize + cellSize / 2;
      const py = seg.y * cellSize + cellSize / 2;

      for (let i = 0; i < 6; i++) {
        if (this.particles.length >= this.maxParticles) break;
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 220;
        const life = 0.6 + Math.random() * 0.4;
        const color = colors[Math.floor(Math.random() * colors.length)];

        this.particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 3 + Math.random() * 4,
          alpha: 1.0,
          life,
          maxLife: life,
        });
      }
    }
  }

  emitStreakSparkles(x: number, y: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const vx = (Math.random() - 0.5) * 80;
      const vy = -40 - Math.random() * 80;
      const life = 0.4 + Math.random() * 0.3;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx,
        vy,
        color: '#00ffff',
        size: 2 + Math.random() * 2.5,
        alpha: 1.0,
        life,
        maxLife: life,
      });
    }
  }

  update(dt: number): void {
    const drag = 0.92;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(drag, dt * 60);
      p.vy *= Math.pow(drag, dt * 60);
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.particles.length === 0) return;
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
