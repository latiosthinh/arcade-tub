import { Ship } from './Ship.js';
import { TrackObstacle } from './TrackHazardManager.js';

export interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
}

export class WarpRenderer {
  private stars: Star[] = [];
  private horizonY: number = 220;
  private bottomY: number = 540;
  private vpX: number = 400; // Vanishing point X

  constructor() {
    this.initStars();
  }

  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 75; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 300,
        z: Math.random() * 1.0,
        size: 1 + Math.random() * 2,
      });
    }
  }

  public updateStars(dt: number, speed: number): void {
    const starSpeed = (speed / 300) * 0.4;
    for (const star of this.stars) {
      star.z -= starSpeed * dt;
      if (star.z <= 0) {
        star.z = 1.0;
        star.x = (Math.random() - 0.5) * 800;
        star.y = (Math.random() - 0.5) * 300;
      }
    }
  }

  public project(worldX: number, z: number): { x: number; y: number; scale: number } {
    // z is 1.0 (horizon) to 0.0 (camera plane)
    const clampedZ = Math.max(0.001, z);
    const depthProgress = 1.0 - clampedZ; // 0.0 at horizon, 1.0 at camera
    const y = this.horizonY + depthProgress * (this.bottomY - this.horizonY);

    // Perspective expansion
    const scale = 1.0 / (clampedZ * 3.5 + 0.5);
    const normalizedOffset = (worldX - this.vpX);
    const x = this.vpX + normalizedOffset * depthProgress * 1.1;

    return { x, y, scale };
  }

  public renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Deep space gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#030712');
    bgGrad.addColorStop(0.35, '#0b0f19');
    bgGrad.addColorStop(0.7, '#111827');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Star streaks
    for (const star of this.stars) {
      const depth = Math.max(0.01, star.z);
      const scale = 1.0 / (depth * 2.0 + 0.5);
      const sx = this.vpX + star.x * scale;
      const sy = this.horizonY + star.y * scale;

      if (sx >= 0 && sx <= width && sy >= 0 && sy <= this.bottomY + 50) {
        ctx.fillStyle = depth < 0.3 ? '#ffffff' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(sx, sy, star.size * Math.min(2.5, scale * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  public renderTrack(ctx: CanvasRenderingContext2D, distance: number): void {
    const leftRails = [100, 250, 400, 550, 700];

    ctx.save();
    // Glowing grid / horizon line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.horizonY);
    ctx.lineTo(800, this.horizonY);
    ctx.stroke();

    // Perspective lane lines
    for (let i = 0; i < leftRails.length; i++) {
      const bottomX = leftRails[i] ?? 400;
      const isEdge = i === 0 || i === leftRails.length - 1;

      ctx.strokeStyle = isEdge ? '#00f0ff' : 'rgba(14, 165, 233, 0.4)';
      ctx.lineWidth = isEdge ? 3 : 1.5;

      ctx.beginPath();
      ctx.moveTo(this.vpX, this.horizonY);
      ctx.lineTo(bottomX, this.bottomY + 60);
      ctx.stroke();
    }

    // Scrolling crossbars
    const barSpacing = 40;
    const offset = (distance % barSpacing);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;

    for (let d = offset; d < 800; d += barSpacing) {
      const progress = d / 800;
      const y = this.horizonY + Math.pow(progress, 2.2) * (this.bottomY + 60 - this.horizonY);
      const span = progress * 600;
      ctx.beginPath();
      ctx.moveTo(this.vpX - span / 2, y);
      ctx.lineTo(this.vpX + span / 2, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  public renderObstacles(ctx: CanvasRenderingContext2D, obstacles: TrackObstacle[]): void {
    // Sort far to near
    const sorted = [...obstacles].sort((a, b) => b.z - a.z);

    for (const obs of sorted) {
      if (obs.z > 1.0 || obs.z < -0.1) continue;

      const p = this.project(obs.x, obs.z);
      const drawRadius = obs.radius * (p.scale * 0.45);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(obs.rotation);

      if (obs.type === 'asteroid') {
        this.drawAsteroid(ctx, drawRadius);
      } else if (obs.type === 'plasma-mine') {
        this.drawPlasmaMine(ctx, drawRadius);
      } else if (obs.type === 'boost-ring') {
        this.drawBoostRing(ctx, drawRadius);
      }

      ctx.restore();
    }
  }

  private drawAsteroid(ctx: CanvasRenderingContext2D, radius: number): void {
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;

    ctx.beginPath();
    const vertices = 8;
    for (let i = 0; i < vertices; i++) {
      const angle = (i / vertices) * Math.PI * 2;
      const dist = radius * (0.8 + 0.2 * Math.sin(i * 3));
      const vx = Math.cos(angle) * dist;
      const vy = Math.sin(angle) * dist;
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shading crater
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(radius * 0.2, radius * 0.1, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPlasmaMine(ctx: CanvasRenderingContext2D, radius: number): void {
    // Core
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Outer warning spikes
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius * 0.5), Math.sin(angle) * (radius * 0.5));
      ctx.lineTo(Math.cos(angle) * (radius * 1.1), Math.sin(angle) * (radius * 1.1));
      ctx.stroke();
    }
  }

  private drawBoostRing(ctx: CanvasRenderingContext2D, radius: number): void {
    // Glowing neon turbo ring
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner gate chevron
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.4, -radius * 0.3);
    ctx.lineTo(0, radius * 0.4);
    ctx.lineTo(radius * 0.4, -radius * 0.3);
    ctx.stroke();
  }

  public renderShip(ctx: CanvasRenderingContext2D, ship: Ship, time: number): void {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.tilt * 0.35); // Banking tilt

    const w = ship.width;
    const h = ship.height;

    // Damage flash
    if (ship.isInvulnerable && Math.floor(time * 15) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Thruster flame
    const flameH = ship.isBoosting ? 35 + Math.sin(time * 30) * 10 : 20 + Math.sin(time * 20) * 6;
    ctx.fillStyle = ship.isBoosting ? '#ec4899' : '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(-10, h / 2 - 5);
    ctx.lineTo(0, h / 2 + flameH);
    ctx.lineTo(10, h / 2 - 5);
    ctx.closePath();
    ctx.fill();

    // Delta-wing Jet Body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -h / 2); // Nose
    ctx.lineTo(w / 2, h / 2); // Right wingtip
    ctx.lineTo(w / 4, h / 3);
    ctx.lineTo(0, h / 2 - 2); // Rear thruster mount
    ctx.lineTo(-w / 4, h / 3);
    ctx.lineTo(-w / 2, h / 2); // Left wingtip
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit canopy
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.ellipse(0, -h / 6, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shield bubble
    if (ship.shieldHp > 0) {
      ctx.strokeStyle = ship.isBoosting ? '#ec4899' : 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.7, h * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
