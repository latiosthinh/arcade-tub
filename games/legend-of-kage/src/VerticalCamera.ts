export interface CameraOptions {
  viewportWidth?: number;
  viewportHeight?: number;
  stageWidth?: number;
  stageHeight?: number;
}

export class VerticalCamera {
  x = 0;
  y = 0;
  viewportWidth: number;
  viewportHeight: number;
  stageWidth: number;
  stageHeight: number;

  private topDeadzoneRatio = 0.35; // Top 35% triggers fast follow

  constructor(options: CameraOptions = {}) {
    this.viewportWidth = options.viewportWidth ?? 800;
    this.viewportHeight = options.viewportHeight ?? 600;
    this.stageWidth = options.stageWidth ?? 1200;
    this.stageHeight = options.stageHeight ?? 800;
  }

  update(targetX: number, targetY: number, targetVy: number, dt: number): void {
    // Horizontal tracking with smooth center alignment
    const targetCamX = targetX - this.viewportWidth / 2;
    this.x += (targetCamX - this.x) * Math.min(1, dt * 8);

    // Vertical tracking with asymmetric look-ahead
    let targetCamY = targetY - this.viewportHeight * this.topDeadzoneRatio;

    // Fast upward lerp when leaping up, gentle downward follow when falling
    const lerpSpeed = targetVy < -100 ? 12 : 5;
    this.y += (targetCamY - this.y) * Math.min(1, dt * lerpSpeed);

    // Clamp boundaries
    this.x = Math.max(0, Math.min(this.stageWidth - this.viewportWidth, this.x));
    this.y = Math.max(0, Math.min(this.stageHeight - this.viewportHeight, this.y));
  }

  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    };
  }
}
