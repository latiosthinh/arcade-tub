export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  rotation: number;
  vRot: number;
  type: 'confetti' | 'spark' | 'smoke' | 'ember' | 'ring';
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number;

  constructor(maxParticles = 200) {
    this.maxParticles = maxParticles;
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  emitConfetti(x: number, y: number, color: string, count = 16): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      const lifetime = 0.5 + Math.random() * 0.5;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        color,
        size: 4 + Math.random() * 5,
        alpha: 1.0,
        lifetime,
        maxLifetime: lifetime,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        type: Math.random() < 0.6 ? 'confetti' : 'spark',
      });
    }

    // Add 1 expanding shockwave ring
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        color,
        size: 5,
        alpha: 0.8,
        lifetime: 0.35,
        maxLifetime: 0.35,
        rotation: 0,
        vRot: 0,
        type: 'ring',
      });
    }
  }

  emitExplosion(x: number, y: number): void {
    const count = 28;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 260;
      const lifetime = 0.4 + Math.random() * 0.6;
      const isFire = Math.random() < 0.7;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: isFire ? (Math.random() < 0.5 ? '#ef4444' : '#f97316') : '#64748b',
        size: 5 + Math.random() * 8,
        alpha: 1.0,
        lifetime,
        maxLifetime: lifetime,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
        type: isFire ? 'ember' : 'smoke',
      });
    }

    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        color: '#ef4444',
        size: 10,
        alpha: 1.0,
        lifetime: 0.4,
        maxLifetime: 0.4,
        rotation: 0,
        vRot: 0,
        type: 'ring',
      });
    }
  }

  update(dt: number): void {
    const alive: Particle[] = [];

    for (const p of this.particles) {
      p.lifetime -= dt;
      if (p.lifetime <= 0) continue;

      p.alpha = Math.max(0, p.lifetime / p.maxLifetime);

      if (p.type === 'ring') {
        p.size += 140 * dt; // expands outwards
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt; // gravity
        p.rotation += p.vRot * dt;
      }

      alive.push(p);
    }

    this.particles = alive;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;

      if (p.type === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Confetti / ember / smoke rect
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  clear(): void {
    this.particles = [];
  }
}
