import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { toggleCrt } from '../crt';
import { uiAudio } from '../audio/ui-audio';

/**
 * AppHeader renders top navigation bar, search input with '/' shortcut, audio toggle, and CRT toggle.
 */
export class AppHeader extends BaseComponent<AppState> {
  private store: Store<AppState>;
  private searchInput: HTMLInputElement;
  private audioToggle: HTMLButtonElement;
  private crtToggle: HTMLButtonElement;

  constructor(store: Store<AppState>) {
    super('header', 'ac-header');
    this.store = store;

    this.element.innerHTML = `
      <div class="ac-header-left">
        <a href="#/" class="ac-logo" aria-label="Arcade Carnival Home">
          <span class="ac-logo-icon">🕹️</span>
          <span class="ac-logo-text">ARCADE CARNIVAL</span>
          <span class="ac-logo-badge">ARCADE</span>
        </a>
      </div>

      <div class="ac-header-center">
        <div class="ac-search-box">
          <input
            type="text"
            class="ac-search-input"
            placeholder="Search mini-games... (/)"
            aria-label="Search mini-games"
          />
          <span class="ac-search-shortcut">/</span>
        </div>
      </div>

      <div class="ac-header-right">
        <button class="ac-icon-btn ac-audio-toggle" title="Toggle Sound (M)" aria-label="Toggle Sound">
          🔊
        </button>
        <button class="ac-icon-btn ac-crt-toggle" title="Toggle CRT Scanline Effect" aria-label="Toggle CRT Scanline Effect">
          📺
        </button>
        <a href="#/embed" class="ac-embed-link" title="Embed into your website">
          &lt;/&gt; Embed
        </a>
      </div>
    `;

    this.searchInput = this.element.querySelector('.ac-search-input') as HTMLInputElement;
    this.audioToggle = this.element.querySelector('.ac-audio-toggle') as HTMLButtonElement;
    this.crtToggle = this.element.querySelector('.ac-crt-toggle') as HTMLButtonElement;

    this.setupListeners();
    this.update(this.store.getState());
  }

  private setupListeners(): void {
    // Search input updates store
    this.addListener(this.searchInput, 'input', () => {
      this.store.setState({ searchQuery: this.searchInput.value });
    });

    // Global keyboard shortcut '/' to focus search input
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        const active = document.activeElement;
        const isInput = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
        if (!isInput) {
          e.preventDefault();
          this.searchInput.focus();
        }
      }
    };
    this.addListener(window, 'keydown', onKeyDown);

    // Audio toggle
    this.addListener(this.audioToggle, 'click', () => {
      const nextMuted = !this.store.getState().isMuted;
      this.store.setState({ isMuted: nextMuted });
      uiAudio.setMuted(nextMuted);
      if (!nextMuted) {
        uiAudio.playClick();
      }
      this.audioToggle.textContent = nextMuted ? '🔇' : '🔊';
    });

    // CRT overlay toggle
    this.addListener(this.crtToggle, 'click', () => {
      uiAudio.playCrtToggle();
      toggleCrt();
    });
  }

  public update(state: AppState): void {
    if (this.searchInput.value !== state.searchQuery && document.activeElement !== this.searchInput) {
      this.searchInput.value = state.searchQuery;
    }
    this.audioToggle.textContent = state.isMuted ? '🔇' : '🔊';
  }
}
