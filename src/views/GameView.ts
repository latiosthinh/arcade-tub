import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { GAMES, getPersonalHighScore, type GameItem } from '../data/games';
import { uiAudio } from '../audio/ui-audio';

/**
 * GameView renders dedicated cyber-arcade player view for an active playable.
 * Handles skeleton placeholder, iframe lifecycle, auto-focus, Escape navigation, and theater mode.
 */
export class GameView extends BaseComponent<AppState> {
  private store: Store<AppState>;
  private game: GameItem | undefined;
  private iframeElement: HTMLIFrameElement | null = null;
  private skeletonElement: HTMLElement | null = null;
  private frameWrapperElement: HTMLElement | null = null;
  private theaterBtnElement: HTMLButtonElement | null = null;
  private scoreNumElement: HTMLElement | null = null;

  constructor(store: Store<AppState>, gameId: string) {
    super('div', 'ac-player-view');
    this.store = store;
    this.game = GAMES.find(g => g.id === gameId);

    if (!this.game) {
      this.renderNotFound();
      return;
    }

    this.renderPlayer(this.game);
    this.setupListeners();
    this.update(this.store.getState());
  }

  private renderNotFound(): void {
    this.element.innerHTML = `
      <div class="ac-player-not-found">
        <div class="ac-not-found-icon">👾</div>
        <h2 class="ac-not-found-title">Game Not Found</h2>
        <p class="ac-not-found-desc">The requested game could not be found in the Arcade Carnival registry.</p>
        <button class="ac-btn-back" type="button">
          ← Back to Catalog
        </button>
      </div>
    `;

    const backBtn = this.element.querySelector('.ac-btn-back');
    if (backBtn) {
      this.addListener(backBtn, 'click', () => {
        uiAudio.playTransition();
        window.location.hash = '#/';
      });
    }
  }

  private renderPlayer(game: GameItem): void {
    const initialScore = this.store.getState().highScores[game.id] ?? getPersonalHighScore(game.id);

    this.element.innerHTML = `
      <header class="ac-player-header">
        <div class="ac-player-header-left">
          <button class="ac-btn-back" type="button" aria-label="Back to Playables Catalog">
            ← Back to Games
          </button>
          <div class="ac-player-title-info">
            <span class="ac-player-icon">${game.icon}</span>
            <h2 class="ac-player-title">${game.title}</h2>
            <span class="ac-player-badge">${game.genre}</span>
          </div>
        </div>
        <div class="ac-player-header-right">
          <button class="ac-btn-theater" type="button" aria-label="Toggle Theater Mode (T)" title="Toggle Theater Mode (T)">
            <span class="ac-theater-icon">⤡</span>
            <span class="ac-theater-label">Theater</span>
          </button>
        </div>
      </header>

      <div class="ac-player-frame-wrapper">
        <div class="ac-skeleton-loader">
          <div class="ac-skeleton-spinner"></div>
          <div class="ac-skeleton-text">INITIALIZING ${game.title.toUpperCase()}...</div>
          <div class="ac-skeleton-hint">Press Escape anytime to return to catalog</div>
        </div>
        <iframe
          class="ac-game-frame"
          src="/games/${game.id}/index.html"
          allow="autoplay; fullscreen"
          title="${game.title} Game Canvas"
        ></iframe>
      </div>

      <div class="ac-player-details">
        <div class="ac-details-left">
          <h3 class="ac-details-title">${game.title}</h3>
          <div class="ac-details-stats">
            <span>${game.rating}</span> • <span>${game.plays}</span> • <span>YouTube Playables Verified</span>
          </div>
          <p class="ac-details-desc">${game.description}</p>
          <div class="ac-features-tags">
            ${game.features.map(f => `<span class="ac-tag">✓ ${f}</span>`).join('')}
          </div>
        </div>
        <div class="ac-details-right">
          <div class="ac-score-card">
            <div class="ac-score-label">PERSONAL HIGH SCORE</div>
            <div class="ac-score-num">${initialScore > 0 ? initialScore.toLocaleString() : '---'}</div>
            <div class="ac-score-hint">Scores auto-save locally & synchronize via Playables API</div>
          </div>
        </div>
      </div>
    `;

    this.iframeElement = this.element.querySelector('iframe.ac-game-frame');
    this.skeletonElement = this.element.querySelector('.ac-skeleton-loader');
    this.frameWrapperElement = this.element.querySelector('.ac-player-frame-wrapper');
    this.theaterBtnElement = this.element.querySelector('.ac-btn-theater');
    this.scoreNumElement = this.element.querySelector('.ac-score-num');
  }

  private setupListeners(): void {
    // Subscribe to store state changes
    const unsubStore = this.store.subscribe((state) => {
      this.update(state);
    });
    this.unbinds.push(unsubStore);

    // Back navigation button
    const backBtn = this.element.querySelector('.ac-btn-back');
    if (backBtn) {
      this.addListener(backBtn, 'click', () => {
        uiAudio.playTransition();
        window.location.hash = '#/';
      });
    }

    // Theater mode toggle button
    if (this.theaterBtnElement) {
      this.addListener(this.theaterBtnElement, 'click', () => {
        uiAudio.playClick();
        this.toggleTheater();
      });
    }

    // Iframe load event dismisses skeleton loader
    if (this.iframeElement) {
      this.addListener(this.iframeElement, 'load', () => {
        this.hideSkeleton();
      });
    }

    // Window message listener for postMessage communication
    const onMessage = (event: MessageEvent) => {
      // Validate source if contentWindow is available
      if (this.iframeElement?.contentWindow && event.source !== this.iframeElement.contentWindow && event.source !== window) {
        return;
      }
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'game-ready') {
        this.hideSkeleton();
      } else if (data.type === 'score' && typeof data.score === 'number' && this.game) {
        const currentScores = this.store.getState().highScores;
        const currentBest = currentScores[this.game.id] ?? 0;
        if (data.score > currentBest) {
          this.store.setState({
            highScores: {
              ...currentScores,
              [this.game.id]: data.score,
            },
          });
        }
      } else if (data.type === 'close') {
        uiAudio.playTransition();
        window.location.hash = '#/';
      }
    };
    this.addListener(window, 'message', onMessage);

    // Keyboard shortcuts: Escape (return to catalog), T (theater toggle)
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'Escape') {
        uiAudio.playTransition();
        window.location.hash = '#/';
      } else if (e.key === 't' || e.key === 'T' || e.code === 'KeyT') {
        uiAudio.playClick();
        this.toggleTheater();
      }
    };
    this.addListener(window, 'keydown', onKeyDown);

    // Focus iframe if accessible
    requestAnimationFrame(() => {
      this.iframeElement?.focus?.();
    });
  }

  private hideSkeleton(): void {
    if (this.skeletonElement) {
      this.skeletonElement.classList.add('is-hidden');
    }
  }

  private toggleTheater(): void {
    const isTheater = !this.store.getState().isTheaterMode;
    this.store.setState({ isTheaterMode: isTheater });
  }

  public update(state: AppState): void {
    if (!this.game) return;

    // Update theater mode classes
    if (this.frameWrapperElement) {
      this.frameWrapperElement.classList.toggle('is-theater', state.isTheaterMode);
    }
    this.element.classList.toggle('is-theater', state.isTheaterMode);

    if (this.theaterBtnElement) {
      this.theaterBtnElement.classList.toggle('is-active', state.isTheaterMode);
      const icon = this.theaterBtnElement.querySelector('.ac-theater-icon');
      const label = this.theaterBtnElement.querySelector('.ac-theater-label');
      if (icon) icon.textContent = state.isTheaterMode ? '⤢' : '⤡';
      if (label) label.textContent = state.isTheaterMode ? 'Default' : 'Theater';
    }

    // Update score display
    const score = state.highScores[this.game.id] ?? getPersonalHighScore(this.game.id);
    if (this.scoreNumElement) {
      this.scoreNumElement.textContent = score > 0 ? score.toLocaleString() : '---';
    }
  }

  public override destroy(): void {
    if (this.iframeElement) {
      try {
        this.iframeElement.contentWindow?.postMessage({ type: 'pause' }, '*');
      } catch {
        // Ignore cross-origin postMessage errors
      }
      this.iframeElement.src = 'about:blank';
    }
    super.destroy();
    this.iframeElement = null;
    this.skeletonElement = null;
    this.frameWrapperElement = null;
    this.theaterBtnElement = null;
    this.scoreNumElement = null;
  }
}
