/**
 * Authentic SVG gameplay preview illustrations for all 15 arcade games in 2D Papercraft theme.
 * Handmade paper aesthetic: kraft paper, construction paper cutouts, tape strips, and cardboard frames.
 */

export const GAME_SCREENSHOTS: Record<string, string> = {
  'safe-cracker': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Paper Vault Background -->
      <rect width="320" height="180" fill="#F4EAD4" />
      <rect x="8" y="8" width="304" height="164" rx="8" fill="#FFFDF8" stroke="#3E2723" stroke-width="2.5" stroke-dasharray="8 4" />

      <!-- Cardboard Safe Dial -->
      <circle cx="160" cy="95" r="58" fill="#C5A880" stroke="#3E2723" stroke-width="3" />
      <circle cx="160" cy="95" r="48" fill="#F4EAD4" stroke="#3E2723" stroke-width="2" />

      <!-- Target Arc Zones (Terracotta & Sage Paper) -->
      <path d="M 160 47 A 48 48 0 0 1 200 65" fill="none" stroke="#D97706" stroke-width="8" stroke-linecap="round" />
      <path d="M 120 125 A 48 48 0 0 1 128 65" fill="none" stroke="#059669" stroke-width="8" stroke-linecap="round" />

      <!-- Papercut Needle -->
      <line x1="160" y1="95" x2="195" y2="55" stroke="#E11D48" stroke-width="4" stroke-linecap="round" />
      <circle cx="160" cy="95" r="14" fill="#E8DEC8" stroke="#3E2723" stroke-width="2.5" />
      <circle cx="160" cy="95" r="5" fill="#3E2723" />

      <!-- Sticky Note Placard -->
      <g transform="translate(100, 15)">
        <rect x="0" y="0" width="120" height="22" rx="3" fill="#FEF08A" stroke="#3E2723" stroke-width="1.5" />
        <text x="60" y="15" text-anchor="middle" fill="#3E2723" font-family="'Patrick Hand', cursive, sans-serif" font-size="12" font-weight="bold">SAFE CRACKER</text>
      </g>
    </svg>
  `,

  'brick-blitz': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Parchment Background -->
      <rect width="320" height="180" fill="#F4EAD4" />
      <rect x="6" y="6" width="308" height="168" rx="8" fill="#FAF6EE" stroke="#3E2723" stroke-width="2" />

      <!-- Cardboard Brick Grid -->
      <!-- Row 1: Terracotta -->
      <rect x="25" y="28" width="38" height="14" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      <rect x="69" y="28" width="38" height="14" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      <rect x="113" y="28" width="38" height="14" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      <rect x="157" y="28" width="38" height="14" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      <rect x="201" y="28" width="38" height="14" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      <rect x="245" y="28" width="38" height="14" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />

      <!-- Row 2: Ochre -->
      <rect x="25" y="46" width="38" height="14" rx="2" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
      <rect x="69" y="46" width="38" height="14" rx="2" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
      <rect x="157" y="46" width="38" height="14" rx="2" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
      <rect x="201" y="46" width="38" height="14" rx="2" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
      <rect x="245" y="46" width="38" height="14" rx="2" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />

      <!-- Row 3: Sage -->
      <rect x="25" y="64" width="38" height="14" rx="2" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <rect x="69" y="64" width="38" height="14" rx="2" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <rect x="113" y="64" width="38" height="14" rx="2" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <rect x="157" y="64" width="38" height="14" rx="2" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <rect x="201" y="64" width="38" height="14" rx="2" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <rect x="245" y="64" width="38" height="14" rx="2" fill="#059669" stroke="#3E2723" stroke-width="1.5" />

      <!-- Paper Ball -->
      <circle cx="145" cy="105" r="7" fill="#E8DEC8" stroke="#3E2723" stroke-width="2" />

      <!-- Wooden Craft Stick Paddle -->
      <rect x="105" y="145" width="70" height="12" rx="6" fill="#C5A880" stroke="#3E2723" stroke-width="2.5" />
      <rect x="115" y="148" width="50" height="6" rx="3" fill="#FAF6EE" />
    </svg>
  `,

  'sky-hopper': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Layered Construction Paper Sky -->
      <rect width="320" height="180" fill="#E0F2FE" />
      <path d="M 0 180 L 0 120 Q 80 100 160 130 T 320 110 L 320 180 Z" fill="#BAE6FD" opacity="0.6" />

      <!-- Cardboard Platforms -->
      <rect x="40" y="145" width="60" height="10" rx="3" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
      <rect x="125" y="110" width="55" height="10" rx="3" fill="#059669" stroke="#3E2723" stroke-width="2" />
      <rect x="210" y="80" width="65" height="10" rx="3" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
      <rect x="90" y="45" width="50" height="10" rx="3" fill="#D97706" stroke="#3E2723" stroke-width="2" />

      <!-- Origami Hopper Character -->
      <g transform="translate(140, 65)">
        <polygon points="12,0 24,20 0,20" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <circle cx="12" cy="12" r="4" fill="#FFFDF8" stroke="#3E2723" stroke-width="1.5" />
        <circle cx="12" cy="12" r="1.5" fill="#3E2723" />
        <!-- Spring Legs -->
        <path d="M 12 20 Q 8 26 12 28 Q 16 30 12 34" fill="none" stroke="#3E2723" stroke-width="2" />
      </g>
    </svg>
  `,

  'crate-catch': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Factory Kraft Paper Background -->
      <rect width="320" height="180" fill="#F4EAD4" />
      <rect x="8" y="8" width="304" height="164" rx="6" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />

      <!-- Conveyor Tracks -->
      <line x1="0" y1="95" x2="320" y2="95" stroke="#3E2723" stroke-width="3" />
      <line x1="0" y1="150" x2="320" y2="150" stroke="#3E2723" stroke-width="4" />

      <!-- Falling Construction Crates with Tape Cross -->
      <g transform="translate(80, 45)">
        <rect x="0" y="0" width="26" height="20" rx="2" fill="#2563EB" stroke="#3E2723" stroke-width="2" />
        <line x1="0" y1="0" x2="26" y2="20" stroke="#FAF6EE" stroke-width="2" stroke-dasharray="4 2" />
        <line x1="26" y1="0" x2="0" y2="20" stroke="#FAF6EE" stroke-width="2" stroke-dasharray="4 2" />
      </g>
      <g transform="translate(190, 35)">
        <rect x="0" y="0" width="28" height="22" rx="2" fill="#D97706" stroke="#3E2723" stroke-width="2" />
        <line x1="0" y1="0" x2="28" y2="22" stroke="#3E2723" stroke-width="1.5" />
        <line x1="28" y1="0" x2="0" y2="22" stroke="#3E2723" stroke-width="1.5" />
      </g>

      <!-- Cardboard Catcher Cart -->
      <g transform="translate(135, 138)">
        <circle cx="8" cy="14" r="5" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
        <circle cx="44" cy="14" r="5" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
        <rect x="0" y="2" width="52" height="10" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <!-- Stacked Crates -->
        <rect x="6" y="-14" width="40" height="14" rx="2" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
        <rect x="10" y="-28" width="32" height="13" rx="2" fill="#2563EB" stroke="#3E2723" stroke-width="1.5" />
      </g>
    </svg>
  `,

  'type-strike': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Graph Paper Background -->
      <rect width="320" height="180" fill="#F4EAD4" />
      <line x1="160" y1="30" x2="160" y2="180" stroke="#3E2723" stroke-width="1" stroke-dasharray="4 4" opacity="0.3" />

      <!-- Origami Enemy Drones with Word Tags -->
      <g transform="translate(60, 45)">
        <polygon points="16,0 32,16 26,26 6,26 0,16" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <rect x="-8" y="-18" width="48" height="16" rx="3" fill="#FFFDF8" stroke="#3E2723" stroke-width="1.5" />
        <text x="16" y="-6" text-anchor="middle" font-family="'Patrick Hand', cursive, sans-serif" font-size="11" font-weight="bold" fill="#3E2723">PAPER</text>
      </g>
      <g transform="translate(190, 55)">
        <polygon points="16,0 32,16 26,26 6,26 0,16" fill="#059669" stroke="#3E2723" stroke-width="2" />
        <rect x="-6" y="-18" width="44" height="16" rx="3" fill="#FFFDF8" stroke="#3E2723" stroke-width="1.5" />
        <text x="16" y="-6" text-anchor="middle" font-family="'Patrick Hand', cursive, sans-serif" font-size="11" font-weight="bold" fill="#3E2723">CRAFT</text>
      </g>

      <!-- Laser Beam Strike -->
      <line x1="160" y1="160" x2="76" y2="60" stroke="#D97706" stroke-width="3" stroke-linecap="round" />

      <!-- Cardboard Command Turret -->
      <g transform="translate(140, 150)">
        <path d="M 0 25 L 10 0 L 30 0 L 40 25 Z" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
        <circle cx="20" cy="10" r="5" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      </g>
    </svg>
  `,

  'memory-cards': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Card Table Kraft Surface -->
      <rect width="320" height="180" fill="#F4EAD4" />
      <rect x="8" y="8" width="304" height="164" rx="6" fill="#FAF6EE" stroke="#3E2723" stroke-width="2" />

      <!-- 4x2 Storybook Paper Cards Grid -->
      <rect x="25" y="35" width="55" height="50" rx="6" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />
      <text x="52" y="65" text-anchor="middle" fill="#E11D48" font-size="20">🌸</text>
      <rect x="95" y="35" width="55" height="50" rx="6" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />
      <text x="122" y="65" text-anchor="middle" fill="#E11D48" font-size="20">🌸</text>

      <rect x="165" y="35" width="55" height="50" rx="6" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
      <text x="192" y="65" text-anchor="middle" fill="#3E2723" font-family="'Patrick Hand', cursive" font-size="22" font-weight="bold">?</text>
      <rect x="235" y="35" width="55" height="50" rx="6" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
      <text x="262" y="65" text-anchor="middle" fill="#3E2723" font-family="'Patrick Hand', cursive" font-size="22" font-weight="bold">?</text>

      <!-- Row 2 -->
      <rect x="25" y="95" width="55" height="50" rx="6" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
      <text x="52" y="125" text-anchor="middle" fill="#3E2723" font-family="'Patrick Hand', cursive" font-size="22" font-weight="bold">?</text>
      <rect x="95" y="95" width="55" height="50" rx="6" fill="#FFFDF8" stroke="#059669" stroke-width="2.5" />
      <text x="122" y="125" text-anchor="middle" fill="#059669" font-size="20">⭐</text>
      <rect x="165" y="95" width="55" height="50" rx="6" fill="#FFFDF8" stroke="#059669" stroke-width="2.5" />
      <text x="192" y="125" text-anchor="middle" fill="#059669" font-size="20">⭐</text>
      <rect x="235" y="95" width="55" height="50" rx="6" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
      <text x="262" y="125" text-anchor="middle" fill="#3E2723" font-family="'Patrick Hand', cursive" font-size="22" font-weight="bold">?</text>
    </svg>
  `,

  'memory-boxes': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Paper Surface -->
      <rect width="320" height="180" fill="#F4EAD4" />

      <!-- Cardboard Box Grid Tray -->
      <rect x="85" y="20" width="150" height="140" rx="8" fill="#C5A880" stroke="#3E2723" stroke-width="2.5" />

      <!-- 3x3 Paper Grid -->
      <rect x="95" y="30" width="38" height="34" rx="4" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
      <rect x="141" y="30" width="38" height="34" rx="4" fill="#FEF08A" stroke="#3E2723" stroke-width="2.5" />
      <rect x="187" y="30" width="38" height="34" rx="4" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />

      <rect x="95" y="72" width="38" height="34" rx="4" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
      <rect x="141" y="72" width="38" height="34" rx="4" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
      <rect x="187" y="72" width="38" height="34" rx="4" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />

      <rect x="95" y="114" width="38" height="34" rx="4" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
      <rect x="141" y="114" width="38" height="34" rx="4" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
      <rect x="187" y="114" width="38" height="34" rx="4" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
    </svg>
  `,

  'pop-balloon': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Sky Papercraft Background -->
      <rect width="320" height="180" fill="#F4EAD4" />

      <!-- Construction Paper Cutout Balloons with Strings -->
      <g transform="translate(60, 45)">
        <ellipse cx="16" cy="22" rx="15" ry="19" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <polygon points="16,41 12,46 20,46" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
        <path d="M 16 46 Q 12 56 18 68" stroke="#3E2723" fill="none" stroke-width="1.5" />
      </g>
      <g transform="translate(140, 30)">
        <ellipse cx="16" cy="22" rx="15" ry="19" fill="#059669" stroke="#3E2723" stroke-width="2" />
        <polygon points="16,41 12,46 20,46" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
        <path d="M 16 46 Q 20 58 14 70" stroke="#3E2723" fill="none" stroke-width="1.5" />
      </g>
      <g transform="translate(220, 60)">
        <ellipse cx="16" cy="22" rx="15" ry="19" fill="#D97706" stroke="#3E2723" stroke-width="2" />
        <polygon points="16,41 12,46 20,46" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
        <path d="M 16 46 Q 14 56 18 66" stroke="#3E2723" fill="none" stroke-width="1.5" />
      </g>

      <!-- Cardboard Spike Bomb Hazard -->
      <g transform="translate(170, 95)">
        <circle cx="14" cy="14" r="11" fill="#3E2723" stroke="#E11D48" stroke-width="2" />
        <circle cx="14" cy="14" r="4" fill="#D97706" />
      </g>
    </svg>
  `,

  'space-racer': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Deep Blue Construction Paper Starfield -->
      <rect width="320" height="180" fill="#1E293B" />
      <!-- Paper Cutout Stars -->
      <circle cx="40" cy="30" r="2" fill="#FEF08A" />
      <circle cx="120" cy="20" r="2.5" fill="#FEF08A" />
      <circle cx="200" cy="40" r="1.5" fill="#FEF08A" />
      <circle cx="280" cy="25" r="2" fill="#FEF08A" />

      <!-- Cardboard Asteroid -->
      <polygon points="70,110 85,98 100,112 88,126 68,120" fill="#C5A880" stroke="#3E2723" stroke-width="2" />

      <!-- Papercraft Boost Gate -->
      <path d="M 115 125 Q 160 85 205 125" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round" />

      <!-- Papercraft Delta Ship -->
      <g transform="translate(146, 125)">
        <polygon points="14,0 0,28 14,22 28,28" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <polygon points="14,6 4,24 14,20 24,24" fill="#FAF6EE" />
      </g>
    </svg>
  `,

  'virus-defense': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Petri Dish Cardboard Background -->
      <rect width="320" height="180" fill="#F4EAD4" />
      <circle cx="160" cy="95" r="70" fill="#FFFDF8" stroke="#3E2723" stroke-width="3" />

      <!-- Central Nucleus -->
      <circle cx="160" cy="95" r="26" fill="#059669" stroke="#3E2723" stroke-width="2" />
      <circle cx="160" cy="95" r="12" fill="#E8DEC8" />

      <!-- Cardboard Turret -->
      <line x1="160" y1="95" x2="200" y2="65" stroke="#3E2723" stroke-width="4" stroke-linecap="round" />

      <!-- Origami Pathogens Swarm -->
      <circle cx="245" cy="45" r="8" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="75" cy="80" r="7" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="130" cy="145" r="7" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
    </svg>
  `,

  'flappy-fish': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Water Paper Background -->
      <rect width="320" height="180" fill="#F4EAD4" />

      <!-- Cardboard Coral Pillars -->
      <rect x="220" y="0" width="34" height="60" rx="3" fill="#059669" stroke="#3E2723" stroke-width="2.5" />
      <rect x="220" y="120" width="34" height="60" rx="3" fill="#E11D48" stroke="#3E2723" stroke-width="2.5" />

      <!-- Paper Goldfish -->
      <g transform="translate(100, 85)">
        <ellipse cx="14" cy="10" rx="14" ry="10" fill="#D97706" stroke="#3E2723" stroke-width="2" />
        <polygon points="0,10 -8,4 -8,16" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
        <circle cx="20" cy="8" r="2.5" fill="#FFFDF8" stroke="#3E2723" stroke-width="1" />
      </g>
    </svg>
  `,

  'game-2048': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Background -->
      <rect width="320" height="180" fill="#F4EAD4" />

      <!-- 4x4 Cardboard Board -->
      <g transform="translate(95, 25)">
        <rect x="0" y="0" width="130" height="130" rx="8" fill="#C5A880" stroke="#3E2723" stroke-width="2.5" />

        <rect x="6" y="6" width="26" height="26" rx="3" fill="#FFFDF8" stroke="#3E2723" stroke-width="1.5" />
        <text x="19" y="23" text-anchor="middle" fill="#3E2723" font-family="'Patrick Hand', cursive" font-size="12" font-weight="bold">2</text>
        <rect x="36" y="6" width="26" height="26" rx="3" fill="#FEF08A" stroke="#3E2723" stroke-width="1.5" />
        <text x="49" y="23" text-anchor="middle" fill="#3E2723" font-family="'Patrick Hand', cursive" font-size="12" font-weight="bold">4</text>
        <rect x="66" y="6" width="26" height="26" rx="3" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
        <text x="79" y="23" text-anchor="middle" fill="#FFFDF8" font-family="'Patrick Hand', cursive" font-size="12" font-weight="bold">8</text>
        <rect x="96" y="6" width="26" height="26" rx="3" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
        <text x="109" y="23" text-anchor="middle" fill="#FFFDF8" font-family="'Patrick Hand', cursive" font-size="11" font-weight="bold">16</text>

        <rect x="6" y="36" width="26" height="26" rx="3" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
        <text x="19" y="53" text-anchor="middle" fill="#FFFDF8" font-family="'Patrick Hand', cursive" font-size="11" font-weight="bold">32</text>
        <rect x="36" y="36" width="26" height="26" rx="3" fill="#2563EB" stroke="#3E2723" stroke-width="1.5" />
        <text x="49" y="53" text-anchor="middle" fill="#FFFDF8" font-family="'Patrick Hand', cursive" font-size="11" font-weight="bold">64</text>
        <rect x="66" y="36" width="26" height="26" rx="3" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
        <text x="79" y="53" text-anchor="middle" fill="#3E2723" font-family="'Patrick Hand', cursive" font-size="9" font-weight="bold">2048</text>
      </g>
    </svg>
  `,

  'snake-eat': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Grid Paper Background -->
      <rect width="320" height="180" fill="#F4EAD4" />
      <rect x="10" y="10" width="300" height="160" fill="#FAF6EE" stroke="#3E2723" stroke-width="2" />

      <!-- Apple & Golden Food -->
      <circle cx="240" cy="70" r="8" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="90" cy="120" r="8" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />

      <!-- Paper Caterpillar Body -->
      <circle cx="90" cy="80" r="8" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="106" cy="80" r="8" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="122" cy="80" r="8" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="138" cy="80" r="8" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="154" cy="80" r="8" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
      <!-- Caterpillar Head with Eyes -->
      <circle cx="170" cy="80" r="9" fill="#047857" stroke="#3E2723" stroke-width="2" />
      <circle cx="173" cy="77" r="2" fill="#FFFDF8" stroke="#3E2723" stroke-width="1" />
    </svg>
  `,

  'bug-climb': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Background -->
      <rect width="320" height="180" fill="#F4EAD4" />

      <!-- Cardboard Tree Trunk -->
      <rect x="135" y="0" width="50" height="180" fill="#C5A880" stroke="#3E2723" stroke-width="2.5" />

      <!-- Cardboard Branches with Foliage -->
      <rect x="55" y="50" width="80" height="14" rx="3" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
      <circle cx="50" cy="57" r="12" fill="#059669" stroke="#3E2723" stroke-width="1.5" />

      <rect x="185" y="110" width="80" height="14" rx="3" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
      <circle cx="270" cy="117" r="12" fill="#059669" stroke="#3E2723" stroke-width="1.5" />

      <!-- Paper Ladybug on Trunk -->
      <g transform="translate(112, 105)">
        <ellipse cx="12" cy="15" rx="12" ry="15" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <circle cx="8" cy="10" r="2" fill="#3E2723" />
        <circle cx="16" cy="10" r="2" fill="#3E2723" />
        <circle cx="12" cy="20" r="2" fill="#3E2723" />
      </g>
    </svg>
  `,

  'car-race': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Background -->
      <rect width="320" height="180" fill="#F4EAD4" />

      <!-- Highway Road Surface -->
      <rect x="50" y="0" width="220" height="180" fill="#E8DEC8" stroke="#3E2723" stroke-width="2.5" />
      <line x1="105" y1="0" x2="105" y2="180" stroke="#D97706" stroke-width="2" stroke-dasharray="12 10" />
      <line x1="160" y1="0" x2="160" y2="180" stroke="#3E2723" stroke-width="2" stroke-dasharray="12 10" />
      <line x1="215" y1="0" x2="215" y2="180" stroke="#D97706" stroke-width="2" stroke-dasharray="12 10" />

      <!-- Cardboard Traffic Vehicles -->
      <rect x="68" y="25" width="24" height="40" rx="3" fill="#D97706" stroke="#3E2723" stroke-width="2" />
      <rect x="178" y="45" width="22" height="34" rx="3" fill="#2563EB" stroke="#3E2723" stroke-width="2" />

      <!-- Origami Red Roadster -->
      <g transform="translate(124, 115)">
        <rect x="0" y="0" width="20" height="38" rx="4" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <rect x="3" y="10" width="14" height="10" rx="2" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
      </g>
    </svg>
  `,

  'drift-boss': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Background -->
      <rect width="320" height="180" fill="#F4EAD4" />
      <rect x="8" y="8" width="304" height="164" rx="6" fill="#FAF6EE" stroke="#3E2723" stroke-width="2" />

      <!-- Isometric Cardboard Zig-Zag Platforms -->
      <polygon points="60,140 160,80 200,105 100,165" fill="#D8C3A5" stroke="#3E2723" stroke-width="2.5" />
      <polygon points="160,80 260,20 300,45 200,105" fill="#C5A880" stroke="#3E2723" stroke-width="2.5" />
      <polygon points="100,165 200,105 200,120 100,180" fill="#9C7A53" stroke="#3E2723" stroke-width="2" />
      <polygon points="200,105 300,45 300,60 200,120" fill="#84623C" stroke="#3E2723" stroke-width="2" />

      <!-- Paper Coin -->
      <circle cx="210" cy="55" r="8" fill="#F59E0B" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="210" cy="55" r="5" fill="#FEF08A" stroke="#3E2723" stroke-width="1" />

      <!-- Isometric Drifting Car -->
      <g transform="translate(135, 95) rotate(-30)">
        <rect x="0" y="0" width="28" height="16" rx="3" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <rect x="6" y="3" width="12" height="10" rx="2" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
        <!-- Skid marks -->
        <line x1="-12" y1="2" x2="-2" y2="2" stroke="#D97706" stroke-width="2" stroke-dasharray="3 2" />
        <line x1="-12" y1="14" x2="-2" y2="14" stroke="#D97706" stroke-width="2" stroke-dasharray="3 2" />
      </g>
    </svg>
  `,

  'helix-jump': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Dark Craft Background -->
      <rect width="320" height="180" fill="#FAF6EE" />

      <!-- Central Cardboard Pole Column -->
      <rect x="145" y="0" width="30" height="180" fill="#C5A880" stroke="#3E2723" stroke-width="2.5" />
      <line x1="160" y1="0" x2="160" y2="180" stroke="#FAF6EE" stroke-width="1.5" stroke-dasharray="6 6" />

      <!-- Tier 1 Platforms (Green Cardstock) -->
      <ellipse cx="160" cy="140" rx="70" ry="20" fill="#059669" stroke="#3E2723" stroke-width="2.5" />
      <!-- Gap in Tier 1 -->
      <path d="M 160 140 L 215 152 A 70 20 0 0 1 180 160 Z" fill="#FAF6EE" />

      <!-- Tier 2 Platforms (Ochre + Red Danger Zone) -->
      <ellipse cx="160" cy="90" rx="65" ry="18" fill="#D97706" stroke="#3E2723" stroke-width="2.5" />
      <!-- Red Hazard Segment -->
      <path d="M 160 90 L 105 100 A 65 18 0 0 1 125 74 Z" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
      <!-- Gap in Tier 2 -->
      <path d="M 160 90 L 160 108 A 65 18 0 0 1 195 104 Z" fill="#FAF6EE" />

      <!-- Tier 3 Platform (Top) -->
      <ellipse cx="160" cy="40" rx="60" ry="16" fill="#059669" stroke="#3E2723" stroke-width="2.5" />

      <!-- Bouncing Paper Ball with Splash Trail -->
      <circle cx="160" cy="65" r="9" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
      <circle cx="160" cy="90" r="14" fill="#E11D48" opacity="0.3" />
    </svg>
  `,

  'square-bird': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Sky Parchment Background -->
      <rect width="320" height="180" fill="#FAF6EE" />

      <!-- Ground Kraft Surface -->
      <rect x="0" y="145" width="320" height="35" fill="#D8C3A5" stroke="#3E2723" stroke-width="2.5" />
      <line x1="0" y1="145" x2="320" y2="145" stroke="#3E2723" stroke-width="2" />

      <!-- Cardboard Spike Barrier Obstacles -->
      <rect x="220" y="85" width="30" height="60" rx="3" fill="#C85A32" stroke="#3E2723" stroke-width="2" />
      <polygon points="220,85 235,65 250,85" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />

      <!-- Stack of Square Eggs -->
      <rect x="80" y="125" width="22" height="20" rx="3" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />
      <rect x="80" y="105" width="22" height="20" rx="3" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />
      <rect x="80" y="85" width="22" height="20" rx="3" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />

      <!-- Square Bird Character on Top -->
      <rect x="80" y="62" width="22" height="22" rx="4" fill="#F59E0B" stroke="#3E2723" stroke-width="2" />
      <circle cx="96" cy="70" r="3" fill="#FFFDF8" stroke="#3E2723" stroke-width="1" />
      <circle cx="97" cy="70" r="1.5" fill="#3E2723" />
      <!-- Beak -->
      <polygon points="102,72 108,75 102,78" fill="#E11D48" stroke="#3E2723" stroke-width="1" />
      <!-- Comb -->
      <polygon points="85,62 88,56 93,62" fill="#E11D48" stroke="#3E2723" stroke-width="1" />
    </svg>
  `,

  'layers-roll': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Background -->
      <rect width="320" height="180" fill="#FAF6EE" />
      <rect x="6" y="6" width="308" height="168" rx="8" fill="#F4EAD4" stroke="#3E2723" stroke-width="2" />

      <!-- Runway Tracks with Colored Paper Layers -->
      <polygon points="30,170 110,40 210,40 290,170" fill="#E8DEC8" stroke="#3E2723" stroke-width="2" />

      <!-- Color Paper Strips on Runway -->
      <polygon points="80,140 120,70 150,70 125,140" fill="#3B82F6" opacity="0.8" />
      <polygon points="140,140 160,70 190,70 185,140" fill="#E11D48" opacity="0.8" />

      <!-- Cardboard Scissors Hazard -->
      <g transform="translate(195, 80) rotate(25)">
        <ellipse cx="0" cy="0" rx="14" ry="4" fill="#C5A880" stroke="#3E2723" stroke-width="1.5" />
        <ellipse cx="0" cy="6" rx="14" ry="4" fill="#C5A880" stroke="#3E2723" stroke-width="1.5" />
      </g>

      <!-- Giant Rolling Paper Cylinder -->
      <g transform="translate(145, 120)">
        <ellipse cx="15" cy="18" rx="28" ry="18" fill="#D97706" stroke="#3E2723" stroke-width="2.5" />
        <ellipse cx="15" cy="18" rx="20" ry="12" fill="#3B82F6" stroke="#3E2723" stroke-width="2" />
        <ellipse cx="15" cy="18" rx="12" ry="7" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
        <circle cx="15" cy="18" r="4" fill="#FFFDF8" stroke="#3E2723" stroke-width="1" />
      </g>
    </svg>
  `,

  'mini-battles': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Arena Kraft Split View Background -->
      <rect width="320" height="180" fill="#FAF6EE" />
      <rect x="10" y="10" width="145" height="160" rx="6" fill="#FEE2E2" stroke="#3E2723" stroke-width="2" />
      <rect x="165" y="10" width="145" height="160" rx="6" fill="#DBEAFE" stroke="#3E2723" stroke-width="2" />

      <!-- Center Divider Tape -->
      <line x1="160" y1="0" x2="160" y2="180" stroke="#D97706" stroke-width="3" stroke-dasharray="6 4" />

      <!-- Player 1: Red Cardboard Cowboy/Tank -->
      <g transform="translate(60, 80)">
        <rect x="0" y="0" width="34" height="24" rx="4" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <line x1="34" y1="12" x2="52" y2="12" stroke="#3E2723" stroke-width="3" stroke-linecap="round" />
        <circle cx="17" cy="12" r="6" fill="#FFFDF8" stroke="#3E2723" stroke-width="1.5" />
        <text x="17" y="-8" text-anchor="middle" font-family="'Patrick Hand', cursive" font-size="12" font-weight="bold" fill="#E11D48">P1 [TAP]</text>
      </g>

      <!-- Player 2: Blue Cardboard Cowboy/Tank -->
      <g transform="translate(225, 80)">
        <rect x="0" y="0" width="34" height="24" rx="4" fill="#2563EB" stroke="#3E2723" stroke-width="2" />
        <line x1="0" y1="12" x2="-18" y2="12" stroke="#3E2723" stroke-width="3" stroke-linecap="round" />
        <circle cx="17" cy="12" r="6" fill="#FFFDF8" stroke="#3E2723" stroke-width="1.5" />
        <text x="17" y="-8" text-anchor="middle" font-family="'Patrick Hand', cursive" font-size="12" font-weight="bold" fill="#2563EB">P2 [TAP]</text>
      </g>

      <!-- Mid-air Flying Paper Bullet & Star Clash -->
      <circle cx="150" cy="92" r="4" fill="#D97706" stroke="#3E2723" stroke-width="1" />
      <polygon points="160,86 163,91 169,92 164,96 166,101 160,98 154,101 156,96 151,92 157,91" fill="#FEF08A" stroke="#3E2723" stroke-width="1" />
    </svg>
  `,

  'dino-runner': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft Desert Parchment Background -->
      <rect width="320" height="180" fill="#FAF6EE" />

      <!-- Distant Paper Sun & Cloud -->
      <circle cx="270" cy="35" r="14" fill="#F59E0B" stroke="#3E2723" stroke-width="1.5" />
      <ellipse cx="80" cy="40" rx="20" ry="8" fill="#FFFDF8" stroke="#3E2723" stroke-width="1.5" />

      <!-- Desert Horizon Line with Cardboard Stipples -->
      <line x1="0" y1="140" x2="320" y2="140" stroke="#3E2723" stroke-width="2" />
      <line x1="40" y1="148" x2="70" y2="148" stroke="#C5A880" stroke-width="1.5" />
      <line x1="140" y1="152" x2="190" y2="152" stroke="#C5A880" stroke-width="1.5" />

      <!-- Cardboard Cacti Hazards -->
      <g transform="translate(230, 105)">
        <rect x="8" y="0" width="6" height="35" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
        <path d="M 2 12 L 8 12 L 8 18 L 2 18 Z" fill="#059669" stroke="#3E2723" stroke-width="1" />
        <path d="M 14 8 L 20 8 L 20 16 L 14 16 Z" fill="#059669" stroke="#3E2723" stroke-width="1" />
      </g>

      <!-- Origami Pterodactyl in Flight -->
      <g transform="translate(160, 65)">
        <polygon points="0,8 14,0 18,6 26,4 16,12 8,10" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
      </g>

      <!-- Cardboard T-Rex Dinosaur Running -->
      <g transform="translate(60, 95)">
        <!-- Head & Jaw -->
        <rect x="18" y="0" width="16" height="14" rx="2" fill="#4A6D56" stroke="#3E2723" stroke-width="2" />
        <circle cx="28" cy="4" r="2" fill="#FAF6EE" />
        <!-- Body & Short Arm -->
        <rect x="8" y="12" width="16" height="20" rx="3" fill="#4A6D56" stroke="#3E2723" stroke-width="2" />
        <rect x="22" y="16" width="6" height="3" fill="#4A6D56" stroke="#3E2723" stroke-width="1" />
        <!-- Tail -->
        <polygon points="8,16 0,22 8,26" fill="#4A6D56" stroke="#3E2723" stroke-width="1.5" />
        <!-- Legs -->
        <rect x="10" y="32" width="4" height="13" fill="#3E2723" />
        <rect x="18" y="32" width="4" height="10" fill="#3E2723" />
      </g>
    </svg>
  `,

  'snow-rider': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Winter Cardboard Mountain Sky -->
      <rect width="320" height="180" fill="#E0F2FE" />

      <!-- Mountain Slopes in Background -->
      <polygon points="0,180 80,60 160,180" fill="#BAE6FD" stroke="#3E2723" stroke-width="1.5" />
      <polygon points="120,180 220,40 320,180" fill="#E0F2FE" stroke="#3E2723" stroke-width="1.5" />

      <!-- 3D Downhill Snow Slope -->
      <polygon points="0,180 120,70 200,70 320,180" fill="#FFFDF8" stroke="#3E2723" stroke-width="2.5" />

      <!-- Cardboard Snow Pine Trees -->
      <g transform="translate(60, 90)">
        <polygon points="15,0 0,22 30,22" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
        <polygon points="15,14 2,36 28,36" fill="#047857" stroke="#3E2723" stroke-width="1.5" />
        <rect x="12" y="36" width="6" height="10" fill="#84623C" stroke="#3E2723" stroke-width="1" />
      </g>
      <g transform="translate(230, 80)">
        <polygon points="12,0 0,18 24,18" fill="#059669" stroke="#3E2723" stroke-width="1.5" />
        <polygon points="12,12 2,30 22,30" fill="#047857" stroke="#3E2723" stroke-width="1.5" />
        <rect x="9" y="30" width="6" height="8" fill="#84623C" stroke="#3E2723" stroke-width="1" />
      </g>

      <!-- Wrapped Gift Box Pickup -->
      <g transform="translate(190, 125)">
        <rect x="0" y="0" width="16" height="14" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
        <line x1="8" y1="0" x2="8" y2="14" stroke="#FEF08A" stroke-width="2" />
        <line x1="0" y1="7" x2="16" y2="7" stroke="#FEF08A" stroke-width="2" />
      </g>

      <!-- Origami Sled Rider Descending -->
      <g transform="translate(140, 130)">
        <!-- Sled Runners -->
        <path d="M -4 16 L 36 16 Q 42 16 40 10" fill="none" stroke="#C85A32" stroke-width="3" />
        <rect x="4" y="8" width="28" height="6" rx="2" fill="#D97706" stroke="#3E2723" stroke-width="1.5" />
        <!-- Rider in Blue Parka -->
        <circle cx="16" cy="-2" r="6" fill="#0284C7" stroke="#3E2723" stroke-width="1.5" />
        <rect x="10" y="4" width="16" height="8" rx="2" fill="#E11D48" stroke="#3E2723" stroke-width="1.5" />
      </g>
    </svg>
  `,

  'paper-basket': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Gym Kraft Paper Court Background -->
      <rect width="320" height="180" fill="#FAF6EE" />
      <rect x="8" y="8" width="304" height="164" rx="6" fill="#F4EAD4" stroke="#3E2723" stroke-width="2" />

      <!-- Cardboard Basketball Hoop Backboard & Rim -->
      <g transform="translate(240, 45)">
        <rect x="0" y="0" width="12" height="65" rx="2" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />
        <rect x="2" y="15" width="8" height="25" rx="1" fill="#E11D48" stroke="#3E2723" stroke-width="1" />
        <!-- Rim & Net -->
        <line x1="-30" y1="40" x2="0" y2="40" stroke="#D97706" stroke-width="3" stroke-linecap="round" />
        <polygon points="-30,40 -24,65 -6,65 0,40" fill="none" stroke="#3E2723" stroke-width="1.5" stroke-dasharray="3 2" />
      </g>

      <!-- Parabolic Shot Trajectory Dots -->
      <path d="M 80 130 Q 150 20 225 75" fill="none" stroke="#D97706" stroke-width="2" stroke-dasharray="4 4" />

      <!-- Paper Basketball in Flight with Flap Wings -->
      <g transform="translate(150, 45)">
        <circle cx="14" cy="14" r="14" fill="#EA580C" stroke="#3E2723" stroke-width="2" />
        <line x1="0" y1="14" x2="28" y2="14" stroke="#3E2723" stroke-width="1.5" />
        <line x1="14" y1="0" x2="14" y2="28" stroke="#3E2723" stroke-width="1.5" />
        <!-- Wings -->
        <polygon points="0,8 -10,0 2,2" fill="#FFFDF8" stroke="#3E2723" stroke-width="1" />
        <polygon points="28,8 38,0 26,2" fill="#FFFDF8" stroke="#3E2723" stroke-width="1" />
      </g>
    </svg>
  `,

  'potion-merge': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Gem Vault Parchment Desk Background -->
      <rect width="320" height="180" fill="#FAF6EE" />

      <!-- Cardboard Vault Container Frame -->
      <rect x="75" y="25" width="170" height="140" rx="4" fill="#F4EAD4" stroke="#2B2118" stroke-width="3" />

      <!-- Dropper Guideline at Top -->
      <line x1="160" y1="5" x2="160" y2="35" stroke="#2B2118" stroke-width="2" stroke-dasharray="3,3" />
      <polygon points="152,10 168,10 160,25" fill="#8B5CF6" stroke="#2B2118" stroke-width="1.5" />

      <!-- Faceted Papercraft Gemstones Inside Vault -->
      <!-- Small Quartz Diamond -->
      <polygon points="105,130 118,142 105,154 92,142" fill="#E2E8F0" stroke="#2B2118" stroke-width="2" />
      <polygon points="105,135 113,142 105,149 97,142" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1" />

      <!-- Medium Amber Citrine Hexagon -->
      <polygon points="148,126 160,120 172,126 172,140 160,146 148,140" fill="#FDE047" stroke="#2B2118" stroke-width="2" />
      <polygon points="152,129 160,124 168,129 168,137 160,141 152,137" fill="#EAB308" stroke="#CA8A04" stroke-width="1" />

      <!-- Large Ruby Core Faceted Diamond -->
      <polygon points="205,100 230,125 205,150 180,125" fill="#FDA4AF" stroke="#2B2118" stroke-width="2.5" />
      <polygon points="205,110 220,125 205,140 190,125" fill="#F43F5E" stroke="#BE123C" stroke-width="1.5" />
      <circle cx="196" cy="115" r="3" fill="#FFFFFF" />

      <!-- Sparkle Star Accent -->
      <path d="M 125 75 L 128 82 L 135 85 L 128 88 L 125 95 L 122 88 L 115 85 L 122 82 Z" fill="#F59E0B" />
    </svg>
  `,

  'mahjong-paper': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Tatami Kraft Table Surface -->
      <rect width="320" height="180" fill="#FAF6EE" />
      <rect x="10" y="10" width="300" height="160" rx="8" fill="#F4EAD4" stroke="#3E2723" stroke-width="2" />

      <!-- Multi-tier Mahjong Cardstock Tiles -->
      <!-- Bottom Layer (Dimmed Shadow) -->
      <rect x="50" y="35" width="45" height="55" rx="4" fill="#D8C3A5" stroke="#3E2723" stroke-width="2" />
      <text x="72" y="70" text-anchor="middle" font-size="20">🎋</text>

      <rect x="105" y="35" width="45" height="55" rx="4" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />
      <text x="127" y="70" text-anchor="middle" font-size="20">🀄</text>

      <rect x="165" y="35" width="45" height="55" rx="4" fill="#FFFDF8" stroke="#3E2723" stroke-width="2" />
      <text x="187" y="70" text-anchor="middle" font-size="20">🀄</text>

      <rect x="220" y="35" width="45" height="55" rx="4" fill="#D8C3A5" stroke="#3E2723" stroke-width="2" />
      <text x="242" y="70" text-anchor="middle" font-size="20">🌸</text>

      <!-- Top Layer Tier Tiles with Highlight Outline -->
      <rect x="85" y="80" width="48" height="58" rx="4" fill="#FFFDF8" stroke="#E11D48" stroke-width="2.5" />
      <text x="109" y="118" text-anchor="middle" font-size="22">🐉</text>

      <rect x="145" y="80" width="48" height="58" rx="4" fill="#FFFDF8" stroke="#059669" stroke-width="2.5" />
      <text x="169" y="118" text-anchor="middle" font-size="22">🀅</text>

      <rect x="205" y="80" width="48" height="58" rx="4" fill="#FFFDF8" stroke="#E11D48" stroke-width="2.5" />
      <text x="229" y="118" text-anchor="middle" font-size="22">🐉</text>
    </svg>
  `,

  'subway-runner': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Kraft City Skyline Background -->
      <rect width="320" height="180" fill="#FAF6EE" />
      <polygon points="20,80 50,40 80,80" fill="#D8C3A5" stroke="#3E2723" stroke-width="1.5" />
      <rect x="100" y="30" width="40" height="50" fill="#C5A880" stroke="#3E2723" stroke-width="1.5" />

      <!-- 3-Lane Perspective Railroad Tracks -->
      <polygon points="0,180 120,75 200,75 320,180" fill="#E8DEC8" stroke="#3E2723" stroke-width="2.5" />
      <line x1="106" y1="180" x2="147" y2="75" stroke="#3E2723" stroke-width="2" stroke-dasharray="6 4" />
      <line x1="214" y1="180" x2="173" y2="75" stroke="#3E2723" stroke-width="2" stroke-dasharray="6 4" />

      <!-- Cardboard Train in Right Lane -->
      <g transform="translate(195, 80)">
        <rect x="0" y="0" width="48" height="55" rx="4" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <rect x="6" y="8" width="36" height="16" rx="2" fill="#FAF6EE" stroke="#3E2723" stroke-width="1" />
        <circle cx="14" cy="40" r="4" fill="#FEF08A" />
        <circle cx="34" cy="40" r="4" fill="#FEF08A" />
      </g>

      <!-- Road Barrier in Left Lane -->
      <g transform="translate(70, 125)">
        <rect x="0" y="0" width="38" height="16" rx="2" fill="#F59E0B" stroke="#3E2723" stroke-width="1.5" />
        <line x1="0" y1="0" x2="38" y2="16" stroke="#3E2723" stroke-width="1.5" />
      </g>

      <!-- Origami Runner on Hoverboard in Center Lane -->
      <g transform="translate(145, 120)">
        <!-- Hoverboard -->
        <ellipse cx="15" cy="38" rx="22" ry="6" fill="#059669" stroke="#3E2723" stroke-width="2" />
        <!-- Skater Body -->
        <circle cx="15" cy="4" r="7" fill="#C5A880" stroke="#3E2723" stroke-width="1.5" />
        <rect x="7" y="11" width="16" height="18" rx="3" fill="#2563EB" stroke="#3E2723" stroke-width="1.5" />
      </g>
    </svg>
  `,

  'prism-laser': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Dark Optics Paper Background -->
      <rect width="320" height="180" fill="#2B2118" />
      <rect x="6" y="6" width="308" height="168" rx="6" fill="#1F1610" stroke="#FAF6EE" stroke-width="1.5" stroke-dasharray="8 4" />

      <!-- Laser Emitter (Top Left) -->
      <rect x="30" y="30" width="22" height="18" rx="3" fill="#FAF6EE" stroke="#3E2723" stroke-width="1.5" />
      <circle cx="48" cy="39" r="4" fill="#E11D48" />

      <!-- Red Laser Beam Path -->
      <line x1="48" y1="39" x2="160" y2="39" stroke="#E11D48" stroke-width="3" stroke-linecap="round" />
      <line x1="160" y1="39" x2="160" y2="110" stroke="#E11D48" stroke-width="3" stroke-linecap="round" />

      <!-- 45° Cardboard Mirror -->
      <g transform="translate(160, 39) rotate(45)">
        <rect x="-16" y="-3" width="32" height="6" rx="2" fill="#C5A880" stroke="#FAF6EE" stroke-width="1.5" />
      </g>

      <!-- Glass Prism Splitting Light -->
      <polygon points="160,110 140,145 180,145" fill="#BAE6FD" opacity="0.8" stroke="#FAF6EE" stroke-width="2" />

      <!-- Split Refracted Beams (Cyan & Magenta) -->
      <line x1="150" y1="145" x2="110" y2="160" stroke="#06B6D4" stroke-width="2.5" />
      <line x1="170" y1="145" x2="220" y2="160" stroke="#A855F7" stroke-width="2.5" />

      <!-- Target Paper Crystal Pickups -->
      <polygon points="110,152 118,160 110,168 102,160" fill="#06B6D4" stroke="#FAF6EE" stroke-width="1.5" />
      <polygon points="220,152 228,160 220,168 212,160" fill="#A855F7" stroke="#FAF6EE" stroke-width="1.5" />
    </svg>
  `,

  'rainbow-draw': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Dark Sketchbook Background -->
      <rect width="320" height="180" fill="#181824" />
      <circle cx="160" cy="90" r="140" fill="#222232" opacity="0.4" />

      <!-- Glowing Rainbow Ribbon Curve -->
      <path d="M 30 130 Q 110 40 180 110 T 290 80" fill="none" stroke="#FF5E7E" stroke-width="8" stroke-linecap="round" />
      <path d="M 30 130 Q 110 40 180 110 T 290 80" fill="none" stroke="#FFA41B" stroke-width="6" stroke-linecap="round" />
      <path d="M 30 130 Q 110 40 180 110 T 290 80" fill="none" stroke="#00D2D3" stroke-width="4" stroke-linecap="round" />
      <path d="M 30 130 Q 110 40 180 110 T 290 80" fill="none" stroke="#54A0FF" stroke-width="2" stroke-linecap="round" />

      <!-- Falling Paper Balls -->
      <circle cx="110" cy="50" r="9" fill="#FFFDF8" stroke="#FF5E7E" stroke-width="2" />
      <circle cx="110" cy="50" r="4" fill="#FFA41B" />
      <circle cx="210" cy="85" r="9" fill="#FFFDF8" stroke="#00D2D3" stroke-width="2" />

      <!-- Target Goal Basket -->
      <path d="M 260 120 L 275 145 L 305 145 L 320 120" fill="none" stroke="#54A0FF" stroke-width="3" stroke-dasharray="4 3" />
      <polygon points="280,135 290,125 300,135" fill="#FEF08A" />
    </svg>
  `,

  'firework-pop': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Midnight Sky Background -->
      <rect width="320" height="180" fill="#0c1021" />

      <!-- Crescent Moon & Stars -->
      <path d="M 280 25 A 16 16 0 0 0 295 45 A 18 18 0 1 1 280 25 Z" fill="#FEF08A" />
      <circle cx="50" cy="40" r="1.5" fill="#FFFDF8" />
      <circle cx="120" cy="25" r="1.5" fill="#FFFDF8" />
      <circle cx="230" cy="65" r="1.5" fill="#FFFDF8" />

      <!-- Big Exploded Firework Burst -->
      <g transform="translate(160, 70)">
        <circle cx="0" cy="0" r="38" fill="none" stroke="#FF6B6B" stroke-width="2" stroke-dasharray="6 6" />
        <circle cx="0" cy="0" r="22" fill="none" stroke="#4ECDC4" stroke-width="2" stroke-dasharray="4 4" />
        <line x1="0" y1="-30" x2="0" y2="-45" stroke="#FFE66D" stroke-width="3" stroke-linecap="round" />
        <line x1="21" y1="-21" x2="32" y2="-32" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round" />
        <line x1="30" y1="0" x2="45" y2="0" stroke="#4ECDC4" stroke-width="3" stroke-linecap="round" />
        <line x1="21" y1="21" x2="32" y2="32" stroke="#1A535C" stroke-width="3" stroke-linecap="round" />
        <line x1="-21" y1="-21" x2="-32" y2="-32" stroke="#FF6B6B" stroke-width="3" stroke-linecap="round" />
        <line x1="-30" y1="0" x2="-45" y2="0" stroke="#FFE66D" stroke-width="3" stroke-linecap="round" />
        <circle cx="0" cy="0" r="8" fill="#FFFDF8" />
      </g>

      <!-- Rising Rockets -->
      <g transform="translate(70, 120)">
        <polygon points="0,-12 6,8 -6,8" fill="#FF6B6B" stroke="#3E2723" stroke-width="1" />
        <line x1="0" y1="8" x2="0" y2="28" stroke="#FFE66D" stroke-width="2" stroke-dasharray="4 2" />
      </g>
      <g transform="translate(240, 110)">
        <polygon points="0,-12 6,8 -6,8" fill="#4ECDC4" stroke="#3E2723" stroke-width="1" />
        <line x1="0" y1="8" x2="0" y2="32" stroke="#FFE66D" stroke-width="2" stroke-dasharray="4 2" />
      </g>
    </svg>
  `,

  'fruit-flood': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Parchment Table Background -->
      <rect width="320" height="180" fill="#FAF6EE" />

      <!-- Grid of Fruit Tiles -->
      <g transform="translate(75, 20)">
        <!-- Row 0 -->
        <rect x="0" y="0" width="26" height="26" rx="4" fill="#FF6B6B" stroke="#3E2723" stroke-width="1.5" />
        <text x="13" y="18" text-anchor="middle" font-size="14">🍎</text>
        <rect x="28" y="0" width="26" height="26" rx="4" fill="#FF6B6B" stroke="#3E2723" stroke-width="1.5" />
        <text x="41" y="18" text-anchor="middle" font-size="14">🍎</text>
        <rect x="56" y="0" width="26" height="26" rx="4" fill="#F39C12" stroke="#3E2723" stroke-width="1.5" />
        <text x="69" y="18" text-anchor="middle" font-size="14">🍊</text>
        <rect x="84" y="0" width="26" height="26" rx="4" fill="#F1C40F" stroke="#3E2723" stroke-width="1.5" />
        <text x="97" y="18" text-anchor="middle" font-size="14">🍋</text>
        <rect x="112" y="0" width="26" height="26" rx="4" fill="#2ECC71" stroke="#3E2723" stroke-width="1.5" />
        <text x="125" y="18" text-anchor="middle" font-size="14">🥝</text>
        <rect x="140" y="0" width="26" height="26" rx="4" fill="#9B59B6" stroke="#3E2723" stroke-width="1.5" />
        <text x="153" y="18" text-anchor="middle" font-size="14">🍇</text>

        <!-- Row 1 -->
        <rect x="0" y="28" width="26" height="26" rx="4" fill="#FF6B6B" stroke="#3E2723" stroke-width="1.5" />
        <text x="13" y="46" text-anchor="middle" font-size="14">🍎</text>
        <rect x="28" y="28" width="26" height="26" rx="4" fill="#FF6B6B" stroke="#3E2723" stroke-width="1.5" />
        <text x="41" y="46" text-anchor="middle" font-size="14">🍎</text>
        <rect x="56" y="28" width="26" height="26" rx="4" fill="#FF6B6B" stroke="#3E2723" stroke-width="1.5" />
        <text x="69" y="46" text-anchor="middle" font-size="14">🍎</text>
        <rect x="84" y="28" width="26" height="26" rx="4" fill="#3498DB" stroke="#3E2723" stroke-width="1.5" />
        <text x="97" y="46" text-anchor="middle" font-size="14">🫐</text>
        <rect x="112" y="28" width="26" height="26" rx="4" fill="#F39C12" stroke="#3E2723" stroke-width="1.5" />
        <text x="125" y="46" text-anchor="middle" font-size="14">🍊</text>
        <rect x="140" y="28" width="26" height="26" rx="4" fill="#2ECC71" stroke="#3E2723" stroke-width="1.5" />
        <text x="153" y="46" text-anchor="middle" font-size="14">🥝</text>

        <!-- Row 2 -->
        <rect x="0" y="56" width="26" height="26" rx="4" fill="#F1C40F" stroke="#3E2723" stroke-width="1.5" />
        <text x="13" y="74" text-anchor="middle" font-size="14">🍋</text>
        <rect x="28" y="56" width="26" height="26" rx="4" fill="#2ECC71" stroke="#3E2723" stroke-width="1.5" />
        <text x="41" y="74" text-anchor="middle" font-size="14">🥝</text>
        <rect x="56" y="56" width="26" height="26" rx="4" fill="#9B59B6" stroke="#3E2723" stroke-width="1.5" />
        <text x="69" y="74" text-anchor="middle" font-size="14">🍇</text>
        <rect x="84" y="56" width="26" height="26" rx="4" fill="#FF6B6B" stroke="#3E2723" stroke-width="1.5" />
        <text x="97" y="74" text-anchor="middle" font-size="14">🍎</text>
        <rect x="112" y="56" width="26" height="26" rx="4" fill="#F1C40F" stroke="#3E2723" stroke-width="1.5" />
        <text x="125" y="74" text-anchor="middle" font-size="14">🍋</text>
        <rect x="140" y="56" width="26" height="26" rx="4" fill="#3498DB" stroke="#3E2723" stroke-width="1.5" />
        <text x="153" y="74" text-anchor="middle" font-size="14">🫐</text>
      </g>

      <!-- Bottom Palette Buttons -->
      <g transform="translate(65, 140)">
        <circle cx="15" cy="15" r="14" fill="#FF6B6B" stroke="#3E2723" stroke-width="2" />
        <circle cx="50" cy="15" r="14" fill="#F39C12" stroke="#3E2723" stroke-width="2" />
        <circle cx="85" cy="15" r="14" fill="#F1C40F" stroke="#3E2723" stroke-width="2" />
        <circle cx="120" cy="15" r="14" fill="#2ECC71" stroke="#3E2723" stroke-width="2" />
        <circle cx="155" cy="15" r="14" fill="#3498DB" stroke="#3E2723" stroke-width="2" />
        <circle cx="190" cy="15" r="14" fill="#9B59B6" stroke="#3E2723" stroke-width="2" />
      </g>
    </svg>
  `,

  'snow-smash': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Winter Frost Background -->
      <rect width="320" height="180" fill="#E8F4F8" />
      <ellipse cx="160" cy="190" rx="200" ry="50" fill="#FFFFFF" stroke="#3E2723" stroke-width="2" />

      <!-- Cardboard Ice Castle Target -->
      <g transform="translate(200, 60)">
        <rect x="0" y="40" width="30" height="60" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
        <rect x="50" y="40" width="30" height="60" fill="#C5A880" stroke="#3E2723" stroke-width="2" />
        <rect x="15" y="20" width="50" height="20" fill="#A0D2EB" stroke="#3E2723" stroke-width="2" />
        <polygon points="40,0 15,20 65,20" fill="#E11D48" stroke="#3E2723" stroke-width="2" />
        <!-- Origami Snowman Inside -->
        <circle cx="40" cy="75" r="12" fill="#FFFFFF" stroke="#3E2723" stroke-width="1.5" />
        <circle cx="40" cy="57" r="8" fill="#FFFFFF" stroke="#3E2723" stroke-width="1.5" />
        <polygon points="40,57 48,59 40,61" fill="#F39C12" />
      </g>

      <!-- Slingshot Launcher -->
      <g transform="translate(45, 90)">
        <path d="M 0 60 L 15 25 L 30 60" fill="none" stroke="#795548" stroke-width="6" stroke-linecap="round" />
        <line x1="15" y1="25" x2="15" y2="70" stroke="#5D4037" stroke-width="8" stroke-linecap="round" />
        <!-- Elastic Band & Snowball -->
        <line x1="5" y1="25" x2="-20" y2="35" stroke="#D32F2F" stroke-width="2" />
        <line x1="25" y1="25" x2="-20" y2="35" stroke="#D32F2F" stroke-width="2" />
        <circle cx="-20" cy="35" r="10" fill="#FFFFFF" stroke="#3E2723" stroke-width="2" />
      </g>

      <!-- Parabolic Aim Trajectory Dots -->
      <circle cx="50" cy="110" r="2.5" fill="#0288D1" />
      <circle cx="85" cy="85" r="2.5" fill="#0288D1" />
      <circle cx="125" cy="70" r="2.5" fill="#0288D1" />
      <circle cx="165" cy="65" r="2.5" fill="#0288D1" />
      <circle cx="205" cy="70" r="2.5" fill="#0288D1" />
    </svg>
  `,

  'mosquito-swat': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Graph Paper Background -->
      <rect width="320" height="180" fill="#FAF6EE" />
      <line x1="0" y1="45" x2="320" y2="45" stroke="#E8DEC8" stroke-width="1" />
      <line x1="0" y1="90" x2="320" y2="90" stroke="#E8DEC8" stroke-width="1" />
      <line x1="0" y1="135" x2="320" y2="135" stroke="#E8DEC8" stroke-width="1" />

      <!-- Buzzing Origami Mosquitoes -->
      <g transform="translate(60, 60)">
        <polygon points="12,0 -12,-8 -6,0 -12,8" fill="#34495E" stroke="#2C3E50" stroke-width="1.5" />
        <ellipse cx="0" cy="-6" rx="8" ry="4" fill="#BDC3C7" opacity="0.8" />
        <ellipse cx="0" cy="6" rx="8" ry="4" fill="#BDC3C7" opacity="0.8" />
      </g>

      <g transform="translate(240, 110)">
        <polygon points="16,0 -16,-10 -8,0 -16,10" fill="#C0392B" stroke="#2C3E50" stroke-width="1.5" />
        <ellipse cx="0" cy="-8" rx="10" ry="5" fill="#BDC3C7" opacity="0.8" />
        <ellipse cx="0" cy="8" rx="10" ry="5" fill="#BDC3C7" opacity="0.8" />
      </g>

      <!-- Paper Net Crosshair Sweep -->
      <g transform="translate(150, 85)">
        <circle cx="0" cy="0" r="32" fill="rgba(39, 174, 96, 0.15)" stroke="#27AE60" stroke-width="3" />
        <line x1="-20" y1="-20" x2="20" y2="20" stroke="#27AE60" stroke-width="1.5" stroke-dasharray="4 2" />
        <line x1="-20" y1="20" x2="20" y2="-20" stroke="#27AE60" stroke-width="1.5" stroke-dasharray="4 2" />
        <line x1="22" y1="22" x2="45" y2="45" stroke="#8E44AD" stroke-width="5" stroke-linecap="round" />
        <!-- Splat Particles -->
        <circle cx="-10" cy="5" r="3" fill="#E74C3C" />
        <circle cx="15" cy="-8" r="4" fill="#E74C3C" />
        <circle cx="2" cy="18" r="3" fill="#E74C3C" />
      </g>
    </svg>
  `,

  'tic-tac-toe': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Notebook Paper Background -->
      <rect width="320" height="180" fill="#F8F5EB" />
      <line x1="0" y1="35" x2="320" y2="35" stroke="#D5E1DF" stroke-width="1" />
      <line x1="0" y1="70" x2="320" y2="70" stroke="#D5E1DF" stroke-width="1" />
      <line x1="0" y1="105" x2="320" y2="105" stroke="#D5E1DF" stroke-width="1" />
      <line x1="0" y1="140" x2="320" y2="140" stroke="#D5E1DF" stroke-width="1" />
      <line x1="45" y1="0" x2="45" y2="180" stroke="#F5B7B1" stroke-width="2" />

      <!-- Chalk 3x3 Grid -->
      <g transform="translate(105, 30)">
        <line x1="40" y1="0" x2="40" y2="120" stroke="#2C3E50" stroke-width="3.5" stroke-linecap="round" />
        <line x1="80" y1="0" x2="80" y2="120" stroke="#2C3E50" stroke-width="3.5" stroke-linecap="round" />
        <line x1="0" y1="40" x2="120" y2="40" stroke="#2C3E50" stroke-width="3.5" stroke-linecap="round" />
        <line x1="0" y1="80" x2="120" y2="80" stroke="#2C3E50" stroke-width="3.5" stroke-linecap="round" />

        <!-- X Marks -->
        <g stroke="#E74C3C" stroke-width="4" stroke-linecap="round">
          <line x1="8" y1="8" x2="32" y2="32" />
          <line x1="32" y1="8" x2="8" y2="32" />
          <line x1="88" y1="88" x2="112" y2="112" />
          <line x1="112" y1="88" x2="88" y2="112" />
          <line x1="48" y1="48" x2="72" y2="72" />
          <line x1="72" y1="48" x2="48" y2="72" />
        </g>

        <!-- O Marks -->
        <circle cx="100" cy="20" r="13" fill="none" stroke="#3498DB" stroke-width="4" />
        <circle cx="20" cy="100" r="13" fill="none" stroke="#3498DB" stroke-width="4" />

        <!-- Winning Strike Line -->
        <line x1="5" y1="5" x2="115" y2="115" stroke="#E74C3C" stroke-width="4" stroke-linecap="round" />
      </g>
    </svg>
  `,

  'koi-pond': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <!-- Water Basin Background -->
      <rect width="320" height="180" fill="#E0F2FE" />

      <!-- Water Caustics Waves -->
      <path d="M 0 45 Q 80 35 160 45 T 320 45" fill="none" stroke="#BAE6FD" stroke-width="2" />
      <path d="M 0 105 Q 80 95 160 105 T 320 105" fill="none" stroke="#BAE6FD" stroke-width="2" />
      <path d="M 0 155 Q 80 145 160 155 T 320 155" fill="none" stroke="#BAE6FD" stroke-width="2" />

      <!-- Green Lily Pads -->
      <circle cx="55" cy="45" r="22" fill="#10B981" stroke="#2B2118" stroke-width="2" />
      <path d="M 55 45 L 75 52" stroke="#2B2118" stroke-width="2" />
      <circle cx="270" cy="140" r="26" fill="#10B981" stroke="#2B2118" stroke-width="2" />
      <path d="M 270 140 L 292 148" stroke="#2B2118" stroke-width="2" />

      <!-- Swimming Koi Fish 1 (Orange/Coral) -->
      <g transform="translate(135, 95) rotate(-30)">
        <ellipse cx="0" cy="0" rx="20" ry="8" fill="#FF7675" stroke="#2B2118" stroke-width="1.5" />
        <ellipse cx="-4" cy="-9" rx="6" ry="3" fill="#FAB1A0" stroke="#2B2118" stroke-width="1" />
        <ellipse cx="-4" cy="9" rx="6" ry="3" fill="#FAB1A0" stroke="#2B2118" stroke-width="1" />
        <polygon points="-16,0 -24,-6 -20,0 -24,6" fill="#FAB1A0" stroke="#2B2118" stroke-width="1" />
        <circle cx="12" cy="-3" r="1.5" fill="#2B2118" />
      </g>

      <!-- Swimming Koi Fish 2 (Golden) -->
      <g transform="translate(195, 65) rotate(45)">
        <ellipse cx="0" cy="0" rx="17" ry="7" fill="#FFA502" stroke="#2B2118" stroke-width="1.5" />
        <polygon points="-14,0 -20,-5 -17,0 -20,5" fill="#FFEAA7" stroke="#2B2118" stroke-width="1" />
        <circle cx="10" cy="-2.5" r="1.5" fill="#2B2118" />
      </g>

      <!-- Water Ripple Rings -->
      <circle cx="180" cy="80" r="18" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.7" />
      <circle cx="180" cy="80" r="32" fill="none" stroke="#38BDF8" stroke-width="1" opacity="0.4" />
      <!-- Food Pellet -->
      <circle cx="180" cy="80" r="3" fill="#B45309" stroke="#2B2118" stroke-width="1" />
    </svg>
  `
};
