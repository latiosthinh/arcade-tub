import { BaseComponent } from '../core/Component';
import type { GameItem } from '../data/games';

export interface GameCardState {
  highScore?: number;
}

/**
 * GameCard renders rich arcade game metadata with high scores, rating, and neon glow.
 */
export class GameCard extends BaseComponent<GameItem, GameCardState> {
  private game: GameItem;
  private highScore: number;

  constructor(game: GameItem, state: GameCardState = {}) {
    super('div', 'ac-card');
    this.game = game;
    this.highScore = state.highScore ?? 0;

    this.element.setAttribute('tabindex', '0');
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('aria-label', `Play ${game.title} - ${game.genre}`);
    this.element.setAttribute('data-game-id', game.id);

    this.render();
    this.setupListeners();
  }

  private render(): void {
    const formattedScore = this.highScore > 0 ? this.highScore.toLocaleString() : '---';

    this.element.innerHTML = `
      <div class="ac-card-thumb" style="background: ${this.game.bannerBg}">
        <span class="ac-card-icon">${this.game.icon}</span>
        ${this.game.badge ? `<span class="ac-card-badge">${this.game.badge}</span>` : ''}
        <div class="ac-card-play-overlay">
          <div class="ac-card-play-circle">▶</div>
        </div>
      </div>
      <div class="ac-card-meta">
        <div class="ac-card-title-row">
          <h4 class="ac-card-title">${this.game.title}</h4>
        </div>
        <div class="ac-card-genre">${this.game.genre} • ${this.game.plays}</div>
        <div class="ac-card-score-row">
          <span class="ac-card-score-badge">🏆 Best: <strong class="ac-card-score-value">${formattedScore}</strong></span>
          <span class="ac-card-rating">${this.game.rating}</span>
        </div>
      </div>
    `;
  }

  private setupListeners(): void {
    const navigate = () => {
      window.location.hash = `#/game/${this.game.id}`;
    };

    this.addListener(this.element, 'click', navigate);

    this.addListener(this.element, 'keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });
  }

  public update(game: GameItem, state?: GameCardState): void {
    this.game = game;
    if (state && typeof state.highScore === 'number') {
      this.highScore = state.highScore;
    }
    const scoreVal = this.element.querySelector('.ac-card-score-value');
    if (scoreVal) {
      scoreVal.textContent = this.highScore > 0 ? this.highScore.toLocaleString() : '---';
    }
  }
}
