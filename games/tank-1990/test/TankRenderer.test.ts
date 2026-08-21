import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TankRenderer } from '../src/TankRenderer';
import { ParticleEmitter } from '../src/ParticleEmitter';
import {
  GameState,
  TankTier,
  EnemyType,
  RenderSceneData,
  TileType,
  SubTileMask,
} from '../src/types';

describe('TankRenderer Smoke & Unit Tests', () => {
  let renderer: TankRenderer;
  let emitter: ParticleEmitter;
  let mockCtx: any;

  beforeEach(() => {
    renderer = new TankRenderer();
    emitter = new ParticleEmitter();

    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 })),
      arc: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      clip: vi.fn(),
      roundRect: vi.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      globalAlpha: 1,
      font: '10px sans-serif',
      textAlign: 'left',
      textBaseline: 'top',
    };
  });

  const createBaseSceneData = (overrides?: Partial<RenderSceneData>): RenderSceneData => ({
    grid: {
      getCell: () => ({ type: TileType.EMPTY, mask: SubTileMask.EMPTY }),
      isEagleDestroyed: () => false,
      eagleState: { col: 12, row: 24, width: 32, height: 32, destroyed: false },
      getSubTileBoxes: () => [],
    },
    playerTank: {
      x: 128,
      y: 384,
      width: 28,
      height: 28,
      direction: 'UP',
      tier: TankTier.TIER_1,
      shieldTimer: 0,
      isInvulnerable: false,
      lives: 3,
      isDead: false,
      isSliding: false,
      boatActive: false,
    },
    enemyTanks: [
      {
        id: 'enemy_1',
        type: EnemyType.BASIC,
        x: 0,
        y: 0,
        width: 28,
        height: 28,
        direction: 'DOWN',
        hp: 1,
        maxHp: 1,
        isFlashing: false,
        isFrozen: false,
        isDead: false,
      },
    ],
    bullets: [],
    powerUps: [],
    hudState: {
      stage: 1,
      lives: 3,
      score: 1000,
      highScore: 20000,
      enemyReserveCount: 20,
      playerTier: TankTier.TIER_1,
      isGameOver: false,
      isPaused: false,
    },
    gameState: GameState.PLAYING,
    curtainProgress: 1.0,
    tallyProgress: 1.0,
    tallyResult: null,
    time: 1.0,
    ...overrides,
  });

  it('renders PLAYING scene without throwing', () => {
    const data = createBaseSceneData();
    expect(() => renderer.renderScene(mockCtx, data, emitter)).not.toThrow();
    expect(mockCtx.fillRect).toHaveBeenCalled();
  });

  it('renders TITLE scene without throwing', () => {
    const data = createBaseSceneData({ gameState: GameState.TITLE });
    expect(() => renderer.renderScene(mockCtx, data, emitter)).not.toThrow();
  });

  it('renders STAGE_INTRO curtain scene without throwing', () => {
    const data = createBaseSceneData({
      gameState: GameState.STAGE_INTRO,
      curtainProgress: 0.5,
    });
    expect(() => renderer.renderScene(mockCtx, data, emitter)).not.toThrow();
  });

  it('renders STAGE_TALLY breakdown scene without throwing', () => {
    const data = createBaseSceneData({
      gameState: GameState.STAGE_TALLY,
      tallyProgress: 1.0,
      tallyResult: {
        stage: 1,
        rows: [
          { type: EnemyType.BASIC, count: 14, unitPoints: 100, totalPoints: 1400 },
          { type: EnemyType.FAST, count: 4, unitPoints: 200, totalPoints: 800 },
          { type: EnemyType.POWER, count: 1, unitPoints: 300, totalPoints: 300 },
          { type: EnemyType.ARMOR, count: 1, unitPoints: 400, totalPoints: 400 },
        ],
        totalKills: 20,
        totalStagePoints: 2900,
        cumulativeScore: 2900,
        isNewHighScore: false,
      },
    });
    expect(() => renderer.renderScene(mockCtx, data, emitter)).not.toThrow();
  });

  it('renders GAME_OVER and VICTORY banners without throwing', () => {
    const gameOverData = createBaseSceneData({ gameState: GameState.GAME_OVER });
    expect(() => renderer.renderScene(mockCtx, gameOverData, emitter)).not.toThrow();

    const victoryData = createBaseSceneData({ gameState: GameState.VICTORY });
    expect(() => renderer.renderScene(mockCtx, victoryData, emitter)).not.toThrow();
  });

  it('gracefully handles missing playerTank and empty enemy list', () => {
    const data = createBaseSceneData({
      playerTank: null,
      enemyTanks: [],
    });
    expect(() => renderer.renderScene(mockCtx, data, emitter)).not.toThrow();
  });

  it('renders destroyed eagle state', () => {
    const data = createBaseSceneData({
      grid: {
        getCell: () => null,
        isEagleDestroyed: () => true,
        eagleState: { col: 12, row: 24, width: 32, height: 32, destroyed: true },
      },
    });
    expect(() => renderer.renderScene(mockCtx, data, emitter)).not.toThrow();
  });
});
