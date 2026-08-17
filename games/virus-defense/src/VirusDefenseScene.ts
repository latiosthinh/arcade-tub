import { GameScene } from '@arcade-carnival/game-engine';
import { Turret } from './Turret.js';
import { PathogenSwarm } from './PathogenSwarm.js';
import { NucleusState } from './NucleusState.js';
import { GameState } from './GameState.js';
import { BioArenaRenderer } from './BioArenaRenderer.js';
import { DefenseAudio } from './DefenseAudio.js';
import { ParticleSystem } from './Particles.js';

export class VirusDefenseScene implements GameScene {
  public gameState: GameState;
  public turret: Turret;
  public swarm: PathogenSwarm;
  public nucleus: NucleusState;
  public renderer: BioArenaRenderer;
  public audio: DefenseAudio;
  public particles: ParticleSystem;

  private isPointerDown = false;
  private pointerX = 400;
  private pointerY = 300;
  private screenShake = 0;

  // Wave spawn control
  private waveSpawnTimer = 0;
  private waveEnemiesRemaining = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.gameState = new GameState();
    this.turret = new Turret(400, 300);
    this.swarm = new PathogenSwarm(400, 300);
    this.nucleus = new NucleusState(400, 300);
    this.renderer = new BioArenaRenderer(800, 600);
    this.audio = new DefenseAudio();
    this.particles = new ParticleSystem(250);

    this.initInputs(canvas);
  }

  public initInputs(canvas: HTMLCanvasElement): void {
    const updatePointerPos = (e: MouseEvent | Touch) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.pointerX = (e.clientX - rect.left) * scaleX;
      this.pointerY = (e.clientY - rect.top) * scaleY;
    };

    canvas.addEventListener('mousemove', (e) => {
      updatePointerPos(e);
    });

    canvas.addEventListener('mousedown', (e) => {
      updatePointerPos(e);
      this.handlePointerDown();
    });

    window.addEventListener('mouseup', () => {
      this.isPointerDown = false;
    });

    canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
          updatePointerPos(touch);
          this.handlePointerDown();
        }
      },
      { passive: false }
    );

    canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
          updatePointerPos(touch);
        }
      },
      { passive: false }
    );

    window.addEventListener('touchend', () => {
      this.isPointerDown = false;
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        this.gameState.togglePause();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (this.gameState.status === 'ready') {
          this.startGame();
        } else if (this.gameState.status === 'gameover') {
          this.restartGame();
        }
      }
    });
  }

  private handlePointerDown(): void {
    if (this.gameState.status === 'ready') {
      this.startGame();
    } else if (this.gameState.status === 'gameover') {
      this.restartGame();
    } else if (this.gameState.status === 'playing') {
      this.isPointerDown = true;
      this.fireShot();
    }
  }

  public startGame(): void {
    this.gameState.start();
    this.turret.reset();
    this.swarm.clear();
    this.nucleus.reset();
    this.particles.clear();
    this.startWave(1);
  }

  public restartGame(): void {
    this.startGame();
  }

  public pause(): void {
    if (this.gameState.status === 'playing') {
      this.gameState.togglePause();
    }
  }

  public resume(): void {
    if (this.gameState.status === 'paused') {
      this.gameState.togglePause();
    }
  }

  private startWave(waveNumber: number): void {
    this.nucleus.wave = waveNumber;
    const config = this.nucleus.getWaveConfig(waveNumber);
    this.waveEnemiesRemaining = config.enemyCount;
    this.waveSpawnTimer = 0.5;

    // Spawn 1-2 antibody repair orbs on wave start
    this.nucleus.spawnAntibody();
  }

  private fireShot(): void {
    if (this.gameState.status !== 'playing') return;

    this.turret.aimAt(this.pointerX, this.pointerY);
    const proj = this.turret.fire();
    if (proj) {
      this.gameState.recordShot();
      this.audio.playLaser();
      this.particles.spark(proj.x, proj.y, '#22d3ee', 4);
    }
  }

  public update(dt: number): void {
    if (this.gameState.status !== 'playing') {
      this.renderer.update(dt);
      return;
    }

    // 1. Update Turret Aim and Auto-fire on pointer hold
    this.turret.aimAt(this.pointerX, this.pointerY);
    if (this.isPointerDown) {
      this.fireShot();
    }
    this.turret.update(dt);

    // 2. Wave Spawning Progression
    const config = this.nucleus.getWaveConfig(this.gameState.wave);
    if (this.waveEnemiesRemaining > 0) {
      this.waveSpawnTimer -= dt;
      if (this.waveSpawnTimer <= 0) {
        const types = config.types;
        const type = types[Math.floor(Math.random() * types.length)] ?? 'spiker';
        this.swarm.spawn(type, config.speedMultiplier);
        this.waveEnemiesRemaining--;
        this.waveSpawnTimer = config.spawnInterval;
      }
    } else if (this.swarm.activePathogens.length === 0) {
      // Wave Cleared!
      this.gameState.completeWave();
      this.audio.playWaveClear();
      this.particles.burst(400, 300, '#38bdf8', 35);
      this.startWave(this.gameState.wave);
    }

    // 3. Update Swarm Kinematics & Collisions
    this.swarm.update(dt);

    // Projectile -> Pathogen hits
    const hits = this.swarm.checkProjectileCollisions(this.turret.projectiles);
    for (const hit of hits) {
      this.gameState.recordHit(hit.pathogen.scoreValue);

      if (hit.killed) {
        if (hit.pathogen.type === 'splitter' && !hit.pathogen.isMicroSpiker) {
          this.audio.playSplit();
          this.particles.burst(hit.pathogen.x, hit.pathogen.y, '#10b981', 20);
        } else {
          this.audio.playPop();
          const color =
            hit.pathogen.type === 'speedster'
              ? '#f97316'
              : hit.pathogen.type === 'shield-carrier'
              ? '#8b5cf6'
              : '#ef4444';
          this.particles.burst(hit.pathogen.x, hit.pathogen.y, color, 16);
        }
      } else {
        this.audio.playPop(1.5);
        this.particles.spark(hit.projectile.x, hit.projectile.y, '#a78bfa', 6);
      }
    }

    // Pathogen -> Nucleus breaches
    const breaches = this.swarm.checkNucleusCollisions(this.nucleus);
    if (breaches.length > 0) {
      this.audio.playBreach();
      this.screenShake = 1.0;
      for (const b of breaches) {
        this.particles.burst(b.pathogen.x, b.pathogen.y, '#ef4444', 24);
      }

      if (this.nucleus.isDestroyed) {
        this.gameState.gameOver();
        this.audio.playGameOver();
        this.particles.burst(400, 300, '#ef4444', 60);
      }
    }

    // 4. Update Nucleus & Antibodies
    this.nucleus.update(dt);

    // Projectile or Turret distance collection of antibodies
    for (const proj of this.turret.projectiles) {
      if (!proj.active) continue;
      for (const ab of this.nucleus.antibodies) {
        if (!ab.active) continue;
        const dx = proj.x - ab.x;
        const dy = proj.y - ab.y;
        if (dx * dx + dy * dy <= (ab.radius + proj.radius) ** 2) {
          proj.active = false;
          this.nucleus.collectAntibody(ab.id);
          this.audio.playHeal();
          this.particles.healSparkles(ab.x, ab.y, 400, 300, 20);
        }
      }
    }

    // 5. Update State Timers & Screen Shake
    this.gameState.update(dt);
    this.particles.update(dt);
    this.renderer.update(dt);

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 2.5);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(
      ctx,
      this.gameState,
      this.turret,
      this.swarm,
      this.nucleus,
      this.particles,
      this.screenShake
    );
  }
}
