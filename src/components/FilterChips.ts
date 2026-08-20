import { BaseComponent } from '../core/Component';
import type { AppState } from '../core/types';
import type { Store } from '../core/Store';
import { uiAudio } from '../audio/ui-audio';

const FILTERS = [
  { id: 'all', label: 'All Games' },
  { id: 'nobrain', label: '🧠 Relax & No-Brain' },
  { id: 'action', label: 'Action & Defense' },
  { id: 'arcade', label: 'Classic Arcade' },
  { id: 'puzzle', label: 'Puzzle & Memory' },
  { id: 'casual', label: 'Casual & Jumpers' }
];

/**
 * FilterChips renders arcade genre filter buttons.
 */
export class FilterChips extends BaseComponent<AppState> {
  private store: Store<AppState>;

  constructor(store: Store<AppState>) {
    super('div', 'ac-chips-bar');
    this.store = store;

    this.element.setAttribute('role', 'toolbar');
    this.element.setAttribute('aria-label', 'Filter games by genre');

    this.element.innerHTML = FILTERS.map(f => `
      <button
        type="button"
        class="ac-chip ${f.id === this.store.getState().activeFilter ? 'active' : ''}"
        data-filter="${f.id}"
      >
        ${f.label}
      </button>
    `).join('');

    this.setupListeners();
  }

  private setupListeners(): void {
    const buttons = this.element.querySelectorAll<HTMLButtonElement>('.ac-chip');
    for (const btn of buttons) {
      this.addListener(btn, 'click', () => {
        const filter = btn.getAttribute('data-filter') || 'all';
        uiAudio.playClick();
        this.store.setState({ activeFilter: filter });
        if (filter === 'all') {
          window.location.hash = '#/';
        } else {
          window.location.hash = `#/category/${filter}`;
        }
      });
    }
  }

  public update(state: AppState): void {
    const buttons = this.element.querySelectorAll<HTMLButtonElement>('.ac-chip');
    for (const btn of buttons) {
      const filter = btn.getAttribute('data-filter');
      if (filter === state.activeFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }
}
