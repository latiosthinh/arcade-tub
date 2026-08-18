import { HighwayLanes, CANVAS_WIDTH, CANVAS_HEIGHT } from './HighwayLanes.js';
import { PlayerCar, CAR_WIDTH, CAR_HEIGHT } from './PlayerCar.js';
import { TrafficVehicle, VehicleType } from './TrafficManager.js';

export class HighwayRenderer {
  private dashOffset: number = 0;

  renderRoad(ctx: CanvasRenderingContext2D, dt: number, speedKmh: number, lanes: HighwayLanes): void {
    // Scroll road markings proportionally to speed
    const scrollSpeed = (speedKmh / 3600) * 1000 * 4.2;
    this.dashOffset = (this.dashOffset + scrollSpeed * dt) % 48;

    // Dark cyberpunk asphalt
    ctx.fillStyle = '#0a0714';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Highway road surface with neon glowing border
    ctx.fillStyle = '#140c24';
    ctx.fillRect(lanes.roadLeft, 0, lanes.roadWidth, CANVAS_HEIGHT);

    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 8;
    ctx.strokeRect(lanes.roadLeft, 0, lanes.roadWidth, CANVAS_HEIGHT);
    ctx.shadowBlur = 0;

    // Dashed lane divider lines
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([20, 28]);
    ctx.lineDashOffset = -this.dashOffset;

    for (let i = 1; i < lanes.laneCount; i++) {
      const x = lanes.roadLeft + i * lanes.laneWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  renderPlayer(ctx: CanvasRenderingContext2D, player: PlayerCar): void {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.tiltAngle);

    // Headlight neon beams illuminating road ahead
    ctx.fillStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-28, -90);
    ctx.lineTo(28, -90);
    ctx.lineTo(14, 0);
    ctx.closePath();
    ctx.fill();

    // Player sports car body (Cyber Magenta & Neon Cyan)
    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.fillRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);
    ctx.shadowBlur = 0;

    // Roof & Windshield
    ctx.fillStyle = '#0a1024';
    ctx.fillRect(-CAR_WIDTH / 2 + 5, -CAR_HEIGHT / 2 + 10, CAR_WIDTH - 10, CAR_HEIGHT - 24);

    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(-CAR_WIDTH / 2 + 7, -CAR_HEIGHT / 2 + 12, CAR_WIDTH - 14, 8);

    // Glowing Cyan Trim Lines
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);

    // Tail Brake Lights (Glowing Gold/Red)
    ctx.fillStyle = player.isBraking ? '#ff0055' : '#ffe600';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = player.isBraking ? 10 : 4;
    ctx.fillRect(-CAR_WIDTH / 2 + 3, CAR_HEIGHT / 2 - 4, 6, 3);
    ctx.fillRect(CAR_WIDTH / 2 - 9, CAR_HEIGHT / 2 - 4, 6, 3);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  renderTraffic(ctx: CanvasRenderingContext2D, vehicles: TrafficVehicle[]): void {
    for (const v of vehicles) {
      ctx.save();
      ctx.translate(v.x, v.y);

      if (v.type === VehicleType.TRUCK) {
        // Heavy Truck
        ctx.fillStyle = '#d35400';
        ctx.fillRect(-v.width / 2, -v.height / 2, v.width, v.height);
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-v.width / 2, -v.height / 2, v.width, v.height);

        // Cab
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-v.width / 2 + 3, v.height / 2 - 20, v.width - 6, 18);
      } else if (v.type === VehicleType.POLICE) {
        // Police Cruiser with Flashing Lights
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(-v.width / 2, -v.height / 2, v.width, v.height);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-v.width / 2, -v.height / 2, v.width, v.height);

        // Siren Bar
        ctx.fillStyle = Math.sin(Date.now() * 0.02) > 0 ? '#ff4757' : '#00f0ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fillRect(-8, -4, 16, 6);
        ctx.shadowBlur = 0;
      } else {
        // Regular Sedan
        ctx.fillStyle = v.color;
        ctx.fillRect(-v.width / 2, -v.height / 2, v.width, v.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-v.width / 2, -v.height / 2, v.width, v.height);

        // Windshield
        ctx.fillStyle = '#09101d';
        ctx.fillRect(-v.width / 2 + 4, -v.height / 2 + 8, v.width - 8, 10);
      }

      // Tail lights
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(-v.width / 2 + 2, v.height / 2 - 3, 5, 3);
      ctx.fillRect(v.width / 2 - 7, v.height / 2 - 3, 5, 3);

      ctx.restore();
    }
  }
}
