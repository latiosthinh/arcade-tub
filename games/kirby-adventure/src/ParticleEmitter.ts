import { Camera } from './Camera';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

export class ParticleEmitter {
  private particles: Particle[] = [];

  burst(x: number, y: number, count = 16, colors = ['#FF4081', '#FFD700', '#00E676', '#00B0FF', '#FF6D00']): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        width: 4 + Math.random() * 4,
        height: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }

  update(dt: number): void {
    for (const p of this.particles) {
      p.life += dt;
      p.vy += 300 * dt; // Gravity
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const p of this.particles) {
      const screenX = p.x - camera.x;
      const screenY = p.y - camera.y;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(screenX, screenY);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    }
  }

  clear(): void {
    this.particles = [];
  }
}
