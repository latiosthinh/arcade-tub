import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';

/**
 * BottomNav renders mobile bottom dock navigation (<768px) with accessible >=48px touch targets.
 */
export class BottomNav extends BaseComponent<AppState> {
  private store: Store<AppState>;

  constructor(store: Store<AppState>) {
    super('nav', 'ac-bottom-nav');
    this.store = store;

    this.element.setAttribute('aria-label', 'Mobile Navigation Bar');

    this.element.innerHTML = `
      <a href="#/" class="ac-bottom-item ac-bottom-home" data-path="/" aria-label="Home">
        <span class="ac-bottom-icon">🏠</span>
        <span class="ac-bottom-label">Home</span>
      </a>

      <a href="#/category/nobrain" class="ac-bottom-item ac-bottom-nobrain" data-path="/category/nobrain" aria-label="Relax Games">
        <span class="ac-bottom-icon">🧠</span>
        <span class="ac-bottom-label">Relax</span>
      </a>

      <a href="#/embed" class="ac-bottom-item ac-bottom-embed" data-path="/embed" aria-label="Embed Kit">
        <span class="ac-bottom-icon">📦</span>
        <span class="ac-bottom-label">Embed</span>
      </a>
    `;

    this.update(this.store.getState());
  }

  public update(state: AppState): void {
    const currentPath = state.route.path;

    const items = this.element.querySelectorAll<HTMLAnchorElement>('.ac-bottom-item');
    for (const item of items) {
      const path = item.getAttribute('data-path');
      if (path && (currentPath === path || (path === '/' && currentPath.startsWith('/game')))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  }
}
