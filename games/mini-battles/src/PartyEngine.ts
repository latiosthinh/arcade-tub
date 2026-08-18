import { PartyMatchState, MINI_GAMES, MiniGameId, PlayerId, CPUDifficulty } from './GameState.js';
import { BattleState, GameModes } from './GameModes.js';

export interface PartyEngineEvents {
  onStateChange?: (state: PartyMatchState) => void;
  onRoundStart?: (battle: BattleState) => void;
  onRoundEnd?: (winner: PlayerId | 'draw', p1Score: number, p2Score: number) => void;
  onMatchEnd?: (winner: PlayerId) => void;
  onSFX?: (name: string) => void;
}

export class PartyEngine {
  public matchState: PartyMatchState;
  public currentBattle: BattleState | null = null;
  public events: PartyEngineEvents;
  private cpuTimerState = { timer: 0 };

  constructor(events: PartyEngineEvents = {}) {
    this.events = events;
    this.matchState = {
      screen: 'menu',
      selectedModeIndex: 0,
      p1Score: 0,
      p2Score: 0,
      targetWins: 5,
      vsCPU: true,
      cpuDifficulty: 'normal',
      roundWinner: null,
      matchWinner: null,
      roundTimer: 0,
      countdownValue: 3,
    };
  }

  public setMode(index: number): void {
    if (index >= 0 && index < MINI_GAMES.length) {
      this.matchState.selectedModeIndex = index;
    }
  }

  public nextMode(): void {
    this.matchState.selectedModeIndex = (this.matchState.selectedModeIndex + 1) % MINI_GAMES.length;
  }

  public prevMode(): void {
    this.matchState.selectedModeIndex = (this.matchState.selectedModeIndex - 1 + MINI_GAMES.length) % MINI_GAMES.length;
  }

  public toggleCPU(): void {
    this.matchState.vsCPU = !this.matchState.vsCPU;
  }

  public cycleDifficulty(): void {
    const diffs: CPUDifficulty[] = ['easy', 'normal', 'hard'];
    const nextIdx = (diffs.indexOf(this.matchState.cpuDifficulty) + 1) % diffs.length;
    this.matchState.cpuDifficulty = diffs[nextIdx];
  }

  public startMatch(): void {
    this.matchState.p1Score = 0;
    this.matchState.p2Score = 0;
    this.matchState.matchWinner = null;
    this.startRound();
  }

  public startRound(): void {
    const mode = MINI_GAMES[this.matchState.selectedModeIndex];
    this.currentBattle = GameModes.createBattle(mode.id);
    this.matchState.screen = 'countdown';
    this.matchState.countdownValue = 3;
    this.matchState.roundTimer = 0;
    this.matchState.roundWinner = null;
    this.cpuTimerState.timer = 0;

    this.events.onSFX?.('countdown');
    this.events.onStateChange?.(this.matchState);
  }

  public handleInput(player: PlayerId): void {
    if (this.matchState.screen === 'menu') {
      if (player === 'p1') {
        this.startMatch();
      }
      return;
    }

    if (this.matchState.screen === 'round-over') {
      this.nextRoundOrFinish();
      return;
    }

    if (this.matchState.screen === 'match-over') {
      this.matchState.screen = 'menu';
      this.events.onStateChange?.(this.matchState);
      return;
    }

    if (this.matchState.screen === 'playing' && this.currentBattle) {
      this.events.onSFX?.('tap');
      GameModes.handleInput(this.currentBattle, player);
      this.checkRoundResolution();
    }
  }

  public update(dt: number): void {
    if (this.matchState.screen === 'countdown') {
      this.matchState.roundTimer += dt;
      const prevVal = this.matchState.countdownValue;
      this.matchState.countdownValue = Math.max(0, 3 - Math.floor(this.matchState.roundTimer));

      if (prevVal !== this.matchState.countdownValue && this.matchState.countdownValue > 0) {
        this.events.onSFX?.('countdown');
      }

      if (this.matchState.roundTimer >= 3) {
        this.matchState.screen = 'playing';
        this.matchState.roundTimer = 0;
        this.events.onSFX?.('whistle');
        if (this.currentBattle) {
          this.events.onRoundStart?.(this.currentBattle);
        }
      }
      this.events.onStateChange?.(this.matchState);
      return;
    }

    if (this.matchState.screen === 'playing' && this.currentBattle) {
      // CPU Input
      if (this.matchState.vsCPU) {
        const cpuTap = GameModes.computeCPUTap(
          this.currentBattle,
          this.matchState.cpuDifficulty,
          dt,
          this.cpuTimerState
        );
        if (cpuTap) {
          GameModes.handleInput(this.currentBattle, 'p2');
        }
      }

      GameModes.update(this.currentBattle, dt);
      this.checkRoundResolution();
      this.events.onStateChange?.(this.matchState);
    }
  }

  private checkRoundResolution(): void {
    if (!this.currentBattle || !this.currentBattle.winner) return;

    const winner = this.currentBattle.winner;
    this.matchState.roundWinner = winner;

    if (winner === 'p1') {
      this.matchState.p1Score += 1;
      this.events.onSFX?.('cheer');
    } else if (winner === 'p2') {
      this.matchState.p2Score += 1;
      this.events.onSFX?.('cheer');
    } else {
      this.events.onSFX?.('draw');
    }

    this.events.onRoundEnd?.(winner, this.matchState.p1Score, this.matchState.p2Score);

    if (this.matchState.p1Score >= this.matchState.targetWins) {
      this.matchState.screen = 'match-over';
      this.matchState.matchWinner = 'p1';
      this.events.onSFX?.('fanfare');
      this.events.onMatchEnd?.('p1');
    } else if (this.matchState.p2Score >= this.matchState.targetWins) {
      this.matchState.screen = 'match-over';
      this.matchState.matchWinner = 'p2';
      this.events.onSFX?.('fanfare');
      this.events.onMatchEnd?.('p2');
    } else {
      this.matchState.screen = 'round-over';
    }
  }

  public nextRoundOrFinish(): void {
    if (this.matchState.matchWinner) {
      this.matchState.screen = 'match-over';
    } else {
      // Choose next random minigame mode or advance carousel
      this.matchState.selectedModeIndex = (this.matchState.selectedModeIndex + 1) % MINI_GAMES.length;
      this.startRound();
    }
  }
}
