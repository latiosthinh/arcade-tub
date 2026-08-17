import { GameScene } from '@arcade-carnival/game-engine';
import { Direction } from './Grid2048.js';
import { GameState } from './GameState.js';
import { TileRenderer } from './TileRenderer.js';
import { Audio2048 } from './Audio2048.js';
import { ParticleSystem } from './Particles.js';

export class Game2048Scene implements GameScene {
  private width: number = 400;
  private height: number = 600;

  public gameState: GameState;
  public renderer: TileRenderer;
  public audio: Audio2048;
  public particles: ParticleSystem;

  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isPointerDown: boolean = false;

  constructor(canvas?: HTMLCanvasElement) {
    this.gameState = new GameState();
    this.renderer = new TileRenderer();
    this.audio = new Audio2048();
    this.particles = new ParticleSystem(150);

    // Initial tile sync
    this.renderer.syncDirect(this.gameState.grid.getCells());

    if (canvas) {
      this.initInputs(canvas);
    }
  }

  public initInputs(canvas: HTMLCanvasElement): void {
    // Keyboard controls
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      let dir: Direction | null = null;
      if (e.key === 'ArrowUp' || e.key === 'KeyW' || e.key === 'w' || e.key === 'W') {
        dir = 'up';
      } else if (e.key === 'ArrowDown' || e.key === 'KeyS' || e.key === 's' || e.key === 'S') {
        dir = 'down';
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA' || e.key === 'a' || e.key === 'A') {
        dir = 'left';
      } else if (e.key === 'ArrowRight' || e.key === 'KeyD' || e.key === 'd' || e.key === 'D') {
        dir = 'right';
      } else if (e.key === 'KeyU' || e.key === 'u' || e.key === 'U' || e.key === 'Backspace') {
        this.handleUndo();
      } else if (e.key === 'KeyR' || e.key === 'r' || e.key === 'R') {
        this.handleRestart();
      }

      if (dir) {
        e.preventDefault();
        this.handleMove(dir);
      }
    });

    // Touch & Pointer gesture detection
    canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      this.touchStartX = e.clientX;
      this.touchStartY = e.clientY;
      this.isPointerDown = true;

      // Check button clicks on canvas
      this.handlePointerClick(e, canvas);
    });

    window.addEventListener('pointerup', (e: PointerEvent) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;

      const dx = e.clientX - this.touchStartX;
      const dy = e.clientY - this.touchStartY;
      const dist = Math.hypot(dx, dy);

      if (dist >= 25) {
        if (Math.abs(dx) > Math.abs(dy)) {
          this.handleMove(dx > 0 ? 'right' : 'left');
        } else {
          this.handleMove(dy > 0 ? 'down' : 'up');
        }
      }
    });
  }

  private handlePointerClick(e: PointerEvent, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const boardSize = Math.min(this.width - 32, 360);
    const boardY = 140;
    const btnY = boardY + boardSize + 20;
    const btnW = 120;
    const btnH = 40;
    const gap = 16;
    const totalW = btnW * 2 + gap;
    const startX = (this.width - totalW) / 2;

    // Undo button
    if (
      clickX >= startX &&
      clickX <= startX + btnW &&
      clickY >= btnY &&
      clickY <= btnY + btnH
    ) {
      this.handleUndo();
      return;
    }

    // Restart button
    if (
      clickX >= startX + btnW + gap &&
      clickX <= startX + totalW &&
      clickY >= btnY &&
      clickY <= btnY + btnH
    ) {
      this.handleRestart();
      return;
    }

    // Modal buttons
    if (this.gameState.status === 'won' && !this.gameState.wonAcknowledged) {
      // Continue button
      if (
        clickX >= this.width / 2 - 130 &&
        clickX <= this.width / 2 - 10 &&
        clickY >= this.height / 2 + 25 &&
        clickY <= this.height / 2 + 67
      ) {
        this.gameState.continueAfterWin();
        return;
      }
      // Restart button
      if (
        clickX >= this.width / 2 + 10 &&
        clickX <= this.width / 2 + 130 &&
        clickY >= this.height / 2 + 25 &&
        clickY <= this.height / 2 + 67
      ) {
        this.handleRestart();
        return;
      }
    } else if (this.gameState.status === 'gameover') {
      // Try again
      if (
        clickX >= this.width / 2 - 130 &&
        clickX <= this.width / 2 - 10 &&
        clickY >= this.height / 2 + 25 &&
        clickY <= this.height / 2 + 67
      ) {
        this.handleRestart();
        return;
      }
      // Undo
      if (
        clickX >= this.width / 2 + 10 &&
        clickX <= this.width / 2 + 130 &&
        clickY >= this.height / 2 + 25 &&
        clickY <= this.height / 2 + 67
      ) {
        this.handleUndo();
        return;
      }
    }
  }

  public handleMove(dir: Direction): void {
    const prevStatus = this.gameState.status;
    const res = this.gameState.move(dir);

    if (res.moved) {
      this.audio.playSlide();

      // Trigger animations in renderer
      this.renderer.syncWithGrid(
        this.gameState.grid.getCells(),
        res.moves,
        res.merges,
        res.spawnedTile
      );

      // Trigger sparkles for merges
      const boardSize = Math.min(this.width - 32, 360);
      const boardX = (this.width - boardSize) / 2;
      const boardY = 140;
      const padding = 10;
      const cellSize = (boardSize - padding * 5) / 4;

      for (const merge of res.merges) {
        const mx = boardX + padding + merge.col * (cellSize + padding) + cellSize / 2;
        const my = boardY + padding + merge.row * (cellSize + padding) + cellSize / 2;
        this.particles.emitMergeSparkles(mx, my, '#00f0ff', 14);
        this.audio.playMerge(merge.value);
      }

      if (this.gameState.status === 'won' && prevStatus !== 'won') {
        this.audio.playWin();
        this.particles.emitWinConfetti(this.width, this.height, 50);
      } else if (this.gameState.status === 'gameover') {
        this.audio.playGameOver();
      }
    }
  }

  public handleUndo(): void {
    const undone = this.gameState.undo();
    if (undone) {
      this.audio.playUndo();
      this.renderer.syncDirect(this.gameState.grid.getCells());
    }
  }

  public handleRestart(): void {
    this.gameState.restart();
    this.particles.reset();
    this.renderer.syncDirect(this.gameState.grid.getCells());
  }

  public update(dt: number): void {
    this.renderer.update(dt, this.gameState.grid.getCells());
    this.particles.update(dt);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(
      ctx,
      this.width,
      this.height,
      this.gameState.grid.getCells(),
      this.gameState.score,
      this.gameState.highScore,
      this.gameState.status,
      this.gameState.wonAcknowledged
    );

    this.particles.render(ctx);
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
