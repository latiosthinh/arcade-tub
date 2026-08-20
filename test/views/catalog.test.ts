import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CatalogView } from '../../src/views/CatalogView';
import { GameGrid } from '../../src/components/GameGrid';
import { Store } from '../../src/core/Store';
import type { AppState } from '../../src/core/types';
import { GAMES } from '../../src/data/games';

describe('GameGrid Component (src/components/GameGrid.ts)', () => {
  let store: Store<AppState>;
  let container: HTMLElement;

  beforeEach(() => {
    store = new Store<AppState>({
      route: { path: '/', params: {} },
      activeFilter: 'all',
      searchQuery: '',
      isMuted: false,
      isTheaterMode: false,
      highScores: { 'sky-hopper': 15000 }
    });
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders all game cards initially', () => {
    const grid = new GameGrid(store);
    grid.mount(container);

    const cards = grid.element.querySelectorAll('.ac-card');
    expect(cards.length).toBe(GAMES.length);

    const empty = grid.element.querySelector('.ac-grid-empty');
    expect(empty?.classList.contains('is-hidden')).toBe(true);

    grid.destroy();
  });

  it('filters cards by search query without removing DOM instances', () => {
    const grid = new GameGrid(store);
    grid.mount(container);

    const allCards = grid.element.querySelectorAll<HTMLElement>('.ac-card');
    const firstCardInstance = allCards[0];

    // Filter by "brick"
    store.setState({ searchQuery: 'brick' });
    grid.update(store.getState());

    // Still in DOM, but hidden with is-hidden
    const hiddenCards = grid.element.querySelectorAll<HTMLElement>('.ac-card.is-hidden');
    expect(hiddenCards.length).toBe(GAMES.length - 1);

    const visibleCards = grid.element.querySelectorAll<HTMLElement>('.ac-card:not(.is-hidden)');
    expect(visibleCards.length).toBe(1);
    expect(visibleCards[0]?.getAttribute('data-game-id')).toBe('brick-blitz');

    // Check same DOM instance was kept
    expect(grid.element.contains(firstCardInstance!)).toBe(true);

    grid.destroy();
  });

  it('filters cards by genre category mapping', () => {
    const grid = new GameGrid(store);
    grid.mount(container);

    // action filter -> brick-blitz, type-strike, pop-balloon, virus-defense, car-race
    store.setState({ activeFilter: 'action' });
    grid.update(store.getState());

    const visibleCards = grid.element.querySelectorAll<HTMLElement>('.ac-card:not(.is-hidden)');
    expect(visibleCards.length).toBe(5);

    const ids = Array.from(visibleCards).map(c => c.getAttribute('data-game-id'));
    expect(ids).toContain('brick-blitz');
    expect(ids).toContain('type-strike');
    expect(ids).toContain('pop-balloon');
    expect(ids).toContain('virus-defense');
    expect(ids).toContain('car-race');

    // puzzle filter -> memory-cards, memory-boxes, game-2048, potion-merge, mahjong-paper
    store.setState({ activeFilter: 'puzzle' });
    grid.update(store.getState());

    const puzzleCards = grid.element.querySelectorAll<HTMLElement>('.ac-card:not(.is-hidden)');
    expect(puzzleCards.length).toBe(5);
    const puzzleIds = Array.from(puzzleCards).map(c => c.getAttribute('data-game-id'));
    expect(puzzleIds).toContain('memory-cards');
    expect(puzzleIds).toContain('memory-boxes');
    expect(puzzleIds).toContain('game-2048');
    expect(puzzleIds).toContain('potion-merge');
    expect(puzzleIds).toContain('mahjong-paper');

    grid.destroy();
  });

  it('shows empty state when no games match', () => {
    const grid = new GameGrid(store);
    grid.mount(container);

    store.setState({ searchQuery: 'non-existent-game-xyz' });
    grid.update(store.getState());

    const empty = grid.element.querySelector('.ac-grid-empty');
    expect(empty?.classList.contains('is-hidden')).toBe(false);

    const visibleCards = grid.element.querySelectorAll<HTMLElement>('.ac-card:not(.is-hidden)');
    expect(visibleCards.length).toBe(0);

    grid.destroy();
  });
});

describe('CatalogView Component (src/views/CatalogView.ts)', () => {
  let store: Store<AppState>;
  let container: HTMLElement;

  beforeEach(() => {
    store = new Store<AppState>({
      route: { path: '/', params: {} },
      activeFilter: 'all',
      searchQuery: '',
      isMuted: false,
      isTheaterMode: false,
      highScores: { 'sky-hopper': 25000 }
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    window.location.hash = '#/';
  });

  afterEach(() => {
    container.remove();
  });

  it('renders filter chips, section header, and game grid', () => {
    const catalog = new CatalogView(store);
    catalog.mount(container);

    expect(catalog.element.classList.contains('ac-catalog-view')).toBe(true);

    const chips = catalog.element.querySelector('.ac-chips-bar');
    expect(chips).toBeTruthy();

    const header = catalog.element.querySelector('.ac-section-header');
    expect(header).toBeTruthy();

    const grid = catalog.element.querySelector('.ac-game-grid');
    expect(grid).toBeTruthy();

    catalog.destroy();
  });

  it('propagates state updates down to child components', () => {
    const catalog = new CatalogView(store);
    catalog.mount(container);

    store.setState({ searchQuery: 'Type Strike' });
    catalog.update(store.getState());

    const visibleCards = catalog.element.querySelectorAll<HTMLElement>('.ac-card:not(.is-hidden)');
    expect(visibleCards.length).toBe(1);
    expect(visibleCards[0]?.getAttribute('data-game-id')).toBe('type-strike');

    catalog.destroy();
  });

  it('cleans up all child components on destroy()', () => {
    const catalog = new CatalogView(store);
    catalog.mount(container);
    catalog.destroy();

    expect(container.querySelector('.ac-catalog-view')).toBeNull();
  });
});
