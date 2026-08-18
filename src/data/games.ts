import { loadData } from '@arcade-carnival/playables-adapter';

export interface GameItem {
  id: string;
  title: string;
  genre: string;
  description: string;
  badge?: string;
  rating: string;
  plays: string;
  icon: string;
  themeColor: string;
  bannerBg: string;
  features: string[];
}

export const GAMES: GameItem[] = [
  {
    id: 'safe-cracker',
    title: 'Safe Cracker',
    genre: 'Clicker / Timing',
    description: 'Precision timing safe cracking. Hit the narrowing lock tumbler zones under extreme pressure.',
    badge: 'Popular',
    rating: '4.8 ★',
    plays: '420K plays',
    icon: '🔐',
    themeColor: '#f1c40f',
    bannerBg: 'linear-gradient(135deg, #1e1b10 0%, #3e2e04 100%)',
    features: ['Precision Angular Collision', 'Dynamic Speed Ramp', 'Time Bonus Extensions']
  },
  {
    id: 'brick-blitz',
    title: 'Brick Blitz',
    genre: 'Breakout Action',
    description: 'High-octane synthwave brick breaker with deflection physics, bonus blocks, and multiple stages.',
    badge: 'Trending',
    rating: '4.9 ★',
    plays: '850K plays',
    icon: '🧱',
    themeColor: '#00d2d3',
    bannerBg: 'linear-gradient(135deg, #091e28 0%, #064b5f 100%)',
    features: ['Multi-Stage Layouts', 'Angle Deflection Math', 'Extra Life Blocks']
  },
  {
    id: 'sky-hopper',
    title: 'Sky Hopper',
    genre: 'Vertical Platformer',
    description: 'Auto-bounce sky climber. Dodge aerial obstacles, launch rockets, and reach the mothership.',
    badge: 'Featured',
    rating: '4.9 ★',
    plays: '1.2M plays',
    icon: '🚀',
    themeColor: '#9b59b6',
    bannerBg: 'linear-gradient(135deg, #1a0f28 0%, #461b69 100%)',
    features: ['Story & Infinite Modes', 'Shiv Combat Throw', 'Rocket Booster Flight']
  },
  {
    id: 'crate-catch',
    title: 'Crate Catch',
    genre: 'Catcher / Stacker',
    description: 'Dual-track steampunk industrial catcher. Stack crates for huge multipliers and bank before bombs hit.',
    badge: 'Updated',
    rating: '4.7 ★',
    plays: '310K plays',
    icon: '📦',
    themeColor: '#e67e22',
    bannerBg: 'linear-gradient(135deg, #241406 0%, #582b09 100%)',
    features: ['Two-Lane Switching', 'Physics Tilt Wobble', 'Multiplier Banking']
  },
  {
    id: 'type-strike',
    title: 'Type Strike',
    genre: 'Typing Defense',
    description: 'Cyberpunk command terminal defense. Type approaching enemy code strings to fire plasma lasers.',
    badge: 'Fast Paced',
    rating: '4.9 ★',
    plays: '980K plays',
    icon: '⌨️',
    themeColor: '#ff4757',
    bannerBg: 'linear-gradient(135deg, #23080b 0%, #63121b 100%)',
    features: ['Streak Multipliers', 'Laser Target Locking', '60-Second Challenge']
  },
  {
    id: 'memory-cards',
    title: 'Memory Cards',
    genre: 'Card Matching',
    description: 'Holographic cyberpunk pair matching. Uncover glyph pairs, chain combo streaks, and clear the cyber grid.',
    badge: 'New',
    rating: '4.8 ★',
    plays: '150K plays',
    icon: '🃏',
    themeColor: '#00f0ff',
    bannerBg: 'linear-gradient(135deg, #051923 0%, #003554 100%)',
    features: ['Cyber Glyph Pairs', 'Streak Multipliers', 'Round Timer & High Score']
  },
  {
    id: 'memory-boxes',
    title: 'Memory Boxes',
    genre: 'Pattern Memory',
    description: 'Synthesized memory matrix. Watch expanding light sequences, listen to tones, and repeat patterns accurately.',
    badge: 'Audio',
    rating: '4.7 ★',
    plays: '120K plays',
    icon: '🔲',
    themeColor: '#a29bfe',
    bannerBg: 'linear-gradient(135deg, #191024 0%, #301934 100%)',
    features: ['Expanding Sequences', 'Synthesized Audio Tones', '3-Strike Life System']
  },
  {
    id: 'pop-balloon',
    title: 'Pop Balloon',
    genre: 'Balloon Pop / Reflex',
    description: 'Ascending neon balloon popping frenzy. Chain same-color combos, dodge spike bombs, and rack up points.',
    badge: 'Reflex',
    rating: '4.8 ★',
    plays: '210K plays',
    icon: '🎈',
    themeColor: '#ff7675',
    bannerBg: 'linear-gradient(135deg, #2d0c14 0%, #5c182a 100%)',
    features: ['Ascending Balloon Chains', 'Color Combo Multipliers', 'Hazard Spike Bombs']
  },
  {
    id: 'space-racer',
    title: 'Space Racer',
    genre: 'Orbital Racing',
    description: 'High-speed orbital warp dodging. Weave through asteroid fields and hit turbo boost gates at light speed.',
    badge: 'High Speed',
    rating: '4.9 ★',
    plays: '340K plays',
    icon: '🚀',
    themeColor: '#0984e3',
    bannerBg: 'linear-gradient(135deg, #050e1e 0%, #0c2461 100%)',
    features: ['Pseudo-3D Starfield Warp', 'Turbo Boost Gates', 'Dynamic Asteroid Kinematics']
  },
  {
    id: 'virus-defense',
    title: 'Virus Defense',
    genre: 'Radial Turret Defense',
    description: 'Radial cell turret defense. Rotate 360 degrees to blast mutating pathogen swarms before they breach nucleus.',
    badge: 'Action',
    rating: '4.9 ★',
    plays: '280K plays',
    icon: '🦠',
    themeColor: '#00cec9',
    bannerBg: 'linear-gradient(135deg, #041d1a 0%, #0b3c35 100%)',
    features: ['360° Laser Turret Aiming', 'Mutating Pathogen Swarms', 'Nucleus Shield Defense']
  },
  {
    id: 'flappy-fish',
    title: 'Flappy Fish',
    genre: 'Hydrodynamic Flapper',
    description: 'Underwater buoyancy tapping arcade. Navigate a glowing cyber-fish through illuminated coral reef pillars.',
    badge: 'Arcade',
    rating: '4.8 ★',
    plays: '490K plays',
    icon: '🐠',
    themeColor: '#00b894',
    bannerBg: 'linear-gradient(135deg, #031e21 0%, #06444a 100%)',
    features: ['Underwater Flap Kinematics', 'Glowing Coral Reef Obstacles', 'Pearl Pickups & Medals']
  },
  {
    id: 'game-2048',
    title: '2048 Neon',
    genre: 'Sliding Tile Puzzle',
    description: 'Neon sliding number tile challenge. Merge matching numbers to reach the legendary 2048 tile.',
    badge: 'Puzzle',
    rating: '4.9 ★',
    plays: '620K plays',
    icon: '🔢',
    themeColor: '#fdcb6e',
    bannerBg: 'linear-gradient(135deg, #1f1b0a 0%, #3d3514 100%)',
    features: ['4x4 Directional Merging', 'Neon Tiered Value Tiles', 'Undo Move & Win State']
  },
  {
    id: 'snake-eat',
    title: 'Cyber Snake',
    genre: 'Grid Action',
    description: 'Classic cybernetic snake. Consume energy pellets to grow longer, accelerate speeds, and avoid walls or self-collision.',
    badge: 'Classic',
    rating: '4.9 ★',
    plays: '710K plays',
    icon: '🐍',
    themeColor: '#00ff88',
    bannerBg: 'linear-gradient(135deg, #021a10 0%, #063d27 100%)',
    features: ['Smooth Grid Kinematics', 'Speed Scaling & Growth', 'Energy Pellet Combos']
  },
  {
    id: 'bug-climb',
    title: 'Bug Climb',
    genre: 'Reflex Climber',
    description: 'High-speed tree climbing reflex action. Tap Left or Right to switch sides on the trunk and dodge oncoming branch hazards.',
    badge: 'Fast Paced',
    rating: '4.8 ★',
    plays: '380K plays',
    icon: '🐛',
    themeColor: '#2ed573',
    bannerBg: 'linear-gradient(135deg, #0f1c08 0%, #1e3810 100%)',
    features: ['Rapid Left/Right Trunk Shifts', 'Branch Obstacle Hazards', 'Urgent Countdown Timer']
  },
  {
    id: 'car-race',
    title: 'Neon Highway',
    genre: 'Traffic Racing',
    description: 'Multi-lane cyber highway racer. Steer sports car across lanes, throttle speeds, and draft commuter traffic for slipstream bonuses.',
    badge: 'High Speed',
    rating: '4.9 ★',
    plays: '520K plays',
    icon: '🏎️',
    themeColor: '#ff4757',
    bannerBg: 'linear-gradient(135deg, #1f060b 0%, #3f0d16 100%)',
    features: ['4-Lane Highway Shifting', 'Up/Down Speed Throttle', 'Slipstream Drafting Bonus']
  }
];

export function getPersonalHighScore(slug: string): number {
  try {
    const val = loadData(`${slug}-highscore`);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {
    // Ignore storage errors
  }
  return 0;
}
