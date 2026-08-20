import { Particle, ParticleType } from './types';

export const MAX_PARTICLES = 250;

const CONFETTI_PALETTE = [
  '#e74c3c', // Red
  '#f1c40f', // Yellow
  '#3498db', // Blue
  '#2ecc71', // Green
  '#e67e22', // Orange
  '#ecf0f1', // White
  '#9b59b6', // Purple
  '#1abc9c', // Teal
];

const DEBRIS_PALETTE = [
  '#b84920', // Terracotta brick
  '#8d3415', // Dark brick
  '#d35400', // Ochre
  '#5c2410', // Deep grout brown
];

const SPARK_PALETTE = [
  '#ffffff', // White core
  '#f1c40f', // Bright yellow
  '#f39c12', // Golden spark
  '#e67e22', // Fiery orange
];

/**
 * ParticleEmitter manages physics simulation and rendering of papercraft particles:
 * - Multicolored cardboard confetti bursts for explosions
 * - Crumbling cardboard crumbs for brick destruction
 * - High-speed glowing spark streaks for metal/bullet hits
 * - Tread dust puffs for tank mobility
 */
export class ParticleEmitter {
  public particles: Particle[] = [];
  private maxParticles: number;

  constructor(maxParticles: number = MAX_PARTICLES) {
    this.maxParticles = maxParticles;
  }

  public emit(particle: Particle): void {
    if (this.particles.length >= this.maxParticles) {
      // Recycle oldest particle to prevent unbounded memory growth (T-53-01)
      this.particles.shift();
    }
    this.particles.push(particle);
  }

  /**
   * Spawns 20–35 multicolored cardboard confetti rectangles with radial burst velocity,
   * angular spin, air drag, and gentle downward gravity.
   */
  public emitExplosion(x: number, y: number, isBig: boolean = false): void {
    const count = isBig ? 35 : 20;
    const baseSpeed = isBig ? 240 : 160;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = baseSpeed * (0.3 + Math.random() * 0.7);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)] ?? '#f1c40f';
      const life = 0.5 + Math.random() * 0.5;
      const width = isBig ? 4 + Math.random() * 6 : 3 + Math.random() * 4;
      const height = isBig ? 3 + Math.random() * 4 : 2 + Math.random() * 3;

      this.emit({
        x,
        y,
        vx,
        vy,
        size: Math.max(width, height),
        width,
        height,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
        color,
        alpha: 1.0,
        life,
        maxLife: life,
        type: 'CONFETTI',
        gravity: 120,
        drag: 0.92,
      });
    }
  }

  /**
   * Spawns small brown/terracotta crumbling squares with downward gravity.
   */
  public emitBrickDebris(x: number, y: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 30; // initial upward kick
      const color = DEBRIS_PALETTE[Math.floor(Math.random() * DEBRIS_PALETTE.length)] ?? '#b84920';
      const life = 0.35 + Math.random() * 0.3;
      const size = 2 + Math.random() * 3;

      this.emit({
        x,
        y,
        vx,
        vy,
        size,
        width: size,
        height: size,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 8,
        color,
        alpha: 1.0,
        life,
        maxLife: life,
        type: 'DEBRIS',
        gravity: 260,
        drag: 0.95,
      });
    }
  }

  /**
   * Spawns high-velocity yellow/white spark streaks with short lifespans (0.15–0.25s).
   */
  public emitSparks(x: number, y: number, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 140;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = SPARK_PALETTE[Math.floor(Math.random() * SPARK_PALETTE.length)] ?? '#ffffff';
      const life = 0.15 + Math.random() * 0.1;
      const size = 2 + Math.random() * 2;

      this.emit({
        x,
        y,
        vx,
        vy,
        size,
        width: size * 2,
        height: size,
        rotation: angle,
        vRot: 0,
        color,
        alpha: 1.0,
        life,
        maxLife: life,
        type: 'SPARK',
        gravity: 40,
        drag: 0.85,
      });
    }
  }

  /**
   * Spawns soft expanding grey/sand dust circles that drift and fade quickly.
   */
  public emitTreadDust(x: number, y: number): void {
    const angle = Math.random() * Math.PI * 2;
    const speed = 10 + Math.random() * 20;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const life = 0.3 + Math.random() * 0.2;
    const size = 3 + Math.random() * 3;

    this.emit({
      x,
      y,
      vx,
      vy,
      size,
      width: size,
      height: size,
      rotation: 0,
      vRot: 0,
      color: '#a0937d',
      alpha: 0.6,
      life,
      maxLife: life,
      type: 'DUST',
      gravity: -10, // slight upward float
      drag: 0.9,
    });
  }

  /**
   * Updates particle kinematics, applies gravity and drag, decays lifetime, and trims dead items.
   */
  public update(dt: number): void {
    if (dt <= 0) return;
    const safeDt = Math.min(dt, 0.1);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p) continue;

      p.life -= safeDt;
      if (p.life <= 0) {
        p.alpha = 0;
        continue;
      }

      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.drag !== undefined) {
        const dragFactor = Math.pow(p.drag, safeDt * 60);
        p.vx *= dragFactor;
        p.vy *= dragFactor;
      }

      if (p.gravity !== undefined) {
        p.vy += p.gravity * safeDt;
      }

      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;
      p.rotation += p.vRot * safeDt;
    }

    this.particles = this.particles.filter((p) => p.life > 0);
  }

  /**
   * Draws all active particles with transforms and restore guards.
   */
  public render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p || p.life <= 0) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.translate(p.x, p.y);
      if (p.rotation !== 0) {
        ctx.rotate(p.rotation);
      }

      switch (p.type) {
        case 'CONFETTI':
          ctx.fillStyle = p.color;
          // Render paper rectangle with subtle border line
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);
          break;

        case 'DEBRIS':
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
          break;

        case 'SPARK':
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.width, p.height, 0, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'DUST':
        case 'SMOKE':
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    }
  }

  /**
   * Clears all active particles.
   */
  public clear(): void {
    this.particles = [];
  }
}
