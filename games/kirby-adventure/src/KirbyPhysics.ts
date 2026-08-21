import { Rect, InputState } from './types';
import { TileMap } from './TileMap';

export const GRAVITY = 600; // px/s²
export const MAX_FALL_SPEED = 300; // px/s
export const RUN_SPEED = 120; // px/s
export const DASH_SPEED = 180; // px/s (1.5x)
export const JUMP_VELOCITY = -280; // px/s
export const MIN_JUMP_VELOCITY = -120; // px/s
export const COYOTE_TIME = 0.1; // 100ms
export const JUMP_BUFFER_TIME = 0.12; // 120ms
export const DOUBLE_TAP_WINDOW = 0.25; // 250ms
export const COLLISION_SHRINK = 0.01; // px

export class KirbyPhysics {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  width: number;
  height: number;
  grounded = false;
  facing: -1 | 1 = 1;
  isDashing = false;
  coyoteTimer = 0;
  jumpBufferTimer = 0;

  // Double-tap timing
  private lastLeftPressTime = -1;
  private lastRightPressTime = -1;
  private prevLeft = false;
  private prevRight = false;
  private currentTime = 0;

  constructor(init: { x: number; y: number; width?: number; height?: number }) {
    this.x = init.x;
    this.y = init.y;
    this.width = init.width ?? 20;
    this.height = init.height ?? 20;
  }

  getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  isGrounded(): boolean {
    return this.grounded;
  }

  getFacing(): -1 | 1 {
    return this.facing;
  }

  resolveCollisionX(tileMap: TileMap, dt: number): void {
    this.x += this.vx * dt;

    const queryBox: Rect = {
      x: this.x + COLLISION_SHRINK,
      y: this.y + COLLISION_SHRINK,
      width: this.width - 2 * COLLISION_SHRINK,
      height: this.height - 2 * COLLISION_SHRINK,
    };

    const hits = tileMap.queryRect(queryBox);

    for (const hit of hits) {
      if (tileMap.isSolid(hit.col, hit.row) || tileMap.isBreakable(hit.col, hit.row)) {
        if (this.vx > 0) {
          this.x = hit.bounds.x - this.width;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = hit.bounds.x + hit.bounds.width;
          this.vx = 0;
        }
      }
    }
  }

  resolveCollisionY(tileMap: TileMap, dt: number, prevY: number): void {
    this.y += this.vy * dt;
    this.grounded = false;

    const queryBox: Rect = {
      x: this.x + COLLISION_SHRINK,
      y: this.y + COLLISION_SHRINK,
      width: this.width - 2 * COLLISION_SHRINK,
      height: this.height - 2 * COLLISION_SHRINK,
    };

    const hits = tileMap.queryRect(queryBox);

    for (const hit of hits) {
      const isSolid = tileMap.isSolid(hit.col, hit.row) || tileMap.isBreakable(hit.col, hit.row);
      const isOneWay = tileMap.isOneWay(hit.col, hit.row);

      if (isSolid) {
        if (this.vy > 0) {
          this.y = hit.bounds.y - this.height;
          this.vy = 0;
          this.grounded = true;
        } else if (this.vy < 0) {
          this.y = hit.bounds.y + hit.bounds.height;
          this.vy = 0;
        }
      } else if (isOneWay) {
        if (this.vy >= 0 && prevY + this.height <= hit.bounds.y + 2) {
          this.y = hit.bounds.y - this.height;
          this.vy = 0;
          this.grounded = true;
        }
      }
    }
  }

  update(dt: number, input: InputState, tileMap: TileMap): void {
    // Clamp max dt to prevent tunneling
    const clampedDt = Math.min(dt, 1 / 30);
    this.currentTime += clampedDt;

    // Detect double-tap dash
    const leftJustPressed = input.left && !this.prevLeft;
    const rightJustPressed = input.right && !this.prevRight;

    if (rightJustPressed) {
      if (this.currentTime - this.lastRightPressTime <= DOUBLE_TAP_WINDOW) {
        this.isDashing = true;
      }
      this.lastRightPressTime = this.currentTime;
    }

    if (leftJustPressed) {
      if (this.currentTime - this.lastLeftPressTime <= DOUBLE_TAP_WINDOW) {
        this.isDashing = true;
      }
      this.lastLeftPressTime = this.currentTime;
    }

    if (input.dash !== undefined) {
      if (input.dash) this.isDashing = true;
    }

    this.prevLeft = input.left;
    this.prevRight = input.right;

    // Timers update
    if (this.grounded) {
      this.coyoteTimer = COYOTE_TIME;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - clampedDt);
    }

    if (input.jumpJustPressed) {
      this.jumpBufferTimer = JUMP_BUFFER_TIME;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - clampedDt);
    }

    // Horizontal movement
    const isDucking = input.down && this.grounded && !input.left && !input.right;
    const targetSpeed = this.isDashing ? DASH_SPEED : RUN_SPEED;

    if (isDucking) {
      this.vx = 0;
      this.isDashing = false;
    } else if (input.right && !input.left) {
      this.vx = targetSpeed;
      this.facing = 1;
    } else if (input.left && !input.right) {
      this.vx = -targetSpeed;
      this.facing = -1;
    } else {
      this.vx = 0;
      this.isDashing = false;
    }

    // Jump handling
    const canJump = this.jumpBufferTimer > 0 && (this.grounded || this.coyoteTimer > 0);
    if (canJump) {
      this.vy = JUMP_VELOCITY;
      this.grounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
    }

    // Variable jump cut-off
    if ((input.jumpJustReleased || !input.jump) && this.vy < MIN_JUMP_VELOCITY) {
      this.vy = MIN_JUMP_VELOCITY;
    }

    // Gravity
    this.vy = Math.min(this.vy + GRAVITY * clampedDt, MAX_FALL_SPEED);

    // Collision integration
    const prevY = this.y;
    this.resolveCollisionX(tileMap, clampedDt);
    this.resolveCollisionY(tileMap, clampedDt, prevY);
  }
}
