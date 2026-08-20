/**
 * Core types, enums, bitmasks, and interfaces for Tank 1990 (Battle City).
 */

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  TREES = 4,
  ICE = 5,
  EAGLE = 6,
}

export const SubTileMask = {
  TOP_LEFT: 1 << 0,     // 0b0001 (1)
  TOP_RIGHT: 1 << 1,    // 0b0010 (2)
  BOTTOM_LEFT: 1 << 2,  // 0b0100 (4)
  BOTTOM_RIGHT: 1 << 3, // 0b1000 (8)
  FULL: 0b1111,         // 15
  EMPTY: 0b0000,        // 0
} as const;

export type CardinalDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface CellCoord {
  col: number;
  row: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridCell {
  type: TileType;
  mask: number;
}

export interface EagleState {
  col: number;
  row: number;
  width: number;
  height: number;
  destroyed: boolean;
}

export interface TerrainQueryResult {
  solid: boolean;
  bulletSolid: boolean;
  isWater: boolean;
  isIce: boolean;
  isTrees: boolean;
  isEagle: boolean;
  cell?: GridCell;
}
