export type Cell = 'X' | 'O' | '';
export type BoardState = Cell[][];
export type Player = 'X' | 'O';

export interface Move {
  row: number;
  col: number;
}

export class TicTacToeEngine {
  private board: BoardState;
  private currentPlayer: Player;

  constructor() {
    this.board = this.createEmptyBoard();
    this.currentPlayer = 'X';
  }

  private createEmptyBoard(): BoardState {
    return [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
  }

  public getBoard(): BoardState {
    return this.board.map(row => [...row]);
  }

  public setBoard(board: BoardState, player: Player = 'X'): void {
    this.board = board.map(row => [...row]);
    this.currentPlayer = player;
  }

  public getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  public makeMove(row: number, col: number): boolean {
    if (row < 0 || row > 2 || col < 0 || col > 2) return false;
    if (this.board[row][col] !== '' || this.isGameOver()) return false;

    this.board[row][col] = this.currentPlayer;
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    return true;
  }

  public getWinner(): Player | null {
    const lines = [
      // Rows
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      // Columns
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      // Diagonals
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]]
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      const valA = this.board[a[0]][a[1]];
      const valB = this.board[b[0]][b[1]];
      const valC = this.board[c[0]][c[1]];

      if (valA !== '' && valA === valB && valA === valC) {
        return valA;
      }
    }
    return null;
  }

  public isDraw(): boolean {
    if (this.getWinner() !== null) return false;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.board[r][c] === '') return false;
      }
    }
    return true;
  }

  public isGameOver(): boolean {
    return this.getWinner() !== null || this.isDraw();
  }

  public reset(): void {
    this.board = this.createEmptyBoard();
    this.currentPlayer = 'X';
  }

  public getAvailableMoves(): Move[] {
    const moves: Move[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.board[r][c] === '') {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  public getBestMoveMinimax(player: Player): Move | null {
    const available = this.getAvailableMoves();
    if (available.length === 0) return null;

    let bestScore = -Infinity;
    let bestMove: Move = available[0];

    for (const move of available) {
      this.board[move.row][move.col] = player;
      const score = this.minimax(this.board, 0, false, player);
      this.board[move.row][move.col] = '';

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(board: BoardState, depth: number, isMaximizing: boolean, aiPlayer: Player): number {
    const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';
    const winner = this.checkBoardWinner(board);

    if (winner === aiPlayer) return 10 - depth;
    if (winner === opponent) return depth - 10;
    if (this.checkBoardDraw(board)) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (board[r][c] === '') {
            board[r][c] = aiPlayer;
            const evaluation = this.minimax(board, depth + 1, false, aiPlayer);
            board[r][c] = '';
            maxEval = Math.max(maxEval, evaluation);
          }
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (board[r][c] === '') {
            board[r][c] = opponent;
            const evaluation = this.minimax(board, depth + 1, true, aiPlayer);
            board[r][c] = '';
            minEval = Math.min(minEval, evaluation);
          }
        }
      }
      return minEval;
    }
  }

  private checkBoardWinner(board: BoardState): Player | null {
    const lines = [
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]]
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      const valA = board[a[0]][a[1]];
      const valB = board[b[0]][b[1]];
      const valC = board[c[0]][c[1]];

      if (valA !== '' && valA === valB && valA === valC) {
        return valA;
      }
    }
    return null;
  }

  private checkBoardDraw(board: BoardState): boolean {
    if (this.checkBoardWinner(board) !== null) return false;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === '') return false;
      }
    }
    return true;
  }
}
