import { GameState } from './GameState.js';
import { BirdParticles } from './BirdParticles.js';

export class BirdRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    particles: BirdParticles,
    width: number,
    height: number
  ): void {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    const cameraOffsetX = state.distanceTraveled;

    // 1. Layered Pastel Construction Paper Hills Background (Parallax)
    this.drawParallaxBackground(ctx, cameraOffsetX, width, height, state.isFever);

    // 2. Ground Terrain (Cardboard / Kraft Paper baseline)
    this.drawGround(ctx, cameraOffsetX, state.groundY, width, height);

    // 3. Obstacles (Layered Origami Brick & Cardboard Piles)
    this.drawObstacles(ctx, state, cameraOffsetX);

    // 4. Egg Stack (Cardboard Cubes)
    this.drawEggStack(ctx, state, cameraOffsetX);

    // 5. Origami Square Bird Character
    this.drawOrigamiBird(ctx, state, cameraOffsetX);

    // 6. Particles (Egg shells, Feathers, Fever flame, Confetti)
    particles.render(ctx, cameraOffsetX);

    // 7. Papercraft HUD / UI
    this.drawHUD(ctx, state, width, height);

    ctx.restore();
  }

  private drawParallaxBackground(
    ctx: CanvasRenderingContext2D,
    camX: number,
    width: number,
    height: number,
    isFever: boolean
  ): void {
    // Sky / Backing Paper
    ctx.fillStyle = isFever ? '#FFEAA7' : '#E8F4F8';
    ctx.fillRect(0, 0, width, height);

    // Far Paper Hills (Slow Parallax 0.15)
    ctx.fillStyle = isFever ? '#FDCB6E' : '#B8E1DD';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height);
    const farOffset = (camX * 0.15) % 400;
    for (let x = -400; x < width + 400; x += 200) {
      const hillX = x - farOffset;
      ctx.quadraticCurveTo(hillX + 100, 220, hillX + 200, 360);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mid Paper Hills (Parallax 0.35)
    ctx.fillStyle = isFever ? '#E17055' : '#74B9FF';
    ctx.beginPath();
    ctx.moveTo(0, height);
    const midOffset = (camX * 0.35) % 300;
    for (let x = -300; x < width + 300; x += 150) {
      const hillX = x - midOffset;
      ctx.quadraticCurveTo(hillX + 75, 290, hillX + 150, 420);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawGround(
    ctx: CanvasRenderingContext2D,
    camX: number,
    groundY: number,
    width: number,
    height: number
  ): void {
    ctx.save();
    // Cardboard base
    ctx.fillStyle = '#D4A373';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;

    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.strokeRect(0, groundY, width, height - groundY);

    // Cardboard Flute / Corrugated pattern stripe
    ctx.fillStyle = '#C58F5B';
    const stripeSpacing = 24;
    const offset = camX % stripeSpacing;
    for (let x = -stripeSpacing; x < width + stripeSpacing; x += stripeSpacing) {
      ctx.fillRect(x - offset, groundY, 4, height - groundY);
    }

    // Top trim line
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    ctx.restore();
  }

  private drawObstacles(ctx: CanvasRenderingContext2D, state: GameState, camX: number): void {
    ctx.save();
    for (const obs of state.obstacles) {
      const screenX = obs.x - camX;
      if (screenX + obs.width < -100 || screenX > 900) continue; // Culling

      const topY = obs.groundY - obs.height;

      // Draw Papercraft Obstacle Block
      ctx.fillStyle = '#E15F41'; // Coral red cardboard block
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 3;

      ctx.fillRect(screenX, topY, obs.width, obs.height);
      ctx.strokeRect(screenX, topY, obs.width, obs.height);

      // Inner Origami Crease Lines
      ctx.strokeStyle = '#C44569';
      ctx.lineWidth = 1.5;
      for (let b = 1; b < obs.blockHeightCount; b++) {
        const lineY = obs.groundY - b * (obs.height / obs.blockHeightCount);
        ctx.beginPath();
        ctx.moveTo(screenX + 4, lineY);
        ctx.lineTo(screenX + obs.width - 4, lineY);
        ctx.stroke();
      }

      // Drop shadow for 3D paper feel
      ctx.fillStyle = 'rgba(43, 33, 24, 0.15)';
      ctx.fillRect(screenX + obs.width, topY + 4, 6, obs.height);
    }
    ctx.restore();
  }

  private drawEggStack(ctx: CanvasRenderingContext2D, state: GameState, camX: number): void {
    ctx.save();
    const screenX = state.distanceTraveled + state.bird.x - camX;

    for (const egg of state.bird.eggs) {
      const eggX = screenX;
      const eggY = egg.y;

      // Cardboard Egg Block
      ctx.fillStyle = '#FAEDCD'; // Warm eggshell cream
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 3;

      ctx.fillRect(eggX, eggY, egg.size, egg.size);
      ctx.strokeRect(eggX, eggY, egg.size, egg.size);

      // Inner Egg Pattern (Origami fold mark)
      ctx.strokeStyle = '#D4A373';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(eggX + 6, eggY + 6);
      ctx.lineTo(eggX + egg.size - 6, eggY + egg.size - 6);
      ctx.stroke();

      // Cardboard speckle details
      ctx.fillStyle = '#D4A373';
      ctx.beginPath();
      ctx.arc(eggX + egg.size * 0.3, eggY + egg.size * 0.7, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawOrigamiBird(ctx: CanvasRenderingContext2D, state: GameState, camX: number): void {
    ctx.save();
    const bird = state.bird;
    const screenX = state.distanceTraveled + bird.x - camX;
    const screenY = bird.y;

    ctx.translate(screenX + bird.size / 2, screenY + bird.size / 2);

    // Fever Fire Glow
    if (state.isFever) {
      ctx.fillStyle = 'rgba(255, 107, 107, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, bird.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Square Bird Body
    ctx.fillStyle = state.isFever ? '#FF7675' : '#FDCB6E'; // Fiery red or bright paper yellow
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;

    ctx.fillRect(-bird.size / 2, -bird.size / 2, bird.size, bird.size);
    ctx.strokeRect(-bird.size / 2, -bird.size / 2, bird.size, bird.size);

    // Beak (Origami Triangle folded out)
    ctx.fillStyle = '#E17055';
    ctx.beginPath();
    ctx.moveTo(bird.size / 2, -4);
    ctx.lineTo(bird.size / 2 + 10, 2);
    ctx.lineTo(bird.size / 2, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eye (Paper dot)
    ctx.fillStyle = '#2B2118';
    ctx.beginPath();
    ctx.arc(bird.size * 0.2, -bird.size * 0.15, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Wing (Folded paper flap)
    ctx.fillStyle = state.isFever ? '#D63031' : '#F39C12';
    ctx.beginPath();
    ctx.moveTo(-bird.size * 0.3, 0);
    ctx.lineTo(0, -bird.size * 0.2);
    ctx.lineTo(-bird.size * 0.1, bird.size * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Comb / Feather on head
    ctx.fillStyle = '#E84393';
    ctx.beginPath();
    ctx.moveTo(-4, -bird.size / 2);
    ctx.lineTo(0, -bird.size / 2 - 8);
    ctx.lineTo(4, -bird.size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private drawHUD(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    width: number,
    _height: number
  ): void {
    ctx.save();
    ctx.font = 'bold 22px "Comfortaa", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Score Board
    ctx.fillStyle = '#2B2118';
    ctx.fillText(`Score: ${state.score}`, 24, 20);

    // Level & Distance
    ctx.font = 'bold 16px "Comfortaa", sans-serif';
    ctx.fillText(`Level ${state.currentLevel}`, 24, 52);

    // Progress Bar
    const barWidth = 240;
    const barHeight = 14;
    const barX = width / 2 - barWidth / 2;
    const barY = 24;

    ctx.fillStyle = '#FAF6EE';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#00B894';
    ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * state.getProgress(), barHeight - 4);

    // Fever Bar
    const feverX = width - 180;
    const feverY = 24;
    const feverW = 150;
    const feverH = 14;

    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(feverX, feverY, feverW, feverH);
    ctx.strokeRect(feverX, feverY, feverW, feverH);

    ctx.fillStyle = state.isFever ? '#FF7675' : '#FDCB6E';
    ctx.fillRect(feverX + 2, feverY + 2, (feverW - 4) * (state.feverGauge / 100), feverH - 4);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 12px "Comfortaa", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(state.isFever ? '🔥 FEVER RUSH!' : 'FEVER', feverX + feverW, feverY + 18);

    // Perfect Streaks
    if (state.perfectStreak > 0 && !state.isFever) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px "Comfortaa", sans-serif';
      ctx.fillStyle = '#E84393';
      ctx.fillText(`PERFECT x${state.perfectStreak}!`, width / 2, 60);
    }

    ctx.restore();
  }
}
