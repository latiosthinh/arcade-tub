import { VerticalCamera } from './VerticalCamera';
import { SeasonTheme } from './stages/SeasonManager';

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  vRot: number;
  color: string;
}

export class ParticleEmitter {
  private particles: WeatherParticle[] = [];
  private burstParticles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    maxLife: number;
  }> = [];

  initWeather(theme: SeasonTheme, count = 35): void {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        vx: (Math.random() - 0.5) * 40 - 20,
        vy: 30 + Math.random() * 50,
        width: theme.particleType === 'sakura' ? 6 : 4,
        height: theme.particleType === 'maple' ? 8 : 4,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 4,
        color: theme.particleColor[Math.floor(Math.random() * theme.particleColor.length)],
      });
    }
  }

  burst(x: number, y: number, count = 12, colors = ['#FFD700', '#FF5722', '#FFFFFF']): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 140;
      this.burstParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
      });
    }
  }

  update(dt: number, stageWidth = 1200, stageHeight = 800): void {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;

      if (p.y > stageHeight) p.y = 0;
      if (p.x < 0) p.x = stageWidth;
      if (p.x > stageWidth) p.x = 0;
    }

    for (const bp of this.burstParticles) {
      bp.life += dt;
      bp.x += bp.vx * dt;
      bp.y += bp.vy * dt;
    }
    this.burstParticles = this.burstParticles.filter((bp) => bp.life < bp.maxLife);
  }

  render(ctx: CanvasRenderingContext2D, camera: VerticalCamera): void {
    // Render ambient weather particles
    for (const p of this.particles) {
      const screenX = p.x - camera.x;
      const screenY = p.y - camera.y;

      if (screenX < -20 || screenX > camera.viewportWidth + 20 || screenY < -20 || screenY > camera.viewportHeight + 20) {
        continue;
      }

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    }

    // Render impact burst sparks
    for (const bp of this.burstParticles) {
      const screenX = bp.x - camera.x;
      const screenY = bp.y - camera.y;
      const alpha = Math.max(0, 1 - bp.life / bp.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = bp.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
