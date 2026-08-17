import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameCard } from '../../src/components/GameCard';
import { GAMES } from '../../src/data/games';
import { uiAudio } from '../../src/audio/ui-audio';

describe('GameCard Component (src/components/GameCard.ts)', () => {
  let container: HTMLElement;
  const sampleGame = GAMES[0]!;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    window.location.hash = '#/';
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders game card with accessible attributes, icon, title, genre, rating, and plays', () => {
    const card = new GameCard(sampleGame, { highScore: 5000 });
    card.mount(container);

    expect(card.element.classList.contains('ac-card')).toBe(true);
    expect(card.element.getAttribute('tabindex')).toBe('0');
    expect(card.element.getAttribute('role')).toBe('button');
    expect(card.element.getAttribute('aria-label')).toContain(sampleGame.title);

    const title = card.element.querySelector('.ac-card-title');
    expect(title?.textContent).toBe(sampleGame.title);

    const score = card.element.querySelector('.ac-card-score-value');
    expect(score?.textContent).toBe((5000).toLocaleString());

    const rating = card.element.querySelector('.ac-card-rating');
    expect(rating?.textContent).toBe(sampleGame.rating);

    card.destroy();
  });

  it('renders fallback score placeholder "---" when highScore is 0 or undefined', () => {
    const card = new GameCard(sampleGame, { highScore: 0 });
    card.mount(container);

    const score = card.element.querySelector('.ac-card-score-value');
    expect(score?.textContent).toBe('---');

    card.destroy();
  });

  it('plays hover sound on mouseenter and focus', () => {
    const hoverSpy = vi.spyOn(uiAudio, 'playHover');
    const card = new GameCard(sampleGame, { highScore: 1000 });
    card.mount(container);

    card.element.dispatchEvent(new Event('mouseenter'));
    expect(hoverSpy).toHaveBeenCalledTimes(1);

    card.element.dispatchEvent(new Event('focus'));
    expect(hoverSpy).toHaveBeenCalledTimes(2);

    card.destroy();
  });

  it('navigates to game route and triggers launch sound on click', () => {
    const launchSpy = vi.spyOn(uiAudio, 'playLaunch');
    const card = new GameCard(sampleGame, { highScore: 1000 });
    card.mount(container);

    card.element.click();
    expect(launchSpy).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe(`#/game/${sampleGame.id}`);

    card.destroy();
  });

  it('navigates to game route on Enter and Space keydown', () => {
    const launchSpy = vi.spyOn(uiAudio, 'playLaunch');
    const card = new GameCard(sampleGame, { highScore: 1000 });
    card.mount(container);

    window.location.hash = '#/';
    card.element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(launchSpy).toHaveBeenCalledTimes(1);
    expect(window.location.hash).toBe(`#/game/${sampleGame.id}`);

    window.location.hash = '#/';
    card.element.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(launchSpy).toHaveBeenCalledTimes(2);
    expect(window.location.hash).toBe(`#/game/${sampleGame.id}`);

    card.destroy();
  });

  it('update(game, state) dynamically updates high score without DOM rebuild', () => {
    const card = new GameCard(sampleGame, { highScore: 0 });
    card.mount(container);

    const score = card.element.querySelector('.ac-card-score-value')!;
    expect(score.textContent).toBe('---');

    card.update(sampleGame, { highScore: 12500 });
    expect(score.textContent).toBe((12500).toLocaleString());

    card.destroy();
  });
});
