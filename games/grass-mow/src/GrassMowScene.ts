import { LawnGrid, LAWN_THEMES, CellType } from './LawnGrid';
import { MowerVehicle } from './MowerVehicle';
import { GrassConfetti } from './GrassConfetti';
import { mowerAudio } from './MowerAudio';

export class GrassMowScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning = false;
  private lastTime = 0;

  // Game components
  public grid: LawnGrid;
  public mower: MowerVehicle;
  public confetti: GrassConfetti;
  public currentThemeIndex = 0;

  // Input handling
  private activeTouchId: number | null = null;
  private joystickCenter = { x: 0, y: 0 };
  private joystickPos = { x: 0, y: 0 };
  private isJoystickActive = false;
  private keysPressed: Record<string, boolean> = {};

  // Level progression
  public levelIndex = 0;
  private isLevelComplete = false;
  private levelCompleteTimer = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D context not supported');
    this.ctx = context;

    this.grid = new LawnGrid(36, 24, 18);
    this.grid.loadLevel(this.levelIndex);
    this.mower = new MowerVehicle(this.grid.cols * 9, this.grid.rows * 9);
    this.confetti = new GrassConfetti();

    this.setupEventListeners();
    this.resize();
  }

  public start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  public stop(): void {
    this.isRunning = false;
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.resize());

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      mowerAudio.init();
      this.keysPressed[e.key.toLowerCase()] = true;
      this.keysPressed[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.key.toLowerCase()] = false;
      this.keysPressed[e.code] = false;
    });

    // Touch & Pointer controls for virtual joystick
    this.canvas.addEventListener('pointerdown', (e) => {
      mowerAudio.init();
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check reset/mute button click in top right
      if (clickX >= this.canvas.width - 60 && clickY <= 60) {
        this.nextLevel();
        return;
      }
      if (clickX >= this.canvas.width - 120 && clickX < this.canvas.width - 60 && clickY <= 60) {
        mowerAudio.toggleMute();
        return;
      }

      this.isJoystickActive = true;
      this.joystickCenter = { x: clickX, y: clickY };
      this.joystickPos = { x: clickX, y: clickY };
      this.activeTouchId = e.pointerId;
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isJoystickActive && e.pointerId === this.activeTouchId) {
        const rect = this.canvas.getBoundingClientRect();
        this.joystickPos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    });

    const endTouch = (e: PointerEvent) => {
      if (e.pointerId === this.activeTouchId) {
        this.isJoystickActive = false;
        this.activeTouchId = null;
      }
    };

    window.addEventListener('pointerup', endTouch);
    window.addEventListener('pointercancel', endTouch);
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  private getInputVector(): { x: number; y: number } {
    let inputX = 0;
    let inputY = 0;

    // Arrow keys & WASD
    if (this.keysPressed['arrowleft'] || this.keysPressed['a'] || this.keysPressed['keya']) inputX -= 1;
    if (this.keysPressed['arrowright'] || this.keysPressed['d'] || this.keysPressed['keyd']) inputX += 1;
    if (this.keysPressed['arrowup'] || this.keysPressed['w'] || this.keysPressed['keyw']) inputY -= 1;
    if (this.keysPressed['arrowdown'] || this.keysPressed['s'] || this.keysPressed['keys']) inputY += 1;

    // Virtual Joystick Touch
    if (this.isJoystickActive) {
      const dx = this.joystickPos.x - this.joystickCenter.x;
      const dy = this.joystickPos.y - this.joystickCenter.y;
      const dist = Math.hypot(dx, dy);
      const maxDist = 50;

      if (dist > 5) {
        inputX = dx / Math.min(dist, maxDist);
        inputY = dy / Math.min(dist, maxDist);
      }
    }

    return { x: inputX, y: inputY };
  }

  public nextLevel(): void {
    this.levelIndex++;
    this.currentThemeIndex = (this.currentThemeIndex + 1) % LAWN_THEMES.length;
    this.grid.loadLevel(this.levelIndex);
    this.mower = new MowerVehicle(this.grid.cols * this.grid.cellSize * 0.5, this.grid.rows * this.grid.cellSize * 0.5);
    this.isLevelComplete = false;
    this.levelCompleteTimer = 0;
  }

  private gameLoop(time: number): void {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (time - this.lastTime) / 1000);
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number): void {
    const input = this.getInputVector();
    this.mower.update(input, dt, this.grid);

    // Cut grass under deck
    const deck = this.mower.getCuttingDeck();
    const freshlyCut = this.grid.cutRadius(deck.deckX, deck.deckY, deck.radius);

    // Audio & Confetti
    const isCutting = freshlyCut > 0;
    const speedRatio = this.mower.speed / this.mower.config.maxSpeed;
    mowerAudio.updateEngine(speedRatio, isCutting);

    if (isCutting) {
      const theme = LAWN_THEMES[this.currentThemeIndex];
      this.confetti.spawn(deck.deckX, deck.deckY, this.mower.heading, Math.min(12, freshlyCut * 3), theme.tallGrassColor);
    }

    this.confetti.update(dt);

    // Level completion check
    if (!this.isLevelComplete && this.grid.isCleared()) {
      this.isLevelComplete = true;
      this.levelCompleteTimer = 0;
      mowerAudio.playLevelComplete();
    }

    if (this.isLevelComplete) {
      this.levelCompleteTimer += dt;
      if (this.levelCompleteTimer >= 3.0) {
        this.nextLevel();
      }
    }
  }

  private render(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const theme = LAWN_THEMES[this.currentThemeIndex];

    this.ctx.clearRect(0, 0, width, height);

    // Background garden dirt/decking
    this.ctx.fillStyle = '#2d3748';
    this.ctx.fillRect(0, 0, width, height);

    // Center lawn grid on screen
    const gridPixelWidth = this.grid.cols * this.grid.cellSize;
    const gridPixelHeight = this.grid.rows * this.grid.cellSize;
    const offsetX = Math.floor((width - gridPixelWidth) / 2);
    const offsetY = Math.floor((height - gridPixelHeight) / 2) + 20;

    this.ctx.save();
    this.ctx.translate(offsetX, offsetY);

    // 1. Draw Lawn Base & Cells
    this.renderLawn(theme);

    // 2. Draw Confetti Blades
    this.confetti.render(this.ctx);

    // 3. Draw Mower Vehicle
    this.renderMower();

    this.ctx.restore();

    // 4. Draw HUD Overlay
    this.renderHUD(width, height);

    // 5. Draw Virtual Joystick
    if (this.isJoystickActive) {
      this.renderJoystick();
    }
  }

  private renderLawn(theme: typeof LAWN_THEMES[0]): void {
    const cs = this.grid.cellSize;

    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        const cell = this.grid.cells[r][c];
        const x = c * cs;
        const y = r * cs;

        if (cell.type === CellType.BORDER) {
          // Decorative picket fence / stone boundary
          this.ctx.fillStyle = theme.borderColor;
          this.ctx.fillRect(x, y, cs, cs);
          this.ctx.strokeStyle = '#1e100d';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, cs, cs);
        } else if (cell.type === CellType.OBSTACLE) {
          // Flowerbed planter or zen stone
          this.ctx.fillStyle = theme.obstacleColor;
          this.ctx.beginPath();
          this.ctx.roundRect(x + 1, y + 1, cs - 2, cs - 2, 4);
          this.ctx.fill();

          // Flower blossom dots
          this.ctx.fillStyle = (c + r) % 2 === 0 ? '#E91E63' : '#FFEB3B';
          this.ctx.beginPath();
          this.ctx.arc(x + cs / 2, y + cs / 2, 3, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (cell.type === CellType.CUT_TURF) {
          // Manicured lawn stripe pattern
          this.ctx.fillStyle = (r % 2 === 0) ? theme.cutTurfColor1 : theme.cutTurfColor2;
          this.ctx.fillRect(x, y, cs, cs);
        } else if (cell.type === CellType.TALL_GRASS) {
          // Tall lush grass with blade texture
          this.ctx.fillStyle = theme.tallGrassColor;
          this.ctx.fillRect(x, y, cs, cs);

          // Subtle grass blade details
          this.ctx.fillStyle = '#1B5E20';
          this.ctx.fillRect(x + (cell.bladePattern * 8), y + 2, 2, cs - 4);
        }
      }
    }
  }

  private renderMower(): void {
    const mower = this.mower;
    this.ctx.save();
    this.ctx.translate(mower.x, mower.y);
    this.ctx.rotate(mower.heading);

    // Mower Body (Cute retro tractor style)
    this.ctx.fillStyle = '#E53935'; // Bright red body
    this.ctx.beginPath();
    this.ctx.roundRect(-14, -10, 28, 20, 4);
    this.ctx.fill();

    // Wheels (4 black rounded tires)
    this.ctx.fillStyle = '#212121';
    this.ctx.fillRect(-12, -13, 8, 4);
    this.ctx.fillRect(4, -13, 8, 4);
    this.ctx.fillRect(-12, 9, 8, 4);
    this.ctx.fillRect(4, 9, 8, 4);

    // Front cutting deck hood
    this.ctx.fillStyle = '#D32F2F';
    this.ctx.beginPath();
    this.ctx.arc(mower.config.deckOffset, 0, mower.config.deckRadius * 0.8, -Math.PI / 2, Math.PI / 2);
    this.ctx.fill();

    // Spinning blade indicator
    this.ctx.save();
    this.ctx.translate(mower.config.deckOffset, 0);
    this.ctx.rotate(mower.bladeRotation);
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-10, 0);
    this.ctx.lineTo(10, 0);
    this.ctx.stroke();
    this.ctx.restore();

    // Engine top & driver seat
    this.ctx.fillStyle = '#424242';
    this.ctx.beginPath();
    this.ctx.arc(-2, 0, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // Headlights
    this.ctx.fillStyle = '#FFF59D';
    this.ctx.fillRect(12, -6, 3, 3);
    this.ctx.fillRect(12, 3, 3, 3);

    this.ctx.restore();
  }

  private renderHUD(width: number, height: number): void {
    // Top Bar Container
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.fillRect(0, 0, width, 64);

    // Title & Level
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 16px system-ui, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🌿 Grass Mower — Yard ${this.levelIndex + 1}`, 20, 28);

    const theme = LAWN_THEMES[this.currentThemeIndex];
    this.ctx.font = '12px system-ui, sans-serif';
    this.ctx.fillStyle = '#94A3B8';
    this.ctx.fillText(theme.name, 20, 48);

    // Progress Bar
    const progress = this.grid.getCutPercentage();
    const barWidth = Math.min(220, width * 0.35);
    const barX = width / 2 - barWidth / 2;
    const barY = 22;

    this.ctx.fillStyle = '#334155';
    this.ctx.beginPath();
    this.ctx.roundRect(barX, barY, barWidth, 18, 9);
    this.ctx.fill();

    this.ctx.fillStyle = '#4CAF50';
    this.ctx.beginPath();
    this.ctx.roundRect(barX, barY, (progress / 100) * barWidth, 18, 9);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 11px system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${progress.toFixed(1)}% MOWED`, barX + barWidth / 2, barY + 13);

    // Skip / Sound Buttons
    this.ctx.fillStyle = '#3B82F6';
    this.ctx.beginPath();
    this.ctx.roundRect(width - 55, 14, 40, 36, 6);
    this.ctx.fill();
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 12px system-ui, sans-serif';
    this.ctx.fillText('NEXT', width - 35, 36);

    // Level Complete Modal
    if (this.isLevelComplete) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, width, height);

      this.ctx.fillStyle = '#4CAF50';
      this.ctx.font = 'bold 32px system-ui, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('✨ YARD PERFECTLY MANICURED! ✨', width / 2, height / 2 - 20);

      this.ctx.fillStyle = '#E2E8F0';
      this.ctx.font = '18px system-ui, sans-serif';
      this.ctx.fillText('Next Garden Maze Loading...', width / 2, height / 2 + 25);
    }
  }

  private renderJoystick(): void {
    const center = this.joystickCenter;
    const pos = this.joystickPos;

    // Joystick outer ring
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, 50, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Joystick thumb knob
    const dx = pos.x - center.x;
    const dy = pos.y - center.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, 50);
    const knobX = center.x + (dist > 0 ? (dx / dist) * clampedDist : 0);
    const knobY = center.y + (dist > 0 ? (dy / dist) * clampedDist : 0);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.beginPath();
    this.ctx.arc(knobX, knobY, 22, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
