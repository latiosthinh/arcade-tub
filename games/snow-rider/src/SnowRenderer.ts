import { SledPhysics } from './SledPhysics.js';
import { SlopeItem } from './SlopeGenerator.js';
import { GameState } from './GameState.js';

export interface Snowflake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export class SnowRenderer {
  private snowflakes: Snowflake[] = [];
  public particles: { x: number; y: number; vx: number; vy: number; color: string; alpha: number; size: number }[] = [];

  constructor() {
    for (let i = 0; i < 60; i++) {
      this.snowflakes.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 40,
        vy: 40 + Math.random() * 60,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.4 + Math.random() * 0.5,
      });
    }
  }

  public addSnowBurst(x: number, y: number, color: string = '#FFFFFF', count: number = 8): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 120,
        vy: -Math.random() * 80 - 20,
        color,
        alpha: 0.9,
        size: 2 + Math.random() * 3,
      });
    }
  }

  public update(dt: number, speedMultiplier: number): void {
    // Snowflakes falling
    for (const flake of this.snowflakes) {
      flake.x += flake.vx * dt;
      flake.y += (flake.vy + speedMultiplier * 50) * dt;
      if (flake.y > 520) {
        flake.y = -10;
        flake.x = Math.random() * 800;
      }
      if (flake.x < 0) flake.x = 800;
      if (flake.x > 800) flake.x = 0;
    }

    // Particles update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt * 1.5;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: GameState,
    sled: SledPhysics,
    items: SlopeItem[]
  ): void {
    // 1. Paper Alpine Winter Sky & Distant Mountains
    this.renderBackground(ctx, width, height);

    // 2. Pseudo-3D Snow Slope Projection
    const horizonY = height * 0.42;
    this.renderSlope(ctx, width, height, horizonY);

    // 3. Slope Obstacles & Collectibles (sorted back to front)
    const sortedItems = [...items].sort((a, b) => b.z - a.z);
    for (const item of sortedItems) {
      if (item.z > 0 && !item.collected) {
        this.renderSlopeItem(ctx, width, height, horizonY, item);
      }
    }

    // 4. Papercraft Toboggan Sled & Rider
    this.renderSled(ctx, width, height, sled);

    // 5. Snowfall & Sprays
    this.renderSnowfall(ctx);
    this.renderParticles(ctx);

    // 6. Paper HUD
    this.renderHUD(ctx, width, state);

    // 7. Modals / Overlays
    if (state.status === 'ready') {
      this.renderReadyOverlay(ctx, width, height);
    } else if (state.status === 'paused') {
      this.renderPausedOverlay(ctx, width, height);
    } else if (state.status === 'gameover') {
      this.renderGameOverOverlay(ctx, width, height, state);
    }
  }

  private renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Soft frosty parchment gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    grad.addColorStop(0, '#E0F2FE');
    grad.addColorStop(1, '#F0F9FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height * 0.45);

    // Paper Mountains in background
    ctx.save();
    ctx.fillStyle = '#CBD5E1';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;

    // Mountain range 1
    ctx.beginPath();
    ctx.moveTo(-50, height * 0.45);
    ctx.lineTo(120, height * 0.22);
    ctx.lineTo(280, height * 0.45);
    ctx.lineTo(440, height * 0.18);
    ctx.lineTo(600, height * 0.45);
    ctx.lineTo(750, height * 0.25);
    ctx.lineTo(width + 50, height * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Snow caps on peaks
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.moveTo(120, height * 0.22);
    ctx.lineTo(100, height * 0.27);
    ctx.lineTo(120, height * 0.26);
    ctx.lineTo(140, height * 0.27);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(440, height * 0.18);
    ctx.lineTo(415, height * 0.24);
    ctx.lineTo(440, height * 0.23);
    ctx.lineTo(465, height * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderSlope(ctx: CanvasRenderingContext2D, width: number, height: number, horizonY: number): void {
    ctx.save();
    // Snowy slope paper bed
    const slopeGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    slopeGrad.addColorStop(0, '#E2E8F0');
    slopeGrad.addColorStop(1, '#FFFDF8');
    ctx.fillStyle = slopeGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Slope stitched track boundaries (trapezoid projection)
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;

    // Left track border
    ctx.beginPath();
    ctx.moveTo(width * 0.38, horizonY);
    ctx.lineTo(-width * 0.2, height);
    ctx.stroke();

    // Right track border
    ctx.beginPath();
    ctx.moveTo(width * 0.62, horizonY);
    ctx.lineTo(width * 1.2, height);
    ctx.stroke();

    // Papercraft track ski-grooves
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      const startX = width * 0.5 + i * (width * 0.04);
      const endX = width * 0.5 + i * (width * 0.22);
      ctx.beginPath();
      ctx.moveTo(startX, horizonY);
      ctx.lineTo(endX, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  private project(x: number, z: number, width: number, height: number, horizonY: number) {
    const depth = Math.max(1, z + 50);
    const scale = 250 / depth;
    const screenX = width * 0.5 + x * (width * 0.38) * scale;
    const screenY = horizonY + (height - horizonY) * (1 - Math.min(1, z / 1000) * 0.95);
    return { screenX, screenY, scale };
  }

  private renderSlopeItem(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizonY: number,
    item: SlopeItem
  ): void {
    const { screenX, screenY, scale } = this.project(item.x, item.z, width, height, horizonY);
    if (scale <= 0.05) return;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.scale(scale * item.size, scale * item.size);

    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (item.type === 'pine-tree') {
      this.drawPaperPineTree(ctx);
    } else if (item.type === 'snowman') {
      this.drawPaperSnowman(ctx);
    } else if (item.type === 'rock') {
      this.drawPaperRock(ctx);
    } else if (item.type === 'gift') {
      this.drawPaperGift(ctx);
    }

    ctx.restore();
  }

  private drawPaperPineTree(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;

    // Trunk
    ctx.fillStyle = '#8D5B34';
    ctx.fillRect(-4, -12, 8, 14);
    ctx.strokeRect(-4, -12, 8, 14);

    // Layer 1 (Bottom)
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(-24, -10);
    ctx.lineTo(24, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Layer 2 (Mid)
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.lineTo(-20, -30);
    ctx.lineTo(20, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Layer 3 (Top)
    ctx.fillStyle = '#34D399';
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.lineTo(-14, -50);
    ctx.lineTo(14, -50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Snow topping
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.lineTo(-6, -65);
    ctx.lineTo(0, -60);
    ctx.lineTo(6, -65);
    ctx.closePath();
    ctx.fill();
  }

  private drawPaperSnowman(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.8;

    // Bottom ball
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(0, -14, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head ball
    ctx.beginPath();
    ctx.arc(0, -36, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Carrot nose
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(8, -34);
    ctx.lineTo(0, -32);
    ctx.closePath();
    ctx.fill();

    // Inked eyes & buttons
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(-4, -39, 2, 2);
    ctx.fillRect(2, -39, 2, 2);
    ctx.fillRect(-1, -18, 2, 2);
    ctx.fillRect(-1, -12, 2, 2);

    // Paper Scarf
    ctx.fillStyle = '#E11D48';
    ctx.fillRect(-8, -28, 16, 4);
    ctx.strokeRect(-8, -28, 16, 4);
  }

  private drawPaperRock(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#64748B';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-12, -18);
    ctx.lineTo(8, -22);
    ctx.lineTo(18, -6);
    ctx.lineTo(14, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crease highlight
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(-12, -18);
    ctx.lineTo(0, -10);
    ctx.lineTo(8, -22);
    ctx.closePath();
    ctx.fill();
  }

  private drawPaperGift(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.8;

    // Gift box
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-14, -26, 28, 26);
    ctx.strokeRect(-14, -26, 28, 26);

    // Ribbons
    ctx.fillStyle = '#E11D48';
    ctx.fillRect(-4, -26, 8, 26);
    ctx.fillRect(-14, -16, 28, 6);

    // Bow
    ctx.beginPath();
    ctx.arc(-5, -28, 5, 0, Math.PI * 2);
    ctx.arc(5, -28, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderSled(ctx: CanvasRenderingContext2D, width: number, height: number, sled: SledPhysics): void {
    const screenX = width * 0.5 + sled.x * (width * 0.38);
    const screenY = height * 0.86 - sled.y * 0.25;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(sled.tilt);

    // Sled drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 12 + sled.y * 0.2, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Toboggan Sled Runners
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#B45309';

    // Left ski runner
    ctx.fillRect(-22, -6, 8, 26);
    ctx.strokeRect(-22, -6, 8, 26);
    // Right ski runner
    ctx.fillRect(14, -6, 8, 26);
    ctx.strokeRect(14, -6, 8, 26);

    // Wooden Sled Deck
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.roundRect(-26, -18, 52, 28, 6);
    ctx.fill();
    ctx.stroke();

    // Papercraft Rider (Cardboard Boy in Winter Coat)
    // Blue Jacket Torso
    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.roundRect(-14, -38, 28, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Winter Beanie Hat
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(0, -44, 12, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Pompom on hat
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(0, -56, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Warm Scarf
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-12, -38, 24, 6);
    ctx.strokeRect(-12, -38, 24, 6);

    ctx.restore();
  }

  private renderSnowfall(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const s of this.snowflakes) {
      ctx.fillStyle = '#FFFDF8';
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, width: number, state: GameState): void {
    ctx.save();
    // Taped Header
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, width, 44);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 44);
    ctx.lineTo(width, 44);
    ctx.stroke();

    // Paper Tape
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.fillRect(180, 2, 28, 10);
    ctx.strokeRect(180, 2, 28, 10);
    ctx.fillRect(620, 2, 28, 10);
    ctx.strokeRect(620, 2, 28, 10);

    ctx.fillStyle = '#1E40AF';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('❄️ SNOW RIDER', 20, 22);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.fillText(`SCORE: ${state.score}  (🎁 ${state.giftsCollected})`, width / 2, 22);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`HI: ${state.highScore}`, width - 20, 22);

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(240, 249, 255, 0.88)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 200, height / 2 - 120, 400, 240, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1E40AF';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SNOW RIDER', width / 2, height / 2 - 60);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '14px "Comfortaa", cursive, sans-serif';
    ctx.fillText('PAPERCRAFT DOWNHILL SLED', width / 2, height / 2 - 30);

    ctx.fillStyle = '#3E2723';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText('A / D / ◄ ► / Drag : Steer Sled', width / 2, height / 2 + 10);
    ctx.fillText('SPACE / ▲ / Tap : Jump Chasms', width / 2, height / 2 + 35);

    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, height / 2 + 60, 260, 42, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE TO RIDE', width / 2, height / 2 + 84);

    ctx.restore();
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 150, height / 2 - 80, 300, 160, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 32px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME PAUSED', width / 2, height / 2 - 20);

    ctx.fillStyle = '#3E2723';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press ESC or Click to Resume', width / 2, height / 2 + 30);
    ctx.restore();
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, state: GameState): void {
    ctx.save();
    ctx.fillStyle = 'rgba(240, 249, 255, 0.9)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 180, height / 2 - 120, 360, 240, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WIPEOUT!', width / 2, height / 2 - 60);

    ctx.fillStyle = '#3E2723';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`DISTANCE: ${Math.floor(state.distance)}m  •  GIFTS: ${state.giftsCollected}`, width / 2, height / 2 - 15);
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`HIGH SCORE: ${state.highScore}`, width / 2, height / 2 + 15);

    ctx.fillStyle = '#2563EB';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 120, height / 2 + 45, 240, 44, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('RIDE AGAIN (SPACE)', width / 2, height / 2 + 72);

    ctx.restore();
  }
}
