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
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper grain dots
    ctx.fillStyle = 'rgba(43, 33, 24, 0.06)';
    for (let x = 12; x < width; x += 24) {
      for (let y = 12; y < height; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.08)';
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

    // Storybook inked border
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    ctx.restore();
  }

  private renderFood(ctx: CanvasRenderingContext2D, spawner: FoodSpawner): void {
    // Storybook Red Apple / Berry Pellet
    if (spawner.regularFood) {
      const { x, y, pulsePhase } = spawner.regularFood;
      const px = x * CELL_SIZE + CELL_SIZE / 2;
      const py = y * CELL_SIZE + CELL_SIZE / 2;
      const scale = 1.0 + Math.sin(pulsePhase) * 0.15;
      const radius = 9 * scale;

      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(43, 33, 24, 0.25)';
      ctx.beginPath();
      ctx.arc(px + 2, py + 2, radius, 0, Math.PI * 2);
      ctx.fill();

      // Apple Body
      ctx.fillStyle = '#C85A32';
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Leaf stem
      ctx.fillStyle = '#4A6D56';
      ctx.beginPath();
      ctx.ellipse(px + 3, py - radius, 4, 2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Golden Honeycomb / Star Fruit Orb
    if (spawner.bonusFood) {
      const { x, y, lifetime, maxLifetime, pulsePhase } = spawner.bonusFood;
      const px = x * CELL_SIZE + CELL_SIZE / 2;
      const py = y * CELL_SIZE + CELL_SIZE / 2;
      const scale = 1.0 + Math.sin(pulsePhase) * 0.15;
      const radius = 11 * scale;

      ctx.save();

      // Countdown Ring
      const progress = Math.max(0, lifetime / maxLifetime);
      ctx.strokeStyle = '#C85A32';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, py, radius * 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();

      // Golden Core
      ctx.fillStyle = '#E09F3E';
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFDF9';
      ctx.beginPath();
      ctx.arc(px - 3, py - 3, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderSnake(ctx: CanvasRenderingContext2D, snake: Snake): void {
    if (snake.body.length === 0) return;

    ctx.save();
    const len = snake.body.length;

    // Body Segments (tail to neck) in Sage Green storybook aesthetic
    for (let i = len - 1; i >= 1; i--) {
      const seg = snake.body[i];
      if (!seg) continue;
      const px = seg.x * CELL_SIZE + CELL_SIZE / 2;
      const py = seg.y * CELL_SIZE + CELL_SIZE / 2;
      const t = 1 - i / len;

      const size = (CELL_SIZE / 2 - 2) * (0.75 + t * 0.25);

      // Inked shadow
      ctx.fillStyle = 'rgba(43, 33, 24, 0.2)';
      ctx.beginPath();
      ctx.arc(px + 2, py + 2, size, 0, Math.PI * 2);
      ctx.fill();

      // Sage body
      ctx.fillStyle = i % 2 === 0 ? '#4A6D56' : '#588066';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;
      ctx.stroke();
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

    ctx.fillStyle = '#3D5A46';
    ctx.beginPath();
    ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Friendly storybook eyes
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

    ctx.fillStyle = '#FFFDF9';
    ctx.beginPath();
    ctx.arc(hx + eye1Offset.x, hy + eye1Offset.y, 3.5, 0, Math.PI * 2);
    ctx.arc(hx + eye2Offset.x, hy + eye2Offset.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2B2118';
    ctx.beginPath();
    ctx.arc(hx + eye1Offset.x, hy + eye1Offset.y, 1.8, 0, Math.PI * 2);
    ctx.arc(hx + eye2Offset.x, hy + eye2Offset.y, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, gameState: GameState, width: number): void {
    ctx.save();
    ctx.font = '700 15px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#6A5D4D';

    // Score
    ctx.textAlign = 'left';
    ctx.fillText('SCORE', 20, 28);
    ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#C85A32';
    ctx.fillText(`${gameState.score}`, 85, 29);

    // Multiplier Combo Badge
    if (gameState.multiplier > 1) {
      ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
      ctx.fillStyle = '#E09F3E';
      ctx.fillText(`★ x${gameState.multiplier} COMBO!`, 180, 29);
    }

    // High Score
    ctx.textAlign = 'right';
    ctx.font = '700 15px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText('BEST', width - 90, 28);
    ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#4A6D56';
    ctx.fillText(`${gameState.highScore}`, width - 20, 29);

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(250, 246, 238, 0.92)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('STORYBOOK SNAKE', width / 2, height / 2 - 50);

    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#2B2118';
    ctx.fillText('Use ARROW KEYS / WASD to steer, SPACE to speed up', width / 2, height / 2 + 10);
    ctx.fillText('Collect Apples & Honey Orbs to grow your caterpillar', width / 2, height / 2 + 40);

    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS ANY KEY OR TAP TO START', width / 2, height / 2 + 95);

    ctx.restore();
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E09F3E';
    ctx.font = 'bold 38px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PAUSED', width / 2, height / 2 - 10);

    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#2B2118';
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
    ctx.fillStyle = 'rgba(250, 246, 238, 0.95)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('GAME OVER', width / 2, height / 2 - 70);

    ctx.font = 'bold 26px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#2B2118';
    ctx.fillText(`Final Score: ${gameState.score}`, width / 2, height / 2 - 15);

    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(
      `Apples Eaten: ${gameState.foodEaten} | Honey Orbs: ${gameState.goldenEaten}`,
      width / 2,
      height / 2 + 20
    );

    if (gameState.score >= gameState.highScore && gameState.score > 0) {
      ctx.fillStyle = '#E09F3E';
      ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('★ NEW HIGH SCORE! ★', width / 2, height / 2 + 55);
    }

    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE OR TAP TO PLAY AGAIN', width / 2, height / 2 + 95);

    ctx.restore();
  }
}
