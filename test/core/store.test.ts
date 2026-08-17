import { describe, it, expect, vi } from 'vitest';
import { Store } from '../../src/core/Store';

interface TestState {
  count: number;
  message: string;
}

describe('Store', () => {
  it('initializes with immutable state snapshot via Object.freeze', () => {
    const store = new Store<TestState>({ count: 10, message: 'init' });
    const state = store.getState();
    expect(state).toEqual({ count: 10, message: 'init' });
    expect(Object.isFrozen(state)).toBe(true);
    expect(() => {
      (state as any).count = 20;
    }).toThrow();
  });

  it('getState() returns current frozen state object', () => {
    const store = new Store({ score: 100 });
    expect(store.getState().score).toBe(100);
  });

  it('setState(patch) merges partial state immutably and notifies subscribers with (nextState, prevState)', () => {
    const store = new Store<TestState>({ count: 0, message: 'initial' });
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 1 });

    expect(store.getState()).toEqual({ count: 1, message: 'initial' });
    expect(Object.isFrozen(store.getState())).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      { count: 1, message: 'initial' },
      { count: 0, message: 'initial' }
    );
  });

  it('subscribe(listener) registers callback and returns unbind function', () => {
    const store = new Store<{ flag: boolean }>({ flag: false });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.setState({ flag: true });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.setState({ flag: false });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('multiple subscribers receive notifications in order without race conditions', () => {
    const store = new Store<{ val: number }>({ val: 0 });
    const order: number[] = [];

    const sub1 = () => order.push(1);
    const sub2 = () => order.push(2);

    store.subscribe(sub1);
    store.subscribe(sub2);

    store.setState({ val: 5 });
    expect(order).toEqual([1, 2]);
  });
});
