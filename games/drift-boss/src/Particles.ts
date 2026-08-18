export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  shape: 'rect' | 'circle' | 'shred';
}

export class ParticleSystem {
  public particles: Particle[] = [];
  private maxParticles: number;

  constructor(maxParticles = 200) {
    this.maxParticles = maxParticles;
  }

  public reset(): void {
    this.particles = [];
  }

  public emitDriftDust(x: number, y: number): void {
    if (this.particles.length >= this.maxParticles) return;
    const count = 2;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 10,
        color: Math.random() > 0.5 ? '#d2b48c' : '#c39b77',
        size: 3 + Math.random() * 3,
        alpha: 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 5,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
        shape: 'circle'
      });
    }
  }

  public emitCoinSparkles(x: number, y: number): void {
    const count = 12;
    const colors = ['#ffd700', '#fff8dc', '#ffae19', '#ffffff'];
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = 60 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 8,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
        shape: 'rect'
      });
    }
  }

  public emitCardboardCrash(x: number, y: number): void {
    const count = 24;
    const colors = ['#c89666', '#a47148', '#e3bc9a', '#8b5a2b', '#ffffff'];
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        alpha: 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 12,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.4,
        shape: 'shred'
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // gravity
      p.rotation += p.rotationSpeed * dt;
      p.alpha = 1 - p.life / p.maxLife;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'shred') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.strokeStyle = '#5c3a21';
        ctx.lineWidth = 1;
        ctx.strokeRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
  }
}
