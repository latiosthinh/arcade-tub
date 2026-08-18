import { GameScene, audio } from '@arcade-carnival/game-engine';
import { Dictionary, WordTier, GameMode, arrowCharToSymbol } from './Dictionary.js';
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
  mode: GameMode = 'words';
  modeToggleRect = { x: 260, y: 390, width: 280, height: 44 };

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

  toggleMode(): void {
    this.mode = this.mode === 'words' ? 'arrows' : 'words';
    this.typingEngine.setMode(this.mode);
    audio.playClick();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.gameState.status === 'ready') {
      if (e.key === 'm' || e.key === 'M' || e.key === 'Tab') {
        e.preventDefault();
        this.toggleMode();
        return;
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        audio.playClick();
        this.gameState.start();
        return;
      }

      if (this.mode === 'words') {
        if (e.key.length === 1 && ((e.key >= 'a' && e.key <= 'z') || (e.key >= 'A' && e.key <= 'Z'))) {
          audio.playClick();
          this.gameState.start();
          this.processTypingKey(e.key);
          return;
        }
      } else {
        if (
          e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
          e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S' ||
          e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D'
        ) {
          e.preventDefault();
          audio.playClick();
          this.gameState.start();
          this.processTypingKey(e.key);
          return;
        }
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

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
        e.preventDefault();
      }

      this.processTypingKey(e.key);
    }
  }

  private processTypingKey(key: string): void {
    const prevStreak = this.typingEngine.getStreak();
    const res = this.typingEngine.handleKey(key, this.enemies, this.mode);

    if (res.status === 'locked' || res.status === 'progress') {
      audio.playClick();
      const target = this.typingEngine.getActiveTarget();
      if (target) {
        this.particles.fireLaserBeam(60, this.defenderTurretY, target.x, target.y + target.height / 2, '#00f0ff', 3.5);
        this.particles.emitLaserHitSparks(target.x, target.y + target.height / 2, 10);
      }
    } else if (res.status === 'completed') {
      if (res.targetEnemy) {
        audio.playScore();
        if (this.typingEngine.getStreak() > prevStreak && this.typingEngine.getStreak() % 5 === 0) {
          audio.playPowerup();
        }
        this.particles.fireLaserBeam(60, this.defenderTurretY, res.targetEnemy.x, res.targetEnemy.y + res.targetEnemy.height / 2, '#00f0ff', 6);
        this.particles.emitExplosion(res.targetEnemy.x + res.targetEnemy.width / 2, res.targetEnemy.y + res.targetEnemy.height / 2, 36);
        this.particles.addFloatingText(`+${res.pointsEarned} (${res.multiplier}x)`, res.targetEnemy.x, res.targetEnemy.y - 15, '#ffe600', 22);
        this.gameState.addScore(res.pointsEarned ?? 0);
      }
    } else if (res.status === 'typo') {
      audio.playError();
      if (res.targetEnemy) {
        this.particles.addFloatingText('TYPO! RESET 1x', res.targetEnemy.x, res.targetEnemy.y - 20, '#ff007f', 18);
      } else {
        this.particles.addFloatingText('MISMATCH', 140, 260, '#ff007f', 18);
      }
    }
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.gameState.status === 'ready') {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / (rect.width || 1);
      const scaleY = this.canvas.height / (rect.height || 1);
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (
        x >= this.modeToggleRect.x &&
        x <= this.modeToggleRect.x + this.modeToggleRect.width &&
        y >= this.modeToggleRect.y &&
        y <= this.modeToggleRect.y + this.modeToggleRect.height
      ) {
        this.toggleMode();
        return;
      }

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

    const wordEntry = this.dictionary.getRandomWord(activeWords, tier, this.mode);
    this.enemies.push(
      new Enemy({
        id: 'enemy-' + (++this.enemyIdCounter),
        word: wordEntry.word,
        tier: wordEntry.tier,
        basePoints: wordEntry.basePoints,
        lane,
        mode: this.mode,
        y: this.lanes[lane],
        speed
      })
    );
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Cyber background
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 600);
    bgGrad.addColorStop(0, '#0b0409');
    bgGrad.addColorStop(0.5, '#12081a');
    bgGrad.addColorStop(1, '#1a0b28');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 600);

    // Tactical Radar Wireframe Circles & Crosshairs
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(60, this.defenderTurretY, 180, -Math.PI / 2, Math.PI / 2);
    ctx.arc(60, this.defenderTurretY, 340, -Math.PI / 2, Math.PI / 2);
    ctx.arc(60, this.defenderTurretY, 520, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(60, this.defenderTurretY);
    ctx.lineTo(800, this.defenderTurretY - 240);
    ctx.moveTo(60, this.defenderTurretY);
    ctx.lineTo(800, this.defenderTurretY + 240);
    ctx.stroke();
    ctx.restore();

    // Matrix background drops
    ctx.font = '13px monospace';
    for (const drop of this.matrixRainDrops) {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.15)';
      ctx.fillText(drop.char, drop.x, drop.y);
    }

    // Lane laser divider guides
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    for (const laneY of this.lanes) {
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.15)';
      ctx.beginPath();
      ctx.moveTo(60, laneY + 18);
      ctx.lineTo(800, laneY + 18);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 2. Base / Defender zone (x: 0..60)
    const shieldAlpha = Math.max(0.2, this.gameState.shields / this.gameState.maxShields);
    ctx.fillStyle = `rgba(0, 240, 255, ${shieldAlpha * 0.22})`;
    ctx.fillRect(0, 0, 60, 600);

    // Shield barrier neon strip
    ctx.strokeStyle = this.gameState.shields > 1 ? '#00f0ff' : '#ff007f';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 16;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.lineTo(60, 600);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Defender command turret base
    ctx.fillStyle = '#1f1d36';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(20, this.defenderTurretY, 22, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing core reactor
    ctx.fillStyle = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.arc(18, this.defenderTurretY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Dual Turret cannon emitter barrels
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(20, this.defenderTurretY - 8, 24, 4);
    ctx.fillRect(20, this.defenderTurretY + 4, 24, 4);

    // 3. Enemies
    const activeTarget = this.typingEngine.getActiveTarget();

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const isTarget = activeTarget && activeTarget.id === enemy.id;
      const ey = enemy.y + enemy.hoverOffset;

      // Drone body
      ctx.save();
      ctx.fillStyle = isTarget ? '#2a1a38' : '#1a1829';
      ctx.strokeStyle = isTarget ? '#00f0ff' : (enemy.tier === 'long' ? '#ff007f' : (enemy.tier === 'medium' ? '#ffe600' : '#00f0ff'));
      ctx.lineWidth = isTarget ? 2.5 : 1.5;
      if (isTarget) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00f0ff';
      }

      // Drone chassis shape (angular cyberpunk stealth polygon)
      ctx.beginPath();
      ctx.moveTo(enemy.x, ey + enemy.height / 2);
      ctx.lineTo(enemy.x + 18, ey);
      ctx.lineTo(enemy.x + enemy.width, ey + 3);
      ctx.lineTo(enemy.x + enemy.width - 6, ey + enemy.height / 2);
      ctx.lineTo(enemy.x + enemy.width, ey + enemy.height - 3);
      ctx.lineTo(enemy.x + 18, ey + enemy.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Drone glowing eye core
      ctx.fillStyle = isTarget ? '#00f0ff' : '#ff007f';
      ctx.shadowBlur = isTarget ? 8 : 4;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(enemy.x + 14, ey + enemy.height / 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Thruster flames (dual exhaust)
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.width - 6, ey + 4);
      ctx.lineTo(enemy.x + enemy.width + 12, ey + 6);
      ctx.lineTo(enemy.x + enemy.width - 6, ey + 8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(enemy.x + enemy.width - 6, ey + enemy.height - 8);
      ctx.lineTo(enemy.x + enemy.width + 12, ey + enemy.height - 6);
      ctx.lineTo(enemy.x + enemy.width - 6, ey + enemy.height - 4);
      ctx.fill();

      // Target selection brackets [ ... ]
      if (isTarget) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        const pad = 10;
        // Left bracket
        ctx.beginPath();
        ctx.moveTo(enemy.x - pad + 8, ey - pad);
        ctx.lineTo(enemy.x - pad, ey - pad);
        ctx.lineTo(enemy.x - pad, ey + enemy.height + pad);
        ctx.lineTo(enemy.x - pad + 8, ey + enemy.height + pad);
        ctx.stroke();

        // Right bracket
        const rx = enemy.x + enemy.width + pad;
        ctx.beginPath();
        ctx.moveTo(rx - 8, ey - pad);
        ctx.lineTo(rx, ey - pad);
        ctx.lineTo(rx, ey + enemy.height + pad);
        ctx.lineTo(rx - 8, ey + enemy.height + pad);
        ctx.stroke();
      }

      // Word / Arrow Badge Container
      ctx.font = 'bold 18px "Courier New", monospace';
      const isArrowMode = enemy.mode === 'arrows';
      const badgeText = enemy.getFormattedWord();
      const badgeWidth = Math.max(74, ctx.measureText(badgeText).width + 24);
      const badgeX = enemy.x + enemy.width / 2 - badgeWidth / 2;
      const badgeY = ey - 28;

      ctx.fillStyle = 'rgba(10, 10, 24, 0.92)';
      ctx.strokeStyle = isTarget ? '#00f0ff' : 'rgba(255, 0, 127, 0.4)';
      ctx.lineWidth = isTarget ? 2 : 1;
      ctx.fillRect(badgeX, badgeY, badgeWidth, 24);
      ctx.strokeRect(badgeX, badgeY, badgeWidth, 24);

      // Render prefix matched (cyan glow), next char (cursor highlight), remaining (white)
      let textCursorX = badgeX + 12;
      ctx.textBaseline = 'middle';
      const textCenterY = badgeY + 12;

      if (isArrowMode) {
        // Draw individual arrow glyphs with spacing
        for (let i = 0; i < enemy.word.length; i++) {
          const char = enemy.word[i]!;
          const sym = arrowCharToSymbol(char);
          const isCharMatched = i < enemy.matchedIndex;
          const isCharNext = isTarget && i === enemy.matchedIndex;

          if (isCharMatched) {
            ctx.fillStyle = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00f0ff';
            ctx.fillText(sym, textCursorX, textCenterY);
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#f8fafc';
            ctx.fillText(sym, textCursorX, textCenterY);
          }

          const symWidth = ctx.measureText(sym).width;
          if (isCharNext) {
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(textCursorX, textCenterY + 9);
            ctx.lineTo(textCursorX + symWidth, textCenterY + 9);
            ctx.stroke();
          }

          // Advance cursor with space gap
          textCursorX += symWidth + (i < enemy.word.length - 1 ? ctx.measureText(' ').width : 0);
        }
      } else {
        const matched = enemy.getMatchedPrefix();
        const unmatched = enemy.getUnmatchedPrefix();

        if (matched.length > 0) {
          ctx.fillStyle = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00f0ff';
          ctx.fillText(matched, textCursorX, textCenterY);
          ctx.shadowBlur = 0;
          textCursorX += ctx.measureText(matched).width;
        }

        if (unmatched.length > 0) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(unmatched, textCursorX, textCenterY);

          if (isTarget) {
            // Cursor underline under next char
            const nextChar = unmatched[0]!;
            const nextCharWidth = ctx.measureText(nextChar).width;
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(textCursorX, textCenterY + 9);
            ctx.lineTo(textCursorX + nextCharWidth, textCenterY + 9);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    }

    // 4. Lasers & Particles
    this.particles.render(ctx);

    // 5. Top Cyber HUD
    ctx.fillStyle = 'rgba(10, 10, 24, 0.95)';
    ctx.fillRect(0, 0, 800, 52);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(800, 52);
    ctx.stroke();

    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textBaseline = 'middle';

    // Shields (left)
    ctx.fillStyle = '#ff007f';
    ctx.fillText('SHIELDS:', 20, 26);
    for (let s = 0; s < this.gameState.maxShields; s++) {
      const sx = 105 + s * 24;
      if (s < this.gameState.shields) {
        ctx.fillStyle = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f0ff';
        ctx.fillRect(sx, 18, 16, 16);
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, 18, 16, 16);
      }
    }

    // Timer & Score (center)
    ctx.fillStyle = this.gameState.timeRemaining < 10 ? '#ff007f' : '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(`TIME: ${this.gameState.timeRemaining.toFixed(1)}s`, 320, 26);

    ctx.fillStyle = '#ffe600';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 480, 26);

    // Multiplier & Streak (right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`STREAK: ${this.typingEngine.getStreak()} [${this.typingEngine.getMultiplier()}x]`, 780, 26);

    // Bottom Lock Terminal Status Bar
    ctx.fillStyle = 'rgba(10, 10, 24, 0.9)';
    ctx.fillRect(0, 565, 800, 35);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 565);
    ctx.lineTo(800, 565);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '14px "Courier New", monospace';
    if (activeTarget) {
      ctx.fillStyle = '#00f0ff';
      if (activeTarget.mode === 'arrows') {
        const matchedSymbols = activeTarget.getMatchedPrefix().split('').map(arrowCharToSymbol).join(' ');
        const unmatchedSymbols = activeTarget.getUnmatchedPrefix().split('').map(arrowCharToSymbol).join(' ');
        const nextSymbol = activeTarget.getFormattedNextChar();
        ctx.fillText(`TARGET LOCKED: [${matchedSymbols}] ${unmatchedSymbols}  |  NEXT ARROW: '${nextSymbol}'`, 20, 582);
      } else {
        ctx.fillText(`TARGET LOCKED: [${activeTarget.getMatchedPrefix()}]${activeTarget.getUnmatchedPrefix()}  |  NEXT CHAR: '${activeTarget.getNextChar()}'`, 20, 582);
      }
    } else {
      ctx.fillStyle = '#94a3b8';
      const promptTip = this.mode === 'arrows'
        ? 'STATUS: RADAR ACTIVE. PRESS ARROW KEYS OR WASD TO ENGAGE LASER STRIKE.'
        : 'STATUS: RADAR ACTIVE. TYPE TARGET PROMPT TO ENGAGE LASER STRIKE.';
      ctx.fillText(promptTip, 20, 582);
    }

    // 6. Overlays
    if (this.gameState.status === 'ready') {
      this.renderReadyOverlay(ctx);
    } else if (this.gameState.status === 'paused') {
      this.renderPausedOverlay(ctx);
    } else if (this.gameState.status === 'gameover') {
      this.renderGameOverOverlay(ctx);
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
    ctx.fillText('TYPE STRIKE', 400, 160);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffeaa7';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('CYBER DEFENSE TERMINAL', 400, 200);

    // Mode-specific instructions
    ctx.fillStyle = '#dcdde1';
    ctx.font = '16px "Courier New", monospace';
    if (this.mode === 'arrows') {
      ctx.fillText('Press Arrow keys (↑↓←→) or WASD to clear direction sequences and fire lasers.', 400, 250);
      ctx.fillText('Complete sequences sequentially to scale streak multiplier up to 8x.', 400, 280);
      ctx.fillText('Defend base shields across 60 seconds of cyber onslaught!', 400, 310);
    } else {
      ctx.fillText('Type prompt words above approaching drones to fire lasers.', 400, 250);
      ctx.fillText('Complete words sequentially to scale streak multiplier up to 8x.', 400, 280);
      ctx.fillText('Defend base shields across 60 seconds of cyber onslaught!', 400, 310);
    }

    if (this.gameState.highScore > 0) {
      ctx.fillStyle = '#ffeaa7';
      ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 350);
    }

    // Mode Toggle Button
    const btn = this.modeToggleRect;
    ctx.fillStyle = 'rgba(18, 14, 36, 0.95)';
    ctx.strokeStyle = this.mode === 'arrows' ? '#ffe600' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
    ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);
    ctx.shadowBlur = 0;

    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = 'bold 18px "Courier New", monospace';
    const modeLabel = this.mode === 'arrows' ? 'MODE: ARROWS (↑↓←→)' : 'MODE: WORDS';
    ctx.fillText(modeLabel, btn.x + btn.width / 2, btn.y + btn.height / 2 + 6);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Courier New", monospace';
    ctx.fillText('Press [M] / [TAB] or Click Button to Toggle Mode', 400, 455);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff88';
    const startTip = this.mode === 'arrows'
      ? 'PRESS ARROW / WASD / SPACE TO COMMENCE'
      : 'PRESS ANY LETTER OR SPACE TO COMMENCE';
    ctx.fillText(startTip, 400, 515);
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
