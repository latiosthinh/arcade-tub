import type { Component } from './types';

/**
 * BaseComponent provides lifecycle management, DOM mounting, and auto-cleanup event unbinding.
 */
export abstract class BaseComponent<P = void, S = void> implements Component<P, S> {
  public element: HTMLElement;
  protected unbinds: Array<() => void> = [];

  constructor(tagName: keyof HTMLElementTagNameMap = 'div', className = '') {
    this.element = document.createElement(tagName);
    if (className) {
      this.element.className = className;
    }
  }

  public mount(parent: HTMLElement): HTMLElement {
    parent.appendChild(this.element);
    return this.element;
  }

  public abstract update(props: P, state?: S): void;

  public destroy(): void {
    for (const unbind of this.unbinds) {
      unbind();
    }
    this.unbinds = [];
    this.element.remove();
  }

  protected addListener<K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void
  ): void {
    const handler = listener as EventListener;
    target.addEventListener(type, handler);
    this.unbinds.push(() => {
      target.removeEventListener(type, handler);
    });
  }
}
