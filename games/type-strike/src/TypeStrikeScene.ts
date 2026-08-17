import { GameScene, audio } from '@arcade-carnival/game-engine';
import { Dictionary, WordTier } from './Dictionary.js';
import { Enemy } from './Enemy.js';
import { TypingEngine } from './TypingEngine.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';

interface MatrixDrop {
  x: number;
  y: number;
  speed: number;
  char: string;
}

export class TypeStrikeScene implements GameScene {
  dictionary: Dictionary;
  typingEngine: TypingEngine;
  gameState: GameState;
  particles: ParticleSystem;
  canvas: HTMLCanvasElement;

  enemies: Enemy[] = [];
  spawnTimer: number = 0;
  spawnInterval: number = 2.0;
  enemySpeedBase: number = 38;
  lanes: number[] = [100, 180, 260, 340, 420];
  enemyIdCounter: number = 0;
  matrixRainDrops: MatrixDrop[] = [];
  defenderTurretY: number = 260;

  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onPointerDownBound: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.dictionary = new Dictionary();
    this.typingEngine = new TypingEngine();
    this.gameState = new GameState();
    this.particles = new ParticleSystem();

    // Generate matrix drops
    const chars = '01ABCDEFXYZ$%#@*<>';
    for (let i = 0; i < 35; i++) {
      this.matrixRainDrops.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        speed: 40 + Math.random() * 120,
        char: chars[Math.floor(Math.random() * chars.length)]!
      });
    }

    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onPointerDownBound = this.handlePointerDown.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDownBound);
      canvas.addEventListener('pointerdown', this.onPointerDownBound);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.gameState.status === 'ready') {
      if (e.code === 'Space' || e.code === 'Enter' || (e.key.length === 1 && e.key >= 'a' && e.key <= 'z') || (e.key.length === 1 && e.key >= 'A' && e.key <= 'Z')) {
        audio.playClick();
        this.gameState.start();
        return;
      }
    }

    if (this.gameState.status === 'gameover') {
      if (e.code === 'Space' || e.code === 'Enter') {
        this.restart();
        return;
      }
    }

    if (this.gameState.status === 'paused') {
      if (e.key === 'Escape') {
        this.gameState.resume();
        return;
      }
    }

    if (this.gameState.status === 'playing') {
      if (e.key === 'Escape') {
        this.gameState.pause();
        return;
      }

      const prevStreak = this.typingEngine.getStreak();
      const res = this.typingEngine.handleKey(e.key, this.enemies);

      if (res.status === 'locked' || res.status === 'progress') {
        audio.playClick();
        const target = this.typingEngine.getActiveTarget();
        if (target) {
          this.particles.fireLaserBeam(60, this.defenderTurretY, target.x, target.y + target.height / 2, '#00ffcc', 3);
          this.particles.emitLaserHitSparks(target.x, target.y + target.height / 2, 8);
        }
      } else if (res.status === 'completed') {
        if (res.targetEnemy) {
          audio.playScore();
          if (this.typingEngine.getStreak() > prevStreak && this.typingEngine.getStreak() % 5 === 0) {
            audio.playPowerup();
          }
          this.particles.fireLaserBeam(60, this.defenderTurretY, res.targetEnemy.x, res.targetEnemy.y + res.targetEnemy.height / 2, '#ff0055', 5);
          this.particles.emitExplosion(res.targetEnemy.x + res.targetEnemy.width / 2, res.targetEnemy.y + res.targetEnemy.height / 2, 32);
          this.particles.addFloatingText(`+${res.pointsEarned} (${res.multiplier}x)`, res.targetEnemy.x, res.targetEnemy.y - 15, '#ffeaa7', 22);
          this.gameState.addScore(res.pointsEarned ?? 0);
        }
      } else if (res.status === 'typo') {
        audio.playError();
        if (res.targetEnemy) {
          this.particles.addFloatingText('TYPO! RESET 1x', res.targetEnemy.x, res.targetEnemy.y - 20, '#ff4757', 18);
        } else {
          this.particles.addFloatingText('MISMATCH', 140, 260, '#ff4757', 18);
        }
      }
    }
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.gameState.status === 'ready') {
      this.gameState.start();
    } else if (this.gameState.status === 'gameover') {
      this.restart();
    } else if (this.gameState.status === 'paused') {
      this.gameState.resume();
    }
  }

  update(dt: number): void {
    // Update matrix rain
    const chars = '01ABCDEFXYZ$%#@*<>';
    for (const drop of this.matrixRainDrops) {
      drop.y += drop.speed * dt;
      if (drop.y > 600) {
        drop.y = -20;
        drop.x = Math.random() * 800;
        drop.char = chars[Math.floor(Math.random() * chars.length)]!;
      }
    }

    this.particles.update(dt);

    if (this.gameState.status !== 'playing') {
      return;
    }

    this.gameState.update(dt);

    // Difficulty scaling over 60s
    const elapsed = (this.gameState.roundDuration - this.gameState.timeRemaining) / this.gameState.roundDuration;
    this.spawnInterval = Math.max(0.85, 2.2 - elapsed * 1.35);
    const currentSpeed = this.enemySpeedBase + elapsed * 32;

    // Drone spawner
    this.spawnTimer += dt;
    while (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this.spawnDrone(elapsed, currentSpeed);
    }

    // Update enemies
    for (const enemy of this.enemies) {
      if (enemy.alive) {
        enemy.update(dt);
        if (enemy.isBreachingBase()) {
          enemy.destroy();
          this.gameState.damageShield(1);
          this.typingEngine.handleTargetLost(enemy.id);
          this.particles.emitShieldBreachWave(60, enemy.y + enemy.height / 2);
          this.particles.emitExplosion(60, enemy.y + enemy.height / 2, 25);
          this.particles.addFloatingText('SHIELD BREACH! -1', 90, enemy.y, '#ff3838', 22);

          if (this.gameState.shields <= 0) {
            audio.playExplosion();
          } else {
            audio.playError();
          }
        }
      }
    }

    // Cull dead enemies
    this.enemies = this.enemies.filter((e) => e.alive);
  }

  private spawnDrone(elapsed: number, speed: number): void {
    const lane = Math.floor(Math.random() * this.lanes.length);
    const activeWords = this.enemies.filter((e) => e.alive).map((e) => e.word);

    let tier: WordTier;
    if (elapsed < 0.3) {
      tier = Math.random() < 0.75 ? 'short' : 'medium';
    } else if (elapsed < 0.7) {
      const rand = Math.random();
      tier = rand < 0.4 ? 'short' : (rand < 0.8 ? 'medium' : 'long');
    } else {
      tier = Math.random() < 0.5 ? 'medium' : 'long';
    }

    const wordEntry = this.dictionary.getRandomWord(activeWords, tier);
    this.enemies.push(
      new Enemy({
        id: 'enemy-' + (++this.enemyIdCounter),
        word: wordEntry.word,
        tier: wordEntry.tier,
        basePoints: wordEntry.basePoints,
        lane,
        y: this.lanes[lane],
        speed
      })
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Cyber background
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 600);
    bgGrad.addColorStop(0, '#050811');
    bgGrad.addColorStop(1, '#0a1128');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 600);

    // Matrix background drops
    ctx.font = '14px monospace';
    for (const drop of this.matrixRainDrops) {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.18)';
      ctx.fillText(drop.char, drop.x, drop.y);
    }

    // Lane laser divider guides
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    for (const laneY of this.lanes) {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(60, laneY + 18);
      ctx.lineTo(800, laneY + 18);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 2. Base / Defender zone (x: 0..60)
    const shieldAlpha = Math.max(0.2, this.gameState.shields / this.gameState.maxShields);
    ctx.fillStyle = `rgba(0, 255, 200, ${shieldAlpha * 0.25})`;
    ctx.fillRect(0, 0, 60, 600);

    // Shield barrier neon strip
    ctx.strokeStyle = this.gameState.shields > 1 ? '#00ffcc' : '#ff4757';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.lineTo(60, 600);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Defender command turret at (20, defenderTurretY)
    ctx.fillStyle = '#1e272e';
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(24, this.defenderTurretY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Turret cannon emitter
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(24, this.defenderTurretY - 4, 20, 8);

    // 3. Enemies
    const activeTarget = this.typingEngine.getActiveTarget();

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const isTarget = activeTarget && activeTarget.id === enemy.id;
      const ey = enemy.y + enemy.hoverOffset;

      // Drone body
      ctx.save();
      ctx.fillStyle = isTarget ? '#2d3436' : '#1e272e';
      ctx.strokeStyle = isTarget ? '#00ffcc' : (enemy.tier === 'long' ? '#a29bfe' : (enemy.tier === 'medium' ? '#ffeaa7' : '#00d2d3'));
      ctx.lineWidth = isTarget ? 3 : 1.5;
      if (isTarget) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00ffcc';
      }

      // Drone chassis shape (angular chevron)
      ctx.beginPath();
      ctx.moveTo(enemy.x, ey + enemy.height / 2);
      ctx.lineTo(enemy.x + 20, ey);
      ctx.lineTo(enemy.x + enemy.width, ey + 4);
      ctx.lineTo(enemy.x + enemy.width - 8, ey + enemy.height / 2);
      ctx.lineTo(enemy.x + enemy.width, ey + enemy.height - 4);
      ctx.lineTo(enemy.x + 20, ey + enemy.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Drone eye core
      ctx.fillStyle = isTarget ? '#00ffcc' : '#ff4757';
      ctx.beginPath();
      ctx.arc(enemy.x + 16, ey + enemy.height / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Thruster flame
      ctx.fillStyle = '#ff7675';
      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.width - 6, ey + enemy.height / 2 - 4);
      ctx.lineTo(enemy.x + enemy.width + 10, ey + enemy.height / 2);
      ctx.lineTo(enemy.x + enemy.width - 6, ey + enemy.height / 2 + 4);
      ctx.fill();

      // Target selection brackets [ ... ]
      if (isTarget) {
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        const pad = 8;
        // Left bracket
        ctx.beginPath();
        ctx.moveTo(enemy.x - pad + 6, ey - pad);
        ctx.lineTo(enemy.x - pad, ey - pad);
        ctx.lineTo(enemy.x - pad, ey + enemy.height + pad);
        ctx.lineTo(enemy.x - pad + 6, ey + enemy.height + pad);
        ctx.stroke();

        // Right bracket
        const rx = enemy.x + enemy.width + pad;
        ctx.beginPath();
        ctx.moveTo(rx - 6, ey - pad);
        ctx.lineTo(rx, ey - pad);
        ctx.lineTo(rx, ey + enemy.height + pad);
        ctx.lineTo(rx - 6, ey + enemy.height + pad);
        ctx.stroke();
      }

      // Word Badge
      ctx.font = 'bold 18px "Courier New", monospace';
      const wordText = enemy.word;
      const badgeWidth = Math.max(70, ctx.measureText(wordText).width + 24);
      const badgeX = enemy.x + enemy.width / 2 - badgeWidth / 2;
      const badgeY = ey - 26;

      ctx.fillStyle = 'rgba(5, 8, 17, 0.88)';
      ctx.strokeStyle = isTarget ? '#00ffcc' : '#4b6584';
      ctx.lineWidth = isTarget ? 2 : 1;
      ctx.fillRect(badgeX, badgeY, badgeWidth, 22);
      ctx.strokeRect(badgeX, badgeY, badgeWidth, 22);

      // Render prefix matched (green), next char (cyan cursor), remaining (white)
      const matched = enemy.getMatchedPrefix();
      const unmatched = enemy.getUnmatchedPrefix();

      let textCursorX = badgeX + 12;
      ctx.textBaseline = 'middle';
      const textCenterY = badgeY + 11;

      if (matched.length > 0) {
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff88';
        ctx.fillText(matched, textCursorX, textCenterY);
        ctx.shadowBlur = 0;
        textCursorX += ctx.measureText(matched).width;
      }

      if (unmatched.length > 0) {
        ctx.fillStyle = '#f5f6fa';
        ctx.fillText(unmatched, textCursorX, textCenterY);

        if (isTarget) {
          // Cursor underline under next char
          const nextChar = unmatched[0]!;
          const nextCharWidth = ctx.measureText(nextChar).width;
          ctx.strokeStyle = '#00ffcc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(textCursorX, textCenterY + 8);
          ctx.lineTo(textCursorX + nextCharWidth, textCenterY + 8);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // 4. Lasers & Particles
    this.particles.render(ctx);

    // 5. Top Cyber HUD
    ctx.fillStyle = 'rgba(5, 8, 17, 0.95)';
    ctx.fillRect(0, 0, 800, 50);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(800, 50);
    ctx.stroke();

    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textBaseline = 'middle';

    // Shields (left)
    ctx.fillStyle = '#00d2d3';
    ctx.fillText('SHIELDS:', 20, 25);
    for (let s = 0; s < this.gameState.maxShields; s++) {
      const sx = 105 + s * 24;
      if (s < this.gameState.shields) {
        ctx.fillStyle = '#00ffcc';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00ffcc';
        ctx.fillRect(sx, 17, 16, 16);
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, 17, 16, 16);
      }
    }

    // Timer & Score (center)
    ctx.fillStyle = this.gameState.timeRemaining < 10 ? '#ff4757' : '#f5f6fa';
    ctx.textAlign = 'center';
    ctx.fillText(`TIME: ${this.gameState.timeRemaining.toFixed(1)}s`, 320, 25);

    ctx.fillStyle = '#ffeaa7';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 480, 25);

    // Multiplier & Streak (right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00ffcc';
    ctx.fillText(`STREAK: ${this.typingEngine.getStreak()} [${this.typingEngine.getMultiplier()}x]`, 780, 25);

    // Bottom Lock Terminal Status Bar
    ctx.fillStyle = 'rgba(5, 8, 17, 0.85)';
    ctx.fillRect(0, 565, 800, 35);
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 565);
    ctx.lineTo(800, 565);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '14px "Courier New", monospace';
    if (activeTarget) {
      ctx.fillStyle = '#00ffcc';
      ctx.fillText(`TARGET LOCKED: [${activeTarget.getMatchedPrefix()}]${activeTarget.getUnmatchedPrefix()}  |  NEXT CHAR: '${activeTarget.getNextChar()}'`, 20, 582);
    } else {
      ctx.fillStyle = '#718093';
      ctx.fillText('STATUS: RADAR ACTIVE. TYPE TARGET PROMPT TO ENGAGE LASER STRIKE.', 20, 582);
    }

    // 6. Overlays
    if (this.gameState.status === 'ready') {
      this.renderReadyOverlay(ctx);
    } else if (this.gameState.status === 'paused') {
      this.renderPausedOverlay(ctx);
    } else if (this.gameState.status === 'gameover') {
      this.renderGameOverOverlay(ctx);
    }

    // 7. CRT scanline overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < 600; y += 3) {
      ctx.fillRect(0, y, 800, 1.2);
    }

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(5, 8, 17, 0.88)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 44px "Courier New", monospace';
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#00ffcc';
    ctx.fillText('TYPE STRIKE', 400, 200);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffeaa7';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('CYBER DEFENSE TERMINAL', 400, 240);

    ctx.fillStyle = '#dcdde1';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('Type prompt words above approaching drones to fire lasers.', 400, 300);
    ctx.fillText('Complete words sequentially to scale streak multiplier up to 8x.', 400, 330);
    ctx.fillText('Defend base shields across 60 seconds of cyber onslaught!', 400, 360);

    if (this.gameState.highScore > 0) {
      ctx.fillStyle = '#ffeaa7';
      ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 410);
    }

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff88';
    ctx.fillText('PRESS ANY KEY OR CLICK TO COMMENCE DEFENSE', 400, 480);
    ctx.shadowBlur = 0;
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(5, 8, 17, 0.85)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.fillText('SYSTEM PAUSED', 400, 270);

    ctx.fillStyle = '#f5f6fa';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('Press ESC or Click to Resume', 400, 330);
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(5, 8, 17, 0.92)';
    ctx.fillRect(0, 0, 800, 600);

    ctx.textAlign = 'center';
    const isWin = this.gameState.gameOverReason === 'time_up';
    ctx.fillStyle = isWin ? '#00ff88' : '#ff4757';
    ctx.font = 'bold 38px "Courier New", monospace';
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fillText(isWin ? 'MISSION ACCOMPLISHED' : 'BASE OVERRUN', 400, 180);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#f5f6fa';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText(isWin ? '60s Survival Window Complete!' : 'All Base Shields Depleted!', 400, 225);

    ctx.fillStyle = '#ffeaa7';
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, 400, 290);

    ctx.fillStyle = '#dcdde1';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText(`DRONES ELIMINATED: ${this.gameState.wordsDestroyed}`, 400, 335);
    ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 370);

    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffcc';
    ctx.fillText('PRESS SPACE OR ENTER TO REBOOT', 400, 470);
    ctx.shadowBlur = 0;
  }

  restart(): void {
    this.gameState.restart();
    this.typingEngine.reset();
    this.enemies = [];
    this.spawnTimer = 0;
    this.particles.clear();
  }

  pause(): void {
    this.gameState.pause();
  }

  resume(): void {
    this.gameState.resume();
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDownBound);
      this.canvas.removeEventListener('pointerdown', this.onPointerDownBound);
    }
  }
}
