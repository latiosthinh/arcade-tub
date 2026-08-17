import { GameScene, InputManager, audio } from '@arcade-carnival/game-engine';
import { Player } from './Player.js';
import { Camera } from './Camera.js';
import { PlatformManager } from './PlatformManager.js';
import { ObstacleManager } from './ObstacleManager.js';
import { GameState, GameMode } from './GameState.js';
import { ParticleSystem } from './Particles.js';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
}

export class SkyHopperScene implements GameScene {
  player: Player;
  camera: Camera;
  platformManager: PlatformManager;
  obstacleManager: ObstacleManager;
  gameState: GameState;
  particles: ParticleSystem;
  inputManager: InputManager;
  canvas: HTMLCanvasElement;
  stars: Star[] = [];

  private boundClickHandler: (e: MouseEvent | TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.player = new Player();
    this.camera = new Camera();
    this.platformManager = new PlatformManager();
    this.obstacleManager = new ObstacleManager();
    this.gameState = new GameState();
    this.particles = new ParticleSystem();
    this.inputManager = new InputManager();

    // Initialize 60 stars for background parallax
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.8,
        speed: 0.1 + Math.random() * 0.4,
      });
    }

    this.platformManager.reset();
    this.obstacleManager.reset();
    this.camera.reset(500);

    this.boundClickHandler = this.handleClick.bind(this);
    canvas.addEventListener('click', this.boundClickHandler);
  }

  private handleClick(e: MouseEvent | TouchEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const touch = 'touches' in e && e.touches.length > 0 ? e.touches[0] : undefined;
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    if (this.gameState.status === 'ready') {
      // Story mode button: x: 180-380, y: 340-400
      if (x >= 180 && x <= 380 && y >= 340 && y <= 400) {
        this.startRun('story');
      } else if (x >= 420 && x <= 620 && y >= 340 && y <= 400) {
        // Infinite mode button: x: 420-620, y: 340-400
        this.startRun('infinite');
      } else if (x >= 300 && x <= 500 && y >= 420 && y <= 470) {
        this.startRun(this.gameState.mode);
      }
    } else if (this.gameState.status === 'gameover' || this.gameState.status === 'victory') {
      if (x >= 280 && x <= 520 && y >= 440 && y <= 500) {
        this.restart();
      }
    } else if (this.gameState.status === 'paused') {
      this.resume();
    }
  }

  startRun(mode: GameMode): void {
    this.gameState.start(mode);
    this.player.reset(384, 500);
    this.camera.reset(500);
    this.platformManager.reset();
    this.obstacleManager.reset();
    this.particles.clear();
  }

  restart(): void {
    this.startRun(this.gameState.mode);
  }

  pause(): void {
    this.gameState.pause();
  }

  resume(): void {
    this.gameState.resume();
  }

  destroy(): void {
    this.canvas.removeEventListener('click', this.boundClickHandler);
    this.inputManager.destroy();
  }

  update(dt: number): void {
    if (this.inputManager.justPressed('Escape')) {
      if (this.gameState.status === 'playing') {
        this.gameState.pause();
      } else if (this.gameState.status === 'paused') {
        this.gameState.resume();
      }
    }

    if (this.gameState.status === 'ready') {
      if (this.inputManager.justPressed('Digit1') || this.inputManager.justPressed('KeyS')) {
        this.startRun('story');
      } else if (this.inputManager.justPressed('Digit2') || this.inputManager.justPressed('KeyI')) {
        this.startRun('infinite');
      } else if (this.inputManager.justPressed('Space') || this.inputManager.justPressed('Enter')) {
        this.startRun(this.gameState.mode);
      }
      this.inputManager.update();
      return;
    }

    if (this.gameState.status === 'gameover' || this.gameState.status === 'victory') {
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

    // Controls
    if (this.inputManager.isDown('KeyA') || this.inputManager.isDown('ArrowLeft')) {
      this.player.moveLeft(dt);
    } else if (this.inputManager.isDown('KeyD') || this.inputManager.isDown('ArrowRight')) {
      this.player.moveRight(dt);
    } else {
      this.player.applyFriction(dt);
    }

    if (this.inputManager.justPressed('KeyW') || this.inputManager.justPressed('ArrowUp')) {
      this.player.shoot();
      audio.playClick();
    }

    // Player update
    this.player.update(dt, this.canvas.width);

    // Rocket particles
    if (this.player.isRocketing) {
      this.particles.emitRocketFlame(this.player.x + this.player.width / 2, this.player.y + this.player.height, 2);
    }

    // Camera update
    this.camera.update(this.player.y, dt);

    // Generation
    const targetY = this.gameState.mode === 'story' ? -50000 : -Infinity;
    this.platformManager.generateAhead(this.camera.y, targetY);
    this.obstacleManager.generateAhead(this.camera.y, targetY);

    this.platformManager.update(dt);
    this.obstacleManager.update(dt);

    this.platformManager.cullBelow(this.camera.y + this.camera.viewportHeight);
    this.obstacleManager.cullBelow(this.camera.y + this.camera.viewportHeight);

    // Platform collisions
    const landRes = this.platformManager.checkLanding(this.player, dt);
    if (landRes.hit && landRes.platform) {
      if (landRes.gotRocket) {
        audio.playPowerup();
        this.particles.emitExplosion(this.player.x + 16, this.player.y + 16, '#fdcb6e', 20);
      } else if (landRes.isSuperBounce) {
        audio.playBounce();
        this.particles.emitSpringSparks(landRes.platform.x + landRes.platform.width / 2, landRes.platform.y, 14);
      } else if (landRes.platform.type === 'fragile') {
        audio.playBounce();
        this.particles.emitFragileCrumble(landRes.platform.x, landRes.platform.y, landRes.platform.width, 12);
      } else {
        audio.playBounce();
        this.particles.emitJumpDust(landRes.platform.x + landRes.platform.width / 2, landRes.platform.y, 8);
      }
    }

    // Obstacle collisions
    const combatScore = this.obstacleManager.checkProjectileCollisions(this.player);
    if (combatScore > 0) {
      audio.playExplosion();
      this.gameState.addScore(combatScore);
      this.particles.emitExplosion(this.player.x + 16, this.camera.y + 200, '#ff7675', 12);
    }

    const obsRes = this.obstacleManager.checkPlayerInteractions(this.player);
    if (obsRes.hitObstacle) {
      if (obsRes.stomped) {
        audio.playBounce();
        this.particles.emitExplosion(obsRes.hitObstacle.x + 18, obsRes.hitObstacle.y + 12, '#fdcb6e', 14);
        this.gameState.addScore(obsRes.pointsAwarded);
      } else if (obsRes.balloonBounce) {
        audio.playBounce();
        this.particles.emitBalloonPop(obsRes.hitObstacle.x + 16, obsRes.hitObstacle.y + 20, 12);
        this.gameState.addScore(obsRes.pointsAwarded);
      } else if (obsRes.playerDead) {
        audio.playError();
        this.particles.emitExplosion(this.player.x + 16, this.player.y + 16, '#ff3838', 24);
        this.gameState.triggerGameOver();
      }
    }

    // Abyss fall check
    if (this.camera.isOutOfBounds(this.player.y)) {
      if (this.gameState.status === 'playing') {
        audio.playError();
      }
      this.gameState.triggerGameOver();
    }

    // Altitude & score
    const prevStatus = this.gameState.status;
    this.gameState.updateAltitude(this.player.y);
    if (prevStatus === 'playing' && this.gameState.status === 'victory') {
      audio.playVictory();
    }

    this.particles.update(dt);
    this.inputManager.update();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Dynamic Altitude Sky Gradient
    const altRatio = Math.min(1, Math.max(0, this.gameState.altitude / 5000));
    const grad = ctx.createLinearGradient(0, 0, 0, h);

    if (altRatio < 0.2) {
      // 0 - 1000m: Sunset Violet
      grad.addColorStop(0, '#2c1654');
      grad.addColorStop(1, '#e84393');
    } else if (altRatio < 0.6) {
      // 1000 - 3000m: Twilight Deep Purple
      grad.addColorStop(0, '#0f0c29');
      grad.addColorStop(1, '#302b63');
    } else {
      // 3000m+: Deep Cosmic Void
      grad.addColorStop(0, '#050510');
      grad.addColorStop(1, '#0d0e23');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling Starfield with Parallax
    for (const s of this.stars) {
      const starScreenY = (s.y - this.camera.y * s.speed) % h;
      const actualY = starScreenY < 0 ? starScreenY + h : starScreenY;
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, actualY, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Story Mothership at 5,000m altitude (y = -49500 to -50000)
    if (this.gameState.mode === 'story') {
      const shipScreenY = this.camera.toScreenY(-49600);
      if (shipScreenY >= -400 && shipScreenY <= h + 200) {
        ctx.save();
        ctx.fillStyle = '#6c5ce7';
        ctx.beginPath();
        ctx.ellipse(w / 2, shipScreenY, 300, 70, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00cec9';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#fdcb6e';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ AIRSHIP MOTHERSHIP DOCKING BAY ⚡', w / 2, shipScreenY + 6);
        ctx.restore();
      }
    }

    // 3. Render Platforms
    for (const p of this.platformManager.platforms) {
      if (p.broken) continue;
      const sy = this.camera.toScreenY(p.y);
      if (sy < -30 || sy > h + 30) continue;

      ctx.save();
      if (p.type === 'standard') {
        ctx.fillStyle = '#00b894';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.fillStyle = '#55efc4';
        ctx.fillRect(p.x, sy, p.width, 4);
      } else if (p.type === 'fragile') {
        ctx.fillStyle = 'rgba(129, 236, 236, 0.7)';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(p.x, sy, p.width, p.height);
      } else if (p.type === 'moving') {
        ctx.fillStyle = '#0984e3';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.fillStyle = '#74b9ff';
        ctx.fillRect(p.x, sy, p.width, 3);
        // Chevrons
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('◄ ►', p.x + p.width / 2, sy + 12);
      } else if (p.type === 'spring') {
        ctx.fillStyle = '#6c5ce7';
        ctx.fillRect(p.x, sy, p.width, p.height);
        ctx.fillStyle = '#a29bfe';
        ctx.fillRect(p.x, sy, p.width, 3);
        // Spring coil
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(p.x + p.width / 2 - 8, sy - 8, 16, 8);
      }

      // Rocket powerup
      if (p.hasRocket) {
        ctx.fillStyle = '#e17055';
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, sy - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fdcb6e';
        ctx.fillText('🚀', p.x + p.width / 2 - 6, sy - 4);
      }
      ctx.restore();
    }

    // 4. Render Obstacles
    for (const obs of this.obstacleManager.obstacles) {
      if (!obs.alive) continue;
      const sy = this.camera.toScreenY(obs.y);
      if (sy < -50 || sy > h + 50) continue;

      ctx.save();
      if (obs.type === 'drone') {
        ctx.fillStyle = '#d63031';
        ctx.fillRect(obs.x, sy, obs.width, obs.height);
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(obs.x + (obs.vx > 0 ? obs.width - 10 : 2), sy + 4, 8, 6);
        // Rotor
        ctx.fillStyle = '#dfe6e9';
        ctx.fillRect(obs.x - 4, sy - 4, obs.width + 8, 3);
      } else if (obs.type === 'spire') {
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, sy + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff7675';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, sy + obs.height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'balloon') {
        ctx.fillStyle = '#fd79a8';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, sy + 16, obs.width / 2, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2 - 4, sy + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dfe6e9';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, sy + 32);
        ctx.lineTo(obs.x + obs.width / 2, sy + obs.height);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Render Projectiles
    for (const proj of this.player.projectiles) {
      if (!proj.alive) continue;
      const sy = this.camera.toScreenY(proj.y);
      ctx.save();
      ctx.fillStyle = '#00cec9';
      ctx.beginPath();
      ctx.arc(proj.x, sy, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#81ecec';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }

    // 6. Render Player
    const playerScreenY = this.camera.toScreenY(this.player.y);
    ctx.save();
    if (this.player.isRocketing) {
      ctx.fillStyle = 'rgba(253, 203, 110, 0.4)';
      ctx.beginPath();
      ctx.arc(this.player.x + 16, playerScreenY + 16, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hopper body
    ctx.fillStyle = '#55efc4';
    ctx.beginPath();
    ctx.roundRect(this.player.x, playerScreenY, this.player.width, this.player.height, 8);
    ctx.fill();
    ctx.strokeStyle = '#00b894';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hopper ears / visor
    ctx.fillStyle = '#2d3436';
    const eyeX = this.player.facing === 'right' ? this.player.x + 18 : this.player.x + 6;
    ctx.fillRect(eyeX, playerScreenY + 8, 8, 8);

    // Hopper ears (antenna)
    ctx.fillStyle = '#00b894';
    ctx.fillRect(this.player.x + 6, playerScreenY - 8, 4, 8);
    ctx.fillRect(this.player.x + 22, playerScreenY - 8, 4, 8);
    ctx.restore();

    // 7. Render Particles
    this.particles.render(ctx, (wy) => this.camera.toScreenY(wy));

    // 8. HUD
    this.renderHUD(ctx);

    // 9. Overlays
    if (this.gameState.status === 'ready') {
      this.renderReadyOverlay(ctx);
    } else if (this.gameState.status === 'paused') {
      this.renderPausedOverlay(ctx);
    } else if (this.gameState.status === 'gameover') {
      this.renderGameOverOverlay(ctx);
    } else if (this.gameState.status === 'victory') {
      this.renderVictoryOverlay(ctx);
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 12, 41, 0.85)';
    ctx.fillRect(0, 0, w, 44);

    ctx.fillStyle = '#55efc4';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';

    const altText =
      this.gameState.mode === 'story'
        ? `ALT: ${this.gameState.altitude} / 5000m`
        : `ALT: ${this.gameState.altitude}m`;
    ctx.fillText(altText, 20, 28);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffeaa7';
    ctx.fillText(`SCORE: ${this.gameState.score}`, w / 2, 28);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#dfe6e9';
    ctx.fillText(`BEST: ${this.gameState.highScore}`, w - 20, 28);

    // Mode Badge
    ctx.fillStyle = this.gameState.mode === 'story' ? '#0984e3' : '#6c5ce7';
    ctx.fillRect(w / 2 - 190, 10, 75, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.gameState.mode.toUpperCase(), w / 2 - 152, 26);

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(5, 5, 16, 0.88)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#55efc4';
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SKY HOPPER', w / 2, 160);

    ctx.fillStyle = '#ffeaa7';
    ctx.font = '16px monospace';
    ctx.fillText('CLIMB TO THE STARS', w / 2, 200);

    // Story button
    ctx.fillStyle = this.gameState.mode === 'story' ? '#0984e3' : '#2d3436';
    ctx.fillRect(180, 340, 200, 60);
    ctx.strokeStyle = '#74b9ff';
    ctx.strokeRect(180, 340, 200, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('[1] STORY MODE', 280, 365);
    ctx.font = '11px sans-serif';
    ctx.fillText('Reach 5,000m Airship', 280, 385);

    // Infinite button
    ctx.fillStyle = this.gameState.mode === 'infinite' ? '#6c5ce7' : '#2d3436';
    ctx.fillRect(420, 340, 200, 60);
    ctx.strokeStyle = '#a29bfe';
    ctx.strokeRect(420, 340, 200, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('[2] INFINITE MODE', 520, 365);
    ctx.font = '11px sans-serif';
    ctx.fillText('Endless High Altitude Climb', 520, 385);

    // Start prompt
    ctx.fillStyle = '#fdcb6e';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS SPACE TO LAUNCH', w / 2, 450);

    ctx.fillStyle = '#b2bec3';
    ctx.font = '13px monospace';
    ctx.fillText('A/D or ◄/► to Move | W or ▲ to Shoot | ESC to Pause', w / 2, 510);
    ctx.restore();
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffeaa7';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME PAUSED', w / 2, h / 2 - 20);

    ctx.fillStyle = '#dfe6e9';
    ctx.font = '16px monospace';
    ctx.fillText('Press ESC or Click to Resume', w / 2, h / 2 + 25);
    ctx.restore();
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 12, 41, 0.9)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ff7675';
    ctx.font = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FALLEN INTO THE VOID', w / 2, 180);

    ctx.fillStyle = '#dfe6e9';
    ctx.font = '18px monospace';
    ctx.fillText(`ALTITUDE REACHED: ${this.gameState.maxAltitude}m`, w / 2, 250);
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, w / 2, 290);

    ctx.fillStyle = '#ffeaa7';
    ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, w / 2, 340);

    // Play again button
    ctx.fillStyle = '#e17055';
    ctx.fillRect(280, 440, 240, 60);
    ctx.strokeStyle = '#fab1a0';
    ctx.strokeRect(280, 440, 240, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PLAY AGAIN (SPACE)', w / 2, 477);

    ctx.restore();
  }

  private renderVictoryOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(5, 5, 16, 0.92)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#55efc4';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MOTHERSHIP REACHED!', w / 2, 160);

    ctx.fillStyle = '#ffeaa7';
    ctx.font = '18px monospace';
    ctx.fillText('CONGRATULATIONS HOPPER!', w / 2, 210);

    ctx.fillStyle = '#dfe6e9';
    ctx.fillText(`5,000m ASCENT COMPLETE`, w / 2, 270);
    ctx.fillText(`CLEAR BONUS: +2,500 PTS`, w / 2, 310);
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, w / 2, 350);

    ctx.fillStyle = '#ffeaa7';
    ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, w / 2, 390);

    // Play again button
    ctx.fillStyle = '#00b894';
    ctx.fillRect(280, 440, 240, 60);
    ctx.strokeStyle = '#55efc4';
    ctx.strokeRect(280, 440, 240, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PLAY AGAIN (SPACE)', w / 2, 477);

    ctx.restore();
  }
}
