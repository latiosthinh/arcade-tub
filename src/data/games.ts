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
