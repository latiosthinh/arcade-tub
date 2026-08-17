import { loadData } from '@arcade-carnival/playables-adapter';
import { audio } from '@arcade-carnival/game-engine';

interface GameCard {
  slug: string;
  name: string;
  genre: string;
  color: string;
  icon: string;
  shortcut: string;
}

const GAMES: GameCard[] = [
  { slug: 'safe-cracker', name: 'Safe Cracker', genre: 'Clicker / Timing', color: '#ffcc00', icon: '🔐', shortcut: '1' },
  { slug: 'brick-blitz', name: 'Brick Blitz', genre: 'Breakout', color: '#0984e3', icon: '🧱', shortcut: '2' },
  { slug: 'sky-hopper', name: 'Sky Hopper', genre: 'Vertical Platformer', color: '#6c5ce7', icon: '🚀', shortcut: '3' },
  { slug: 'crate-catch', name: 'Crate Catch', genre: 'Catcher / Stacker', color: '#00b894', icon: '📦', shortcut: '4' },
  { slug: 'type-strike', name: 'Type Strike', genre: 'Typing Defense', color: '#d63031', icon: '⌨️', shortcut: '5' },
];

let focusedIndex = 0;
let modalElement: HTMLElement | null = null;

function getHighScore(slug: string): number {
  try {
    const raw = loadData(`${slug}-highscore`);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 999999999) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return 0;
}

function toggleHelpModal(): void {
  if (!modalElement) {
    createHelpModal();
  }
  if (!modalElement) return;

  const isHidden = modalElement.classList.contains('hidden');
  if (isHidden) {
    modalElement.classList.remove('hidden');
    modalElement.setAttribute('aria-hidden', 'false');
    audio.playClick();
  } else {
    modalElement.classList.add('hidden');
    modalElement.setAttribute('aria-hidden', 'true');
    audio.playClick();
  }
}

function createHelpModal(): void {
  const modal = document.createElement('div');
  modal.id = 'help-modal';
  modal.className = 'hub-controls-modal hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Arcade Controls and Keyboard Shortcuts');
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>🎮 Arcade Controls & Shortcuts</h2>
        <button type="button" class="modal-close" aria-label="Close shortcuts dialog">✕</button>
      </div>
      <div class="modal-body">
        <div class="shortcut-row"><span class="kbd">1 - 5</span><span>Launch Minigame 1 to 5</span></div>
        <div class="shortcut-row"><span class="kbd">◄ / ► / ▲ / ▼</span><span>Navigate Game Cards</span></div>
        <div class="shortcut-row"><span class="kbd">Enter</span><span>Launch Selected Game</span></div>
        <div class="shortcut-row"><span class="kbd">M</span><span>Toggle Audio Mute</span></div>
        <div class="shortcut-row"><span class="kbd">? / H</span><span>Toggle Shortcuts Cheatsheet</span></div>
        <div class="shortcut-row"><span class="kbd">Esc</span><span>Close Modal / Return</span></div>
      </div>
      <button type="button" class="modal-dismiss-btn">Got It</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.modal-close')?.addEventListener('click', toggleHelpModal);
  modal.querySelector('.modal-dismiss-btn')?.addEventListener('click', toggleHelpModal);
  modal.querySelector('.modal-backdrop')?.addEventListener('click', toggleHelpModal);

  modalElement = modal;
}

function updateCardFocus(cards: HTMLAnchorElement[], newIndex: number): void {
  if (newIndex < 0) newIndex = cards.length - 1;
  if (newIndex >= cards.length) newIndex = 0;

  focusedIndex = newIndex;
  cards.forEach((card, idx) => {
    if (idx === focusedIndex) {
      card.classList.add('keyboard-focused');
      card.focus();
    } else {
      card.classList.remove('keyboard-focused');
    }
  });
}

function initHub(): void {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = '';

  // Header Bar with Title, Mute Toggle, Help Button
  const header = document.createElement('header');
  header.className = 'hub-header';
  header.setAttribute('role', 'banner');

  const title = document.createElement('h1');
  title.className = 'hub-title';
  title.textContent = 'Arcade Carnival';
  header.appendChild(title);

  const controlsBar = document.createElement('div');
  controlsBar.className = 'hub-top-controls';

  // Sound Mute Toggle Button
  const soundBtn = document.createElement('button');
  soundBtn.type = 'button';
  soundBtn.className = 'hub-btn-icon hub-sound-toggle';
  soundBtn.setAttribute('aria-label', audio.isMuted() ? 'Unmute Sound (M)' : 'Mute Sound (M)');
  soundBtn.title = 'Mute / Unmute (M)';
  soundBtn.textContent = audio.isMuted() ? '🔇 Muted' : '🔊 Sound';
  soundBtn.addEventListener('click', () => {
    const isMuted = audio.toggleMute();
    soundBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
    soundBtn.setAttribute('aria-label', isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)');
  });
  controlsBar.appendChild(soundBtn);

  // Help / Shortcuts Button
  const helpBtn = document.createElement('button');
  helpBtn.type = 'button';
  helpBtn.className = 'hub-btn-icon hub-help-toggle';
  helpBtn.setAttribute('aria-label', 'Show Keyboard Shortcuts (?)');
  helpBtn.title = 'Controls & Shortcuts (? or H)';
  helpBtn.textContent = '❓ Help [?]';
  helpBtn.addEventListener('click', toggleHelpModal);
  controlsBar.appendChild(helpBtn);

  header.appendChild(controlsBar);
  app.appendChild(header);

  // Main Cards Grid
  const main = document.createElement('main');
  main.setAttribute('role', 'main');

  const grid = document.createElement('div');
  grid.className = 'hub-grid';

  const cardElements: HTMLAnchorElement[] = [];

  for (let i = 0; i < GAMES.length; i++) {
    const game = GAMES[i]!;
    const bestScore = getHighScore(game.slug);

    const card = document.createElement('a');
    card.className = 'game-card';
    card.href = `/games/${game.slug}/index.html`;
    card.setAttribute('aria-label', `Play ${game.name}. Personal high score: ${bestScore}. Key shortcut: ${game.shortcut}`);
    card.setAttribute('tabindex', '0');
    card.style.setProperty('--accent', game.color);

    const formattedScore = bestScore > 0 ? bestScore.toLocaleString() : '---';

    card.innerHTML = `
      <div class="card-shortcut-badge">[${game.shortcut}]</div>
      <div class="card-thumbnail" style="background: ${game.color}20">
        <span>${game.icon}</span>
      </div>
      <div class="card-info">
        <div class="card-title">${game.name}</div>
        <div class="card-genre">${game.genre}</div>
        <div class="card-highscore" aria-label="High score: ${formattedScore}">
          🏆 BEST: <span class="score-value">${formattedScore}</span>
        </div>
        <span class="card-play">Play</span>
      </div>
    `;

    cardElements.push(card);
    grid.appendChild(card);
  }

  main.appendChild(grid);
  app.appendChild(main);

  // Setup Keyboard Shortcuts (1-5, Arrows, Enter, M, ?, H, Esc)
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // If modal open, Esc closes modal
    if (modalElement && !modalElement.classList.contains('hidden')) {
      if (e.key === 'Escape' || e.key === '?' || e.key === 'h' || e.key === 'H') {
        toggleHelpModal();
        e.preventDefault();
        return;
      }
    }

    if (e.key === '?' || e.key === 'h' || e.key === 'H') {
      toggleHelpModal();
      e.preventDefault();
      return;
    }

    if (e.key === 'm' || e.key === 'M') {
      const isMuted = audio.toggleMute();
      soundBtn.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
      soundBtn.setAttribute('aria-label', isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)');
      e.preventDefault();
      return;
    }

    // Number keys 1-5
    if (['1', '2', '3', '4', '5'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      const targetCard = cardElements[idx];
      if (targetCard) {
        audio.playClick();
        window.location.href = targetCard.href;
      }
      return;
    }

    // Arrow keys navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      updateCardFocus(cardElements, focusedIndex + 1);
      audio.playClick();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      updateCardFocus(cardElements, focusedIndex - 1);
      audio.playClick();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      const current = cardElements[focusedIndex];
      if (current && document.activeElement !== current) {
        audio.playClick();
        window.location.href = current.href;
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHub);
} else {
  initHub();
}

