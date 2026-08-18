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
      audio.playError();
      this.gameState.triggerGameOver();
    }

    // Altitude & score
    this.gameState.updateAltitude(this.player.y);
    if ((this.gameState.status as string) === 'victory') {
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
      // 0 - 1000m: Warm craft sunrise parchment
      grad.addColorStop(0, '#F4EAD4');
      grad.addColorStop(1, '#FDE68A');
    } else if (altRatio < 0.6) {
      // 1000 - 3000m: Twilight cardboard
      grad.addColorStop(0, '#D8C3A5');
      grad.addColorStop(1, '#C5A880');
    } else {
      // 3000m+: Deep inked craft wash
      grad.addColorStop(0, '#473C35');
      grad.addColorStop(1, '#2B2118');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Papercut star stickers and stamped dots
    for (const s of this.stars) {
      const starScreenY = (s.y - this.camera.y * s.speed) % h;
      const actualY = starScreenY < 0 ? starScreenY + h : starScreenY;
      ctx.fillStyle = altRatio > 0.6 ? `rgba(255, 253, 248, ${s.alpha})` : `rgba(62, 39, 35, ${s.alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(s.x, actualY, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Story Mothership at 5,000m altitude (y = -49500 to -50000)
    if (this.gameState.mode === 'story') {
      const shipScreenY = this.camera.toScreenY(-49600);
      if (shipScreenY >= -400 && shipScreenY <= h + 200) {
        ctx.save();
        // Drop shadow
        ctx.fillStyle = 'rgba(62, 39, 35, 0.3)';
        ctx.beginPath();
        ctx.ellipse(w / 2 + 4, shipScreenY + 4, 300, 70, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cardboard mothership hull
        ctx.fillStyle = '#C5A880';
        ctx.beginPath();
        ctx.ellipse(w / 2, shipScreenY, 300, 70, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Taped banner
        ctx.fillStyle = '#FFFDF8';
        ctx.beginPath();
        ctx.roundRect(w / 2 - 200, shipScreenY - 18, 400, 36, 4);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#C85A32';
        ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★ AIRSHIP MOTHERSHIP DOCKING BAY ★', w / 2, shipScreenY + 1);
        ctx.restore();
      }
    }

    // 3. Render Platforms
    for (const p of this.platformManager.platforms) {
      if (p.broken) continue;
      const sy = this.camera.toScreenY(p.y);
      if (sy < -30 || sy > h + 30) continue;

      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.beginPath();
      ctx.roundRect(p.x + 2, sy + 2, p.width, p.height, 4);
      ctx.fill();

      if (p.type === 'standard') {
        // Construction green paper with cardboard edge
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(p.x, sy, p.width, p.height, 4);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Paper highlight strip
        ctx.fillStyle = 'rgba(255, 253, 248, 0.4)';
        ctx.beginPath();
        ctx.roundRect(p.x + 2, sy + 2, p.width - 4, 3, 2);
        ctx.fill();
      } else if (p.type === 'fragile') {
        // Kraft paper with dashed perforated tear lines
        ctx.fillStyle = '#E8DEC8';
        ctx.beginPath();
        ctx.roundRect(p.x, sy, p.width, p.height, 4);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(p.x, sy, p.width, p.height);
      } else if (p.type === 'moving') {
        // Blue construction paper with paper tape chevrons
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.roundRect(p.x, sy, p.width, p.height, 4);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tape arrows
        ctx.fillStyle = '#FFFDF8';
        ctx.font = 'bold 12px "Patrick Hand", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('◄ ►', p.x + p.width / 2, sy + p.height / 2 + 1);
      } else if (p.type === 'spring') {
        // Purple construction paper with paper spring coil
        ctx.fillStyle = '#8B5CF6';
        ctx.beginPath();
        ctx.roundRect(p.x, sy, p.width, p.height, 4);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Spring coil cutout
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.roundRect(p.x + p.width / 2 - 8, sy - 8, 16, 8, 2);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Rocket powerup badge
      if (p.hasRocket) {
        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, sy - 10, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#FFFDF8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚀', p.x + p.width / 2, sy - 10);
      }
      ctx.restore();
    }

    // 4. Render Obstacles
    for (const obs of this.obstacleManager.obstacles) {
      if (!obs.alive) continue;
      const sy = this.camera.toScreenY(obs.y);
      if (sy < -50 || sy > h + 50) continue;

      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.fillRect(obs.x + 2, sy + 2, obs.width, obs.height);

      if (obs.type === 'drone') {
        // Origami paper flyer drone
        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.roundRect(obs.x, sy, obs.width, obs.height, 4);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inked eye
        ctx.fillStyle = '#FFFDF8';
        ctx.fillRect(obs.x + (obs.vx > 0 ? obs.width - 10 : 2), sy + 4, 8, 6);

        // Cardboard rotor strip
        ctx.fillStyle = '#C5A880';
        ctx.fillRect(obs.x - 4, sy - 4, obs.width + 8, 3);
        ctx.strokeStyle = '#3E2723';
        ctx.strokeRect(obs.x - 4, sy - 4, obs.width + 8, 3);
      } else if (obs.type === 'spire') {
        // Cardboard spiked disc
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, sy + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, sy + obs.height / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'balloon') {
        // Papercut construction balloon
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width / 2, sy + 16, obs.width / 2, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Paper highlight
        ctx.fillStyle = '#FFFDF8';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2 - 4, sy + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Paper string
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.2;
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
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(proj.x, sy, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    // 6. Render Player
    const playerScreenY = this.camera.toScreenY(this.player.y);
    ctx.save();
    if (this.player.isRocketing) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.arc(this.player.x + 16, playerScreenY + 16, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.roundRect(this.player.x + 2, playerScreenY + 2, this.player.width, this.player.height, 8);
    ctx.fill();

    // Papercut Hopper body
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(this.player.x, playerScreenY, this.player.width, this.player.height, 8);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cardboard visor
    ctx.fillStyle = '#3E2723';
    const eyeX = this.player.facing === 'right' ? this.player.x + 18 : this.player.x + 6;
    ctx.fillRect(eyeX, playerScreenY + 8, 8, 8);

    // Hopper cardboard ears
    ctx.fillStyle = '#C5A880';
    ctx.fillRect(this.player.x + 6, playerScreenY - 8, 4, 8);
    ctx.strokeRect(this.player.x + 6, playerScreenY - 8, 4, 8);
    ctx.fillRect(this.player.x + 22, playerScreenY - 8, 4, 8);
    ctx.strokeRect(this.player.x + 22, playerScreenY - 8, 4, 8);
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
    // Taped Placard Header
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, w, 48);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(w, 48);
    ctx.stroke();

    // Tape strips
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(200, 2, 24, 10);
    ctx.strokeRect(200, 2, 24, 10);
    ctx.fillRect(600, 2, 24, 10);
    ctx.strokeRect(600, 2, 24, 10);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const altText =
      this.gameState.mode === 'story'
        ? `ALT: ${this.gameState.altitude} / 5000m`
        : `ALT: ${this.gameState.altitude}m`;
    ctx.fillText(altText, 20, 25);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.fillText(`SCORE: ${this.gameState.score}`, w / 2, 25);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`BEST: ${this.gameState.highScore}`, w - 20, 25);

    // Mode Badge
    ctx.fillStyle = this.gameState.mode === 'story' ? '#3B82F6' : '#8B5CF6';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 200, 10, 80, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 13px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.gameState.mode.toUpperCase(), w / 2 - 160, 24);

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.88)';
    ctx.fillRect(0, 0, w, h);

    // Cardboard Modal Placard
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(140, 70, 520, 480, 10);
    ctx.fill();
    ctx.stroke();

    // Tape strips
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(200, 62, 60, 16);
    ctx.strokeRect(200, 62, 60, 16);
    ctx.fillRect(540, 62, 60, 16);
    ctx.strokeRect(540, 62, 60, 16);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 40px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SKY HOPPER', w / 2, 130);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('PAPERCRAFT VERTICAL ASCENT', w / 2, 165);

    // Story button
    ctx.fillStyle = this.gameState.mode === 'story' ? '#3B82F6' : '#E8DEC8';
    ctx.beginPath();
    ctx.roundRect(180, 240, 200, 64, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = this.gameState.mode === 'story' ? '#FFFDF8' : '#3E2723';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('[1] STORY MODE', 280, 268);
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Reach 5,000m Airship', 280, 290);

    // Infinite button
    ctx.fillStyle = this.gameState.mode === 'infinite' ? '#8B5CF6' : '#E8DEC8';
    ctx.beginPath();
    ctx.roundRect(420, 240, 200, 64, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = this.gameState.mode === 'infinite' ? '#FFFDF8' : '#3E2723';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('[2] INFINITE MODE', 520, 268);
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Endless High Climb', 520, 290);

    // Start prompt button
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(240, 360, 320, 48, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE TO LAUNCH', w / 2, 390);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '14px "Comfortaa", cursive, sans-serif';
    ctx.fillText('A/D or ◄/► to Move | W or ▲ to Shoot | ESC to Pause', w / 2, 450);
    ctx.restore();
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.85)';
    ctx.fillRect(0, 0, w, h);

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

    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME PAUSED', w / 2, 270);

    ctx.fillStyle = '#3E2723';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press ESC or Click to Resume', w / 2, 330);
    ctx.restore();
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
    ctx.fillRect(0, 0, w, h);

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

    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 38px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FALLEN FROM THE SKY', w / 2, 180);

    ctx.fillStyle = '#3E2723';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`ALTITUDE REACHED: ${this.gameState.maxAltitude}m`, w / 2, 240);
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, w / 2, 275);

    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, w / 2, 315);

    // Play again button
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(240, 360, 320, 48, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PLAY AGAIN (SPACE)', w / 2, 390);

    ctx.restore();
  }

  private renderVictoryOverlay(ctx: CanvasRenderingContext2D): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
    ctx.fillRect(0, 0, w, h);

    // Cardboard Placard
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(180, 110, 440, 380, 10);
    ctx.fill();
    ctx.stroke();

    // Tape
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(230, 102, 60, 16);
    ctx.strokeRect(230, 102, 60, 16);
    ctx.fillRect(510, 102, 60, 16);
    ctx.strokeRect(510, 102, 60, 16);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 38px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MOTHERSHIP REACHED!', w / 2, 170);

    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('CONGRATULATIONS HOPPER!', w / 2, 210);

    ctx.fillStyle = '#3E2723';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`5,000m ASCENT COMPLETE`, w / 2, 260);
    ctx.fillText(`CLEAR BONUS: +2,500 PTS`, w / 2, 290);
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, w / 2, 320);

    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, w / 2, 355);

    // Play again button
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(240, 390, 320, 48, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PLAY AGAIN (SPACE)', w / 2, 420);

    ctx.restore();
  }
}
