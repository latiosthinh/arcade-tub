import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { GAMES } from '../data/games';
import { ArcadeEmbed } from '@arcade-carnival/playables-adapter';

/**
 * EmbedView provides an interactive embed preview sandbox, tab-based game selector, and code snippets.
 */
export class EmbedView extends BaseComponent<AppState> {
  private store: Store<AppState>;
  private activeGameId: string = GAMES[0]?.id ?? 'safe-cracker';
  private embedInstance: ArcadeEmbed | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private scoreValueElement: HTMLElement | null = null;

  constructor(store: Store<AppState>) {
    super('div', 'ac-embed-view');
    this.store = store;

    this.render();
    this.setupListeners();
    this.mountEmbed(this.activeGameId);
  }

  private render(): void {
    this.element.innerHTML = `
      <header class="ac-embed-header">
        <h2 class="ac-embed-title">&lt;/&gt; Arcade Carnival Embed Kit</h2>
        <p class="ac-embed-subtitle">
          Embed any of our 5 60-FPS HTML5 Canvas arcade games directly into your React, Vue, or static website with full score tracking, lifecycle control, and zero runtime dependencies.
        </p>
      </header>

      <div class="ac-embed-grid">
        <!-- Interactive Preview Sandbox -->
        <div class="ac-embed-card">
          <h3 class="ac-embed-card-title">🕹️ Live Embed Preview</h3>
          <div class="ac-embed-tabs" role="tablist" aria-label="Select game to preview">
            ${GAMES.map(
              (g, i) => `
              <button
                type="button"
                role="tab"
                class="ac-embed-tab ${g.id === this.activeGameId ? 'is-active' : ''}"
                data-game-id="${g.id}"
                aria-selected="${g.id === this.activeGameId ? 'true' : 'false'}"
              >
                ${g.icon} ${g.title}
              </button>
            `
            ).join('')}
          </div>

          <div class="ac-embed-sandbox" id="embed-sandbox-target"></div>

          <div class="ac-embed-score-banner">
            <span class="ac-embed-score-label">Live Score Callback:</span>
            <span class="ac-embed-score-val" id="embed-live-score">0</span>
          </div>
        </div>

        <!-- Integration Guide & Code Samples -->
        <div class="ac-embed-card">
          <h3 class="ac-embed-card-title">📖 Integration Guide</h3>

          <div class="ac-code-section">
            <h4 class="ac-code-heading">Option A: HTML Web Component</h4>
            <pre class="ac-code-block">&lt;script src="https://cdn.example.com/arcade-carnival-embed.js"&gt;&lt;/script&gt;

&lt;arcade-game
  game="safe-cracker"
  width="100%"
  height="480px"&gt;
&lt;/arcade-game&gt;

&lt;script&gt;
  document.querySelector('arcade-game').addEventListener('score', (e) =&gt; {
    console.log('Score:', e.detail.score);
  });
&lt;/script&gt;</pre>
          </div>

          <div class="ac-code-section">
            <h4 class="ac-code-heading">Option B: JavaScript / TypeScript SDK</h4>
            <pre class="ac-code-block">import { ArcadeEmbed } from '@arcade-carnival/playables-adapter';

const embed = new ArcadeEmbed({
  container: '#game-container',
  game: '${this.activeGameId}',
  onScore: (score) =&gt; console.log('Score:', score),
  onGameReady: () =&gt; console.log('Game Ready!')
});

// Lifecycle Control
embed.pause();
embed.resume();
embed.destroy();</pre>
          </div>

          <div class="ac-code-section">
            <h4 class="ac-code-heading">Option C: Zero-Dependency Iframe</h4>
            <pre class="ac-code-block">&lt;iframe
  src="https://your-domain.com/games/safe-cracker/index.html"
  width="100%"
  height="480"
  allow="autoplay; fullscreen"
  style="border:none; border-radius:12px;"&gt;
&lt;/iframe&gt;</pre>
          </div>
        </div>
      </div>
    `;

    this.sandboxContainer = this.element.querySelector('#embed-sandbox-target');
    this.scoreValueElement = this.element.querySelector('#embed-live-score');
  }

  private setupListeners(): void {
    const tabs = this.element.querySelectorAll<HTMLButtonElement>('.ac-embed-tab');
    for (const tab of tabs) {
      this.addListener(tab, 'click', () => {
        const gameId = tab.getAttribute('data-game-id');
        if (gameId && gameId !== this.activeGameId) {
          this.switchGame(gameId);
        }
      });
    }
  }

  private switchGame(gameId: string): void {
    this.activeGameId = gameId;

    const tabs = this.element.querySelectorAll<HTMLButtonElement>('.ac-embed-tab');
    for (const tab of tabs) {
      const match = tab.getAttribute('data-game-id') === gameId;
      tab.classList.toggle('is-active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    }

    if (this.scoreValueElement) {
      this.scoreValueElement.textContent = '0';
    }

    this.mountEmbed(gameId);
  }

  private mountEmbed(gameId: string): void {
    if (this.embedInstance) {
      this.embedInstance.destroy();
      this.embedInstance = null;
    }

    if (!this.sandboxContainer) return;
    this.sandboxContainer.innerHTML = '';

    try {
      this.embedInstance = new ArcadeEmbed({
        container: this.sandboxContainer,
        game: gameId as any,
        width: '100%',
        height: '480px',
        onScore: (score) => {
          if (this.scoreValueElement) {
            this.scoreValueElement.textContent = score.toLocaleString();
          }
        },
      });
    } catch {
      // Graceful fallback for non-browser/test environments
    }
  }

  public update(_state: AppState): void {
    // EmbedView is largely self-contained
  }

  public override destroy(): void {
    if (this.embedInstance) {
      this.embedInstance.destroy();
      this.embedInstance = null;
    }
    super.destroy();
    this.sandboxContainer = null;
    this.scoreValueElement = null;
  }
}
