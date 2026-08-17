export interface TileTheme {
  bg: string;
  text: string;
  glow: string;
  border: string;
}

export const TILE_THEMES: Record<number, TileTheme> = {
  2: { bg: '#002b36', text: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)', border: '#00f0ff' },
  4: { bg: '#003322', text: '#00ffa3', glow: 'rgba(0, 255, 163, 0.4)', border: '#00ffa3' },
  8: { bg: '#332b00', text: '#ffe600', glow: 'rgba(255, 230, 0, 0.5)', border: '#ffe600' },
  16: { bg: '#331a00', text: '#ff9900', glow: 'rgba(255, 153, 0, 0.5)', border: '#ff9900' },
  32: { bg: '#330d0d', text: '#ff4d4d', glow: 'rgba(255, 77, 77, 0.6)', border: '#ff4d4d' },
  64: { bg: '#330014', text: '#ff0055', glow: 'rgba(255, 0, 85, 0.6)', border: '#ff0055' },
  128: { bg: '#330026', text: '#ff00a0', glow: 'rgba(255, 0, 160, 0.7)', border: '#ff00a0' },
  256: { bg: '#240033', text: '#b537f2', glow: 'rgba(181, 55, 242, 0.7)', border: '#b537f2' },
  512: { bg: '#140033', text: '#6a0dad', glow: 'rgba(106, 13, 173, 0.8)', border: '#a855f7' },
  1024: { bg: '#332900', text: '#ffd700', glow: 'rgba(255, 215, 0, 0.9)', border: '#ffd700' },
  2048: { bg: '#ffffff', text: '#0a0e17', glow: 'rgba(255, 255, 255, 1.0)', border: '#00ffff' },
};

export const DEFAULT_HIGH_THEME: TileTheme = {
  bg: '#05070d',
  text: '#ffffff',
  glow: 'rgba(0, 240, 255, 0.9)',
  border: '#ffffff',
};

export interface AnimatedTile {
  id: string;
  row: number;
  col: number;
  fromRow: number;
  fromCol: number;
  value: number;
  progress: number; // 0 to 1
  duration: number; // in seconds
  scale: number; // for pop and spawn zoom
  isMerging?: boolean;
  isSpawning?: boolean;
}

export class TileRenderer {
  public animatedTiles: AnimatedTile[] = [];
  private tileIdCounter = 0;

  public syncWithGrid(
    cells: number[][],
    moves: Array<{ fromRow: number; fromCol: number; toRow: number; toCol: number; value: number }>,
    merges: Array<{ row: number; col: number; value: number }>,
    spawnedTile?: { row: number; col: number; value: number } | null
  ): void {
    const nextTiles: AnimatedTile[] = [];

    // If we have explicit moves, generate sliding tile animations
    if (moves.length > 0) {
      for (const m of moves) {
        nextTiles.push({
          id: `tile-${++this.tileIdCounter}`,
          row: m.toRow,
          col: m.toCol,
          fromRow: m.fromRow,
          fromCol: m.fromCol,
          value: m.value,
          progress: 0,
          duration: 0.1, // 100ms slide duration
          scale: 1.0,
        });
      }
    } else {
      // Direct grid representation
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = cells[r][c];
          if (val > 0) {
            nextTiles.push({
              id: `tile-${++this.tileIdCounter}`,
              row: r,
              col: c,
              fromRow: r,
              fromCol: c,
              value: val,
              progress: 1,
              duration: 0.1,
              scale: 1.0,
            });
          }
        }
      }
    }

    // Handle merges pop scale
    for (const merge of merges) {
      nextTiles.push({
        id: `tile-merge-${++this.tileIdCounter}`,
        row: merge.row,
        col: merge.col,
        fromRow: merge.row,
        fromCol: merge.col,
        value: merge.value,
        progress: 0,
        duration: 0.15,
        scale: 1.25,
        isMerging: true,
      });
    }

    // Handle spawn scale up
    if (spawnedTile) {
      nextTiles.push({
        id: `tile-spawn-${++this.tileIdCounter}`,
        row: spawnedTile.row,
        col: spawnedTile.col,
        fromRow: spawnedTile.row,
        fromCol: spawnedTile.col,
        value: spawnedTile.value,
        progress: 0,
        duration: 0.12,
        scale: 0.1,
        isSpawning: true,
      });
    }

    this.animatedTiles = nextTiles;
  }

  public update(dt: number, cells: number[][]): void {
    for (const tile of this.animatedTiles) {
      if (tile.progress < 1) {
        tile.progress = Math.min(1, tile.progress + dt / tile.duration);
      }

      if (tile.isSpawning) {
        tile.scale = Math.min(1.0, 0.1 + tile.progress * 0.9);
      } else if (tile.isMerging) {
        // Pop pulse: 1.25 -> 1.0
        tile.scale = 1.0 + (1 - tile.progress) * 0.25;
      }
    }

    // When all slides complete, clean up and lock tiles to current grid values
    const allDone = this.animatedTiles.every((t) => t.progress >= 1);
    if (allDone && this.animatedTiles.some((t) => t.isMerging || t.fromRow !== t.row || t.fromCol !== t.col)) {
      this.syncDirect(cells);
    }
  }

  public syncDirect(cells: number[][]): void {
    const list: AnimatedTile[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = cells[r][c];
        if (val > 0) {
          list.push({
            id: `tile-static-${r}-${c}`,
            row: r,
            col: c,
            fromRow: r,
            fromCol: c,
            value: val,
            progress: 1,
            duration: 0.1,
            scale: 1.0,
          });
        }
      }
    }
    this.animatedTiles = list;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cells: number[][],
    score: number,
    highScore: number,
    status: string,
    wonAcknowledged: boolean
  ): void {
    // 1. Dark Cyber Background
    ctx.fillStyle = '#070a13';
    ctx.fillRect(0, 0, width, height);

    // Subtle background cyber grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. HUD Header (Score, Best, Title)
    this.renderHUD(ctx, width, score, highScore);

    // 3. Board Container & Slots
    const boardSize = Math.min(width - 32, 360);
    const boardX = (width - boardSize) / 2;
    const boardY = 140;
    const padding = 10;
    const cellSize = (boardSize - padding * 5) / 4;

    this.renderBoardContainer(ctx, boardX, boardY, boardSize, cellSize, padding);

    // 4. Render Active Animated Tiles
    this.renderTiles(ctx, boardX, boardY, cellSize, padding);

    // 5. Render Buttons (Undo, Restart)
    this.renderControls(ctx, width, boardY + boardSize + 20);

    // 6. Modal Overlays (Ready, Won, GameOver)
    this.renderOverlays(ctx, width, height, status, wonAcknowledged);
  }

  private renderHUD(
    ctx: CanvasRenderingContext2D,
    width: number,
    score: number,
    highScore: number
  ): void {
    ctx.save();

    // Game Title
    ctx.font = '900 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'left';
    ctx.fillText('2048', 20, 48);

    ctx.font = '800 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('NEON EDITION', 20, 68);

    // Score Badges
    const badgeW = 76;
    const badgeH = 46;
    const bestX = width - 20 - badgeW;
    const scoreX = bestX - badgeW - 10;

    // Score Card
    this.drawBadge(ctx, scoreX, 26, badgeW, badgeH, 'SCORE', score.toString());
    // High Score Card
    this.drawBadge(ctx, bestX, 26, badgeW, badgeH, 'BEST', highScore.toString());

    ctx.restore();
  }

  private drawBadge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string
  ): void {
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '700 9px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(label, x + w / 2, y + 15);

    ctx.font = '900 15px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 4;
    ctx.fillText(value, x + w / 2, y + 36);
    ctx.restore();
  }

  private renderBoardContainer(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    size: number,
    cellSize: number,
    padding: number
  ): void {
    ctx.save();

    // Board background
    ctx.fillStyle = '#0c1322';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, size, size, 12);
    ctx.fill();
    ctx.stroke();

    // Empty cell slots
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = bx + padding + c * (cellSize + padding);
        const cy = by + padding + r * (cellSize + padding);

        ctx.fillStyle = '#151e33';
        ctx.beginPath();
        ctx.roundRect(cx, cy, cellSize, cellSize, 8);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderTiles(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    cellSize: number,
    padding: number
  ): void {
    for (const tile of this.animatedTiles) {
      if (tile.value <= 0) continue;

      // Interpolate position
      const fromX = bx + padding + tile.fromCol * (cellSize + padding);
      const fromY = by + padding + tile.fromRow * (cellSize + padding);
      const toX = bx + padding + tile.col * (cellSize + padding);
      const toY = by + padding + tile.row * (cellSize + padding);

      const curX = fromX + (toX - fromX) * tile.progress;
      const curY = fromY + (toY - fromY) * tile.progress;

      const theme = TILE_THEMES[tile.value] ?? DEFAULT_HIGH_THEME;

      ctx.save();
      ctx.translate(curX + cellSize / 2, curY + cellSize / 2);
      ctx.scale(tile.scale, tile.scale);

      // Tile Card Body
      ctx.fillStyle = theme.bg;
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;
      ctx.shadowColor = theme.glow;
      ctx.shadowBlur = tile.value >= 128 ? 16 : 8;

      ctx.beginPath();
      ctx.roundRect(-cellSize / 2, -cellSize / 2, cellSize, cellSize, 8);
      ctx.fill();
      ctx.stroke();

      // Number typography
      const strVal = tile.value.toString();
      let fontSize = 28;
      if (strVal.length === 3) fontSize = 24;
      else if (strVal.length === 4) fontSize = 19;
      else if (strVal.length >= 5) fontSize = 15;

      ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = theme.text;
      ctx.shadowColor = theme.text;
      ctx.shadowBlur = 6;
      ctx.fillText(strVal, 0, 0);

      ctx.restore();
    }
  }

  private renderControls(ctx: CanvasRenderingContext2D, width: number, y: number): void {
    ctx.save();
    const btnW = 120;
    const btnH = 40;
    const gap = 16;
    const totalW = btnW * 2 + gap;
    const startX = (width - totalW) / 2;

    // Undo Button
    this.drawButton(ctx, startX, y, btnW, btnH, 'UNDO', '#3b82f6');

    // Restart Button
    this.drawButton(ctx, startX + btnW + gap, y, btnW, btnH, 'RESTART', '#ef4444');
    ctx.restore();
  }

  public drawButton(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    accentColor: string
  ): void {
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
  }

  private renderOverlays(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    status: string,
    wonAcknowledged: boolean
  ): void {
    if (status === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 19, 0.75)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.font = '900 22px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillText('SWIPE OR USE ARROWS', width / 2, height / 2 - 20);

      ctx.font = '600 14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.shadowBlur = 0;
      ctx.fillText('Join numbers to reach 2048 neon tile!', width / 2, height / 2 + 15);
      ctx.restore();
    } else if (status === 'won' && !wonAcknowledged) {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 19, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.font = '900 28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 16;
      ctx.fillText('2048 UNLOCKED!', width / 2, height / 2 - 50);

      ctx.font = '700 15px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText('You conquered the cyber grid!', width / 2, height / 2 - 15);

      // Buttons
      this.drawButton(ctx, width / 2 - 130, height / 2 + 25, 120, 42, 'CONTINUE', '#00ffa3');
      this.drawButton(ctx, width / 2 + 10, height / 2 + 25, 120, 42, 'RESTART', '#ef4444');
      ctx.restore();
    } else if (status === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 10, 19, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.font = '900 28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 16;
      ctx.fillText('GAME OVER', width / 2, height / 2 - 40);

      ctx.font = '600 14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.shadowBlur = 0;
      ctx.fillText('No valid moves left on the grid.', width / 2, height / 2 - 10);

      this.drawButton(ctx, width / 2 - 130, height / 2 + 25, 120, 42, 'TRY AGAIN', '#00f0ff');
      this.drawButton(ctx, width / 2 + 10, height / 2 + 25, 120, 42, 'UNDO', '#3b82f6');
      ctx.restore();
    }
  }
}
