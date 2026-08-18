export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'line';
  length?: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  readonly maxParticles: number = 250;

  emitExhaust(x: number, y: number, isBoosting: boolean = false): void {
    const count = isBoosting ? 4 : 2;
    const colors = isBoosting
      ? ['#00f0ff', '#ffe600', '#ff007f']
      : ['#ff9f43', '#ee5253', '#8395a7'];

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const color = colors[Math.floor(Math.random() * colors.length)]!;
      this.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y + (Math.random() * 4 - 2),
        vx: (Math.random() - 0.5) * 20,
        vy: 40 + Math.random() * 60,
        size: Math.random() * 3 + 2,
        color,
        alpha: 0.9,
        life: 0.2 + Math.random() * 0.2,
        maxLife: 0.35,
        shape: 'circle',
      });
    }
  }

  emitSpeedLines(count: number = 3): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const x = Math.random() < 0.5 ? 20 + Math.random() * 40 : 420 + Math.random() * 40;
      this.particles.push({
        x,
        y: -20,
        vx: 0,
        vy: 600 + Math.random() * 400,
        size: 1.5,
        color: '#00f0ff',
        alpha: 0.5,
        life: 0.4,
        maxLife: 0.4,
        shape: 'line',
        length: 25 + Math.random() * 35,
      });
    }
  }

  emitDraftStreamlines(x: number, y: number): void {
    for (let i = 0; i < 2; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const sideOffset = (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 6);
      this.particles.push({
        x: x + sideOffset,
        y: y - 20 - Math.random() * 30,
        vx: (Math.random() - 0.5) * 15,
        vy: 350 + Math.random() * 150,
        size: 2,
        color: '#00cec9',
        alpha: 0.8,
        life: 0.3,
        maxLife: 0.3,
        shape: 'line',
        length: 18 + Math.random() * 20,
      });
    }
  }

  emitTireSmoke(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        x: x + (Math.random() * 12 - 6),
        y: y + (Math.random() * 6 - 3),
        vx: (Math.random() - 0.5) * 40,
        vy: 20 + Math.random() * 30,
        size: 3 + Math.random() * 4,
        color: '#dcdde1',
        alpha: 0.6,
        life: 0.35,
        maxLife: 0.35,
        shape: 'circle',
      });
    }
  }

  emitCrashExplosion(x: number, y: number): void {
    const colors = ['#ff007f', '#ffe600', '#ff7675', '#ffffff', '#ff9f43'];
    for (let i = 0; i < 45; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 260;
      const color = colors[Math.floor(Math.random() * colors.length)]!;
      const isShrapnel = Math.random() < 0.3;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: isShrapnel ? Math.random() * 4 + 2 : Math.random() * 6 + 3,
        color,
        alpha: 1.0,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        shape: isShrapnel ? 'square' : 'circle',
      });
    }
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  reset(): void {
    this.particles = [];
  }
}
