import { RollPhysics, PaperLayer } from './RollPhysics.js';
import { TrackGenerator, LevelTrack, TrackPickup, TrackObstacle, FinishRibbon } from './TrackGenerator.js';

export type GameStatus = 'ready' | 'playing' | 'gameover' | 'victory';

export interface PickupEvent {
  pickup: TrackPickup;
  layer: PaperLayer;
  currentRadius: number;
}

export interface TrimEvent {
  obstacle: TrackObstacle;
  layersLost: number;
  remainingLayers: number;
}

export interface CutRibbonEvent {
  ribbon: FinishRibbon;
  multiplier: number;
  totalScore: number;
}

export class GameState {
  public status: GameStatus = 'ready';
  public currentLevel: number = 1;
  public score: number = 0;
  public roll: RollPhysics;
  public generator: TrackGenerator;
  public track: LevelTrack;
  public highestMultiplier: number = 1.0;
  public finalScore: number = 0;
  public finishRollProgress: number = 0;
  public ribbonCutCount: number = 0;

  // Callbacks for sound and particle triggers
  public onPickup?: (e: PickupEvent) => void;
  public onTrim?: (e: TrimEvent) => void;
  public onCutRibbon?: (e: CutRibbonEvent) => void;
  public onGameOver?: () => void;
  public onVictory?: () => void;

  constructor() {
    this.roll = new RollPhysics();
    this.generator = new TrackGenerator();
    this.track = this.generator.generateLevel(1);
  }

  public startLevel(level: number = 1): void {
    this.currentLevel = level;
    this.status = 'playing';
    this.score = 0;
    this.finalScore = 0;
    this.highestMultiplier = 1.0;
    this.finishRollProgress = 0;
    this.ribbonCutCount = 0;

    this.roll.reset();
    this.track = this.generator.generateLevel(level, Date.now() % 100000);
  }

  public steer(dir: number): void {
    if (this.status === 'playing') {
      this.roll.steer(dir);
    }
  }

  public setLateralTarget(x: number): void {
    if (this.status === 'playing') {
      this.roll.setLateralPosition(x);
    }
  }

  public update(dt: number): void {
    if (this.status !== 'playing' && this.status !== 'victory') return;

    if (this.status === 'playing') {
      // Update oscillating obstacles
      const now = Date.now() / 1000;
      for (const obs of this.track.obstacles) {
        if (obs.oscillating && obs.baseX !== undefined && obs.oscSpeed && obs.oscRange) {
          obs.x = obs.baseX + Math.sin(now * obs.oscSpeed + obs.id) * obs.oscRange;
        }
      }

      this.roll.update(dt, true);

      // Check collision with pickups
      this.checkPickupCollisions();

      // Check collision with obstacles
      this.checkObstacleCollisions();

      // Check if reached finish line / ribbons
      this.checkFinishLine(dt);
    } else if (this.status === 'victory') {
      // Slow unraveling coast at victory
      if (this.roll.forwardSpeed > 0) {
        this.roll.forwardSpeed = Math.max(0, this.roll.forwardSpeed - 200 * dt);
        this.roll.update(dt, true);
      }
    }
  }

  private checkPickupCollisions(): void {
    const rollX = this.roll.x;
    const rollZ = this.roll.z;
    const rollW = this.roll.width;
    const rollR = this.roll.getRadius();

    for (const p of this.track.pickups) {
      if (p.collected) continue;

      // Check bounding box overlap in (X, Z)
      const xOverlap = Math.abs(rollX - p.x) < (rollW + p.width) / 2;
      const zOverlap = Math.abs(rollZ - p.z) < (rollR + p.length / 2);

      if (xOverlap && zOverlap) {
        p.collected = true;
        this.roll.addLayer(p.layer);
        this.score += p.layer.scoreValue;

        this.onPickup?.({
          pickup: p,
          layer: p.layer,
          currentRadius: this.roll.getRadius()
        });
      }
    }
  }

  private checkObstacleCollisions(): void {
    const rollX = this.roll.x;
    const rollZ = this.roll.z;
    const rollW = this.roll.width;
    const rollR = this.roll.getRadius();

    for (const obs of this.track.obstacles) {
      if (!obs.active) continue;

      const xOverlap = Math.abs(rollX - obs.x) < (rollW + obs.width) / 2;
      const zOverlap = Math.abs(rollZ - obs.z) < (rollR + obs.depth / 2);

      if (xOverlap && zOverlap) {
        obs.active = false; // hit once

        const removed = this.roll.removeOutermostLayers(obs.damageLayers);
        const layersLost = removed.length;

        this.onTrim?.({
          obstacle: obs,
          layersLost,
          remainingLayers: this.roll.layers.length
        });

        // If roll has no layers left, game over
        if (this.roll.layers.length === 0) {
          this.status = 'gameover';
          this.onGameOver?.();
          return;
        }
      }
    }
  }

  private checkFinishLine(dt: number): void {
    const rollZ = this.roll.z;
    const rollR = this.roll.getRadius();

    // Check ribbon cuts
    for (const ribbon of this.track.finishRibbons) {
      if (!ribbon.cut && rollZ + rollR >= ribbon.z) {
        // Can cut ribbon if player still has layers
        if (this.roll.layers.length > 1 || (this.roll.layers.length === 1 && this.roll.layers[0].name !== 'cardboard-core')) {
          // Cutting a ribbon sheds 1 layer or cost
          ribbon.cut = true;
          this.ribbonCutCount++;
          this.highestMultiplier = ribbon.multiplier;
          this.roll.removeOutermostLayers(1);

          this.onCutRibbon?.({
            ribbon,
            multiplier: ribbon.multiplier,
            totalScore: Math.floor(this.score * ribbon.multiplier)
          });
        } else {
          // Roll stopped by ribbon because out of layers
          this.finishLevel();
          return;
        }
      }
    }

    // If passed all ribbons
    const lastRibbon = this.track.finishRibbons[this.track.finishRibbons.length - 1];
    if (lastRibbon && lastRibbon.cut && (rollZ >= lastRibbon.z || this.track.finishRibbons.every(r => r.cut))) {
      this.finishLevel();
    }
  }

  public finishLevel(): void {
    this.status = 'victory';
    this.finalScore = Math.floor(this.score * this.highestMultiplier);
    this.onVictory?.();
  }
}
