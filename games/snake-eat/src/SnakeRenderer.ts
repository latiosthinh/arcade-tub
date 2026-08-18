import { Snake, Direction } from './Snake.js';
import { FoodSpawner, FoodType } from './FoodSpawner.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';
import { GRID_COLS, GRID_ROWS, CELL_SIZE } from './SnakeGrid.js';

export class SnakeRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    snake: Snake,
    foodSpawner: FoodSpawner,
    gameState: GameState,
    particles: ParticleSystem,
    width: number = 800,
    height: number = 640
  ): void {
    ctx.save();

    // 1. Cyber Dark Background
    this.renderBackground(ctx, width, height);

    // 2. Cyber Grid Matrix
    this.renderGrid(ctx, width, height);

    // 3. Food Pellets
    this.renderFood(ctx, foodSpawner);

    // 4. Snake Body & Directional Head
    this.renderSnake(ctx, snake);

    // 5. Particles
    particles.render(ctx);

    // 6. HUD Header
    this.renderHUD(ctx, gameState, width);

    // 7. Overlay screens
    if (gameState.status === 'ready') {
      this.renderReadyOverlay(ctx, width, height);
    } else if (gameState.status === 'paused') {
      this.renderPausedOverlay(ctx, width, height);
    } else if (gameState.status === 'gameover') {
      this.renderGameOverOverlay(ctx, gameState, width, height);
    }

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.1);
    grad.addColorStop(0, '#0c1220');
    grad.addColorStop(1, '#05070e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private renderGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Glowing border
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    ctx.restore();
  }

  private renderFood(ctx: CanvasRenderingContext2D, spawner: FoodSpawner): void {
    // Regular Pellet
    if (spawner.regularFood) {
      const { x, y, pulsePhase } = spawner.regularFood;
      const px = x * CELL_SIZE + CELL_SIZE / 2;
      const py = y * CELL_SIZE + CELL_SIZE / 2;
      const scale = 1.0 + Math.sin(pulsePhase) * 0.15;
      const radius = 8 * scale;

      ctx.save();
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff007f';

      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(px, py - radius * 1.2);
      ctx.lineTo(px + radius * 1.2, py);
      ctx.lineTo(px, py + radius * 1.2);
      ctx.lineTo(px - radius * 1.2, py);
      ctx.closePath();
      ctx.fill();

      // Glowing core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Golden Bonus Orb
    if (spawner.bonusFood) {
      const { x, y, lifetime, maxLifetime, pulsePhase } = spawner.bonusFood;
      const px = x * CELL_SIZE + CELL_SIZE / 2;
      const py = y * CELL_SIZE + CELL_SIZE / 2;
      const scale = 1.0 + Math.sin(pulsePhase) * 0.2;
      const radius = 10 * scale;

      ctx.save();

      // Decaying countdown progress ring
      const progress = Math.max(0, lifetime / maxLifetime);
      ctx.strokeStyle = 'rgba(255, 204, 0, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, py, radius * 1.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();

      // Glowing Star Orb
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderSnake(ctx: CanvasRenderingContext2D, snake: Snake): void {
    if (snake.body.length === 0) return;

    ctx.save();
    const len = snake.body.length;

    // Body Segments (tail to neck)
    for (let i = len - 1; i >= 1; i--) {
      const seg = snake.body[i];
      if (!seg) continue;
      const px = seg.x * CELL_SIZE + CELL_SIZE / 2;
      const py = seg.y * CELL_SIZE + CELL_SIZE / 2;
      const t = 1 - i / len;

      const size = (CELL_SIZE / 2 - 2) * (0.7 + t * 0.3);
      ctx.fillStyle = t > 0.5 ? '#00e5ff' : '#0099ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head
    const head = snake.body[0];
    if (!head) {
      ctx.restore();
      return;
    }
    const hx = head.x * CELL_SIZE + CELL_SIZE / 2;
    const hy = head.y * CELL_SIZE + CELL_SIZE / 2;
    const headRadius = CELL_SIZE / 2 - 1;

    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#00ffcc';
    ctx.beginPath();
    ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Directional glowing eyes
    let eye1Offset = { x: -4, y: -4 };
    let eye2Offset = { x: 4, y: -4 };

    switch (snake.currentDirection) {
      case Direction.UP:
        eye1Offset = { x: -5, y: -5 };
        eye2Offset = { x: 5, y: -5 };
        break;
      case Direction.DOWN:
        eye1Offset = { x: -5, y: 5 };
        eye2Offset = { x: 5, y: 5 };
        break;
      case Direction.LEFT:
        eye1Offset = { x: -5, y: -5 };
        eye2Offset = { x: -5, y: 5 };
        break;
      case Direction.RIGHT:
        eye1Offset = { x: 5, y: -5 };
        eye2Offset = { x: 5, y: 5 };
        break;
    }

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(hx + eye1Offset.x, hy + eye1Offset.y, 2.5, 0, Math.PI * 2);
    ctx.arc(hx + eye2Offset.x, hy + eye2Offset.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, gameState: GameState, width: number): void {
    ctx.save();
    ctx.font = '600 16px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#a0aec0';

    // Score
    ctx.textAlign = 'left';
    ctx.fillText('SCORE', 20, 28);
    ctx.font = 'bold 22px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 8;
    ctx.fillText(`${gameState.score}`, 80, 29);

    // Multiplier Combo Badge
    if (gameState.multiplier > 1) {
      ctx.font = 'bold 18px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 10;
      ctx.fillText(`x${gameState.multiplier} COMBO!`, 180, 29);
    }

    // High Score
    ctx.textAlign = 'right';
    ctx.font = '600 16px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#a0aec0';
    ctx.shadowBlur = 0;
    ctx.fillText('HIGH', width - 90, 28);
    ctx.font = 'bold 22px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.fillText(`${gameState.highScore}`, width - 20, 29);

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 7, 14, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 44px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('CYBER SNAKE', width / 2, height / 2 - 50);

    ctx.shadowBlur = 6;
    ctx.font = '18px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#cbd5e0';
    ctx.fillText('Use ARROW KEYS / WASD or SWIPE to steer', width / 2, height / 2 + 10);
    ctx.fillText('Collect Energy Pellets & Golden Orbs to grow', width / 2, height / 2 + 40);

    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('PRESS ANY KEY OR TAP TO START', width / 2, height / 2 + 95);

    ctx.restore();
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 7, 14, 0.75)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 40px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('PAUSED', width / 2, height / 2 - 10);

    ctx.font = '18px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#cbd5e0';
    ctx.shadowBlur = 0;
    ctx.fillText('Press P or Tap to Resume', width / 2, height / 2 + 35);

    ctx.restore();
  }

  private renderGameOverOverlay(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 7, 14, 0.88)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 22;
    ctx.font = 'bold 46px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('SIGNAL LOST', width / 2, height / 2 - 70);

    ctx.shadowBlur = 8;
    ctx.font = '22px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Final Score: ${gameState.score}`, width / 2, height / 2 - 15);

    ctx.font = '16px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#a0aec0';
    ctx.fillText(
      `Pellets Eaten: ${gameState.foodEaten} | Golden Orbs: ${gameState.goldenEaten}`,
      width / 2,
      height / 2 + 20
    );

    if (gameState.score >= gameState.highScore && gameState.score > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 12;
      ctx.font = 'bold 18px "Segoe UI", Roboto, sans-serif';
      ctx.fillText('★ NEW HIGH SCORE! ★', width / 2, height / 2 + 55);
    }

    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('PRESS SPACE OR TAP TO RESTART', width / 2, height / 2 + 95);

    ctx.restore();
  }
}
