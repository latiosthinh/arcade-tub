import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transitionView } from '../../src/core/transitions';

describe('transitionView', () => {
  const originalStartViewTransition = (document as any).startViewTransition;

  afterEach(() => {
    if (originalStartViewTransition) {
      (document as any).startViewTransition = originalStartViewTransition;
    } else {
      delete (document as any).startViewTransition;
    }
  });

  it('executes document.startViewTransition when available', async () => {
    const finishedPromise = Promise.resolve();
    const mockStartViewTransition = vi.fn().mockImplementation((cb) => {
      cb();
      return { finished: finishedPromise };
    });
    (document as any).startViewTransition = mockStartViewTransition;

    const updateDom = vi.fn();
    await transitionView(updateDom);

    expect(mockStartViewTransition).toHaveBeenCalledTimes(1);
    expect(updateDom).toHaveBeenCalledTimes(1);
  });

  it('falls back to synchronous direct invocation when startViewTransition is undefined', async () => {
    delete (document as any).startViewTransition;

    const updateDom = vi.fn();
    await transitionView(updateDom);

    expect(updateDom).toHaveBeenCalledTimes(1);
  });

  it('handles async updateDom callback in fallback mode', async () => {
    delete (document as any).startViewTransition;

    let flag = false;
    await transitionView(async () => {
      flag = true;
    });

    expect(flag).toBe(true);
  });
});
