export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'bubble' | 'sparkle' | 'debris';
}

export class ParticleSystem {
  particles: Particle[] = [];
  maxParticles: number;

  constructor(maxParticles: number = 200) {
    this.maxParticles = maxParticles;
  }

  emitFlapBubbles(x: number, y: number, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 1.2; // mostly downward/backward
      const speed = 40 + Math.random() * 80;
      const life = 0.4 + Math.random() * 0.5;

      this.particles.push({
        x: x - 10 + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: -Math.cos(angle) * speed - 30,
        vy: Math.sin(angle) * speed * 0.5 - 20, // initial burst, then buoyant rise
        radius: 2 + Math.random() * 3.5,
        color: '#00f0ff',
        alpha: 0.8,
        life,
        maxLife: life,
        shape: 'bubble',
      });
    }
  }

  emitPearlSparkles(x: number, y: number, count: number = 14): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 70 + Math.random() * 90;
      const life = 0.5 + Math.random() * 0.4;
      const colors = ['#ffffff', '#ffd700', '#00f0ff', '#e0f7fa'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 2,
        color,
        alpha: 1.0,
        life,
        maxLife: life,
        shape: 'sparkle',
      });
    }
  }

  emitCrashDebris(x: number, y: number, count: number = 18): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 140;
      const life = 0.6 + Math.random() * 0.5;
      const colors = ['#ff007f', '#00f0ff', '#39ff14', '#ff8800', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color,
        alpha: 1.0,
        life,
        maxLife: life,
        shape: 'debris',
      });
    }
  }

  update(dt: number): void {
    if (dt <= 0) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics behavior per shape
      if (p.shape === 'bubble') {
        p.vy -= 120 * dt; // upward buoyancy
        p.vx *= Math.pow(0.92, dt * 60); // water friction
      } else if (p.shape === 'sparkle') {
        p.vx *= Math.pow(0.9, dt * 60);
        p.vy *= Math.pow(0.9, dt * 60);
      } else if (p.shape === 'debris') {
        p.vy += 280 * dt; // gravity sinking
        p.vx *= Math.pow(0.95, dt * 60);
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;

      if (p.shape === 'bubble') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bubble highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.35, p.y - p.radius * 0.35, p.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Debris
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fillRect(p.x - p.radius / 2, p.y - p.radius / 2, p.radius, p.radius);
      }
    }
    ctx.restore();
  }

  reset(): void {
    this.particles = [];
  }
}
