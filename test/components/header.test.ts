import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GAMES, getPersonalHighScore } from '../../src/data/games';
import { AppHeader } from '../../src/components/AppHeader';
import { Store } from '../../src/core/Store';
import type { AppState } from '../../src/core/types';
import * as adapter from '@arcade-carnival/playables-adapter';
import { uiAudio } from '../../src/audio/ui-audio';

describe('Game Data Module (src/data/games.ts)', () => {
  it('exports 5 arcade games with required metadata', () => {
    expect(GAMES).toHaveLength(5);
    for (const game of GAMES) {
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('title');
      expect(game).toHaveProperty('genre');
      expect(game).toHaveProperty('description');
      expect(game).toHaveProperty('icon');
      expect(game).toHaveProperty('bannerBg');
      expect(game).toHaveProperty('features');
      expect(game).toHaveProperty('rating');
      expect(game).toHaveProperty('plays');
      expect(game.features.length).toBeGreaterThan(0);
    }
  });

  it('getPersonalHighScore loads numeric score from adapter or returns 0', () => {
    const spy = vi.spyOn(adapter, 'loadData').mockReturnValue('15400');
    expect(getPersonalHighScore('sky-hopper')).toBe(15400);

    spy.mockReturnValue('invalid');
    expect(getPersonalHighScore('sky-hopper')).toBe(0);

    spy.mockReturnValue(null);
    expect(getPersonalHighScore('sky-hopper')).toBe(0);

    spy.mockImplementation(() => {
      throw new Error('Storage error');
    });
    expect(getPersonalHighScore('sky-hopper')).toBe(0);

    spy.mockRestore();
  });
});

describe('AppHeader Component (src/components/AppHeader.ts)', () => {
  let store: Store<AppState>;
  let initialAppState: AppState;

  beforeEach(() => {
    initialAppState = {
      route: { path: '/', params: {} },
      activeFilter: 'all',
      searchQuery: '',
      isMuted: false,
      isTheaterMode: false,
      highScores: {}
    };
    store = new Store<AppState>(initialAppState);
    document.body.innerHTML = '<div id="container"></div>';
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders brand logo, search input, audio toggle, CRT toggle, and embed link', () => {
    const header = new AppHeader(store);
    const container = document.getElementById('container')!;
    header.mount(container);

    expect(header.element.tagName.toLowerCase()).toBe('header');
    expect(header.element.classList.contains('ac-header')).toBe(true);

    const logo = header.element.querySelector('.ac-logo');
    expect(logo).toBeTruthy();

    const searchInput = header.element.querySelector('.ac-search-input') as HTMLInputElement;
    expect(searchInput).toBeTruthy();
    expect(searchInput.placeholder).toContain('Search');

    const audioToggle = header.element.querySelector('.ac-audio-toggle') as HTMLButtonElement;
    expect(audioToggle).toBeTruthy();
    expect(audioToggle.textContent).toContain('🔊');

    const crtToggle = header.element.querySelector('.ac-crt-toggle') as HTMLButtonElement;
    expect(crtToggle).toBeTruthy();

    const embedLink = header.element.querySelector('.ac-embed-link') as HTMLAnchorElement;
    expect(embedLink).toBeTruthy();
    expect(embedLink.getAttribute('href')).toBe('#/embed');

    header.destroy();
  });

  it('typing in search input updates store searchQuery state', () => {
    const header = new AppHeader(store);
    header.mount(document.getElementById('container')!);

    const searchInput = header.element.querySelector('.ac-search-input') as HTMLInputElement;
    searchInput.value = 'brick';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(store.getState().searchQuery).toBe('brick');
    header.destroy();
  });

  it('pressing "/" keyboard shortcut focuses search input unless already focused on input/textarea', () => {
    const header = new AppHeader(store);
    header.mount(document.getElementById('container')!);

    const searchInput = header.element.querySelector('.ac-search-input') as HTMLInputElement;
    const focusSpy = vi.spyOn(searchInput, 'focus');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    expect(focusSpy).toHaveBeenCalledTimes(1);

    // If active element is an input, do not re-focus/intercept
    const dummyInput = document.createElement('input');
    document.body.appendChild(dummyInput);
    dummyInput.focus();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    expect(focusSpy).toHaveBeenCalledTimes(1); // Not called again

    header.destroy();
  });

  it('clicking audio toggle updates store isMuted state, sets uiAudio, and toggles icon', () => {
    const header = new AppHeader(store);
    header.mount(document.getElementById('container')!);

    const audioToggle = header.element.querySelector('.ac-audio-toggle') as HTMLButtonElement;
    expect(store.getState().isMuted).toBe(false);

    audioToggle.click();
    expect(store.getState().isMuted).toBe(true);
    expect(uiAudio.isMuted()).toBe(true);
    expect(audioToggle.textContent).toContain('🔇');

    audioToggle.click();
    expect(store.getState().isMuted).toBe(false);
    expect(uiAudio.isMuted()).toBe(false);
    expect(audioToggle.textContent).toContain('🔊');

    header.destroy();
  });

  it('clicking CRT toggle toggles CRT overlay and triggers crt sound', () => {
    const crtAudioSpy = vi.spyOn(uiAudio, 'playCrtToggle');
    const header = new AppHeader(store);
    header.mount(document.getElementById('container')!);

    // Default CRT is enabled (or toggle turns it off)
    const crtToggle = header.element.querySelector('.ac-crt-toggle') as HTMLButtonElement;
    crtToggle.click();

    expect(crtAudioSpy).toHaveBeenCalled();
    expect(localStorage.getItem('arcade_crt_mode')).toBe('off');
    expect(document.body.classList.contains('crt-active')).toBe(false);

    crtToggle.click();
    expect(localStorage.getItem('arcade_crt_mode')).toBe('on');
    expect(document.body.classList.contains('crt-active')).toBe(true);

    header.destroy();
  });

  it('update(state) synchronizes input value and audio indicator without rebuilding full DOM', () => {
    const header = new AppHeader(store);
    header.mount(document.getElementById('container')!);

    const searchInput = header.element.querySelector('.ac-search-input') as HTMLInputElement;
    const audioToggle = header.element.querySelector('.ac-audio-toggle') as HTMLButtonElement;

    store.setState({ searchQuery: 'hopper', isMuted: true });
    header.update(store.getState());

    expect(searchInput.value).toBe('hopper');
    expect(audioToggle.textContent).toContain('🔇');

    header.destroy();
  });

  it('removes keyboard and DOM event listeners on destroy()', () => {
    const header = new AppHeader(store);
    header.mount(document.getElementById('container')!);

    const searchInput = header.element.querySelector('.ac-search-input') as HTMLInputElement;
    const focusSpy = vi.spyOn(searchInput, 'focus');

    header.destroy();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
    expect(focusSpy).not.toHaveBeenCalled();
    expect(document.querySelector('.ac-header')).toBeNull();
  });
});
