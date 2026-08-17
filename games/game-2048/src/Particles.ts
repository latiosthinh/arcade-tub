export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'sparkle' | 'ring' | 'confetti';
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public readonly maxParticles: number;

  constructor(maxParticles: number = 150) {
    this.maxParticles = maxParticles;
  }

  public emitMergeSparkles(x: number, y: number, color: string, count: number = 16): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 60 + Math.random() * 120;
      const life = 0.4 + Math.random() * 0.3;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        color,
        alpha: 1.0,
        life,
        maxLife: life,
        shape: 'sparkle',
      });
    }

    // Add 1 expanding shockwave ring
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 8,
        color,
        alpha: 0.9,
        life: 0.25,
        maxLife: 0.25,
        shape: 'ring',
      });
    }
  }

  public emitWinConfetti(width: number, height: number, count: number = 40): void {
    const colors = ['#00f0ff', '#00ffa3', '#ffe600', '#ff0055', '#b537f2', '#ffffff'];
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.5);
      const angle = (Math.random() - 0.5) * Math.PI;
      const speed = 40 + Math.random() * 80;
      const life = 0.8 + Math.random() * 0.6;
      const color = colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff';

      this.particles.push({
        x,
        y,
        vx: Math.sin(angle) * speed,
        vy: 30 + Math.random() * 70,
        radius: 3 + Math.random() * 2.5,
        color,
        alpha: 1.0,
        life,
        maxLife: life,
        shape: 'confetti',
      });
    }
  }

  public update(dt: number): void {
    if (dt <= 0) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;

      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.shape === 'sparkle') {
        p.vx *= Math.pow(0.9, dt * 60);
        p.vy *= Math.pow(0.9, dt * 60);
      } else if (p.shape === 'ring') {
        p.radius += 120 * dt;
      } else if (p.shape === 'confetti') {
        p.vy += 40 * dt; // gravity
        p.vx *= Math.pow(0.96, dt * 60);
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;

      if (p.shape === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fillRect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
      }
    }
    ctx.restore();
  }

  public reset(): void {
    this.particles = [];
  }
}
