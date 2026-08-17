import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { GAMES } from '../data/games';

/**
 * AppSidebar renders desktop navigation (>=768px).
 */
export class AppSidebar extends BaseComponent<AppState> {
  private store: Store<AppState>;

  constructor(store: Store<AppState>) {
    super('aside', 'ac-sidebar');
    this.store = store;

    this.element.innerHTML = `
      <nav class="ac-nav" aria-label="Desktop Sidebar Navigation">
        <a href="#/" class="ac-nav-item ac-nav-home" data-path="/">
          <span class="ac-nav-icon">🏠</span>
          <span class="ac-nav-label">Home</span>
        </a>

        <div class="ac-nav-divider"></div>
        <div class="ac-nav-heading">ARCADE GAMES</div>

        ${GAMES.map(g => `
          <a href="#/game/${g.id}" class="ac-nav-item ac-nav-game" data-game-id="${g.id}">
            <span class="ac-nav-icon">${g.icon}</span>
            <span class="ac-nav-label">${g.title}</span>
          </a>
        `).join('')}

        <div class="ac-nav-divider"></div>
        <div class="ac-nav-heading">INTEGRATION</div>

        <a href="#/embed" class="ac-nav-item ac-nav-embed" data-path="/embed">
          <span class="ac-nav-icon">📦</span>
          <span class="ac-nav-label">Embed SDK</span>
        </a>
      </nav>
    `;

    this.update(this.store.getState());
  }

  public update(state: AppState): void {
    const currentPath = state.route.path;
    const currentGameId = state.route.params.id;

    const navItems = this.element.querySelectorAll<HTMLAnchorElement>('.ac-nav-item');
    for (const item of navItems) {
      const dataPath = item.getAttribute('data-path');
      const dataGameId = item.getAttribute('data-game-id');

      let isActive = false;
      if (dataPath && currentPath === dataPath) {
        isActive = true;
      } else if (dataGameId && currentPath.startsWith('/game') && currentGameId === dataGameId) {
        isActive = true;
      }

      if (isActive) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  }
}
