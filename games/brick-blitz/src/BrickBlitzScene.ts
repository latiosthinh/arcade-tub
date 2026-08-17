import { GameScene, InputManager, audio } from '@arcade-carnival/game-engine';
import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';
import { BrickGrid } from './BrickGrid.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';

export class BrickBlitzScene implements GameScene {
  public ball: Ball;
  public paddle: Paddle;
  public brickGrid: BrickGrid;
  public gameState: GameState;
  public particles: ParticleSystem;
  public inputManager: InputManager;
  public canvas: HTMLCanvasElement;
  public shakeTimer: number = 0;

  private onPointerMoveBound: (e: PointerEvent) => void;
  private onPointerDownBound: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ball = new Ball();
    this.paddle = new Paddle();
    this.brickGrid = new BrickGrid();
    this.gameState = new GameState();
    this.particles = new ParticleSystem();
    this.inputManager = new InputManager();

    this.brickGrid.loadLevel(1);
    this.ball.reset(this.paddle.x, this.paddle.width, this.paddle.y);

    this.onPointerMoveBound = this.handlePointerMove.bind(this);
    this.onPointerDownBound = this.handlePointerDown.bind(this);

    this.canvas.addEventListener('pointermove', this.onPointerMoveBound);
    this.canvas.addEventListener('pointerdown', this.onPointerDownBound);
  }

  private getCanvasRelativeX(clientX: number): number {
    // T-03-04 mitigate: use getBoundingClientRect & scale mapping
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0) return clientX;
    const scale = this.canvas.width / rect.width;
    return (clientX - rect.left) * scale;
  }

  private handlePointerMove(e: PointerEvent): void {
    if (this.gameState.status === 'playing') {
      const mouseX = this.getCanvasRelativeX(e.clientX);
      this.paddle.setPositionX(mouseX);
    }
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.gameState.status === 'ready') {
      audio.playClick();
      this.gameState.start();
      this.ball.launch((Math.random() - 0.5) * 0.4);
    } else if (this.gameState.status === 'playing') {
      const mouseX = this.getCanvasRelativeX(e.clientX);
      this.paddle.setPositionX(mouseX);
      if (!this.ball.launched) {
        audio.playBounce();
        this.ball.launch((Math.random() - 0.5) * 0.4);
      }
    } else if (this.gameState.status === 'gameover') {
      this.restart();
    }
  }

  public update(dt: number): void {
    if (this.inputManager.justPressed('Escape')) {
      this.togglePause();
    }

    if (this.gameState.status !== 'playing') {
      if (this.gameState.status === 'gameover') {
        if (this.inputManager.justPressed('Space')) {
          this.restart();
        }
      }
      this.inputManager.update();
      return;
    }

    // Keyboard controls
    if (this.inputManager.isDown('KeyA') || this.inputManager.isDown('ArrowLeft')) {
      this.paddle.moveLeft(dt);
    }
    if (this.inputManager.isDown('KeyD') || this.inputManager.isDown('ArrowRight')) {
      this.paddle.moveRight(dt);
    }

    if (this.inputManager.justPressed('Space') && !this.ball.launched) {
      this.ball.launch((Math.random() - 0.5) * 0.4);
    }

    // Ball physics
    this.ball.update(dt, this.paddle.x, this.paddle.width, this.paddle.y);

    if (this.ball.launched) {
      const wallRes = this.ball.checkWallCollisions(800, 600);
      if (wallRes.bounced) {
        audio.playBounce();
        this.particles.emitSparks(this.ball.x, this.ball.y, '#00d2d3', 6);
      } else if (wallRes.lost) {
        audio.playError();
        this.gameState.loseLife();
        this.shakeTimer = 0.25;
        this.particles.emitSparks(this.ball.x, 590, '#ff3838', 20);
        if (this.gameState.status === 'playing') {
          this.ball.reset(this.paddle.x, this.paddle.width, this.paddle.y);
        }
      }

      if (this.paddle.checkBallBounce(this.ball)) {
        audio.playBounce();
        this.particles.emitSparks(this.ball.x, this.paddle.y, '#00d2d3', 10);
      }

      const colRes = this.brickGrid.checkBallCollision(this.ball);
      if (colRes.hit && colRes.brick) {
        this.gameState.addScore(colRes.pointsAwarded);
        if (colRes.isLife) {
          audio.playPowerup();
          this.gameState.addLife();
        } else if (colRes.isBonus) {
          audio.playPowerup();
        } else {
          audio.playScore();
        }

        if (colRes.isDestroyed) {
          this.particles.emitShatter(
            colRes.brick.x + colRes.brick.width / 2,
            colRes.brick.y + colRes.brick.height / 2,
            colRes.brick.color,
            16
          );
        } else {
          this.particles.emitSparks(this.ball.x, this.ball.y, colRes.brick.color, 8);
        }

        if (this.brickGrid.isLevelCleared()) {
          audio.playVictory();
          this.gameState.completeLevel();
          this.brickGrid.loadLevel(this.gameState.level);
          this.ball.reset(this.paddle.x, this.paddle.width, this.paddle.y);
          this.particles.emitSparks(400, 300, '#fed330', 40);
        }
      }
    }

    this.particles.update(dt);
    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    }
    this.inputManager.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Screen shake
    if (this.shakeTimer > 0) {
      const shakeAmt = (this.shakeTimer / 0.25) * 8;
      const offsetX = (Math.random() - 0.5) * shakeAmt;
      const offsetY = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(offsetX, offsetY);
    }

    // Synthwave background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
    bgGrad.addColorStop(0, '#0c0d1e');
    bgGrad.addColorStop(1, '#161730');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 600);

    // Subtle neon grid lines
    ctx.strokeStyle = 'rgba(72, 52, 212, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 60; y < 600; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Render Bricks
    for (const b of this.brickGrid.bricks) {
      if (b.destroyed) continue;

      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = b.color;

      // Rounded rectangle
      const radius = 3;
      ctx.beginPath();
      ctx.moveTo(b.x + radius, b.y);
      ctx.lineTo(b.x + b.width - radius, b.y);
      ctx.arcTo(b.x + b.width, b.y, b.x + b.width, b.y + radius, radius);
      ctx.lineTo(b.x + b.width, b.y + b.height - radius);
      ctx.arcTo(b.x + b.width, b.y + b.height, b.x + b.width - radius, b.y + b.height, radius);
      ctx.lineTo(b.x + radius, b.y + b.height);
      ctx.arcTo(b.x, b.y + b.height, b.x, b.y + b.height - radius, radius);
      ctx.lineTo(b.x, b.y + radius);
      ctx.arcTo(b.x, b.y, b.x + radius, b.y, radius);
      ctx.closePath();
      ctx.fill();

      // Inner bevel highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(b.x + 2, b.y + 2, b.width - 4, 3);

      // Durable cracks or multi-hp indicator
      if (b.type === 'durable') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        if (b.hp > 1) {
          ctx.strokeRect(b.x + 4, b.y + 4, b.width - 8, b.height - 8);
        } else {
          // crack indicator
          ctx.beginPath();
          ctx.moveTo(b.x + b.width / 2, b.y + 3);
          ctx.lineTo(b.x + b.width / 2 + 5, b.y + b.height / 2);
          ctx.lineTo(b.x + b.width / 2 - 4, b.y + b.height - 3);
          ctx.stroke();
        }
      } else if (b.type === 'bonus') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', b.x + b.width / 2, b.y + b.height / 2);
      } else if (b.type === 'life') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', b.x + b.width / 2, b.y + b.height / 2);
      }

      ctx.restore();
    }

    // Render Paddle
    ctx.save();
    ctx.shadowColor = '#00d2d3';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#1e272e';

    const pRadius = 6;
    ctx.beginPath();
    ctx.moveTo(this.paddle.x + pRadius, this.paddle.y);
    ctx.lineTo(this.paddle.x + this.paddle.width - pRadius, this.paddle.y);
    ctx.arcTo(this.paddle.x + this.paddle.width, this.paddle.y, this.paddle.x + this.paddle.width, this.paddle.y + pRadius, pRadius);
    ctx.lineTo(this.paddle.x + this.paddle.width, this.paddle.y + this.paddle.height - pRadius);
    ctx.arcTo(this.paddle.x + this.paddle.width, this.paddle.y + this.paddle.height, this.paddle.x + this.paddle.width - pRadius, this.paddle.y + this.paddle.height, pRadius);
    ctx.lineTo(this.paddle.x + pRadius, this.paddle.y + this.paddle.height);
    ctx.arcTo(this.paddle.x, this.paddle.y + this.paddle.height, this.paddle.x, this.paddle.y + this.paddle.height - pRadius, pRadius);
    ctx.lineTo(this.paddle.x, this.paddle.y + pRadius);
    ctx.arcTo(this.paddle.x, this.paddle.y, this.paddle.x + pRadius, this.paddle.y, pRadius);
    ctx.closePath();
    ctx.fill();

    // Center neon cyan core
    ctx.fillStyle = '#00d2d3';
    ctx.fillRect(this.paddle.x + 8, this.paddle.y + 4, this.paddle.width - 16, 4);

    // Bumpers
    ctx.fillStyle = '#ff7675';
    ctx.fillRect(this.paddle.x + 2, this.paddle.y + 2, 4, this.paddle.height - 4);
    ctx.fillRect(this.paddle.x + this.paddle.width - 6, this.paddle.y + 2, 4, this.paddle.height - 4);
    ctx.restore();

    // Render Ball Trail
    for (let i = 0; i < this.ball.trail.length; i++) {
      const pt = this.ball.trail[i];
      if (!pt) continue;
      const alpha = (1 - i / this.ball.trail.length) * 0.4;
      const size = this.ball.radius * (1 - (i / this.ball.trail.length) * 0.4);
      ctx.save();
      ctx.fillStyle = `rgba(0, 210, 211, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Ball
    ctx.save();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = '#00d2d3';
    ctx.beginPath();
    ctx.arc(this.ball.x - 2, this.ball.y - 2, this.ball.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Render Particles
    this.particles.render(ctx);

    // Render Top HUD
    ctx.save();
    ctx.fillStyle = 'rgba(12, 13, 30, 0.85)';
    ctx.fillRect(0, 0, 800, 48);

    ctx.font = 'bold 18px "Courier New", monospace, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fed330';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 20, 30);

    ctx.fillStyle = '#a4b0be';
    ctx.fillText(`HIGH: ${this.gameState.highScore}`, 220, 30);

    ctx.fillStyle = '#00d2d3';
    ctx.fillText(`LEVEL: ${this.gameState.level}`, 420, 30);

    ctx.fillStyle = '#ff3838';
    let hearts = '';
    for (let i = 0; i < this.gameState.lives; i++) {
      hearts += '♥ ';
    }
    ctx.fillText(`LIVES: ${hearts}`, 590, 30);
    ctx.restore();

    // Launch hint
    if (!this.ball.launched && (this.gameState.status === 'playing' || this.gameState.status === 'ready')) {
      ctx.save();
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00d2d3';
      ctx.shadowColor = '#00d2d3';
      ctx.shadowBlur = 8;
      ctx.fillText('PRESS SPACE OR CLICK TO LAUNCH', 400, this.paddle.y - 30);
      ctx.restore();
    }

    // Overlays
    if (this.gameState.status === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = '#fed330';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#fed330';
      ctx.shadowBlur = 10;
      ctx.fillText('GAME PAUSED', 400, 270);

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText('Press ESC to Resume', 400, 330);
      ctx.restore();
    } else if (this.gameState.status === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = '#ff3838';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff3838';
      ctx.shadowBlur = 15;
      ctx.fillText('GAME OVER', 400, 230);

      ctx.fillStyle = '#fed330';
      ctx.font = 'bold 22px sans-serif';
      ctx.shadowColor = '#fed330';
      ctx.shadowBlur = 6;
      ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, 400, 290);

      ctx.fillStyle = '#a4b0be';
      ctx.font = '18px sans-serif';
      ctx.shadowBlur = 0;
      ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 330);

      ctx.fillStyle = '#00d2d3';
      ctx.font = 'bold 20px sans-serif';
      ctx.shadowColor = '#00d2d3';
      ctx.shadowBlur = 8;
      ctx.fillText('PRESS SPACE OR CLICK TO RESTART', 400, 390);
      ctx.restore();
    }

    ctx.restore();
  }

  public restart(): void {
    this.gameState.restart();
    this.brickGrid.loadLevel(1);
    this.ball.reset(this.paddle.x, this.paddle.width, this.paddle.y);
    this.particles.clear();
  }

  public togglePause(): void {
    if (this.gameState.status === 'playing') {
      this.pause();
    } else if (this.gameState.status === 'paused') {
      this.resume();
    }
  }

  public pause(): void {
    this.gameState.pause();
  }

  public resume(): void {
    this.gameState.resume();
  }

  public destroy(): void {
    this.canvas.removeEventListener('pointermove', this.onPointerMoveBound);
    this.canvas.removeEventListener('pointerdown', this.onPointerDownBound);
    this.inputManager.destroy();
  }
}
