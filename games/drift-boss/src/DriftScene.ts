import { GameScene } from '@arcade-carnival/game-engine';
import { TrackGenerator } from './TrackGenerator.js';
import { CarPhysics } from './CarPhysics.js';
import { CollisionDetector } from './CollisionDetector.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';
import { DriftAudio } from './DriftAudio.js';
import { DriftRenderer } from './DriftRenderer.js';

export class DriftScene implements GameScene {
  private width = 800;
  private height = 600;
  public track: TrackGenerator;
  public car: CarPhysics;
  public gameState: GameState;
  public particles: ParticleSystem;
  public audio: DriftAudio;
  public renderer: DriftRenderer;

  private isHoldingTurnRight = false;
  private cameraX = 0;
  private cameraY = 0;
  private gameTime = 0;
  private fallTimer = 0;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      canvas.width = this.width;
      canvas.height = this.height;
    }
    this.track = new TrackGenerator({ maxActiveTiles: 30 });
    this.car = new CarPhysics();
    this.gameState = new GameState();
    this.particles = new ParticleSystem(200);
    this.audio = new DriftAudio();
    this.renderer = new DriftRenderer();

    if (canvas) {
      this.initInputs(canvas);
    }
  }

  public initInputs(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space' || e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        if (!this.isHoldingTurnRight) {
          this.handleTurnRightStart();
        }
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space' || e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        this.handleTurnRightEnd();
      }
    });

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault();
      this.handleTurnRightStart();
    });

    window.addEventListener('mouseup', () => {
      this.handleTurnRightEnd();
    });

    canvas.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        e.preventDefault();
        this.handleTurnRightStart();
      },
      { passive: false }
    );

    window.addEventListener('touchend', () => {
      this.handleTurnRightEnd();
    });
  }

  public handleTurnRightStart(): void {
    if (this.gameState.status === 'ready') {
      this.gameState.start();
      this.isHoldingTurnRight = true;
      this.audio.startDriftSqueal();
    } else if (this.gameState.status === 'playing') {
      this.isHoldingTurnRight = true;
      this.audio.startDriftSqueal();
    } else if (this.gameState.status === 'gameover') {
      this.reset();
    }
  }

  public handleTurnRightEnd(): void {
    if (this.gameState.status === 'playing') {
      this.isHoldingTurnRight = false;
      this.audio.startDriftSqueal();
    }
  }

  public reset(): void {
    this.gameState.reset();
    this.track.reset();
    this.car.reset();
    this.particles.reset();
    this.isHoldingTurnRight = false;
    this.fallTimer = 0;
    this.audio.stopDriftSqueal();
  }

  public pause(): void {
    this.audio.stopDriftSqueal();
  }

  public resume(): void {
    // Resume audio context if needed
  }

  public update(dt: number): void {
    this.gameTime += dt;
    this.particles.update(dt);

    if (this.gameState.status === 'playing') {
      // Step car physics
      this.car.update(dt, this.isHoldingTurnRight);
      const carState = this.car.getState();

      // Distance score increment
      this.gameState.addScore(carState.speed * dt * 2.5);
      this.gameState.updateCombo(dt);

      // Track progression & culling
      const playerDistance = carState.x + carState.y;
      this.track.cullBehind(playerDistance);

      // Spawn drift tire smoke
      const screenPos = this.renderer.toScreen(carState.x, carState.y, carState.z);
      this.particles.emitDriftDust(screenPos.screenX, screenPos.screenY);

      // Check coins
      for (const coin of this.track.getCoins()) {
        if (CollisionDetector.checkCoinOverlap(carState.x, carState.y, coin)) {
          this.track.removeCoin(coin.id);
          this.gameState.collectCoin(coin.value);
          this.particles.emitCoinSparkles(screenPos.screenX, screenPos.screenY);
          this.audio.playCoinChime();
        }
      }

      // Check ramps
      for (const tile of this.track.getTiles()) {
        if (tile.isRamp && !carState.isJumping && CollisionDetector.isPointOnTile(carState.x, carState.y, tile)) {
          this.car.launchJump(6.5);
          this.audio.playJumpWhoosh();
          break;
        }
      }

      // Check on-track collision if not airborne
      if (!carState.isJumping) {
        const onTrack = CollisionDetector.checkOnTrack(carState.x, carState.y, this.track.getTiles());
        if (!onTrack) {
          // Off-road: trigger fall
          this.car.startFalling();
          this.gameState.triggerFall();
          this.audio.stopDriftSqueal();
          this.audio.playCardboardCrash();
          this.particles.emitCardboardCrash(screenPos.screenX, screenPos.screenY);
        }
      }
    } else if (this.gameState.status === 'falling') {
      this.car.update(dt, this.isHoldingTurnRight);
      this.fallTimer += dt;
      if (this.fallTimer > 0.8) {
        this.gameState.gameOver();
      }
    }

    // Camera smoothly follows car center in isometric coordinates
    const targetScreen = this.renderer.toScreen(this.car.getState().x, this.car.getState().y, 0);
    const targetCamX = targetScreen.screenX - this.width / 2;
    const targetCamY = targetScreen.screenY - this.height / 2;
    this.cameraX += (targetCamX - this.cameraX) * Math.min(1, 8.0 * dt);
    this.cameraY += (targetCamY - this.cameraY) * Math.min(1, 8.0 * dt);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Storybook craft background
    this.renderer.renderBackground(ctx, this.width, this.height);

    // 2. Cardboard track
    this.renderer.renderTrack(ctx, this.track.getTiles(), this.cameraX, this.cameraY);

    // 3. Gold paper coins
    this.renderer.renderCoins(ctx, this.track.getCoins(), this.cameraX, this.cameraY, this.gameTime);

    // 4. Car
    if (this.gameState.status !== 'gameover') {
      this.renderer.renderCar(ctx, this.car.getState(), this.cameraX, this.cameraY);
    }

    // 5. Particles
    ctx.save();
    ctx.translate(-this.cameraX, -this.cameraY);
    this.particles.render(ctx);
    ctx.restore();

    // 6. HUD / UI overlay
    this.renderer.renderHUD(ctx, this.width, this.height, this.gameState);
  }
}
