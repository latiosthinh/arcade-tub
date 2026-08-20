import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import {
  GameState,
  TitleOption,
  CardinalDirection,
  EnemyType,
  RenderSceneData,
  TOTAL_CANVAS_WIDTH,
  TOTAL_CANVAS_HEIGHT,
} from './types';
import { GridMap } from './GridMap';
import { PlayerTank } from './PlayerTank';
import { BulletManager } from './BulletManager';
import { EnemySpawner } from './EnemySpawner';
import { PowerUpSystem } from './PowerUpSystem';
import { ScoreManager } from './ScoreManager';
import { GameFlow } from './GameFlow';
import { TankRenderer } from './TankRenderer';
import { TankAudio } from './TankAudio';
import { TouchControls } from './TouchControls';
import { ViewportManager } from './ViewportManager';
import { ParticleEmitter } from './ParticleEmitter';
import { loadStage } from './stages';

// Initialize Playables SDK Adapter
initPlayables();

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element #game not found');
}

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
if (!ctx) {
  throw new Error('Failed to get 2D context from canvas');
}

// Core Subsystems
const grid = new GridMap();
const bulletManager = new BulletManager(grid);
const playerTank = new PlayerTank(grid, { lives: 3 });
const enemySpawner = new EnemySpawner(grid, bulletManager);
const powerUpSystem = new PowerUpSystem(grid);
const scoreManager = new ScoreManager();
const gameFlow = new GameFlow({ scoreManager });
const tankRenderer = new TankRenderer();
const tankAudio = new TankAudio();
const particleEmitter = new ParticleEmitter();

const viewportManager = new ViewportManager({
  canvas,
  virtualWidth: TOTAL_CANVAS_WIDTH,
  virtualHeight: TOTAL_CANVAS_HEIGHT,
  autoResize: true,
});

// Configure Virtual Touch Controls
const touchControls = new TouchControls({
  dpad: {
    centerX: 70,
    centerY: 378,
    radius: 54,
    deadzone: 10,
    hysteresisAngleDeg: 10,
  },
  fireButton: {
    centerX: 442,
    centerY: 378,
    radius: 36,
  },
  container: canvas,
});

// Audio unlock helper
let audioUnlocked = false;
function unlockAudio(): void {
  if (!audioUnlocked) {
    tankAudio.ensureContext();
    audioUnlocked = true;
  }
}

// Playables Lifecycle hooks
onPause(() => {
  gameFlow.pause();
  tankAudio.stopEngine();
});

onResume(() => {
  gameFlow.resume();
});

// Sound & Particle Event Wiring
powerUpSystem.onPowerUpCollected = (event) => {
  scoreManager.addPowerUpPoints(event.points);
  tankAudio.playPowerUpPickup();
  particleEmitter.emitConfettiShower(event.x, event.y, 25);
};

enemySpawner.onBonusDrop = (tank) => {
  powerUpSystem.spawnRandomPowerUp();
  tankAudio.playPowerUpSpawn();
};

enemySpawner.onEnemyDestroyed = (tank, points) => {
  scoreManager.recordKill(tank.type, points);
  tankAudio.playTankExplosion();
  particleEmitter.emitExplosion(tank.x + tank.width / 2, tank.y + tank.height / 2, tank.type === EnemyType.ARMOR);
};

// Keyboard State Tracking
const activeKeys = new Set<string>();

window.addEventListener('keydown', (e) => {
  unlockAudio();
  activeKeys.add(e.code);

  if (e.code === 'Enter' || e.code === 'KeyP') {
    if (gameFlow.state === GameState.TITLE) {
      startNewCampaign();
    } else if (gameFlow.state === GameState.STAGE_TALLY) {
      gameFlow.nextStage();
      setupCurrentStage();
    } else if (gameFlow.state === GameState.GAME_OVER || gameFlow.state === GameState.VICTORY) {
      gameFlow.goToTitle();
    } else {
      gameFlow.togglePause();
      if (gameFlow.state === GameState.PAUSED) {
        tankAudio.stopEngine();
      }
    }
  }

  if (gameFlow.state === GameState.TITLE) {
    if (e.code === 'Digit1') {
      gameFlow.selectedTitleOption = TitleOption.ONE_PLAYER;
      tankAudio.playBulletHitMetal();
    } else if (e.code === 'Digit2') {
      gameFlow.selectedTitleOption = TitleOption.CONSTRUCTION;
      tankAudio.playBulletHitMetal();
    } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS') {
      gameFlow.selectedTitleOption =
        gameFlow.selectedTitleOption === TitleOption.ONE_PLAYER
          ? TitleOption.CONSTRUCTION
          : TitleOption.ONE_PLAYER;
      tankAudio.playBulletHitMetal();
    }
  }
});

window.addEventListener('keyup', (e) => {
  activeKeys.delete(e.code);
});

// Canvas click / touch listener for Audio and Title start
canvas.addEventListener('pointerdown', (e) => {
  unlockAudio();
  if (gameFlow.state === GameState.TITLE) {
    startNewCampaign();
  } else if (gameFlow.state === GameState.STAGE_TALLY) {
    gameFlow.nextStage();
    setupCurrentStage();
  } else if (gameFlow.state === GameState.GAME_OVER || gameFlow.state === GameState.VICTORY) {
    gameFlow.goToTitle();
  }
});

function setupCurrentStage(): void {
  loadStage(grid, gameFlow.currentStage);
  bulletManager.clear();
  particleEmitter.clear();
  playerTank.spawn();
  enemySpawner.initWave(EnemySpawner.getDefaultWaveQueue());
  tankAudio.playStageStartFanfare();
}

function startNewCampaign(): void {
  gameFlow.restart();
  setupCurrentStage();
}

// Game Loop Timing
let lastTime = performance.now();

function update(dt: number): void {
  gameFlow.update(dt);
  particleEmitter.update(dt);

  if (gameFlow.state === GameState.STAGE_INTRO) {
    // Stage intro curtain rolling open
    return;
  }

  if (gameFlow.state === GameState.STAGE_TALLY) {
    if (gameFlow.tallyTimer >= gameFlow.tallyDuration) {
      gameFlow.nextStage();
      setupCurrentStage();
    }
    return;
  }

  if (gameFlow.state === GameState.GAME_OVER) {
    if (gameFlow.gameOverTimer >= 4.0) {
      gameFlow.goToTitle();
    }
    return;
  }

  if (gameFlow.state !== GameState.PLAYING) {
    return;
  }

  // Handle Player Input
  const touchState = touchControls.getState();
  let moveDir: CardinalDirection | null = touchState.direction;

  if (!moveDir) {
    if (activeKeys.has('ArrowUp') || activeKeys.has('KeyW')) moveDir = 'UP';
    else if (activeKeys.has('ArrowDown') || activeKeys.has('KeyS')) moveDir = 'DOWN';
    else if (activeKeys.has('ArrowLeft') || activeKeys.has('KeyA')) moveDir = 'LEFT';
    else if (activeKeys.has('ArrowRight') || activeKeys.has('KeyD')) moveDir = 'RIGHT';
  }

  const isFiring =
    touchState.isFiring ||
    activeKeys.has('Space') ||
    activeKeys.has('KeyJ') ||
    activeKeys.has('KeyZ');

  // Player Movement & Engine Audio
  if (moveDir && !playerTank.isDead) {
    playerTank.move(moveDir, dt);
    tankAudio.updateEngineSound(true);
  } else {
    playerTank.update(dt);
    tankAudio.updateEngineSound(false);
  }

  // Player Weapon Firing
  if (isFiring && !playerTank.isDead) {
    const stats = playerTank.getStats();
    if (bulletManager.canFire('PLAYER', stats.maxBullets)) {
      bulletManager.fire(
        playerTank.x,
        playerTank.y,
        playerTank.direction,
        'PLAYER',
        {
          bulletSpeed: stats.bulletSpeed,
          canDestroySteel: stats.canDestroySteel,
          canCutTrees: stats.canCutTrees,
          damage: 1,
        },
        playerTank.width
      );
      tankAudio.playPlayerFire();
    }
  }

  // Enemy AI, Spawning & Firing
  enemySpawner.update(dt, playerTank.getState(), (enemyTank) => {
    const eStats = enemyTank.getConfig();
    if (bulletManager.canFire('ENEMY', eStats.maxBullets)) {
      bulletManager.fire(
        enemyTank.x,
        enemyTank.y,
        enemyTank.direction,
        'ENEMY',
        {
          bulletSpeed: eStats.bulletSpeed,
          canDestroySteel: false,
          canCutTrees: false,
          damage: 1,
        },
        enemyTank.width
      );
      tankAudio.playEnemyFire();
    }
  });

  // Power-up Lifecycle & Player Pickup Collision
  powerUpSystem.update(dt);
  if (!playerTank.isDead) {
    powerUpSystem.checkPlayerCollision(playerTank, enemySpawner);
  }

  // Bullet Ballistics & Combat Ray Collisions
  const combatTargets = [
    {
      id: 'player',
      x: playerTank.x,
      y: playerTank.y,
      width: playerTank.width,
      height: playerTank.height,
      isPlayer: true,
      isDead: playerTank.isDead,
      isInvulnerable: playerTank.isInvulnerable,
      takeDamage: (_damage: number) => {
        if (playerTank.isInvulnerable || playerTank.isDead) return false;
        playerTank.takeDamage();
        tankAudio.playTankExplosion();
        particleEmitter.emitExplosion(
          playerTank.x + playerTank.width / 2,
          playerTank.y + playerTank.height / 2,
          true
        );
        if (playerTank.lives <= 0) {
          gameFlow.triggerGameOver();
          tankAudio.playGameOverCadence();
        }
        return true;
      },
    },
    ...enemySpawner.getActiveEnemies(),
  ];

  bulletManager.update(dt, combatTargets);

  // Process Bullet Hit Events
  const events = bulletManager.getEvents();
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!;
    switch (ev.type) {
      case 'BRICK':
        tankAudio.playBrickDestroy();
        particleEmitter.emitBrickDebris(ev.x, ev.y, 8);
        break;
      case 'STEEL':
      case 'BOUNDARY':
        tankAudio.playBulletHitMetal();
        particleEmitter.emitSparks(ev.x, ev.y, 6);
        break;
      case 'BULLET_CANCEL':
        tankAudio.playBulletCancel();
        particleEmitter.emitSparks(ev.x, ev.y, 10);
        break;
      case 'EAGLE':
        grid.destroyEagle();
        tankAudio.playEagleDestroyed();
        particleEmitter.emitExplosion(ev.x, ev.y, true);
        gameFlow.triggerGameOver();
        tankAudio.playGameOverCadence();
        break;
    }
  }
  bulletManager.clearEvents();

  // Eagle Loss Check
  if (grid.isEagleDestroyed() && gameFlow.state === GameState.PLAYING) {
    gameFlow.triggerGameOver();
    tankAudio.playGameOverCadence();
  }

  // Wave Clear Check
  if (enemySpawner.isWaveCleared() && gameFlow.state === GameState.PLAYING) {
    gameFlow.onStageCleared();
    tankAudio.playStageStartFanfare();
  }
}

function render(): void {
  const renderData: RenderSceneData = {
    grid: {
      getCell: (c, r) => grid.getCell(c, r),
      isEagleDestroyed: () => grid.isEagleDestroyed(),
      eagleState: grid.eagleState,
      getSubTileBoxes: (c, r) => grid.getSubTileBoxes(c, r),
    },
    playerTank: playerTank.getState(),
    enemyTanks: enemySpawner.getActiveEnemies().map((e) => e.getState()),
    bullets: bulletManager.getBullets(),
    powerUps: powerUpSystem.getItems(),
    hudState: gameFlow.getHUDState(
      enemySpawner.getRemainingCount(),
      playerTank.lives,
      playerTank.tier
    ),
    gameState: gameFlow.state,
    curtainProgress: gameFlow.getCurtainProgress(),
    tallyProgress: gameFlow.getTallyProgress(),
    tallyResult: scoreManager.getStageTally(gameFlow.currentStage),
    time: performance.now() / 1000,
  };

  tankRenderer.renderScene(ctx, renderData, particleEmitter);
}

function gameLoop(timestamp: number): void {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

// Start Main Loop
requestAnimationFrame(gameLoop);
