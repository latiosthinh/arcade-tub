interface GameCard {
  slug: string;
  name: string;
  genre: string;
  color: string;
  icon: string;
}

const GAMES: GameCard[] = [
  { slug: 'safe-cracker', name: 'Safe Cracker', genre: 'Clicker / Timing', color: '#ffcc00', icon: '🔐' },
  { slug: 'brick-blitz', name: 'Brick Blitz', genre: 'Breakout', color: '#0984e3', icon: '🧱' },
  { slug: 'sky-hopper', name: 'Sky Hopper', genre: 'Vertical Platformer', color: '#6c5ce7', icon: '🚀' },
  { slug: 'crate-catch', name: 'Crate Catch', genre: 'Catcher / Stacker', color: '#00b894', icon: '📦' },
  { slug: 'type-strike', name: 'Type Strike', genre: 'Typing Defense', color: '#d63031', icon: '⌨️' },
];

function initHub(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const title = document.createElement('h1');
  title.className = 'hub-title';
  title.textContent = 'Arcade Carnival';
  app.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'hub-grid';

  for (const game of GAMES) {
    const card = document.createElement('a');
    card.className = 'game-card';
    card.href = `/games/${game.slug}/index.html`;
    card.setAttribute('aria-label', `Play ${game.name}`);
    card.style.setProperty('--accent', game.color);

    card.innerHTML = `
      <div class="card-thumbnail" style="background: ${game.color}20">
        <span>${game.icon}</span>
      </div>
      <div class="card-info">
        <div class="card-title">${game.name}</div>
        <div class="card-genre">${game.genre}</div>
        <span class="card-play">Play</span>
      </div>
    `;

    grid.appendChild(card);
  }

  app.appendChild(grid);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHub);
} else {
  initHub();
}
