import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { GAMES, getPersonalHighScore } from '../data/games';
import { GameCard } from './GameCard';

/**
 * GameGrid manages instances of GameCard, sorted alphabetically and grouped by status.
 */
export class GameGrid extends BaseComponent<AppState> {
  private store: Store<AppState>;
  private cards: Map<string, GameCard> = new Map();
  private emptyStateElement: HTMLElement;
  private activeSectionElement: HTMLElement;
  private activeGridElement: HTMLElement;
  private maintenanceSectionElement: HTMLElement;
  private maintenanceGridElement: HTMLElement;

  constructor(store: Store<AppState>) {
    super('div', 'ac-game-grid-container');
    this.store = store;

    // Active Playable Games Section
    this.activeSectionElement = document.createElement('section');
    this.activeSectionElement.className = 'ac-catalog-section ac-section-active';
    this.activeSectionElement.innerHTML = `
      <div class="ac-group-header">
        <h4 class="ac-group-title">🎮 Available Games</h4>
        <span class="ac-group-badge ac-badge-playable">Ready to Play</span>
      </div>
    `;
    this.activeGridElement = document.createElement('div');
    this.activeGridElement.className = 'ac-game-grid';
    this.activeSectionElement.appendChild(this.activeGridElement);
    this.element.appendChild(this.activeSectionElement);

    // Maintenance / Disabled Games Section
    this.maintenanceSectionElement = document.createElement('section');
    this.maintenanceSectionElement.className = 'ac-catalog-section ac-section-maintenance';
    this.maintenanceSectionElement.innerHTML = `
      <div class="ac-group-header">
        <h4 class="ac-group-title">🛠️ Under Maintenance</h4>
        <span class="ac-group-badge ac-badge-maintenance">Coming Soon / Updating</span>
      </div>
    `;
    this.maintenanceGridElement = document.createElement('div');
    this.maintenanceGridElement.className = 'ac-game-grid';
    this.maintenanceSectionElement.appendChild(this.maintenanceGridElement);
    this.element.appendChild(this.maintenanceSectionElement);

    // Empty state
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
    // Sort games alphabetically by title
    const sortedGames = [...GAMES].sort((a, b) => a.title.localeCompare(b.title));

    for (const game of sortedGames) {
      const score = state.highScores[game.id] ?? getPersonalHighScore(game.id);
      const card = new GameCard(game, { highScore: score });
      if (game.disabled) {
        card.mount(this.maintenanceGridElement);
      } else {
        card.mount(this.activeGridElement);
      }
      this.cards.set(game.id, card);
    }
  }

  public update(state: AppState): void {
    const query = (state.searchQuery || '').toLowerCase().trim();
    const filter = state.activeFilter || 'all';

    let activeVisibleCount = 0;
    let maintenanceVisibleCount = 0;

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
        (filter === 'action' && ['brick-blitz', 'type-strike', 'virus-defense', 'pop-balloon', 'car-race'].includes(game.id)) ||
        (filter === 'arcade' && ['safe-cracker', 'crate-catch', 'space-racer', 'snake-eat', 'paper-basket'].includes(game.id)) ||
        (filter === 'puzzle' && ['memory-cards', 'memory-boxes', 'game-2048', 'potion-merge', 'mahjong-paper'].includes(game.id)) ||
        (filter === 'casual' && ['sky-hopper', 'flappy-fish', 'bug-climb'].includes(game.id));

      if (matchesSearch && matchesFilter) {
        card.element.classList.remove('is-hidden');
        if (game.disabled) {
          maintenanceVisibleCount++;
        } else {
          activeVisibleCount++;
        }
      } else {
        card.element.classList.add('is-hidden');
      }
    }

    this.activeSectionElement.style.display = activeVisibleCount > 0 ? 'flex' : 'none';
    this.maintenanceSectionElement.style.display = maintenanceVisibleCount > 0 ? 'flex' : 'none';

    if (activeVisibleCount === 0 && maintenanceVisibleCount === 0) {
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
