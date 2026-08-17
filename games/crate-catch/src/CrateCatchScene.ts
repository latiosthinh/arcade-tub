import { GameScene, InputManager, audio } from '@arcade-carnival/game-engine';
import { Cart } from './Cart.js';
import { StackPhysics } from './StackPhysics.js';
import { FallingItemManager, FallingItem } from './FallingItemManager.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';

interface FactoryGear {
  x: number;
  y: number;
  radius: number;
  teeth: number;
  speed: number;
  angle: number;
}

export class CrateCatchScene implements GameScene {
  cart: Cart;
  stackPhysics: StackPhysics;
  fallingManager: FallingItemManager;
  gameState: GameState;
  particles: ParticleSystem;
  inputManager: InputManager;
  canvas: HTMLCanvasElement;

  conveyorOffsetFront: number = 0;
  conveyorOffsetBack: number = 0;
  factoryGears: FactoryGear[] = [];
  steamTimer: number = 0;

  private onPointerDownHandler: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.cart = new Cart();
    this.stackPhysics = new StackPhysics();
    this.fallingManager = new FallingItemManager();
    this.gameState = new GameState();
    this.particles = new ParticleSystem();
    this.inputManager = new InputManager();

    this.factoryGears = [
      { x: 120, y: 110, radius: 55, teeth: 10, speed: 0.5, angle: 0 },
      { x: 215, y: 85, radius: 42, teeth: 8, speed: -0.65, angle: 0.3 },
      { x: 680, y: 120, radius: 65, teeth: 12, speed: -0.4, angle: 0 },
      { x: 570, y: 90, radius: 45, teeth: 9, speed: 0.58, angle: 0.2 },
    ];

    this.onPointerDownHandler = (e: PointerEvent) => {
      this.handlePointerDown(e);
    };
    this.canvas.addEventListener('pointerdown', this.onPointerDownHandler);
  }

  private handlePointerDown(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (this.gameState.status === 'ready') {
      this.gameState.start();
    } else if (this.gameState.status === 'gameover') {
      this.restart();
    } else if (this.gameState.status === 'paused') {
      this.gameState.resume();
    } else if (this.gameState.status === 'playing') {
      // Allow clicking Bank button in HUD or center screen tap for mobile
      if (clickY > 500 && clickX > 320 && clickX < 480) {
        this.performBank();
      }
    }
  }

  restart(): void {
    this.gameState.restart();
    this.cart.reset();
    this.stackPhysics.reset();
    this.fallingManager.reset();
    this.particles.clear();
  }

  pause(): void {
    this.gameState.pause();
  }

  resume(): void {
    this.gameState.resume();
  }

  destroy(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDownHandler);
    this.inputManager.destroy();
  }

  private performBank(): void {
    const bankRes = this.stackPhysics.bank();
    if (bankRes.crateCount > 0) {
      audio.playPowerup();
      this.gameState.addBankedScore(bankRes.totalPoints, bankRes.crateCount);
      const cartCenter = this.cart.x + this.cart.width / 2;
      this.particles.emitSparks(cartCenter, this.cart.y, 20);
      this.particles.emitGoldenSparkle(cartCenter, this.cart.y - 20, 16);
      this.particles.addFloatingText(
        `+${bankRes.totalPoints} (${bankRes.multiplier}x)`,
        cartCenter,
        this.cart.y - 40,
        '#ffd32a',
        24
      );
    }
  }

  update(dt: number): void {
    if (this.inputManager.justPressed('Escape')) {
      if (this.gameState.status === 'playing') {
        this.gameState.pause();
      } else if (this.gameState.status === 'paused') {
        this.gameState.resume();
      }
      this.inputManager.update();
      return;
    }

    if (this.gameState.status === 'ready') {
      if (this.inputManager.justPressed('Space') || this.inputManager.justPressed('Enter')) {
        this.gameState.start();
      }
      this.inputManager.update();
      return;
    }

    if (this.gameState.status === 'gameover') {
      if (this.inputManager.justPressed('Space') || this.inputManager.justPressed('Enter')) {
        this.restart();
      }
      this.inputManager.update();
      return;
    }

    if (this.gameState.status === 'paused') {
      this.inputManager.update();
      return;
    }

    // Lane switching
    if (this.inputManager.justPressed('KeyW') || this.inputManager.justPressed('ArrowUp')) {
      this.cart.switchLane('back');
    } else if (this.inputManager.justPressed('KeyS') || this.inputManager.justPressed('ArrowDown')) {
      this.cart.switchLane('front');
    }

    // Horizontal Movement
    if (this.inputManager.isDown('KeyA') || this.inputManager.isDown('ArrowLeft')) {
      this.cart.moveLeft(dt);
    } else if (this.inputManager.isDown('KeyD') || this.inputManager.isDown('ArrowRight')) {
      this.cart.moveRight(dt);
    } else {
      this.cart.applyFriction(dt);
    }

    // Banking
    if (this.inputManager.justPressed('Space')) {
      this.performBank();
    }

    // Cart and Stack update
    this.cart.update(dt);
    const stackUpdate = this.stackPhysics.update(dt, this.cart.vx);
    if (stackUpdate.collapsed) {
      const cartCenter = this.cart.x + this.cart.width / 2;
      for (const lost of stackUpdate.lostCrates) {
        this.particles.emitExplosion(cartCenter + lost.offsetX, this.cart.y - 30, 8);
      }
      this.particles.addFloatingText('STACK COLLAPSED!', cartCenter, this.cart.y - 60, '#ff4757', 22);
    }

    // Falling items update
    this.fallingManager.setRound(this.gameState.round);
    const prevMissed = this.fallingManager.missedCrates;
    this.fallingManager.update(dt);

    const newMissed = this.fallingManager.missedCrates - prevMissed;
    if (newMissed > 0) {
      for (let i = 0; i < newMissed; i++) {
        this.gameState.registerMissedCrate();
      }
      audio.playError();
      this.particles.addFloatingText('CRATE LOST!', 200 + Math.random() * 400, 560, '#ff4d4d', 18);
    }

    const colResults = this.fallingManager.checkCatch(this.cart, this.stackPhysics);
    const cartCenter = this.cart.x + this.cart.width / 2;
    for (const res of colResults) {
      if (res.isBomb) {
        audio.playExplosion();
        this.gameState.damageCart(35);
        this.stackPhysics.explodeScatter();
        this.particles.emitExplosion(cartCenter, this.cart.y, 30);
        this.particles.addFloatingText('BOMB HIT! -35 HP', cartCenter, this.cart.y - 40, '#ff3838', 22);
      } else if (res.isRepair) {
        audio.playPowerup();
        this.gameState.repairCart(35);
        this.particles.emitSparks(cartCenter, this.cart.y, 16);
        this.particles.addFloatingText('+35 HP REPAIRED', cartCenter, this.cart.y - 30, '#2ed573', 20);
      } else if (res.isShield) {
        audio.playPowerup();
        this.stackPhysics.activateShield(10.0);
        this.particles.emitSparks(cartCenter, this.cart.y, 20);
        this.particles.addFloatingText('MAGNETIC SHIELD (10s)', cartCenter, this.cart.y - 30, '#00d2d3', 20);
      } else if (res.caught && res.item) {
        audio.playScore();
        const topY = this.stackPhysics.getStackTopY(this.cart.y);
        if (res.item.type === 'crate_golden') {
          this.particles.emitGoldenSparkle(cartCenter, topY, 14);
        } else {
          this.particles.emitCrateLand(cartCenter, topY, 40, 6);
        }
      }
    }
    this.fallingManager.cullOffscreen();

    // Conveyor track animation & steam
    this.conveyorOffsetFront = (this.conveyorOffsetFront + dt * 60) % 24;
    this.conveyorOffsetBack = (this.conveyorOffsetBack + dt * 45) % 24;

    for (const gear of this.factoryGears) {
      gear.angle += gear.speed * dt;
    }

    this.steamTimer += dt;
    if (this.steamTimer >= 0.8) {
      this.steamTimer = 0;
      this.particles.emitSteam(120, 240, 3);
      this.particles.emitSteam(680, 240, 3);
    }

    this.particles.update(dt);
    this.inputManager.update();
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderBackground(ctx);
    this.renderTracks(ctx);

    // Render Back Lane
    this.renderLaneItems(ctx, 'back');
    if (this.cart.lane === 'back') {
      this.renderCartAndStack(ctx);
    }

    // Render Front Lane
    this.renderLaneItems(ctx, 'front');
    if (this.cart.lane === 'front') {
      this.renderCartAndStack(ctx);
    }

    this.particles.render(ctx);
    this.renderHUD(ctx);

    if (this.gameState.status === 'ready') {
      this.renderReadyOverlay(ctx);
    } else if (this.gameState.status === 'paused') {
      this.renderPausedOverlay(ctx);
    } else if (this.gameState.status === 'gameover') {
      this.renderGameOverOverlay(ctx);
    }
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
    bgGrad.addColorStop(0, '#1a162b');
    bgGrad.addColorStop(0.5, '#12101f');
    bgGrad.addColorStop(1, '#08070d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 600);

    // Factory brickwork grid lines
    ctx.strokeStyle = '#27243d';
    ctx.lineWidth = 1;
    for (let y = 60; y < 400; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    for (let x = 0; x < 800; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 60);
      ctx.lineTo(x, 400);
      ctx.stroke();
    }

    // Steampunk Copper Pipes
    ctx.strokeStyle = '#b33939';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.lineTo(60, 260);
    ctx.lineTo(160, 260);
    ctx.stroke();

    ctx.strokeStyle = '#cd6133';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(740, 0);
    ctx.lineTo(740, 260);
    ctx.lineTo(640, 260);
    ctx.stroke();

    // Rotating Industrial Gears
    for (const gear of this.factoryGears) {
      this.drawGear(ctx, gear);
    }
  }

  private drawGear(ctx: CanvasRenderingContext2D, gear: FactoryGear): void {
    ctx.save();
    ctx.translate(gear.x, gear.y);
    ctx.rotate(gear.angle);

    ctx.fillStyle = '#4b4b60';
    ctx.strokeStyle = '#d6a05d';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(0, 0, gear.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Teeth
    for (let i = 0; i < gear.teeth; i++) {
      const a = (i * 2 * Math.PI) / gear.teeth;
      const tx = Math.cos(a) * (gear.radius + 6);
      const ty = Math.sin(a) * (gear.radius + 6);
      ctx.fillStyle = '#d6a05d';
      ctx.fillRect(tx - 4, ty - 4, 8, 8);
    }

    // Inner axle
    ctx.fillStyle = '#222f3e';
    ctx.beginPath();
    ctx.arc(0, 0, gear.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private renderTracks(ctx: CanvasRenderingContext2D): void {
    // Back Track (Blue)
    const backY = 440 + 28 * 0.85; // ~464
    ctx.fillStyle = '#10314b';
    ctx.fillRect(0, backY, 800, 10);
    ctx.strokeStyle = '#0984e3';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, backY, 800, 10);

    // Back Track Stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, backY, 800, 10);
    ctx.clip();
    ctx.strokeStyle = '#74b9ff';
    ctx.lineWidth = 4;
    for (let x = -24 + this.conveyorOffsetBack; x < 824; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, backY);
      ctx.lineTo(x + 12, backY + 10);
      ctx.stroke();
    }
    ctx.restore();

    // Front Track (Yellow)
    const frontY = 520 + 28; // 548
    ctx.fillStyle = '#4a3c10';
    ctx.fillRect(0, frontY, 800, 12);
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, frontY, 800, 12);

    // Front Track Stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, frontY, 800, 12);
    ctx.clip();
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 5;
    for (let x = -24 + this.conveyorOffsetFront; x < 824; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, frontY);
      ctx.lineTo(x + 14, frontY + 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderLaneItems(ctx: CanvasRenderingContext2D, lane: 'front' | 'back'): void {
    const items = this.fallingManager.items.filter((i) => i.alive && i.lane === lane);
    for (const item of items) {
      this.drawFallingItem(ctx, item);
    }
  }

  private drawFallingItem(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    ctx.save();
    const { x, y, width, height, type } = item;

    if (type === 'bomb') {
      // Bomb sphere
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2 + 2, width * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Burning fuse
      ctx.strokeStyle = '#f39c12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y + height / 2 - width * 0.42);
      ctx.quadraticCurveTo(x + width / 2 + 6, y + 2, x + width / 2 + 8, y);
      ctx.stroke();

      // Sparkle on fuse tip
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(x + width / 2 + 7, y - 2, 4, 4);
    } else if (type === 'powerup_repair') {
      // Repair Toolbox
      ctx.fillStyle = '#20bf6b';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#26de81';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // White cross
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + width / 2 - 2, y + 4, 4, height - 8);
      ctx.fillRect(x + 4, y + height / 2 - 2, width - 8, 4);
    } else if (type === 'powerup_shield') {
      // Magnetic Shield Orb
      const grad = ctx.createRadialGradient(
        x + width / 2,
        y + height / 2,
        2,
        x + width / 2,
        y + height / 2,
        width / 2
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#00d2d3');
      grad.addColorStop(1, '#0984e3');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, width * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#54a0ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Color coded according to track lane (Front = Yellow/Amber, Back = Blue/Cyan)
      const isBackLane = item.lane === 'back';
      let baseCol = isBackLane ? '#0984e3' : '#d35400';
      let borderCol = isBackLane ? '#74b9ff' : '#f1c40f';
      let crossCol = isBackLane ? '#00cec9' : '#f39c12';
      let rivetCol = isBackLane ? '#dff9fb' : '#ffeaa7';

      if (type === 'crate_golden') {
        baseCol = isBackLane ? '#00cec9' : '#f1c40f';
        borderCol = isBackLane ? '#55efc4' : '#ffeaa7';
        crossCol = '#ffffff';
        rivetCol = '#ffffff';
      } else if (type === 'crate_large') {
        baseCol = isBackLane ? '#1b4f72' : '#935116';
        borderCol = isBackLane ? '#00cec9' : '#f39c12';
        crossCol = isBackLane ? '#74b9ff' : '#f1c40f';
      }

      ctx.fillStyle = baseCol;
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Diagonal cross brace on crate
      ctx.strokeStyle = crossCol;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y + height);
      ctx.moveTo(x + width, y);
      ctx.lineTo(x, y + height);
      ctx.stroke();

      // Corner metal brackets
      ctx.fillStyle = rivetCol;
      ctx.fillRect(x, y, 4, 4);
      ctx.fillRect(x + width - 4, y, 4, 4);
      ctx.fillRect(x, y + height - 4, 4, 4);
      ctx.fillRect(x + width - 4, y + height - 4, 4, 4);
    }
    ctx.restore();
  }

  private renderCartAndStack(ctx: CanvasRenderingContext2D): void {
    const scale = this.cart.getEffectiveScale();
    const cartX = this.cart.x;
    const cartY = this.cart.y;
    const width = this.cart.width * scale;
    const height = this.cart.height * scale;

    ctx.save();

    // Magnetic shield glow aura
    if (this.stackPhysics.isShieldActive()) {
      ctx.save();
      const topY = this.stackPhysics.getStackTopY(cartY);
      const shieldHeight = cartY + height - topY + 20;
      ctx.strokeStyle = '#00cec9';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00cec9';
      ctx.shadowBlur = 12;
      ctx.strokeRect(cartX - 10, topY - 10, width + 20, shieldHeight);
      ctx.restore();
    }

    // Render Cart Chassis
    ctx.fillStyle = '#b33939';
    ctx.fillRect(cartX, cartY, width, height);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(cartX, cartY, width, height);

    // Front Headlights
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(cartX + 4, cartY + height / 2 - 3, 6, 6);
    ctx.fillRect(cartX + width - 10, cartY + height / 2 - 3, 6, 6);

    // Metallic Wheels
    ctx.fillStyle = '#2f3542';
    ctx.beginPath();
    ctx.arc(cartX + 16 * scale, cartY + height + 2, 6 * scale, 0, Math.PI * 2);
    ctx.arc(cartX + width - 16 * scale, cartY + height + 2, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dcdde1';
    ctx.stroke();

    // Render Stacked Crates with Wobble Angle Tilt
    let currentY = cartY;
    const stackPivotX = cartX + width / 2;

    for (let i = 0; i < this.stackPhysics.crates.length; i++) {
      const c = this.stackPhysics.crates[i];
      if (!c) continue;
      const crateW = c.width * scale;
      const crateH = c.height * scale;
      currentY -= crateH;

      ctx.save();
      // Apply tilt transform around bottom pivot of crate
      const tiltFraction = (i + 1) / Math.max(1, this.stackPhysics.crates.length);
      const angle = this.stackPhysics.wobbleAngle * tiltFraction;

      ctx.translate(stackPivotX + c.offsetX * scale, currentY + crateH);
      ctx.rotate(angle);
      ctx.translate(-crateW / 2, -crateH);

      // Color coded according to crate's lane (Front = Yellow/Amber, Back = Blue/Cyan)
      const isBackLane = c.lane === 'back';
      let baseCol = isBackLane ? '#0984e3' : '#d35400';
      let borderCol = isBackLane ? '#74b9ff' : '#f1c40f';
      let crossCol = isBackLane ? '#00cec9' : '#f39c12';
      let rivetCol = isBackLane ? '#dff9fb' : '#ffeaa7';

      if (c.type === 'crate_golden') {
        baseCol = isBackLane ? '#00cec9' : '#f1c40f';
        borderCol = isBackLane ? '#55efc4' : '#ffeaa7';
        crossCol = '#ffffff';
        rivetCol = '#ffffff';
      } else if (c.type === 'crate_large') {
        baseCol = isBackLane ? '#1b4f72' : '#935116';
        borderCol = isBackLane ? '#00cec9' : '#f39c12';
        crossCol = isBackLane ? '#74b9ff' : '#f1c40f';
      }

      ctx.fillStyle = baseCol;
      ctx.fillRect(0, 0, crateW, crateH);
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, crateW, crateH);

      // Diagonal cross
      ctx.strokeStyle = crossCol;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(crateW, crateH);
      ctx.moveTo(crateW, 0);
      ctx.lineTo(0, crateH);
      ctx.stroke();

      // Corner rivets
      ctx.fillStyle = rivetCol;
      ctx.fillRect(0, 0, 3, 3);
      ctx.fillRect(crateW - 3, 0, 3, 3);
      ctx.fillRect(0, crateH - 3, 3, 3);
      ctx.fillRect(crateW - 3, crateH - 3, 3, 3);

      ctx.restore();
    }

    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // Top HUD Bar background
    ctx.fillStyle = 'rgba(15, 14, 23, 0.9)';
    ctx.fillRect(0, 0, 800, 52);
    ctx.strokeStyle = '#d6a05d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(800, 52);
    ctx.stroke();

    // Durability HP meter
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${this.gameState.hp}/100`, 16, 22);

    ctx.fillStyle = '#333344';
    ctx.fillRect(16, 28, 120, 14);

    const hpRatio = Math.max(0, this.gameState.hp / 100);
    ctx.fillStyle = hpRatio > 0.5 ? '#2ed573' : hpRatio > 0.25 ? '#ffa502' : '#ff4757';
    ctx.fillRect(18, 30, 116 * hpRatio, 10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 28, 120, 14);

    // Center stats: Score, Stack, Multiplier, Round
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd32a';
    ctx.font = "bold 15px 'Courier New', monospace";
    const mult = this.stackPhysics.getMultiplier();
    const count = this.stackPhysics.crates.length;
    ctx.fillText(
      `SCORE: ${this.gameState.score}  |  STACK: ${count} (${mult}x)  |  ROUND ${this.gameState.round}`,
      400,
      24
    );

    // Prompt indicator
    if (count >= 3) {
      ctx.fillStyle = '#2ed573';
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.fillText(`SPACE: BANK STACK (+${this.stackPhysics.crates.reduce((a, b) => a + b.basePoints, 0) * mult} PTS)`, 400, 42);
    } else if (this.stackPhysics.isShieldActive()) {
      ctx.fillStyle = '#00d2d3';
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.fillText(`MAGNETIC SHIELD: ${this.stackPhysics.shieldTimer.toFixed(1)}s`, 400, 42);
    }

    // Right: Missed Crates Allowance (5 items)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#dfe6e9';
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText(`DROPPED: ${this.gameState.missedCrates}/5`, 784, 22);

    for (let i = 0; i < 5; i++) {
      const boxX = 720 + i * 13;
      const boxY = 30;
      if (i < this.gameState.missedCrates) {
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(boxX, boxY, 10, 10);
      } else {
        ctx.fillStyle = '#57606f';
        ctx.fillRect(boxX, boxY, 10, 10);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, 10, 10);
    }

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 9, 18, 0.85)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd32a';
    ctx.font = "bold 38px 'Courier New', monospace";
    ctx.shadowColor = '#d35400';
    ctx.shadowBlur = 10;
    ctx.fillText('CRATE CATCH', 400, 180);

    ctx.fillStyle = '#d6a05d';
    ctx.font = "16px 'Courier New', monospace";
    ctx.shadowBlur = 0;
    ctx.fillText('STEAMPUNK FACTORY SORTING', 400, 215);

    ctx.fillStyle = '#ffffff';
    ctx.font = "14px 'Courier New', monospace";
    ctx.fillText('Controls:', 400, 280);
    ctx.fillStyle = '#74b9ff';
    ctx.fillText('▲/▼ or W/S : Switch Front / Back Tracks', 400, 310);
    ctx.fillText('◄/► or A/D : Move Cart', 400, 335);
    ctx.fillText('SPACE : Bank Stack for Multipliers', 400, 360);

    ctx.fillStyle = '#ffa502';
    ctx.fillText('Rules: Avoid bombs, stack crates high, bank often, do not drop 5 crates!', 400, 410);

    ctx.fillStyle = '#2ed573';
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.fillText('PRESS SPACE OR TAP TO START', 400, 480);
    ctx.restore();
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd32a';
    ctx.font = "bold 34px 'Courier New', monospace";
    ctx.fillText('GAME PAUSED', 400, 280);

    ctx.fillStyle = '#ffffff';
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillText('Press ESC or Tap to Resume', 400, 330);
    ctx.restore();
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 8, 10, 0.9)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4757';
    ctx.font = "bold 34px 'Courier New', monospace";
    ctx.shadowColor = '#ff4757';
    ctx.shadowBlur = 12;
    ctx.fillText('FACTORY SHUTDOWN', 400, 180);

    ctx.fillStyle = '#dfe6e9';
    ctx.font = "16px 'Courier New', monospace";
    ctx.shadowBlur = 0;
    const reason = this.gameState.hp <= 0 ? 'CART DESTROYED BY BOMBS' : 'MAXIMUM CRATES DROPPED (5/5)';
    ctx.fillText(reason, 400, 225);

    ctx.fillStyle = '#ffd32a';
    ctx.font = "bold 22px 'Courier New', monospace";
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, 400, 290);

    ctx.fillStyle = '#74b9ff';
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillText(`BANKED CRATES: ${this.gameState.bankedCratesCount}`, 400, 330);
    ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 365);

    ctx.fillStyle = '#2ed573';
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.fillText('PRESS SPACE OR TAP TO RESTART', 400, 460);
    ctx.restore();
  }
}
