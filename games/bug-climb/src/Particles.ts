export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  type: 'chip' | 'leaf' | 'sparkle' | 'splinter';
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public maxParticles: number;

  constructor(maxParticles: number = 200) {
    this.maxParticles = maxParticles;
  }

  public emitWoodChips(x: number, y: number, side: 'LEFT' | 'RIGHT', count: number = 12): void {
    const colors = ['#8d6e63', '#a1887f', '#d7ccc8', '#6d4c41'];
    const dirSign = side === 'LEFT' ? -1 : 1;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (Math.random() * 0.8 - 0.4) + (dirSign > 0 ? 0 : Math.PI);
      const speed = 120 + Math.random() * 240;
      const maxLife = 0.4 + Math.random() * 0.4;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle)) * speed * 0.6 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        life: maxLife,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
        type: 'chip',
      });
    }
  }

  public emitLeaves(x: number, y: number, count: number = 8): void {
    const colors = ['#2ecc71', '#27ae60', '#a8e6cf', '#1abc9c'];

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      const maxLife = 0.6 + Math.random() * 0.5;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle)) * speed * 0.5 - 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 5,
        alpha: 1.0,
        life: maxLife,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 6,
        type: 'leaf',
      });
    }
  }

  public emitStreakSparkles(x: number, y: number, count: number = 10): void {
    const colors = ['#f1c40f', '#f39c12', '#00ffcc', '#ffffff'];

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      const maxLife = 0.5 + Math.random() * 0.4;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle)) * speed - 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3,
        alpha: 1.0,
        life: maxLife,
        maxLife,
        rotation: 0,
        vRot: 0,
        type: 'sparkle',
      });
    }
  }

  public emitCrashBurst(x: number, y: number): void {
    const colors = ['#e74c3c', '#c0392b', '#795548', '#d32f2f', '#ffffff'];

    for (let i = 0; i < 24; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 320;
      const maxLife = 0.5 + Math.random() * 0.5;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 6,
        alpha: 1.0,
        life: maxLife,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 16,
        type: 'splinter',
      });
    }
  }

  public update(dt: number): void {
    const gravity = 400;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.alpha = Math.max(0, p.life / p.maxLife);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += gravity * dt;
      p.vx *= Math.pow(0.95, dt * 60);
      p.rotation += p.vRot * dt;
    }
  }

  public reset(): void {
    this.particles = [];
  }
}
