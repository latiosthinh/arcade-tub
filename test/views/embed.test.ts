import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EmbedView } from '../../src/views/EmbedView';
import { Store } from '../../src/core/Store';
import type { AppState } from '../../src/core/types';
import { GAMES } from '../../src/data/games';

describe('EmbedView', () => {
  let store: Store<AppState>;
  let container: HTMLElement;

  beforeEach(() => {
    store = new Store<AppState>({
      route: { path: '/embed', params: {} },
      activeFilter: 'all',
      searchQuery: '',
      isMuted: false,
      isTheaterMode: false,
      highScores: {},
    });
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts EmbedView, renders live preview container, game switcher tabs, and code snippets', () => {
    const view = new EmbedView(store);
    view.mount(container);

    expect(container.querySelector('.ac-embed-title')?.textContent).toContain('Embed Kit');
    expect(container.querySelector('#embed-sandbox-target')).not.toBeNull();

    const tabs = container.querySelectorAll('.ac-embed-tab');
    expect(tabs.length).toBe(GAMES.length);
    expect(tabs[0]?.classList.contains('is-active')).toBe(true);

    const codeBlocks = container.querySelectorAll('.ac-code-block');
    expect(codeBlocks.length).toBe(3);

    view.destroy();
  });

  it('switching game tab updates live preview iframe and active tab styling', () => {
    const view = new EmbedView(store);
    view.mount(container);

    const tabs = container.querySelectorAll<HTMLButtonElement>('.ac-embed-tab');
    const secondTab = tabs[1]!;

    secondTab.click();

    expect(secondTab.classList.contains('is-active')).toBe(true);
    expect(tabs[0]?.classList.contains('is-active')).toBe(false);

    const iframe = container.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.src).toContain(GAMES[1]!.id);

    view.destroy();
  });

  it('updates score banner when embed emits score message', () => {
    const view = new EmbedView(store);
    view.mount(container);

    const iframe = container.querySelector('iframe') as HTMLIFrameElement;
    const scoreVal = container.querySelector('#embed-live-score') as HTMLElement;

    expect(scoreVal.textContent).toBe('0');

    // Emit score message from iframe
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'score', score: 4500 },
        source: iframe.contentWindow ?? window,
      })
    );

    expect(scoreVal.textContent).toBe('4,500');

    view.destroy();
  });

  it('cleans up embed instance on destroy without memory leaks', () => {
    const view = new EmbedView(store);
    view.mount(container);

    expect(container.querySelector('iframe')).not.toBeNull();

    view.destroy();

    expect(container.querySelector('iframe')).toBeNull();
    expect(container.contains(view.element)).toBe(false);
  });
});
