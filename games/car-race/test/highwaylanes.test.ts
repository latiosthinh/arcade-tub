import { describe, it, expect, beforeEach } from 'vitest';
import { HighwayLanes, LANE_COUNT, ROAD_WIDTH, ROAD_LEFT, LANE_WIDTH } from '../src/HighwayLanes';

describe('HighwayLanes', () => {
  let lanes: HighwayLanes;

  beforeEach(() => {
    lanes = new HighwayLanes();
  });

  it('exports geometry constants', () => {
    expect(LANE_COUNT).toBe(4);
    expect(ROAD_WIDTH).toBe(360);
    expect(ROAD_LEFT).toBe(60);
    expect(LANE_WIDTH).toBe(90);
  });

  it('calculates lane centers correctly', () => {
    // lane 0: 60 + 45 = 105
    // lane 1: 60 + 90 + 45 = 195
    // lane 2: 60 + 180 + 45 = 285
    // lane 3: 60 + 270 + 45 = 375
    expect(lanes.getLaneCenter(0)).toBe(105);
    expect(lanes.getLaneCenter(1)).toBe(195);
    expect(lanes.getLaneCenter(2)).toBe(285);
    expect(lanes.getLaneCenter(3)).toBe(375);
  });

  it('clamps invalid lane indexes when getting lane center', () => {
    expect(lanes.getLaneCenter(-2)).toBe(105);
    expect(lanes.getLaneCenter(10)).toBe(375);
  });

  it('calculates nearest lane index from X position', () => {
    expect(lanes.getLaneFromX(50)).toBe(0);
    expect(lanes.getLaneFromX(105)).toBe(0);
    expect(lanes.getLaneFromX(150)).toBe(1);
    expect(lanes.getLaneFromX(195)).toBe(1);
    expect(lanes.getLaneFromX(280)).toBe(2);
    expect(lanes.getLaneFromX(375)).toBe(3);
    expect(lanes.getLaneFromX(500)).toBe(3);
  });

  it('clamps car X to stay within road bounds', () => {
    const carWidth = 40;
    // minX = 60 + 20 = 80
    // maxX = 60 + 360 - 20 = 400
    expect(lanes.clampToRoad(50, carWidth)).toBe(80);
    expect(lanes.clampToRoad(200, carWidth)).toBe(200);
    expect(lanes.clampToRoad(450, carWidth)).toBe(400);
  });

  it('returns road bounds structure', () => {
    const bounds = lanes.getRoadBounds();
    expect(bounds).toEqual({
      left: 60,
      right: 420,
      width: 360,
    });
  });
});
