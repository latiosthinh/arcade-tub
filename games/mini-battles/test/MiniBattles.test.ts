import { describe, it, expect, beforeEach } from 'vitest';
import { GameModes, BattleState } from '../src/GameModes.js';
import { PartyEngine } from '../src/PartyEngine.js';
import { MINI_GAMES } from '../src/GameState.js';

describe('GameModes - 12 Mini Battles', () => {
  it('creates initial state for all 12 minigames', () => {
    MINI_GAMES.forEach((mode) => {
      const state = GameModes.createBattle(mode.id);
      expect(state.id).toBe(mode.id);
      expect(state.winner).toBeNull();
      expect(state.timeRemaining).toBeGreaterThan(0);
    });
  });

  describe('1. Paper Duel', () => {
    it('penalizes early draw as foul', () => {
      const battle = GameModes.createBattle('paper-duel');
      GameModes.handleInput(battle, 'p1');
      expect(battle.winner).toBe('p2');
    });

    it('awards win to first drawer after cue given', () => {
      const battle = GameModes.createBattle('paper-duel');
      if (battle.id === 'paper-duel') {
        battle.cueGiven = true;
        GameModes.handleInput(battle, 'p1');
        expect(battle.winner).toBe('p1');
      }
    });
  });

  describe('2. Cardboard Tug of War', () => {
    it('shifts rope and determines winner at threshold', () => {
      const battle = GameModes.createBattle('tug-of-war');
      for (let i = 0; i < 9; i++) {
        GameModes.handleInput(battle, 'p1');
      }
      expect(battle.winner).toBe('p1');
    });
  });

  describe('3. Table Soccer', () => {
    it('spins kicker and tracks goal scores', () => {
      const battle = GameModes.createBattle('table-soccer');
      GameModes.handleInput(battle, 'p1');
      if (battle.id === 'table-soccer') {
        expect(battle.p1AngularVelocity).toBeGreaterThan(0);
        // Simulate ball in right goal
        battle.ballX = 690;
        GameModes.update(battle, 0.016);
        expect(battle.p1Score).toBe(1);
        battle.ballX = 690;
        GameModes.update(battle, 0.016);
        expect(battle.winner).toBe('p1');
      }
    });
  });

  describe('4. Lava Hop', () => {
    it('increments step and resolves winner at top target', () => {
      const battle = GameModes.createBattle('lava-hop');
      if (battle.id === 'lava-hop') {
        for (let i = 0; i < battle.targetSteps; i++) {
          battle.p1Vy = 0;
          GameModes.handleInput(battle, 'p1');
        }
        expect(battle.winner).toBe('p1');
      }
    });

    it('eliminates player if submerged by rising lava', () => {
      const battle = GameModes.createBattle('lava-hop');
      if (battle.id === 'lava-hop') {
        battle.lavaY = 400; // rises above P1
        GameModes.update(battle, 0.1);
        expect(battle.winner).toBe('p2');
      }
    });
  });

  describe('5. Balloon Pop', () => {
    it('pops balloon when pump capacity is reached', () => {
      const battle = GameModes.createBattle('balloon-pop');
      if (battle.id === 'balloon-pop') {
        for (let i = 0; i < battle.maxPumps; i++) {
          GameModes.handleInput(battle, 'p2');
        }
        expect(battle.winner).toBe('p2');
      }
    });
  });

  describe('6. Tank Clash', () => {
    it('fires projectile and inflicts damage', () => {
      const battle = GameModes.createBattle('tank-clash');
      GameModes.handleInput(battle, 'p1');
      if (battle.id === 'tank-clash') {
        expect(battle.projectiles.length).toBe(1);
        // Place projectile right on P2
        battle.projectiles[0].x = 620;
        battle.projectiles[0].y = 300;
        battle.p2Health = 1;
        GameModes.update(battle, 0.016);
        expect(battle.winner).toBe('p1');
      }
    });
  });

  describe('7. Sumotori', () => {
    it('pushes gladiator out of ring', () => {
      const battle = GameModes.createBattle('sumotori');
      if (battle.id === 'sumotori') {
        battle.p2X = 650; // out of ring radius 180 (center 400)
        GameModes.update(battle, 0.016);
        expect(battle.winner).toBe('p1');
      }
    });
  });

  describe('8. Laser Dodge', () => {
    it('hits grounded player when laser sweeps through', () => {
      const battle = GameModes.createBattle('laser-dodge');
      if (battle.id === 'laser-dodge') {
        battle.laserAngle = Math.PI; // sweeps through P1 side
        battle.p1Grounded = true;
        GameModes.update(battle, 0.016);
        expect(battle.winner).toBe('p2');
      }
    });

    it('allows player to leap over beam', () => {
      const battle = GameModes.createBattle('laser-dodge');
      GameModes.handleInput(battle, 'p1');
      if (battle.id === 'laser-dodge') {
        expect(battle.p1Grounded).toBe(false);
      }
    });
  });

  describe('9. Coin Snatch', () => {
    it('first player to reach center coin claims victory', () => {
      const battle = GameModes.createBattle('coin-snatch');
      for (let i = 0; i < 4; i++) {
        GameModes.handleInput(battle, 'p1');
      }
      expect(battle.winner).toBe('p1');
    });
  });

  describe('10. Dart / Knife Flip', () => {
    it('scores point on successful bullseye alignment', () => {
      const battle = GameModes.createBattle('knife-flip');
      GameModes.handleInput(battle, 'p1');
      if (battle.id === 'knife-flip') {
        expect(battle.p1DartInFlight).toBe(true);
        battle.targetAngle = 0; // aligned
        battle.p1DartY = 265;
        GameModes.update(battle, 0.02);
        expect(battle.p1Hits).toBe(1);
      }
    });
  });

  describe('11. Helicopter Drop', () => {
    it('rewards safe touchdown and punishes crash descent', () => {
      const battle = GameModes.createBattle('helicopter-drop');
      if (battle.id === 'helicopter-drop') {
        battle.p1Y = 475;
        battle.p1Vy = 250; // too fast -> crash
        GameModes.update(battle, 0.1);
        expect(battle.winner).toBe('p2');
      }
    });
  });

  describe('12. Hammer Smash', () => {
    it('registers hit only when target is active', () => {
      const battle = GameModes.createBattle('hammer-smash');
      if (battle.id === 'hammer-smash') {
        battle.gopherActive = false;
        GameModes.handleInput(battle, 'p1');
        expect(battle.p1Hits).toBe(0);

        battle.gopherActive = true;
        GameModes.handleInput(battle, 'p1');
        expect(battle.p1Hits).toBe(1);
      }
    });
  });
});

describe('PartyEngine', () => {
  let engine: PartyEngine;

  beforeEach(() => {
    engine = new PartyEngine();
  });

  it('cycles game modes and difficulty', () => {
    engine.nextMode();
    expect(engine.matchState.selectedModeIndex).toBe(1);
    engine.prevMode();
    expect(engine.matchState.selectedModeIndex).toBe(0);

    engine.cycleDifficulty();
    expect(engine.matchState.cpuDifficulty).toBe('hard');
    engine.toggleCPU();
    expect(engine.matchState.vsCPU).toBe(false);
  });

  it('advances through countdown into playing state', () => {
    engine.startMatch();
    expect(engine.matchState.screen).toBe('countdown');
    engine.update(3.1);
    expect(engine.matchState.screen).toBe('playing');
  });

  it('declares match winner when reaching target wins', () => {
    engine.matchState.targetWins = 2;
    engine.startRound();
    engine.update(3.1);

    // Simulate P1 win round 1
    if (engine.currentBattle) {
      engine.currentBattle.winner = 'p1';
    }
    engine.update(0.1);
    expect(engine.matchState.p1Score).toBe(1);
    expect(engine.matchState.screen).toBe('round-over');

    engine.nextRoundOrFinish();
    engine.update(3.1);

    // Simulate P1 win round 2
    if (engine.currentBattle) {
      engine.currentBattle.winner = 'p1';
    }
    engine.update(0.1);
    expect(engine.matchState.p1Score).toBe(2);
    expect(engine.matchState.screen).toBe('match-over');
    expect(engine.matchState.matchWinner).toBe('p1');
  });
});
