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
    // 1. Craft paper factory background (#F4EAD4)
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, 800, 600);

    // Stamped factory blueprint grid lines
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.08)';
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

    // Cardboard / Craft paper Pipes with Inked Edges
    ctx.save();
    ctx.strokeStyle = '#C5A880';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.lineTo(60, 260);
    ctx.lineTo(160, 260);
    ctx.stroke();

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(54, 0);
    ctx.lineTo(54, 266);
    ctx.lineTo(160, 266);
    ctx.moveTo(66, 0);
    ctx.lineTo(66, 254);
    ctx.lineTo(160, 254);
    ctx.stroke();

    ctx.strokeStyle = '#D8C3A5';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(740, 0);
    ctx.lineTo(740, 260);
    ctx.lineTo(640, 260);
    ctx.stroke();

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(735, 0);
    ctx.lineTo(735, 265);
    ctx.lineTo(640, 265);
    ctx.moveTo(745, 0);
    ctx.lineTo(745, 255);
    ctx.lineTo(640, 255);
    ctx.stroke();
    ctx.restore();

    // Stamped Papercut Rotating Gears
    for (const gear of this.factoryGears) {
      this.drawGear(ctx, gear);
    }
  }

  private drawGear(ctx: CanvasRenderingContext2D, gear: FactoryGear): void {
    ctx.save();
    ctx.translate(gear.x, gear.y);
    ctx.rotate(gear.angle);

    // Stamped cardboard gear shadow & body
    ctx.fillStyle = 'rgba(62, 39, 35, 0.08)';
    ctx.beginPath();
    ctx.arc(2, 2, gear.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E8DEC8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(0, 0, gear.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Teeth cutouts
    for (let i = 0; i < gear.teeth; i++) {
      const a = (i * 2 * Math.PI) / gear.teeth;
      const tx = Math.cos(a) * (gear.radius + 5);
      const ty = Math.sin(a) * (gear.radius + 5);
      ctx.fillStyle = '#D8C3A5';
      ctx.fillRect(tx - 4, ty - 4, 8, 8);
      ctx.strokeRect(tx - 4, ty - 4, 8, 8);
    }

    // Brass fastener axle
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, gear.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.stroke();

    ctx.restore();
  }

  private renderTracks(ctx: CanvasRenderingContext2D): void {
    // Back Track (Cardboard Kraft Strip)
    const backY = 440 + 28 * 0.85; // ~464
    ctx.fillStyle = '#D8C3A5';
    ctx.fillRect(0, backY, 800, 10);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, backY, 800, 10);

    // Back Track Stitched Ties
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, backY, 800, 10);
    ctx.clip();
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.3)';
    ctx.lineWidth = 3;
    for (let x = -24 + this.conveyorOffsetBack; x < 824; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, backY);
      ctx.lineTo(x + 12, backY + 10);
      ctx.stroke();
    }
    ctx.restore();

    // Front Track (Corrugated Cardboard Strip)
    const frontY = 520 + 28; // 548
    ctx.fillStyle = '#C5A880';
    ctx.fillRect(0, frontY, 800, 12);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, frontY, 800, 12);

    // Front Track Inked Rail Stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, frontY, 800, 12);
    ctx.clip();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
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
      // Papercut Spike Bomb cutout & Drop Shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.beginPath();
      ctx.arc(x + width / 2 + 2, y + height / 2 + 4, width * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Dark brown paper cutout
      ctx.fillStyle = '#3E2723';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2 + 2, width * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Red paper tape warning cross
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(x + width / 2 - 2, y + height / 2 - 6, 4, 16);
      ctx.fillRect(x + width / 2 - 8, y + height / 2, 16, 4);

      // Paper string fuse
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y + height / 2 - width * 0.42);
      ctx.quadraticCurveTo(x + width / 2 + 6, y + 2, x + width / 2 + 8, y);
      ctx.stroke();

      // Yellow spark paper diamond
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(x + width / 2 + 6, y - 3, 5, 5);
    } else if (type === 'powerup_repair') {
      // Papercut Repair First Aid Box
      ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.fillRect(x + 2, y + 2, width, height);

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 4);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // White tape cross
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(x + width / 2 - 3, y + 4, 6, height - 8);
      ctx.fillRect(x + 4, y + height / 2 - 3, width - 8, 6);
    } else if (type === 'powerup_shield') {
      // Papercut Origami Shield Badge
      ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.beginPath();
      ctx.arc(x + width / 2 + 2, y + height / 2 + 2, width * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, width * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner white star cutout
      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 16px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡', x + width / 2, y + height / 2 + 1);
    } else {
      // Construction paper boxes with paper tape cross and drop shadow
      const isBackLane = item.lane === 'back';
      let baseCol = isBackLane ? '#3B82F6' : '#F59E0B';
      let tapeCol = 'rgba(255, 248, 220, 0.9)';

      if (type === 'crate_golden') {
        baseCol = '#10B981';
      } else if (type === 'crate_large') {
        baseCol = isBackLane ? '#1D4ED8' : '#C85A32';
      }

      // Drop shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, width, height, 4);
      ctx.fill();

      // Construction paper body
      ctx.fillStyle = baseCol;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 4);
      ctx.fill();

      // Inked contour
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Paper tape cross
      ctx.fillStyle = tapeCol;
      ctx.fillRect(x + width / 2 - 3, y, 6, height);
      ctx.fillRect(x, y + height / 2 - 3, width, 6);

      ctx.strokeStyle = 'rgba(62, 39, 35, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + width / 2 - 3, y, 6, height);
      ctx.strokeRect(x, y + height / 2 - 3, width, 6);

      // Cardboard corner staples
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(x + 2, y + 2, 3, 3);
      ctx.fillRect(x + width - 5, y + 2, 3, 3);
      ctx.fillRect(x + 2, y + height - 5, 3, 3);
      ctx.fillRect(x + width - 5, y + height - 5, 3, 3);
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
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(cartX - 10, topY - 10, width + 20, shieldHeight);
      ctx.restore();
    }

    // Cardboard Basket Cart Shadow & Body
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.roundRect(cartX + 3, cartY + 3, width, height, 4);
    ctx.fill();

    ctx.fillStyle = '#C85A32';
    ctx.beginPath();
    ctx.roundRect(cartX, cartY, width, height, 4);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tape trim on cart
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(cartX + 6, cartY + 3, width - 12, 6);
    ctx.strokeRect(cartX + 6, cartY + 3, width - 12, 6);

    // Cardboard Wheels
    ctx.fillStyle = '#C5A880';
    ctx.beginPath();
    ctx.arc(cartX + 16 * scale, cartY + height + 2, 6 * scale, 0, Math.PI * 2);
    ctx.arc(cartX + width - 16 * scale, cartY + height + 2, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fastener center on wheels
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(cartX + 16 * scale, cartY + height + 2, 2 * scale, 0, Math.PI * 2);
    ctx.arc(cartX + width - 16 * scale, cartY + height + 2, 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Render Stacked Crates with Paper Edges and Tilt Wobble
    let currentY = cartY;
    const stackPivotX = cartX + width / 2;

    for (let i = 0; i < this.stackPhysics.crates.length; i++) {
      const c = this.stackPhysics.crates[i];
      if (!c) continue;
      const crateW = c.width * scale;
      const crateH = c.height * scale;
      currentY -= crateH;

      ctx.save();
      const tiltFraction = (i + 1) / Math.max(1, this.stackPhysics.crates.length);
      const angle = this.stackPhysics.wobbleAngle * tiltFraction;

      ctx.translate(stackPivotX + c.offsetX * scale, currentY + crateH);
      ctx.rotate(angle);
      ctx.translate(-crateW / 2, -crateH);

      const isBackLane = c.lane === 'back';
      let baseCol = isBackLane ? '#3B82F6' : '#F59E0B';

      if (c.type === 'crate_golden') {
        baseCol = '#10B981';
      } else if (c.type === 'crate_large') {
        baseCol = isBackLane ? '#1D4ED8' : '#C85A32';
      }

      // Drop shadow for stacked crate
      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.beginPath();
      ctx.roundRect(2, 2, crateW, crateH, 3);
      ctx.fill();

      // Crate cutout body
      ctx.fillStyle = baseCol;
      ctx.beginPath();
      ctx.roundRect(0, 0, crateW, crateH, 3);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Paper tape cross
      ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
      ctx.fillRect(crateW / 2 - 3, 0, 6, crateH);
      ctx.fillRect(0, crateH / 2 - 3, crateW, 6);

      ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(crateW / 2 - 3, 0, 6, crateH);
      ctx.strokeRect(0, crateH / 2 - 3, crateW, 6);

      // Staples
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(2, 2, 2, 2);
      ctx.fillRect(crateW - 4, 2, 2, 2);
      ctx.fillRect(2, crateH - 4, 2, 2);
      ctx.fillRect(crateW - 4, crateH - 4, 2, 2);

      ctx.restore();
    }

    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    // Top Placard Header
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, 800, 52);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(800, 52);
    ctx.stroke();

    // Tape strips on top HUD
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(160, 2, 24, 10);
    ctx.strokeRect(160, 2, 24, 10);
    ctx.fillRect(640, 2, 24, 10);
    ctx.strokeRect(640, 2, 24, 10);

    // Durability HP meter
    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`HP: ${this.gameState.hp}/100`, 16, 20);

    ctx.fillStyle = '#E8DEC8';
    ctx.beginPath();
    ctx.roundRect(16, 26, 120, 14, 3);
    ctx.fill();

    const hpRatio = Math.max(0, this.gameState.hp / 100);
    ctx.fillStyle = hpRatio > 0.5 ? '#10B981' : hpRatio > 0.25 ? '#F59E0B' : '#E11D48';
    ctx.beginPath();
    ctx.roundRect(18, 28, 116 * hpRatio, 10, 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 26, 120, 14);

    // Center stats: Score, Stack, Multiplier, Round
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    const mult = this.stackPhysics.getMultiplier();
    const count = this.stackPhysics.crates.length;
    ctx.fillText(
      `SCORE: ${this.gameState.score}   |   STACK: ${count} (${mult}x)   |   ROUND ${this.gameState.round}`,
      400,
      22
    );

    // Prompt indicator
    if (count >= 3) {
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 14px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`SPACE: BANK STACK (+${this.stackPhysics.crates.reduce((a, b) => a + b.basePoints, 0) * mult} PTS)`, 400, 42);
    } else if (this.stackPhysics.isShieldActive()) {
      ctx.fillStyle = '#3B82F6';
      ctx.font = 'bold 14px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`MAGNETIC SHIELD: ${this.stackPhysics.shieldTimer.toFixed(1)}s`, 400, 42);
    }

    // Right: Missed Crates Allowance (5 items)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`DROPPED: ${this.gameState.missedCrates}/5`, 784, 20);

    for (let i = 0; i < 5; i++) {
      const boxX = 720 + i * 13;
      const boxY = 28;
      if (i < this.gameState.missedCrates) {
        ctx.fillStyle = '#E11D48';
      } else {
        ctx.fillStyle = '#E8DEC8';
      }
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, 10, 10, 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.85)';
    ctx.fillRect(0, 0, 800, 600);

    // Taped Cardboard Card
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(180, 100, 440, 400, 10);
    ctx.fill();
    ctx.stroke();

    // Top Tape
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(360, 92, 80, 16);
    ctx.strokeRect(360, 92, 80, 16);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('CRATE CATCH', 400, 150);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('CRAFT PAPER FACTORY SORTING', 400, 185);

    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 16px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('Controls:', 400, 240);

    ctx.fillStyle = '#3B82F6';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText('▲/▼ or W/S : Switch Front / Back Tracks', 400, 275);
    ctx.fillText('◄/► or A/D : Move Cart', 400, 305);
    ctx.fillText('SPACE : Bank Stack for Multipliers', 400, 335);

    ctx.fillStyle = '#E11D48';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Avoid bombs, stack crates high, bank often!', 400, 385);

    // Button
    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(240, 420, 320, 46, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE OR TAP TO START', 400, 448);
    ctx.restore();
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.85)';
    ctx.fillRect(0, 0, 800, 600);

    // Placard
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(240, 200, 320, 200, 8);
    ctx.fill();
    ctx.stroke();

    // Tape
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(360, 192, 80, 16);
    ctx.strokeRect(360, 192, 80, 16);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('GAME PAUSED', 400, 270);

    ctx.fillStyle = '#3E2723';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press ESC or Tap to Resume', 400, 330);
    ctx.restore();
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.9)';
    ctx.fillRect(0, 0, 800, 600);

    // Cardboard Placard
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(180, 120, 440, 360, 10);
    ctx.fill();
    ctx.stroke();

    // Tape
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(230, 112, 60, 16);
    ctx.strokeRect(230, 112, 60, 16);
    ctx.fillRect(510, 112, 60, 16);
    ctx.strokeRect(510, 112, 60, 16);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 38px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('FACTORY SHUTDOWN', 400, 180);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    const reason = this.gameState.hp <= 0 ? 'CART DESTROYED BY BOMBS' : 'MAXIMUM CRATES DROPPED (5/5)';
    ctx.fillText(reason, 400, 220);

    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, 400, 275);

    ctx.fillStyle = '#3B82F6';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`BANKED CRATES: ${this.gameState.bankedCratesCount}`, 400, 315);
    ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 345);

    // Button
    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(240, 390, 320, 48, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE OR TAP TO RESTART', 400, 418);
    ctx.restore();
  }
}
