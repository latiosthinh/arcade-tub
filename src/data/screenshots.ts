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
  `
};
