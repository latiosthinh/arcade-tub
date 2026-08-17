export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
  drag?: number;
  isSmoke?: boolean;
}

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  fontSize: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  floatingTexts: FloatingText[] = [];
  maxParticles: number = 300;
  maxFloatingTexts: number = 20;

  emitExplosion(x: number, y: number, count: number = 24): void {
    const colors = ['#ff4757', '#ffa502', '#2f3542', '#ffffff', '#e74c3c'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 180;
      const life = 0.3 + Math.random() * 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)] ?? '#ff4757';
      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 4 + Math.random() * 4,
        life,
        maxLife: life,
        gravity: 120,
        drag: 0.94,
      });
    }
  }

  emitCrateLand(x: number, y: number, width: number = 40, count: number = 8): void {
    const colors = ['#d35400', '#e67e22', '#bdc3c7', '#cd6133'];
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * width;
      const life = 0.2 + Math.random() * 0.2;
      const color = colors[Math.floor(Math.random() * colors.length)] ?? '#d35400';
      this.addParticle({
        x: x + offsetX,
        y,
        vx: (Math.random() - 0.5) * 80,
        vy: -30 - Math.random() * 40,
        color,
        size: 3 + Math.random() * 3,
        life,
        maxLife: life,
        gravity: 150,
      });
    }
  }

  emitSparks(x: number, y: number, count: number = 12): void {
    const colors = ['#f1c40f', '#ffeaa7', '#00cec9', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const life = 0.25 + Math.random() * 0.25;
      const color = colors[Math.floor(Math.random() * colors.length)] ?? '#f1c40f';
      this.addParticle({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 160,
        vy: -40 - Math.random() * 110,
        color,
        size: 2 + Math.random() * 2.5,
        life,
        maxLife: life,
        gravity: 200,
      });
    }
  }

  emitGoldenSparkle(x: number, y: number, count: number = 10): void {
    const colors = ['#f9ca24', '#f6e58d', '#ffffff', '#f39c12'];
    for (let i = 0; i < count; i++) {
      const life = 0.3 + Math.random() * 0.3;
      const color = colors[Math.floor(Math.random() * colors.length)] ?? '#f9ca24';
      this.addParticle({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 40,
        vy: -20 - Math.random() * 40,
        color,
        size: 2.5 + Math.random() * 2.5,
        life,
        maxLife: life,
        gravity: 30,
      });
    }
  }

  emitSteam(x: number, y: number, count: number = 4): void {
    for (let i = 0; i < count; i++) {
      const life = 0.5 + Math.random() * 0.4;
      this.addParticle({
        x: x + (Math.random() - 0.5) * 12,
        y,
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 40,
        color: '#dfe6e9',
        size: 6 + Math.random() * 8,
        life,
        maxLife: life,
        isSmoke: true,
      });
    }
  }

  addFloatingText(text: string, x: number, y: number, color: string = '#2ed573', fontSize: number = 20): void {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -45,
      color,
      life: 1.2,
      maxLife: 1.2,
      fontSize,
    });
    if (this.floatingTexts.length > this.maxFloatingTexts) {
      this.floatingTexts.shift();
    }
  }

  private addParticle(p: Particle): void {
    this.particles.push(p);
    if (this.particles.length > this.maxParticles) {
      this.particles.shift();
    }
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      if (p.drag) {
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
      }
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.isSmoke) {
        p.size += dt * 4;
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      if (!ft) continue;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.isSmoke) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${ft.fontSize}px 'Courier New', monospace`;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  clear(): void {
    this.particles = [];
    this.floatingTexts = [];
  }
}
