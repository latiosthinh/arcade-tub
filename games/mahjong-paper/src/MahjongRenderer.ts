import { MahjongEngine } from './MahjongEngine.js';
import { MahjongTile } from './MahjongLayoutGenerator.js';
import { TILE_TYPES, TileTypeInfo } from './GameState.js';

export interface MahjongParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class MahjongRenderer {
  public particles: MahjongParticle[] = [];

  // Board layout geometry
  public readonly tileWidth: number = 44;
  public readonly tileHeight: number = 56;
  public readonly layerOffsetX: number = 4;
  public readonly layerOffsetY: number = -4;
  public readonly gridOriginX: number = 80;
  public readonly gridOriginY: number = 100;

  public spawnMatchConfetti(x: number, y: number, color: string): void {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
      });
    }
  }

  public updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }
  }

  public getTileScreenCoords(tile: MahjongTile): { x: number; y: number; w: number; h: number } {
    // Each col unit is half tile width, each row unit is half tile height
    const x = this.gridOriginX + (tile.col * (this.tileWidth / 2)) + (tile.layer * this.layerOffsetX);
    const y = this.gridOriginY + (tile.row * (this.tileHeight / 2)) + (tile.layer * this.layerOffsetY);
    return { x, y, w: this.tileWidth, h: this.tileHeight };
  }

  public render(ctx: CanvasRenderingContext2D, engine: MahjongEngine): void {
    ctx.save();

    // 1. Mat & Background
    this.renderBackground(ctx);

    // 2. Sort tiles by rendering order (layer 0 first -> layer 3, then top-to-bottom row)
    const renderQueue = [...engine.tiles]
      .filter(t => !t.removed)
      .sort((a, b) => {
        if (a.layer !== b.layer) return a.layer - b.layer;
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
      });

    // 3. Render tiles
    for (const tile of renderQueue) {
      this.renderTile(ctx, tile, engine.isTileFree(tile));
    }

    // 4. Confetti particles
    this.renderParticles(ctx);

    // 5. HUD
    this.renderHUD(ctx, engine);

    // 6. Overlays
    this.renderOverlays(ctx, engine);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Washi paper mat background
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, 800, 600);

    // Bamboo tatami subtle grid
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 20; x < 800; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 20; y < 600; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Kraft paper border
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(12, 12, 776, 576);
    ctx.setLineDash([]);
  }

  private renderTile(ctx: CanvasRenderingContext2D, tile: MahjongTile, isFree: boolean): void {
    const coords = this.getTileScreenCoords(tile);
    const info = TILE_TYPES.find(t => t.id === tile.typeId) || TILE_TYPES[0];

    ctx.save();
    ctx.translate(coords.x, coords.y);

    if (tile.selected) {
      ctx.translate(0, -4);
    }

    // Drop shadow (Layered cardstock depth)
    const shadowOffset = 3 + tile.layer * 2;
    ctx.fillStyle = 'rgba(43, 33, 24, 0.22)';
    ctx.fillRect(shadowOffset, shadowOffset, coords.w, coords.h);

    // Cardboard underside base (warm kraft cardstock)
    ctx.fillStyle = '#D8C3A5';
    ctx.fillRect(0, 0, coords.w, coords.h);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, coords.w, coords.h);

    // Face paper cutout (cream washi paper)
    const faceInset = 3;
    const faceBg = tile.selected ? '#FEF08A' : (tile.highlighted ? '#BBF7D0' : '#FFFDF8');
    ctx.fillStyle = faceBg;
    ctx.fillRect(faceInset, faceInset, coords.w - faceInset * 2, coords.h - faceInset * 2);
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(faceInset, faceInset, coords.w - faceInset * 2, coords.h - faceInset * 2);

    // If blocked / locked, dim slightly
    if (!isFree) {
      ctx.fillStyle = 'rgba(43, 33, 24, 0.18)';
      ctx.fillRect(0, 0, coords.w, coords.h);
    }

    // Category banner top pip
    ctx.fillStyle = info.color;
    ctx.fillRect(faceInset + 2, faceInset + 2, coords.w - (faceInset + 2) * 2, 4);

    // Tile Symbol
    ctx.fillStyle = '#2B2118';
    ctx.font = '22px "Comfortaa", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.symbol, coords.w / 2, coords.h / 2 + 1);

    // Deckle edge / Corner trim
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(faceInset + 1, faceInset + 1, coords.w - (faceInset + 1) * 2, coords.h - (faceInset + 1) * 2);

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, engine: MahjongEngine): void {
    ctx.save();

    // Top Bar Note: Score, Tiles Left, Multiplier
    this.drawPaperCard(ctx, 24, 20, 200, 52, '#FFFDF8');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 18px "Patrick Hand", cursive';
    ctx.fillText(`SCORE: ${engine.state.score}`, 36, 42);
    ctx.font = '13px "Comfortaa", sans-serif';
    ctx.fillStyle = 'rgba(43, 33, 24, 0.7)';
    ctx.fillText(`HIGH: ${engine.state.highScore}`, 36, 60);

    this.drawPaperCard(ctx, 300, 20, 200, 52, '#FFFDF8');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 20px "Patrick Hand", cursive';
    ctx.fillText(`TILES LEFT: ${engine.state.tilesRemaining}`, 400, 44);
    if (engine.state.multiplier > 1) {
      ctx.font = 'bold 14px "Patrick Hand", cursive';
      ctx.fillStyle = '#E11D48';
      ctx.fillText(`COMBO x${engine.state.multiplier}!`, 400, 62);
    }

    // Action Controls (Hint, Shuffle, Undo)
    this.drawPaperCard(ctx, 576, 20, 200, 52, '#FFFDF8');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2B2118';
    ctx.font = '13px "Comfortaa", sans-serif';
    ctx.fillText(`[H] Hint (${engine.state.hintsRemaining}) • [S] Shuffle (${engine.state.shufflesRemaining})`, 676, 42);
    ctx.fillText(`[U] Undo (${engine.state.undosRemaining}) • [ESC] Pause`, 676, 60);

    // Bottom info guide
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2B2118';
    ctx.font = '13px "Comfortaa", sans-serif';
    ctx.fillText('Select pairs of free paper tiles to remove them. A tile is free if not covered & has a free edge.', 400, 580);

    ctx.restore();
  }

  private drawPaperCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, bg: string): void {
    ctx.save();
    ctx.fillStyle = 'rgba(43, 33, 24, 0.15)';
    ctx.fillRect(x + 3, y + 3, w, h);

    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Decorative tape top strip
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(x + w / 2 - 20, y - 5, 40, 10);
    ctx.strokeRect(x + w / 2 - 20, y - 5, 40, 10);
    ctx.restore();
  }

  private renderOverlays(ctx: CanvasRenderingContext2D, engine: MahjongEngine): void {
    if (engine.state.status === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
      ctx.fillRect(0, 0, 800, 600);

      this.drawPaperCard(ctx, 180, 130, 440, 340, '#FFFDF8');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 36px "Patrick Hand", cursive';
      ctx.fillText('MAHJONG PAPER', 400, 190);

      ctx.fillStyle = '#2B2118';
      ctx.font = '15px "Comfortaa", sans-serif';
      ctx.fillText('Papercraft Solitaire Tile Matching.', 400, 230);
      ctx.fillText('Match uncovered tiles with free left or right edges.', 400, 260);
      ctx.fillText('Clear the entire paper layout to win!', 400, 290);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px "Patrick Hand", cursive';
      ctx.fillText('Click to Deal Hand', 400, 370);
      ctx.restore();
    } else if (engine.state.status === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
      ctx.fillRect(0, 0, 800, 600);

      this.drawPaperCard(ctx, 240, 210, 320, 180, '#FFFDF8');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2B2118';
      ctx.font = 'bold 32px "Patrick Hand", cursive';
      ctx.fillText('GAME PAUSED', 400, 280);
      ctx.font = '15px "Comfortaa", sans-serif';
      ctx.fillText('Press ESC to Resume', 400, 330);
      ctx.restore();
    } else if (engine.state.status === 'cleared') {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 246, 238, 0.92)';
      ctx.fillRect(0, 0, 800, 600);

      this.drawPaperCard(ctx, 180, 130, 440, 340, '#FFFDF8');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 36px "Patrick Hand", cursive';
      ctx.fillText('BOARD CLEARED! 🎋', 400, 190);

      ctx.fillStyle = '#2B2118';
      ctx.font = 'bold 24px "Patrick Hand", cursive';
      ctx.fillText(`FINAL SCORE: ${engine.state.score}`, 400, 240);
      ctx.font = '16px "Comfortaa", sans-serif';
      ctx.fillText(`Pairs Matched: ${engine.state.matchesMade}`, 400, 280);
      ctx.fillText(`High Score: ${engine.state.highScore}`, 400, 310);

      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 22px "Patrick Hand", cursive';
      ctx.fillText('Click to Play Again', 400, 390);
      ctx.restore();
    }
  }
}
