export interface PaperParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  width: number;
  height: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class BirdParticles {
  public particles: PaperParticle[];
  private confettiColors: string[];

  constructor() {
    this.particles = [];
    this.confettiColors = ['#E74C3C', '#F39C12', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6', '#E67E22'];
  }

  public reset(): void {
    this.particles = [];
  }

  public emitEggShatter(x: number, y: number, size: number): void {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        x: x + (Math.random() - 0.5) * size,
        y: y + (Math.random() - 0.5) * size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
        width: 6 + Math.random() * 8,
        height: 6 + Math.random() * 8,
        color: Math.random() > 0.4 ? '#D4A373' : '#FAEDCD', // Cardboard & eggshell tones
        alpha: 1,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0
      });
    }
  }

  public emitFeathers(x: number, y: number): void {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 240;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
        width: 8 + Math.random() * 10,
        height: 4 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#F7B731' : '#EB3B5A',
        alpha: 1,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.3
      });
    }
  }

  public emitFeverTrail(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: -(120 + Math.random() * 80),
        vy: (Math.random() - 0.5) * 60,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        width: 8 + Math.random() * 6,
        height: 8 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#FA8231' : '#FED330',
        alpha: 1,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5
      });
    }
  }

  public emitConfetti(x: number, y: number): void {
    const count = 35;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 320;
      const color = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)] || '#E74C3C';
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 150,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 14,
        width: 8 + Math.random() * 8,
        height: 6 + Math.random() * 6,
        color,
        alpha: 1,
        life: 1.0 + Math.random() * 0.6,
        maxLife: 1.6
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 400 * dt; // Gravity
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraOffsetX: number): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x - cameraOffsetX, p.y);
      ctx.rotate(p.rotation);

      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  }
}
