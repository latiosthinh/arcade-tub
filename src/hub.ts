import { loadData } from '@arcade-carnival/playables-adapter';
import { audio } from '@arcade-carnival/game-engine';

interface GameItem {
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

const GAMES: GameItem[] = [
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

let activeFilter = 'all';
let activeSearch = '';
let activePlayingGame: GameItem | null = null;
let isTheaterMode = false;

function getPersonalHighScore(slug: string): number {
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

function renderUI(): void {
  const app = document.getElementById('app');
  if (!app) return;

  // Filter games based on search and genre
  const filtered = GAMES.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
                          g.description.toLowerCase().includes(activeSearch.toLowerCase()) ||
                          g.genre.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesFilter = activeFilter === 'all' ||
                          (activeFilter === 'action' && ['brick-blitz', 'type-strike'].includes(g.id)) ||
                          (activeFilter === 'arcade' && ['safe-cracker', 'crate-catch'].includes(g.id)) ||
                          (activeFilter === 'casual' && ['sky-hopper'].includes(g.id));
    return matchesSearch && matchesFilter;
  });

  app.innerHTML = `
    <!-- YouTube Top Navbar -->
    <header class="yt-header">
      <div class="yt-header-left">
        <button class="yt-icon-btn yt-menu-btn" aria-label="Main menu">
          <svg viewBox="0 0 24 24" class="yt-svg"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <div class="yt-logo" onclick="window.closeGame()">
          <div class="yt-logo-icon">
            <svg viewBox="0 0 24 24" class="yt-svg-play"><path fill="#ff0000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
          </div>
          <span class="yt-logo-text">Playables</span>
          <span class="yt-badge-beta">ARCADE</span>
        </div>
      </div>

      <div class="yt-header-center">
        <div class="yt-search-box">
          <input
            type="text"
            id="search-input"
            class="yt-search-input"
            placeholder="Search mini-games..."
            value="${activeSearch}"
          />
          <button class="yt-search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" class="yt-svg"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </button>
        </div>
      </div>

      <div class="yt-header-right">
        <button class="yt-icon-btn" onclick="window.toggleAudio()" title="Mute / Unmute (M)">
          <span id="audio-indicator">${audio.isMuted() ? '🔇' : '🔊'}</span>
        </button>
        <a href="/embed.html" class="yt-embed-link" title="Embed into your website">
          &lt;/&gt; Embed Kit
        </a>
        <div class="yt-avatar" title="Guest Player">🎮</div>
      </div>
    </header>

    <div class="yt-layout">
      <!-- YouTube Sidebar -->
      <aside class="yt-sidebar">
        <nav class="yt-nav">
          <button class="yt-nav-item ${activePlayingGame === null ? 'active' : ''}" onclick="window.closeGame()">
            <span class="yt-nav-icon">🏠</span>
            <span class="yt-nav-label">Home</span>
          </button>
          <div class="yt-nav-divider"></div>
          <div class="yt-nav-heading">GAMES</div>
          ${GAMES.map(g => `
            <button class="yt-nav-item ${activePlayingGame?.id === g.id ? 'active' : ''}" onclick="window.launchGame('${g.id}')">
              <span class="yt-nav-icon">${g.icon}</span>
              <span class="yt-nav-label">${g.title}</span>
            </button>
          `).join('')}
          <div class="yt-nav-divider"></div>
          <div class="yt-nav-heading">INTEGRATION</div>
          <a href="/embed.html" class="yt-nav-item">
            <span class="yt-nav-icon">📦</span>
            <span class="yt-nav-label">Embed SDK</span>
          </a>
        </nav>
      </aside>

      <!-- YouTube Main Feed / Player -->
      <main class="yt-main">
        ${activePlayingGame ? renderPlayerView(activePlayingGame) : renderFeedView(filtered)}
      </main>
    </div>
  `;

  // Attach search listener
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = (e.target as HTMLInputElement).value;
      renderUI();
      document.getElementById('search-input')?.focus();
    });
  }
}

function renderFeedView(gamesList: GameItem[]): string {
  const featured = GAMES[2]!; // Sky Hopper as top hero

  return `
    <!-- Top Filter Chips -->
    <div class="yt-chips-bar">
      <button class="yt-chip ${activeFilter === 'all' ? 'active' : ''}" onclick="window.setFilter('all')">All Games</button>
      <button class="yt-chip ${activeFilter === 'action' ? 'active' : ''}" onclick="window.setFilter('action')">Action & Breakout</button>
      <button class="yt-chip ${activeFilter === 'arcade' ? 'active' : ''}" onclick="window.setFilter('arcade')">Classic Arcade</button>
      <button class="yt-chip ${activeFilter === 'casual' ? 'active' : ''}" onclick="window.setFilter('casual')">Endless Jumpers</button>
    </div>

    <!-- YouTube Hero Banner -->
    <div class="yt-hero-banner" style="background: ${featured.bannerBg}">
      <div class="yt-hero-content">
        <div class="yt-hero-badge">⭐ FEATURED PLAYABLE</div>
        <h2 class="yt-hero-title">${featured.title}</h2>
        <p class="yt-hero-desc">${featured.description}</p>
        <div class="yt-hero-meta">
          <span>${featured.rating}</span> • <span>${featured.plays}</span> • <span style="color: var(--yt-primary)">High Score: ${getPersonalHighScore(featured.id).toLocaleString()}</span>
        </div>
        <div class="yt-hero-actions">
          <button class="yt-btn-play" onclick="window.launchGame('${featured.id}')">
            ▶ Play Instant
          </button>
        </div>
      </div>
      <div class="yt-hero-visual">
        <div class="yt-hero-icon">${featured.icon}</div>
      </div>
    </div>

    <!-- YouTube Playables Grid Section -->
    <div class="yt-section-header">
      <h3>Instant Playables (5 Games)</h3>
      <span class="yt-section-sub">No install required • 60 FPS Canvas Web Games</span>
    </div>

    <div class="yt-game-grid">
      ${gamesList.map(g => {
        const score = getPersonalHighScore(g.id);
        return `
          <div class="yt-card" onclick="window.launchGame('${g.id}')">
            <div class="yt-card-thumb" style="background: ${g.bannerBg}">
              <span class="yt-card-icon">${g.icon}</span>
              ${g.badge ? `<span class="yt-card-badge">${g.badge}</span>` : ''}
              <div class="yt-card-play-overlay">
                <div class="yt-card-play-circle">▶</div>
              </div>
            </div>
            <div class="yt-card-meta">
              <div class="yt-card-title-row">
                <h4 class="yt-card-title">${g.title}</h4>
              </div>
              <div class="yt-card-genre">${g.genre} • ${g.plays}</div>
              <div class="yt-card-score-row">
                <span>🏆 Best: <strong>${score > 0 ? score.toLocaleString() : '---'}</strong></span>
                <span class="yt-card-stars">${g.rating}</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderPlayerView(game: GameItem): string {
  const score = getPersonalHighScore(game.id);

  return `
    <div class="yt-player-container ${isTheaterMode ? 'theater' : ''}">
      <div class="yt-player-header">
        <button class="yt-btn-back" onclick="window.closeGame()">
          ← Back to Playables
        </button>
        <div class="yt-player-title-info">
          <span class="yt-player-icon">${game.icon}</span>
          <h2>${game.title}</h2>
          <span class="yt-player-badge">${game.genre}</span>
        </div>
        <div class="yt-player-actions">
          <button class="yt-icon-btn" onclick="window.toggleTheater()" title="Toggle Theater Mode">
            ${isTheaterMode ? '⤢ Default' : '⤡ Theater'}
          </button>
        </div>
      </div>

      <!-- Live Game Iframe Frame -->
      <div class="yt-game-frame-wrapper">
        <iframe
          id="active-game-frame"
          class="yt-game-frame"
          src="/games/${game.id}/index.html"
          allow="autoplay; fullscreen"
        ></iframe>
      </div>

      <!-- YouTube Video/Game Details Info Section Below Player -->
      <div class="yt-details-panel">
        <div class="yt-details-left">
          <h3 class="yt-details-title">${game.title}</h3>
          <div class="yt-details-stats">
            <span>${game.rating}</span> • <span>${game.plays}</span> • <span>YouTube Playables Verified</span>
          </div>
          <p class="yt-details-desc">${game.description}</p>
          <div class="yt-features-tags">
            ${game.features.map(f => `<span class="yt-tag">✓ ${f}</span>`).join('')}
          </div>
        </div>

        <div class="yt-details-right">
          <div class="yt-score-card">
            <div class="yt-score-label">PERSONAL HIGH SCORE</div>
            <div class="yt-score-num">${score > 0 ? score.toLocaleString() : 'No score yet'}</div>
            <div class="yt-score-hint">Scores auto-save locally & synchronize via Playables API</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Global window actions
declare global {
  interface Window {
    launchGame: (id: string) => void;
    closeGame: () => void;
    setFilter: (f: string) => void;
    toggleAudio: () => void;
    toggleTheater: () => void;
  }
}

window.launchGame = function(id: string) {
  const g = GAMES.find(x => x.id === id);
  if (g) {
    audio.playClick();
    activePlayingGame = g;
    renderUI();
  }
};

window.closeGame = function() {
  audio.playClick();
  activePlayingGame = null;
  renderUI();
};

window.setFilter = function(f: string) {
  audio.playClick();
  activeFilter = f;
  renderUI();
};

window.toggleAudio = function() {
  const isMuted = audio.toggleMute();
  const ind = document.getElementById('audio-indicator');
  if (ind) ind.textContent = isMuted ? '🔇' : '🔊';
};

window.toggleTheater = function() {
  isTheaterMode = !isTheaterMode;
  renderUI();
};

// Initial Render
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderUI);
} else {
  renderUI();
}
