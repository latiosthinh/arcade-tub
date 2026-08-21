import { Direction, InhaleCone, MouthContent, Rect } from './types';
import { TileMap } from './TileMap';
import { KirbyPhysics } from './KirbyPhysics';
import { ProjectileManager } from './Projectile';

export const MAX_FLOAT_PUFFS = 6;
export const INHALE_REACH = 80;
export const INHALE_WIDTH = 40;
export const SLIDE_DURATION = 0.3; // 300ms
export const SLIDE_SPEED = 220;

export class KirbyActions {
  isInhaling = false;
  isFloating = false;
  isSliding = false;
  floatPuffCount = 0;
  slideTimer = 0;
  mouthContent: MouthContent | null = null;

  getInhaleCone(physics: KirbyPhysics): InhaleCone {
    const facing = physics.getFacing();
    return {
      originX: facing === 1 ? physics.x + physics.width : physics.x,
      originY: physics.y + physics.height / 2,
      direction: facing,
      reach: INHALE_REACH,
      width: INHALE_WIDTH,
    };
  }

  isInInhaleCone(cone: InhaleCone, bounds: Rect, tileMap: TileMap): boolean {
    const targetCenterX = bounds.x + bounds.width / 2;
    const targetCenterY = bounds.y + bounds.height / 2;

    const dx = (targetCenterX - cone.originX) * cone.direction;
    const dy = Math.abs(targetCenterY - cone.originY);

    if (dx < 0 || dx > cone.reach) return false;
    if (dy > cone.width / 2) return false;

    // Line of sight check
    const stepX = (targetCenterX - cone.originX) / 5;
    const stepY = (targetCenterY - cone.originY) / 5;
    for (let i = 1; i <= 4; i++) {
      const checkX = cone.originX + stepX * i;
      const checkY = cone.originY + stepY * i;
      const col = Math.floor(checkX / tileMap.tileSize);
      const row = Math.floor(checkY / tileMap.tileSize);
      if (tileMap.isSolid(col, row)) {
        return false; // Obstructed by solid tile
      }
    }

    return true;
  }

  startInhale(): void {
    if (this.mouthContent || this.isFloating || this.isSliding) return;
    this.isInhaling = true;
  }

  stopInhale(): void {
    this.isInhaling = false;
  }

  captureInMouth(content: MouthContent): void {
    this.mouthContent = content;
    this.isInhaling = false;
  }

  spit(physics: KirbyPhysics, projectiles: ProjectileManager): void {
    if (!this.mouthContent) return;
    const spawnX = physics.facing === 1 ? physics.x + physics.width : physics.x - 14;
    const spawnY = physics.y + (physics.height - 14) / 2;
    projectiles.spawnStar(spawnX, spawnY, physics.facing);
    this.mouthContent = null;
  }

  swallow(): MouthContent | null {
    if (!this.mouthContent) return null;
    const content = this.mouthContent;
    this.mouthContent = null;
    return content;
  }

  puffFloat(physics: KirbyPhysics): boolean {
    if (this.floatPuffCount >= MAX_FLOAT_PUFFS) return false;
    this.isFloating = true;
    this.floatPuffCount += 1;
    physics.vy = -160;
    return true;
  }

  exhaleAirBullet(physics: KirbyPhysics, projectiles: ProjectileManager): void {
    if (!this.isFloating) return;
    this.isFloating = false;
    this.floatPuffCount = 0;
    const spawnX = physics.facing === 1 ? physics.x + physics.width : physics.x - 10;
    const spawnY = physics.y + (physics.height - 10) / 2;
    projectiles.spawnAirBullet(spawnX, spawnY, physics.facing);
  }

  startSlide(physics: KirbyPhysics): boolean {
    if (!physics.grounded || this.isSliding || this.isFloating || this.mouthContent) {
      return false;
    }
    this.isSliding = true;
    this.slideTimer = SLIDE_DURATION;
    physics.height = 12; // Lower profile for sliding
    physics.vx = physics.facing * SLIDE_SPEED;
    return true;
  }

  update(dt: number, physics: KirbyPhysics): void {
    if (this.isSliding) {
      this.slideTimer -= dt;
      physics.vx = physics.facing * SLIDE_SPEED;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        physics.height = 20; // Restore height
      }
    }

    if (this.isFloating) {
      // Reduce gravity and limit fall speed during float
      physics.vy = Math.min(physics.vy, 80);
      if (physics.grounded) {
        this.isFloating = false;
        this.floatPuffCount = 0;
      }
    }
  }
}
