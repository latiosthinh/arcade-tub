import {
  TileType,
  SubTileMask,
  CardinalDirection,
  TankTier,
  EnemyType,
  PowerUpType,
  PowerUpItem,
  Bullet,
  PlayerTankState,
  EnemyTankState,
  HUDState,
  GameState,
  StageTallyResult,
  RenderSceneData,
  RenderPassConfig,
} from './types';
import { ParticleEmitter } from './ParticleEmitter';
import { CELL_SIZE, GRID_COLS, GRID_ROWS, ARENA_SIZE } from './GridMap';

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 416;
export const SIDEBAR_WIDTH = 64;
export const ARENA_WIDTH = ARENA_SIZE;
export const ARENA_HEIGHT = ARENA_SIZE;

const TIER_COLORS: Record<TankTier, { body: string; dark: string; light: string; accent: string }> = {
  [TankTier.TIER_1]: { body: '#f39c12', dark: '#b9770e', light: '#f8c471', accent: '#d35400' }, // Mustard Yellow
  [TankTier.TIER_2]: { body: '#27ae60', dark: '#1e8449', light: '#58d68d', accent: '#196f3d' }, // Olive Green
  [TankTier.TIER_3]: { body: '#16a085', dark: '#117864', light: '#48c9b0', accent: '#0e6252' }, // Steel Cyan
  [TankTier.TIER_4]: { body: '#d35400', dark: '#a04000', light: '#f39c12', accent: '#f1c40f' }, // Royal Gold / Flame
};

const ENEMY_COLORS: Record<EnemyType, { body: string; dark: string; light: string; accent: string }> = {
  [EnemyType.BASIC]: { body: '#bdc3c7', dark: '#95a5a6', light: '#ecf0f1', accent: '#7f8c8d' }, // Silver Grey
  [EnemyType.FAST]: { body: '#2ecc71', dark: '#27ae60', light: '#a9dfbf', accent: '#1e8449' }, // Emerald Green
  [EnemyType.POWER]: { body: '#c0392b', dark: '#962d22', light: '#e74c3c', accent: '#641e16' }, // Crimson Red
  [EnemyType.ARMOR]: { body: '#16a085', dark: '#117864', light: '#48c9b0', accent: '#0e6252' }, // Armor Base
};

const ARMOR_HP_COLORS: Record<string, { body: string; dark: string; light: string; accent: string }> = {
  GREEN: { body: '#27ae60', dark: '#1e8449', light: '#58d68d', accent: '#196f3d' },
  YELLOW: { body: '#f1c40f', dark: '#b7950b', light: '#f9e79f', accent: '#7d6608' },
  ORANGE: { body: '#e67e22', dark: '#af601a', light: '#f5b041', accent: '#784212' },
  WHITE: { body: '#ecf0f1', dark: '#bdc3c7', light: '#ffffff', accent: '#95a5a6' },
};

/**
 * TankRenderer implements a multi-pass Canvas 2D cardboard renderer for Tank 1990.
 *
 * Strict 5-Pass Visual Hierarchy:
 * - Pass 1: Ground Layer (Dark Cardboard Arena, Water Folds, Ice Gloss, Chipped Bricks, Steel Rivets, Eagle HQ)
 * - Pass 2: Entities (Tread Tracks, Player Tank, Enemy Tanks, Projectiles, PowerUps)
 * - Pass 3: Canopy Camouflage Overlay (Trees & Grass rendering *over* tanks and bullets)
 * - Pass 4: Particle FX (Paper Confetti, Debris Crumbs, Sparks, Dust Puffs)
 * - Pass 5: HUD Sidebar & State Overlays (Curtain Intro, Tally Plaque, Victory/Game Over, Title)
 */
export class TankRenderer {
  private config: RenderPassConfig;

  constructor(config: RenderPassConfig = {}) {
    this.config = {
      enableShadows: config.enableShadows ?? true,
      enableGridOverlay: config.enableGridOverlay ?? false,
    };
  }

  /**
   * Main rendering entrypoint executing all 5 passes in strict visual sequence.
   */
  public renderScene(
    ctx: CanvasRenderingContext2D,
    renderData: RenderSceneData,
    particleEmitter?: ParticleEmitter
  ): void {
    const time = renderData.time ?? performance.now() / 1000;

    // Reset entire canvas background
    ctx.save();
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();

    // -------------------------------------------------------------
    // PASS 1: GROUND LAYER
    // -------------------------------------------------------------
    this.renderPass1Ground(ctx, renderData, time);

    // -------------------------------------------------------------
    // PASS 2: ENTITIES, PROJECTILES & POWERUPS
    // -------------------------------------------------------------
    this.renderPass2Entities(ctx, renderData, time);

    // -------------------------------------------------------------
    // PASS 3: CANOPY CAMOUFLAGE OVERLAY (Trees above entities)
    // -------------------------------------------------------------
    this.renderPass3Canopy(ctx, renderData, time);

    // -------------------------------------------------------------
    // PASS 4: PARTICLE FX
    // -------------------------------------------------------------
    if (particleEmitter) {
      this.renderPass4Particles(ctx, particleEmitter);
    }

    // -------------------------------------------------------------
    // PASS 5: HUD & OVERLAYS
    // -------------------------------------------------------------
    this.renderPass5HUDAndOverlays(ctx, renderData, time);
  }

  // ===========================================================================
  // PASS 1: GROUND LAYER IMPLEMENTATION
  // ===========================================================================

  private renderPass1Ground(
    ctx: CanvasRenderingContext2D,
    data: RenderSceneData,
    time: number
  ): void {
    ctx.save();

    // 1. Arena Cardboard Mat Base
    ctx.fillStyle = '#181512';
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Subtle cardboard grid texture / mat seams
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 0; c <= GRID_COLS; c++) {
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, ARENA_HEIGHT);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(ARENA_WIDTH, r * CELL_SIZE);
    }
    ctx.stroke();

    // 2. Render terrain tiles (except TREES which belong in Pass 3)
    const grid = data.grid;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = grid.getCell(c, r);
        if (!cell || cell.type === TileType.EMPTY || cell.type === TileType.TREES) continue;

        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;

        switch (cell.type) {
          case TileType.ICE:
            this.drawIceTile(ctx, x, y);
            break;
          case TileType.WATER:
            this.drawWaterTile(ctx, x, y, time);
            break;
          case TileType.BRICK:
            this.drawBrickTile(ctx, x, y, cell.mask);
            break;
          case TileType.STEEL:
            this.drawSteelTile(ctx, x, y, cell.mask);
            break;
          case TileType.EAGLE:
            // Eagle is rendered as a 2x2 multi-tile at top-left anchor (12, 24)
            if (c === grid.eagleState.col && r === grid.eagleState.row) {
              this.drawEagle(ctx, x, y, grid.isEagleDestroyed());
            }
            break;
        }
      }
    }

    ctx.restore();
  }

  private drawIceTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    // Pale blue-grey cardboard
    ctx.fillStyle = '#7092be';
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

    // Diagonal gloss lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + CELL_SIZE - 2);
    ctx.lineTo(x + CELL_SIZE - 2, y + 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + CELL_SIZE - 2);
    ctx.lineTo(x + CELL_SIZE - 2, y + 6);
    ctx.stroke();
    ctx.restore();
  }

  private drawWaterTile(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    ctx.save();
    // Deep blue cardboard base
    ctx.fillStyle = '#1b4f72';
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

    // Animated sine-wave water ripples / paper fold creases
    const waveOffset1 = Math.sin(time * 3 + x * 0.1) * 2;
    const waveOffset2 = Math.cos(time * 2.5 + y * 0.1) * 2;

    ctx.fillStyle = '#2980b9';
    ctx.fillRect(x + 1, y + 2 + waveOffset1, CELL_SIZE - 2, 4);

    ctx.fillStyle = '#5dade2';
    ctx.fillRect(x + 1, y + 9 + waveOffset2, CELL_SIZE - 2, 3);

    ctx.restore();
  }

  private drawBrickTile(ctx: CanvasRenderingContext2D, x: number, y: number, mask: number): void {
    ctx.save();
    const half = CELL_SIZE / 2; // 8px sub-quadrant

    const quads = [
      { mask: SubTileMask.TOP_LEFT, qx: x, qy: y },
      { mask: SubTileMask.TOP_RIGHT, qx: x + half, qy: y },
      { mask: SubTileMask.BOTTOM_LEFT, qx: x, qy: y + half },
      { mask: SubTileMask.BOTTOM_RIGHT, qx: x + half, qy: y + half },
    ];

    for (const q of quads) {
      if ((mask & q.mask) !== 0) {
        // Drop shadow under brick sub-quadrant
        if (this.config.enableShadows) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.fillRect(q.qx + 1, q.qy + 1, half, half);
        }

        // Terracotta brick cutout
        ctx.fillStyle = '#b84920';
        ctx.fillRect(q.qx, q.qy, half, half);

        // Dark grout borders
        ctx.strokeStyle = '#5c2410';
        ctx.lineWidth = 0.75;
        ctx.strokeRect(q.qx + 0.5, q.qy + 0.5, half - 1, half - 1);

        // Brick texture grain
        ctx.fillStyle = '#d35400';
        ctx.fillRect(q.qx + 1, q.qy + 1, half - 2, 2);
      }
    }
    ctx.restore();
  }

  private drawSteelTile(ctx: CanvasRenderingContext2D, x: number, y: number, mask: number): void {
    ctx.save();
    const half = CELL_SIZE / 2;

    const quads = [
      { mask: SubTileMask.TOP_LEFT, qx: x, qy: y },
      { mask: SubTileMask.TOP_RIGHT, qx: x + half, qy: y },
      { mask: SubTileMask.BOTTOM_LEFT, qx: x, qy: y + half },
      { mask: SubTileMask.BOTTOM_RIGHT, qx: x + half, qy: y + half },
    ];

    for (const q of quads) {
      if ((mask & q.mask) !== 0) {
        if (this.config.enableShadows) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(q.qx + 1, q.qy + 1, half, half);
        }

        // Industrial grey cardboard plate
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(q.qx, q.qy, half, half);

        // Bevel highlight (top/left bright white, bottom/right dark)
        ctx.fillStyle = '#ecf0f1';
        ctx.fillRect(q.qx, q.qy, half, 1);
        ctx.fillRect(q.qx, q.qy, 1, half);

        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(q.qx, q.qy + half - 1, half, 1);
        ctx.fillRect(q.qx + half - 1, q.qy, 1, half);

        // Punch rivet center
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(q.qx + half / 2 - 1, q.qy + half / 2 - 1, 2, 2);
      }
    }
    ctx.restore();
  }

  private drawEagle(ctx: CanvasRenderingContext2D, x: number, y: number, destroyed: boolean): void {
    ctx.save();
    const size = CELL_SIZE * 2; // 32x32 footprint

    // Drop shadow
    if (this.config.enableShadows) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(x + 2, y + 2, size, size);
    }

    if (!destroyed) {
      // Intact Origami Phoenix / Eagle Base
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(x, y, size, size);

      // Gold origami wing facets
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 4);
      ctx.lineTo(x + 28, y + 16);
      ctx.lineTo(x + 22, y + 28);
      ctx.lineTo(x + 16, y + 22);
      ctx.lineTo(x + 10, y + 28);
      ctx.lineTo(x + 4, y + 16);
      ctx.closePath();
      ctx.fill();

      // Golden head & beak
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 2);
      ctx.lineTo(x + 20, y + 10);
      ctx.lineTo(x + 16, y + 14);
      ctx.lineTo(x + 12, y + 10);
      ctx.closePath();
      ctx.fill();

      // Cardboard fold lines
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 2);
      ctx.lineTo(x + 16, y + 22);
      ctx.moveTo(x + 4, y + 16);
      ctx.lineTo(x + 28, y + 16);
      ctx.stroke();
    } else {
      // Destroyed Eagle: Charred cardboard scraps & broken flag
      ctx.fillStyle = '#1c2833';
      ctx.fillRect(x, y, size, size);

      // Torn burnt edges
      ctx.fillStyle = '#34495e';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 26);
      ctx.lineTo(x + 12, y + 14);
      ctx.lineTo(x + 18, y + 20);
      ctx.lineTo(x + 24, y + 10);
      ctx.lineTo(x + 28, y + 26);
      ctx.closePath();
      ctx.fill();

      // White skull / flag ruin cross
      ctx.strokeStyle = '#95a5a6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 8);
      ctx.lineTo(x + 24, y + 24);
      ctx.moveTo(x + 24, y + 8);
      ctx.lineTo(x + 8, y + 24);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ===========================================================================
  // PASS 2: ENTITIES, PROJECTILES & POWERUPS
  // ===========================================================================

  private renderPass2Entities(
    ctx: CanvasRenderingContext2D,
    data: RenderSceneData,
    time: number
  ): void {
    // 1. PowerUp items on ground
    if (data.powerUps) {
      for (const item of data.powerUps) {
        if (item.alive) {
          this.drawPowerUp(ctx, item, time);
        }
      }
    }

    // 2. Enemy Tanks
    if (data.enemyTanks && Array.isArray(data.enemyTanks)) {
      for (const enemy of data.enemyTanks) {
        if (enemy && !enemy.isDead) {
          this.drawEnemyTank(ctx, enemy, time);
        }
      }
    }

    // 3. Player Tank
    if (data.playerTank && typeof data.playerTank === 'object' && !data.playerTank.isDead) {
      const recoilTimer = data.playerTankRef?.recoilTimer ?? 0;
      this.drawPlayerTank(ctx, data.playerTank, recoilTimer, time);
    }

    // 4. Bullets
    if (data.bullets) {
      for (const b of data.bullets) {
        if (b.alive) {
          this.drawBullet(ctx, b);
        }
      }
    }
  }

  private drawPlayerTank(
    ctx: CanvasRenderingContext2D,
    tank: PlayerTankState,
    recoilTimer: number,
    time: number
  ): void {
    ctx.save();
    const colors = TIER_COLORS[tank.tier] ?? TIER_COLORS[TankTier.TIER_1];

    this.drawGenericTank(
      ctx,
      tank.x,
      tank.y,
      tank.width,
      tank.height,
      tank.direction,
      colors,
      recoilTimer,
      tank.boatActive
    );

    // Invulnerability Shield Bubble (Shimmering concentric dashed circle)
    if (tank.isInvulnerable) {
      ctx.save();
      const centerX = tank.x + tank.width / 2;
      const centerY = tank.y + tank.height / 2;
      const radius = tank.width / 2 + 5;
      const pulseAlpha = 0.5 + 0.5 * Math.sin(time * 12);

      ctx.strokeStyle = `rgba(241, 196, 15, ${pulseAlpha})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(52, 152, 219, ${pulseAlpha * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  private drawEnemyTank(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyTankState,
    time: number
  ): void {
    ctx.save();

    let colors = ENEMY_COLORS[enemy.type] ?? ENEMY_COLORS[EnemyType.BASIC];

    // Armor Tank HP Color Degradation
    if (enemy.type === EnemyType.ARMOR && enemy.armorColor) {
      colors = ARMOR_HP_COLORS[enemy.armorColor] ?? colors;
    }

    // Bonus Flashing Tank (5Hz strobe white flash)
    if (enemy.isFlashing) {
      const isWhiteFlash = Math.floor(time * 10) % 2 === 0;
      if (isWhiteFlash) {
        colors = {
          body: '#ffffff',
          dark: '#bdc3c7',
          light: '#ffffff',
          accent: '#e74c3c',
        };
      }
    }

    // Freeze effect tint
    if (enemy.isFrozen) {
      ctx.globalAlpha = 0.85;
    }

    this.drawGenericTank(
      ctx,
      enemy.x,
      enemy.y,
      enemy.width,
      enemy.height,
      enemy.direction,
      colors,
      0,
      false
    );

    // Freeze ice crystal overlay if frozen
    if (enemy.isFrozen) {
      ctx.strokeStyle = '#5dade2';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(enemy.x - 1, enemy.y - 1, enemy.width + 2, enemy.height + 2);
    }

    ctx.restore();
  }

  private drawGenericTank(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    direction: CardinalDirection,
    colors: { body: string; dark: string; light: string; accent: string } | undefined,
    recoilTimer: number = 0,
    boatActive: boolean = false
  ): void {
    ctx.save();
    const cx = x + width / 2;
    const cy = y + height / 2;

    const tankColors = colors || TIER_COLORS[TankTier.TIER_1];

    // Cardboard Drop Shadow
    if (this.config.enableShadows) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(x + 2, y + 2, width, height);
    }

    // Boat inflatable ring if boat active
    if (boatActive) {
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(cx, cy, width / 2 + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.translate(cx, cy);

    // Directional rotation: UP = 0, RIGHT = 90deg, DOWN = 180deg, LEFT = 270deg
    let angle = 0;
    switch (direction) {
      case 'UP':
        angle = 0;
        break;
      case 'RIGHT':
        angle = Math.PI / 2;
        break;
      case 'DOWN':
        angle = Math.PI;
        break;
      case 'LEFT':
        angle = (3 * Math.PI) / 2;
        break;
    }
    ctx.rotate(angle);

    const w = width;
    const h = height;
    const halfW = w / 2;
    const halfH = h / 2;

    // 1. Dual Cardboard Treads (Left & Right relative to UP orientation)
    const treadWidth = 5;
    ctx.fillStyle = '#2c3e50'; // Tread dark base
    // Left tread
    ctx.fillRect(-halfW, -halfH, treadWidth, h);
    // Right tread
    ctx.fillRect(halfW - treadWidth, -halfH, treadWidth, h);

    // Tread Segment notches / paper teeth
    ctx.fillStyle = '#7f8c8d';
    for (let offset = -halfH + 2; offset < halfH - 2; offset += 5) {
      ctx.fillRect(-halfW, offset, treadWidth, 2);
      ctx.fillRect(halfW - treadWidth, offset, treadWidth, 2);
    }

    // 2. Tank Main Hull
    const hullW = w - treadWidth * 2 - 2;
    const hullH = h - 4;
    ctx.fillStyle = tankColors.body;
    ctx.fillRect(-hullW / 2, -hullH / 2, hullW, hullH);

    // Cardboard bevel highlight & shadow
    ctx.fillStyle = tankColors.light;
    ctx.fillRect(-hullW / 2, -hullH / 2, hullW, 1.5);
    ctx.fillStyle = tankColors.dark;
    ctx.fillRect(-hullW / 2, hullH / 2 - 1.5, hullW, 1.5);

    // Rivet dots on hull corners
    ctx.fillStyle = tankColors.dark;
    ctx.fillRect(-hullW / 2 + 2, -hullH / 2 + 2, 2, 2);
    ctx.fillRect(hullW / 2 - 4, -hullH / 2 + 2, 2, 2);
    ctx.fillRect(-hullW / 2 + 2, hullH / 2 - 4, 2, 2);
    ctx.fillRect(hullW / 2 - 4, hullH / 2 - 4, 2, 2);

    // 3. Rotating Turret & Barrel
    const turretRadius = 6;
    const recoilOffset = recoilTimer > 0 ? 3 : 0; // Turret recoil kickback

    // Turret Barrel (pointing straight UP in local coordinates)
    const barrelWidth = 4;
    const barrelLength = 12;
    ctx.fillStyle = tankColors.dark;
    ctx.fillRect(
      -barrelWidth / 2,
      -halfH - barrelLength + 4 + recoilOffset,
      barrelWidth,
      barrelLength
    );

    // Barrel Muzzle Tip
    ctx.fillStyle = tankColors.accent;
    ctx.fillRect(
      -barrelWidth / 2 - 0.5,
      -halfH - barrelLength + 4 + recoilOffset,
      barrelWidth + 1,
      2
    );

    // Turret Cupola / Dome
    ctx.fillStyle = tankColors.accent;
    ctx.beginPath();
    ctx.arc(0, 0 + recoilOffset * 0.5, turretRadius, 0, Math.PI * 2);
    ctx.fill();

    // Turret center rivet
    ctx.fillStyle = tankColors.light;
    ctx.beginPath();
    ctx.arc(0, 0 + recoilOffset * 0.5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
    ctx.save();
    // Drop shadow
    if (this.config.enableShadows) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.width / 2 + 1, bullet.y + bullet.height / 2 + 1, bullet.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cardboard round pellet core
    ctx.fillStyle = bullet.owner === 'PLAYER' ? '#ecf0f1' : '#f39c12';
    ctx.beginPath();
    ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Steel-destroying heavy bullets have a fiery core
    if (bullet.canDestroySteel) {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawPowerUp(ctx: CanvasRenderingContext2D, item: PowerUpItem, time: number): void {
    ctx.save();
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    const size = item.width;

    // Drop shadow
    if (this.config.enableShadows) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(item.x + 2, item.y + 2, size, size);
    }

    // Tactile cardboard badge base
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(item.x, item.y, size, size);

    // Pulsing golden paper border
    const borderAlpha = 0.7 + 0.3 * Math.sin(time * 8);
    ctx.strokeStyle = `rgba(241, 196, 15, ${borderAlpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(item.x + 1, item.y + 1, size - 2, size - 2);

    // Draw powerup symbol icon
    ctx.fillStyle = '#f1c40f';
    ctx.strokeStyle = '#f39c12';

    switch (item.type) {
      case PowerUpType.STAR:
        this.drawStarIcon(ctx, cx, cy, 8);
        break;
      case PowerUpType.SHOVEL:
        this.drawShovelIcon(ctx, cx, cy);
        break;
      case PowerUpType.GRENADE:
        this.drawGrenadeIcon(ctx, cx, cy);
        break;
      case PowerUpType.CLOCK:
        this.drawClockIcon(ctx, cx, cy);
        break;
      case PowerUpType.HELMET:
        this.drawHelmetIcon(ctx, cx, cy);
        break;
      case PowerUpType.TANK:
        this.drawTankIcon(ctx, cx, cy);
        break;
      case PowerUpType.GUN:
        this.drawGunIcon(ctx, cx, cy);
        break;
      case PowerUpType.BOAT:
        this.drawBoatIcon(ctx, cx, cy);
        break;
    }

    ctx.restore();
  }

  private drawStarIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
        cx + r * Math.cos(((18 + i * 72) * Math.PI) / 180),
        cy - r * Math.sin(((18 + i * 72) * Math.PI) / 180)
      );
      ctx.lineTo(
        cx + (r / 2) * Math.cos(((54 + i * 72) * Math.PI) / 180),
        cy - (r / 2) * Math.sin(((54 + i * 72) * Math.PI) / 180)
      );
    }
    ctx.closePath();
    ctx.fill();
  }

  private drawShovelIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(cx - 5, cy - 6, 10, 6);
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(cx - 1.5, cy, 3, 8);
  }

  private drawGrenadeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(cx - 2, cy - 6, 4, 3);
  }

  private drawClockIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 4);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 3, cy);
    ctx.stroke();
  }

  private drawHelmetIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(cx, cy + 1, 7, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 8, cy, 16, 3);
  }

  private drawTankIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(cx - 5, cy - 3, 10, 7);
    ctx.fillRect(cx - 1, cy - 7, 2, 4);
  }

  private drawGunIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(cx - 6, cy - 4, 12, 4);
    ctx.fillRect(cx - 2, cy - 7, 4, 10);
  }

  private drawBoatIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();
  }

  // ===========================================================================
  // PASS 3: CANOPY CAMOUFLAGE OVERLAY
  // ===========================================================================

  private renderPass3Canopy(
    ctx: CanvasRenderingContext2D,
    data: RenderSceneData,
    time: number
  ): void {
    ctx.save();
    const grid = data.grid;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = grid.getCell(c, r);
        if (!cell || cell.type !== TileType.TREES) continue;

        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;

        this.drawCanopyTile(ctx, x, y, time);
      }
    }
    ctx.restore();
  }

  private drawCanopyTile(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    ctx.save();

    // Forest green cardboard leaf cluster
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

    // Overlapping leaf cutout pattern
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(x + 4, y + 4, 4, 0, Math.PI * 2);
    ctx.arc(x + 12, y + 4, 4, 0, Math.PI * 2);
    ctx.arc(x + 4, y + 12, 4, 0, Math.PI * 2);
    ctx.arc(x + 12, y + 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // Dark paper leaf vein textures
    ctx.fillStyle = '#1e8449';
    ctx.fillRect(x + 7, y + 1, 2, 14);
    ctx.fillRect(x + 1, y + 7, 14, 2);

    ctx.restore();
  }

  // ===========================================================================
  // PASS 4: PARTICLE FX
  // ===========================================================================

  private renderPass4Particles(ctx: CanvasRenderingContext2D, emitter: ParticleEmitter): void {
    ctx.save();
    emitter.render(ctx);
    ctx.restore();
  }

  // ===========================================================================
  // PASS 5: HUD & OVERLAYS
  // ===========================================================================

  private renderPass5HUDAndOverlays(
    ctx: CanvasRenderingContext2D,
    data: RenderSceneData,
    time: number
  ): void {
    // 1. Sidebar HUD
    this.drawHUD(ctx, data.hudState);

    // 2. FSM Overlay Screens
    const state = data.gameState ?? GameState.PLAYING;

    switch (state) {
      case GameState.TITLE:
        this.drawTitleScreen(ctx, data.hudState?.highScore ?? 20000);
        break;

      case GameState.STAGE_INTRO:
        this.drawStageIntroCurtain(ctx, data.hudState?.stage ?? 1, data.curtainProgress ?? 0);
        break;

      case GameState.STAGE_TALLY:
        this.drawStageTallyScreen(ctx, data.tallyResult, data.tallyProgress ?? 1.0);
        break;

      case GameState.GAME_OVER:
        this.drawGameOverRibbon(ctx);
        break;

      case GameState.VICTORY:
        this.drawVictoryBanner(ctx);
        break;

      case GameState.PAUSED:
        this.drawPauseBanner(ctx);
        break;
    }
  }

  private drawHUD(ctx: CanvasRenderingContext2D, hud?: HUDState): void {
    ctx.save();
    const sx = ARENA_WIDTH;
    const sy = 0;
    const sw = SIDEBAR_WIDTH;
    const sh = ARENA_HEIGHT;

    // Sidebar tactile cardboard background
    ctx.fillStyle = '#211f1d';
    ctx.fillRect(sx, sy, sw, sh);

    ctx.strokeStyle = '#3a3530';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 1, sy + 1, sw - 2, sh - 2);

    const reserveCount = hud?.enemyReserveCount ?? 20;

    // 1. Enemy reserve icon grid (2 columns x 10 rows)
    const startX = sx + 14;
    const startY = sy + 24;
    for (let i = 0; i < 20; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const iconX = startX + col * 18;
      const iconY = startY + row * 16;

      if (i < reserveCount) {
        // Cardboard silhouette mini tank
        ctx.fillStyle = '#000000';
        ctx.fillRect(iconX, iconY + 1, 10, 10);
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(iconX + 1, iconY + 2, 8, 8);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(iconX + 3, iconY + 4, 4, 4);
      } else {
        // Defeated empty slot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(iconX + 2, iconY + 3, 6, 6);
      }
    }

    // 2. Player Lives Section
    const livesY = sy + 210;
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('IP', sx + 10, livesY);

    // Player tank icon
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(sx + 12, livesY + 8, 12, 10);
    ctx.fillRect(sx + 16, livesY + 5, 4, 4);

    // Lives count
    const lives = hud?.lives ?? 3;
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${lives}`, sx + 32, livesY + 18);

    // 3. Stage Flag Section
    const stageY = sy + 290;
    // Orange flag badge
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.moveTo(sx + 14, stageY);
    ctx.lineTo(sx + 34, stageY + 6);
    ctx.lineTo(sx + 14, stageY + 12);
    ctx.closePath();
    ctx.fill();

    // Flagpole
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(sx + 12, stageY, 2, 22);

    // Stage number
    const stageNum = hud?.stage ?? 1;
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${stageNum}`, sx + 22, stageY + 26);

    // 4. Scores
    const scoreY = sy + 360;
    ctx.fillStyle = '#95a5a6';
    ctx.font = '8px monospace';
    ctx.fillText('SCORE', sx + 10, scoreY);
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${hud?.score ?? 0}`, sx + 6, scoreY + 12);

    ctx.fillStyle = '#95a5a6';
    ctx.font = '8px monospace';
    ctx.fillText('HIGH', sx + 10, scoreY + 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${hud?.highScore ?? 20000}`, sx + 6, scoreY + 38);

    ctx.restore();
  }

  private drawStageIntroCurtain(
    ctx: CanvasRenderingContext2D,
    stage: number,
    progress: number
  ): void {
    ctx.save();
    // Progress is [0..1], 0 = closed, 1 = fully open
    const halfH = ARENA_HEIGHT / 2;
    const offset = progress * halfH;

    // Top Shutter Plate
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, -offset, ARENA_WIDTH, halfH);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, halfH - offset - 4, ARENA_WIDTH, 4);

    // Bottom Shutter Plate
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, halfH + offset, ARENA_WIDTH, halfH);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, halfH + offset, ARENA_WIDTH, 4);

    // Centered Stage Announcement text if partially closed
    if (progress < 0.8) {
      const alpha = Math.max(0, 1 - progress * 1.5);
      ctx.fillStyle = `rgba(236, 240, 241, ${alpha})`;
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`STAGE ${stage}`, ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 8);
    }

    ctx.restore();
  }

  private drawStageTallyScreen(
    ctx: CanvasRenderingContext2D,
    result?: StageTallyResult | null,
    progress: number = 1.0
  ): void {
    ctx.save();
    // Dark textured cardboard board over arena
    ctx.fillStyle = 'rgba(24, 21, 18, 0.95)';
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Header
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`STAGE ${result?.stage ?? 1} CLEARED`, ARENA_WIDTH / 2, 48);

    // Score banner
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`STAGE SCORE: ${result?.cumulativeScore ?? 0}`, ARENA_WIDTH / 2, 74);

    const rows = result?.rows ?? [
      { type: EnemyType.BASIC, count: 0, unitPoints: 100, totalPoints: 0 },
      { type: EnemyType.FAST, count: 0, unitPoints: 200, totalPoints: 0 },
      { type: EnemyType.POWER, count: 0, unitPoints: 300, totalPoints: 0 },
      { type: EnemyType.ARMOR, count: 0, unitPoints: 400, totalPoints: 0 },
    ];

    const startY = 120;
    const rowHeight = 44;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r) continue;
      const y = startY + i * rowHeight;
      const colors = ENEMY_COLORS[r.type] ?? ENEMY_COLORS[EnemyType.BASIC];

      // Enemy Tank Icon
      this.drawGenericTank(ctx, 48, y - 10, 24, 24, 'UP', colors, 0, false);

      // Multiplier Points
      ctx.fillStyle = '#ecf0f1';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${r.unitPoints} PTS`, 90, y + 6);

      // Kills Count (animated based on progress)
      const animatedCount = Math.floor(r.count * Math.min(1.0, progress * 1.5));
      ctx.fillStyle = '#f39c12';
      ctx.fillText(`× ${animatedCount}`, 200, y + 6);

      // Subtotal Points
      const animatedSubtotal = animatedCount * r.unitPoints;
      ctx.fillStyle = '#2ecc71';
      ctx.textAlign = 'right';
      ctx.fillText(`${animatedSubtotal}`, ARENA_WIDTH - 60, y + 6);
    }

    // Total Divider line
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, startY + rows.length * rowHeight);
    ctx.lineTo(ARENA_WIDTH - 40, startY + rows.length * rowHeight);
    ctx.stroke();

    // Total Kills & Cumulative Score
    const totalY = startY + rows.length * rowHeight + 30;
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL KILLS:', 48, totalY);
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`${result?.totalKills ?? 0}`, 180, totalY);

    ctx.fillStyle = '#2ecc71';
    ctx.textAlign = 'right';
    ctx.fillText(`TOTAL: ${result?.totalStagePoints ?? 0} PTS`, ARENA_WIDTH - 60, totalY);

    ctx.restore();
  }

  private drawTitleScreen(ctx: CanvasRenderingContext2D, highScore: number): void {
    ctx.save();
    ctx.fillStyle = '#181512';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // High Score Banner
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`I-      00  HI- ${highScore}`, ARENA_WIDTH / 2, 40);

    // Papercraft Logo Block: "TANK 1990"
    const logoY = 120;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(ARENA_WIDTH / 2 - 120 + 4, logoY - 30 + 4, 240, 60);

    ctx.fillStyle = '#b84920';
    ctx.fillRect(ARENA_WIDTH / 2 - 120, logoY - 30, 240, 60);
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 3;
    ctx.strokeRect(ARENA_WIDTH / 2 - 120, logoY - 30, 240, 60);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('TANK 1990', ARENA_WIDTH / 2, logoY + 12);

    // Menu Options
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText('1 PLAYER', ARENA_WIDTH / 2 + 10, 250);
    ctx.fillText('CONSTRUCTION', ARENA_WIDTH / 2 + 10, 280);

    // Tank Cursor pointing at 1 PLAYER
    this.drawGenericTank(
      ctx,
      ARENA_WIDTH / 2 - 80,
      236,
      20,
      20,
      'RIGHT',
      TIER_COLORS[TankTier.TIER_1],
      0,
      false
    );

    // Copyright
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '10px monospace';
    ctx.fillText('© 1980 1985 NAMCO LTD.', ARENA_WIDTH / 2, 360);
    ctx.fillText('ALL RIGHTS RESERVED', ARENA_WIDTH / 2, 376);

    ctx.restore();
  }

  private drawGameOverRibbon(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const cx = ARENA_WIDTH / 2;
    const cy = ARENA_HEIGHT / 2;

    // Red cardboard ribbon
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(cx - 110 + 4, cy - 25 + 4, 220, 50);

    ctx.fillStyle = '#c0392b';
    ctx.fillRect(cx - 110, cy - 25, 220, 50);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 110, cy - 25, 220, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', cx, cy + 8);

    ctx.restore();
  }

  private drawVictoryBanner(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const cx = ARENA_WIDTH / 2;
    const cy = ARENA_HEIGHT / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(cx - 130 + 4, cy - 30 + 4, 260, 60);

    ctx.fillStyle = '#27ae60';
    ctx.fillRect(cx - 130, cy - 30, 260, 60);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - 130, cy - 30, 260, 60);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', cx, cy + 8);

    ctx.restore();
  }

  private drawPauseBanner(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const cx = ARENA_WIDTH / 2;
    const cy = ARENA_HEIGHT / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(cx - 80, cy - 20, 160, 40);

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', cx, cy + 6);

    ctx.restore();
  }
}
