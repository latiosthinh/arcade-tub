import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FilterChips } from '../../src/components/FilterChips';
import { Store } from '../../src/core/Store';
import type { AppState } from '../../src/core/types';
import { uiAudio } from '../../src/audio/ui-audio';

describe('FilterChips Component (src/components/FilterChips.ts)', () => {
  let store: Store<AppState>;
  let container: HTMLElement;

  beforeEach(() => {
    store = new Store<AppState>({
      route: { path: '/', params: {} },
      activeFilter: 'all',
      searchQuery: '',
      isMuted: false,
      isTheaterMode: false,
      highScores: {}
    });
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders filter chip buttons for all, action, arcade, puzzle, casual', () => {
    const chips = new FilterChips(store);
    chips.mount(container);

    expect(chips.element.classList.contains('ac-chips-bar')).toBe(true);

    const buttons = chips.element.querySelectorAll<HTMLButtonElement>('.ac-chip');
    expect(buttons.length).toBe(6);

    const allChip = chips.element.querySelector('[data-filter="all"]');
    const actionChip = chips.element.querySelector('[data-filter="action"]');
    const arcadeChip = chips.element.querySelector('[data-filter="arcade"]');
    const puzzleChip = chips.element.querySelector('[data-filter="puzzle"]');
    const casualChip = chips.element.querySelector('[data-filter="casual"]');

    expect(allChip).toBeTruthy();
    expect(actionChip).toBeTruthy();
    expect(arcadeChip).toBeTruthy();
    expect(puzzleChip).toBeTruthy();
    expect(casualChip).toBeTruthy();

    expect(allChip?.classList.contains('active')).toBe(true);

    chips.destroy();
  });

  it('clicking a filter chip updates store activeFilter and triggers audio click', () => {
    const clickSpy = vi.spyOn(uiAudio, 'playClick');
    const chips = new FilterChips(store);
    chips.mount(container);

    const actionChip = chips.element.querySelector<HTMLButtonElement>('[data-filter="action"]')!;
    actionChip.click();

    expect(clickSpy).toHaveBeenCalled();
    expect(store.getState().activeFilter).toBe('action');

    chips.update(store.getState());
    expect(actionChip.classList.contains('active')).toBe(true);

    const allChip = chips.element.querySelector<HTMLButtonElement>('[data-filter="all"]')!;
    expect(allChip.classList.contains('active')).toBe(false);

    chips.destroy();
  });

  it('cleans up event listeners on destroy()', () => {
    const chips = new FilterChips(store);
    chips.mount(container);
    chips.destroy();

    expect(container.querySelector('.ac-chips-bar')).toBeNull();
  });
});
