import { VerticalCamera } from './VerticalCamera';
import { NinjaPhysics } from './NinjaPhysics';
import { CombatSystem } from './CombatSystem';
import { TreeCanopy } from './TreeCanopy';
import { ProjectileManager } from './ProjectileManager';
import { EnemySpawner } from './enemies/EnemySpawner';
import { PowerUpManager } from './PowerUpManager';
import { SeasonTheme } from './stages/SeasonManager';
import { StageInfo } from './stages/StageManager';

export class KageRenderer {
  renderBackground(ctx: CanvasRenderingContext2D, camera: VerticalCamera, theme: SeasonTheme): void {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, camera.viewportHeight);
    grad.addColorStop(0, theme.skyColorTop);
    grad.addColorStop(1, theme.skyColorBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

    // Parallax cardboard tree silhouette layer
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = theme.canopyColor;
    const offsetX = (camera.x * 0.25) % 180;
    for (let x = -180; x < camera.viewportWidth + 180; x += 180) {
      ctx.fillRect(x - offsetX + 40, 0, 18, camera.viewportHeight);
      ctx.beginPath();
      ctx.arc(x - offsetX + 50, 140, 60, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderEnvironment(ctx: CanvasRenderingContext2D, camera: VerticalCamera, canopy: TreeCanopy, stage: StageInfo, theme: SeasonTheme): void {
    // Floor
    const floorScreenY = 560 - camera.y;
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(0, floorScreenY, camera.viewportWidth, camera.viewportHeight - floorScreenY);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(0, floorScreenY, camera.viewportWidth, 8);

    // Bamboo Trunks
    for (const t of canopy.trunks) {
      const s = camera.worldToScreen(t.x, t.topY);
      ctx.fillStyle = '#558B2F';
      ctx.fillRect(s.x, s.y, t.width, t.bottomY - t.topY);
      ctx.fillStyle = '#33691E';
      ctx.fillRect(s.x + t.width - 3, s.y, 3, t.bottomY - t.topY);
    }

    // Branch Platforms
    for (const b of canopy.branches) {
      const s = camera.worldToScreen(b.x, b.y);
      ctx.fillStyle = theme.canopyColor;
      ctx.fillRect(s.x, s.y, b.width, b.height);
      ctx.strokeStyle = '#1B5E20';
      ctx.lineWidth = 1;
      ctx.strokeRect(s.x, s.y, b.width, b.height);
    }
  }

  renderPlayer(ctx: CanvasRenderingContext2D, camera: VerticalCamera, physics: NinjaPhysics, combat: CombatSystem): void {
    if (combat.isDead) return;

    const s = camera.worldToScreen(physics.x, physics.y);
    ctx.save();
    ctx.translate(s.x + physics.width / 2, s.y + physics.height / 2);
    ctx.scale(physics.facing, 1);

    // Drop shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Origami Ninja Body (Crimson paper robes)
    ctx.fillStyle = combat.isInvulnerable ? '#FFD54F' : '#D32F2F';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6, 10);
    ctx.lineTo(0, -10);
    ctx.lineTo(6, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head & Black Ninja Headband
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath();
    ctx.arc(0, -6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#212121';
    ctx.fillRect(-5, -9, 10, 3);
    // Headband ribbon tail trailing
    ctx.beginPath();
    ctx.moveTo(-5, -8);
    ctx.lineTo(-12, -4);
    ctx.stroke();

    // Katana Sword
    ctx.strokeStyle = '#EEEEEE';
    ctx.lineWidth = 2;
    if (combat.isSlashing) {
      // Swung sword arc
      ctx.beginPath();
      ctx.arc(8, 0, 18, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
    } else {
      // Sheathed / ready sword
      ctx.beginPath();
      ctx.moveTo(-2, 2);
      ctx.lineTo(10, -8);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderEnemies(ctx: CanvasRenderingContext2D, camera: VerticalCamera, spawner: EnemySpawner): void {
    for (const en of spawner.getEnemies()) {
      const s = camera.worldToScreen(en.x, en.y);
      ctx.save();
      ctx.translate(s.x + en.width / 2, s.y + en.height / 2);
      ctx.scale(en.facing, 1);

      ctx.fillStyle = en.type === 'red_ninja' ? '#E53935' : en.type === 'blue_ninja' ? '#1E88E5' : en.type === 'white_ninja' ? '#FAFAFA' : '#FB8C00';
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(-6, 10);
      ctx.lineTo(0, -10);
      ctx.lineTo(6, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  renderProjectiles(ctx: CanvasRenderingContext2D, camera: VerticalCamera, projectiles: ProjectileManager): void {
    for (const p of projectiles.getProjectiles()) {
      const s = camera.worldToScreen(p.x, p.y);
      if (p.type === 'shuriken') {
        ctx.save();
        ctx.translate(s.x + 5, s.y + 5);
        ctx.fillStyle = p.owner === 'player' ? '#FFD700' : '#424242';
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
      } else if (p.type === 'fireball') {
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(s.x + 7, s.y + 7, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  renderHUD(ctx: CanvasRenderingContext2D, combat: CombatSystem, stage: StageInfo, theme: SeasonTheme): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(8, 6, 260, 28);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 6, 260, 28);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px monospace';
    ctx.fillText(`${stage.name.toUpperCase()} (LOOP ${theme.name.split('—')[0]})`, 14, 22);
    ctx.fillStyle = '#FF80AB';
    ctx.fillText(`★x${combat.lives}`, 200, 22);
  }
}
