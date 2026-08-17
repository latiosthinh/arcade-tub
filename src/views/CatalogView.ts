import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { GAMES } from '../data/games';
import { FilterChips } from '../components/FilterChips';
import { GameGrid } from '../components/GameGrid';

/**
 * CatalogView orchestrates filter chips and live game grid feed.
 */
export class CatalogView extends BaseComponent<AppState> {
  private store: Store<AppState>;
  private filterChips: FilterChips;
  private gameGrid: GameGrid;

  constructor(store: Store<AppState>) {
    super('div', 'ac-catalog-view');
    this.store = store;

    // 1. Filter Chips
    this.filterChips = new FilterChips(this.store);
    this.filterChips.mount(this.element);

    // 2. Section Header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'ac-section-header';
    sectionHeader.innerHTML = `
      <h3 class="ac-section-title">Arcade Games (${GAMES.length} Games)</h3>
      <span class="ac-section-sub">No install required • 60 FPS Canvas Arcade Games</span>
    `;
    this.element.appendChild(sectionHeader);

    // 3. Game Grid
    this.gameGrid = new GameGrid(this.store);
    this.gameGrid.mount(this.element);

    this.update(this.store.getState());
  }

  public update(state: AppState): void {
    this.filterChips.update(state);
    this.gameGrid.update(state);
  }

  public override destroy(): void {
    this.filterChips.destroy();
    this.gameGrid.destroy();
    super.destroy();
  }
}
