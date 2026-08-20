import { Store } from './core/Store';
import { HashRouter } from './core/Router';
import type { AppState, Component } from './core/types';
import { GAMES, getPersonalHighScore } from './data/games';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { CatalogView } from './views/CatalogView';
import { GameView } from './views/GameView';
import { EmbedView } from './views/EmbedView';
import { initCrtOverlay } from './crt';
import { uiAudio } from './audio/ui-audio';

/**
 * Loads initial high scores from local storage for all registered games.
 */
function loadInitialHighScores(): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const game of GAMES) {
    const score = getPersonalHighScore(game.id);
    if (score > 0) {
      scores[game.id] = score;
    }
  }
  return scores;
}

/**
 * Central SPA bootstrapper orchestrating reactive Store, HashRouter, AppShell, and View Transitions.
 */
function bootstrap(): void {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    throw new Error('[ArcadeCarnival] Missing #app root container in DOM.');
  }

  // Initialize CRT scanline/bloom overlay (disabled by default)
  initCrtOverlay();

  // 1. Initialize reactive Store with persisted mute preference
  const store = new Store<AppState>({
    route: { path: '/', params: {} },
    activeFilter: 'all',
    searchQuery: '',
    isMuted: uiAudio.isMuted(),
    isTheaterMode: false,
    highScores: loadInitialHighScores(),
  });

  // 2. Mount App Shell Structure
  const header = new AppHeader(store);
  header.mount(appContainer);

  const layout = document.createElement('div');
  layout.className = 'ac-layout';

  const viewContainer = document.createElement('main');
  viewContainer.id = 'view-container';
  viewContainer.className = 'ac-main';
  layout.appendChild(viewContainer);

  appContainer.appendChild(layout);

  const bottomNav = new BottomNav(store);
  bottomNav.mount(appContainer);

  // 3. Subscribe App Shell Components and Audio Synthesizer to Store Changes
  store.subscribe((state) => {
    uiAudio.setMuted(state.isMuted);
    header.update(state);
    bottomNav.update(state);
  });

  // 4. Client-side Hash Router and View Lifecycle Manager
  let currentView: Component<AppState> | null = null;
  let isFirstLoad = true;

  const mountView = (view: Component<AppState>, path: string, params: Record<string, string> = {}) => {
    if (!isFirstLoad) {
      uiAudio.playTransition();
    }
    isFirstLoad = false;

    if (currentView) {
      currentView.destroy();
      currentView = null;
    }
    viewContainer.innerHTML = '';
    currentView = view;
    currentView.mount(viewContainer);
    store.setState({ route: { path, params } });
  };

  const router = new HashRouter();

  router
    .on('/', () => {
      mountView(new CatalogView(store), '/');
    })
    .on('/game/:id', (params) => {
      const gameId = params.id || '';
      const targetGame = GAMES.find(g => g.id === gameId);
      if (targetGame?.disabled) {
        router.navigate('#/');
        return;
      }
      mountView(new GameView(store, gameId), `/game/${gameId}`, params);
    })
    .on('/embed', () => {
      mountView(new EmbedView(store), '/embed');
    })
    .notFound(() => {
      router.navigate('#/');
    });

  // 5. Start router with View Transitions enabled
  router.start(true);
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
