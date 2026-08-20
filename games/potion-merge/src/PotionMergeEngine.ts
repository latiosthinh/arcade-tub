import { FlaskPhysics, PotionBody } from './FlaskPhysics.js';
import { GameState, GEM_TIERS } from './GameState.js';

export interface DropGuide {
  x: number;
  tier: number;
  radius: number;
}

export class PotionMergeEngine {
  public physics: FlaskPhysics;
  public state: GameState;
  public dropperX: number = 400;
  public dropperSpeed: number = 380;
  public canDrop: boolean = true;
  public dropCooldown: number = 0;
  private readonly defaultCooldown = 0.55;

  constructor(physics?: FlaskPhysics, state?: GameState) {
    this.physics = physics || new FlaskPhysics();
    this.state = state || new GameState();
  }

  public moveDropper(targetX: number): void {
    const tierDef = GEM_TIERS[this.state.currentTier - 1] || GEM_TIERS[0];
    const minX = this.physics.flaskLeft + tierDef.radius + 4;
    const maxX = this.physics.flaskRight - tierDef.radius - 4;
    this.dropperX = Math.max(minX, Math.min(maxX, targetX));
  }

  public shiftDropper(dx: number, dt: number): void {
    this.moveDropper(this.dropperX + dx * this.dropperSpeed * dt);
  }

  public dropPotion(): PotionBody | null {
    if (!this.canDrop || this.state.status !== 'playing') {
      return null;
    }

    const dropped = this.physics.addPotion(
      this.dropperX,
      this.physics.dangerCeilingY - 20,
      this.state.currentTier,
      0,
      40
    );

    this.state.rollCurrentPotion();
    this.canDrop = false;
    this.dropCooldown = this.defaultCooldown;
    return dropped;
  }

  public update(dt: number): { mergedTier: number; x: number; y: number }[] {
    if (this.state.status !== 'playing') {
      return [];
    }

    if (!this.canDrop) {
      this.dropCooldown -= dt;
      if (this.dropCooldown <= 0) {
        this.canDrop = true;
      }
    }

    const mergeEvents = this.physics.update(dt);
    for (const evt of mergeEvents) {
      this.state.recordMerge(evt.mergedTier);
    }

    const isOverflowing = this.physics.checkOverflow();
    this.state.update(dt, isOverflowing);

    return mergeEvents;
  }

  public reset(): void {
    this.physics.clear();
    this.state.start();
    this.dropperX = 400;
    this.canDrop = true;
    this.dropCooldown = 0;
  }
}
