import type { GameScene } from '@arcade-carnival/game-engine';
import { InputManager } from '@arcade-carnival/game-engine';
import { PotionMergeEngine } from './PotionMergeEngine.js';
import { PotionRenderer } from './PotionRenderer.js';
import { PotionAudio } from './PotionAudio.js';
import { POTION_TIERS } from './GameState.js';

export class PotionScene implements GameScene {
  public engine: PotionMergeEngine;
  public renderer: PotionRenderer;
  public audio: PotionAudio;
  public input: InputManager;
  private canvas: HTMLCanvasElement;

  private boundOnMouseMove: (e: MouseEvent) => void;
  private boundOnMouseDown: (e: MouseEvent) => void;
  private boundOnTouchMove: (e: TouchEvent) => void;
  private boundOnTouchStart: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement, input?: InputManager) {
    this.canvas = canvas;
    this.input = input || new InputManager();
    this.engine = new PotionMergeEngine();
    this.renderer = new PotionRenderer();
    this.audio = new PotionAudio();

    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchStart = this.onTouchStart.bind(this);

    this.canvas.addEventListener('mousemove', this.boundOnMouseMove);
    this.canvas.addEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
    this.canvas.addEventListener('touchstart', this.boundOnTouchStart, { passive: false });
  }

  public destroy(): void {
    this.canvas.removeEventListener('mousemove', this.boundOnMouseMove);
    this.canvas.removeEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.removeEventListener('touchmove', this.boundOnTouchMove);
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

  private onMouseMove(e: MouseEvent): void {
    if (this.engine.state.status === 'playing') {
      const pos = this.getCanvasPos(e.clientX, e.clientY);
      this.engine.moveDropper(pos.x);
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    this.handleActionClick(e.clientX, e.clientY);
  }

  private onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0 && this.engine.state.status === 'playing') {
      const pos = this.getCanvasPos(e.touches[0].clientX, e.touches[0].clientY);
      this.engine.moveDropper(pos.x);
    }
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.handleActionClick(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  private handleActionClick(clientX: number, clientY: number): void {
    const status = this.engine.state.status;
    if (status === 'ready' || status === 'gameover') {
      this.engine.reset();
      this.audio.playDrop();
      return;
    }

    if (status === 'playing') {
      const pos = this.getCanvasPos(clientX, clientY);
      this.engine.moveDropper(pos.x);
      const dropped = this.engine.dropPotion();
      if (dropped) {
        this.audio.playDrop();
      }
    }
  }

  public update(dt: number): void {
    // Keyboard inputs
    if (this.input.justPressed('Escape')) {
      if (this.engine.state.status === 'playing') {
        this.engine.state.pause();
      } else if (this.engine.state.status === 'paused') {
        this.engine.state.resume();
      }
    }

    if (this.input.justPressed('Space') || this.input.justPressed('Enter')) {
      if (this.engine.state.status === 'ready' || this.engine.state.status === 'gameover') {
        this.engine.reset();
        this.audio.playDrop();
      } else if (this.engine.state.status === 'playing') {
        const dropped = this.engine.dropPotion();
        if (dropped) {
          this.audio.playDrop();
        }
      }
    }

    if (this.engine.state.status === 'playing') {
      if (this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) {
        this.engine.shiftDropper(-1, dt);
      }
      if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) {
        this.engine.shiftDropper(1, dt);
      }
    }

    const prevStatus = this.engine.state.status;
    const mergeEvents = this.engine.update(dt);

    for (const evt of mergeEvents) {
      this.audio.playMerge(evt.mergedTier);
      const tierDef = POTION_TIERS[evt.mergedTier - 1] || POTION_TIERS[POTION_TIERS.length - 1];
      this.renderer.spawnMergeSparkles(evt.x, evt.y, tierDef.color);
    }

    if (prevStatus === 'playing' && this.engine.state.status === 'gameover') {
      this.audio.playGameOver();
    }

    this.renderer.updateParticles(dt);
    this.input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(ctx, this.engine);
  }
}
