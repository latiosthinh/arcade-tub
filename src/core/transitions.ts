/**
 * Wraps DOM state updates in Document View Transitions API if supported by the browser,
 * falling back to direct asynchronous invocation.
 */
export async function transitionView(updateDom: () => void | Promise<void>): Promise<void> {
  const doc = document as any;
  if ('startViewTransition' in doc && typeof doc.startViewTransition === 'function') {
    const transition = doc.startViewTransition(async () => {
      await updateDom();
    });
    if (transition && transition.finished) {
      await transition.finished;
    }
  } else {
    await updateDom();
  }
}
