import { Camera } from './Camera';
import { KirbyPhysics } from './KirbyPhysics';
import { KirbyActions } from './KirbyActions';
import { HealthSystem } from './HealthSystem';
import { CopyAbility } from './abilities/AbilityTypes';

export class KirbyRenderer {
  renderBackground(ctx: CanvasRenderingContext2D, camera: Camera, theme: 'green' | 'ice' | 'butter' | 'ocean' = 'green'): void {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, camera.viewportHeight);
    if (theme === 'green') {
      grad.addColorStop(0, '#81D4FA');
      grad.addColorStop(1, '#E1F5FE');
    } else if (theme === 'ice') {
      grad.addColorStop(0, '#B2EBF2');
      grad.addColorStop(1, '#E0F7FA');
    } else if (theme === 'butter') {
      grad.addColorStop(0, '#FFE082');
      grad.addColorStop(1, '#FFF8E1');
    } else {
      grad.addColorStop(0, '#FF8A65');
      grad.addColorStop(1, '#FFCCBC');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

    // Parallax mountain layer (0.2x scroll)
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#A5D6A7';
    const offsetX = (camera.x * 0.2) % 120;
    for (let x = -120; x < camera.viewportWidth + 120; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x - offsetX, camera.viewportHeight);
      ctx.lineTo(x - offsetX + 60, camera.viewportHeight - 70);
      ctx.lineTo(x - offsetX + 120, camera.viewportHeight);
      ctx.fill();
    }
    ctx.restore();
  }

  renderKirby(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    physics: KirbyPhysics,
    actions: KirbyActions,
    health: HealthSystem,
    ability: CopyAbility | null
  ): void {
    if (health.isBlinking()) return; // i-frame blinking

    const screenX = physics.x - camera.x;
    const screenY = physics.y - camera.y;

    ctx.save();
    ctx.translate(screenX + physics.width / 2, screenY + physics.height / 2);

    // Squash and stretch deformation
    let scaleX = physics.facing;
    let scaleY = 1.0;

    if (actions.isInhaling) {
      scaleX *= 1.25;
      scaleY = 0.9;
    } else if (actions.isFloating) {
      scaleX *= 1.2;
      scaleY = 1.2;
    } else if (actions.isSliding) {
      scaleX *= 1.4;
      scaleY = 0.6;
    }

    ctx.scale(scaleX, scaleY);

    // Cardboard drop shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Kirby body (pink papercraft circle)
    ctx.fillStyle = '#F48FB1';
    ctx.strokeStyle = '#D81B60';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Kirby feet (red oval)
    ctx.fillStyle = '#E91E63';
    ctx.beginPath();
    ctx.ellipse(-4, 7, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(4, 7, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Kirby eyes
    ctx.fillStyle = '#0D47A1';
    ctx.beginPath();
    ctx.ellipse(2, -2, 1.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(6, -2, 1.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blush cheeks
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.arc(-2, 2, 2, 0, Math.PI * 2);
    ctx.arc(8, 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Ability Hat
    if (ability) {
      ctx.fillStyle = ability.hatColor;
      ctx.beginPath();
      ctx.arc(0, -9, 5, Math.PI, 0); // Hat dome
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  renderHUD(ctx: CanvasRenderingContext2D, health: HealthSystem, ability: CopyAbility | null): void {
    // HUD background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(8, 6, 140, 24);

    // HP Pips
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px monospace';
    ctx.fillText('HP:', 14, 22);

    for (let i = 0; i < health.maxHp; i++) {
      ctx.fillStyle = i < health.hp ? '#FFEB3B' : '#616161';
      ctx.fillRect(36 + i * 10, 12, 8, 12);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(36 + i * 10, 12, 8, 12);
    }

    // Ability Name
    ctx.fillStyle = ability ? ability.hatColor : '#E0E0E0';
    ctx.fillText(ability ? ability.displayName.toUpperCase() : 'NORMAL', 104, 22);
  }
}
