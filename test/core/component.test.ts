import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseComponent } from '../../src/core/Component';

class TestComponent extends BaseComponent<{ title: string }, { count: number }> {
  public renderCount = 0;

  constructor() {
    super('section', 'test-custom-class');
  }

  public update(props: { title: string }, state?: { count: number }): void {
    this.renderCount++;
    this.element.textContent = `${props.title}:${state ? state.count : 0}`;
  }

  public exposeAddListener<K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void
  ): void {
    this.addListener(target, type, listener);
  }
}

describe('BaseComponent', () => {
  let parent: HTMLDivElement;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  it('creates element with specified tag and class name on instantiation', () => {
    const comp = new TestComponent();
    expect(comp.element).toBeInstanceOf(HTMLElement);
    expect(comp.element.tagName.toLowerCase()).toBe('section');
    expect(comp.element.className).toBe('test-custom-class');
  });

  it('defaults to div and empty class when not specified', () => {
    class DefaultComp extends BaseComponent {
      public update(): void {}
    }
    const comp = new DefaultComp();
    expect(comp.element.tagName.toLowerCase()).toBe('div');
    expect(comp.element.className).toBe('');
  });

  it('mounts to parent container and returns element', () => {
    const comp = new TestComponent();
    const returnedEl = comp.mount(parent);
    expect(returnedEl).toBe(comp.element);
    expect(parent.contains(comp.element)).toBe(true);
  });

  it('update() triggers component-specific updates without replacing container', () => {
    const comp = new TestComponent();
    comp.mount(parent);
    comp.update({ title: 'Hello' }, { count: 42 });
    expect(comp.element.textContent).toBe('Hello:42');
    expect(comp.renderCount).toBe(1);
    expect(parent.contains(comp.element)).toBe(true);
  });

  it('addListener attaches event listener and cleans up on destroy()', () => {
    const comp = new TestComponent();
    comp.mount(parent);
    const clickHandler = vi.fn();

    comp.exposeAddListener(comp.element, 'click', clickHandler);

    comp.element.dispatchEvent(new MouseEvent('click'));
    expect(clickHandler).toHaveBeenCalledTimes(1);

    comp.destroy();

    comp.element.dispatchEvent(new MouseEvent('click'));
    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(parent.contains(comp.element)).toBe(false);
  });

  it('destroy clears all active listener bindings and removes element from DOM', () => {
    const comp = new TestComponent();
    comp.mount(parent);
    const windowListener = vi.fn();

    comp.exposeAddListener(window, 'resize', windowListener);
    window.dispatchEvent(new Event('resize'));
    expect(windowListener).toHaveBeenCalledTimes(1);

    comp.destroy();
    window.dispatchEvent(new Event('resize'));
    expect(windowListener).toHaveBeenCalledTimes(1);
    expect(parent.children.length).toBe(0);
  });
});
