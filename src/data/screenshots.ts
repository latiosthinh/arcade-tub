/**
 * Authentic SVG gameplay screenshots for all 5 arcade games.
 * Scalable, lightweight (<3KB each), neon-styled to match the exact in-game canvas scene visuals.
 */

export const GAME_SCREENSHOTS: Record<string, string> = {
  'safe-cracker': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <radialGradient id="sc-vault-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2c3e50" />
          <stop offset="70%" stop-color="#1a252f" />
          <stop offset="100%" stop-color="#0e171e" />
        </radialGradient>
        <radialGradient id="sc-dial-grad" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#4a5568" />
          <stop offset="60%" stop-color="#2d3748" />
          <stop offset="100%" stop-color="#1a202c" />
        </radialGradient>
        <filter id="sc-glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sc-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Background Vault Door -->
      <rect width="320" height="180" fill="url(#sc-vault-bg)" />
      <rect x="10" y="10" width="300" height="160" rx="10" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="8 4" />

      <!-- Vault Bolts -->
      <circle cx="25" cy="25" r="4" fill="#64748b" />
      <circle cx="295" cy="25" r="4" fill="#64748b" />
      <circle cx="25" cy="155" r="4" fill="#64748b" />
      <circle cx="295" cy="155" r="4" fill="#64748b" />

      <!-- Digital Display HUD -->
      <rect x="25" y="20" width="80" height="24" rx="4" fill="#0f172a" stroke="#00f0ff" stroke-width="1" />
      <text x="32" y="36" fill="#00f0ff" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE 12,500</text>
      <rect x="215" y="20" width="80" height="24" rx="4" fill="#0f172a" stroke="#ffe600" stroke-width="1" />
      <text x="225" y="36" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">TIME 42.8s</text>

      <!-- Circular Vault Dial -->
      <circle cx="160" cy="95" r="62" fill="url(#sc-dial-grad)" stroke="#475569" stroke-width="4" />
      <circle cx="160" cy="95" r="54" fill="none" stroke="#1e293b" stroke-width="6" />

      <!-- Target Arc Zones (Score & Time bonus) -->
      <!-- Yellow Target Zone -->
      <path d="M 160 41 A 54 54 0 0 1 205 62" fill="none" stroke="#ffe600" stroke-width="7" stroke-linecap="round" filter="url(#sc-glow-yellow)" />
      <!-- Blue Bonus Zone -->
      <path d="M 115 128 A 54 54 0 0 1 125 62" fill="none" stroke="#00f0ff" stroke-width="7" stroke-linecap="round" filter="url(#sc-glow-cyan)" />

      <!-- Dial Ticks -->
      <circle cx="160" cy="95" r="46" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="2 6" />

      <!-- Rotating Neon Needle Indicator -->
      <line x1="160" y1="95" x2="195" y2="52" stroke="#ff007f" stroke-width="3" stroke-linecap="round" filter="url(#sc-glow-yellow)" />
      <circle cx="195" cy="52" r="3.5" fill="#ffffff" />

      <!-- Center Hub Handle -->
      <circle cx="160" cy="95" r="18" fill="#1e293b" stroke="#64748b" stroke-width="2" />
      <line x1="148" y1="95" x2="172" y2="95" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
      <line x1="160" y1="83" x2="160" y2="107" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
      <circle cx="160" cy="95" r="5" fill="#f8fafc" />

      <!-- Tap Prompt Indicator -->
      <text x="160" y="170" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="9" font-weight="600" letter-spacing="1">TAP WHEN NEEDLE HITS YELLOW ZONE</text>
    </svg>
  `,

  'brick-blitz': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="bb-bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0a0a18" />
          <stop offset="60%" stop-color="#140a28" />
          <stop offset="100%" stop-color="#2d0a3d" />
        </linearGradient>
        <filter id="bb-glow-cyan">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bb-glow-pink">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- Synthwave Background -->
      <rect width="320" height="180" fill="url(#bb-bg-grad)" />

      <!-- Perspective Grid Horizon Lines -->
      <line x1="0" y1="140" x2="320" y2="140" stroke="rgba(255, 0, 127, 0.4)" stroke-width="1" />
      <line x1="0" y1="152" x2="320" y2="152" stroke="rgba(255, 0, 127, 0.3)" stroke-width="1" />
      <line x1="0" y1="166" x2="320" y2="166" stroke="rgba(255, 0, 127, 0.2)" stroke-width="1" />
      <line x1="160" y1="140" x2="80" y2="180" stroke="rgba(255, 0, 127, 0.3)" stroke-width="1" />
      <line x1="160" y1="140" x2="240" y2="180" stroke="rgba(255, 0, 127, 0.3)" stroke-width="1" />
      <line x1="160" y1="140" x2="20" y2="180" stroke="rgba(255, 0, 127, 0.2)" stroke-width="1" />
      <line x1="160" y1="140" x2="300" y2="180" stroke="rgba(255, 0, 127, 0.2)" stroke-width="1" />

      <!-- HUD Header -->
      <text x="15" y="18" fill="#00f0ff" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE: 8,450</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">STAGE 2-1</text>
      <text x="305" y="18" text-anchor="end" fill="#ff007f" font-family="'Courier New', monospace" font-size="10" font-weight="bold">LIVES: ♥♥♥</text>

      <!-- Row 1 Bricks (Neon Pink) -->
      <rect x="25" y="28" width="38" height="12" rx="2" fill="#ff007f" filter="url(#bb-glow-pink)" />
      <rect x="69" y="28" width="38" height="12" rx="2" fill="#ff007f" />
      <rect x="113" y="28" width="38" height="12" rx="2" fill="#ff007f" />
      <rect x="157" y="28" width="38" height="12" rx="2" fill="#ff007f" />
      <rect x="201" y="28" width="38" height="12" rx="2" fill="#ff007f" />
      <rect x="245" y="28" width="38" height="12" rx="2" fill="#ff007f" />

      <!-- Row 2 Bricks (Neon Cyan) -->
      <rect x="25" y="44" width="38" height="12" rx="2" fill="#00f0ff" />
      <rect x="69" y="44" width="38" height="12" rx="2" fill="#00f0ff" />
      <!-- (Destroyed space at x=113) -->
      <circle cx="132" cy="50" r="3" fill="#ffe600" opacity="0.8" />
      <circle cx="128" cy="46" r="2" fill="#ff007f" opacity="0.7" />
      <circle cx="136" cy="54" r="2" fill="#00f0ff" opacity="0.9" />
      <rect x="157" y="44" width="38" height="12" rx="2" fill="#00f0ff" />
      <rect x="201" y="44" width="38" height="12" rx="2" fill="#00f0ff" filter="url(#bb-glow-cyan)" />
      <rect x="245" y="44" width="38" height="12" rx="2" fill="#00f0ff" />

      <!-- Row 3 Bricks (Neon Yellow & Green) -->
      <rect x="25" y="60" width="38" height="12" rx="2" fill="#ffe600" />
      <rect x="69" y="60" width="38" height="12" rx="2" fill="#ffe600" />
      <rect x="113" y="60" width="38" height="12" rx="2" fill="#00ff88" />
      <rect x="157" y="60" width="38" height="12" rx="2" fill="#00ff88" />
      <rect x="201" y="60" width="38" height="12" rx="2" fill="#ffe600" />
      <rect x="245" y="60" width="38" height="12" rx="2" fill="#ffe600" />

      <!-- Laser Ball Motion Trail -->
      <line x1="125" y1="120" x2="140" y2="85" stroke="rgba(0, 240, 255, 0.4)" stroke-width="5" stroke-linecap="round" />
      <line x1="130" y1="110" x2="142" y2="80" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" />
      <!-- Glowing Ball -->
      <circle cx="145" cy="76" r="6" fill="#ffffff" filter="url(#bb-glow-cyan)" />

      <!-- Player Neon Paddle -->
      <rect x="100" y="145" width="70" height="10" rx="5" fill="#00f0ff" filter="url(#bb-glow-cyan)" />
      <rect x="112" y="147" width="46" height="6" rx="3" fill="#ffffff" />
    </svg>
  `,

  'sky-hopper': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="sh-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0b0726" />
          <stop offset="60%" stop-color="#1e1045" />
          <stop offset="100%" stop-color="#3b156b" />
        </linearGradient>
        <filter id="sh-glow-purple">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sh-glow-yellow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- Starry Space Background -->
      <rect width="320" height="180" fill="url(#sh-bg)" />

      <!-- Background Stars -->
      <circle cx="35" cy="25" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="85" cy="50" r="1" fill="#9d00ff" opacity="0.9" />
      <circle cx="140" cy="15" r="2" fill="#00f0ff" opacity="0.7" />
      <circle cx="220" cy="40" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="280" cy="20" r="2" fill="#ffe600" opacity="0.9" />
      <circle cx="50" cy="110" r="1.2" fill="#ffffff" opacity="0.6" />
      <circle cx="290" cy="120" r="1.5" fill="#ffffff" opacity="0.7" />

      <!-- HUD Altitude -->
      <rect x="15" y="12" width="90" height="22" rx="4" fill="rgba(15, 23, 42, 0.8)" stroke="#9d00ff" stroke-width="1" />
      <text x="22" y="27" fill="#ffffff" font-family="'Courier New', monospace" font-size="10" font-weight="bold">ALT: <tspan fill="#ffe600">2,840m</tspan></text>

      <!-- Vertical Platforms -->
      <!-- Low Platform -->
      <rect x="40" y="150" width="60" height="8" rx="4" fill="#00ff88" stroke="#052e16" stroke-width="1" />
      <!-- Mid-Left Platform -->
      <rect x="120" y="115" width="55" height="8" rx="4" fill="#00f0ff" stroke="#083344" stroke-width="1" />
      <!-- Mid-Right Platform -->
      <rect x="210" y="85" width="65" height="8" rx="4" fill="#00ff88" stroke="#052e16" stroke-width="1" />
      <!-- High Platform -->
      <rect x="90" y="45" width="50" height="8" rx="4" fill="#ffe600" stroke="#713f12" stroke-width="1" />

      <!-- Rocket Booster Power-up floating on platform -->
      <g transform="translate(235, 68)">
        <polygon points="6,0 12,12 0,12" fill="#ff007f" />
        <rect x="2" y="12" width="8" height="6" fill="#f8fafc" />
        <polygon points="6,18 2,22 10,22" fill="#ffe600" filter="url(#sh-glow-yellow)" />
      </g>

      <!-- Jumping Character with Thruster Jet -->
      <g transform="translate(138, 70)">
        <!-- Rocket Flame Particles -->
        <circle cx="10" cy="32" r="4" fill="#ffe600" filter="url(#sh-glow-yellow)" />
        <circle cx="10" cy="38" r="3" fill="#ff007f" opacity="0.8" />
        <circle cx="10" cy="44" r="2" fill="#00f0ff" opacity="0.5" />

        <!-- Hopper Body -->
        <circle cx="10" cy="14" r="12" fill="#9d00ff" stroke="#ffffff" stroke-width="2" filter="url(#sh-glow-purple)" />
        <!-- Visor -->
        <ellipse cx="12" cy="12" rx="7" ry="5" fill="#00f0ff" />
        <!-- Cute Eyes inside visor -->
        <circle cx="11" cy="11" r="1.5" fill="#091e28" />
        <circle cx="15" cy="11" r="1.5" fill="#091e28" />
        <!-- Antenna -->
        <line x1="10" y1="2" x2="10" y2="-4" stroke="#ffffff" stroke-width="2" />
        <circle cx="10" cy="-5" r="2.5" fill="#ffe600" />
      </g>
    </svg>
  `,

  'crate-catch': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="cc-factory-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1c120c" />
          <stop offset="60%" stop-color="#2d1a0e" />
          <stop offset="100%" stop-color="#452611" />
        </linearGradient>
        <filter id="cc-glow-orange">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="cc-glow-blue">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- Industrial Background -->
      <rect width="320" height="180" fill="url(#cc-factory-bg)" />

      <!-- Steam Pipes in background -->
      <rect x="0" y="25" width="320" height="8" fill="#3e2723" stroke="#5d4037" stroke-width="1" />
      <rect x="260" y="0" width="12" height="180" fill="#3e2723" stroke="#5d4037" stroke-width="1" />

      <!-- HUD Top Bar -->
      <text x="15" y="18" fill="#ff9f43" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE: 16,200</text>
      <text x="160" y="18" text-anchor="middle" fill="#00ff88" font-family="'Courier New', monospace" font-size="10" font-weight="bold">STACK x4 (BANK: SPACE)</text>
      <text x="305" y="18" text-anchor="end" fill="#ee5253" font-family="'Courier New', monospace" font-size="10" font-weight="bold">CRATES: 18/20</text>

      <!-- Dual Conveyor Belts (Tracks) -->
      <!-- Back Track (Blue) -->
      <rect x="0" y="95" width="320" height="6" fill="#10314b" stroke="#0984e3" stroke-width="1" />
      <line x1="0" y1="98" x2="320" y2="98" stroke="#74b9ff" stroke-dasharray="6 6" stroke-width="2" />

      <!-- Front Track (Yellow) -->
      <rect x="0" y="150" width="320" height="10" fill="#4a3c10" stroke="#f39c12" stroke-width="1" />
      <line x1="0" y1="155" x2="320" y2="155" stroke="#f1c40f" stroke-dasharray="8 8" stroke-width="2" />

      <!-- Falling Crates & Hazard Bomb -->
      <!-- Falling Bomb -->
      <g transform="translate(60, 45)">
        <circle cx="10" cy="10" r="9" fill="#1e272e" stroke="#eb4d4b" stroke-width="2" />
        <line x1="10" y1="1" x2="14" y2="-4" stroke="#f0932b" stroke-width="2" />
        <circle cx="15" cy="-5" r="2.5" fill="#f9ca24" filter="url(#cc-glow-orange)" />
        <text x="6" y="14" fill="#ffffff" font-size="9" font-weight="bold">💣</text>
      </g>

      <!-- Falling Back-Lane Blue Crate -->
      <g transform="translate(100, 50)">
        <rect x="0" y="0" width="22" height="16" rx="2" fill="#0984e3" stroke="#74b9ff" stroke-width="1.5" filter="url(#cc-glow-blue)" />
        <line x1="0" y1="0" x2="22" y2="16" stroke="#00cec9" stroke-width="1" />
        <line x1="22" y1="0" x2="0" y2="16" stroke="#00cec9" stroke-width="1" />
      </g>

      <!-- Falling Front-Lane Golden/Amber Crate -->
      <g transform="translate(200, 35)">
        <rect x="0" y="0" width="26" height="20" rx="2" fill="#d35400" stroke="#f1c40f" stroke-width="1.5" filter="url(#cc-glow-orange)" />
        <line x1="0" y1="0" x2="26" y2="20" stroke="#f39c12" stroke-width="1" />
        <line x1="26" y1="0" x2="0" y2="20" stroke="#f39c12" stroke-width="1" />
      </g>

      <!-- Catcher Cart on Front Track with Stacked Crates -->
      <g transform="translate(145, 140)">
        <!-- Wheels -->
        <circle cx="8" cy="16" r="5" fill="#1e272e" stroke="#95a5a6" stroke-width="2" />
        <circle cx="48" cy="16" r="5" fill="#1e272e" stroke="#95a5a6" stroke-width="2" />
        <!-- Cart Base Platform -->
        <rect x="0" y="4" width="56" height="10" rx="3" fill="#b33939" stroke="#f1c40f" stroke-width="1.5" />
        <!-- Cart Glow Light -->
        <circle cx="28" cy="9" r="2" fill="#00ff88" />

        <!-- Stacked Crates on Cart (Front & Back colored) -->
        <g transform="translate(6, -16)">
          <rect x="0" y="0" width="44" height="16" rx="2" fill="#d35400" stroke="#f1c40f" stroke-width="1.5" />
          <line x1="0" y1="0" x2="44" y2="16" stroke="#f39c12" stroke-width="1" />
        </g>
        <g transform="translate(9, -32) rotate(-2, 20, 8)">
          <rect x="0" y="0" width="38" height="16" rx="2" fill="#0984e3" stroke="#74b9ff" stroke-width="1.5" />
          <line x1="0" y1="0" x2="38" y2="16" stroke="#00cec9" stroke-width="1" />
        </g>
        <g transform="translate(13, -48) rotate(3, 16, 8)">
          <rect x="0" y="0" width="32" height="15" rx="2" fill="#f1c40f" stroke="#ffeaa7" stroke-width="1.5" />
          <line x1="0" y1="0" x2="32" y2="15" stroke="#ffffff" stroke-width="1" />
        </g>
      </g>
    </svg>
  `,

  'type-strike': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="ts-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0b0409" />
          <stop offset="60%" stop-color="#180718" />
          <stop offset="100%" stop-color="#2a0a22" />
        </linearGradient>
        <filter id="ts-glow-laser">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ts-glow-pink">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- Terminal Grid Matrix Background -->
      <rect width="320" height="180" fill="url(#ts-bg)" />

      <!-- Tactical Radar Wireframe Lines -->
      <circle cx="160" cy="180" r="140" fill="none" stroke="rgba(255, 0, 127, 0.15)" stroke-width="1" />
      <circle cx="160" cy="180" r="90" fill="none" stroke="rgba(255, 0, 127, 0.2)" stroke-width="1" />
      <line x1="160" y1="40" x2="160" y2="180" stroke="rgba(255, 0, 127, 0.15)" stroke-width="1" />
      <line x1="50" y1="80" x2="270" y2="80" stroke="rgba(255, 0, 127, 0.15)" stroke-width="1" />

      <!-- Top Terminal HUD -->
      <text x="15" y="18" fill="#00f0ff" font-family="'Courier New', monospace" font-size="10" font-weight="bold">STREAK: 14x [MAX]</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">TIME: 38s</text>
      <text x="305" y="18" text-anchor="end" fill="#ff007f" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SHIELDS: [|||]</text>

      <!-- Approaching Enemy Drones with Typing Words -->
      <!-- Enemy 1 (Locked & Targeted) -->
      <g transform="translate(60, 45)">
        <polygon points="15,0 30,15 25,25 5,25 0,15" fill="#1f1d36" stroke="#ff007f" stroke-width="1.5" />
        <circle cx="15" cy="15" r="4" fill="#ff007f" filter="url(#ts-glow-pink)" />
        <!-- Word Badge with typed prefix highlight -->
        <rect x="-8" y="-18" width="46" height="15" rx="3" fill="rgba(10, 10, 18, 0.85)" stroke="#00f0ff" stroke-width="1" />
        <text x="15" y="-7" text-anchor="middle" font-family="'Courier New', monospace" font-size="9" font-weight="bold">
          <tspan fill="#00f0ff">CYB</tspan><tspan fill="#ffffff">ER</tspan>
        </text>
      </g>

      <!-- Enemy 2 (Approaching) -->
      <g transform="translate(190, 55)">
        <polygon points="15,0 30,15 25,25 5,25 0,15" fill="#1f1d36" stroke="#e056fd" stroke-width="1.5" />
        <circle cx="15" cy="15" r="4" fill="#e056fd" />
        <rect x="-6" y="-18" width="42" height="15" rx="3" fill="rgba(10, 10, 18, 0.85)" stroke="#64748b" stroke-width="1" />
        <text x="15" y="-7" text-anchor="middle" fill="#ffffff" font-family="'Courier New', monospace" font-size="9" font-weight="bold">MATRIX</text>
      </g>

      <!-- Enemy 3 (Fast Wing) -->
      <g transform="translate(250, 90)">
        <polygon points="12,0 24,12 20,20 4,20 0,12" fill="#1f1d36" stroke="#ff7675" stroke-width="1.5" />
        <circle cx="12" cy="12" r="3" fill="#ff7675" />
        <rect x="-4" y="-18" width="32" height="15" rx="3" fill="rgba(10, 10, 18, 0.85)" stroke="#64748b" stroke-width="1" />
        <text x="12" y="-7" text-anchor="middle" fill="#ffffff" font-family="'Courier New', monospace" font-size="9" font-weight="bold">BYTE</text>
      </g>

      <!-- Laser Beam Strike to Enemy 1 -->
      <line x1="160" y1="165" x2="75" y2="60" stroke="#00f0ff" stroke-width="3" stroke-linecap="round" filter="url(#ts-glow-laser)" />
      <line x1="160" y1="165" x2="75" y2="60" stroke="#ffffff" stroke-width="1" stroke-linecap="round" />

      <!-- Impact Sparks on Enemy 1 -->
      <circle cx="75" cy="60" r="4" fill="#ffffff" filter="url(#ts-glow-laser)" />
      <circle cx="71" cy="56" r="2" fill="#00f0ff" />
      <circle cx="79" cy="63" r="2" fill="#ffe600" />

      <!-- Base Command Turret -->
      <g transform="translate(140, 155)">
        <path d="M 0 25 L 10 0 L 30 0 L 40 25 Z" fill="#1e272e" stroke="#00f0ff" stroke-width="1.5" />
        <circle cx="20" cy="10" r="6" fill="#00f0ff" filter="url(#ts-glow-laser)" />
      </g>
    </svg>
  `,

  'memory-cards': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="mc-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#051923" />
          <stop offset="100%" stop-color="#003554" />
        </linearGradient>
        <filter id="mc-glow-cyan">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#mc-bg)" />
      <text x="15" y="18" fill="#00f0ff" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE: 4,800</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">STREAK: 3x</text>
      <text x="305" y="18" text-anchor="end" fill="#00ff88" font-family="'Courier New', monospace" font-size="10" font-weight="bold">TIME: 45.2s</text>
      <!-- 4x3 Card Grid -->
      <!-- Row 1 -->
      <rect x="25" y="30" width="55" height="40" rx="4" fill="#0c2333" stroke="#00f0ff" stroke-width="1.5" />
      <text x="52" y="55" text-anchor="middle" fill="#00f0ff" font-size="16">⬡</text>
      <rect x="95" y="30" width="55" height="40" rx="4" fill="#0c2333" stroke="#00f0ff" stroke-width="1.5" />
      <text x="122" y="55" text-anchor="middle" fill="#00f0ff" font-size="16">⬡</text>
      <rect x="165" y="30" width="55" height="40" rx="4" fill="#08141e" stroke="#1e4d6b" stroke-width="1" />
      <text x="192" y="55" text-anchor="middle" fill="#1e4d6b" font-size="14">?</text>
      <rect x="235" y="30" width="55" height="40" rx="4" fill="#08141e" stroke="#1e4d6b" stroke-width="1" />
      <text x="262" y="55" text-anchor="middle" fill="#1e4d6b" font-size="14">?</text>
      <!-- Row 2 -->
      <rect x="25" y="78" width="55" height="40" rx="4" fill="#08141e" stroke="#1e4d6b" stroke-width="1" />
      <text x="52" y="103" text-anchor="middle" fill="#1e4d6b" font-size="14">?</text>
      <rect x="95" y="78" width="55" height="40" rx="4" fill="#1e1833" stroke="#ff007f" stroke-width="1.5" filter="url(#mc-glow-cyan)" />
      <text x="122" y="103" text-anchor="middle" fill="#ff007f" font-size="16">⚡</text>
      <rect x="165" y="78" width="55" height="40" rx="4" fill="#1e1833" stroke="#ff007f" stroke-width="1.5" />
      <text x="192" y="103" text-anchor="middle" fill="#ff007f" font-size="16">⚡</text>
      <rect x="235" y="78" width="55" height="40" rx="4" fill="#08141e" stroke="#1e4d6b" stroke-width="1" />
      <text x="262" y="103" text-anchor="middle" fill="#1e4d6b" font-size="14">?</text>
      <!-- Row 3 -->
      <rect x="25" y="126" width="55" height="40" rx="4" fill="#08141e" stroke="#1e4d6b" stroke-width="1" />
      <rect x="95" y="126" width="55" height="40" rx="4" fill="#08141e" stroke="#1e4d6b" stroke-width="1" />
      <rect x="165" y="126" width="55" height="40" rx="4" fill="#08141e" stroke="#1e4d6b" stroke-width="1" />
      <rect x="235" y="126" width="55" height="40" rx="4" fill="#08141e" stroke="#1e4d6b" stroke-width="1" />
    </svg>
  `,

  'memory-boxes': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="mb-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#120c1d" />
          <stop offset="100%" stop-color="#2a1435" />
        </linearGradient>
        <filter id="mb-glow-purple">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#mb-bg)" />
      <text x="15" y="18" fill="#a29bfe" font-family="'Courier New', monospace" font-size="10" font-weight="bold">ROUND 6</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">STEP 4/6</text>
      <text x="305" y="18" text-anchor="end" fill="#ff7675" font-family="'Courier New', monospace" font-size="10" font-weight="bold">LIVES: ♥♥♥</text>
      <!-- 3x3 Grid of Neon Boxes -->
      <g transform="translate(85, 30)">
        <rect x="0" y="0" width="42" height="42" rx="6" fill="#1e1830" stroke="#4834d4" stroke-width="1.5" />
        <rect x="52" y="0" width="42" height="42" rx="6" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="2" filter="url(#mb-glow-purple)" />
        <rect x="104" y="0" width="42" height="42" rx="6" fill="#1e1830" stroke="#4834d4" stroke-width="1.5" />
        
        <rect x="0" y="48" width="42" height="42" rx="6" fill="#1e1830" stroke="#4834d4" stroke-width="1.5" />
        <rect x="52" y="48" width="42" height="42" rx="6" fill="#1e1830" stroke="#4834d4" stroke-width="1.5" />
        <rect x="104" y="48" width="42" height="42" rx="6" fill="#1e1830" stroke="#4834d4" stroke-width="1.5" />
        
        <rect x="0" y="96" width="42" height="42" rx="6" fill="#1e1830" stroke="#4834d4" stroke-width="1.5" />
        <rect x="52" y="96" width="42" height="42" rx="6" fill="#1e1830" stroke="#4834d4" stroke-width="1.5" />
        <rect x="104" y="96" width="42" height="42" rx="6" fill="#1e1830" stroke="#4834d4" stroke-width="1.5" />
      </g>
    </svg>
  `,

  'pop-balloon': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="pb-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#230a14" />
          <stop offset="100%" stop-color="#481022" />
        </linearGradient>
        <filter id="pb-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#pb-bg)" />
      <text x="15" y="18" fill="#ff7675" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE: 18,300</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">COMBO x4</text>
      <text x="305" y="18" text-anchor="end" fill="#00f0ff" font-family="'Courier New', monospace" font-size="10" font-weight="bold">TIME: 28s</text>
      <!-- Floating Balloons -->
      <g transform="translate(60, 60)">
        <ellipse cx="15" cy="20" rx="14" ry="18" fill="#ff7675" filter="url(#pb-glow)" />
        <polygon points="15,38 12,42 18,42" fill="#ff7675" />
        <path d="M 15 42 Q 12 52 16 60" stroke="#ffb8b8" fill="none" stroke-width="1" />
      </g>
      <g transform="translate(140, 40)">
        <ellipse cx="15" cy="20" rx="14" ry="18" fill="#00cec9" filter="url(#pb-glow)" />
        <polygon points="15,38 12,42 18,42" fill="#00cec9" />
        <path d="M 15 42 Q 18 52 14 60" stroke="#81ecec" fill="none" stroke-width="1" />
      </g>
      <g transform="translate(220, 80)">
        <ellipse cx="15" cy="20" rx="14" ry="18" fill="#ffeaa7" filter="url(#pb-glow)" />
        <polygon points="15,38 12,42 18,42" fill="#ffeaa7" />
        <path d="M 15 42 Q 13 52 17 60" stroke="#fdcb6e" fill="none" stroke-width="1" />
      </g>
      <!-- Spike Bomb Hazard -->
      <g transform="translate(170, 110)">
        <circle cx="12" cy="12" r="10" fill="#2d3436" stroke="#d63031" stroke-width="2" />
        <line x1="12" y1="-2" x2="12" y2="26" stroke="#d63031" stroke-width="2" />
        <line x1="-2" y1="12" x2="26" y2="12" stroke="#d63031" stroke-width="2" />
        <circle cx="12" cy="12" r="4" fill="#ff7675" />
      </g>
    </svg>
  `,

  'space-racer': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="sr-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020813" />
          <stop offset="100%" stop-color="#092042" />
        </linearGradient>
        <filter id="sr-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#sr-bg)" />
      <!-- Perspective Warp Grid -->
      <line x1="160" y1="70" x2="20" y2="180" stroke="#0984e3" stroke-width="1" opacity="0.4" />
      <line x1="160" y1="70" x2="100" y2="180" stroke="#0984e3" stroke-width="1" opacity="0.4" />
      <line x1="160" y1="70" x2="220" y2="180" stroke="#0984e3" stroke-width="1" opacity="0.4" />
      <line x1="160" y1="70" x2="300" y2="180" stroke="#0984e3" stroke-width="1" opacity="0.4" />
      <text x="15" y="18" fill="#00d2d3" font-family="'Courier New', monospace" font-size="10" font-weight="bold">DIST: 3,420 LY</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">WARP 2.4x</text>
      <text x="305" y="18" text-anchor="end" fill="#ff7675" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SHIELD 85%</text>
      <!-- Turbo Gate Arch -->
      <path d="M 120 120 Q 160 85 200 120" fill="none" stroke="#00cec9" stroke-width="3" filter="url(#sr-glow)" />
      <!-- Asteroid Obstacle -->
      <polygon points="70,110 85,100 95,115 80,125 65,120" fill="#636e72" stroke="#b2bec3" stroke-width="1" />
      <!-- Player Jet -->
      <g transform="translate(148, 130)">
        <polygon points="12,0 0,25 12,20 24,25" fill="#0984e3" stroke="#74b9ff" stroke-width="1.5" />
        <circle cx="12" cy="22" r="3" fill="#ffeaa7" filter="url(#sr-glow)" />
      </g>
    </svg>
  `,

  'virus-defense': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <radialGradient id="vd-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0b3c35" />
          <stop offset="100%" stop-color="#021412" />
        </radialGradient>
        <filter id="vd-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#vd-bg)" />
      <text x="15" y="18" fill="#00cec9" font-family="'Courier New', monospace" font-size="10" font-weight="bold">WAVE 7</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE 14,250</text>
      <text x="305" y="18" text-anchor="end" fill="#55efc4" font-family="'Courier New', monospace" font-size="10" font-weight="bold">NUCLEUS 100%</text>
      <!-- Center Nucleus Cell & Turret -->
      <circle cx="160" cy="100" r="28" fill="#006266" stroke="#00cec9" stroke-width="2" filter="url(#vd-glow)" />
      <circle cx="160" cy="100" r="14" fill="#00cec9" />
      <line x1="160" y1="100" x2="195" y2="75" stroke="#ffeaa7" stroke-width="3" stroke-linecap="round" />
      <!-- Laser Beam -->
      <line x1="195" y1="75" x2="250" y2="45" stroke="#55efc4" stroke-width="2" stroke-dasharray="4 2" />
      <!-- Swarming Pathogens -->
      <circle cx="260" cy="40" r="8" fill="#d63031" stroke="#ff7675" stroke-width="1.5" />
      <circle cx="65" cy="80" r="7" fill="#e17055" stroke="#fab1a0" stroke-width="1.5" />
      <circle cx="120" cy="155" r="6" fill="#fdcb6e" stroke="#ffeaa7" stroke-width="1.5" />
    </svg>
  `,

  'flappy-fish': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="ff-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#05272a" />
          <stop offset="100%" stop-color="#021417" />
        </linearGradient>
        <filter id="ff-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#ff-bg)" />
      <text x="15" y="18" fill="#00b894" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE: 24</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">BEST: 42</text>
      <text x="305" y="18" text-anchor="end" fill="#81ecec" font-family="'Courier New', monospace" font-size="10" font-weight="bold">PEARLS: 18</text>
      <!-- Glowing Coral Pillars -->
      <rect x="220" y="0" width="30" height="60" rx="3" fill="#006266" stroke="#00b894" stroke-width="2" />
      <rect x="220" y="120" width="30" height="60" rx="3" fill="#006266" stroke="#00b894" stroke-width="2" />
      <!-- Cyber Fish -->
      <g transform="translate(100, 85)">
        <ellipse cx="14" cy="10" rx="14" ry="9" fill="#00cec9" filter="url(#ff-glow)" />
        <polygon points="0,10 -8,4 -8,16" fill="#00b894" />
        <circle cx="20" cy="8" r="2" fill="#ffffff" />
        <!-- Air Bubbles -->
        <circle cx="-12" cy="5" r="2" fill="#81ecec" opacity="0.6" />
        <circle cx="-18" cy="1" r="1.5" fill="#81ecec" opacity="0.4" />
      </g>
    </svg>
  `,

  'game-2048': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="g2-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1f1b0a" />
          <stop offset="100%" stop-color="#3d3514" />
        </linearGradient>
        <filter id="g2-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#g2-bg)" />
      <text x="15" y="18" fill="#fdcb6e" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE 18,420</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffeaa7" font-family="'Courier New', monospace" font-size="10" font-weight="bold">2048 NEON</text>
      <text x="305" y="18" text-anchor="end" fill="#00cec9" font-family="'Courier New', monospace" font-size="10" font-weight="bold">MOVES 182</text>
      <!-- 4x4 Tile Board -->
      <g transform="translate(95, 28)">
        <rect x="0" y="0" width="130" height="130" rx="6" fill="#141107" stroke="#fdcb6e" stroke-width="1" />
        <rect x="6" y="6" width="26" height="26" rx="3" fill="#2d2915" />
        <text x="19" y="23" text-anchor="middle" fill="#f1c40f" font-size="10" font-weight="bold">2</text>
        <rect x="36" y="6" width="26" height="26" rx="3" fill="#383015" />
        <text x="49" y="23" text-anchor="middle" fill="#f39c12" font-size="10" font-weight="bold">4</text>
        <rect x="66" y="6" width="26" height="26" rx="3" fill="#4d2f10" />
        <text x="79" y="23" text-anchor="middle" fill="#e67e22" font-size="10" font-weight="bold">8</text>
        <rect x="96" y="6" width="26" height="26" rx="3" fill="#542010" />
        <text x="109" y="23" text-anchor="middle" fill="#e74c3c" font-size="10" font-weight="bold">16</text>

        <rect x="6" y="36" width="26" height="26" rx="3" fill="#59182a" />
        <text x="19" y="53" text-anchor="middle" fill="#fd79a8" font-size="10" font-weight="bold">32</text>
        <rect x="36" y="36" width="26" height="26" rx="3" fill="#521745" />
        <text x="49" y="53" text-anchor="middle" fill="#e84393" font-size="10" font-weight="bold">64</text>
        <rect x="66" y="36" width="26" height="26" rx="3" fill="#1c1f4a" />
        <text x="79" y="53" text-anchor="middle" fill="#0984e3" font-size="9" font-weight="bold">128</text>
        <rect x="96" y="36" width="26" height="26" rx="3" fill="#113645" />
        <text x="109" y="53" text-anchor="middle" fill="#00cec9" font-size="9" font-weight="bold">256</text>

        <rect x="6" y="66" width="26" height="26" rx="3" fill="#0a3d36" />
        <text x="19" y="83" text-anchor="middle" fill="#00b894" font-size="9" font-weight="bold">512</text>
        <rect x="36" y="66" width="26" height="26" rx="3" fill="#4d3b0d" stroke="#ffeaa7" stroke-width="1.5" filter="url(#g2-glow)" />
        <text x="49" y="83" text-anchor="middle" fill="#ffeaa7" font-size="8" font-weight="bold">2048</text>
        <rect x="66" y="66" width="26" height="26" rx="3" fill="#1f1b0a" />
        <rect x="96" y="66" width="26" height="26" rx="3" fill="#1f1b0a" />

        <rect x="6" y="96" width="26" height="26" rx="3" fill="#1f1b0a" />
        <rect x="36" y="96" width="26" height="26" rx="3" fill="#1f1b0a" />
        <rect x="66" y="96" width="26" height="26" rx="3" fill="#1f1b0a" />
        <rect x="96" y="96" width="26" height="26" rx="3" fill="#1f1b0a" />
      </g>
    </svg>
  `,

  'snake-eat': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="snk-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#02140d" />
          <stop offset="100%" stop-color="#05281a" />
        </linearGradient>
        <filter id="snk-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#snk-bg)" />
      <!-- Grid Lines -->
      <line x1="0" y1="50" x2="320" y2="50" stroke="rgba(0, 255, 136, 0.1)" stroke-width="1" />
      <line x1="0" y1="90" x2="320" y2="90" stroke="rgba(0, 255, 136, 0.1)" stroke-width="1" />
      <line x1="0" y1="130" x2="320" y2="130" stroke="rgba(0, 255, 136, 0.1)" stroke-width="1" />
      <line x1="80" y1="0" x2="80" y2="180" stroke="rgba(0, 255, 136, 0.1)" stroke-width="1" />
      <line x1="160" y1="0" x2="160" y2="180" stroke="rgba(0, 255, 136, 0.1)" stroke-width="1" />
      <line x1="240" y1="0" x2="240" y2="180" stroke="rgba(0, 255, 136, 0.1)" stroke-width="1" />

      <text x="15" y="18" fill="#00ff88" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SCORE: 1,840</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">LENGTH: 24</text>
      <text x="305" y="18" text-anchor="end" fill="#00f0ff" font-family="'Courier New', monospace" font-size="10" font-weight="bold">SPEED 1.6x</text>

      <!-- Glowing Food Pellets -->
      <circle cx="250" cy="70" r="7" fill="#ffe600" filter="url(#snk-glow)" />
      <circle cx="90" cy="130" r="6" fill="#ff007f" filter="url(#snk-glow)" />

      <!-- Glowing Segmented Snake Body -->
      <rect x="70" y="90" width="16" height="16" rx="4" fill="#00b894" opacity="0.6" />
      <rect x="90" y="90" width="16" height="16" rx="4" fill="#00b894" opacity="0.75" />
      <rect x="110" y="90" width="16" height="16" rx="4" fill="#00cec9" opacity="0.85" />
      <rect x="130" y="90" width="16" height="16" rx="4" fill="#00ff88" />
      <rect x="150" y="90" width="16" height="16" rx="4" fill="#00ff88" />
      <rect x="170" y="90" width="16" height="16" rx="4" fill="#00ff88" />
      <rect x="190" y="90" width="16" height="16" rx="4" fill="#00ff88" />
      <rect x="190" y="70" width="16" height="16" rx="4" fill="#00ff88" />
      <!-- Snake Head -->
      <rect x="210" y="70" width="18" height="18" rx="6" fill="#00ff88" filter="url(#snk-glow)" />
      <circle cx="222" cy="75" r="2" fill="#02140d" />
      <circle cx="222" cy="81" r="2" fill="#02140d" />
    </svg>
  `,

  'bug-climb': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="bug-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0a1805" />
          <stop offset="100%" stop-color="#142c0c" />
        </linearGradient>
        <filter id="bug-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#bug-bg)" />
      <text x="15" y="18" fill="#2ed573" font-family="'Courier New', monospace" font-size="10" font-weight="bold">HEIGHT: 84m</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">CADENCE 3.2x</text>
      <text x="305" y="18" text-anchor="end" fill="#ff4757" font-family="'Courier New', monospace" font-size="10" font-weight="bold">TIME [||||]</text>

      <!-- Center Tree Trunk -->
      <rect x="135" y="0" width="50" height="180" fill="#4a2e12" stroke="#6e4219" stroke-width="2" />
      <line x1="150" y1="0" x2="150" y2="180" stroke="#6e4219" stroke-width="1.5" stroke-dasharray="8 6" />
      <line x1="170" y1="0" x2="170" y2="180" stroke="#6e4219" stroke-width="1.5" stroke-dasharray="12 8" />

      <!-- Tree Branches -->
      <!-- Left Branch -->
      <rect x="55" y="50" width="80" height="14" rx="3" fill="#6e4219" stroke="#925925" stroke-width="1.5" />
      <polygon points="55,57 45,52 45,62" fill="#2ed573" />
      <!-- Right Branch -->
      <rect x="185" y="110" width="80" height="14" rx="3" fill="#6e4219" stroke="#925925" stroke-width="1.5" />
      <polygon points="265,117 275,112 275,122" fill="#2ed573" />

      <!-- Animated Climbing Bug on Left Trunk Side -->
      <g transform="translate(108, 110)">
        <ellipse cx="14" cy="16" rx="12" ry="16" fill="#2ed573" filter="url(#bug-glow)" />
        <circle cx="14" cy="6" r="6" fill="#7bed9f" />
        <!-- Eyes -->
        <circle cx="11" cy="4" r="1.5" fill="#000000" />
        <circle cx="17" cy="4" r="1.5" fill="#000000" />
        <!-- Legs -->
        <line x1="2" y1="12" x2="-4" y2="8" stroke="#2ed573" stroke-width="2" stroke-linecap="round" />
        <line x1="2" y1="20" x2="-4" y2="22" stroke="#2ed573" stroke-width="2" stroke-linecap="round" />
        <line x1="26" y1="12" x2="32" y2="8" stroke="#2ed573" stroke-width="2" stroke-linecap="round" />
        <line x1="26" y1="20" x2="32" y2="22" stroke="#2ed573" stroke-width="2" stroke-linecap="round" />
      </g>
    </svg>
  `,

  'car-race': `
    <svg viewBox="0 0 320 180" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="ac-game-screenshot">
      <defs>
        <linearGradient id="car-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0a0514" />
          <stop offset="100%" stop-color="#160826" />
        </linearGradient>
        <filter id="car-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="180" fill="url(#car-bg)" />
      <!-- Highway Road Surface -->
      <rect x="50" y="0" width="220" height="180" fill="#1e132c" stroke="#ff007f" stroke-width="2" />
      <!-- Dashed Lane Dividers -->
      <line x1="105" y1="0" x2="105" y2="180" stroke="rgba(255, 230, 0, 0.4)" stroke-width="2" stroke-dasharray="14 10" />
      <line x1="160" y1="0" x2="160" y2="180" stroke="rgba(255, 255, 255, 0.5)" stroke-width="2" stroke-dasharray="14 10" />
      <line x1="215" y1="0" x2="215" y2="180" stroke="rgba(255, 230, 0, 0.4)" stroke-width="2" stroke-dasharray="14 10" />

      <text x="15" y="18" fill="#ff4757" font-family="'Courier New', monospace" font-size="10" font-weight="bold">245 KM/H</text>
      <text x="160" y="18" text-anchor="middle" fill="#ffe600" font-family="'Courier New', monospace" font-size="10" font-weight="bold">DIST: 2.8 KM</text>
      <text x="305" y="18" text-anchor="end" fill="#00f0ff" font-family="'Courier New', monospace" font-size="10" font-weight="bold">DRAFT 2x</text>

      <!-- Traffic Vehicles Ahead -->
      <!-- Truck in Lane 1 -->
      <rect x="68" y="25" width="24" height="42" rx="3" fill="#e67e22" stroke="#d35400" stroke-width="1.5" />
      <!-- Police Cruiser in Lane 3 -->
      <rect x="178" y="45" width="20" height="32" rx="3" fill="#2c3e50" stroke="#3498db" stroke-width="1.5" />
      <rect x="186" y="56" width="4" height="4" fill="#e74c3c" />

      <!-- Player Neon Sports Car in Lane 2 -->
      <g transform="translate(122, 115)">
        <!-- Headlight Beams -->
        <polygon points="3,-25 19,-25 15,0 7,0" fill="rgba(0, 240, 255, 0.25)" />
        <rect x="2" y="0" width="18" height="36" rx="4" fill="#ff007f" stroke="#00f0ff" stroke-width="1.5" filter="url(#car-glow)" />
        <!-- Windshield -->
        <rect x="5" y="8" width="12" height="8" rx="2" fill="#00f0ff" />
        <!-- Tail lights -->
        <circle cx="4" cy="34" r="2" fill="#ffe600" />
        <circle cx="18" cy="34" r="2" fill="#ffe600" />
      </g>
    </svg>
  `
};
