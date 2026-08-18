import { describe, it, expect, beforeEach } from 'vitest';
import { MahjongEngine } from '../src/MahjongEngine';
import { GameState, TILE_TYPES } from '../src/GameState';
import { MahjongLayoutGenerator, MahjongTile } from '../src/MahjongLayoutGenerator';

describe('Mahjong Paper Mechanics', () => {
  describe('GameState', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState();
    });

    it('initializes in ready status', () => {
      expect(state.status).toBe('ready');
      expect(state.score).toBe(0);
    });

    it('starts with total tiles count', () => {
      state.start(72);
      expect(state.status).toBe('playing');
      expect(state.totalTiles).toBe(72);
      expect(state.tilesRemaining).toBe(72);
      expect(state.hintsRemaining).toBe(3);
      expect(state.shufflesRemaining).toBe(3);
    });

    it('scores points and combo multipliers on matching', () => {
      state.start(72);
      const earned1 = state.recordMatch();
      expect(earned1).toBe(100);
      expect(state.score).toBe(100);
      expect(state.tilesRemaining).toBe(70);

      // Chain match -> combo multiplier
      state.recordMatch();
      expect(state.multiplier).toBe(2);
      expect(state.score).toBe(300);
    });

    it('reverts stats on undo', () => {
      state.start(72);
      state.recordMatch();
      expect(state.tilesRemaining).toBe(70);

      state.recordUndo();
      expect(state.tilesRemaining).toBe(72);
      expect(state.combo).toBe(0);
      expect(state.multiplier).toBe(1);
    });
  });

  describe('Board Generation & Free Tile Checking', () => {
    let engine: MahjongEngine;

    beforeEach(() => {
      engine = new MahjongEngine();
    });

    it('generates an even number of paired tiles', () => {
      expect(engine.tiles.length % 2).toBe(0);
      const countMap = new Map<string, number>();
      for (const t of engine.tiles) {
        countMap.set(t.typeId, (countMap.get(t.typeId) || 0) + 1);
      }
      for (const count of countMap.values()) {
        expect(count % 2).toBe(0);
      }
    });

    it('correctly identifies covered tiles as not free', () => {
      const baseTile: MahjongTile = {
        id: 1,
        typeId: 'crane',
        category: 'animals',
        layer: 0,
        col: 10,
        row: 6,
        removed: false,
        selected: false,
        highlighted: false,
        animScale: 1,
      };

      const coveringTile: MahjongTile = {
        id: 2,
        typeId: 'frog',
        category: 'animals',
        layer: 1,
        col: 10,
        row: 6,
        removed: false,
        selected: false,
        highlighted: false,
        animScale: 1,
      };

      engine.tiles = [baseTile, coveringTile];
      expect(engine.isTileFree(baseTile)).toBe(false);
      expect(engine.isTileFree(coveringTile)).toBe(true);

      // Once covering tile is removed, base becomes free
      coveringTile.removed = true;
      expect(engine.isTileFree(baseTile)).toBe(true);
    });

    it('correctly identifies laterally sandwiched tiles as not free', () => {
      const leftTile: MahjongTile = {
        id: 1,
        typeId: 'crane',
        category: 'animals',
        layer: 0,
        col: 8,
        row: 6,
        removed: false,
        selected: false,
        highlighted: false,
        animScale: 1,
      };
      const centerTile: MahjongTile = {
        id: 2,
        typeId: 'frog',
        category: 'animals',
        layer: 0,
        col: 10,
        row: 6,
        removed: false,
        selected: false,
        highlighted: false,
        animScale: 1,
      };
      const rightTile: MahjongTile = {
        id: 3,
        typeId: 'crane',
        category: 'animals',
        layer: 0,
        col: 12,
        row: 6,
        removed: false,
        selected: false,
        highlighted: false,
        animScale: 1,
      };

      engine.tiles = [leftTile, centerTile, rightTile];
      expect(engine.isTileFree(centerTile)).toBe(false);
      expect(engine.isTileFree(leftTile)).toBe(true);
      expect(engine.isTileFree(rightTile)).toBe(true);
    });
  });

  describe('Tile Selection, Hint & Undo', () => {
    let engine: MahjongEngine;

    beforeEach(() => {
      engine = new MahjongEngine();
      // Setup simple custom 4-tile board
      engine.tiles = [
        { id: 1, typeId: 'crane', category: 'animals', layer: 0, col: 0, row: 0, removed: false, selected: false, highlighted: false, animScale: 1 },
        { id: 2, typeId: 'crane', category: 'animals', layer: 0, col: 4, row: 0, removed: false, selected: false, highlighted: false, animScale: 1 },
        { id: 3, typeId: 'frog', category: 'animals', layer: 0, col: 0, row: 4, removed: false, selected: false, highlighted: false, animScale: 1 },
        { id: 4, typeId: 'frog', category: 'animals', layer: 0, col: 4, row: 4, removed: false, selected: false, highlighted: false, animScale: 1 },
      ];
      engine.state.start(4);
    });

    it('matches two free identical tiles and removes them', () => {
      const step1 = engine.selectTile(1);
      expect(step1.matched).toBe(false);
      expect(engine.selectedTileId).toBe(1);

      const step2 = engine.selectTile(2);
      expect(step2.matched).toBe(true);
      expect(engine.tiles[0].removed).toBe(true);
      expect(engine.tiles[1].removed).toBe(true);
      expect(engine.state.tilesRemaining).toBe(2);
    });

    it('finds and highlights matching tiles with hint', () => {
      expect(engine.state.hintsRemaining).toBe(3);
      const hintSuccess = engine.showHint();
      expect(hintSuccess).toBe(true);
      expect(engine.state.hintsRemaining).toBe(2);

      const highlightedTiles = engine.tiles.filter(t => t.highlighted);
      expect(highlightedTiles.length).toBe(2);
      expect(highlightedTiles[0].typeId).toBe(highlightedTiles[1].typeId);
    });

    it('reverts previous match when undo is called', () => {
      engine.selectTile(1);
      engine.selectTile(2);
      expect(engine.tiles[0].removed).toBe(true);
      expect(engine.tiles[1].removed).toBe(true);

      const undoSuccess = engine.undoMove();
      expect(undoSuccess).toBe(true);
      expect(engine.tiles[0].removed).toBe(false);
      expect(engine.tiles[1].removed).toBe(false);
      expect(engine.state.tilesRemaining).toBe(4);
    });
  });
});
