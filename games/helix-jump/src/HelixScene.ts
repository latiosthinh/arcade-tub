import { GameScene } from '@arcade-carnival/game-engine';
import { GameState } from './GameState.js';
import { HelixRenderer } from './HelixRenderer.js';
import { HelixAudio } from './HelixAudio.js';
import { SplatterParticleSystem } from './SplatterParticles.js';

export class HelixScene implements GameScene {
  public width: number = 800;
  public height: number = 600;
  public gameState: GameState;
  public renderer: HelixRenderer;
  public audio: HelixAudio;
  public particles: SplatterParticleSystem;

  private isDragging: boolean = false;
  private lastDragX: number = 0;
  private isLeftDown: boolean = false;
  private isRightDown: boolean = false;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      canvas.width = this.width;
      canvas.height = this.height;
    }

    this.gameState = new GameState();
    this.renderer = new HelixRenderer();
    this.audio = new HelixAudio();
    this.particles = new SplatterParticleSystem();

    this.setupStateCallbacks();

    if (canvas) {
      this.initInputs(canvas);
    }
  }

  private setupStateCallbacks(): void {
    this.gameState.onScore = (event) => {
      if (event.reason === 'tier_pass') {
        this.audio.playPassTier(event.combo);
      } else if (event.reason === 'tier_smash') {
        this.audio.playSmash();
        // Emit debris particles from center
        this.particles.emitTierDebris(this.width / 2, this.gameState.droplet.y, '#E74C3C', 20);
      }
    };

    this.gameState.onGameOver = () => {
      this.audio.playHazardFail();
      this.particles.emitInkBurst(this.width / 2, this.gameState.droplet.y, '#E74C3C', 30, 1.5);
    };

    this.gameState.onVictory = () => {
      this.audio.playVictory();
      this.particles.emitInkBurst(this.width / 2, this.gameState.droplet.y, '#2ECC71', 40, 2);
    };
  }

  public initInputs(canvas: HTMLCanvasElement): void {
    // Keyboard handlers
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.isLeftDown = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.isRightDown = true;
      } else if (e.key === ' ' || e.key === 'Space') {
        this.handlePrimaryAction();
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.isLeftDown = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.isRightDown = false;
      }
    });

    // Mouse Drag handlers
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.isDragging = true;
      this.lastDragX = e.clientX;
      this.handlePrimaryAction();
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastDragX;
      this.lastDragX = e.clientX;
      // Convert pixel delta to rotation angle
      const deltaAngle = (dx / this.width) * Math.PI * 2.5;
      this.gameState.rotateTower(deltaAngle);
      this.gameState.applyRotationalImpulse(deltaAngle * 10);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch handlers
    canvas.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
          this.isDragging = true;
          this.lastDragX = touch.clientX;
          this.handlePrimaryAction();
        }
      },
      { passive: false }
    );

    canvas.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (!this.isDragging || !touch) return;
        const currentX = touch.clientX;
        const dx = currentX - this.lastDragX;
        this.lastDragX = currentX;
        const deltaAngle = (dx / this.width) * Math.PI * 2.5;
        this.gameState.rotateTower(deltaAngle);
        this.gameState.applyRotationalImpulse(deltaAngle * 10);
      },
      { passive: false }
    );

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  public handlePrimaryAction(): void {
    if (this.gameState.status === 'ready') {
      this.gameState.startLevel(this.gameState.currentLevel);
      this.audio.playBounce();
    } else if (this.gameState.status === 'gameover') {
      this.gameState.startLevel(1);
    } else if (this.gameState.status === 'victory') {
      this.gameState.startLevel(this.gameState.currentLevel + 1);
    }
  }

  public pause(): void {}
  public resume(): void {}

  public update(dt: number): void {
    // Keyboard continuous rotation
    const rotationSpeed = Math.PI * 2.2; // radians per second
    if (this.isLeftDown) {
      this.gameState.rotateTower(-rotationSpeed * dt);
    }
    if (this.isRightDown) {
      this.gameState.rotateTower(rotationSpeed * dt);
    }

    const prevDropY = this.gameState.droplet.y;
    const res = this.gameState.update(dt);

    // Audio trigger for normal safe bounce
    if (res && res.hit && !res.smashed && res.sectorType === 'safe') {
      this.audio.playBounce();
      // Add splatter onto tier
      if (res.tierIndex >= 0) {
        const tier = this.gameState.tiers[res.tierIndex];
        if (tier) {
          if (!tier.splatters) tier.splatters = [];
          tier.splatters.push({
            angle: (Math.PI * 0.5 - this.gameState.towerRotation) % (Math.PI * 2),
            radius: (this.gameState.towerGenerator.config.discOuterRadius + this.gameState.towerGenerator.config.cylinderRadius) / 2,
            color: '#E74C3C',
            size: 3 + Math.random() * 4
          });
        }
      }
    }

    this.particles.update(dt);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(ctx, this.gameState, this.particles, this.width, this.height);
  }
}
