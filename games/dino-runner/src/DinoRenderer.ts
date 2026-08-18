import { DinoPhysics } from './DinoPhysics.js';
import { Obstacle } from './ObstacleSpawner.js';
import { GameState } from './GameState.js';

export interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
}

export interface PaperDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export class DinoRenderer {
  private clouds: Cloud[] = [];
  public particles: PaperDust[] = [];
  private groundGravel: { x: number; size: number; alpha: number }[] = [];

  constructor() {
    // Generate initial decorative clouds
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: 100 + i * 160 + (Math.random() * 60),
        y: 40 + Math.random() * 80,
        scale: 0.7 + Math.random() * 0.5,
        speed: 15 + Math.random() * 20,
      });
    }

    // Static gravel positions along ground
    for (let i = 0; i < 40; i++) {
      this.groundGravel.push({
        x: Math.random() * 800,
        size: 1.5 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.4,
      });
    }
  }

  public addDust(x: number, y: number, color: string = '#D8C3A5', count: number = 4): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.7) * 60,
        vy: -Math.random() * 40,
        size: 2 + Math.random() * 3,
        alpha: 0.8,
        color,
      });
    }
  }

  public update(dt: number, currentSpeed: number): void {
    // Scroll clouds
    for (const cloud of this.clouds) {
      cloud.x -= (cloud.speed + currentSpeed * 0.05) * dt;
      if (cloud.x < -100) {
        cloud.x = 850 + Math.random() * 100;
        cloud.y = 40 + Math.random() * 80;
      }
    }

    // Update dust particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt * 1.5;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: GameState,
    dino: DinoPhysics,
    obstacles: Obstacle[]
  ): void {
    // 1. Paper sky background with Day/Night cycle
    this.renderSky(ctx, width, height, state);

    // 2. Papercut Sun / Moon & Clouds
    this.renderCelestialAndClouds(ctx, width, state);

    // 3. Torn paper horizon ground strip
    this.renderGround(ctx, width, dino.groundY, state);

    // 4. Obstacles (Cardboard Cacti & Origami Pterodactyls)
    this.renderObstacles(ctx, obstacles, state);

    // 5. Dino Runner (Folded Origami Dinosaur)
    this.renderDino(ctx, dino, state);

    // 6. Dust particles
    this.renderParticles(ctx);

    // 7. Taped Paper Scoreboard & HUD
    this.renderHUD(ctx, width, state);

    // 8. Overlays (Ready / Paused / GameOver)
    if (state.status === 'ready') {
      this.renderReadyOverlay(ctx, width, height);
    } else if (state.status === 'paused') {
      this.renderPausedOverlay(ctx, width, height);
    } else if (state.status === 'gameover') {
      this.renderGameOverOverlay(ctx, width, height, state);
    }
  }

  private renderSky(ctx: CanvasRenderingContext2D, width: number, height: number, state: GameState): void {
    const isNight = state.isNight;
    const grad = ctx.createLinearGradient(0, 0, 0, height);

    if (!isNight) {
      // Warm storybook parchment day
      grad.addColorStop(0, '#FAF6EE');
      grad.addColorStop(1, '#F4EAD4');
    } else {
      // Inked midnight cardboard wash
      grad.addColorStop(0, '#2D2540');
      grad.addColorStop(1, '#1E1B2E');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private renderCelestialAndClouds(ctx: CanvasRenderingContext2D, width: number, state: GameState): void {
    const isNight = state.isNight;

    ctx.save();
    if (!isNight) {
      // Cardboard Sun with torn stitch edge
      const sunX = width - 120;
      const sunY = 70;

      // Drop shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.15)';
      ctx.beginPath();
      ctx.arc(sunX + 2, sunY + 2, 26, 0, Math.PI * 2);
      ctx.fill();

      // Sun body
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner craft highlight
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(sunX - 4, sunY - 4, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Paper Moon crescent
      const moonX = width - 120;
      const moonY = 70;

      ctx.fillStyle = 'rgba(255, 253, 248, 0.15)';
      ctx.beginPath();
      ctx.arc(moonX + 2, moonY + 2, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFDF8';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Moon crater cutout
      ctx.fillStyle = '#2D2540';
      ctx.beginPath();
      ctx.arc(moonX + 8, moonY - 4, 16, 0, Math.PI * 2);
      ctx.fill();

      // Little stars
      ctx.fillStyle = '#FEF08A';
      const starOffsets = [
        { x: 100, y: 50 }, { x: 250, y: 35 }, { x: 450, y: 60 }, { x: 600, y: 40 }
      ];
      for (const s of starOffsets) {
        ctx.fillRect(s.x, s.y, 3, 3);
      }
    }

    // Origami Paper Clouds
    for (const cloud of this.clouds) {
      ctx.fillStyle = isNight ? 'rgba(255, 253, 248, 0.25)' : '#FFFDF8';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;

      const cx = cloud.x;
      const cy = cloud.y;
      const s = cloud.scale;

      ctx.beginPath();
      ctx.arc(cx, cy, 14 * s, 0, Math.PI * 2);
      ctx.arc(cx + 12 * s, cy - 8 * s, 16 * s, 0, Math.PI * 2);
      ctx.arc(cx + 28 * s, cy - 4 * s, 14 * s, 0, Math.PI * 2);
      ctx.arc(cx + 36 * s, cy, 10 * s, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderGround(ctx: CanvasRenderingContext2D, width: number, groundY: number, state: GameState): void {
    const isNight = state.isNight;

    ctx.save();
    // Ground strip drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.fillRect(0, groundY + 2, width, 80);

    // Cardboard / Desert Kraft Ground Bed
    ctx.fillStyle = isNight ? '#3E2723' : '#C5A880';
    ctx.fillRect(0, groundY, width, 80);

    // Stitched top border
    ctx.strokeStyle = isNight ? '#FEF08A' : '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Gravel paper sprinkles
    ctx.fillStyle = isNight ? '#FEF08A' : '#8D5B34';
    for (const g of this.groundGravel) {
      const scrollX = (g.x - state.distanceTraveled * 8) % width;
      const actualX = scrollX < 0 ? scrollX + width : scrollX;
      ctx.beginPath();
      ctx.arc(actualX, groundY + 12 + (g.size * 5), g.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[], state: GameState): void {
    const isNight = state.isNight;

    for (const obs of obstacles) {
      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.fillRect(obs.x + 3, obs.y + 3, obs.width, obs.height);

      if (obs.type.startsWith('cactus')) {
        this.renderCactus(ctx, obs, isNight);
      } else if (obs.type.startsWith('pterodactyl')) {
        this.renderPterodactyl(ctx, obs, isNight);
      }

      ctx.restore();
    }
  }

  private renderCactus(ctx: CanvasRenderingContext2D, obs: Obstacle, isNight: boolean): void {
    ctx.fillStyle = isNight ? '#047857' : '#059669';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;

    const segWidth = 18;
    const count = obs.type === 'cactus-triple' ? 3 : obs.type === 'cactus-double' ? 2 : 1;

    for (let c = 0; c < count; c++) {
      const cx = obs.x + c * (segWidth + 4);
      const ch = obs.height - (c % 2 === 1 ? 6 : 0);
      const cy = obs.y + (obs.height - ch);

      // Main trunk
      ctx.beginPath();
      ctx.roundRect(cx + 4, cy, 10, ch, 4);
      ctx.fill();
      ctx.stroke();

      // Left arm
      ctx.beginPath();
      ctx.roundRect(cx, cy + ch * 0.35, 6, 4, 1);
      ctx.roundRect(cx, cy + ch * 0.2, 4, ch * 0.25, 1);
      ctx.fill();
      ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.roundRect(cx + 12, cy + ch * 0.45, 6, 4, 1);
      ctx.roundRect(cx + 14, cy + ch * 0.3, 4, ch * 0.25, 1);
      ctx.fill();
      ctx.stroke();

      // Paper highlight prickles
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(cx + 8, cy + 8, 2, 2);
      ctx.fillRect(cx + 8, cy + 18, 2, 2);
      ctx.fillStyle = isNight ? '#047857' : '#059669';
    }
  }

  private renderPterodactyl(ctx: CanvasRenderingContext2D, obs: Obstacle, isNight: boolean): void {
    ctx.fillStyle = isNight ? '#BE123C' : '#E11D48';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.8;

    const wingUp = obs.flapFrame === 1;

    // Body
    ctx.beginPath();
    ctx.ellipse(obs.x + 22, obs.y + 16, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Origami Beak & Head
    ctx.beginPath();
    ctx.moveTo(obs.x + 8, obs.y + 14);
    ctx.lineTo(obs.x, obs.y + 17);
    ctx.lineTo(obs.x + 8, obs.y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inked eye
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(obs.x + 10, obs.y + 12, 3, 3);
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(obs.x + 10, obs.y + 13, 2, 2);

    // Crease-folded Wings
    ctx.fillStyle = isNight ? '#E11D48' : '#F43F5E';
    ctx.beginPath();
    if (wingUp) {
      ctx.moveTo(obs.x + 18, obs.y + 12);
      ctx.lineTo(obs.x + 24, obs.y - 6);
      ctx.lineTo(obs.x + 36, obs.y + 10);
    } else {
      ctx.moveTo(obs.x + 18, obs.y + 18);
      ctx.lineTo(obs.x + 24, obs.y + 32);
      ctx.lineTo(obs.x + 36, obs.y + 18);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private renderDino(ctx: CanvasRenderingContext2D, dino: DinoPhysics, state: GameState): void {
    const isNight = state.isNight;
    const isDucking = dino.isDucking;
    const bounds = dino.getBounds();

    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.roundRect(bounds.x + 3, bounds.y + 3, bounds.width, bounds.height, 4);
    ctx.fill();

    // Dino Body Paper Color (Kraft / Olive folded dinosaur)
    ctx.fillStyle = isNight ? '#4A6D56' : '#2D6A4F';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;

    if (!isDucking) {
      // Standing Origami T-Rex
      const x = dino.x;
      const y = dino.y;

      // Body torso
      ctx.beginPath();
      ctx.roundRect(x + 8, y + 14, 26, 26, 4);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 26);
      ctx.lineTo(x - 6, y + 20);
      ctx.lineTo(x + 8, y + 36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Head & Snout
      ctx.beginPath();
      ctx.roundRect(x + 16, y, 26, 18, 3);
      ctx.fill();
      ctx.stroke();

      // Inked eye
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(x + 24, y + 4, 4, 4);
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(x + 26, y + 4, 2, 2);

      // Cardboard teeth
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(x + 34, y + 14, 3, 3);
      ctx.fillRect(x + 38, y + 14, 3, 3);

      // Little arms
      ctx.fillStyle = '#C5A880';
      ctx.fillRect(x + 28, y + 24, 6, 4);
      ctx.strokeRect(x + 28, y + 24, 6, 4);

      // Animated Running Legs
      ctx.fillStyle = '#2D6A4F';
      const legOffset = dino.runFrame === 0 ? 0 : 6;
      // Leg 1
      ctx.fillRect(x + 12 + legOffset, y + 38, 5, 14);
      ctx.strokeRect(x + 12 + legOffset, y + 38, 5, 14);
      // Leg 2
      ctx.fillRect(x + 24 - legOffset, y + 38, 5, 14);
      ctx.strokeRect(x + 24 - legOffset, y + 38, 5, 14);
    } else {
      // Ducking elongated dinosaur
      const x = dino.x;
      const y = dino.groundY - dino.duckHeight;

      // Low elongated torso
      ctx.beginPath();
      ctx.roundRect(x + 6, y + 8, 36, 16, 4);
      ctx.fill();
      ctx.stroke();

      // Snout forward
      ctx.beginPath();
      ctx.roundRect(x + 34, y + 4, 22, 14, 3);
      ctx.fill();
      ctx.stroke();

      // Tail back
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 12);
      ctx.lineTo(x - 8, y + 10);
      ctx.lineTo(x + 6, y + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(x + 44, y + 6, 4, 4);
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(x + 46, y + 6, 2, 2);

      // Ducking legs
      ctx.fillStyle = '#2D6A4F';
      const legOffset = dino.runFrame === 0 ? 0 : 4;
      ctx.fillRect(x + 14 + legOffset, y + 20, 8, 8);
      ctx.strokeRect(x + 14 + legOffset, y + 20, 8, 8);
      ctx.fillRect(x + 28 - legOffset, y + 20, 8, 8);
      ctx.strokeRect(x + 28 - legOffset, y + 20, 8, 8);
    }
    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, width: number, state: GameState): void {
    ctx.save();
    // Taped Placard Header
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, width, 44);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 44);
    ctx.lineTo(width, 44);
    ctx.stroke();

    // Tape pieces
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(180, 2, 28, 10);
    ctx.strokeRect(180, 2, 28, 10);
    ctx.fillRect(620, 2, 28, 10);
    ctx.strokeRect(620, 2, 28, 10);

    ctx.fillStyle = '#2D6A4F';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🦖 DINO RUNNER', 20, 22);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.fillText(`SCORE: ${state.score.toString().padStart(5, '0')}`, width / 2, 22);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`HI: ${state.highScore.toString().padStart(5, '0')}`, width - 20, 22);

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.85)';
    ctx.fillRect(0, 0, width, height);

    // Cardboard Modal
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 200, height / 2 - 120, 400, 240, 10);
    ctx.fill();
    ctx.stroke();

    // Tape
    ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(width / 2 - 160, height / 2 - 128, 50, 16);
    ctx.strokeRect(width / 2 - 160, height / 2 - 128, 50, 16);
    ctx.fillRect(width / 2 + 110, height / 2 - 128, 50, 16);
    ctx.strokeRect(width / 2 + 110, height / 2 - 128, 50, 16);

    ctx.fillStyle = '#2D6A4F';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DINO RUNNER', width / 2, height / 2 - 60);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '14px "Comfortaa", cursive, sans-serif';
    ctx.fillText('PAPERCRAFT DESERT SPRINT', width / 2, height / 2 - 30);

    ctx.fillStyle = '#3E2723';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText('SPACE / ▲ / Tap Top : Jump', width / 2, height / 2 + 10);
    ctx.fillText('DOWN / ▼ / Tap Bottom : Duck', width / 2, height / 2 + 35);

    // Start Button
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, height / 2 + 60, 260, 42, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE TO RUN', width / 2, height / 2 + 84);

    ctx.restore();
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 150, height / 2 - 80, 300, 160, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 32px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME PAUSED', width / 2, height / 2 - 20);

    ctx.fillStyle = '#3E2723';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press ESC or Click to Resume', width / 2, height / 2 + 30);
    ctx.restore();
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, state: GameState): void {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.9)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 180, height / 2 - 120, 360, 240, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', width / 2, height / 2 - 60);

    ctx.fillStyle = '#3E2723';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`SCORE: ${state.score}`, width / 2, height / 2 - 15);
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`HIGH SCORE: ${state.highScore}`, width / 2, height / 2 + 15);

    // Play again button
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 120, height / 2 + 45, 240, 44, 6);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PLAY AGAIN (SPACE)', width / 2, height / 2 + 72);

    ctx.restore();
  }
}
