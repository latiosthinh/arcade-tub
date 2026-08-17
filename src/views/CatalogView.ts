import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { GAMES, getPersonalHighScore } from '../data/games';
import { FilterChips } from '../components/FilterChips';
import { GameGrid } from '../components/GameGrid';

/**
 * CatalogView orchestrates hero banner, filter chips, and live game grid feed.
 */
export class CatalogView extends BaseComponent<AppState> {
  private store: Store<AppState>;
  private filterChips: FilterChips;
  private gameGrid: GameGrid;
  private heroScoreValueElement: HTMLElement | null = null;

  constructor(store: Store<AppState>) {
    super('div', 'ac-catalog-view');
    this.store = store;

    const featured = GAMES[2]!; // Sky Hopper featured
    const initialScore = store.getState().highScores[featured.id] ?? getPersonalHighScore(featured.id);

    // 1. Filter Chips
    this.filterChips = new FilterChips(this.store);
    this.filterChips.mount(this.element);

    // 2. Hero Banner
    const heroBanner = document.createElement('div');
    heroBanner.className = 'ac-hero-banner';
    heroBanner.style.background = featured.bannerBg;
    heroBanner.innerHTML = `
      <div class="ac-hero-content">
        <div class="ac-hero-badge">⭐ FEATURED PLAYABLE</div>
        <h2 class="ac-hero-title">${featured.title}</h2>
        <p class="ac-hero-desc">${featured.description}</p>
        <div class="ac-hero-meta">
          <span>${featured.rating}</span> • <span>${featured.plays}</span> • <span class="ac-hero-score">High Score: <strong class="ac-hero-score-val">${initialScore > 0 ? initialScore.toLocaleString() : '---'}</strong></span>
        </div>
        <div class="ac-hero-actions">
          <button class="ac-btn-hero-play" type="button" aria-label="Play ${featured.title} Instant">
            ▶ Play Instant
          </button>
        </div>
      </div>
      <div class="ac-hero-visual">
        <div class="ac-hero-icon">${featured.icon}</div>
      </div>
    `;
    this.element.appendChild(heroBanner);

    const playBtn = heroBanner.querySelector('.ac-btn-hero-play');
    if (playBtn) {
      this.addListener(playBtn, 'click', () => {
        window.location.hash = `#/game/${featured.id}`;
      });
    }
    this.heroScoreValueElement = heroBanner.querySelector('.ac-hero-score-val');

    // 3. Section Header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'ac-section-header';
    sectionHeader.innerHTML = `
      <h3 class="ac-section-title">Instant Playables (${GAMES.length} Games)</h3>
      <span class="ac-section-sub">No install required • 60 FPS Canvas Arcade Games</span>
    `;
    this.element.appendChild(sectionHeader);

    // 4. Game Grid
    this.gameGrid = new GameGrid(this.store);
    this.gameGrid.mount(this.element);

    this.update(this.store.getState());
  }

  public update(state: AppState): void {
    this.filterChips.update(state);
    this.gameGrid.update(state);

    const featured = GAMES[2]!;
    const score = state.highScores[featured.id] ?? getPersonalHighScore(featured.id);
    if (this.heroScoreValueElement) {
      this.heroScoreValueElement.textContent = score > 0 ? score.toLocaleString() : '---';
    }
  }

  public override destroy(): void {
    this.filterChips.destroy();
    this.gameGrid.destroy();
    super.destroy();
  }
}
