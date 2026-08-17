import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HashRouter } from '../../src/core/Router';

describe('HashRouter', () => {
  let router: HashRouter;

  beforeEach(() => {
    window.location.hash = '';
    router = new HashRouter();
  });

  afterEach(() => {
    router.stop();
  });

  it('registers static routes and matches exact path', () => {
    const rootHandler = vi.fn();
    const embedHandler = vi.fn();

    router.on('/', rootHandler);
    router.on('/embed', embedHandler);

    router.resolve('#/');
    expect(rootHandler).toHaveBeenCalledWith({});
    expect(embedHandler).not.toHaveBeenCalled();

    router.resolve('#/embed');
    expect(embedHandler).toHaveBeenCalledWith({});
  });

  it('registers parameterized routes and parses decoded parameters', () => {
    const gameHandler = vi.fn();
    router.on('/game/:id', gameHandler);

    router.resolve('#/game/brick-blitz');
    expect(gameHandler).toHaveBeenCalledWith({ id: 'brick-blitz' });

    router.resolve('#/game/safe%20cracker');
    expect(gameHandler).toHaveBeenCalledWith({ id: 'safe cracker' });
  });

  it('handles multiple params and safely recovers from malformed URI components', () => {
    const multiHandler = vi.fn();
    router.on('/category/:cat/item/:id', multiHandler);

    router.resolve('#/category/arcade/item/%E0%A4%A'); // malformed UTF-8
    expect(multiHandler).toHaveBeenCalledWith({ cat: 'arcade', id: '%E0%A4%A' });
  });

  it('triggers notFound handler when route does not match', () => {
    const notFoundHandler = vi.fn();
    router.notFound(notFoundHandler);

    router.resolve('#/unknown/path');
    expect(notFoundHandler).toHaveBeenCalledWith({ path: '/unknown/path' });
  });

  it('navigate() sets window.location.hash with leading #', () => {
    router.navigate('/game/crate-catch');
    expect(window.location.hash).toBe('#/game/crate-catch');

    router.navigate('#/embed');
    expect(window.location.hash).toBe('#/embed');
  });

  it('start() attaches hashchange listener and dispatches current location', () => {
    const rootHandler = vi.fn();
    router.on('/', rootHandler);

    window.location.hash = '';
    router.start();

    expect(window.location.hash).toBe('#/');
    expect(rootHandler).toHaveBeenCalledTimes(1);

    router.stop();
  });

  it('responds to hashchange events when started', () => {
    const gameHandler = vi.fn();
    router.on('/game/:id', gameHandler);
    router.start();

    window.location.hash = '#/game/sky-hopper';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(gameHandler).toHaveBeenCalledWith({ id: 'sky-hopper' });
  });

  it('stop() unbinds hashchange listener', () => {
    const gameHandler = vi.fn();
    router.on('/game/:id', gameHandler);
    router.start();
    router.stop();

    window.location.hash = '#/game/type-strike';
    window.dispatchEvent(new HashChangeEvent('hashchange'));

    expect(gameHandler).not.toHaveBeenCalled();
  });
});
