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
  isGlitch?: boolean;
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

export interface LaserBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
  maxLife: number;
  width: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  floatingTexts: FloatingText[] = [];
  laserBeams: LaserBeam[] = [];
  maxParticles: number = 300;

  fireLaserBeam(x1: number, y1: number, x2: number, y2: number, color = '#00ffcc', width = 3): void {
    this.laserBeams.push({
      x1,
      y1,
      x2,
      y2,
      color,
      life: 0.15,
      maxLife: 0.15,
      width
    });
  }

  emitExplosion(x: number, y: number, count = 28): void {
    const colors = ['#ff0055', '#00ffcc', '#ffeaa7', '#00d2d3', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 220;
      const life = 0.3 + Math.random() * 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)]!;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        life,
        maxLife: life,
        drag: 0.95
      });
    }
    this.boundParticles();
  }

  emitLaserHitSparks(x: number, y: number, count = 10): void {
    const colors = ['#00ffcc', '#55efc4', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const life = 0.15 + Math.random() * 0.2;
      const color = colors[Math.floor(Math.random() * colors.length)]!;
      this.particles.push({
        x,
        y,
        vx: -150 + Math.random() * 200,
        vy: -100 + Math.random() * 200,
        color,
        size: 2 + Math.random() * 2,
        life,
        maxLife: life
      });
    }
    this.boundParticles();
  }

  emitShieldBreachWave(x: number, y: number, count = 30): void {
    const colors = ['#ff4757', '#ff6b81', '#ffffff', '#ff0055'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI; // spread rightwards
      const speed = 120 + Math.random() * 200;
      const life = 0.4 + Math.random() * 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)]!;
      this.particles.push({
        x,
        y,
        vx: Math.abs(Math.cos(angle)) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        life,
        maxLife: life,
        drag: 0.96
      });
    }
    this.boundParticles();
  }

  addFloatingText(text: string, x: number, y: number, color = '#00ffcc', fontSize = 20): void {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -50,
      color,
      life: 1.2,
      maxLife: 1.2,
      fontSize
    });
    if (this.floatingTexts.length > 30) {
      this.floatingTexts.shift();
    }
  }

  update(dt: number): void {
    // Laser beams
    for (let i = this.laserBeams.length - 1; i >= 0; i--) {
      const beam = this.laserBeams[i]!;
      beam.life -= dt;
      if (beam.life <= 0) {
        this.laserBeams.splice(i, 1);
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
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
    }

    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i]!;
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

    // Laser Beams
    for (const beam of this.laserBeams) {
      const alpha = Math.max(0, beam.life / beam.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = beam.width;
      ctx.shadowBlur = 12;
      ctx.shadowColor = beam.color;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();

      // Core white bright beam
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, beam.width * 0.4);
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Particles
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }

    // Floating Texts
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.fontSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 8;
      ctx.shadowColor = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }

  clear(): void {
    this.particles = [];
    this.floatingTexts = [];
    this.laserBeams = [];
  }

  private boundParticles(): void {
    if (this.particles.length > this.maxParticles) {
      this.particles.splice(0, this.particles.length - this.maxParticles);
    }
  }
}
