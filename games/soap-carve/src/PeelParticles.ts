export interface PeelParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  length: number;
  curlAngle: number;
  angularVelocity: number;
  life: number;
  maxLife: number;
  opacity: number;
  width: number;
}

export class PeelParticleSystem {
  public particles: PeelParticle[] = [];
  public maxParticles: number;

  constructor(maxParticles = 150) {
    this.maxParticles = maxParticles;
  }

  public spawnPeel(
    startX: number,
    startY: number,
    vx: number,
    vy: number,
    color: string,
    length = 20,
    width = 6
  ): void {
    // T-44-02: Hard cap max particles, evict oldest
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }

    const maxLife = 0.8 + Math.random() * 0.4;
    this.particles.push({
      x: startX,
      y: startY,
      vx: vx + (Math.random() - 0.5) * 20,
      vy: vy + (Math.random() - 0.5) * 20,
      color,
      length,
      curlAngle: (Math.random() - 0.5) * 0.5,
      angularVelocity: 6.0 + Math.random() * 8.0,
      life: 1.0,
      maxLife,
      opacity: 1.0,
      width
    });
  }

  public update(dt: number): void {
    const gravity = 180;
    const drag = 0.92;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt / p.maxLife;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.opacity = Math.max(0, p.life);
      p.vx *= drag;
      p.vy = (p.vy + gravity * dt) * drag;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.curlAngle += p.angularVelocity * dt;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.curlAngle);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;

      // Draw curled spiral ribbon shape
      ctx.beginPath();
      const radius = p.length * 0.4;
      ctx.ellipse(0, 0, radius, p.width * 0.5, 0, 0, Math.PI * 1.5);
      ctx.lineTo(radius * 0.5, p.width);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  }

  public clear(): void {
    this.particles.length = 0;
  }
}
