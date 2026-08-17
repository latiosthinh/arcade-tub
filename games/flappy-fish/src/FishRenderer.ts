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
    // 1. Background deep ocean gradient
    this.renderBackground(ctx, width, height);

    // 2. Caustic light rays
    this.renderCaustics(ctx, width, height);

    // 3. Ambient bubbles
    this.renderAmbientBubbles(ctx);

    // 4. Coral Pillars & Pearl Bubbles
    this.renderPillars(ctx, pipeManager.pillars, height);

    // 5. Particles
    particles.render(ctx);

    // 6. Fish Entity
    this.renderFish(ctx, fish);

    // 7. HUD & Overlay Screens
    this.renderHUD(ctx, width, height, gameState);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#041833'); // top shallow blue
    grad.addColorStop(0.5, '#030d22'); // mid ocean
    grad.addColorStop(1, '#01050e'); // abyss floor
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private renderCaustics(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.12;

    const t = this.causticTimer;
    for (let i = 0; i < 5; i++) {
      const xOffset = Math.sin(t * 0.8 + i * 1.5) * 60 + (i * width) / 4;
      const grad = ctx.createLinearGradient(xOffset, 0, xOffset + 40, height);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
      grad.addColorStop(0.6, 'rgba(0, 240, 255, 0.08)');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
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
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
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

    // Pillar body gradient (dark bioluminescent coral)
    const grad = ctx.createLinearGradient(x, 0, x + width, 0);
    grad.addColorStop(0, '#092736');
    grad.addColorStop(0.3, '#104d5b');
    grad.addColorStop(0.7, '#156b7c');
    grad.addColorStop(1, '#082531');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;

    // Body
    ctx.fillRect(x, y, width, height);

    // Glowing Bioluminescent ridge highlight
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.strokeRect(x, y, width, height);

    // Coral cap rim at opening
    const capHeight = 16;
    const capY = isTop ? y + height - capHeight : y;
    const capExtra = 6;

    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x - capExtra / 2, capY, width + capExtra, capHeight, 6);
    ctx.fill();

    // Neon polyps / dots on coral surface
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 6;
    const dotSpacing = 28;
    const dotCount = Math.floor(height / dotSpacing);
    for (let i = 1; i <= dotCount; i++) {
      const dotY = isTop ? y + i * dotSpacing - 10 : y + i * dotSpacing + 10;
      if (dotY >= y + 5 && dotY <= y + height - 5) {
        ctx.beginPath();
        ctx.arc(x + width * 0.3, dotY, 2.5, 0, Math.PI * 2);
        ctx.arc(x + width * 0.7, dotY + 6, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private drawPearl(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
    ctx.save();

    // Floating bobbing effect
    const bob = Math.sin(this.causticTimer * 4) * 3;
    const py = y + bob;

    // Outer iridescent bubble aura
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#e0f7fa';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(x, py, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner glowing golden pearl
    const innerGrad = ctx.createRadialGradient(x - 2, py - 2, 1, x, py, radius * 0.65);
    innerGrad.addColorStop(0, '#ffffff');
    innerGrad.addColorStop(0.5, '#ffd700');
    innerGrad.addColorStop(1, '#ff9900');

    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(x, py, radius * 0.65, 0, Math.PI * 2);
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

    // 1. Oscillating Tail Fin
    ctx.save();
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, 0);
    ctx.lineTo(-w * 0.6, -h * 0.45 + finOsc);
    ctx.lineTo(-w * 0.5, 0);
    ctx.lineTo(-w * 0.6, h * 0.45 + finOsc);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Oscillating Dorsal Fin
    ctx.save();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.1, -h * 0.35);
    ctx.quadraticCurveTo(0, -h * 0.7 - finOsc * 0.5, w * 0.2, -h * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Cyber Fish Body (Streamlined Oval)
    ctx.save();
    const bodyGrad = ctx.createRadialGradient(w * 0.1, -h * 0.1, 2, 0, 0, w * 0.5);
    bodyGrad.addColorStop(0, '#00f0ff');
    bodyGrad.addColorStop(0.6, '#0072bb');
    bodyGrad.addColorStop(1, '#002244');

    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.45, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cyber scales / body stripes
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-w * 0.05, 0, h * 0.3, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // 4. Glowing Cyber Eye
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(w * 0.22, -h * 0.1, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.arc(w * 0.24, -h * 0.1, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Pectoral Fin
    ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.1);
    ctx.quadraticCurveTo(-w * 0.1, h * 0.45 + finOsc, 0, h * 0.35);
    ctx.closePath();
    ctx.fill();

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

    // Playing HUD Banner
    if (gameState.status === 'playing' || gameState.status === 'paused') {
      // Score in top center
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(gameState.score.toString(), width / 2, 50);

      // Pearls in top right
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`★ ${gameState.pearls}`, width - 20, 45);

      // High Score top left
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`BEST: ${gameState.highScore}`, 20, 45);
    }

    // Ready Overlay
    if (gameState.status === 'ready') {
      ctx.fillStyle = 'rgba(3, 13, 34, 0.7)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FLAPPY FISH', width / 2, height * 0.35);

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.font = '16px monospace';
      ctx.fillText('TAP OR PRESS SPACE TO SWIM', width / 2, height * 0.45);

      ctx.fillStyle = '#ffd700';
      ctx.font = '13px monospace';
      ctx.fillText('Collect glowing pearls for +3 bonus!', width / 2, height * 0.52);

      if (gameState.highScore > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`HIGH SCORE: ${gameState.highScore}`, width / 2, height * 0.62);
      }
    }

    // Paused Overlay
    if (gameState.status === 'paused') {
      ctx.fillStyle = 'rgba(3, 13, 34, 0.8)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 12;
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width / 2, height * 0.45);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText('PRESS P OR ESC TO RESUME', width / 2, height * 0.55);
    }

    // Game Over Screen
    if (gameState.status === 'gameover') {
      ctx.fillStyle = 'rgba(3, 13, 34, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 14;
      ctx.font = 'bold 34px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', width / 2, height * 0.28);

      // Score panel box
      const boxW = 260;
      const boxH = 180;
      const boxX = (width - boxW) / 2;
      const boxY = height * 0.34;

      ctx.fillStyle = 'rgba(5, 25, 45, 0.9)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Total score details
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Gates Cleared:`, boxX + 20, boxY + 35);
      ctx.textAlign = 'right';
      ctx.fillText(`${gameState.score}`, boxX + boxW - 20, boxY + 35);

      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'left';
      ctx.fillText(`Bonus Pearls:`, boxX + 20, boxY + 65);
      ctx.textAlign = 'right';
      ctx.fillText(`+${gameState.pearls * 3} (${gameState.pearls})`, boxX + boxW - 20, boxY + 65);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`TOTAL SCORE:`, boxX + 20, boxY + 105);
      ctx.textAlign = 'right';
      ctx.fillText(`${gameState.totalScore}`, boxX + boxW - 20, boxY + 105);

      // Medal Tier Display
      if (gameState.medal !== 'none') {
        const medalColors: Record<MedalTier, string> = {
          none: '#ffffff',
          bronze: '#cd7f32',
          silver: '#c0c0c0',
          gold: '#ffd700',
          platinum: '#00f0ff',
        };
        ctx.fillStyle = medalColors[gameState.medal];
        ctx.shadowColor = medalColors[gameState.medal];
        ctx.shadowBlur = 10;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`🏅 ${gameState.medal.toUpperCase()} MEDAL`, width / 2, boxY + 145);
      }

      // Best score
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`BEST SCORE: ${gameState.highScore}`, width / 2, boxY + boxH + 30);

      // Restart prompt
      ctx.fillStyle = '#39ff14';
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 8;
      ctx.font = '16px monospace';
      ctx.fillText('TAP OR SPACE TO RESTART', width / 2, boxY + boxH + 65);
    }

    ctx.restore();
  }
}
