import { Fish } from './Fish.js';
import { PipeManager, CoralPillar } from './PipeManager.js';
import { GameState, MedalTier } from './GameState.js';
import { ParticleSystem } from './Particles.js';

interface AmbientBubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
  wobbleSpeed: number;
  wobblePhase: number;
}

export class FishRenderer {
  private ambientBubbles: AmbientBubble[] = [];
  private causticTimer: number = 0;

  constructor() {
    this.initAmbientBubbles(25);
  }

  private initAmbientBubbles(count: number): void {
    for (let i = 0; i < count; i++) {
      this.ambientBubbles.push({
        x: Math.random() * 400,
        y: Math.random() * 600,
        radius: 1.5 + Math.random() * 3,
        speed: 15 + Math.random() * 30,
        alpha: 0.2 + Math.random() * 0.4,
        wobbleSpeed: 2 + Math.random() * 3,
        wobblePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(dt: number, width: number, height: number): void {
    this.causticTimer += dt;

    for (const b of this.ambientBubbles) {
      b.y -= b.speed * dt;
      b.wobblePhase += b.wobbleSpeed * dt;
      b.x += Math.sin(b.wobblePhase) * 0.4;

      if (b.y < -10) {
        b.y = height + 10;
        b.x = Math.random() * width;
      }
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    fish: Fish,
    pipeManager: PipeManager,
    gameState: GameState,
    particles: ParticleSystem
  ): void {
    // 1. Background kraft paper ocean
    this.renderBackground(ctx, width, height);

    // 2. Sketched caustics
    this.renderCaustics(ctx, width, height);

    // 3. Ambient paper bubbles
    this.renderAmbientBubbles(ctx);

    // 4. Cardboard Coral Pillars & Paper Pearls
    this.renderPillars(ctx, pipeManager.pillars, height);

    // 5. Particles
    particles.render(ctx);

    // 6. Papercut Fish Entity
    this.renderFish(ctx, fish);

    // 7. Taped Placard HUD & Overlay Screens
    this.renderHUD(ctx, width, height, gameState);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, width, height);

    // Stitched guide lines
    ctx.save();
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.12)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.restore();
  }

  private renderCaustics(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.globalAlpha = 0.08;

    const t = this.causticTimer;
    for (let i = 0; i < 5; i++) {
      const xOffset = Math.sin(t * 0.8 + i * 1.5) * 60 + (i * width) / 4;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.beginPath();
      ctx.moveTo(xOffset, 0);
      ctx.lineTo(xOffset + 50, 0);
      ctx.lineTo(xOffset + 120, height);
      ctx.lineTo(xOffset + 40, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderAmbientBubbles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const b of this.ambientBubbles) {
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderPillars(ctx: CanvasRenderingContext2D, pillars: CoralPillar[], canvasHeight: number): void {
    for (const p of pillars) {
      // Top coral pillar
      this.drawSingleCoralPillar(ctx, p.x, 0, p.width, p.topHeight, true);

      // Bottom coral pillar
      const bottomHeight = canvasHeight - p.bottomY;
      this.drawSingleCoralPillar(ctx, p.x, p.bottomY, p.width, bottomHeight, false);

      // Pearl Bubble
      if (p.hasPearl && !p.pearlCollected) {
        this.drawPearl(ctx, p.pearlX, p.pearlY, p.pearlRadius);
      }
    }
  }

  private drawSingleCoralPillar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    isTop: boolean
  ): void {
    ctx.save();

    // Paper drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.fillRect(x + 3, y + 3, width, height);

    // Corrugated cardboard pillar body
    ctx.fillStyle = isTop ? '#C5A880' : '#D8C3A5';
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Decorative paper tape cap at pillar opening
    const capHeight = 16;
    const capY = isTop ? y + height - capHeight : y;
    const capExtra = 6;

    ctx.fillStyle = 'rgba(255, 248, 220, 0.95)';
    ctx.beginPath();
    ctx.roundRect(x - capExtra / 2, capY, width + capExtra, capHeight, 4);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Decorative cardboard texture stitches
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 10, y + height);
    ctx.moveTo(x + width - 10, y);
    ctx.lineTo(x + width - 10, y + height);
    ctx.stroke();

    ctx.restore();
  }

  private drawPearl(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.save();

    const bob = Math.sin(this.causticTimer * 4) * 3;
    const py = y + bob;

    // Pearl drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.arc(x + 2, py + 2, radius, 0, Math.PI * 2);
    ctx.fill();

    // Construction yellow pearl cutout
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(x, py, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner paper sparkle dot
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, py - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderFish(ctx: CanvasRenderingContext2D, fish: Fish): void {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.rotation);

    const w = fish.width;
    const h = fish.height;
    const finOsc = Math.sin(fish.finPhase) * 6;

    // 1. Oscillating Tail Fin Cutout
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.35 + 2, 2);
    ctx.lineTo(-w * 0.6 + 2, -h * 0.45 + finOsc + 2);
    ctx.lineTo(-w * 0.5 + 2, 2);
    ctx.lineTo(-w * 0.6 + 2, h * 0.45 + finOsc + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, 0);
    ctx.lineTo(-w * 0.6, -h * 0.45 + finOsc);
    ctx.lineTo(-w * 0.5, 0);
    ctx.lineTo(-w * 0.6, h * 0.45 + finOsc);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 2. Oscillating Dorsal Fin Cutout
    ctx.save();
    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.moveTo(-w * 0.1, -h * 0.35);
    ctx.quadraticCurveTo(0, -h * 0.7 - finOsc * 0.5, w * 0.2, -h * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 3. Construction Paper Fish Body & Shadow
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.ellipse(3, 3, w * 0.45, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Paper body
    ctx.fillStyle = '#C85A32';
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.45, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Hand-drawn Papercraft Eye
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(w * 0.22, -h * 0.1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(w * 0.24, -h * 0.1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Pectoral Fin
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.1);
    ctx.quadraticCurveTo(-w * 0.1, h * 0.45 + finOsc, 0, h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  private renderHUD(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    gameState: GameState
  ): void {
    ctx.save();

    // Playing HUD Banner Placard
    if (gameState.status === 'playing' || gameState.status === 'paused') {
      ctx.save();
      // Taped Placard Header
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(0, 0, width, 52);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 52);
      ctx.lineTo(width, 52);
      ctx.stroke();

      // Tape strips
      ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.lineWidth = 1;
      ctx.fillRect(100, 2, 24, 10);
      ctx.strokeRect(100, 2, 24, 10);
      ctx.fillRect(280, 2, 24, 10);
      ctx.strokeRect(280, 2, 24, 10);

      // Score in top center
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 28px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gameState.score.toString(), width / 2, 28);

      // Pearls in top right
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`★ ${gameState.pearls}`, width - 16, 28);

      // High Score top left
      ctx.fillStyle = '#6A5D4D';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`BEST: ${gameState.highScore}`, 16, 28);
      ctx.restore();
    }

    // Ready Overlay
    if (gameState.status === 'ready') {
      ctx.fillStyle = 'rgba(244, 234, 212, 0.85)';
      ctx.fillRect(0, 0, width, height);

      // Taped Cardboard Card
      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(30, height * 0.2, width - 60, height * 0.55, 10);
      ctx.fill();
      ctx.stroke();

      // Top Tape
      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.lineWidth = 1;
      ctx.fillRect(width / 2 - 40, height * 0.2 - 8, 80, 16);
      ctx.strokeRect(width / 2 - 40, height * 0.2 - 8, 80, 16);

      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FLAPPY FISH', width / 2, height * 0.32);

      ctx.fillStyle = '#3E2723';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.fillText('TAP OR PRESS SPACE TO SWIM', width / 2, height * 0.42);

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('Collect glowing pearls for +3 bonus!', width / 2, height * 0.5);

      if (gameState.highScore > 0) {
        ctx.fillStyle = '#6A5D4D';
        ctx.font = '15px "Comfortaa", cursive, sans-serif';
        ctx.fillText(`HIGH SCORE: ${gameState.highScore}`, width / 2, height * 0.6);
      }
    }

    // Paused Overlay
    if (gameState.status === 'paused') {
      ctx.fillStyle = 'rgba(244, 234, 212, 0.85)';
      ctx.fillRect(0, 0, width, height);

      // Placard
      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(40, height * 0.32, width - 80, height * 0.3, 8);
      ctx.fill();
      ctx.stroke();

      // Tape
      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.lineWidth = 1;
      ctx.fillRect(width / 2 - 40, height * 0.32 - 8, 80, 16);
      ctx.strokeRect(width / 2 - 40, height * 0.32 - 8, 80, 16);

      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width / 2, height * 0.44);

      ctx.fillStyle = '#3E2723';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.fillText('PRESS P OR ESC TO RESUME', width / 2, height * 0.54);
    }

    // Game Over Screen
    if (gameState.status === 'gameover') {
      ctx.fillStyle = 'rgba(244, 234, 212, 0.9)';
      ctx.fillRect(0, 0, width, height);

      // Cardboard Placard
      const boxW = width - 50;
      const boxH = height * 0.72;
      const boxX = 25;
      const boxY = height * 0.14;

      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 10);
      ctx.fill();
      ctx.stroke();

      // Tape
      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.lineWidth = 1;
      ctx.fillRect(60, boxY - 8, 50, 16);
      ctx.strokeRect(60, boxY - 8, 50, 16);
      ctx.fillRect(boxW - 60, boxY - 8, 50, 16);
      ctx.strokeRect(boxW - 60, boxY - 8, 50, 16);

      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 38px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', width / 2, boxY + 45);

      // Total score details
      ctx.fillStyle = '#3E2723';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Gates Cleared:`, boxX + 24, boxY + 100);
      ctx.textAlign = 'right';
      ctx.fillText(`${gameState.score}`, boxX + boxW - 24, boxY + 100);

      ctx.fillStyle = '#F59E0B';
      ctx.textAlign = 'left';
      ctx.fillText(`Bonus Pearls:`, boxX + 24, boxY + 135);
      ctx.textAlign = 'right';
      ctx.fillText(`+${gameState.pearls * 3} (${gameState.pearls})`, boxX + boxW - 24, boxY + 135);

      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`TOTAL SCORE:`, boxX + 24, boxY + 185);
      ctx.textAlign = 'right';
      ctx.fillText(`${gameState.totalScore}`, boxX + boxW - 24, boxY + 185);

      // Medal Tier Display
      if (gameState.medal !== 'none') {
        const medalColors: Record<MedalTier, string> = {
          none: '#3E2723',
          bronze: '#C85A32',
          silver: '#6A5D4D',
          gold: '#F59E0B',
          platinum: '#10B981',
        };
        ctx.fillStyle = medalColors[gameState.medal];
        ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🏅 ${gameState.medal.toUpperCase()} MEDAL`, width / 2, boxY + 230);
      }

      // Best score
      ctx.fillStyle = '#6A5D4D';
      ctx.font = '15px "Comfortaa", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`BEST SCORE: ${gameState.highScore}`, width / 2, boxY + 280);

      // Restart prompt
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('TAP OR SPACE TO PLAY AGAIN', width / 2, boxY + 340);
    }

    ctx.restore();
  }
}
