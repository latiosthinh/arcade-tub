import { Ball } from './Ball';
import { Hoop } from './HoopManager';
import { ParticleSystem } from './Particles';
import { GameState } from './GameState';

export class BasketRenderer {
  renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // 1. Gym craft parchment backdrop
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, width, height);

    // Warm construction paper bleachers/banners
    ctx.fillStyle = 'rgba(216, 195, 165, 0.4)';
    ctx.fillRect(0, height - 120, width, 120);

    // Inked court hardwood floor lines
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.15)';
    ctx.lineWidth = 2;
    for (let y = height - 120; y < height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline dashed stripe
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, height - 120);
    ctx.lineTo(width, height - 120);
    ctx.stroke();
  }

  renderHoop(ctx: CanvasRenderingContext2D, hoop: Hoop): void {
    ctx.save();

    const isRight = hoop.isRightSide;
    const backboardW = 16;
    const backboardH = 90;
    const backboardX = isRight ? hoop.x + hoop.width / 2 + 10 : hoop.x - hoop.width / 2 - 10 - backboardW;
    const backboardY = hoop.y - 50;

    // Cardboard backboard
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(backboardX, backboardY, backboardW, backboardH);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(backboardX, backboardY, backboardW, backboardH);

    // Inner backboard target square
    ctx.fillStyle = '#E11D48';
    ctx.fillRect(backboardX + (isRight ? 2 : 6), hoop.y - 20, 8, 24);

    // Connecting cardboard strut
    ctx.fillStyle = '#C5A880';
    ctx.fillRect(isRight ? hoop.x + hoop.width / 2 : hoop.x - hoop.width / 2 - 12, hoop.y - 3, 14, 6);

    // Paper net strings
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.4)';
    ctx.lineWidth = 1.5;
    const netH = 45;
    const leftX = hoop.x - hoop.width / 2;
    const rightX = hoop.x + hoop.width / 2;

    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const frac = i / 6;
      const topX = leftX + frac * hoop.width;
      const botX = leftX + 12 + frac * (hoop.width - 24);
      ctx.moveTo(topX, hoop.y);
      ctx.lineTo(botX, hoop.y + netH);
    }
    ctx.stroke();

    // Red construction paper hoop rim
    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(leftX, hoop.y);
    ctx.lineTo(rightX, hoop.y);
    ctx.stroke();

    // Inked rim caps
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(leftX, hoop.y, 4, 0, Math.PI * 2);
    ctx.arc(rightX, hoop.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderBall(ctx: CanvasRenderingContext2D, ball: Ball): void {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);

    // Crumpled construction paper basketball (Terracotta orange)
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Seam lines of basketball
    ctx.beginPath();
    ctx.moveTo(-ball.radius, 0);
    ctx.lineTo(ball.radius, 0);
    ctx.moveTo(0, -ball.radius);
    ctx.lineTo(0, ball.radius);
    ctx.stroke();

    // Paper wrinkle highlights
    ctx.fillStyle = 'rgba(255, 253, 248, 0.4)';
    ctx.beginPath();
    ctx.arc(-ball.radius * 0.3, -ball.radius * 0.3, ball.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderParticles(ctx: CanvasRenderingContext2D, particles: ParticleSystem): void {
    for (const p of particles.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  renderHUD(ctx: CanvasRenderingContext2D, width: number, gameState: GameState, shotTime: number, maxShotTime: number): void {
    // 1. Top Storybook HUD Bar
    ctx.save();
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(0, 0, width, 52);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(width, 52);
    ctx.stroke();

    ctx.font = 'bold 16px "Comfortaa", cursive, sans-serif';
    ctx.textBaseline = 'middle';

    // Left: Score & Streak
    ctx.fillStyle = '#E11D48';
    ctx.textAlign = 'left';
    const streakBadge = gameState.swishStreak > 1 ? ` (SWISH x${gameState.swishStreak}!)` : '';
    ctx.fillText(`SCORE: ${gameState.score}${streakBadge}`, 20, 26);

    // Center: Baskets
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3E2723';
    ctx.fillText(`HOOPS: ${gameState.basketsScored}`, width / 2, 26);

    // Right: High Score
    ctx.textAlign = 'right';
    ctx.fillStyle = '#059669';
    ctx.fillText(`BEST: ${gameState.highScore}`, width - 20, 26);
    ctx.restore();

    // 2. Shot Clock Countdown Gauge Bar
    const barW = 260;
    const barH = 10;
    const barX = (width - barW) / 2;
    const barY = 62;
    const frac = maxShotTime > 0 ? Math.max(0, shotTime / maxShotTime) : 0;

    ctx.save();
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.fillStyle = frac < 0.3 ? '#E11D48' : '#D97706';
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * frac, barH - 4);
    ctx.restore();
  }

  renderOverlays(ctx: CanvasRenderingContext2D, width: number, height: number, gameState: GameState): void {
    if (gameState.status === 'ready') {
      ctx.fillStyle = 'rgba(250, 246, 238, 0.92)';
      ctx.fillRect(0, 0, width, height);
      ctx.textAlign = 'center';

      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('PAPER BASKET', width / 2, 220);

      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('TAP-TAP ARCADE SHOOTER', width / 2, 265);

      ctx.fillStyle = '#3E2723';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.fillText('Tap / Click / Space to flap ball into the hoops', width / 2, 320);
      ctx.fillText('Sink clean swishes to rack up streak multipliers!', width / 2, 350);
      ctx.fillText('Beat the shot clock before time runs out', width / 2, 380);

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('PRESS SPACE OR TAP TO PLAY', width / 2, 470);
    } else if (gameState.status === 'paused') {
      ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#D97706';
      ctx.font = 'bold 40px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('PAUSED', width / 2, 270);

      ctx.fillStyle = '#3E2723';
      ctx.font = '18px "Comfortaa", cursive, sans-serif';
      ctx.fillText('Press ESC or Tap to Resume', width / 2, 330);
    } else if (gameState.status === 'gameover') {
      ctx.fillStyle = 'rgba(250, 246, 238, 0.95)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(gameState.gameOverReason === 'timeout' ? 'SHOT CLOCK EXPIRED!' : 'BALL OUT OF PLAY!', width / 2, 200);

      ctx.fillStyle = '#3E2723';
      ctx.font = 'bold 28px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`FINAL SCORE: ${gameState.score}`, width / 2, 270);

      ctx.fillStyle = '#6A5D4D';
      ctx.font = '18px "Comfortaa", cursive, sans-serif';
      ctx.fillText(`Baskets: ${gameState.basketsScored}`, width / 2, 320);

      if (gameState.score >= gameState.highScore && gameState.score > 0) {
        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
        ctx.fillText('★ NEW HIGH SCORE! ★', width / 2, 370);
      }

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('PRESS SPACE OR TAP TO RETRY', width / 2, 460);
    }
  }
}
