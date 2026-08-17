import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppSidebar } from '../../src/components/AppSidebar';
import { BottomNav } from '../../src/components/BottomNav';
import { Store } from '../../src/core/Store';
import type { AppState } from '../../src/core/types';
import { GAMES } from '../../src/data/games';

describe('AppSidebar Component (src/components/AppSidebar.ts)', () => {
  let store: Store<AppState>;
  let container: HTMLElement;

  beforeEach(() => {
    store = new Store<AppState>({
      route: { path: '/', params: {} },
      activeFilter: 'all',
      searchQuery: '',
      isMuted: false,
      isTheaterMode: false,
      highScores: {}
    });
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders sidebar element with home link, all games, and embed link', () => {
    const sidebar = new AppSidebar(store);
    sidebar.mount(container);

    expect(sidebar.element.tagName.toLowerCase()).toBe('aside');
    expect(sidebar.element.classList.contains('ac-sidebar')).toBe(true);

    const homeLink = sidebar.element.querySelector('a[href="#/"]') as HTMLAnchorElement;
    expect(homeLink).toBeTruthy();

    const gameLinks = sidebar.element.querySelectorAll('.ac-nav-game');
    expect(gameLinks.length).toBe(GAMES.length);

    for (const game of GAMES) {
      const link = sidebar.element.querySelector(`a[href="#/game/${game.id}"]`);
      expect(link).toBeTruthy();
      expect(link?.textContent).toContain(game.title);
    }

    const embedLink = sidebar.element.querySelector('a[href="#/embed"]');
    expect(embedLink).toBeTruthy();

    sidebar.destroy();
  });

  it('highlights active navigation item based on route path and params', () => {
    const sidebar = new AppSidebar(store);
    sidebar.mount(container);

    const homeLink = sidebar.element.querySelector('a[href="#/"]')!;
    expect(homeLink.classList.contains('active')).toBe(true);

    // Navigate to a game
    store.setState({ route: { path: '/game/:id', params: { id: 'brick-blitz' } } });
    sidebar.update(store.getState());

    expect(homeLink.classList.contains('active')).toBe(false);
    const brickBlitzLink = sidebar.element.querySelector('a[href="#/game/brick-blitz"]')!;
    expect(brickBlitzLink.classList.contains('active')).toBe(true);

    // Navigate to embed
    store.setState({ route: { path: '/embed', params: {} } });
    sidebar.update(store.getState());

    expect(brickBlitzLink.classList.contains('active')).toBe(false);
    const embedLink = sidebar.element.querySelector('a[href="#/embed"]')!;
    expect(embedLink.classList.contains('active')).toBe(true);

    sidebar.destroy();
  });

  it('destroys and cleans up element without errors', () => {
    const sidebar = new AppSidebar(store);
    sidebar.mount(container);
    sidebar.destroy();

    expect(container.querySelector('.ac-sidebar')).toBeNull();
  });
});

describe('BottomNav Component (src/components/BottomNav.ts)', () => {
  let store: Store<AppState>;
  let container: HTMLElement;

  beforeEach(() => {
    store = new Store<AppState>({
      route: { path: '/', params: {} },
      activeFilter: 'all',
      searchQuery: '',
      isMuted: false,
      isTheaterMode: false,
      highScores: {}
    });
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders mobile navigation dock with links and accessible labels', () => {
    const nav = new BottomNav(store);
    nav.mount(container);

    expect(nav.element.tagName.toLowerCase()).toBe('nav');
    expect(nav.element.classList.contains('ac-bottom-nav')).toBe(true);

    const links = nav.element.querySelectorAll('.ac-bottom-item');
    expect(links.length).toBeGreaterThanOrEqual(3);

    for (const link of links) {
      expect(link.getAttribute('aria-label')).toBeTruthy();
    }

    nav.destroy();
  });

  it('updates active class according to current route', () => {
    const nav = new BottomNav(store);
    nav.mount(container);

    const homeItem = nav.element.querySelector('a[href="#/"]')!;
    expect(homeItem.classList.contains('active')).toBe(true);

    store.setState({ route: { path: '/embed', params: {} } });
    nav.update(store.getState());

    expect(homeItem.classList.contains('active')).toBe(false);
    const embedItem = nav.element.querySelector('a[href="#/embed"]')!;
    expect(embedItem.classList.contains('active')).toBe(true);

    nav.destroy();
  });

  it('cleans up cleanly on destroy()', () => {
    const nav = new BottomNav(store);
    nav.mount(container);
    nav.destroy();

    expect(container.querySelector('.ac-bottom-nav')).toBeNull();
  });
});
