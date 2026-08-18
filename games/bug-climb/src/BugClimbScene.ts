import { GameScene } from '@arcade-carnival/game-engine';
import { TreeTrunk } from './TreeTrunk';
import { BugClimber, ClimberSide } from './BugClimber';
import { UrgentTimer } from './UrgentTimer';
import { GameState } from './GameState';
import { ParticleSystem } from './Particles';
import { ClimbAudio } from './ClimbAudio';
import { TreeRenderer } from './TreeRenderer';

export class BugClimbScene implements GameScene {
  public trunk: TreeTrunk;
  public climber: BugClimber;
  public timer: UrgentTimer;
  public gameState: GameState;
  public particles: ParticleSystem;
  public audio: ClimbAudio;
  public renderer: TreeRenderer;

  private canvas: HTMLCanvasElement;
  private urgentPulseTimer = 0;
  private autoClimbTimer = 0;
  private isSpeedBoostActive = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.trunk = new TreeTrunk();
    this.climber = new BugClimber();
    this.timer = new UrgentTimer();
    this.gameState = new GameState();
    this.particles = new ParticleSystem(250);
    this.audio = new ClimbAudio();
    this.renderer = new TreeRenderer();

    this.setupInput();
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKeyUp(e);
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      this.handlePointerDown(e);
    });
  }

  public handleKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      this.isSpeedBoostActive = false;
    }
  }

  public handleKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space' && this.gameState.status === 'playing') {
      this.isSpeedBoostActive = true;
    }

    if (e.repeat) return;

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (this.gameState.status === 'playing') {
        this.gameState.pause();
      } else if (this.gameState.status === 'paused') {
        this.gameState.resume();
      }
      return;
    }

    if (this.gameState.status === 'ready') {
      this.startGame();
      return;
    }

    if (this.gameState.status === 'gameover') {
      if (e.key === ' ' || e.key === 'Enter') {
        this.restartGame();
      }
      return;
    }

    if (this.gameState.status === 'playing') {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.climbStep(ClimberSide.LEFT);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.climbStep(ClimberSide.RIGHT);
      }
    }
  }

  public handlePointerDown(e: PointerEvent): void {
    if (this.gameState.status === 'ready') {
      this.startGame();
      return;
    }

    if (this.gameState.status === 'paused') {
      this.gameState.resume();
      return;
    }

    if (this.gameState.status === 'gameover') {
      this.restartGame();
      return;
    }

    if (this.gameState.status === 'playing') {
      // Determine left or right screen tap using client rect normalized coordinates (T-23-05)
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const midX = rect.width / 2;

      if (clickX < midX) {
        this.climbStep(ClimberSide.LEFT);
      } else {
        this.climbStep(ClimberSide.RIGHT);
      }
    }
  }

  public startGame(): void {
    this.trunk.reset();
    this.climber.reset();
    this.timer.reset();
    this.particles.reset();
    this.autoClimbTimer = 0;
    this.isSpeedBoostActive = false;
    this.gameState.startGame();
    this.audio.playStep('LEFT');
  }

  public restartGame(): void {
    this.trunk.reset();
    this.climber.reset();
    this.timer.reset();
    this.particles.reset();
    this.autoClimbTimer = 0;
    this.isSpeedBoostActive = false;
    this.gameState.reset();
    this.gameState.startGame();
    this.audio.playStep('LEFT');
  }

  private climbStep(side: ClimberSide): void {
    const res = this.climber.climb(side, this.trunk);

    if (res.collided) {
      const bugX = side === ClimberSide.LEFT ? TreeRenderer.CLIMBER_LEFT_X : TreeRenderer.CLIMBER_RIGHT_X;
      this.particles.emitCrashBurst(bugX, TreeRenderer.CLIMBER_BASE_Y - 35);
      this.audio.playCrash();
      this.gameState.endGame('collision');
      return;
    }

    // Success climb step
    this.gameState.addClimbScore();
    this.timer.addStepBonus();

    const bugX = side === ClimberSide.LEFT ? TreeRenderer.CLIMBER_LEFT_X : TreeRenderer.CLIMBER_RIGHT_X;
    this.particles.emitWoodChips(bugX, TreeRenderer.CLIMBER_BASE_Y - 10, side, 10);
    this.particles.emitLeaves(TreeRenderer.TRUNK_X, TreeRenderer.CLIMBER_BASE_Y - 40, 4);

    this.audio.playStep(side);
    this.audio.playChop();

    if (this.gameState.multiplier > 1) {
      this.particles.emitStreakSparkles(bugX, TreeRenderer.CLIMBER_BASE_Y - 50, 6);
      this.audio.playComboChime(this.gameState.multiplier);
    }
  }

  public update(dt: number): void {
    // Prevent huge frame delta catchup spikes (T-23-04)
    const validDt = Math.min(Math.max(0, dt), 0.1);

    this.climber.update(validDt);
    this.particles.update(validDt);

    if (this.gameState.status === 'playing') {
      this.gameState.update(validDt);

      const autoStepInterval = this.isSpeedBoostActive ? 0.22 : 0.55;
      this.autoClimbTimer += validDt;
      if (this.autoClimbTimer >= autoStepInterval) {
        this.autoClimbTimer = 0;
        this.climbStep(this.climber.side);
      }

      if (this.gameState.status === 'playing') {
        const timerRes = this.timer.update(validDt, this.gameState.altitude);
        if (timerRes.expired) {
          this.audio.playCrash();
          this.gameState.endGame('timeout');
        } else if (timerRes.isUrgent) {
          this.urgentPulseTimer += validDt;
          if (this.urgentPulseTimer > 0.3) {
            this.urgentPulseTimer = 0;
            this.audio.playUrgentTick();
          }
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(
      ctx,
      this.trunk,
      this.climber,
      this.timer,
      this.gameState,
      this.particles
    );
  }

  public pause(): void {
    this.gameState.pause();
  }

  public resume(): void {
    this.gameState.resume();
  }
}
