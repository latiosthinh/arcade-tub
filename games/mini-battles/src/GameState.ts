export type PlayerId = 'p1' | 'p2';

export type MiniGameId =
  | 'paper-duel'
  | 'tug-of-war'
  | 'table-soccer'
  | 'lava-hop'
  | 'balloon-pop'
  | 'tank-clash'
  | 'sumotori'
  | 'laser-dodge'
  | 'coin-snatch'
  | 'knife-flip'
  | 'helicopter-drop'
  | 'hammer-smash';

export type CPUDifficulty = 'easy' | 'normal' | 'hard';

export interface GameModeInfo {
  id: MiniGameId;
  name: string;
  instructions: string;
  hint: string;
}

export const MINI_GAMES: GameModeInfo[] = [
  {
    id: 'paper-duel',
    name: 'Paper Duel',
    instructions: 'Wait for FIRE! Tap to quick-draw shoot.',
    hint: 'Shooting early fouls you!'
  },
  {
    id: 'tug-of-war',
    name: 'Cardboard Tug',
    instructions: 'Tap rapidly to pull opponent over the line!',
    hint: 'Speed matters!'
  },
  {
    id: 'table-soccer',
    name: 'Table Soccer',
    instructions: 'Tap to spin puppet foot and kick ball into goal!',
    hint: 'Time your swings.'
  },
  {
    id: 'lava-hop',
    name: 'Lava Hop',
    instructions: 'Tap to jump up ascending cardboard stepping stones!',
    hint: 'Don\'t fall behind.'
  },
  {
    id: 'balloon-pop',
    name: 'Balloon Pop',
    instructions: 'Tap pump rapidly to inflate opponent balloon till POP!',
    hint: 'Pump like crazy!'
  },
  {
    id: 'tank-clash',
    name: 'Tank Clash',
    instructions: 'Cannon auto-rotates. Tap to fire cardboard cannonball!',
    hint: 'Bounce shots count.'
  },
  {
    id: 'sumotori',
    name: 'Sumotori',
    instructions: 'Puppet oscillates. Tap to charge & push rival out!',
    hint: 'Aim center ring.'
  },
  {
    id: 'laser-dodge',
    name: 'Laser Dodge',
    instructions: 'Tap to jump over the rotating spinning beam!',
    hint: 'Timing is crucial.'
  },
  {
    id: 'coin-snatch',
    name: 'Coin Snatch',
    instructions: 'Tap to dash forward and grab center gold coin!',
    hint: 'Quickest reflex wins.'
  },
  {
    id: 'knife-flip',
    name: 'Dart Flip',
    instructions: 'Target moves. Tap to throw dart into bullseye target!',
    hint: 'First to hit 3 pins wins.'
  },
  {
    id: 'helicopter-drop',
    name: 'Helicopter Drop',
    instructions: 'Tap to flap rotors and stick landing on platform!',
    hint: 'Control descent rate.'
  },
  {
    id: 'hammer-smash',
    name: 'Hammer Smash',
    instructions: 'Cardboard gopher pops up! Tap to whack it first.',
    hint: 'Only hit when up!'
  }
];

export interface PartyMatchState {
  screen: 'menu' | 'countdown' | 'playing' | 'round-over' | 'match-over';
  selectedModeIndex: number;
  p1Score: number;
  p2Score: number;
  targetWins: number; // usually 5
  vsCPU: boolean;
  cpuDifficulty: CPUDifficulty;
  roundWinner: PlayerId | 'draw' | null;
  matchWinner: PlayerId | null;
  roundTimer: number;
  countdownValue: number;
}
