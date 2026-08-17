import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Store } from '../src/core/Store';
import { HashRouter } from '../src/core/Router';
import type { AppState } from '../src/core/types';
import { AppHeader } from '../src/components/AppHeader';
import { AppSidebar } from '../src/components/AppSidebar';
import { BottomNav } from '../src/components/BottomNav';
import { CatalogView } from '../src/views/CatalogView';
import { GameView } from '../src/views/GameView';
import { EmbedView } from '../src/views/EmbedView';

describe('App Shell and Router Integration', () => {
  let store: Store<AppState>;
  let container: HTMLElement;
  let viewContainer: HTMLElement;
  let router: HashRouter;
  let currentView: any = null;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);

    store = new Store<AppState>({
      route: { path: '/', params: {} },
      activeFilter: 'all',
      searchQuery: '',
      isMuted: false,
      isTheaterMode: false,
      highScores: {},
    });

    const header = new AppHeader(store);
    header.mount(container);

    const layout = document.createElement('div');
    layout.className = 'ac-layout';

    viewContainer = document.createElement('main');
    viewContainer.id = 'view-container';
    viewContainer.className = 'ac-main';
    layout.appendChild(viewContainer);

    container.appendChild(layout);

    const bottomNav = new BottomNav(store);
    bottomNav.mount(container);

    store.subscribe((state) => {
      header.update(state);
      bottomNav.update(state);
    });

    router = new HashRouter();
    router
      .on('/', () => {
        currentView?.destroy();
        currentView = new CatalogView(store);
        currentView.mount(viewContainer);
        store.setState({ route: { path: '/', params: {} } });
      })
      .on('/game/:id', (params) => {
        currentView?.destroy();
        currentView = new GameView(store, params.id || '');
        currentView.mount(viewContainer);
        store.setState({ route: { path: `/game/${params.id}`, params } });
      })
      .on('/embed', () => {
        currentView?.destroy();
        currentView = new EmbedView(store);
        currentView.mount(viewContainer);
        store.setState({ route: { path: '/embed', params: {} } });
      })
      .notFound(() => {
        router.navigate('#/');
      });
  });

  afterEach(() => {
    currentView?.destroy();
    router.stop();
    container.remove();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('initializes AppShell with Header, BottomNav, and view-container', () => {
    expect(container.querySelector('.ac-header')).not.toBeNull();
    expect(container.querySelector('.ac-bottom-nav')).not.toBeNull();
    expect(container.querySelector('#view-container')).not.toBeNull();
  });

  it('routes to CatalogView on #/, GameView on #/game/:id, and EmbedView on #/embed', () => {
    router.resolve('#/');
    expect(viewContainer.querySelector('.ac-catalog-view')).not.toBeNull();

    router.resolve('#/game/brick-blitz');
    expect(viewContainer.querySelector('.ac-player-view')).not.toBeNull();
    expect(viewContainer.querySelector('.ac-player-title')?.textContent).toBe('Brick Blitz');

    router.resolve('#/embed');
    expect(viewContainer.querySelector('.ac-embed-view')).not.toBeNull();
  });

  it('correctly destroys previous view when navigating to a new route', () => {
    router.resolve('#/game/safe-cracker');
    const playerView = currentView;
    const destroySpy = vi.spyOn(playerView, 'destroy');

    router.resolve('#/embed');
    expect(destroySpy).toHaveBeenCalled();
    expect(viewContainer.querySelector('.ac-player-view')).toBeNull();
    expect(viewContainer.querySelector('.ac-embed-view')).not.toBeNull();
  });

  it('subscribes components to store state changes (search, mute, route)', () => {
    router.resolve('#/');

    store.setState({ isMuted: true, searchQuery: 'Sky' });

    const audioBtn = container.querySelector('.ac-audio-toggle');
    expect(audioBtn?.textContent).toBe('🔇');

    const searchInput = container.querySelector('.ac-search-input') as HTMLInputElement;
    expect(searchInput.value).toBe('Sky');
  });
});
