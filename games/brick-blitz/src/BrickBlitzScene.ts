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

    // 1. Kraft paper background (#F4EAD4)
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, 800, 600);

    // Stitched/dashed ink border guidelines
    ctx.save();
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(10, 56, 780, 534);
    ctx.restore();

    // Paper tape corner accents
    ctx.save();
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1;
    // Top-left tape
    ctx.fillRect(8, 54, 36, 12);
    ctx.strokeRect(8, 54, 36, 12);
    // Top-right tape
    ctx.fillRect(756, 54, 36, 12);
    ctx.strokeRect(756, 54, 36, 12);
    ctx.restore();

    // 2. Render Bricks with cardboard drop shadow & inked paper borders
    for (const b of this.brickGrid.bricks) {
      if (b.destroyed) continue;

      ctx.save();
      // Paper drop shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.beginPath();
      ctx.roundRect(b.x + 3, b.y + 3, b.width, b.height, 4);
      ctx.fill();

      // Cardboard/Construction cutout body
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.width, b.height, 4);
      ctx.fill();

      // Inked contour
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Top paper fold highlight
      ctx.fillStyle = 'rgba(255, 253, 248, 0.35)';
      ctx.beginPath();
      ctx.roundRect(b.x + 2, b.y + 2, b.width - 4, 3, 2);
      ctx.fill();

      // Durable cracks or special icons
      if (b.type === 'durable') {
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        if (b.hp > 1) {
          ctx.strokeRect(b.x + 4, b.y + 4, b.width - 8, b.height - 8);
        } else {
          // Crinkle/crack fold line
          ctx.beginPath();
          ctx.moveTo(b.x + b.width / 2, b.y + 3);
          ctx.lineTo(b.x + b.width / 2 + 6, b.y + b.height / 2);
          ctx.lineTo(b.x + b.width / 2 - 4, b.y + b.height - 3);
          ctx.stroke();
        }
      } else if (b.type === 'bonus') {
        ctx.fillStyle = '#FFFDF8';
        ctx.font = 'bold 13px "Patrick Hand", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', b.x + b.width / 2, b.y + b.height / 2 + 1);
      } else if (b.type === 'life') {
        ctx.fillStyle = '#FFFDF8';
        ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♥', b.x + b.width / 2, b.y + b.height / 2 + 1);
      }

      ctx.restore();
    }

    // 3. Render Wooden Craft Paddle with Tape Strip Bumpers
    ctx.save();
    // Paddle shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.roundRect(this.paddle.x + 3, this.paddle.y + 3, this.paddle.width, this.paddle.height, 6);
    ctx.fill();

    // Wooden craft stick body
    ctx.fillStyle = '#C85A32';
    ctx.beginPath();
    ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 6);
    ctx.fill();

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wooden grain center strip
    ctx.fillStyle = '#E8DEC8';
    ctx.beginPath();
    ctx.roundRect(this.paddle.x + 14, this.paddle.y + 4, this.paddle.width - 28, 4, 2);
    ctx.fill();

    // Left tape bumper strip
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(this.paddle.x + 2, this.paddle.y + 1, 10, this.paddle.height - 2, 2);
    ctx.fill();
    ctx.stroke();

    // Right tape bumper strip
    ctx.beginPath();
    ctx.roundRect(this.paddle.x + this.paddle.width - 12, this.paddle.y + 1, 10, this.paddle.height - 2, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. Render Paper Ball with Inked Contour
    ctx.save();
    // Ball shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.arc(this.ball.x + 2, this.ball.y + 2, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball paper cutout
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Concentric paper ring
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    // Inked contour
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 5. Render Particles
    this.particles.render(ctx);

    // 6. Render Top HUD on Taped Kraft Placard
    ctx.save();
    // Cardboard placard background
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, 800, 48);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(800, 48);
    ctx.stroke();

    // Tape decorations on top bar
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(180, 2, 28, 12);
    ctx.strokeRect(180, 2, 28, 12);
    ctx.fillRect(380, 2, 28, 12);
    ctx.strokeRect(380, 2, 28, 12);
    ctx.fillRect(550, 2, 28, 12);
    ctx.strokeRect(550, 2, 28, 12);

    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#C85A32';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 20, 25);

    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`HIGH: ${this.gameState.highScore}`, 220, 25);

    ctx.fillStyle = '#3B82F6';
    ctx.fillText(`LEVEL: ${this.gameState.level}`, 420, 25);

    ctx.fillStyle = '#E11D48';
    let hearts = '';
    for (let i = 0; i < this.gameState.lives; i++) {
      hearts += '♥ ';
    }
    ctx.fillText(`LIVES: ${hearts}`, 590, 25);
    ctx.restore();

    // Launch hint
    if (!this.ball.launched && (this.gameState.status === 'playing' || this.gameState.status === 'ready')) {
      ctx.save();
      // Taped hint note
      const hintY = this.paddle.y - 35;
      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(260, hintY - 14, 280, 28, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.lineWidth = 1;
      ctx.fillRect(385, hintY - 18, 30, 8);
      ctx.strokeRect(385, hintY - 18, 30, 8);

      ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#3E2723';
      ctx.fillText('PRESS SPACE OR CLICK TO LAUNCH', 400, hintY);
      ctx.restore();
    }

    // Overlays
    if (this.gameState.status === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.85)';
      ctx.fillRect(0, 0, 800, 600);

      // Cardboard modal placard
      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(220, 180, 360, 220, 8);
      ctx.fill();
      ctx.stroke();

      // Top tape strip
      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.3)';
      ctx.lineWidth = 1;
      ctx.fillRect(360, 172, 80, 16);
      ctx.strokeRect(360, 172, 80, 16);

      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME PAUSED', 400, 250);

      ctx.fillStyle = '#3E2723';
      ctx.font = '18px "Comfortaa", cursive, sans-serif';
      ctx.fillText('Press ESC to Resume', 400, 320);
      ctx.restore();
    } else if (this.gameState.status === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.9)';
      ctx.fillRect(0, 0, 800, 600);

      // Cardboard game over placard
      ctx.fillStyle = '#FFFDF8';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(200, 140, 400, 300, 10);
      ctx.fill();
      ctx.stroke();

      // Top tape strips
      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.3)';
      ctx.lineWidth = 1;
      ctx.fillRect(250, 132, 60, 16);
      ctx.strokeRect(250, 132, 60, 16);
      ctx.fillRect(490, 132, 60, 16);
      ctx.strokeRect(490, 132, 60, 16);

      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GAME OVER', 400, 210);

      ctx.fillStyle = '#3E2723';
      ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, 400, 270);

      ctx.fillStyle = '#6A5D4D';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 310);

      // Button placard
      ctx.fillStyle = '#10B981';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(230, 350, 340, 48, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('PRESS SPACE OR CLICK TO PLAY AGAIN', 400, 375);
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
