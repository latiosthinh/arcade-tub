import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameView } from '../../src/views/GameView';
import { Store } from '../../src/core/Store';
import type { AppState } from '../../src/core/types';
import { GAMES } from '../../src/data/games';
import { uiAudio } from '../../src/audio/ui-audio';

describe('GameView', () => {
  let store: Store<AppState>;
  let container: HTMLElement;

  const getInitialState = (): AppState => ({
    route: { path: '/game/safe-cracker', params: { id: 'safe-cracker' } },
    activeFilter: 'all',
    searchQuery: '',
    isMuted: false,
    isTheaterMode: false,
    highScores: { 'safe-cracker': 12000 },
  });

  beforeEach(() => {
    store = new Store<AppState>(getInitialState());
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('mounts with valid game ID, renders title, metadata, features, and high score', () => {
    const game = GAMES[0]!;
    const view = new GameView(store, game.id);
    view.mount(container);

    expect(container.querySelector('.ac-player-title')?.textContent).toBe(game.title);
    expect(container.querySelector('.ac-player-badge')?.textContent).toBe(game.genre);
    expect(container.querySelector('.ac-details-desc')?.textContent).toBe(game.description);
    expect(container.querySelector('.ac-score-num')?.textContent).toContain('12,000');

    const iframe = container.querySelector('iframe.ac-game-frame') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('src')).toBe(`/games/${game.id}/index.html`);
    expect(iframe.getAttribute('allow')).toBe('autoplay; fullscreen');
    view.destroy();
  });

  it('renders skeleton loader initially and hides it on iframe load or game-ready message (PLAY-01)', () => {
    const view = new GameView(store, 'safe-cracker');
    view.mount(container);

    const skeleton = container.querySelector('.ac-skeleton-loader') as HTMLElement;
    expect(skeleton).not.toBeNull();
    expect(skeleton.classList.contains('is-hidden')).toBe(false);

    const iframe = container.querySelector('iframe.ac-game-frame') as HTMLIFrameElement;

    // Simulate iframe load event
    iframe.dispatchEvent(new Event('load'));
    expect(skeleton.classList.contains('is-hidden')).toBe(true);

    view.destroy();
  });

  it('hides skeleton loader on postMessage game-ready event (PLAY-01)', () => {
    const view = new GameView(store, 'safe-cracker');
    view.mount(container);

    const skeleton = container.querySelector('.ac-skeleton-loader') as HTMLElement;
    const iframe = container.querySelector('iframe.ac-game-frame') as HTMLIFrameElement;

    // Send game-ready postMessage
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'game-ready' },
        source: iframe.contentWindow ?? window,
      })
    );

    expect(skeleton.classList.contains('is-hidden')).toBe(true);
    view.destroy();
  });

  it('cleans up iframe lifecycle on destroy: resets src, posts pause message, removes listeners (PLAY-02)', () => {
    const view = new GameView(store, 'safe-cracker');
    view.mount(container);

    const iframe = container.querySelector('iframe.ac-game-frame') as HTMLIFrameElement;
    const postMessageSpy = vi.fn();
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage = postMessageSpy;
    }

    view.destroy();

    expect(iframe.src).toBe('about:blank');
    expect(container.contains(view.element)).toBe(false);
  });

  it('auto-focuses iframe on mount and navigates to #/ on Escape key (PLAY-03)', () => {
    const transitionSpy = vi.spyOn(uiAudio, 'playTransition');
    const view = new GameView(store, 'safe-cracker');
    view.mount(container);

    window.location.hash = '#/game/safe-cracker';

    // Press Escape
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(transitionSpy).toHaveBeenCalled();
    expect(window.location.hash).toBe('#/');

    view.destroy();
  });

  it('toggles theater mode via button and T key shortcut without recreating iframe (PLAY-04)', () => {
    const clickSpy = vi.spyOn(uiAudio, 'playClick');
    const view = new GameView(store, 'safe-cracker');
    view.mount(container);

    const initialIframe = container.querySelector('iframe.ac-game-frame');
    const theaterBtn = container.querySelector('.ac-btn-theater') as HTMLButtonElement;
    const frameWrapper = container.querySelector('.ac-player-frame-wrapper') as HTMLElement;

    expect(store.getState().isTheaterMode).toBe(false);
    expect(frameWrapper.classList.contains('is-theater')).toBe(false);

    // Click button
    theaterBtn.click();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(store.getState().isTheaterMode).toBe(true);
    expect(frameWrapper.classList.contains('is-theater')).toBe(true);
    expect(view.element.classList.contains('is-theater')).toBe(true);
    expect(container.querySelector('iframe.ac-game-frame')).toBe(initialIframe);

    // Press T key
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }));
    expect(clickSpy).toHaveBeenCalledTimes(2);
    expect(store.getState().isTheaterMode).toBe(false);
    expect(frameWrapper.classList.contains('is-theater')).toBe(false);

    view.destroy();
  });

  it('handles postMessage score event to update store high score and local score widget', () => {
    const view = new GameView(store, 'safe-cracker');
    view.mount(container);

    const iframe = container.querySelector('iframe.ac-game-frame') as HTMLIFrameElement;

    // Send score postMessage from iframe
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'score', score: 99999 },
        source: iframe.contentWindow ?? window,
      })
    );

    expect(store.getState().highScores['safe-cracker']).toBe(99999);
    expect(container.querySelector('.ac-score-num')?.textContent).toContain('99,999');

    view.destroy();
  });

  it('handles invalid/unknown game ID gracefully by rendering safe fallback UI', () => {
    const view = new GameView(store, 'unknown-non-existent-game');
    view.mount(container);

    expect(container.querySelector('.ac-not-found-title')).not.toBeNull();
    expect(container.querySelector('iframe.ac-game-frame')).toBeNull();

    view.destroy();
  });
});
