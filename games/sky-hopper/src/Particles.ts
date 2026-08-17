export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  isDebris?: boolean;
  gravity?: number;
  angle?: number;
  vRot?: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  maxParticles: number = 250;

  private addParticle(p: Particle): void {
    this.particles.push(p);
    if (this.particles.length > this.maxParticles) {
      this.particles.shift();
    }
  }

  emitRocketFlame(x: number, y: number, count: number = 4): void {
    const colors = ['#ff7675', '#fdcb6e', '#ffffff', '#e17055'];
    for (let i = 0; i < count; i++) {
      const vx = -30 + Math.random() * 60;
      const vy = 200 + Math.random() * 250;
      const life = 0.15 + Math.random() * 0.15;
      this.addParticle({
        x: x + (-8 + Math.random() * 16),
        y,
        vx,
        vy,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#ff7675',
        size: 3 + Math.random() * 3,
        life,
        maxLife: life,
      });
    }
  }

  emitJumpDust(x: number, y: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const vx = -90 + Math.random() * 180;
      const vy = -20 + Math.random() * 30;
      const life = 0.25 + Math.random() * 0.15;
      this.addParticle({
        x: x + (-15 + Math.random() * 30),
        y,
        vx,
        vy,
        color: '#dfe6e9',
        size: 2 + Math.random() * 2,
        life,
        maxLife: life,
      });
    }
  }

  emitSpringSparks(x: number, y: number, count: number = 14): void {
    for (let i = 0; i < count; i++) {
      const vx = -70 + Math.random() * 140;
      const vy = -180 + Math.random() * 100;
      const life = 0.3 + Math.random() * 0.2;
      this.addParticle({
        x: x + (-12 + Math.random() * 24),
        y,
        vx,
        vy,
        color: '#ffeaa7',
        size: 2 + Math.random() * 2,
        life,
        maxLife: life,
        gravity: 250,
      });
    }
  }

  emitFragileCrumble(x: number, y: number, width: number, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const px = x + Math.random() * width;
      const vx = -40 + Math.random() * 80;
      const vy = -50 + Math.random() * 60;
      const life = 0.4 + Math.random() * 0.3;
      this.addParticle({
        x: px,
        y,
        vx,
        vy,
        color: '#74b9ff',
        size: 4 + Math.random() * 3,
        life,
        maxLife: life,
        isDebris: true,
        gravity: 400,
        angle: Math.random() * Math.PI * 2,
        vRot: -3 + Math.random() * 6,
      });
    }
  }

  emitExplosion(x: number, y: number, color: string = '#ff7675', count: number = 16): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 120;
      const life = 0.3 + Math.random() * 0.3;
      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3,
        life,
        maxLife: life,
        gravity: 100,
      });
    }
  }

  emitBalloonPop(x: number, y: number, count: number = 16): void {
    const colors = ['#fd79a8', '#e84393', '#00cec9', '#81ecec', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 150;
      const life = 0.35 + Math.random() * 0.25;
      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#fd79a8',
        size: 2 + Math.random() * 3,
        life,
        maxLife: life,
      });
    }
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.gravity) {
        p.vy += p.gravity * dt;
      }

      if (p.angle !== undefined && p.vRot !== undefined) {
        p.angle += p.vRot * dt;
      }

      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles);
    }
  }

  render(ctx: CanvasRenderingContext2D, toScreenY: (worldY: number) => number): void {
    for (const p of this.particles) {
      const sy = toScreenY(p.y);
      if (sy < -50 || sy > 650) {
        continue;
      }

      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.isDebris && p.angle !== undefined) {
        ctx.translate(p.x, sy);
        ctx.rotate(p.angle);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, sy, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  clear(): void {
    this.particles = [];
  }
}
