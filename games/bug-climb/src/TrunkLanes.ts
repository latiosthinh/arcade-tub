export const LANE_COUNT = 2;
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 720;
export const TRUNK_WIDTH = 140;
export const TRUNK_LEFT = (CANVAS_WIDTH - TRUNK_WIDTH) / 2; // 170
export const LANE_WIDTH = TRUNK_WIDTH / LANE_COUNT; // 70

// Left lane center: 170 + 35 = 205. Bug offset left on trunk edge: 145
// Right lane center: 240 + 35 = 275. Bug offset right on trunk edge: 335
export const BUG_LEFT_X = 145;
export const BUG_RIGHT_X = 335;
export const BUG_Y = 560;

export class TrunkLanes {
  readonly laneCount: number = LANE_COUNT;
  readonly trunkWidth: number = TRUNK_WIDTH;
  readonly trunkLeft: number = TRUNK_LEFT;
  readonly laneWidth: number = LANE_WIDTH;

  getLaneX(laneIndex: number): number {
    return laneIndex === 0 ? BUG_LEFT_X : BUG_RIGHT_X;
  }

  getLaneFromX(x: number): number {
    return x < CANVAS_WIDTH / 2 ? 0 : 1;
  }
}
