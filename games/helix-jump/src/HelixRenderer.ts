import { PlatformTier } from './TowerGenerator.js';
import { GameState } from './GameState.js';
import { SplatterParticleSystem } from './SplatterParticles.js';

export class HelixRenderer {
  private paperTextureCanvas: HTMLCanvasElement | null = null;

  constructor() {
    this.createPaperTexture();
  }

  private createPaperTexture(): void {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, 128, 128);

    // Subtle paper grain dots
    ctx.fillStyle = '#E3D7C5';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const r = Math.random() * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    this.paperTextureCanvas = canvas;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    particles: SplatterParticleSystem,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    ctx.save();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Warm cardboard background
    ctx.fillStyle = '#F5EFE0';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Paper pattern overlay
    if (this.paperTextureCanvas) {
      const pattern = ctx.createPattern(this.paperTextureCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight * 0.45; // slightly higher than center
    const cameraY = gameState.cameraY;
    const towerConfig = gameState.towerGenerator.config;

    // 2. Central Corrugated Tower Pillar
    this.drawTowerPole(ctx, centerX, centerY, cameraY, towerConfig.cylinderRadius, canvasHeight);

    // 3. Platform Tiers (Sorted back to front / top to bottom)
    this.drawPlatformTiers(ctx, gameState, centerX, centerY);

    // 4. Droplet (Bouncing Ball)
    this.drawDroplet(ctx, gameState, centerX, centerY);

    // 5. Splatter Particles
    particles.render(ctx, cameraY, centerX, centerY);

    // 6. Papercraft Border & Vignette
    this.drawVignetteBorder(ctx, canvasWidth, canvasHeight);

    // 7. HUD
    this.drawHUD(ctx, gameState, canvasWidth, canvasHeight);

    ctx.restore();
  }

  private drawTowerPole(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    _centerY: number,
    _cameraY: number,
    radius: number,
    canvasHeight: number
  ): void {
    ctx.save();
    const left = centerX - radius;
    const width = radius * 2;

    // Corrugated pillar shadow & body
    ctx.fillStyle = '#D6C4A5';
    ctx.fillRect(left, 0, width, canvasHeight);

    // Vertical corrugated ridges
    ctx.strokeStyle = '#BBA480';
    ctx.lineWidth = 2;
    const ridges = 6;
    for (let i = 1; i < ridges; i++) {
      const rx = left + (width / ridges) * i;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx, canvasHeight);
      ctx.stroke();
    }

    // Outer dark ink outline
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(left, -10, width, canvasHeight + 20);

    ctx.restore();
  }

  private drawPlatformTiers(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    centerX: number,
    centerY: number
  ): void {
    const cameraY = gameState.cameraY;
    const towerRotation = gameState.towerRotation;
    const outerRadius = gameState.towerGenerator.config.discOuterRadius;
    const innerRadius = gameState.towerGenerator.config.cylinderRadius;
    const ySquash = 0.32; // 2.5D perspective ellipse ratio

    // Draw visible tiers
    for (const tier of gameState.tiers) {
      if (tier.isSmashed) continue;

      const screenY = centerY + (tier.y - cameraY);
      // Cull if off screen
      if (screenY < -100 || screenY > 700) continue;

      this.drawSingleTier(
        ctx,
        tier,
        centerX,
        screenY,
        outerRadius,
        innerRadius,
        ySquash,
        towerRotation
      );
    }
  }

  private drawSingleTier(
    ctx: CanvasRenderingContext2D,
    tier: PlatformTier,
    centerX: number,
    screenY: number,
    outerR: number,
    innerR: number,
    ySquash: number,
    towerRot: number
  ): void {
    // 3D Cardboard thickness under the platform
    const thickness = 14;

    for (const sector of tier.sectors) {
      if (sector.type === 'gap') continue;

      const startA = sector.startAngle + towerRot;
      const endA = sector.endAngle + towerRot;

      const baseColor = sector.type === 'hazard' ? '#E74C3C' : '#4ECDC4';
      const edgeColor = sector.type === 'hazard' ? '#B03A2E' : '#3BA39C';

      // 1. Draw Cardboard Side/Thickness (Bottom layer)
      ctx.save();
      ctx.fillStyle = edgeColor;
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 2;

      ctx.beginPath();
      // Outer arc top
      ctx.ellipse(centerX, screenY, outerR, outerR * ySquash, 0, startA, endA, false);
      // Outer arc bottom
      ctx.ellipse(centerX, screenY + thickness, outerR, outerR * ySquash, 0, endA, startA, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. Draw Top Platform Surface
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      // Outer rim
      ctx.ellipse(centerX, screenY, outerR, outerR * ySquash, 0, startA, endA, false);
      // Inner rim (hole around pole)
      ctx.ellipse(centerX, screenY, innerR, innerR * ySquash, 0, endA, startA, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cardboard craft texture lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      const midA = (startA + endA) / 2;
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(midA) * innerR, screenY + Math.sin(midA) * innerR * ySquash);
      ctx.lineTo(centerX + Math.cos(midA) * outerR, screenY + Math.sin(midA) * outerR * ySquash);
      ctx.stroke();

      // Splatters on platform if any
      if (tier.splatters && tier.splatters.length > 0) {
        for (const splat of tier.splatters) {
          const splatA = splat.angle + towerRot;
          // Check if splatter falls in this sector
          const sx = centerX + Math.cos(splatA) * splat.radius;
          const sy = screenY + Math.sin(splatA) * splat.radius * ySquash;
          ctx.fillStyle = splat.color;
          ctx.beginPath();
          ctx.arc(sx, sy, splat.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  private drawDroplet(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    centerX: number,
    centerY: number
  ): void {
    const droplet = gameState.droplet;
    // Droplet is anchored horizontally in front of the pole
    const dropX = centerX;
    const dropY = centerY + (droplet.y - gameState.cameraY);
    const radius = droplet.config.radius;

    ctx.save();

    // Squash and stretch deformation based on vertical velocity
    let scaleX = 1;
    let scaleY = 1;
    if (droplet.vy < 0) {
      // Bouncing upward -> stretch vertically
      scaleY = 1.25;
      scaleX = 0.82;
    } else if (droplet.vy > 500) {
      // High speed fall -> aerodynamic stretch
      scaleY = 1.35;
      scaleX = 0.75;
    }

    ctx.translate(dropX, dropY);
    ctx.scale(scaleX, scaleY);

    // Fireball aura if in combo / fireball state
    if (droplet.isFireball) {
      ctx.fillStyle = 'rgba(231, 76, 60, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(243, 156, 18, 0.6)';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ball Paper Body
    const ballColor = droplet.isFireball ? '#E67E22' : '#E74C3C';
    ctx.fillStyle = ballColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball highlight (paper layered sticker look)
    ctx.fillStyle = '#FADBD8';
    ctx.beginPath();
    ctx.arc(-radius * 0.35, -radius * 0.35, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Dark Hand-drawn outline
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private drawVignetteBorder(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    // Cardboard stitched outer border
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(12, 12, width - 24, height - 24);
    ctx.restore();
  }

  private drawHUD(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.font = "bold 24px 'Cabin Sketch', 'Comfortaa', sans-serif";
    ctx.fillStyle = '#2B2118';

    // Score & High Score
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${gameState.score}`, 28, 45);

    ctx.textAlign = 'right';
    ctx.fillText(`BEST: ${gameState.highScore}`, width - 28, 45);

    // Progress Bar on top
    const progress = gameState.getProgress();
    const barW = width * 0.45;
    const barH = 16;
    const barX = (width - barW) / 2;
    const barY = 32;

    ctx.fillStyle = '#E5D9C5';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(barX, barY, barW * progress, barH);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    // Level numbers at ends of progress bar
    ctx.font = "bold 16px 'Comfortaa', sans-serif";
    ctx.textAlign = 'right';
    ctx.fillText(`${gameState.currentLevel}`, barX - 8, barY + 13);
    ctx.textAlign = 'left';
    ctx.fillText(`${gameState.currentLevel + 1}`, barX + barW + 8, barY + 13);

    // Combo streak banner
    if (gameState.droplet.comboStreak >= 2) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = "bold 22px 'Cabin Sketch', sans-serif";
      ctx.fillStyle = gameState.droplet.isFireball ? '#E74C3C' : '#E67E22';
      ctx.fillText(
        `COMBO x${gameState.droplet.comboStreak} ${gameState.droplet.isFireball ? '🔥 SMASH MODE!' : ''}`,
        width / 2,
        80
      );
      ctx.restore();
    }

    // Ready / Game Over / Victory Overlays
    if (gameState.status === 'ready') {
      this.drawOverlayBox(ctx, width, height, 'HELIX JUMP', 'DRAG OR ARROWS TO ROTATE TOWER\nCLICK TO DROP');
    } else if (gameState.status === 'gameover') {
      this.drawOverlayBox(ctx, width, height, 'SPLATTED!', `FINAL SCORE: ${gameState.score}\nCLICK TO RETRY`);
    } else if (gameState.status === 'victory') {
      this.drawOverlayBox(ctx, width, height, 'STAGE CLEAR!', `PERFECT DROP!\nCLICK FOR LEVEL ${gameState.currentLevel + 1}`);
    }

    ctx.restore();
  }

  private drawOverlayBox(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    title: string,
    subtitle: string
  ): void {
    const boxW = 380;
    const boxH = 170;
    const boxX = (width - boxW) / 2;
    const boxY = (height - boxH) / 2 + 10;

    // Cardboard banner
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.15)';
    ctx.fillRect(boxX + 6, boxY + boxH, boxW, 8);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E74C3C';
    ctx.font = "bold 32px 'Cabin Sketch', 'Comfortaa', sans-serif";
    ctx.fillText(title, width / 2, boxY + 48);

    ctx.fillStyle = '#2B2118';
    ctx.font = "16px 'Comfortaa', sans-serif";
    const lines = subtitle.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, boxY + 95 + idx * 24);
    });
  }
}
