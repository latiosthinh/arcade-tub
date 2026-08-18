import { BirdPhysics, EggBlock } from './BirdPhysics.js';
import { ObstacleGenerator, Obstacle } from './ObstacleGenerator.js';

export type GameStatus = 'ready' | 'playing' | 'gameover' | 'victory';

export interface ScoreEvent {
  points: number;
  reason: 'egg_lay' | 'obstacle_clear' | 'perfect_clear' | 'fever_rush' | 'victory';
  multiplier: number;
}

export interface CrashEvent {
  obstacle: Obstacle;
  eggsLost: number;
  birdCrashed: boolean;
}

export class GameState {
  public status: GameStatus;
  public score: number;
  public highScore: number;
  public currentLevel: number;
  public distanceTraveled: number;
  public totalDistance: number;
  public groundY: number;

  public feverGauge: number; // 0 to 100
  public isFever: boolean;
  public feverTimer: number; // seconds remaining
  public perfectStreak: number;

  public bird: BirdPhysics;
  public generator: ObstacleGenerator;
  public obstacles: Obstacle[];

  public onScore?: (event: ScoreEvent) => void;
  public onEggLay?: (egg: EggBlock) => void;
  public onCrash?: (event: CrashEvent) => void;
  public onFeverStart?: () => void;
  public onFeverEnd?: () => void;
  public onGameOver?: () => void;
  public onVictory?: () => void;

  constructor() {
    this.status = 'ready';
    this.score = 0;
    this.highScore = 0;
    this.currentLevel = 1;
    this.distanceTraveled = 0;
    this.totalDistance = 5000;
    this.groundY = 460;

    this.feverGauge = 0;
    this.isFever = false;
    this.feverTimer = 0;
    this.perfectStreak = 0;

    this.bird = new BirdPhysics();
    this.generator = new ObstacleGenerator({
      defaultGroundY: this.groundY,
      levelDistance: this.totalDistance
    });
    this.obstacles = [];
    this.bird.reset(this.groundY);
  }

  public startLevel(level: number = 1): void {
    this.currentLevel = level;
    this.status = 'playing';
    this.distanceTraveled = 0;
    this.totalDistance = 4000 + level * 1000;
    this.feverGauge = 0;
    this.isFever = false;
    this.feverTimer = 0;
    this.perfectStreak = 0;

    this.generator.config.levelDistance = this.totalDistance;
    this.obstacles = this.generator.generateLevel(level);
    this.bird.reset(this.groundY);
  }

  public layEgg(): boolean {
    if (this.status !== 'playing') return false;
    if (this.isFever) return false; // In fever mode, eggs not needed

    const egg = this.bird.layEgg();
    this.score += 5;
    if (this.score > this.highScore) this.highScore = this.score;

    if (this.onEggLay) this.onEggLay(egg);
    if (this.onScore) {
      this.onScore({
        points: 5,
        reason: 'egg_lay',
        multiplier: 1
      });
    }
    return true;
  }

  public activateFever(): void {
    this.isFever = true;
    this.feverTimer = 5.0; // 5 seconds of fiery invincible sprint
    this.feverGauge = 100;
    if (this.onFeverStart) this.onFeverStart();
  }

  public update(dt: number): void {
    if (this.status !== 'playing') return;

    // Fever timer handling
    if (this.isFever) {
      this.feverTimer -= dt;
      this.feverGauge = Math.max(0, (this.feverTimer / 5.0) * 100);

      // Passive fever score
      this.score += Math.round(dt * 50);
      if (this.score > this.highScore) this.highScore = this.score;

      if (this.feverTimer <= 0) {
        this.isFever = false;
        this.feverGauge = 0;
        this.perfectStreak = 0;
        if (this.onFeverEnd) this.onFeverEnd();
      }
    }

    const currentSpeed = this.isFever ? this.bird.config.feverSpeed : this.bird.config.runSpeed;
    const distanceDelta = currentSpeed * dt;
    this.distanceTraveled += distanceDelta;

    // Check Victory
    if (this.distanceTraveled >= this.totalDistance) {
      this.status = 'victory';
      const bonus = 1000 + this.bird.eggs.length * 50;
      this.score += bonus;
      if (this.score > this.highScore) this.highScore = this.score;
      if (this.onVictory) this.onVictory();
      return;
    }

    // Determine ground level under bird position
    // If bird is riding atop an obstacle platform, ground adjusts
    let currentGroundY = this.groundY;
    const birdWorldX = this.distanceTraveled + this.bird.x;
    const birdRightWorldX = birdWorldX + this.bird.size;

    for (const obs of this.obstacles) {
      const obsTop = obs.groundY - obs.height;
      if (birdRightWorldX > obs.x && birdWorldX < obs.x + obs.width) {
        // If bird/eggs stack is above or on obstacle top
        if (this.bird.getBottomY() <= obsTop + 4) {
          currentGroundY = obsTop;
        }
      }
    }

    // Update bird vertical physics
    this.bird.update(dt, currentGroundY);

    // Collision Detection with Obstacles
    const birdBox = {
      left: birdWorldX,
      right: birdRightWorldX,
      top: this.bird.y,
      bottom: this.bird.y + this.bird.size
    };

    for (const obs of this.obstacles) {
      const obsBox = {
        left: obs.x,
        right: obs.x + obs.width,
        top: obs.groundY - obs.height,
        bottom: obs.groundY
      };

      // Check overlap in X axis
      if (birdBox.right > obsBox.left && birdBox.left < obsBox.right) {
        if (this.isFever) {
          // Smash obstacle during fever
          if (!obs.passed) {
            obs.passed = true;
            this.score += 100;
            if (this.score > this.highScore) this.highScore = this.score;
            if (this.onCrash) {
              this.onCrash({
                obstacle: obs,
                eggsLost: 0,
                birdCrashed: false
              });
            }
          }
          continue;
        }

        // Check head collision (Bird body vs obstacle)
        if (birdBox.bottom > obsBox.top && birdBox.top < obsBox.bottom) {
          // Bird head hit obstacle directly -> Instant Death
          this.status = 'gameover';
          if (this.onCrash) {
            this.onCrash({
              obstacle: obs,
              eggsLost: this.bird.eggs.length,
              birdCrashed: true
            });
          }
          if (this.onGameOver) this.onGameOver();
          return;
        }

        // Check egg stack collisions
        if (this.bird.eggs.length > 0) {
          let eggsHitCount = 0;
          for (const egg of this.bird.eggs) {
            const eggTop = egg.y;
            const eggBottom = egg.y + egg.size;
            if (eggBottom > obsBox.top && eggTop < obsBox.bottom) {
              eggsHitCount++;
            }
          }

          if (eggsHitCount > 0) {
            this.bird.removeBottomEggs(eggsHitCount);
            if (this.onCrash) {
              this.onCrash({
                obstacle: obs,
                eggsLost: eggsHitCount,
                birdCrashed: false
              });
            }
          }
        }
      }

      // Check passed & Perfect Landing Evaluation
      if (!obs.passed && birdBox.left >= obsBox.right) {
        obs.passed = true;
        const clearanceGap = (obsBox.top - birdBox.bottom); // How close bird base was to obstacle top

        // Perfect landing: base of bird was at exact height (tolerance <= 10px above obstacle)
        const isPerfect = Math.abs(clearanceGap) <= 12;

        if (isPerfect) {
          this.perfectStreak++;
          const perfectBonus = 50 * this.perfectStreak;
          this.score += perfectBonus;
          this.feverGauge = Math.min(100, this.feverGauge + 34); // 3 perfect landings triggers fever!

          if (this.onScore) {
            this.onScore({
              points: perfectBonus,
              reason: 'perfect_clear',
              multiplier: this.perfectStreak
            });
          }

          if (this.feverGauge >= 100 && !this.isFever) {
            this.activateFever();
          }
        } else {
          // Normal clear
          this.score += 20;
          this.feverGauge = Math.max(0, this.feverGauge - 10);
          this.perfectStreak = 0;

          if (this.onScore) {
            this.onScore({
              points: 20,
              reason: 'obstacle_clear',
              multiplier: 1
            });
          }
        }

        if (this.score > this.highScore) {
          this.highScore = this.score;
        }
      }
    }
  }

  public getProgress(): number {
    if (this.totalDistance <= 0) return 1;
    return Math.min(1, Math.max(0, this.distanceTraveled / this.totalDistance));
  }
}
