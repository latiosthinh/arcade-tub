export type RunnerActionState = 'running' | 'jumping' | 'sliding';

export interface RunnerConfig {
  laneCount?: number;
  laneWidth?: number;
  laneChangeSpeed?: number;
  jumpVelocity?: number;
  gravity?: number;
  slideDuration?: number;
}

export class LaneRunnerEngine {
  readonly laneCount: number;
  readonly laneWidth: number;
  readonly laneChangeSpeed: number;
  readonly jumpVelocity: number;
  readonly gravity: number;
  readonly slideDuration: number;

  currentLane: number;
  targetLane: number;
  laneOffset: number; // -1 to 1 normalized offset across tracks

  actionState: RunnerActionState = 'running';
  yOffset: number = 0; // vertical height above track (jumping)
  vy: number = 0;
  slideTimer: number = 0;

  // Power-up states
  hasHoverboard: boolean = false;
  hoverboardTimer: number = 0;
  hasMagnet: boolean = false;
  magnetTimer: number = 0;
  has2xMultiplier: boolean = false;
  multiplierTimer: number = 0;

  constructor(config: RunnerConfig = {}) {
    this.laneCount = config.laneCount ?? 3;
    this.laneWidth = config.laneWidth ?? 110;
    this.laneChangeSpeed = config.laneChangeSpeed ?? 12;
    this.jumpVelocity = config.jumpVelocity ?? 580;
    this.gravity = config.gravity ?? 1800;
    this.slideDuration = config.slideDuration ?? 0.65;

    this.currentLane = 1; // 0: Left, 1: Middle, 2: Right
    this.targetLane = 1;
    this.laneOffset = 0;
  }

  moveLeft(): boolean {
    if (this.targetLane > 0) {
      this.targetLane -= 1;
      return true;
    }
    return false;
  }

  moveRight(): boolean {
    if (this.targetLane < this.laneCount - 1) {
      this.targetLane += 1;
      return true;
    }
    return false;
  }

  jump(): boolean {
    if (this.actionState === 'sliding') {
      // Cancel slide and jump immediately
      this.actionState = 'jumping';
      this.slideTimer = 0;
      this.vy = this.jumpVelocity;
      return true;
    }
    if (this.actionState === 'running' || (this.actionState === 'jumping' && this.yOffset < 5)) {
      this.actionState = 'jumping';
      this.vy = this.jumpVelocity;
      return true;
    }
    return false;
  }

  slide(): boolean {
    if (this.actionState === 'jumping') {
      // Fast downward dive to slide
      this.yOffset = 0;
      this.vy = 0;
      this.actionState = 'sliding';
      this.slideTimer = this.slideDuration;
      return true;
    }
    if (this.actionState === 'running' || this.actionState === 'sliding') {
      this.actionState = 'sliding';
      this.slideTimer = this.slideDuration;
      return true;
    }
    return false;
  }

  activateHoverboard(duration: number = 10): void {
    this.hasHoverboard = true;
    this.hoverboardTimer = duration;
  }

  activateMagnet(duration: number = 12): void {
    this.hasMagnet = true;
    this.magnetTimer = duration;
  }

  activate2xMultiplier(duration: number = 12): void {
    this.has2xMultiplier = true;
    this.multiplierTimer = duration;
  }

  consumeHoverboardShield(): boolean {
    if (this.hasHoverboard) {
      this.hasHoverboard = false;
      this.hoverboardTimer = 0;
      return true;
    }
    return false;
  }

  update(dt: number): void {
    // 1. Smooth Lane Interpolation
    const targetOffset = (this.targetLane - 1); // -1, 0, 1 for 3 lanes
    const diff = targetOffset - this.laneOffset;
    if (Math.abs(diff) < 0.01) {
      this.laneOffset = targetOffset;
      this.currentLane = this.targetLane;
    } else {
      this.laneOffset += diff * Math.min(1, this.laneChangeSpeed * dt);
      if (Math.abs(diff) < 0.25) {
        this.currentLane = this.targetLane;
      }
    }

    // 2. Jump / Vertical Kinematics
    if (this.actionState === 'jumping') {
      this.yOffset += this.vy * dt;
      this.vy -= this.gravity * dt;

      if (this.yOffset <= 0) {
        this.yOffset = 0;
        this.vy = 0;
        this.actionState = 'running';
      }
    }

    // 3. Slide Timer
    if (this.actionState === 'sliding') {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.slideTimer = 0;
        this.actionState = 'running';
      }
    }

    // 4. Power-up Timers
    if (this.hasHoverboard) {
      this.hoverboardTimer -= dt;
      if (this.hoverboardTimer <= 0) {
        this.hasHoverboard = false;
        this.hoverboardTimer = 0;
      }
    }

    if (this.hasMagnet) {
      this.magnetTimer -= dt;
      if (this.magnetTimer <= 0) {
        this.hasMagnet = false;
        this.magnetTimer = 0;
      }
    }

    if (this.has2xMultiplier) {
      this.multiplierTimer -= dt;
      if (this.multiplierTimer <= 0) {
        this.has2xMultiplier = false;
        this.multiplierTimer = 0;
      }
    }
  }

  getHitbox(): {
    lane: number;
    laneOffset: number;
    bottomY: number;
    height: number;
    isJumpingHigh: boolean;
    isSlidingLow: boolean;
  } {
    return {
      lane: this.currentLane,
      laneOffset: this.laneOffset,
      bottomY: this.yOffset,
      height: this.actionState === 'sliding' ? 24 : 64,
      isJumpingHigh: this.yOffset > 45,
      isSlidingLow: this.actionState === 'sliding'
    };
  }

  reset(): void {
    this.currentLane = 1;
    this.targetLane = 1;
    this.laneOffset = 0;
    this.actionState = 'running';
    this.yOffset = 0;
    this.vy = 0;
    this.slideTimer = 0;
    this.hasHoverboard = false;
    this.hoverboardTimer = 0;
    this.hasMagnet = false;
    this.magnetTimer = 0;
    this.has2xMultiplier = false;
    this.multiplierTimer = 0;
  }
}
