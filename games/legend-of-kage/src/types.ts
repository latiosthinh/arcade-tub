export type Direction = -1 | 1;

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  shuriken: boolean;
  shurikenJustPressed: boolean;
  sword: boolean;
  swordJustPressed: boolean;
}

export interface GameScene {
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface BranchPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BambooTrunk {
  id: string;
  x: number;
  topY: number;
  bottomY: number;
  width: number;
}
