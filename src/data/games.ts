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
    description: 'Precision timing cardboard safe cracking. Hit the narrowing lock tumbler zones under papercraft pressure.',
    badge: 'Popular',
    rating: '4.8 ★',
    plays: '420K plays',
    icon: '🔐',
    themeColor: '#F59E0B',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #D8C3A5 100%)',
    features: ['Precision Angular Collision', 'Dynamic Speed Ramp', 'Time Bonus Extensions']
  },
  {
    id: 'brick-blitz',
    title: 'Brick Blitz',
    genre: 'Breakout Action',
    description: 'Handmade papercraft breakout arcade. Deflect paper balls with your wooden craft paddle and shatter layered cardboard brick grids.',
    badge: 'Trending',
    rating: '4.9 ★',
    plays: '850K plays',
    icon: '🧱',
    themeColor: '#E11D48',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #D8C3A5 100%)',
    features: ['Multi-Stage Layouts', 'Angle Deflection Math', 'Extra Life Blocks']
  },
  {
    id: 'sky-hopper',
    title: 'Sky Hopper',
    genre: 'Vertical Platformer',
    description: 'Papercut vertical ascent climber. Bounce up cardboard platforms, dodge origami drones, and reach the 5,000m cardboard mothership.',
    badge: 'Featured',
    rating: '4.9 ★',
    plays: '1.2M plays',
    icon: '🚀',
    themeColor: '#10B981',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #E8DEC8 100%)',
    features: ['Story & Infinite Modes', 'Shiv Combat Throw', 'Rocket Booster Flight']
  },
  {
    id: 'crate-catch',
    title: 'Crate Catch',
    genre: 'Catcher / Stacker',
    description: 'Craft paper factory sorting. Move your cardboard catcher cart along dual conveyor tracks, stack paper crates high, and bank before bombs explode.',
    badge: 'Updated',
    rating: '4.7 ★',
    plays: '310K plays',
    icon: '📦',
    themeColor: '#C85A32',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #E8DEC8 100%)',
    features: ['Two-Lane Switching', 'Physics Tilt Wobble', 'Multiplier Banking']
  },
  {
    id: 'type-strike',
    title: 'Type Strike',
    genre: 'Typing Defense',
    description: 'Papercraft command terminal defense. Type prompt words and directional arrow sequences to fire lasers and protect your cardboard fortress.',
    badge: 'Fast Paced',
    rating: '4.9 ★',
    plays: '980K plays',
    icon: '⌨️',
    themeColor: '#E11D48',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #D8C3A5 100%)',
    features: ['Streak Multipliers', 'Laser Target Locking', '60-Second Challenge']
  },
  {
    id: 'memory-cards',
    title: 'Memory Cards',
    genre: 'Card Matching',
    description: 'Papercraft pair matching. Uncover craft card pairs, chain combo streaks, and clear the card stock grid.',
    badge: 'New',
    rating: '4.8 ★',
    plays: '150K plays',
    icon: '🃏',
    themeColor: '#3B82F6',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #E8DEC8 100%)',
    features: ['Craft Glyph Pairs', 'Streak Multipliers', 'Round Timer & High Score']
  },
  {
    id: 'memory-boxes',
    title: 'Memory Boxes',
    genre: 'Pattern Memory',
    description: 'Construction paper sequence memory. Watch illuminated paper tiles, listen to harmonic tones, and repeat patterns.',
    badge: 'Audio',
    rating: '4.7 ★',
    plays: '120K plays',
    icon: '🔲',
    themeColor: '#8B5CF6',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #D8C3A5 100%)',
    features: ['Expanding Sequences', 'Harmonic Audio Tones', '3-Strike Life System']
  },
  {
    id: 'pop-balloon',
    title: 'Pop Balloon',
    genre: 'Balloon Pop / Reflex',
    description: 'Ascending paper balloon popping carnival. Chain same-color combos, dodge hazard spike bombs, and rack up points.',
    badge: 'Reflex',
    rating: '4.8 ★',
    plays: '210K plays',
    icon: '🎈',
    themeColor: '#E11D48',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #E8DEC8 100%)',
    features: ['Ascending Balloon Chains', 'Color Combo Multipliers', 'Hazard Spike Bombs']
  },
  {
    id: 'space-racer',
    title: 'Space Racer',
    genre: 'Orbital Racing',
    description: 'High-speed papercraft orbital warp. Weave through cardboard asteroid fields and hit origami turbo boost gates at light speed.',
    badge: 'High Speed',
    rating: '4.9 ★',
    plays: '340K plays',
    icon: '🚀',
    themeColor: '#3B82F6',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #D8C3A5 100%)',
    features: ['Pseudo-3D Starfield Warp', 'Turbo Boost Gates', 'Dynamic Asteroid Kinematics']
  },
  {
    id: 'virus-defense',
    title: 'Virus Defense',
    genre: 'Radial Turret Defense',
    description: 'Rotate cardboard laser turret to defend the central papercut cell nucleus from origami pathogen swarms.',
    badge: 'Action',
    rating: '4.9 ★',
    plays: '280K plays',
    icon: '🦠',
    themeColor: '#10B981',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #E8DEC8 100%)',
    features: ['360° Laser Turret Aiming', 'Mutating Pathogen Swarms', 'Nucleus Shield Defense']
  },
  {
    id: 'flappy-fish',
    title: 'Flappy Fish',
    genre: 'Hydrodynamic Flapper',
    description: 'Storybook papercraft aquarium swimming. Navigate a cutout paper fish through cardboard coral pillars and collect glowing paper pearls.',
    badge: 'Arcade',
    rating: '4.8 ★',
    plays: '490K plays',
    icon: '🐠',
    themeColor: '#3B82F6',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #D8C3A5 100%)',
    features: ['Underwater Flap Kinematics', 'Glowing Coral Reef Obstacles', 'Pearl Pickups & Medals']
  },
  {
    id: 'game-2048',
    title: '2048 Paper',
    genre: 'Sliding Tile Puzzle',
    description: 'Papercraft sliding number tile challenge. Merge matching numbered craft tiles to reach the 2048 tile.',
    badge: 'Puzzle',
    rating: '4.9 ★',
    plays: '620K plays',
    icon: '🔢',
    themeColor: '#F59E0B',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #D8C3A5 100%)',
    features: ['4x4 Directional Merging', 'Craft Tiered Value Tiles', 'Undo Move & Win State']
  },
  {
    id: 'snake-eat',
    title: 'Storybook Snake',
    genre: 'Grid Action',
    description: 'Guide the papercut caterpillar across kraft paper grid to eat paper apples and golden honey fruit.',
    badge: 'Classic',
    rating: '4.9 ★',
    plays: '710K plays',
    icon: '🐛',
    themeColor: '#4A6D56',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #D8C3A5 100%)',
    features: ['Smooth Grid Kinematics', 'Speed Scaling & Growth', 'Honey Orb Combos']
  },
  {
    id: 'bug-climb',
    title: 'Ladybug Climb',
    genre: 'Reflex Climber',
    description: 'Tap Left or Right to switch sides on the cardboard tree trunk and dodge oncoming branch hazards.',
    badge: 'Fast Paced',
    rating: '4.8 ★',
    plays: '380K plays',
    icon: '🐞',
    themeColor: '#C85A32',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #E8DEC8 100%)',
    features: ['Rapid Left/Right Trunk Shifts', 'Branch Obstacle Hazards', 'Hold Space to Speed Boost']
  },
  {
    id: 'car-race',
    title: 'Vintage Speedway',
    genre: 'Traffic Racing',
    description: 'Steer origami roadster across multi-lane kraft parchment highway, throttle speed with Space, and draft cardboard traffic.',
    badge: 'High Speed',
    rating: '4.9 ★',
    plays: '520K plays',
    icon: '🚗',
    themeColor: '#C85A32',
    bannerBg: 'linear-gradient(135deg, #F4EAD4 0%, #E8DEC8 100%)',
    features: ['4-Lane Highway Shifting', 'Spacebar Speed Throttle', 'Slipstream Drafting Bonus']
  },
  {
    id: 'drift-boss',
    title: 'Drift Boss',
    genre: 'One-Tap Isometric Drifter',
    description: 'Precision timing 3D isometric cardboard road drifter. Hold to turn right, release to turn left, navigate zig-zag craft highways and collect paper coins.',
    badge: 'New',
    rating: '4.9 ★',
    plays: '380K plays',
    icon: '🏎️',
    themeColor: '#D97706',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #D8C3A5 100%)',
    features: ['One-Touch Drift Mechanics', 'Dynamic Zigzag Track Generation', 'Cardboard Vehicle Customization']
  },
  {
    id: 'helix-jump',
    title: 'Helix Jump',
    genre: 'Cardboard Tower Spiral Drop',
    description: 'Rotate the circular cardboard tower to guide your bouncing paper ball through stage openings, smash through tiered paper rings, and avoid red danger paper zones.',
    badge: 'New',
    rating: '4.9 ★',
    plays: '510K plays',
    icon: '🌀',
    themeColor: '#059669',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #D8C3A5 100%)',
    features: ['Tower Rotation Physics', 'Bouncing Splatter Trails', 'Speedy Multi-Tier Smash Drops']
  },
  {
    id: 'square-bird',
    title: 'Square Bird',
    genre: 'Stacking Platformer',
    description: 'Tap to lay square cardboard egg blocks, build stairs over deadly craft spikes, and hit fever mode for unstoppable papercraft flight.',
    badge: 'New',
    rating: '4.9 ★',
    plays: '420K plays',
    icon: '🐥',
    themeColor: '#F59E0B',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #D8C3A5 100%)',
    features: ['Square Egg Stacking', 'Precision Height Obstacle Clearance', 'Fever Dash Destruction Mode']
  },
  {
    id: 'layers-roll',
    title: 'Layers Roll',
    genre: 'Paper Ribbon Roll-and-Peel',
    description: 'Roll your origami cylinder across vibrant color paper rolls, peel layered sheets, avoid cutting scissors, and carve giant cardboard statues at the finish line.',
    badge: 'New',
    rating: '4.8 ★',
    plays: '330K plays',
    icon: '📜',
    themeColor: '#3B82F6',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #E8DEC8 100%)',
    features: ['Multi-Layer Paper Ribbon Stacking', 'Obstacle Trimming Dynamics', 'Finish Line Sculpting Multipliers']
  },
  {
    id: 'mini-battles',
    title: '12 MiniBattles',
    genre: 'Local 2-Player Paper Party',
    description: 'Chaotic head-to-head 2-player cardboard arcade duel collection. Battle friends in quick-draw showdowns, paper tank duels, soccer, and boxing with 1-button controls.',
    badge: 'Party',
    rating: '4.9 ★',
    plays: '670K plays',
    icon: '⚔️',
    themeColor: '#E11D48',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #D8C3A5 100%)',
    features: ['12 Diverse Party Minigames', 'Single-Button Local 2-Player', 'Scoreboard & Tournament Mode']
  },
  {
    id: 'dino-runner',
    title: 'Dino T-Rex Runner',
    genre: 'Prehistoric Cardboard Runner',
    description: 'The beloved offline craft dinosaur adventure. Jump over cardboard desert cacti, duck under origami pterodactyls, and survive day-and-night parchment cycles.',
    badge: 'Classic',
    rating: '4.9 ★',
    plays: '890K plays',
    icon: '🦖',
    themeColor: '#4A6D56',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #E8DEC8 100%)',
    features: ['Cardboard Jump & Duck Controls', 'Day / Night Parchment Cycles', 'Dynamic Cactus & Pterodactyl Hazards']
  },
  {
    id: 'snow-rider',
    title: 'Snow Rider',
    genre: '3D Cardboard Sledding Slope',
    description: 'Downhill 3D papercraft bobsled rush. Steer through snowy cardboard pine forests, leap off frozen ramps, and dodge origami snowmen and rolling snowballs.',
    badge: 'Winter',
    rating: '4.9 ★',
    plays: '460K plays',
    icon: '🛷',
    themeColor: '#0284C7',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #E0F2FE 100%)',
    features: ['Pseudo-3D Downhill Slope Kinematics', 'Cardboard Pine Tree & Rock Dodging', 'Gift Box Pickups & Sled Unlocks']
  },
  {
    id: 'paper-basket',
    title: 'Paper Basket',
    genre: 'Tap-Tap Arcade Shooter',
    description: 'Parabolic paper basketball shots. Tap to flap into alternating cardboard hoops, beat the shot clock, and chain clean swishes.',
    badge: 'New',
    rating: '4.9 ★',
    plays: '110K plays',
    icon: '🏀',
    themeColor: '#D97706',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #D8C3A5 100%)',
    features: ['Upward Flap Kinematics', 'Swish Streak Multipliers', 'Dynamic Shot Clock & Moving Rims']
  },
  {
    id: 'potion-merge',
    title: 'Potion Merge',
    genre: 'Physics Merge / Alchemy',
    description: 'Suika-style alchemical flask drop-and-merge. Drop bubbly papercraft potions, merge matching tiers to craft grand cosmic elixirs.',
    badge: 'New',
    rating: '4.9 ★',
    plays: '95K plays',
    icon: '🧪',
    themeColor: '#8B5CF6',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #D8C3A5 100%)',
    features: ['11-Tier Potion Crafting', 'Elastic Collision Physics', 'Dropper Aiming & Sparkle Merges']
  },
  {
    id: 'mahjong-paper',
    title: 'Mahjong Paper',
    genre: 'Solitaire Tile Matching',
    description: 'Layered cardstock mahjong solitaire. Clear multi-tiered origami animals, paper flowers, and dragon crests with free-edge matching.',
    badge: 'New',
    rating: '4.8 ★',
    plays: '130K plays',
    icon: '🀄',
    themeColor: '#E11D48',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #E8DEC8 100%)',
    features: ['Layered Cardstock Solitaire', 'Free-Edge Checking Algorithm', 'Hint, Shuffle & Undo Support']
  },
  {
    id: 'subway-runner',
    title: 'Subway Surfer',
    genre: 'Endless 3-Lane Runner',
    description: 'Endless 3-lane papercraft runner. Swipe to dodge cardboard commuter trains, jump over road barriers, slide under high signal boards, and surf on origami hoverboards.',
    badge: 'New',
    rating: '4.9 ★',
    plays: '450K plays',
    icon: '🛹',
    themeColor: '#E11D48',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #E8DEC8 100%)',
    features: ['3-Lane Perspective Kinematics', 'Jump & Slide Mechanics', 'Hoverboard Shield & Coin Magnets']
  },
  {
    id: 'prism-laser',
    title: 'Prism Laser',
    genre: 'Optics Puzzle',
    description: 'Reflect, refract, and filter colored laser beams onto target paper crystals using rotatable cardstock mirrors and triangular prisms.',
    badge: 'New',
    rating: '4.9 ★',
    plays: '260K plays',
    icon: '💎',
    themeColor: '#8B5CF6',
    bannerBg: 'linear-gradient(135deg, #FAF6EE 0%, #D8C3A5 100%)',
    features: ['45° Angle Reflection Physics', 'White Light Prism Splitting', 'Target Crystal Color Activation']
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
