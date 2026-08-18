export interface PaperShredParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export class LayersParticles {
  public particles: PaperShredParticle[] = [];

  public emitPaperShreds(x: number, y: number, color: string, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        width: 6 + Math.random() * 8,
        height: 10 + Math.random() * 12,
        color,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1.0,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.5
      });
    }
  }

  public emitConfetti(x: number, y: number, count: number = 60): void {
    const colors = ['#FF7675', '#55EFC4', '#74B9FF', '#FFEAA7', '#A29BFE', '#FD79A8', '#FDCB6E'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const speed = 200 + Math.random() * 400;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        width: 8 + Math.random() * 8,
        height: 12 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 15,
        alpha: 1.0,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.8
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
      p.vy += 450 * dt; // gravity
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Cardboard/paper cut shadow
      ctx.fillStyle = 'rgba(43, 33, 24, 0.25)';
      ctx.fillRect(-p.width / 2 + 2, -p.height / 2 + 2, p.width, p.height);

      // Main paper flake
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);

      // Paper border
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);

      ctx.restore();
    }
    ctx.restore();
  }
}
