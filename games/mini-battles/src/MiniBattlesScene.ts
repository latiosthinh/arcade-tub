import { GameScene } from '@arcade-carnival/game-engine';
import { PartyEngine } from './PartyEngine.js';
import { BattleRenderer } from './BattleRenderer.js';
import { BattleParticles } from './BattleParticles.js';
import { BattleAudio } from './BattleAudio.js';
import { MINI_GAMES } from './GameState.js';

export class MiniBattlesScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private engine: PartyEngine;
  private renderer: BattleRenderer;
  private particles: BattleParticles;
  private audio: BattleAudio;

  private isPaused: boolean = false;
  private isMuted: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.audio = new BattleAudio();
    this.particles = new BattleParticles();
    this.renderer = new BattleRenderer();

    this.engine = new PartyEngine({
      onSFX: (name) => this.audio.playSFX(name),
      onRoundEnd: (winner) => {
        if (winner && winner !== 'draw') {
          this.particles.emitConfetti(this.canvas.width / 2, this.canvas.height / 2, 40);
        }
      },
      onMatchEnd: () => {
        this.particles.emitConfetti(this.canvas.width / 2, this.canvas.height / 2, 80);
      },
    });

    this.setupControls();
  }

  private setupControls(): void {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      if (this.isPaused) return;

      if (e.key === 'w' || e.key === 'W' || e.key === 'a' || e.key === 'A' || e.key === ' ') {
        this.engine.handleInput('p1');
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === 'Enter') {
        this.engine.handleInput('p2');
      } else if (e.key === 'm' || e.key === 'M') {
        this.isMuted = this.audio.toggleMute();
      }
    });

    // Touch / Pointer controls (split screen left/right or button taps)
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.isPaused) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Check Menu UI clicks
      if (this.engine.matchState.screen === 'menu') {
        // Prev mode button
        if (x >= 180 && x <= 240 && y >= 250 && y <= 310) {
          this.engine.prevMode();
          this.audio.playSFX('tap');
          return;
        }
        // Next mode button
        if (x >= 560 && x <= 620 && y >= 250 && y <= 310) {
          this.engine.nextMode();
          this.audio.playSFX('tap');
          return;
        }
        // CPU vs 2P toggle button
        if (x >= 280 && x <= 520 && y >= 340 && y <= 390) {
          this.engine.toggleCPU();
          this.audio.playSFX('tap');
          return;
        }
        // Difficulty toggle button
        if (x >= 280 && x <= 520 && y >= 410 && y <= 450) {
          this.engine.cycleDifficulty();
          this.audio.playSFX('tap');
          return;
        }
        // Start Battle Button
        if (x >= 260 && x <= 540 && y >= 480 && y <= 540) {
          this.engine.startMatch();
          return;
        }
      }

      // In gameplay: Left half touches P1, Right half touches P2
      if (x < this.canvas.width / 2) {
        this.engine.handleInput('p1');
      } else {
        this.engine.handleInput('p2');
      }
    });
  }

  public update(dt: number): void {
    if (this.isPaused) return;
    this.engine.update(dt);
    this.particles.update(dt);
  }

  public render(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.renderer.renderStage(this.ctx, w, h);

    if (this.engine.matchState.screen === 'menu') {
      this.renderMenu(w, h);
    } else {
      this.renderer.renderHUD(this.ctx, this.engine.matchState, w);

      if (this.engine.currentBattle) {
        this.renderer.renderBattle(this.ctx, this.engine.currentBattle, w, h);
      }

      if (this.engine.matchState.screen === 'countdown') {
        this.renderCountdown(w, h);
      } else if (this.engine.matchState.screen === 'round-over') {
        this.renderRoundOver(w, h);
      } else if (this.engine.matchState.screen === 'match-over') {
        this.renderMatchOver(w, h);
      }
    }

    this.particles.render(this.ctx);
  }

  private renderMenu(width: number, height: number): void {
    const ctx = this.ctx;
    ctx.save();

    // Main Title Banner
    ctx.fillStyle = '#E74C3C';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 220, 70, 440, 75, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FAF6EE';
    ctx.font = 'bold 38px "Cabin Sketch", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('12 MINI BATTLES', width / 2, 120);

    // Subtitle
    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 16px "Comfortaa", sans-serif';
    ctx.fillText('Papercraft Duel Arena', width / 2, 175);

    // Carousel Selector
    const mode = MINI_GAMES[this.engine.matchState.selectedModeIndex];
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(260, 240, 280, 80, 10);
    ctx.fill();
    ctx.stroke();

    // Arrows
    ctx.fillStyle = '#FAF0CA';
    ctx.fillRect(190, 255, 50, 50);
    ctx.strokeRect(190, 255, 50, 50);
    ctx.fillRect(560, 255, 50, 50);
    ctx.strokeRect(560, 255, 50, 50);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('◀', 215, 288);
    ctx.fillText('▶', 585, 288);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 20px "Cabin Sketch", cursive, sans-serif';
    ctx.fillText(mode.name, width / 2, 275);
    ctx.font = '12px "Comfortaa", sans-serif';
    ctx.fillText(mode.instructions, width / 2, 305);

    // CPU Toggle Button
    ctx.fillStyle = this.engine.matchState.vsCPU ? '#3498DB' : '#2ECC71';
    ctx.beginPath();
    ctx.roundRect(280, 340, 240, 45, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 16px "Comfortaa", sans-serif';
    ctx.fillText(
      this.engine.matchState.vsCPU ? 'Mode: 1P vs CPU' : 'Mode: 2 Player Duel',
      width / 2,
      368
    );

    // Difficulty Button
    if (this.engine.matchState.vsCPU) {
      ctx.fillStyle = '#F39C12';
      ctx.beginPath();
      ctx.roundRect(300, 405, 200, 35, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 14px "Comfortaa", sans-serif';
      ctx.fillText(`AI: ${this.engine.matchState.cpuDifficulty.toUpperCase()}`, width / 2, 428);
    }

    // Play Button
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.roundRect(280, 470, 240, 55, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px "Cabin Sketch", cursive, sans-serif';
    ctx.fillText('START DUEL (W / TAP)', width / 2, 506);

    ctx.restore();
  }

  private renderCountdown(width: number, height: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(43, 33, 24, 0.4)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#F1C40F';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 4;
    ctx.font = 'bold 72px "Cabin Sketch", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const val = this.engine.matchState.countdownValue;
    const text = val > 0 ? `${val}` : 'FIGHT!';
    ctx.fillText(text, width / 2, height / 2);
    ctx.strokeText(text, width / 2, height / 2);
    ctx.restore();
  }

  private renderRoundOver(width: number, height: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#FAF0CA';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 180, height / 2 - 70, 360, 140, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 28px "Cabin Sketch", cursive, sans-serif';
    ctx.textAlign = 'center';
    const winner = this.engine.matchState.roundWinner;
    const text = winner === 'draw' ? 'DRAW ROUND!' : `${winner?.toUpperCase()} WINS ROUND!`;
    ctx.fillText(text, width / 2, height / 2 - 15);

    ctx.font = 'bold 15px "Comfortaa", sans-serif';
    ctx.fillText('Tap to continue...', width / 2, height / 2 + 35);
    ctx.restore();
  }

  private renderMatchOver(width: number, height: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#FAF6EE';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 200, height / 2 - 90, 400, 180, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.engine.matchState.matchWinner === 'p1' ? '#E74C3C' : '#3498DB';
    ctx.font = 'bold 36px "Cabin Sketch", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🏆 ${this.engine.matchState.matchWinner?.toUpperCase()} CHAMPION! 🏆`, width / 2, height / 2 - 25);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 16px "Comfortaa", sans-serif';
    ctx.fillText(
      `Final Score: P1 [${this.engine.matchState.p1Score}] - [${this.engine.matchState.p2Score}] P2`,
      width / 2,
      height / 2 + 20
    );
    ctx.font = '14px "Comfortaa", sans-serif';
    ctx.fillText('Tap anywhere to return to Menu', width / 2, height / 2 + 55);
    ctx.restore();
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }
}
