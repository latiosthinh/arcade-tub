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

    // 1. Parchment paper command desk background (#F4EAD4)
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, 800, 600);

    // Stitched Tactical Radar Wireframe Rings & Crosshairs
    ctx.save();
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(60, this.defenderTurretY, 180, -Math.PI / 2, Math.PI / 2);
    ctx.arc(60, this.defenderTurretY, 340, -Math.PI / 2, Math.PI / 2);
    ctx.arc(60, this.defenderTurretY, 520, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(62, 39, 35, 0.08)';
    ctx.beginPath();
    ctx.moveTo(60, this.defenderTurretY);
    ctx.lineTo(800, this.defenderTurretY - 240);
    ctx.moveTo(60, this.defenderTurretY);
    ctx.lineTo(800, this.defenderTurretY + 240);
    ctx.stroke();
    ctx.restore();

    // Faint Typewriter text rain drops
    ctx.font = '13px "Patrick Hand", cursive, monospace';
    for (const drop of this.matrixRainDrops) {
      ctx.fillStyle = 'rgba(62, 39, 35, 0.1)';
      ctx.fillText(drop.char, drop.x, drop.y);
    }

    // Stitched lane divider ink guidelines
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    for (const laneY of this.lanes) {
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.18)';
      ctx.beginPath();
      ctx.moveTo(60, laneY + 18);
      ctx.lineTo(800, laneY + 18);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 2. Base / Cardboard Fortress Defender zone (x: 0..60)
    ctx.fillStyle = '#C5A880';
    ctx.fillRect(0, 0, 60, 600);

    // Stitched fortress edge
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.lineTo(60, 600);
    ctx.stroke();

    // Cardboard fortress rivets
    ctx.fillStyle = '#3E2723';
    for (let y = 30; y < 600; y += 60) {
      ctx.beginPath();
      ctx.arc(52, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cardboard command launcher hub
    ctx.fillStyle = '#E8DEC8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(20, this.defenderTurretY, 24, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Brass fastener axle
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(18, this.defenderTurretY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dual cardboard launcher barrels
    ctx.fillStyle = '#C85A32';
    ctx.fillRect(20, this.defenderTurretY - 8, 24, 5);
    ctx.strokeRect(20, this.defenderTurretY - 8, 24, 5);
    ctx.fillRect(20, this.defenderTurretY + 3, 24, 5);
    ctx.strokeRect(20, this.defenderTurretY + 3, 24, 5);

    // 3. Enemies - Papercraft Origami Flyers & Inked Cards
    const activeTarget = this.typingEngine.getActiveTarget();

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const isTarget = activeTarget && activeTarget.id === enemy.id;
      const ey = enemy.y + enemy.hoverOffset;

      ctx.save();
      // Drop shadow for origami flyer
      ctx.fillStyle = 'rgba(62, 39, 35, 0.22)';
      ctx.beginPath();
      ctx.moveTo(enemy.x + 3, ey + enemy.height / 2 + 3);
      ctx.lineTo(enemy.x + 18 + 3, ey + 3);
      ctx.lineTo(enemy.x + enemy.width + 3, ey + 3 + 3);
      ctx.lineTo(enemy.x + enemy.width - 6 + 3, ey + enemy.height / 2 + 3);
      ctx.lineTo(enemy.x + enemy.width + 3, ey + enemy.height - 3 + 3);
      ctx.lineTo(enemy.x + 18 + 3, ey + enemy.height + 3);
      ctx.closePath();
      ctx.fill();

      // Origami Paper Flyer Cutout
      const flyerBg = enemy.tier === 'long' ? '#E11D48' : enemy.tier === 'medium' ? '#F59E0B' : '#3B82F6';
      ctx.fillStyle = isTarget ? '#FFFDF8' : flyerBg;
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = isTarget ? 2.5 : 1.5;

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

      // Origami center fold crease
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(enemy.x, ey + enemy.height / 2);
      ctx.lineTo(enemy.x + enemy.width - 6, ey + enemy.height / 2);
      ctx.stroke();

      // Target selection paper brackets
      if (isTarget) {
        ctx.strokeStyle = '#E11D48';
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

      // Word / Arrow Papercut Badge
      ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
      const isArrowMode = enemy.mode === 'arrows';
      const badgeText = enemy.getFormattedWord();
      const badgeWidth = Math.max(76, ctx.measureText(badgeText).width + 24);
      const badgeX = enemy.x + enemy.width / 2 - badgeWidth / 2;
      const badgeY = ey - 28;

      // Badge shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.beginPath();
      ctx.roundRect(badgeX + 2, badgeY + 2, badgeWidth, 24, 4);
      ctx.fill();

      // Construction Paper Placard Body
      ctx.fillStyle = '#FFFDF8';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, 24, 4);
      ctx.fill();

      ctx.strokeStyle = isTarget ? '#E11D48' : '#3E2723';
      ctx.lineWidth = isTarget ? 2 : 1.2;
      ctx.stroke();

      // Render prefix matched (green), next char (underline), remaining (ink brown)
      let textCursorX = badgeX + 12;
      ctx.textBaseline = 'middle';
      const textCenterY = badgeY + 12;

      if (isArrowMode) {
        for (let i = 0; i < enemy.word.length; i++) {
          const char = enemy.word[i]!;
          const sym = arrowCharToSymbol(char);
          const isCharMatched = i < enemy.matchedIndex;
          const isCharNext = isTarget && i === enemy.matchedIndex;

          if (isCharMatched) {
            ctx.fillStyle = '#10B981';
            ctx.fillText(sym, textCursorX, textCenterY);
          } else {
            ctx.fillStyle = '#3E2723';
            ctx.fillText(sym, textCursorX, textCenterY);
          }

          const symWidth = ctx.measureText(sym).width;
          if (isCharNext) {
            ctx.strokeStyle = '#E11D48';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(textCursorX, textCenterY + 9);
            ctx.lineTo(textCursorX + symWidth, textCenterY + 9);
            ctx.stroke();
          }

          textCursorX += symWidth + (i < enemy.word.length - 1 ? ctx.measureText(' ').width : 0);
        }
      } else {
        const matched = enemy.getMatchedPrefix();
        const unmatched = enemy.getUnmatchedPrefix();

        if (matched.length > 0) {
          ctx.fillStyle = '#10B981';
          ctx.fillText(matched, textCursorX, textCenterY);
          textCursorX += ctx.measureText(matched).width;
        }

        if (unmatched.length > 0) {
          ctx.fillStyle = '#3E2723';
          ctx.fillText(unmatched, textCursorX, textCenterY);

          if (isTarget) {
            const nextChar = unmatched[0]!;
            const nextCharWidth = ctx.measureText(nextChar).width;
            ctx.strokeStyle = '#E11D48';
            ctx.lineWidth = 2;
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

    // 5. Top Taped Placard HUD
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, 800, 52);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(800, 52);
    ctx.stroke();

    // Tape accents
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(200, 2, 24, 10);
    ctx.strokeRect(200, 2, 24, 10);
    ctx.fillRect(570, 2, 24, 10);
    ctx.strokeRect(570, 2, 24, 10);

    ctx.font = 'bold 17px "Patrick Hand", cursive, sans-serif';
    ctx.textBaseline = 'middle';

    // Shields (left)
    ctx.fillStyle = '#E11D48';
    ctx.textAlign = 'left';
    ctx.fillText('SHIELDS:', 20, 26);
    for (let s = 0; s < this.gameState.maxShields; s++) {
      const sx = 95 + s * 24;
      if (s < this.gameState.shields) {
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.roundRect(sx, 18, 16, 16, 3);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#E8DEC8';
        ctx.beginPath();
        ctx.roundRect(sx, 18, 16, 16, 3);
        ctx.fill();
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // Timer & Score (center)
    ctx.fillStyle = this.gameState.timeRemaining < 10 ? '#E11D48' : '#3E2723';
    ctx.textAlign = 'center';
    ctx.fillText(`TIME: ${this.gameState.timeRemaining.toFixed(1)}s`, 320, 26);

    ctx.fillStyle = '#C85A32';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 480, 26);

    // Multiplier & Streak (right)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#10B981';
    ctx.fillText(`STREAK: ${this.typingEngine.getStreak()} [${this.typingEngine.getMultiplier()}x]`, 780, 26);

    // Bottom Lock Terminal Status Bar
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 565, 800, 35);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 565);
    ctx.lineTo(800, 565);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
    if (activeTarget) {
      ctx.fillStyle = '#E11D48';
      if (activeTarget.mode === 'arrows') {
        const matchedSymbols = activeTarget.getMatchedPrefix().split('').map(arrowCharToSymbol).join(' ');
        const unmatchedSymbols = activeTarget.getUnmatchedPrefix().split('').map(arrowCharToSymbol).join(' ');
        const nextSymbol = activeTarget.getFormattedNextChar();
        ctx.fillText(`TARGET LOCKED: [${matchedSymbols}] ${unmatchedSymbols}  |  NEXT ARROW: '${nextSymbol}'`, 20, 582);
      } else {
        ctx.fillText(`TARGET LOCKED: [${activeTarget.getMatchedPrefix()}]${activeTarget.getUnmatchedPrefix()}  |  NEXT CHAR: '${activeTarget.getNextChar()}'`, 20, 582);
      }
    } else {
      ctx.fillStyle = '#6A5D4D';
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
    ctx.fillStyle = 'rgba(244, 234, 212, 0.88)';
    ctx.fillRect(0, 0, 800, 600);

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

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 40px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TYPE STRIKE', 400, 125);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('PAPERCRAFT DEFENSE TERMINAL', 400, 160);

    // Mode-specific instructions
    ctx.fillStyle = '#3E2723';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    if (this.mode === 'arrows') {
      ctx.fillText('Press Arrow keys (↑↓←→) or WASD to clear direction sequences.', 400, 210);
      ctx.fillText('Complete sequences sequentially to scale streak multiplier up to 8x.', 400, 240);
      ctx.fillText('Defend base shields across 60 seconds of papercraft onslaught!', 400, 270);
    } else {
      ctx.fillText('Type prompt words above approaching origami planes to fire lasers.', 400, 210);
      ctx.fillText('Complete words sequentially to scale streak multiplier up to 8x.', 400, 240);
      ctx.fillText('Defend base shields across 60 seconds of papercraft onslaught!', 400, 270);
    }

    if (this.gameState.highScore > 0) {
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 16px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 310);
    }

    // Mode Toggle Button
    const btn = this.modeToggleRect;
    ctx.fillStyle = this.mode === 'arrows' ? '#F59E0B' : '#3B82F6';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.width, btn.height, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    const modeLabel = this.mode === 'arrows' ? 'MODE: ARROWS (↑↓←→)' : 'MODE: WORDS';
    ctx.fillText(modeLabel, btn.x + btn.width / 2, btn.y + btn.height / 2 + 5);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '14px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press [M] / [TAB] or Click Button to Toggle Mode', 400, 455);

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    const startTip = this.mode === 'arrows'
      ? 'PRESS ARROW / WASD / SPACE TO COMMENCE'
      : 'PRESS ANY LETTER OR SPACE TO COMMENCE';
    ctx.fillText(startTip, 400, 500);
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
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
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('SYSTEM PAUSED', 400, 270);

    ctx.fillStyle = '#3E2723';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press ESC or Click to Resume', 400, 330);
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
    ctx.fillRect(0, 0, 800, 600);

    // Cardboard Placard
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(160, 110, 480, 400, 10);
    ctx.fill();
    ctx.stroke();

    // Tape
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(220, 102, 60, 16);
    ctx.strokeRect(220, 102, 60, 16);
    ctx.fillRect(520, 102, 60, 16);
    ctx.strokeRect(520, 102, 60, 16);

    ctx.textAlign = 'center';
    const isWin = this.gameState.gameOverReason === 'time_up';
    ctx.fillStyle = isWin ? '#10B981' : '#E11D48';
    ctx.font = 'bold 40px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(isWin ? 'MISSION ACCOMPLISHED' : 'BASE OVERRUN', 400, 175);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText(isWin ? '60s Survival Window Complete!' : 'All Base Shields Depleted!', 400, 220);

    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 26px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, 400, 280);

    ctx.fillStyle = '#3B82F6';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`FLYERS ELIMINATED: ${this.gameState.wordsDestroyed}`, 400, 325);
    ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, 400, 355);

    // Button
    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(220, 410, 360, 48, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE OR ENTER TO REBOOT', 400, 438);
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
