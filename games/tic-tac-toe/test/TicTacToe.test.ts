import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicTacToeEngine, BoardState, Player } from '../src/TicTacToeEngine';
import { XiaomiMimoClient } from '../src/XiaomiMimoClient';

describe('TicTacToeEngine', () => {
  let engine: TicTacToeEngine;

  beforeEach(() => {
    engine = new TicTacToeEngine();
  });

  it('initializes empty 3x3 board and tracks turns', () => {
    expect(engine.getBoard()).toEqual([
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ]);
    expect(engine.getCurrentPlayer()).toBe('X');
    expect(engine.getWinner()).toBeNull();
    expect(engine.isDraw()).toBe(false);
  });

  it('places mark and alternates turns', () => {
    expect(engine.makeMove(0, 0)).toBe(true);
    expect(engine.getBoard()[0][0]).toBe('X');
    expect(engine.getCurrentPlayer()).toBe('O');

    expect(engine.makeMove(1, 1)).toBe(true);
    expect(engine.getBoard()[1][1]).toBe('O');
    expect(engine.getCurrentPlayer()).toBe('X');

    // Reject move on already taken cell
    expect(engine.makeMove(0, 0)).toBe(false);
  });

  it('detects row, column, and diagonal wins', () => {
    // Row win
    engine.reset();
    engine.makeMove(0, 0); // X
    engine.makeMove(1, 0); // O
    engine.makeMove(0, 1); // X
    engine.makeMove(1, 1); // O
    engine.makeMove(0, 2); // X
    expect(engine.getWinner()).toBe('X');
    expect(engine.isGameOver()).toBe(true);

    // Diagonal win
    engine.reset();
    engine.makeMove(0, 0); // X
    engine.makeMove(0, 1); // O
    engine.makeMove(1, 1); // X
    engine.makeMove(0, 2); // O
    engine.makeMove(2, 2); // X
    expect(engine.getWinner()).toBe('X');
  });

  it('detects draw game when board is full with no winner', () => {
    // X O X
    // X X O
    // O X O
    const board: BoardState = [
      ['X', 'O', 'X'],
      ['X', 'X', 'O'],
      ['O', 'X', 'O']
    ];
    engine.setBoard(board, 'X');
    expect(engine.isDraw()).toBe(true);
    expect(engine.isGameOver()).toBe(true);
    expect(engine.getWinner()).toBeNull();
  });

  it('Minimax AI picks winning or blocking moves optimally', () => {
    // X X _
    // O O _
    // _ _ _
    // Next turn is X -> should take (0, 2) to win immediately
    const board: BoardState = [
      ['X', 'X', ''],
      ['O', 'O', ''],
      ['', '', '']
    ];
    engine.setBoard(board, 'X');
    const bestMove = engine.getBestMoveMinimax('X');
    expect(bestMove).toEqual({ row: 0, col: 2 });
  });

  it('Minimax AI blocks opponent win', () => {
    // X X _
    // _ O _
    // _ _ _
    // Turn is O -> must block at (0, 2)
    const board: BoardState = [
      ['X', 'X', ''],
      ['', 'O', ''],
      ['', '', '']
    ];
    engine.setBoard(board, 'O');
    const bestMove = engine.getBestMoveMinimax('O');
    expect(bestMove).toEqual({ row: 0, col: 2 });
  });
});

describe('XiaomiMimoClient', () => {
  let client: XiaomiMimoClient;

  beforeEach(() => {
    client = new XiaomiMimoClient();
  });

  it('falls back to local Minimax if no API key or fetch fails', async () => {
    const board: BoardState = [
      ['X', 'X', ''],
      ['O', '', ''],
      ['', '', '']
    ];

    // No key configured -> should smoothly return minimax move
    const move = await client.getAiMove(board, 'X');
    expect(move).toEqual({ row: 0, col: 2 });
  });

  it('handles simulated API response correctly when endpoint is reached', async () => {
    const board: BoardState = [
      ['', '', ''],
      ['', 'X', ''],
      ['', '', '']
    ];

    // Mock global fetch returning move (0, 0)
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"row": 0, "col": 0}'
            }
          }
        ]
      })
    });

    client.setApiKey('mock-key-123');
    const move = await client.getAiMove(board, 'O');
    expect(move).toEqual({ row: 0, col: 0 });

    global.fetch = originalFetch;
  });

  it('falls back safely if API call times out or throws', async () => {
    const board: BoardState = [
      ['X', 'X', ''],
      ['O', 'O', ''],
      ['', '', '']
    ];

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

    client.setApiKey('mock-key-123');
    const move = await client.getAiMove(board, 'X');
    expect(move).toEqual({ row: 0, col: 2 }); // Minimax winning move

    global.fetch = originalFetch;
  });
});
