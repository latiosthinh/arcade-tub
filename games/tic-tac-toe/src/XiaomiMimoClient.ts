import { BoardState, Player, Move, TicTacToeEngine } from './TicTacToeEngine';

export class XiaomiMimoClient {
  private apiKey: string = '';
  private endpoint: string = 'https://api.xiaomi.com/mimo/v1/chat/completions';
  private fallbackEngine: TicTacToeEngine;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || (typeof process !== 'undefined' && process.env?.XIAOMI_MIMO_API_KEY) || '';
    this.fallbackEngine = new TicTacToeEngine();
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  public async getAiMove(board: BoardState, player: Player): Promise<Move> {
    if (!this.apiKey) {
      return this.getLocalMinimaxMove(board, player);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const prompt = `You are playing Tic-Tac-Toe as '${player}'. The current 3x3 board is:
${JSON.stringify(board)}
Return only a JSON object with your best move in this format: {"row": number, "col": number} (0-indexed).`;

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'mimo-sg-v1',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      const parsed = JSON.parse(content);

      if (
        typeof parsed.row === 'number' &&
        typeof parsed.col === 'number' &&
        parsed.row >= 0 &&
        parsed.row <= 2 &&
        parsed.col >= 0 &&
        parsed.col <= 2 &&
        board[parsed.row][parsed.col] === ''
      ) {
        return { row: parsed.row, col: parsed.col };
      }
      throw new Error('Invalid move returned by API');
    } catch {
      // Fallback seamlessly to local unbeatable minimax
      return this.getLocalMinimaxMove(board, player);
    }
  }

  private getLocalMinimaxMove(board: BoardState, player: Player): Move {
    this.fallbackEngine.setBoard(board, player);
    const move = this.fallbackEngine.getBestMoveMinimax(player);
    return move || { row: 0, col: 0 };
  }
}
