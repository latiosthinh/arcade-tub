export interface TileTheme {
  bg: string;
  text: string;
  glow: string;
  border: string;
}

export const TILE_THEMES: Record<number, TileTheme> = {
  2:    { bg: '#FFFDF8', text: '#3E2723', glow: 'none', border: '#3E2723' },
  4:    { bg: '#FDF6E2', text: '#3E2723', glow: 'none', border: '#3E2723' },
  8:    { bg: '#F59E0B', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
  16:   { bg: '#F97316', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
  32:   { bg: '#E11D48', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
  64:   { bg: '#BE123C', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
  128:  { bg: '#10B981', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
  256:  { bg: '#059669', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
  512:  { bg: '#3B82F6', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
  1024: { bg: '#8B5CF6', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
  2048: { bg: '#EC4899', text: '#FFFDF8', glow: 'none', border: '#3E2723' },
};

export const DEFAULT_HIGH_THEME: TileTheme = {
  bg: '#3E2723',
  text: '#FFFDF8',
  glow: 'none',
  border: '#3E2723',
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
        const row = cells[r];
        if (!row) continue;
        for (let c = 0; c < 4; c++) {
          const val = row[c] ?? 0;
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
      const row = cells[r];
      if (!row) continue;
      for (let c = 0; c < 4; c++) {
        const val = row[c] ?? 0;
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
    // 1. Warm Kraft Paper Background
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper grid pattern
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 20; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 20; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

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
    ctx.font = 'bold 34px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#E11D48';
    ctx.textAlign = 'left';
    ctx.fillText('2048', 20, 50);

    ctx.font = 'bold 11px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.fillText('PAPERCRAFT EDITION', 20, 72);

    // Score Badges
    const badgeW = 76;
    const badgeH = 48;
    const bestX = width - 20 - badgeW;
    const scoreX = bestX - badgeW - 10;

    // Score Card
    this.drawBadge(ctx, scoreX, 24, badgeW, badgeH, 'SCORE', score.toString());
    // High Score Card
    this.drawBadge(ctx, bestX, 24, badgeW, badgeH, 'BEST', highScore.toString());

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
    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, w, h, 6);
    ctx.fill();

    // Sticky Note Card Body
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Tape top strip
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(x + w / 2 - 14, y - 4, 28, 8);
    ctx.strokeRect(x + w / 2 - 14, y - 4, 28, 8);

    ctx.textAlign = 'center';
    ctx.font = 'bold 9px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.fillText(label, x + w / 2, y + 16);

    ctx.font = 'bold 16px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#3E2723';
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

    // Cardboard tray drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.roundRect(bx + 4, by + 4, size, size, 14);
    ctx.fill();

    // Cardboard board tray background
    ctx.fillStyle = '#C5A880';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, size, size, 14);
    ctx.fill();
    ctx.stroke();

    // Inner stitched contour on cardboard
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.roundRect(bx + 4, by + 4, size - 8, size - 8, 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Empty recessed cell slots
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = bx + padding + c * (cellSize + padding);
        const cy = by + padding + r * (cellSize + padding);

        ctx.fillStyle = '#E8DEC8';
        ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cellSize, cellSize, 8);
        ctx.fill();
        ctx.stroke();
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

      // Tile Card Drop Shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.beginPath();
      ctx.roundRect(-cellSize / 2 + 3, -cellSize / 2 + 3, cellSize, cellSize, 8);
      ctx.fill();

      // Tile Card Body
      ctx.fillStyle = theme.bg;
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(-cellSize / 2, -cellSize / 2, cellSize, cellSize, 8);
      ctx.fill();
      ctx.stroke();

      // Number typography
      const strVal = tile.value.toString();
      let fontSize = 32;
      let fontFace = '"Patrick Hand", cursive, sans-serif';
      if (strVal.length === 3) {
        fontSize = 26;
      } else if (strVal.length === 4) {
        fontSize = 18;
        fontFace = '"Comfortaa", cursive, sans-serif';
      } else if (strVal.length >= 5) {
        fontSize = 14;
        fontFace = '"Comfortaa", cursive, sans-serif';
      }

      ctx.font = `bold ${fontSize}px ${fontFace}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = theme.text;
      ctx.fillText(strVal, 0, 1);

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
    this.drawButton(ctx, startX, y, btnW, btnH, 'UNDO', '#3B82F6');

    // Restart Button
    this.drawButton(ctx, startX + btnW + gap, y, btnW, btnH, 'RESTART', '#E11D48');
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
    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, w, h, 8);
    ctx.fill();

    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = accentColor;
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
      ctx.fillStyle = 'rgba(244, 234, 212, 0.9)';
      ctx.fillRect(0, 0, width, height);

      const panelW = 320;
      const panelH = 180;
      const panelX = width / 2 - panelW / 2;
      const panelY = height / 2 - panelH / 2;

      // Drop shadow & Sticky note body
      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.fillRect(panelX + 4, panelY + 4, panelW, panelH);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.strokeRect(panelX, panelY, panelW, panelH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 28px "Patrick Hand", cursive, sans-serif';
      ctx.fillStyle = '#E11D48';
      ctx.fillText('JOIN THE NUMBERS', width / 2, panelY + 55);

      ctx.font = '14px "Comfortaa", cursive, sans-serif';
      ctx.fillStyle = '#3E2723';
      ctx.fillText('Swipe or use arrows to merge', width / 2, panelY + 95);
      ctx.fillText('into the 2048 paper tile!', width / 2, panelY + 120);

      ctx.restore();
    } else if (status === 'won' && !wonAcknowledged) {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
      ctx.fillRect(0, 0, width, height);

      const panelW = 340;
      const panelH = 220;
      const panelX = width / 2 - panelW / 2;
      const panelY = height / 2 - panelH / 2 - 20;

      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.fillRect(panelX + 4, panelY + 4, panelW, panelH);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.strokeRect(panelX, panelY, panelW, panelH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 32px "Patrick Hand", cursive, sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.fillText('2048 REACHED!', width / 2, panelY + 50);

      ctx.font = '14px "Comfortaa", cursive, sans-serif';
      ctx.fillStyle = '#3E2723';
      ctx.fillText('You completed the paper tile puzzle!', width / 2, panelY + 85);

      // Buttons
      this.drawButton(ctx, width / 2 - 130, panelY + 130, 120, 42, 'CONTINUE', '#10B981');
      this.drawButton(ctx, width / 2 + 10, panelY + 130, 120, 42, 'RESTART', '#E11D48');
      ctx.restore();
    } else if (status === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
      ctx.fillRect(0, 0, width, height);

      const panelW = 340;
      const panelH = 220;
      const panelX = width / 2 - panelW / 2;
      const panelY = height / 2 - panelH / 2 - 20;

      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.fillRect(panelX + 4, panelY + 4, panelW, panelH);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.strokeRect(panelX, panelY, panelW, panelH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 32px "Patrick Hand", cursive, sans-serif';
      ctx.fillStyle = '#E11D48';
      ctx.fillText('NO MORE MOVES', width / 2, panelY + 50);

      ctx.font = '14px "Comfortaa", cursive, sans-serif';
      ctx.fillStyle = 'rgba(62, 39, 35, 0.8)';
      ctx.fillText('No valid merges remain on the board.', width / 2, panelY + 85);

      this.drawButton(ctx, width / 2 - 130, panelY + 130, 120, 42, 'TRY AGAIN', '#10B981');
      this.drawButton(ctx, width / 2 + 10, panelY + 130, 120, 42, 'UNDO', '#F59E0B');
      ctx.restore();
    }
  }
}
