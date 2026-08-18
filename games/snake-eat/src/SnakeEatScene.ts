import { GameScene } from '@arcade-carnival/game-engine';
import { Snake, Direction } from './Snake.js';
import { SnakeGrid, GRID_COLS, GRID_ROWS, CELL_SIZE } from './SnakeGrid.js';
import { FoodSpawner } from './FoodSpawner.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';
import { snakeAudio } from './SnakeAudio.js';
import { SnakeRenderer } from './SnakeRenderer.js';

export class SnakeEatScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private snake: Snake;
  private foodSpawner: FoodSpawner;
  private gameState: GameState;
  private particles: ParticleSystem;
  private renderer: SnakeRenderer;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isTouching: boolean = false;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;
  private boundPointerDown: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.snake = new Snake(10, 10, 3, Direction.RIGHT);
    this.foodSpawner = new FoodSpawner(GRID_COLS, GRID_ROWS);
    this.gameState = new GameState();
    this.particles = new ParticleSystem(300);
    this.renderer = new SnakeRenderer();

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
    this.boundPointerDown = this.handlePointerDown.bind(this);

    this.attachEventListeners();
    this.resetGame();
  }

  private attachEventListeners(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    this.canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.canvas.removeEventListener('touchstart', this.boundTouchStart);
    this.canvas.removeEventListener('touchend', this.boundTouchEnd);
    this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
  }

  resetGame(): void {
    this.snake.reset(10, 10, 3, Direction.RIGHT);
    this.foodSpawner.reset();
    this.particles.reset();
    this.foodSpawner.spawnRegular(this.snake);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      this.snake.setSpeedBoost(false);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space' && this.gameState.status === 'playing') {
      this.snake.setSpeedBoost(true);
    }

    if (e.key === ' ' || e.key === 'Enter') {
      if (this.gameState.status === 'ready') {
        this.gameState.startGame();
        return;
      }
      if (this.gameState.status === 'gameover') {
        this.resetGame();
        this.gameState.startGame();
        return;
      }
    }

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (this.gameState.status === 'playing') {
        this.gameState.pause();
      } else if (this.gameState.status === 'paused') {
        this.gameState.resume();
      }
      return;
    }

    if (this.gameState.status === 'ready') {
      this.gameState.startGame();
    }

    if (this.gameState.status !== 'playing') return;

    let dir: Direction | null = null;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        dir = Direction.UP;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        dir = Direction.DOWN;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        dir = Direction.LEFT;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        dir = Direction.RIGHT;
        break;
    }

    if (dir) {
      this.snake.queueDirection(dir);
    }
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.gameState.status === 'ready') {
      this.gameState.startGame();
      return;
    }
    if (this.gameState.status === 'gameover') {
      this.resetGame();
      this.gameState.startGame();
      return;
    }
    if (this.gameState.status === 'paused') {
      this.gameState.resume();
      return;
    }

    // Tap steering quadrant relative to canvas center
    const rect = this.canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    const dx = px - cx;
    const dy = py - cy;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.snake.queueDirection(dx > 0 ? Direction.RIGHT : Direction.LEFT);
    } else {
      this.snake.queueDirection(dy > 0 ? Direction.DOWN : Direction.UP);
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0 && e.touches[0]) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isTouching = true;
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    if (!this.isTouching) return;
    this.isTouching = false;

    if (this.gameState.status === 'ready') {
      this.gameState.startGame();
      return;
    }
    if (this.gameState.status === 'gameover') {
      this.resetGame();
      this.gameState.startGame();
      return;
    }
    if (this.gameState.status === 'paused') {
      this.gameState.resume();
      return;
    }

    if (e.changedTouches.length === 0 || !e.changedTouches[0]) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - this.touchStartX;
    const dy = touchEndY - this.touchStartY;
    const minSwipeDist = 20;

    if (Math.hypot(dx, dy) >= minSwipeDist) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.snake.queueDirection(dx > 0 ? Direction.RIGHT : Direction.LEFT);
      } else {
        this.snake.queueDirection(dy > 0 ? Direction.DOWN : Direction.UP);
      }
    }
  }

  update(dt: number): void {
    const safeDt = Math.min(dt, 0.1);

    if (this.gameState.status === 'playing') {
      this.gameState.update(safeDt);
      const prevDir = this.snake.currentDirection;
      const stepRes = this.snake.update(safeDt);

      if (stepRes.stepped) {
        if (this.snake.currentDirection !== prevDir) {
          snakeAudio.playTurn();
        }

        const head = stepRes.head;

        // Check wall collision
        if (!SnakeGrid.isInside(head.x, head.y, GRID_COLS, GRID_ROWS)) {
          this.triggerCrash();
          return;
        }

        // Check self bite collision
        if (this.snake.checkSelfCollision()) {
          this.triggerCrash();
          return;
        }

        // Check food collection
        const eatRes = this.foodSpawner.checkEat(head.x, head.y);
        if (eatRes) {
          this.snake.grow(eatRes.grow);
          const earned = this.gameState.addFoodScore(eatRes.points, eatRes.type === 'GOLDEN');

          const pixelPos = SnakeGrid.gridToPixel(head.x, head.y);
          if (eatRes.type === 'GOLDEN') {
            snakeAudio.playGoldenPickup();
            this.particles.emitGoldenBurst(pixelPos.x, pixelPos.y, 24);
          } else {
            snakeAudio.playEat(this.gameState.multiplier);
            this.particles.emitFoodBurst(pixelPos.x, pixelPos.y, '#ff007f', 14);
          }

          if (this.gameState.streak > 1) {
            this.particles.emitStreakSparkles(pixelPos.x, pixelPos.y, 8);
          }

          // Ensure regular food persists
          if (!this.foodSpawner.regularFood) {
            this.foodSpawner.spawnRegular(this.snake);
          }
        }
      }

      this.foodSpawner.update(safeDt, this.snake);
    }

    this.particles.update(safeDt);
  }

  private triggerCrash(): void {
    this.snake.alive = false;
    this.particles.emitCrashExplosion(this.snake.body, CELL_SIZE);
    snakeAudio.playCrash();
    this.gameState.endGame();
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(
      ctx,
      this.snake,
      this.foodSpawner,
      this.gameState,
      this.particles,
      this.canvas.width,
      this.canvas.height
    );
  }

  pause(): void {
    this.gameState.pause();
  }

  resume(): void {
    this.gameState.resume();
  }
}
