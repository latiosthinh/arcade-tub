export type TrackLane = 'front' | 'back';

export class Cart {
  x: number = 330;
  y: number = 520;
  vx: number = 0;
  width: number = 140; // Expanded to fit ~3 crates side-by-side
  height: number = 30;
  frontLaneY: number = 520;
  backLaneY: number = 440;
  targetY: number = 520;
  lane: TrackLane = 'front';
  maxSpeed: number = 500;
  accel: number = 2200;
  friction: number = 0.001;
  screenWidth: number = 800;

  reset(startX: number = 330): void {
    this.x = startX;
    this.vx = 0;
    this.lane = 'front';
    this.y = this.frontLaneY;
    this.targetY = this.frontLaneY;
  }

  switchLane(lane: TrackLane): void {
    this.lane = lane;
    this.targetY = lane === 'front' ? this.frontLaneY : this.backLaneY;
  }

  toggleLane(): void {
    this.switchLane(this.lane === 'front' ? 'back' : 'front');
  }

  moveLeft(dt: number): void {
    this.vx = Math.max(-this.maxSpeed, this.vx - this.accel * dt);
  }

  moveRight(dt: number): void {
    this.vx = Math.min(this.maxSpeed, this.vx + this.accel * dt);
  }

  applyFriction(dt: number): void {
    this.vx *= Math.pow(this.friction, dt);
    if (Math.abs(this.vx) < 5) {
      this.vx = 0;
    }
  }

  update(dt: number): void {
    this.y += (this.targetY - this.y) * Math.min(1, 20 * dt);
    this.x += this.vx * dt;
    this.x = Math.max(0, Math.min(this.screenWidth - this.width, this.x));
  }

  getEffectiveScale(): number {
    return this.lane === 'front' ? 1.0 : 0.85;
  }

  getBounds(): { x: number; y: number; width: number; height: number; lane: TrackLane } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      lane: this.lane,
    };
  }
}
