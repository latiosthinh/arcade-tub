import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { GAMES, getPersonalHighScore } from '../data/games';
import { GameCard } from './GameCard';

/**
 * GameGrid manages instances of GameCard and dynamically toggles visibility based on filters.
 */
export class GameGrid extends BaseComponent<AppState> {
  private store: Store<AppState>;
  private cards: Map<string, GameCard> = new Map();
  private emptyStateElement: HTMLElement;
  private gridElement: HTMLElement;

  constructor(store: Store<AppState>) {
    super('div', 'ac-game-grid-container');
    this.store = store;

    this.gridElement = document.createElement('div');
    this.gridElement.className = 'ac-game-grid';
    this.element.appendChild(this.gridElement);

    this.emptyStateElement = document.createElement('div');
    this.emptyStateElement.className = 'ac-grid-empty is-hidden';
    this.emptyStateElement.innerHTML = `
      <div class="ac-empty-icon">👾</div>
      <h3 class="ac-empty-title">NO MINI-GAMES FOUND</h3>
      <p class="ac-empty-sub">Try searching for a different keyword or selecting "All Games".</p>
    `;
    this.element.appendChild(this.emptyStateElement);

    this.createCards();
    this.update(this.store.getState());
  }

  private createCards(): void {
    const state = this.store.getState();
    for (const game of GAMES) {
      const score = state.highScores[game.id] ?? getPersonalHighScore(game.id);
      const card = new GameCard(game, { highScore: score });
      card.mount(this.gridElement);
      this.cards.set(game.id, card);
    }
  }

  public update(state: AppState): void {
    const query = (state.searchQuery || '').toLowerCase().trim();
    const filter = state.activeFilter || 'all';

    let visibleCount = 0;

    for (const game of GAMES) {
      const card = this.cards.get(game.id);
      if (!card) continue;

      const score = state.highScores[game.id] ?? getPersonalHighScore(game.id);
      card.update(game, { highScore: score });

      const matchesSearch = !query ||
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query) ||
        game.genre.toLowerCase().includes(query);

      const matchesFilter = filter === 'all' ||
        (filter === 'action' && ['brick-blitz', 'type-strike', 'virus-defense', 'pop-balloon'].includes(game.id)) ||
        (filter === 'arcade' && ['safe-cracker', 'crate-catch', 'space-racer'].includes(game.id)) ||
        (filter === 'puzzle' && ['memory-cards', 'memory-boxes', 'game-2048'].includes(game.id)) ||
        (filter === 'casual' && ['sky-hopper', 'flappy-fish'].includes(game.id));

      if (matchesSearch && matchesFilter) {
        card.element.classList.remove('is-hidden');
        visibleCount++;
      } else {
        card.element.classList.add('is-hidden');
      }
    }

    if (visibleCount === 0) {
      this.emptyStateElement.classList.remove('is-hidden');
    } else {
      this.emptyStateElement.classList.add('is-hidden');
    }
  }

  public override destroy(): void {
    for (const card of this.cards.values()) {
      card.destroy();
    }
    this.cards.clear();
    super.destroy();
  }
}
