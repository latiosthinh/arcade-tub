import { Point } from './types';

export interface CameraOptions {
  viewportWidth: number;
  viewportHeight: number;
  levelWidth?: number;
  levelHeight?: number;
  deadzoneWidth?: number;
  deadzoneHeight?: number;
  lookAheadDistance?: number;
  smoothing?: number;
}

export interface VisibleTileBounds {
  startCol: number;
  endCol: number;
  startRow: number;
  endRow: number;
}

export class Camera {
  x = 0;
  y = 0;
  viewportWidth: number;
  viewportHeight: number;
  levelWidth: number;
  levelHeight: number;
  deadzoneWidth: number;
  deadzoneHeight: number;
  lookAheadDistance: number;
  currentLookAhead = 0;
  smoothing: number;

  constructor(options: CameraOptions) {
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.levelWidth = options.levelWidth ?? options.viewportWidth;
    this.levelHeight = options.levelHeight ?? options.viewportHeight;
    this.deadzoneWidth = options.deadzoneWidth ?? 80;
    this.deadzoneHeight = options.deadzoneHeight ?? 60;
    this.lookAheadDistance = options.lookAheadDistance ?? 40;
    this.smoothing = options.smoothing ?? 8;
  }

  setBounds(levelWidth: number, levelHeight: number): void {
    this.levelWidth = Math.max(0, levelWidth);
    this.levelHeight = Math.max(0, levelHeight);
    this.clamp();
  }

  snapTo(targetX: number, targetY: number): void {
    this.x = targetX - this.viewportWidth / 2;
    this.y = targetY - this.viewportHeight / 2;
    this.clamp();
  }

  update(targetX: number, targetY: number, facing: -1 | 1, dt: number): void {
    const clampedDt = Math.min(dt, 0.1);

    // Lerp look-ahead
    const targetLookAhead = facing * this.lookAheadDistance;
    this.currentLookAhead += (targetLookAhead - this.currentLookAhead) * Math.min(1, 4 * clampedDt);

    // Center shifted by lookahead
    const centerTargetX = targetX + this.currentLookAhead;
    const centerTargetY = targetY;

    // Camera center currently
    const camCenterX = this.x + this.viewportWidth / 2;
    const camCenterY = this.y + this.viewportHeight / 2;

    // Deadzone check against player base target position
    const halfDeadW = this.deadzoneWidth / 2;
    const halfDeadH = this.deadzoneHeight / 2;

    let goalCenterX = camCenterX;
    let goalCenterY = camCenterY;

    // Goal tracks player + lookahead once outside deadzone or lookahead pulls it
    if (centerTargetX > camCenterX + halfDeadW) {
      goalCenterX = centerTargetX - halfDeadW;
    } else if (centerTargetX < camCenterX - halfDeadW) {
      goalCenterX = centerTargetX + halfDeadW;
    } else if (Math.abs(this.currentLookAhead) > 0) {
      // Lookahead shifts the resting position smoothly
      goalCenterX = targetX + this.currentLookAhead;
    }

    if (centerTargetY > camCenterY + halfDeadH) {
      goalCenterY = centerTargetY - halfDeadH;
    } else if (centerTargetY < camCenterY - halfDeadH) {
      goalCenterY = centerTargetY + halfDeadH;
    }

    const goalX = goalCenterX - this.viewportWidth / 2;
    const goalY = goalCenterY - this.viewportHeight / 2;

    const lerpFactor = Math.min(1, this.smoothing * clampedDt);
    this.x += (goalX - this.x) * lerpFactor;
    this.y += (goalY - this.y) * lerpFactor;

    this.clamp();
  }

  private clamp(): void {
    const maxX = Math.max(0, this.levelWidth - this.viewportWidth);
    const maxY = Math.max(0, this.levelHeight - this.viewportHeight);

    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }

  worldToScreen(worldX: number, worldY: number): Point {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    };
  }

  screenToWorld(screenX: number, screenY: number): Point {
    return {
      x: screenX + this.x,
      y: screenY + this.y,
    };
  }

  getVisibleTileBounds(tileSize: number, maxCols?: number, maxRows?: number): VisibleTileBounds {
    const minCol = Math.floor(this.x / tileSize) - 1;
    const maxCol = Math.ceil((this.x + this.viewportWidth) / tileSize) + 1;
    const minRow = Math.floor(this.y / tileSize) - 1;
    const maxRow = Math.ceil((this.y + this.viewportHeight) / tileSize) + 1;

    const levelMaxCols = maxCols ?? Math.ceil(this.levelWidth / tileSize);
    const levelMaxRows = maxRows ?? Math.ceil(this.levelHeight / tileSize);

    return {
      startCol: Math.max(0, minCol),
      endCol: Math.min(levelMaxCols, maxCol),
      startRow: Math.max(0, minRow),
      endRow: Math.min(levelMaxRows, maxRow),
    };
  }
}
