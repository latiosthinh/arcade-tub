export const LANE_COUNT = 4;
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 720;
export const ROAD_WIDTH = 360;
export const ROAD_LEFT = 60;
export const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT; // 90

export class HighwayLanes {
  readonly laneCount: number = LANE_COUNT;
  readonly roadWidth: number = ROAD_WIDTH;
  readonly roadLeft: number = ROAD_LEFT;
  readonly laneWidth: number = LANE_WIDTH;

  getLaneCenter(laneIndex: number): number {
    const clampedIndex = Math.max(0, Math.min(this.laneCount - 1, Math.floor(laneIndex)));
    return this.roadLeft + clampedIndex * this.laneWidth + this.laneWidth / 2;
  }

  getLaneFromX(x: number): number {
    const relativeX = x - this.roadLeft;
    const rawIndex = Math.floor(relativeX / this.laneWidth);
    return Math.max(0, Math.min(this.laneCount - 1, rawIndex));
  }

  clampToRoad(x: number, carWidth: number): number {
    const minX = this.roadLeft + carWidth / 2;
    const maxX = this.roadLeft + this.roadWidth - carWidth / 2;
    return Math.max(minX, Math.min(maxX, x));
  }

  getRoadBounds(): { left: number; right: number; width: number } {
    return {
      left: this.roadLeft,
      right: this.roadLeft + this.roadWidth,
      width: this.roadWidth,
    };
  }
}
