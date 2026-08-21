import { LevelData, TileType } from '../types';

export interface StageDefinition {
  id: string;
  worldNumber: number;
  stageNumber: number;
  title: string;
  theme: 'green' | 'ice' | 'butter' | 'ocean';
  rooms: Record<string, LevelData>;
  initialRoom: string;
}

export const WORLD_1_STAGES: StageDefinition[] = [
  {
    id: '1-1',
    worldNumber: 1,
    stageNumber: 1,
    title: 'Vegetable Valley 1',
    theme: 'green',
    initialRoom: 'main',
    rooms: {
      main: {
        cols: 20,
        rows: 10,
        tileSize: 16,
        tiles: new Array(200).fill(TileType.AIR),
        playerSpawn: { x: 30, y: 100 },
        enemies: [
          { type: 'waddle_dee', col: 6, row: 7 },
          { type: 'waddle_doo', col: 12, row: 7 },
        ],
        foods: [{ type: 'food', col: 9, row: 5 }],
      },
    },
  },
  {
    id: '1-2',
    worldNumber: 1,
    stageNumber: 2,
    title: 'Vegetable Valley 2',
    theme: 'green',
    initialRoom: 'main',
    rooms: {
      main: {
        cols: 25,
        rows: 10,
        tileSize: 16,
        tiles: new Array(250).fill(TileType.AIR),
        playerSpawn: { x: 30, y: 100 },
        enemies: [
          { type: 'blade_knight', col: 8, row: 7 },
          { type: 'hot_head', col: 15, row: 7 },
        ],
      },
    },
  },
  {
    id: '1-3',
    worldNumber: 1,
    stageNumber: 3,
    title: 'Vegetable Valley 3',
    theme: 'green',
    initialRoom: 'main',
    rooms: {
      main: {
        cols: 25,
        rows: 10,
        tileSize: 16,
        tiles: new Array(250).fill(TileType.AIR),
        playerSpawn: { x: 30, y: 100 },
        enemies: [
          { type: 'sparky', col: 10, row: 7 },
          { type: 'sir_kibble', col: 18, row: 7 },
        ],
      },
    },
  },
  {
    id: '1-4',
    worldNumber: 1,
    stageNumber: 4,
    title: 'Vegetable Valley 4',
    theme: 'green',
    initialRoom: 'main',
    rooms: {
      main: {
        cols: 25,
        rows: 10,
        tileSize: 16,
        tiles: new Array(250).fill(TileType.AIR),
        playerSpawn: { x: 30, y: 100 },
        enemies: [
          { type: 'chilly', col: 8, row: 7 },
          { type: 'rocky', col: 16, row: 7 },
        ],
        foods: [{ type: 'maxim_tomato', col: 22, row: 4 }],
      },
    },
  },
  {
    id: '1-boss',
    worldNumber: 1,
    stageNumber: 5,
    title: 'Boss: Whispy Woods',
    theme: 'green',
    initialRoom: 'arena',
    rooms: {
      arena: {
        cols: 20,
        rows: 10,
        tileSize: 16,
        tiles: new Array(200).fill(TileType.AIR),
        playerSpawn: { x: 30, y: 100 },
      },
    },
  },
];
