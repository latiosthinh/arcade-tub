import { HighwayLanes, CANVAS_WIDTH, CANVAS_HEIGHT } from './HighwayLanes.js';
import { PlayerCar, CAR_WIDTH, CAR_HEIGHT } from './PlayerCar.js';
import { TrafficVehicle, VehicleType } from './TrafficManager.js';

export class HighwayRenderer {
  private dashOffset: number = 0;

  renderRoad(ctx: CanvasRenderingContext2D, dt: number, speedKmh: number, lanes: HighwayLanes): void {
    // Scroll road markings proportionally to speed
    const scrollSpeed = (speedKmh / 3600) * 1000 * 4.2;
    this.dashOffset = (this.dashOffset + scrollSpeed * dt) % 48;

    // Vintage paper roadside
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Warm storybook road surface
    ctx.fillStyle = '#E8DEC8';
    ctx.fillRect(lanes.roadLeft, 0, lanes.roadWidth, CANVAS_HEIGHT);

    // Inked road borders
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(lanes.roadLeft, 0, lanes.roadWidth, CANVAS_HEIGHT);

    // Dashed lane divider lines
    ctx.strokeStyle = '#C85A32';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([20, 24]);
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

    // Player sports car body (Terracotta Red with Inked outline)
    ctx.fillStyle = '#C85A32';
    ctx.beginPath();
    ctx.roundRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT, [8, 8, 4, 4]);
    ctx.fill();

    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Windshield
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(-CAR_WIDTH / 2 + 6, -CAR_HEIGHT / 2 + 10, CAR_WIDTH - 12, CAR_HEIGHT - 26);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-CAR_WIDTH / 2 + 6, -CAR_HEIGHT / 2 + 10, CAR_WIDTH - 12, CAR_HEIGHT - 26);

    // Wheels
    ctx.fillStyle = '#2B2118';
    ctx.fillRect(-CAR_WIDTH / 2 - 3, -CAR_HEIGHT / 2 + 10, 4, 14);
    ctx.fillRect(CAR_WIDTH / 2 - 1, -CAR_HEIGHT / 2 + 10, 4, 14);
    ctx.fillRect(-CAR_WIDTH / 2 - 3, CAR_HEIGHT / 2 - 24, 4, 14);
    ctx.fillRect(CAR_WIDTH / 2 - 1, CAR_HEIGHT / 2 - 24, 4, 14);

    // Tail Brake Lights
    ctx.fillStyle = player.isBraking ? '#E09F3E' : '#A8586A';
    ctx.fillRect(-CAR_WIDTH / 2 + 4, CAR_HEIGHT / 2 - 4, 8, 4);
    ctx.fillRect(CAR_WIDTH / 2 - 12, CAR_HEIGHT / 2 - 4, 8, 4);

    ctx.restore();
  }

  renderTraffic(ctx: CanvasRenderingContext2D, vehicles: TrafficVehicle[]): void {
    for (const v of vehicles) {
      ctx.save();
      ctx.translate(v.x, v.y);

      if (v.type === VehicleType.TRUCK) {
        // Heavy Truck in Ochre yellow
        ctx.fillStyle = '#E09F3E';
        ctx.beginPath();
        ctx.roundRect(-v.width / 2, -v.height / 2, v.width, v.height, [6, 6, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cab
        ctx.fillStyle = '#FAF6EE';
        ctx.fillRect(-v.width / 2 + 4, v.height / 2 - 22, v.width - 8, 18);
        ctx.strokeRect(-v.width / 2 + 4, v.height / 2 - 22, v.width - 8, 18);
      } else if (v.type === VehicleType.POLICE) {
        // Prussian Blue Police car
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.roundRect(-v.width / 2, -v.height / 2, v.width, v.height, [6, 6, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Siren Bar
        ctx.fillStyle = Math.sin(Date.now() * 0.02) > 0 ? '#C85A32' : '#E09F3E';
        ctx.fillRect(-8, -4, 16, 6);
      } else {
        // Regular Sedan in Sage Green or Mustard
        ctx.fillStyle = '#4A6D56';
        ctx.beginPath();
        ctx.roundRect(-v.width / 2, -v.height / 2, v.width, v.height, [6, 6, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Windshield
        ctx.fillStyle = '#FAF6EE';
        ctx.fillRect(-v.width / 2 + 4, -v.height / 2 + 8, v.width - 8, 10);
      }

      ctx.restore();
    }
  }
}
