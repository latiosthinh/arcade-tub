import { Direction, InputState, Rect } from './types';
import { TreeCanopy } from './TreeCanopy';

export const SUPER_JUMP_IMPULSE = -820; // px/s
export const NORMAL_GRAVITY = 750; // px/s²
export const APEX_GRAVITY = 320; // px/s² near top for floaty ninja hang
export const MAX_FALL_SPEED = 420; // px/s
export const RUN_SPEED = 160; // px/s
export const AIR_SPEED = 180; // px/s
export const WALL_SLIDE_SPEED = 70; // px/s
export const TRUNK_SLIDE_SPEED = 80; // px/s

export class NinjaPhysics {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  width = 18;
  height = 24;
  facing: Direction = 1;
  grounded = false;
  onBranch = false;
  isClingingWall = false;
  isClingingTrunk = false;
  wallDir: Direction = 1;

  constructor(x = 100, y = 500) {
    this.x = x;
    this.y = y;
  }

  getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  update(dt: number, input: InputState, canopy: TreeCanopy, stageFloorY = 560): void {
    const clampedDt = Math.min(dt, 0.05);

    // 1. Horizontal Input & Steering
    const targetSpeed = this.grounded || this.onBranch ? RUN_SPEED : AIR_SPEED;

    if (input.right && !input.left) {
      this.vx = targetSpeed;
      this.facing = 1;
    } else if (input.left && !input.right) {
      this.vx = -targetSpeed;
      this.facing = -1;
    } else {
      this.vx = 0;
    }

    // 2. Super Jump Trigger
    const canJump = this.grounded || this.onBranch || this.isClingingWall || this.isClingingTrunk;
    if (input.jumpJustPressed && canJump) {
      if (this.isClingingWall) {
        // Wall-Jump kick off
        this.vy = SUPER_JUMP_IMPULSE * 0.9;
        this.vx = -this.wallDir * 200;
        this.facing = -this.wallDir as Direction;
        this.isClingingWall = false;
      } else {
        this.vy = SUPER_JUMP_IMPULSE;
      }
      this.grounded = false;
      this.onBranch = false;
      this.isClingingTrunk = false;
    }

    // 3. Piecewise Gravity (Apex Hang Time)
    const isNearApex = Math.abs(this.vy) < 90 && !this.grounded && !this.onBranch;
    const currentGravity = isNearApex ? APEX_GRAVITY : NORMAL_GRAVITY;

    if (!this.grounded && !this.onBranch && !this.isClingingWall && !this.isClingingTrunk) {
      this.vy = Math.min(this.vy + currentGravity * clampedDt, MAX_FALL_SPEED);
    }

    // 4. Cling checks (Trunk & Wall)
    if (!this.grounded && !this.onBranch && this.vy > 0) {
      const touchingTrunk = canopy.checkTrunkGrip(this.getBounds());
      if (touchingTrunk && (input.left || input.right || input.up)) {
        this.isClingingTrunk = true;
        this.vy = Math.min(this.vy, TRUNK_SLIDE_SPEED);
      } else {
        this.isClingingTrunk = false;
      }
    } else {
      this.isClingingTrunk = false;
    }

    // 5. Integrate Position
    const prevY = this.y;
    this.x += this.vx * clampedDt;
    this.y += this.vy * clampedDt;

    // 6. Branch Platform Collision (One-Way Swept)
    this.grounded = false;
    this.onBranch = false;

    if (this.vy >= 0) {
      const branchHit = canopy.checkBranchLanding(this.x, this.y, this.width, this.height, prevY);
      if (branchHit) {
        this.y = branchHit.y - this.height;
        this.vy = 0;
        this.onBranch = true;
      }
    }

    // 7. Floor Boundary Collision
    if (this.y + this.height >= stageFloorY) {
      this.y = stageFloorY - this.height;
      this.vy = 0;
      this.grounded = true;
      this.onBranch = false;
      this.isClingingWall = false;
      this.isClingingTrunk = false;
    }
  }
}
