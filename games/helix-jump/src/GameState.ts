import { TowerGenerator, PlatformTier, TowerConfig } from './TowerGenerator.js';
import { DropletPhysics } from './DropletPhysics.js';
import { CollisionDetector, CollisionResult } from './CollisionDetector.js';

export type GameStatus = 'ready' | 'playing' | 'gameover' | 'victory';

export interface ScoreEvent {
  points: number;
  combo: number;
  multiplier: number;
  reason: 'tier_pass' | 'tier_smash' | 'bounce';
}

export class GameState {
  public status: GameStatus;
  public score: number;
  public highScore: number;
  public currentLevel: number;
  public towerRotation: number;
  public rotationVelocity: number;
  public tiers: PlatformTier[];
  public droplet: DropletPhysics;
  public towerGenerator: TowerGenerator;
  public passedTiersCount: number;
  public totalTiersCount: number;
  public cameraY: number;

  public onScore?: (event: ScoreEvent) => void;
  public onGameOver?: () => void;
  public onVictory?: () => void;

  constructor(towerConfig: Partial<TowerConfig> = {}) {
    this.status = 'ready';
    this.score = 0;
    this.highScore = 0;
    this.currentLevel = 1;
    this.towerRotation = 0;
    this.rotationVelocity = 0;
    this.passedTiersCount = 0;
    this.cameraY = 0;

    this.towerGenerator = new TowerGenerator(towerConfig);
    this.tiers = this.towerGenerator.generate(1000 + this.currentLevel);
    this.totalTiersCount = this.tiers.length;
    this.droplet = new DropletPhysics();
    this.droplet.reset(0);
  }

  public startLevel(level: number = 1): void {
    this.currentLevel = level;
    this.status = 'playing';
    this.towerRotation = 0;
    this.rotationVelocity = 0;
    this.passedTiersCount = 0;
    this.tiers = this.towerGenerator.generate(1000 + level * 77);
    this.totalTiersCount = this.tiers.length;
    this.droplet.reset(0);
    this.cameraY = 0;
  }

  public rotateTower(deltaRadians: number): void {
    if (this.status !== 'playing' && this.status !== 'ready') return;
    this.towerRotation = (this.towerRotation + deltaRadians) % (Math.PI * 2);
    if (this.towerRotation < 0) this.towerRotation += Math.PI * 2;
  }

  public applyRotationalImpulse(velocity: number): void {
    if (this.status !== 'playing' && this.status !== 'ready') return;
    this.rotationVelocity = velocity;
  }

  public update(dt: number): CollisionResult | null {
    if (this.status === 'ready') {
      // Idle bounce on tier 0
      const prevY = this.droplet.y;
      this.droplet.update(dt);
      if (this.droplet.vy > 0 && this.droplet.y + this.droplet.config.radius >= 0) {
        this.droplet.bounce(0);
      }
      return null;
    }

    if (this.status !== 'playing') return null;

    // Apply inertia / damping to rotation velocity
    if (Math.abs(this.rotationVelocity) > 0.001) {
      this.rotateTower(this.rotationVelocity * dt);
      this.rotationVelocity *= Math.pow(0.05, dt); // smooth friction damping
    }

    const previousY = this.droplet.y;
    this.droplet.update(dt);

    // Smooth camera track droplet
    const targetCamY = this.droplet.y - 140;
    this.cameraY += (targetCamY - this.cameraY) * Math.min(1, dt * 10);

    // Collision detection
    const result = CollisionDetector.checkCollision(
      this.droplet,
      previousY,
      this.tiers,
      this.towerRotation
    );

    if (result.tierIndex >= 0) {
      if (result.smashed) {
        // Multi-tier smash bonus
        const multiplier = Math.max(1, this.droplet.comboStreak);
        const points = 50 * multiplier;
        this.score += points;
        if (this.score > this.highScore) this.highScore = this.score;

        if (this.onScore) {
          this.onScore({
            points,
            combo: this.droplet.comboStreak,
            multiplier,
            reason: 'tier_smash'
          });
        }
      } else if (result.hit) {
        if (result.sectorType === 'hazard') {
          // Hit hazard -> Game Over
          this.status = 'gameover';
          if (this.onGameOver) this.onGameOver();
        } else {
          // Safe bounce
          this.droplet.bounce(this.tiers[result.tierIndex].y);

          // Check if reached goal (last tier)
          if (result.tierIndex === this.tiers.length - 1) {
            this.status = 'victory';
            this.score += 500;
            if (this.score > this.highScore) this.highScore = this.score;
            if (this.onVictory) this.onVictory();
          } else {
            // Safe land gives combo points if coming from high drop
            if (this.droplet.comboStreak > 0) {
              const pts = this.droplet.comboStreak * 20;
              this.score += pts;
              if (this.score > this.highScore) this.highScore = this.score;
            }
          }
        }
      } else if (result.sectorType === 'gap') {
        // Count passed tier
        this.passedTiersCount = Math.max(this.passedTiersCount, result.tierIndex + 1);
        const pts = 10 * Math.max(1, this.droplet.comboStreak);
        this.score += pts;
        if (this.score > this.highScore) this.highScore = this.score;

        if (this.onScore) {
          this.onScore({
            points: pts,
            combo: this.droplet.comboStreak,
            multiplier: Math.max(1, this.droplet.comboStreak),
            reason: 'tier_pass'
          });
        }
      }
    }

    return result;
  }

  public getProgress(): number {
    if (this.totalTiersCount <= 1) return 1;
    const currentY = Math.max(0, this.droplet.y);
    const maxY = (this.totalTiersCount - 1) * this.towerGenerator.config.tierSpacing;
    return Math.min(1, Math.max(0, currentY / maxY));
  }
}
