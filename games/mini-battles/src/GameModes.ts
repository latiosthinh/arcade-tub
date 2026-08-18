import { MiniGameId, PlayerId, CPUDifficulty } from './GameState.js';

export interface BaseBattleState {
  id: MiniGameId;
  winner: PlayerId | 'draw' | null;
  timeRemaining: number;
}

// 1. Paper Duel
export interface PaperDuelState extends BaseBattleState {
  id: 'paper-duel';
  cueGiven: boolean;
  cueTimer: number; // counts down to cue
  p1Fired: boolean;
  p2Fired: boolean;
  p1Foul: boolean;
  p2Foul: boolean;
}

// 2. Cardboard Tug of War
export interface TugOfWarState extends BaseBattleState {
  id: 'tug-of-war';
  ropePosition: number; // 0 is center, -100 is P1 win, +100 is P2 win
  pullPower: number; // distance per tap
  dragFactor: number;
}

// 3. Table Soccer
export interface SoccerState extends BaseBattleState {
  id: 'table-soccer';
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  p1Angle: number;
  p2Angle: number;
  p1AngularVelocity: number;
  p2AngularVelocity: number;
  p1Score: number;
  p2Score: number;
}

// 4. Lava Hop
export interface LavaHopState extends BaseBattleState {
  id: 'lava-hop';
  p1Step: number;
  p2Step: number;
  p1Y: number;
  p2Y: number;
  p1Vy: number;
  p2Vy: number;
  lavaY: number;
  lavaSpeed: number;
  targetSteps: number;
}

// 5. Balloon Pop
export interface BalloonPopState extends BaseBattleState {
  id: 'balloon-pop';
  p1PumpCount: number;
  p2PumpCount: number;
  maxPumps: number;
}

// 6. Tank Clash
export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: PlayerId;
  bounces: number;
}

export interface TankClashState extends BaseBattleState {
  id: 'tank-clash';
  p1Angle: number;
  p2Angle: number;
  projectiles: Projectile[];
  p1Health: number;
  p2Health: number;
}

// 7. Sumotori
export interface SumotoriState extends BaseBattleState {
  id: 'sumotori';
  p1X: number;
  p1Y: number;
  p1Angle: number;
  p1Vx: number;
  p1Vy: number;
  p2X: number;
  p2Y: number;
  p2Angle: number;
  p2Vx: number;
  p2Vy: number;
  ringRadius: number;
}

// 8. Laser Dodge
export interface LaserDodgeState extends BaseBattleState {
  id: 'laser-dodge';
  laserAngle: number;
  laserSpeed: number;
  p1Y: number;
  p1Vy: number;
  p1Grounded: boolean;
  p2Y: number;
  p2Vy: number;
  p2Grounded: boolean;
}

// 9. Coin Snatch
export interface CoinSnatchState extends BaseBattleState {
  id: 'coin-snatch';
  p1X: number;
  p2X: number;
  coinX: number;
  snatched: boolean;
}

// 10. Knife/Dart Flip
export interface KnifeFlipState extends BaseBattleState {
  id: 'knife-flip';
  targetAngle: number;
  targetSpeed: number;
  p1DartInFlight: boolean;
  p1DartY: number;
  p2DartInFlight: boolean;
  p2DartY: number;
  p1Hits: number;
  p2Hits: number;
  targetHitsNeeded: number;
}

// 11. Helicopter Drop
export interface HelicopterDropState extends BaseBattleState {
  id: 'helicopter-drop';
  p1Y: number;
  p1Vy: number;
  p2Y: number;
  p2Vy: number;
  p1Landed: boolean;
  p2Landed: boolean;
  p1Crashed: boolean;
  p2Crashed: boolean;
  padY: number;
}

// 12. Hammer Smash
export interface HammerSmashState extends BaseBattleState {
  id: 'hammer-smash';
  gopherActive: boolean;
  gopherSide: 'left' | 'right' | 'center';
  gopherTimer: number;
  p1Hits: number;
  p2Hits: number;
  targetHits: number;
}

export type BattleState =
  | PaperDuelState
  | TugOfWarState
  | SoccerState
  | LavaHopState
  | BalloonPopState
  | TankClashState
  | SumotoriState
  | LaserDodgeState
  | CoinSnatchState
  | KnifeFlipState
  | HelicopterDropState
  | HammerSmashState;

export class GameModes {
  static createBattle(id: MiniGameId): BattleState {
    switch (id) {
      case 'paper-duel':
        return {
          id: 'paper-duel',
          winner: null,
          timeRemaining: 10,
          cueGiven: false,
          cueTimer: 1.5 + Math.random() * 2.0, // 1.5 - 3.5s
          p1Fired: false,
          p2Fired: false,
          p1Foul: false,
          p2Foul: false,
        };

      case 'tug-of-war':
        return {
          id: 'tug-of-war',
          winner: null,
          timeRemaining: 15,
          ropePosition: 0,
          pullPower: 12,
          dragFactor: 0.96,
        };

      case 'table-soccer':
        return {
          id: 'table-soccer',
          winner: null,
          timeRemaining: 30,
          ballX: 400,
          ballY: 300,
          ballVx: (Math.random() > 0.5 ? 1 : -1) * 150,
          ballVy: (Math.random() - 0.5) * 100,
          p1Angle: 0,
          p2Angle: 0,
          p1AngularVelocity: 0,
          p2AngularVelocity: 0,
          p1Score: 0,
          p2Score: 0,
        };

      case 'lava-hop':
        return {
          id: 'lava-hop',
          winner: null,
          timeRemaining: 20,
          p1Step: 0,
          p2Step: 0,
          p1Y: 480,
          p2Y: 480,
          p1Vy: 0,
          p2Vy: 0,
          lavaY: 560,
          lavaSpeed: 25,
          targetSteps: 12,
        };

      case 'balloon-pop':
        return {
          id: 'balloon-pop',
          winner: null,
          timeRemaining: 20,
          p1PumpCount: 0,
          p2PumpCount: 0,
          maxPumps: 25,
        };

      case 'tank-clash':
        return {
          id: 'tank-clash',
          winner: null,
          timeRemaining: 30,
          p1Angle: 0,
          p2Angle: Math.PI,
          projectiles: [],
          p1Health: 3,
          p2Health: 3,
        };

      case 'sumotori':
        return {
          id: 'sumotori',
          winner: null,
          timeRemaining: 20,
          p1X: 300,
          p1Y: 300,
          p1Angle: 0,
          p1Vx: 0,
          p1Vy: 0,
          p2X: 500,
          p2Y: 300,
          p2Angle: Math.PI,
          p2Vx: 0,
          p2Vy: 0,
          ringRadius: 180,
        };

      case 'laser-dodge':
        return {
          id: 'laser-dodge',
          winner: null,
          timeRemaining: 25,
          laserAngle: 0,
          laserSpeed: 2.2,
          p1Y: 450,
          p1Vy: 0,
          p1Grounded: true,
          p2Y: 450,
          p2Vy: 0,
          p2Grounded: true,
        };

      case 'coin-snatch':
        return {
          id: 'coin-snatch',
          winner: null,
          timeRemaining: 10,
          p1X: 180,
          p2X: 620,
          coinX: 400,
          snatched: false,
        };

      case 'knife-flip':
        return {
          id: 'knife-flip',
          winner: null,
          timeRemaining: 25,
          targetAngle: 0,
          targetSpeed: 1.8,
          p1DartInFlight: false,
          p1DartY: 480,
          p2DartInFlight: false,
          p2DartY: 480,
          p1Hits: 0,
          p2Hits: 0,
          targetHitsNeeded: 3,
        };

      case 'helicopter-drop':
        return {
          id: 'helicopter-drop',
          winner: null,
          timeRemaining: 20,
          p1Y: 100,
          p1Vy: 0,
          p2Y: 100,
          p2Vy: 0,
          p1Landed: false,
          p2Landed: false,
          p1Crashed: false,
          p2Crashed: false,
          padY: 480,
        };

      case 'hammer-smash':
        return {
          id: 'hammer-smash',
          winner: null,
          timeRemaining: 25,
          gopherActive: false,
          gopherSide: 'center',
          gopherTimer: 1.0,
          p1Hits: 0,
          p2Hits: 0,
          targetHits: 3,
        };
    }
  }

  static handleInput(battle: BattleState, player: PlayerId): void {
    if (battle.winner) return;

    switch (battle.id) {
      case 'paper-duel': {
        if (!battle.cueGiven) {
          // Foul! Early tap gives win to opponent
          if (player === 'p1' && !battle.p1Fired) {
            battle.p1Foul = true;
            battle.p1Fired = true;
            battle.winner = 'p2';
          } else if (player === 'p2' && !battle.p2Fired) {
            battle.p2Foul = true;
            battle.p2Fired = true;
            battle.winner = 'p1';
          }
        } else {
          // Fire! First tap wins
          if (player === 'p1' && !battle.p1Fired) {
            battle.p1Fired = true;
            battle.winner = 'p1';
          } else if (player === 'p2' && !battle.p2Fired) {
            battle.p2Fired = true;
            battle.winner = 'p2';
          }
        }
        break;
      }

      case 'tug-of-war': {
        if (player === 'p1') {
          battle.ropePosition -= battle.pullPower;
        } else {
          battle.ropePosition += battle.pullPower;
        }
        if (battle.ropePosition <= -100) {
          battle.winner = 'p1';
        } else if (battle.ropePosition >= 100) {
          battle.winner = 'p2';
        }
        break;
      }

      case 'table-soccer': {
        if (player === 'p1') {
          battle.p1AngularVelocity = 18;
        } else {
          battle.p2AngularVelocity = -18;
        }
        break;
      }

      case 'lava-hop': {
        if (player === 'p1' && battle.p1Vy === 0) {
          battle.p1Step += 1;
          battle.p1Vy = -260;
          if (battle.p1Step >= battle.targetSteps) {
            battle.winner = 'p1';
          }
        } else if (player === 'p2' && battle.p2Vy === 0) {
          battle.p2Step += 1;
          battle.p2Vy = -260;
          if (battle.p2Step >= battle.targetSteps) {
            battle.winner = 'p2';
          }
        }
        break;
      }

      case 'balloon-pop': {
        if (player === 'p1') {
          battle.p1PumpCount += 1;
          if (battle.p1PumpCount >= battle.maxPumps) {
            battle.winner = 'p1';
          }
        } else {
          battle.p2PumpCount += 1;
          if (battle.p2PumpCount >= battle.maxPumps) {
            battle.winner = 'p2';
          }
        }
        break;
      }

      case 'tank-clash': {
        const angle = player === 'p1' ? battle.p1Angle : battle.p2Angle;
        const originX = player === 'p1' ? 180 : 620;
        const originY = 300;
        const speed = 350;
        battle.projectiles.push({
          x: originX + Math.cos(angle) * 35,
          y: originY + Math.sin(angle) * 35,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          owner: player,
          bounces: 0,
        });
        break;
      }

      case 'sumotori': {
        const speed = 250;
        if (player === 'p1') {
          battle.p1Vx += Math.cos(battle.p1Angle) * speed;
          battle.p1Vy += Math.sin(battle.p1Angle) * speed;
        } else {
          battle.p2Vx += Math.cos(battle.p2Angle) * speed;
          battle.p2Vy += Math.sin(battle.p2Angle) * speed;
        }
        break;
      }

      case 'laser-dodge': {
        if (player === 'p1' && battle.p1Grounded) {
          battle.p1Vy = -380;
          battle.p1Grounded = false;
        } else if (player === 'p2' && battle.p2Grounded) {
          battle.p2Vy = -380;
          battle.p2Grounded = false;
        }
        break;
      }

      case 'coin-snatch': {
        if (player === 'p1' && !battle.snatched) {
          battle.p1X += 80;
          if (battle.p1X >= battle.coinX - 20) {
            battle.snatched = true;
            battle.winner = 'p1';
          }
        } else if (player === 'p2' && !battle.snatched) {
          battle.p2X -= 80;
          if (battle.p2X <= battle.coinX + 20) {
            battle.snatched = true;
            battle.winner = 'p2';
          }
        }
        break;
      }

      case 'knife-flip': {
        if (player === 'p1' && !battle.p1DartInFlight) {
          battle.p1DartInFlight = true;
          battle.p1DartY = 480;
        } else if (player === 'p2' && !battle.p2DartInFlight) {
          battle.p2DartInFlight = true;
          battle.p2DartY = 480;
        }
        break;
      }

      case 'helicopter-drop': {
        if (player === 'p1' && !battle.p1Landed && !battle.p1Crashed) {
          battle.p1Vy -= 120;
        } else if (player === 'p2' && !battle.p2Landed && !battle.p2Crashed) {
          battle.p2Vy -= 120;
        }
        break;
      }

      case 'hammer-smash': {
        if (battle.gopherActive) {
          if (player === 'p1') {
            battle.p1Hits += 1;
            battle.gopherActive = false;
            battle.gopherTimer = 1.0;
            if (battle.p1Hits >= battle.targetHits) {
              battle.winner = 'p1';
            }
          } else {
            battle.p2Hits += 1;
            battle.gopherActive = false;
            battle.gopherTimer = 1.0;
            if (battle.p2Hits >= battle.targetHits) {
              battle.winner = 'p2';
            }
          }
        }
        break;
      }
    }
  }

  static update(battle: BattleState, dt: number): void {
    if (battle.winner) return;

    battle.timeRemaining = Math.max(0, battle.timeRemaining - dt);
    if (battle.timeRemaining <= 0) {
      this.resolveTimeout(battle);
      return;
    }

    switch (battle.id) {
      case 'paper-duel': {
        if (!battle.cueGiven) {
          battle.cueTimer -= dt;
          if (battle.cueTimer <= 0) {
            battle.cueGiven = true;
          }
        }
        break;
      }

      case 'tug-of-war': {
        // Friction / drag towards 0 slightly
        battle.ropePosition *= Math.pow(battle.dragFactor, dt * 60);
        break;
      }

      case 'table-soccer': {
        // Spin friction
        battle.p1Angle += battle.p1AngularVelocity * dt;
        battle.p2Angle += battle.p2AngularVelocity * dt;
        battle.p1AngularVelocity *= Math.pow(0.9, dt * 60);
        battle.p2AngularVelocity *= Math.pow(0.9, dt * 60);

        // Ball movement
        battle.ballX += battle.ballVx * dt;
        battle.ballY += battle.ballVy * dt;

        // Pitch bounds
        if (battle.ballY <= 140 || battle.ballY >= 460) {
          battle.ballVy = -battle.ballVy;
          battle.ballY = Math.max(140, Math.min(460, battle.ballY));
        }

        // P1 Kicker at (260, 300)
        const p1X = 260;
        const p1Y = 300;
        const foot1X = p1X + Math.cos(battle.p1Angle) * 50;
        const foot1Y = p1Y + Math.sin(battle.p1Angle) * 50;
        const d1 = Math.hypot(battle.ballX - foot1X, battle.ballY - foot1Y);
        if (d1 < 35) {
          battle.ballVx = Math.abs(battle.ballVx) + 150 + Math.abs(battle.p1AngularVelocity) * 15;
          battle.ballVy += (battle.ballY - foot1Y) * 5;
        }

        // P2 Kicker at (540, 300)
        const p2X = 540;
        const p2Y = 300;
        const foot2X = p2X + Math.cos(battle.p2Angle) * 50;
        const foot2Y = p2Y + Math.sin(battle.p2Angle) * 50;
        const d2 = Math.hypot(battle.ballX - foot2X, battle.ballY - foot2Y);
        if (d2 < 35) {
          battle.ballVx = -Math.abs(battle.ballVx) - 150 - Math.abs(battle.p2AngularVelocity) * 15;
          battle.ballVy += (battle.ballY - foot2Y) * 5;
        }

        // Goal logic
        if (battle.ballX < 120) {
          battle.p2Score += 1;
          if (battle.p2Score >= 2) {
            battle.winner = 'p2';
          } else {
            battle.ballX = 400;
            battle.ballY = 300;
            battle.ballVx = 150;
            battle.ballVy = 0;
          }
        } else if (battle.ballX > 680) {
          battle.p1Score += 1;
          if (battle.p1Score >= 2) {
            battle.winner = 'p1';
          } else {
            battle.ballX = 400;
            battle.ballY = 300;
            battle.ballVx = -150;
            battle.ballVy = 0;
          }
        }
        break;
      }

      case 'lava-hop': {
        battle.lavaY -= battle.lavaSpeed * dt;
        const gravity = 600;

        // P1 Jump update
        if (battle.p1Vy !== 0 || battle.p1Y < 480 - battle.p1Step * 30) {
          battle.p1Vy += gravity * dt;
          battle.p1Y += battle.p1Vy * dt;
          const targetY = 480 - battle.p1Step * 30;
          if (battle.p1Y >= targetY) {
            battle.p1Y = targetY;
            battle.p1Vy = 0;
          }
        }

        // P2 Jump update
        if (battle.p2Vy !== 0 || battle.p2Y < 480 - battle.p2Step * 30) {
          battle.p2Vy += gravity * dt;
          battle.p2Y += battle.p2Vy * dt;
          const targetY = 480 - battle.p2Step * 30;
          if (battle.p2Y >= targetY) {
            battle.p2Y = targetY;
            battle.p2Vy = 0;
          }
        }

        if (battle.p1Y >= battle.lavaY) {
          battle.winner = 'p2';
        } else if (battle.p2Y >= battle.lavaY) {
          battle.winner = 'p1';
        }
        break;
      }

      case 'balloon-pop': {
        // Nothing automatic
        break;
      }

      case 'tank-clash': {
        battle.p1Angle += 1.6 * dt;
        battle.p2Angle += 1.6 * dt;

        // Update bullets
        for (let i = battle.projectiles.length - 1; i >= 0; i--) {
          const p = battle.projectiles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Wall bounce (140 to 460 Y, 100 to 700 X)
          if (p.y <= 140 || p.y >= 460) {
            p.vy = -p.vy;
            p.bounces++;
          }
          if (p.x <= 100 || p.x >= 700) {
            p.vx = -p.vx;
            p.bounces++;
          }

          // Check hit P1
          if (p.owner !== 'p1' || p.bounces > 0) {
            const dist1 = Math.hypot(p.x - 180, p.y - 300);
            if (dist1 < 30) {
              battle.p1Health -= 1;
              battle.projectiles.splice(i, 1);
              if (battle.p1Health <= 0) battle.winner = 'p2';
              continue;
            }
          }

          // Check hit P2
          if (p.owner !== 'p2' || p.bounces > 0) {
            const dist2 = Math.hypot(p.x - 620, p.y - 300);
            if (dist2 < 30) {
              battle.p2Health -= 1;
              battle.projectiles.splice(i, 1);
              if (battle.p2Health <= 0) battle.winner = 'p1';
              continue;
            }
          }

          if (p.bounces > 3) {
            battle.projectiles.splice(i, 1);
          }
        }
        break;
      }

      case 'sumotori': {
        // Continual oscillating angles
        battle.p1Angle += 2.5 * dt;
        battle.p2Angle -= 2.5 * dt;

        // Movement & friction
        battle.p1X += battle.p1Vx * dt;
        battle.p1Y += battle.p1Vy * dt;
        battle.p2X += battle.p2Vx * dt;
        battle.p2Y += battle.p2Vy * dt;

        battle.p1Vx *= Math.pow(0.85, dt * 60);
        battle.p1Vy *= Math.pow(0.85, dt * 60);
        battle.p2Vx *= Math.pow(0.85, dt * 60);
        battle.p2Vy *= Math.pow(0.85, dt * 60);

        // Body collision
        const dist = Math.hypot(battle.p1X - battle.p2X, battle.p1Y - battle.p2Y);
        if (dist < 50 && dist > 0) {
          const nx = (battle.p2X - battle.p1X) / dist;
          const ny = (battle.p2Y - battle.p1Y) / dist;
          battle.p1Vx -= nx * 220;
          battle.p1Vy -= ny * 220;
          battle.p2Vx += nx * 220;
          battle.p2Vy += ny * 220;
        }

        // Ring out check (center 400, 300)
        const d1 = Math.hypot(battle.p1X - 400, battle.p1Y - 300);
        const d2 = Math.hypot(battle.p2X - 400, battle.p2Y - 300);
        if (d1 > battle.ringRadius) {
          battle.winner = 'p2';
        } else if (d2 > battle.ringRadius) {
          battle.winner = 'p1';
        }
        break;
      }

      case 'laser-dodge': {
        battle.laserAngle += battle.laserSpeed * dt;
        const normalizedAngle = (battle.laserAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const gravity = 900;

        // P1 physics (stands at left)
        if (!battle.p1Grounded) {
          battle.p1Vy += gravity * dt;
          battle.p1Y += battle.p1Vy * dt;
          if (battle.p1Y >= 450) {
            battle.p1Y = 450;
            battle.p1Vy = 0;
            battle.p1Grounded = true;
          }
        }

        // P2 physics (stands at right)
        if (!battle.p2Grounded) {
          battle.p2Vy += gravity * dt;
          battle.p2Y += battle.p2Vy * dt;
          if (battle.p2Y >= 450) {
            battle.p2Y = 450;
            battle.p2Vy = 0;
            battle.p2Grounded = true;
          }
        }

        // Check if laser sweeps past player positions
        // P1 is at angle PI (Left side), P2 is at angle 0 (Right side)
        // Hit window when beam points down low
        const hitWindow = 0.25;
        if (Math.abs(normalizedAngle - Math.PI) < hitWindow && battle.p1Grounded) {
          battle.winner = 'p2';
        }
        if ((normalizedAngle < hitWindow || normalizedAngle > Math.PI * 2 - hitWindow) && battle.p2Grounded) {
          battle.winner = 'p1';
        }
        break;
      }

      case 'coin-snatch': {
        // Passive movement or static
        break;
      }

      case 'knife-flip': {
        battle.targetAngle += battle.targetSpeed * dt;

        // Dart flight
        if (battle.p1DartInFlight) {
          battle.p1DartY -= 650 * dt;
          if (battle.p1DartY <= 260) {
            battle.p1DartInFlight = false;
            battle.p1DartY = 480;
            // Check target alignment
            const angleMod = (battle.targetAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            if (angleMod < 0.6 || angleMod > Math.PI * 2 - 0.6) {
              battle.p1Hits += 1;
              if (battle.p1Hits >= battle.targetHitsNeeded) battle.winner = 'p1';
            }
          }
        }

        if (battle.p2DartInFlight) {
          battle.p2DartY -= 650 * dt;
          if (battle.p2DartY <= 260) {
            battle.p2DartInFlight = false;
            battle.p2DartY = 480;
            const angleMod = (battle.targetAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            if (angleMod < 0.6 || angleMod > Math.PI * 2 - 0.6) {
              battle.p2Hits += 1;
              if (battle.p2Hits >= battle.targetHitsNeeded) battle.winner = 'p2';
            }
          }
        }
        break;
      }

      case 'helicopter-drop': {
        const gravity = 200;
        // P1
        if (!battle.p1Landed && !battle.p1Crashed) {
          battle.p1Vy += gravity * dt;
          battle.p1Y += battle.p1Vy * dt;
          if (battle.p1Y >= battle.padY) {
            battle.p1Y = battle.padY;
            if (battle.p1Vy > 160) {
              battle.p1Crashed = true;
              battle.winner = 'p2';
            } else {
              battle.p1Landed = true;
              battle.winner = 'p1';
            }
          }
        }

        // P2
        if (!battle.p2Landed && !battle.p2Crashed) {
          battle.p2Vy += gravity * dt;
          battle.p2Y += battle.p2Vy * dt;
          if (battle.p2Y >= battle.padY) {
            battle.p2Y = battle.padY;
            if (battle.p2Vy > 160) {
              battle.p2Crashed = true;
              battle.winner = 'p1';
            } else {
              battle.p2Landed = true;
              battle.winner = 'p2';
            }
          }
        }
        break;
      }

      case 'hammer-smash': {
        battle.gopherTimer -= dt;
        if (battle.gopherTimer <= 0) {
          battle.gopherActive = !battle.gopherActive;
          battle.gopherTimer = battle.gopherActive ? 0.9 : (0.5 + Math.random() * 0.8);
          if (battle.gopherActive) {
            const sides: ('left' | 'right' | 'center')[] = ['left', 'right', 'center'];
            battle.gopherSide = sides[Math.floor(Math.random() * sides.length)];
          }
        }
        break;
      }
    }
  }

  static resolveTimeout(battle: BattleState): void {
    switch (battle.id) {
      case 'tug-of-war':
        battle.winner = battle.ropePosition < 0 ? 'p1' : battle.ropePosition > 0 ? 'p2' : 'draw';
        break;
      case 'table-soccer':
        battle.winner = battle.p1Score > battle.p2Score ? 'p1' : battle.p2Score > battle.p1Score ? 'p2' : 'draw';
        break;
      case 'lava-hop':
        battle.winner = battle.p1Step > battle.p2Step ? 'p1' : battle.p2Step > battle.p1Step ? 'p2' : 'draw';
        break;
      case 'balloon-pop':
        battle.winner = battle.p1PumpCount > battle.p2PumpCount ? 'p1' : battle.p2PumpCount > battle.p1PumpCount ? 'p2' : 'draw';
        break;
      case 'tank-clash':
        battle.winner = battle.p1Health > battle.p2Health ? 'p1' : battle.p2Health > battle.p1Health ? 'p2' : 'draw';
        break;
      case 'sumotori': {
        const d1 = Math.hypot(battle.p1X - 400, battle.p1Y - 300);
        const d2 = Math.hypot(battle.p2X - 400, battle.p2Y - 300);
        battle.winner = d1 < d2 ? 'p1' : d2 < d1 ? 'p2' : 'draw';
        break;
      }
      case 'knife-flip':
        battle.winner = battle.p1Hits > battle.p2Hits ? 'p1' : battle.p2Hits > battle.p1Hits ? 'p2' : 'draw';
        break;
      case 'hammer-smash':
        battle.winner = battle.p1Hits > battle.p2Hits ? 'p1' : battle.p2Hits > battle.p1Hits ? 'p2' : 'draw';
        break;
      default:
        battle.winner = 'draw';
        break;
    }
  }

  static computeCPUTap(battle: BattleState, difficulty: CPUDifficulty, dt: number, cpuState: { timer: number }): boolean {
    if (battle.winner) return false;
    cpuState.timer -= dt;

    const rate = difficulty === 'hard' ? 0.12 : difficulty === 'normal' ? 0.22 : 0.40;

    switch (battle.id) {
      case 'paper-duel': {
        if (battle.cueGiven) {
          const delay = difficulty === 'hard' ? 0.15 : difficulty === 'normal' ? 0.35 : 0.65;
          if (cpuState.timer <= -delay) {
            return true;
          }
        }
        return false;
      }

      case 'tug-of-war':
      case 'balloon-pop': {
        if (cpuState.timer <= 0) {
          cpuState.timer = rate + (Math.random() - 0.5) * 0.05;
          return true;
        }
        return false;
      }

      case 'table-soccer': {
        if (battle.ballX > 380 && battle.ballX < 600) {
          if (cpuState.timer <= 0) {
            cpuState.timer = rate;
            return true;
          }
        }
        return false;
      }

      case 'lava-hop': {
        if (battle.p2Vy === 0 && cpuState.timer <= 0) {
          cpuState.timer = rate;
          return true;
        }
        return false;
      }

      case 'tank-clash': {
        // Aim towards P1 (180, 300) from (620, 300) -> Target angle is PI (left)
        const angleMod = (battle.p2Angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const aimDiff = Math.abs(angleMod - Math.PI);
        const tolerance = difficulty === 'hard' ? 0.2 : difficulty === 'normal' ? 0.4 : 0.7;
        if (aimDiff < tolerance && cpuState.timer <= 0) {
          cpuState.timer = 0.5;
          return true;
        }
        return false;
      }

      case 'sumotori': {
        // Aim towards P1
        const dx = battle.p1X - battle.p2X;
        const dy = battle.p1Y - battle.p2Y;
        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = (battle.p2Angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const targetNormalized = (targetAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const diff = Math.abs(currentAngle - targetNormalized);
        if (diff < 0.5 && cpuState.timer <= 0) {
          cpuState.timer = rate * 2;
          return true;
        }
        return false;
      }

      case 'laser-dodge': {
        const normAngle = (battle.laserAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        // Laser approaching P2 at angle 0 (or ~ 5.5 to 6.28)
        if (normAngle > 5.2 && normAngle < 6.1 && battle.p2Grounded) {
          return true;
        }
        return false;
      }

      case 'coin-snatch': {
        if (cpuState.timer <= 0) {
          cpuState.timer = rate;
          return true;
        }
        return false;
      }

      case 'knife-flip': {
        const angleMod = (battle.targetAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if ((angleMod < 0.4 || angleMod > Math.PI * 2 - 0.4) && !battle.p2DartInFlight) {
          return true;
        }
        return false;
      }

      case 'helicopter-drop': {
        if (battle.p2Vy > (difficulty === 'hard' ? 80 : 120)) {
          return true;
        }
        return false;
      }

      case 'hammer-smash': {
        if (battle.gopherActive && cpuState.timer <= 0) {
          cpuState.timer = rate;
          return true;
        }
        return false;
      }
    }
  }
}
