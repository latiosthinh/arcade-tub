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
    // z is 1.0 (horizon) down through 0.0 (player position) to -0.4 (past camera / off-screen)
    const clampedZ = Math.max(-0.4, z);
    const depthProgress = 1.0 - clampedZ;
    // Horizon is at 220, player plane is at 520 (when z=0, depthProgress=1.0).
    // When z < 0, depthProgress > 1.0 and y moves past 520 down to 700+ off the bottom of the window.
    const y = this.horizonY + depthProgress * (this.bottomY - this.horizonY);

    // Scale expands exponentially as object approaches and passes camera
    const scale = Math.max(0.15, 1.0 / (Math.max(0.04, clampedZ + 0.2) * 2.8 + 0.15));
    const normalizedOffset = (worldX - this.vpX);
    const x = this.vpX + normalizedOffset * Math.pow(Math.max(0.01, depthProgress), 1.15) * 1.25;

    return { x, y, scale };
  }

  public renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Deep construction paper indigo starfield
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1E1B2E');
    bgGrad.addColorStop(0.5, '#2D2540');
    bgGrad.addColorStop(1, '#3B3355');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Stamped stars and papercut star stickers
    for (const star of this.stars) {
      const depth = Math.max(0.01, star.z);
      const scale = 1.0 / (depth * 2.0 + 0.5);
      const sx = this.vpX + star.x * scale;
      const sy = this.horizonY + star.y * scale;

      if (sx >= 0 && sx <= width && sy >= 0 && sy <= this.bottomY + 120) {
        ctx.fillStyle = depth < 0.3 ? '#FFFDF8' : '#F59E0B';
        ctx.beginPath();
        ctx.arc(sx, sy, star.size * Math.min(2.5, scale * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  public renderTrack(ctx: CanvasRenderingContext2D, distance: number): void {
    const leftRails = [100, 250, 400, 550, 700];

    ctx.save();
    // Cardboard horizon boundary line
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, this.horizonY);
    ctx.lineTo(800, this.horizonY);
    ctx.stroke();

    // Perspective stitched lane lines on kraft orbital runway
    for (let i = 0; i < leftRails.length; i++) {
      const bottomX = leftRails[i] ?? 400;
      const isEdge = i === 0 || i === leftRails.length - 1;

      ctx.strokeStyle = isEdge ? '#F59E0B' : 'rgba(255, 248, 220, 0.4)';
      ctx.lineWidth = isEdge ? 3 : 1.5;

      ctx.beginPath();
      ctx.moveTo(this.vpX, this.horizonY);
      ctx.lineTo(bottomX + (bottomX - this.vpX) * 0.4, this.bottomY + 120);
      ctx.stroke();
    }

    // Scrolling crossbars
    const barSpacing = 40;
    const offset = (distance % barSpacing);
    ctx.strokeStyle = 'rgba(255, 248, 220, 0.25)';
    ctx.lineWidth = 1;

    for (let d = offset; d < 900; d += barSpacing) {
      const progress = d / 800;
      const y = this.horizonY + Math.pow(progress, 2.0) * (this.bottomY + 80 - this.horizonY);
      const span = progress * 700;
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
      if (obs.z > 1.0 || obs.z < -0.4) continue;

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
    // Cardboard asteroid cutout with paper crater indentations
    ctx.fillStyle = '#C5A880';
    ctx.strokeStyle = '#3E2723';
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

    // Layered crater
    ctx.fillStyle = '#8D5B34';
    ctx.beginPath();
    ctx.arc(radius * 0.2, radius * 0.1, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawPlasmaMine(ctx: CanvasRenderingContext2D, radius: number): void {
    // Papercut spiky hazard disc
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Spikes
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius * 0.5), Math.sin(angle) * (radius * 0.5));
      ctx.lineTo(Math.cos(angle) * (radius * 1.1), Math.sin(angle) * (radius * 1.1));
      ctx.stroke();
    }
  }

  private drawBoostRing(ctx: CanvasRenderingContext2D, radius: number): void {
    // Paper origami turbo gate ring
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner origami chevron
    ctx.strokeStyle = '#F59E0B';
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

    // Layered construction paper thruster flame
    const flameH = ship.isBoosting ? 35 + Math.sin(time * 30) * 10 : 20 + Math.sin(time * 20) * 6;
    ctx.fillStyle = ship.isBoosting ? '#E11D48' : '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-10, h / 2 - 5);
    ctx.lineTo(0, h / 2 + flameH);
    ctx.lineTo(10, h / 2 - 5);
    ctx.closePath();
    ctx.fill();

    // Folded paper / cardboard delta-wing starfighter
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
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

    // Cardboard wing stabilizers
    ctx.fillStyle = '#C5A880';
    ctx.fillRect(-w / 2, h / 4, 6, h / 4);
    ctx.fillRect(w / 2 - 6, h / 4, 6, h / 4);
    ctx.strokeRect(-w / 2, h / 4, 6, h / 4);
    ctx.strokeRect(w / 2 - 6, h / 4, 6, h / 4);

    // Paper canopy
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.ellipse(0, -h / 6, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Shield paper bubble
    if (ship.shieldHp > 0) {
      ctx.strokeStyle = ship.isBoosting ? '#E11D48' : 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.7, h * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
