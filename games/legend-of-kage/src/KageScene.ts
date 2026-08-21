import { VerticalCamera } from './VerticalCamera';
import { NinjaPhysics } from './NinjaPhysics';
import { CombatSystem } from './CombatSystem';
import { TreeCanopy } from './TreeCanopy';
import { ProjectileManager } from './ProjectileManager';
import { EnemySpawner } from './enemies/EnemySpawner';
import { PowerUpManager } from './PowerUpManager';
import { ParticleEmitter } from './ParticleEmitter';
import { KageRenderer } from './KageRenderer';
import { KageAudio } from './KageAudio';
import { StageManager } from './stages/StageManager';
import { SeasonManager } from './stages/SeasonManager';
import { SaveManager } from './SaveManager';
import { TouchControls } from './TouchControls';
import { GameScene, InputState } from './types';

export class KageScene implements GameScene {
  camera: VerticalCamera;
  physics: NinjaPhysics;
  combat: CombatSystem;
  canopy: TreeCanopy;
  projectiles: ProjectileManager;
  spawner: EnemySpawner;
  powerups: PowerUpManager;
  particles: ParticleEmitter;
  renderer: KageRenderer;
  audio: KageAudio;
  seasonManager: SeasonManager;
  stageManager: StageManager;
  saveManager: SaveManager;
  touchControls: TouchControls;

  private customInput: InputState | null = null;
  private isInitialized = false;

  constructor() {
    this.camera = new VerticalCamera({ viewportWidth: 800, viewportHeight: 600 });
    this.physics = new NinjaPhysics(200, 500);
    this.combat = new CombatSystem();
    this.canopy = new TreeCanopy();
    this.projectiles = new ProjectileManager();
    this.spawner = new EnemySpawner();
    this.powerups = new PowerUpManager();
    this.particles = new ParticleEmitter();
    this.renderer = new KageRenderer();
    this.audio = new KageAudio();
    this.seasonManager = new SeasonManager();
    this.stageManager = new StageManager(this.seasonManager);
    this.saveManager = new SaveManager();
    this.touchControls = new TouchControls();
  }

  init(viewportWidth = 800, viewportHeight = 600): void {
    this.camera = new VerticalCamera({
      viewportWidth,
      viewportHeight,
      stageWidth: 1200,
      stageHeight: 800,
    });
    this.particles.initWeather(this.seasonManager.getTheme());
    this.isInitialized = true;
  }

  setCustomInput(input: InputState | null): void {
    this.customInput = input;
  }

  update(dt: number): void {
    if (!this.isInitialized) {
      this.init();
    }

    const input = this.customInput ?? this.touchControls.inputState;
    const stage = this.stageManager.getCurrentStage();

    // 1. Combat Actions
    if (input.swordJustPressed) {
      if (this.combat.triggerSlash()) {
        this.audio.playSlash();
      }
    }

    if (input.shurikenJustPressed) {
      if (this.combat.triggerShuriken(this.physics.x, this.physics.y, this.physics.facing, input, this.projectiles)) {
        this.audio.playShuriken();
      }
    }

    // 2. Physics & Kinematics
    this.physics.update(dt, input, this.canopy, 560);
    this.combat.update(dt);
    this.particles.update(dt, stage.stageWidth, stage.stageHeight);

    // 3. Sword Deflection Check
    const swordBox = this.combat.getSwordHitbox(this.physics.x, this.physics.y, this.physics.width, this.physics.height, this.physics.facing);
    if (swordBox) {
      const defRes = this.projectiles.checkSwordDeflection(swordBox);
      if (defRes.deflectedCount > 0) {
        this.audio.playClash();
        for (const pt of defRes.deflectedPoints) {
          this.particles.burst(pt.x, pt.y, 14, ['#FFD700', '#FFF', '#FF5722']);
        }
      }

      // Check sword hit on enemies
      const hitEnemy = this.spawner.checkCollision(swordBox);
      if (hitEnemy) {
        const killed = hitEnemy.takeHit(1);
        if (killed) {
          this.audio.playSlash();
          this.particles.burst(hitEnemy.x, hitEnemy.y, 12);
          this.combat.score += 100;
          if (this.stageManager.recordKill()) {
            this.audio.playVictory();
            this.stageManager.advanceStage();
            this.particles.initWeather(this.seasonManager.getTheme());
          }
        }
      }
    }

    // 4. Projectiles vs Enemies & Player
    this.projectiles.update(dt, { x: 0, y: 0, width: stage.stageWidth, height: stage.stageHeight });

    for (const p of this.projectiles.getProjectiles()) {
      if (p.owner === 'player') {
        const hitEnemy = this.spawner.checkCollision({ x: p.x, y: p.y, width: p.width, height: p.height });
        if (hitEnemy) {
          hitEnemy.takeHit(1);
          p.isDead = true;
          this.particles.burst(hitEnemy.x, hitEnemy.y, 10);
          this.combat.score += 100;
          if (this.stageManager.recordKill()) {
            this.audio.playVictory();
            this.stageManager.advanceStage();
            this.particles.initWeather(this.seasonManager.getTheme());
          }
        }
      } else if (p.owner === 'enemy') {
        // Enemy projectile hits player
        const overlap =
          this.physics.x < p.x + p.width &&
          this.physics.x + this.physics.width > p.x &&
          this.physics.y < p.y + p.height &&
          this.physics.y + this.physics.height > p.y;

        if (overlap) {
          p.isDead = true;
          this.combat.takeHit();
          if (!this.combat.isGameOver) {
            this.physics.x = 100;
            this.physics.y = 500;
            this.combat.respawn();
          }
        }
      }
    }

    // 5. Enemy Spawning & Player Body Collision
    this.spawner.update(dt, this.physics.x, this.physics.y, this.canopy, this.projectiles, stage.stageWidth, 560);
    const collidingEnemy = this.spawner.checkCollision(this.physics.getBounds());
    if (collidingEnemy && !this.combat.isInvulnerable && !this.combat.isDead) {
      this.combat.takeHit();
      if (!this.combat.isGameOver) {
        this.physics.x = 100;
        this.physics.y = 500;
        this.combat.respawn();
      }
    }

    // 6. Camera Follow
    this.camera.update(this.physics.x + this.physics.width / 2, this.physics.y + this.physics.height / 2, this.physics.vy, dt);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const stage = this.stageManager.getCurrentStage();
    const theme = this.seasonManager.getTheme();

    this.renderer.renderBackground(ctx, this.camera, theme);
    this.renderer.renderEnvironment(ctx, this.camera, this.canopy, stage, theme);
    this.renderer.renderProjectiles(ctx, this.camera, this.projectiles);
    this.renderer.renderEnemies(ctx, this.camera, this.spawner);
    this.renderer.renderPlayer(ctx, this.camera, this.physics, this.combat);
    this.particles.render(ctx, this.camera);
    this.renderer.renderHUD(ctx, this.combat, stage, theme);
  }
}
