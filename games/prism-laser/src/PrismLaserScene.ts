import { GameScene } from '@arcade-carnival/game-engine';
import { OpticsEngine, BoardPiece, BeamSegment } from './OpticsEngine.js';
import { PuzzleGridGenerator, PuzzleLevel } from './PuzzleGridGenerator.js';
import { GameState } from './GameState.js';
import { LaserRenderer, CANVAS_WIDTH, CANVAS_HEIGHT } from './LaserRenderer.js';
import { LaserAudio } from './LaserAudio.js';

export class PrismLaserScene implements GameScene {
  private optics: OpticsEngine;
  private currentLevel: PuzzleLevel;
  private pieces: BoardPiece[] = [];
  private beamSegments: BeamSegment[] = [];
  private gameState: GameState;
  private renderer: LaserRenderer;
  private audio: LaserAudio;

  private canvas: HTMLCanvasElement;
  private isSolvedHandled: boolean = false;

  private onPointerDownBound: (e: PointerEvent) => void;
  private onKeyDownBound: (e: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gameState = new GameState();
    this.renderer = new LaserRenderer();
    this.audio = new LaserAudio();

    this.currentLevel = PuzzleGridGenerator.getLevel(1);
    this.optics = new OpticsEngine(this.currentLevel.rows, this.currentLevel.cols);
    this.loadLevel(1);

    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.onPointerDownBound = this.handlePointerDown.bind(this);
    this.onKeyDownBound = this.handleKeyDown.bind(this);

    if (typeof window !== 'undefined') {
      canvas.addEventListener('pointerdown', this.onPointerDownBound);
      window.addEventListener('keydown', this.onKeyDownBound);
    }
  }

  private loadLevel(levelNum: number): void {
    this.currentLevel = PuzzleGridGenerator.getLevel(levelNum);
    this.optics = new OpticsEngine(this.currentLevel.rows, this.currentLevel.cols);
    // Deep clone pieces
    this.pieces = JSON.parse(JSON.stringify(this.currentLevel.pieces));
    this.isSolvedHandled = false;
    this.recalcOptics();
  }

  private recalcOptics(): void {
    const trace = this.optics.traceBeams(this.pieces);
    this.beamSegments = trace.segments;
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.gameState.status === 'ready') {
      this.gameState.startGame();
      return;
    }

    if (this.gameState.status === 'level_cleared') {
      const hasNext = this.gameState.nextLevel(PuzzleGridGenerator.getMaxLevels());
      if (hasNext) {
        this.loadLevel(this.gameState.currentLevelNumber);
      }
      return;
    }

    if (this.gameState.status === 'completed') {
      this.gameState.startGame();
      this.loadLevel(1);
      return;
    }

    if (this.gameState.status !== 'playing') return;

    const rect = this.canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const clickY = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    const { startX, startY, cellSize } = this.renderer.getGridGeometry(
      this.currentLevel.rows,
      this.currentLevel.cols
    );

    const col = Math.floor((clickX - startX) / cellSize);
    const row = Math.floor((clickY - startY) / cellSize);

    if (row >= 0 && row < this.currentLevel.rows && col >= 0 && col < this.currentLevel.cols) {
      const clickedPiece = this.pieces.find(p => p.row === row && p.col === col);
      if (clickedPiece && clickedPiece.rotatable && clickedPiece.type === 'mirror') {
        // Rotate 90 degrees
        clickedPiece.angle = ((clickedPiece.angle ?? 0) + 90) % 180;
        this.gameState.incrementMove();
        this.audio.playRotate();
        this.recalcOptics();
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.gameState.status === 'ready') {
      if (e.code === 'Space' || e.code === 'Enter') {
        this.gameState.startGame();
      }
    } else if (this.gameState.status === 'level_cleared') {
      if (e.code === 'Space' || e.code === 'Enter') {
        const hasNext = this.gameState.nextLevel(PuzzleGridGenerator.getMaxLevels());
        if (hasNext) {
          this.loadLevel(this.gameState.currentLevelNumber);
        }
      }
    } else if (this.gameState.status === 'completed') {
      if (e.code === 'Space' || e.code === 'Enter') {
        this.gameState.startGame();
        this.loadLevel(1);
      }
    }
  }

  public update(dt: number): void {
    if (this.gameState.status !== 'playing') return;

    if (!this.isSolvedHandled) {
      const solved = this.optics.isPuzzleSolved(this.pieces);
      if (solved) {
        this.isSolvedHandled = true;
        this.audio.playCrystalHit();
        this.audio.playLevelSolved();
        this.gameState.clearLevel(this.currentLevel.parMoves);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Board & Grid Background
    this.renderer.renderBoard(ctx, this.currentLevel.rows, this.currentLevel.cols);

    // 2. Laser Light Beams
    this.renderer.renderBeams(
      ctx,
      this.beamSegments,
      this.currentLevel.rows,
      this.currentLevel.cols
    );

    // 3. Optical Pieces & Crystals
    this.renderer.renderPieces(
      ctx,
      this.pieces,
      this.currentLevel.rows,
      this.currentLevel.cols
    );

    // 4. Header HUD
    ctx.fillStyle = '#1A1523';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 56);
    ctx.strokeStyle = '#4A3E5E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 56);
    ctx.lineTo(CANVAS_WIDTH, 56);
    ctx.stroke();

    ctx.font = 'bold 16px "Comfortaa", cursive, sans-serif';
    ctx.textBaseline = 'middle';

    // Left: Level info
    ctx.fillStyle = '#FF3366';
    ctx.textAlign = 'left';
    ctx.fillText(`LEVEL ${this.gameState.currentLevelNumber} / ${PuzzleGridGenerator.getMaxLevels()}`, 20, 28);

    // Center: Moves & Par
    ctx.fillStyle = '#FFFDF8';
    ctx.textAlign = 'center';
    ctx.fillText(`MOVES: ${this.gameState.movesMade} (PAR: ${this.currentLevel.parMoves})`, CANVAS_WIDTH / 2, 28);

    // Right: Score
    ctx.fillStyle = '#33FF77';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${this.gameState.totalScore}`, CANVAS_WIDTH - 20, 28);

    // 5. Overlays
    if (this.gameState.status === 'ready') {
      this.renderReadyOverlay(ctx);
    } else if (this.gameState.status === 'level_cleared') {
      this.renderLevelClearedOverlay(ctx);
    } else if (this.gameState.status === 'completed') {
      this.renderCompletedOverlay(ctx);
    }

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(15, 13, 21, 0.92)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#3399FF';
    ctx.font = 'bold 40px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRISM LASER', CANVAS_WIDTH / 2, 210);

    ctx.fillStyle = '#FF3366';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('OPTICS PUZZLE LAB', CANVAS_WIDTH / 2, 255);

    ctx.fillStyle = '#FAF6EE';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Tap rotatable cardstock mirrors to guide laser beams', CANVAS_WIDTH / 2, 320);
    ctx.fillText('Pass beams through prisms to split into dual colors', CANVAS_WIDTH / 2, 355);
    ctx.fillText('Illuminate all target crystals with matching colors', CANVAS_WIDTH / 2, 390);

    ctx.fillStyle = '#33FF77';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TAP OR PRESS SPACE TO START', CANVAS_WIDTH / 2, 480);
  }

  private renderLevelClearedOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(15, 13, 21, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#33FF77';
    ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('CRYSTALS ACTIVATED!', CANVAS_WIDTH / 2, 230);

    ctx.fillStyle = '#FAF6EE';
    ctx.font = 'bold 22px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`MOVES: ${this.gameState.movesMade}  |  PAR: ${this.currentLevel.parMoves}`, CANVAS_WIDTH / 2, 300);

    ctx.fillStyle = '#FFCC00';
    ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`TOTAL SCORE: ${this.gameState.totalScore}`, CANVAS_WIDTH / 2, 350);

    ctx.fillStyle = '#3399FF';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TAP OR PRESS SPACE FOR NEXT LEVEL', CANVAS_WIDTH / 2, 440);
  }

  private renderCompletedOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(15, 13, 21, 0.95)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF33CC';
    ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('ALL LEVELS CLEARED!', CANVAS_WIDTH / 2, 220);

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 28px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`FINAL SCORE: ${this.gameState.totalScore}`, CANVAS_WIDTH / 2, 290);

    ctx.fillStyle = '#33FF77';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TAP OR PRESS SPACE TO PLAY AGAIN', CANVAS_WIDTH / 2, 420);
  }

  public restart(): void {
    this.loadLevel(this.gameState.currentLevelNumber);
  }

  public pause(): void {}
  public resume(): void {}

  public destroy(): void {
    if (typeof window !== 'undefined') {
      this.canvas.removeEventListener('pointerdown', this.onPointerDownBound);
      window.removeEventListener('keydown', this.onKeyDownBound);
    }
  }
}
