export interface GrassParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  width: number;
  length: number;
  color: string;
  life: number;
  maxLife: number;
}

export class GrassConfetti {
  public particles: GrassParticle[] = [];
  private readonly maxParticles = 120; // Mitigates T-46-03 DoS / GC spikes

  public spawn(
    x: number,
    y: number,
    headingAngle: number,
    count: number = 8,
    color: string = '#81C784'
  ): void {
    const palette = [color, '#66BB6A', '#4CAF50', '#A5D6A7', '#C8E6C9'];

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // Evict oldest
      }

      // Ejection angle: backwards and sideways from mower chute
      const chuteAngle = headingAngle + Math.PI + (Math.random() - 0.5) * 1.5;
      const speed = 40 + Math.random() * 90;

      this.particles.push({
        x,
        y,
        vx: Math.cos(chuteAngle) * speed,
        vy: Math.sin(chuteAngle) * speed,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 15,
        width: 2 + Math.random() * 2,
        length: 6 + Math.random() * 8,
        color: palette[Math.floor(Math.random() * palette.length)],
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(0.85, dt * 60);
      p.vy *= Math.pow(0.85, dt * 60);
      p.rotation += p.vRot * dt;
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
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.width / 2, -p.length / 2, p.width, p.length);
      ctx.restore();
    }
    ctx.restore();
  }
}
