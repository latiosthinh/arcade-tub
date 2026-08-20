export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  speedRatio: number;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class TrailRenderer {
  private trails: Map<number, TrailPoint[]> = new Map();
  private sparks: SparkParticle[] = [];
  private maxTrailLength: number = 24;

  public addPoint(tipIndex: number, x: number, y: number, speedRatio: number): void {
    if (!this.trails.has(tipIndex)) {
      this.trails.set(tipIndex, []);
    }
    const tipTrail = this.trails.get(tipIndex)!;

    tipTrail.unshift({
      x,
      y,
      alpha: Math.min(1.0, speedRatio * 1.2),
      speedRatio,
    });

    if (tipTrail.length > this.maxTrailLength) {
      tipTrail.pop();
    }
  }

  public spawnSparks(x: number, y: number, count: number = 3): void {
    const colors = ['#00ffff', '#ff007f', '#ffe600', '#00ff66', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.2 + Math.random() * 0.3,
        maxLife: 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.5 + Math.random() * 2.5,
      });
    }
  }

  public update(dt: number): void {
    // Decay trails
    this.trails.forEach((points) => {
      for (let i = 0; i < points.length; i++) {
        points[i].alpha -= dt * 2.5;
      }
      // Remove dead points
      while (points.length > 0 && points[points.length - 1].alpha <= 0) {
        points.pop();
      }
    });

    // Update sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, baseColor: string = '#00ffff'): void {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw neon trail ribbons
    this.trails.forEach((points) => {
      if (points.length < 2) return;

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        if (p1.alpha <= 0.01) continue;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        ctx.strokeStyle = baseColor;
        ctx.globalAlpha = p1.alpha * 0.7;
        ctx.lineWidth = Math.max(1, (1 - i / points.length) * 8 * p1.speedRatio);
        ctx.shadowBlur = 12 * p1.speedRatio;
        ctx.shadowColor = baseColor;
        ctx.stroke();

        // Inner bright core
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = p1.alpha * 0.9;
        ctx.lineWidth = Math.max(0.5, (1 - i / points.length) * 3 * p1.speedRatio);
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#ffffff';
        ctx.stroke();
      }
    });

    // Draw sparks
    ctx.shadowBlur = 6;
    for (const p of this.sparks) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  public clear(): void {
    this.trails.clear();
    this.sparks = [];
  }
}
