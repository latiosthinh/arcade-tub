import type { GameScene } from '@arcade-carnival/game-engine';
import { InputManager } from '@arcade-carnival/game-engine';
import { MahjongEngine } from './MahjongEngine.js';
import { MahjongRenderer } from './MahjongRenderer.js';
import { MahjongAudio } from './MahjongAudio.js';
import { TILE_TYPES } from './GameState.js';

export class MahjongScene implements GameScene {
  public engine: MahjongEngine;
  public renderer: MahjongRenderer;
  public audio: MahjongAudio;
  public input: InputManager;
  private canvas: HTMLCanvasElement;

  private boundOnMouseDown: (e: MouseEvent) => void;
  private boundOnTouchStart: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement, input?: InputManager) {
    this.canvas = canvas;
    this.input = input || new InputManager();
    this.engine = new MahjongEngine();
    this.renderer = new MahjongRenderer();
    this.audio = new MahjongAudio();

    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnTouchStart = this.onTouchStart.bind(this);

    this.canvas.addEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.addEventListener('touchstart', this.boundOnTouchStart, { passive: false });
  }

  public destroy(): void {
    this.canvas.removeEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.removeEventListener('touchstart', this.boundOnTouchStart);
    this.input.destroy();
  }

  public pause(): void {
    this.engine.state.pause();
  }

  public resume(): void {
    this.engine.state.resume();
  }

  private getCanvasPos(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / (rect.width || this.canvas.width);
    const scaleY = this.canvas.height / (rect.height || this.canvas.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    this.handleClick(e.clientX, e.clientY);
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.handleClick(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  private handleClick(clientX: number, clientY: number): void {
    const status = this.engine.state.status;
    if (status === 'ready' || status === 'cleared' || status === 'gameover') {
      this.engine.initBoard();
      this.audio.playShuffle();
      return;
    }

    if (status === 'playing') {
      const { x, y } = this.getCanvasPos(clientX, clientY);

      // Check for HUD Action Button Clicks
      if (y >= 20 && y <= 72) {
        if (x >= 576 && x <= 640) {
          // Hint
          if (this.engine.showHint()) {
            this.audio.playSelect();
          }
          return;
        } else if (x > 640 && x <= 710) {
          // Shuffle
          if (this.engine.shuffleRemaining()) {
            this.audio.playShuffle();
          }
          return;
        } else if (x > 710 && x <= 776) {
          // Undo
          if (this.engine.undoMove()) {
            this.audio.playUndo();
          }
          return;
        }
      }

      // Check clicked tile (top-most layer first)
      const sortedTiles = [...this.engine.tiles]
        .filter(t => !t.removed)
        .sort((a, b) => b.layer - a.layer || b.row - a.row || b.col - a.col);

      for (const tile of sortedTiles) {
        const bounds = this.renderer.getTileScreenCoords(tile);
        if (
          x >= bounds.x &&
          x <= bounds.x + bounds.w &&
          y >= bounds.y &&
          y <= bounds.y + bounds.h
        ) {
          if (this.engine.isTileFree(tile)) {
            const res = this.engine.selectTile(tile.id);
            if (res.matched) {
              this.audio.playMatch();
              const info = TILE_TYPES.find(t => t.id === tile.typeId) || TILE_TYPES[0];
              this.renderer.spawnMatchConfetti(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, info.color);
              if (res.cleared) {
                this.audio.playVictory();
              }
            } else {
              this.audio.playSelect();
            }
          }
          break;
        }
      }
    }
  }

  public update(dt: number): void {
    if (this.input.justPressed('Escape')) {
      if (this.engine.state.status === 'playing') {
        this.engine.state.pause();
      } else if (this.engine.state.status === 'paused') {
        this.engine.state.resume();
      }
    }

    if (this.engine.state.status === 'playing') {
      if (this.input.justPressed('KeyH')) {
        if (this.engine.showHint()) this.audio.playSelect();
      }
      if (this.input.justPressed('KeyS')) {
        if (this.engine.shuffleRemaining()) this.audio.playShuffle();
      }
      if (this.input.justPressed('KeyU')) {
        if (this.engine.undoMove()) this.audio.playUndo();
      }
    }

    this.engine.state.update(dt);
    this.renderer.updateParticles(dt);
    this.input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(ctx, this.engine);
  }
}
