import { Ship } from './Ship.js';
import { TrackHazardManager, TrackObstacle } from './TrackHazardManager.js';
import { HighwaySpeedPhysics } from './HighwaySpeedPhysics.js';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export class GameState {
  public status: GameStatus = 'ready';
  public score: number = 0;
  public highScore: number = 0;
  public distance: number = 0;
  public speed: number = 300;
  public gatesCleared: number = 0;
  public asteroidsDodged: number = 0;
  public nearMisses: number = 0;

  private readonly storageKey = 'arcade-carnival-space-racer-highscore';

  constructor() {
    this.loadHighScore();
  }

  public loadHighScore(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        this.highScore = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      }
    } catch {
      this.highScore = 0;
    }
  }

  public saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem(this.storageKey, this.highScore.toString());
      } catch {
        // Storage failure fallback
      }
    }
  }

  public start(): void {
    this.status = 'playing';
  }

  public pause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  public update(dt: number, ship: Ship, hazardManager: TrackHazardManager): void {
    if (this.status !== 'playing') return;

    // Update speed and distance
    this.speed = HighwaySpeedPhysics.calculateSpeed(this.distance, 300, 900, ship.isBoosting);
    const distanceDelta = this.speed * dt;
    this.distance += distanceDelta;

    // Distance points multiplied by speed multiplier
    const multiplier = HighwaySpeedPhysics.getSpeedMultiplier(this.speed);
    this.score += Math.round((distanceDelta / 10) * multiplier);

    // Update ship kinematics
    ship.update(dt);

    // Update obstacles
    hazardManager.update(dt, this.speed);

    // Check collisions
    const collisionResults = hazardManager.checkCollisions(ship);
    for (const result of collisionResults) {
      this.processCollision(result.obstacle, ship);
    }

    // Check near misses for obstacles passing camera
    for (const obs of hazardManager.getObstacles()) {
      if (!obs.cleared && !obs.collided && obs.z <= 0.05 && obs.z >= -0.05) {
        if (obs.type !== 'boost-ring') {
          const isNearMiss = HighwaySpeedPhysics.checkNearMiss(
            ship.x,
            ship.width,
            obs.x,
            obs.radius * 2,
            obs.z
          );
          if (isNearMiss) {
            obs.cleared = true;
            this.addNearMiss();
          }
        }
      }
    }
  }

  public processCollision(obstacle: TrackObstacle, ship: Ship): void {
    if (obstacle.type === 'boost-ring') {
      this.gatesCleared++;
      const boostBonus = 500 * HighwaySpeedPhysics.getSpeedMultiplier(this.speed);
      this.score += Math.round(boostBonus);
      ship.activateBoost(3.0);
      ship.repairShield(1);
    } else {
      // Asteroid or plasma mine
      const dmg = obstacle.type === 'plasma-mine' ? 2 : 1;
      const tookDamage = ship.takeDamage(dmg);
      if (tookDamage && ship.shieldHp <= 0) {
        this.triggerGameOver();
      }
    }
  }

  public addNearMiss(): void {
    this.nearMisses++;
    this.asteroidsDodged++;
    const bonus = 150 * HighwaySpeedPhysics.getSpeedMultiplier(this.speed);
    this.score += Math.round(bonus);
  }

  public triggerGameOver(): void {
    this.status = 'gameover';
    this.saveHighScore();
  }

  public restart(ship: Ship, hazardManager: TrackHazardManager): void {
    this.status = 'playing';
    this.score = 0;
    this.distance = 0;
    this.speed = 300;
    this.gatesCleared = 0;
    this.asteroidsDodged = 0;
    this.nearMisses = 0;
    ship.reset();
    hazardManager.clear();
  }
}
