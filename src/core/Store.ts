/**
 * Pub/sub subscriber notification callback.
 */
export type Listener<T> = (state: Readonly<T>, prevState: Readonly<T>) => void;

/**
 * Typed reactive pub/sub Store container enforcing immutable snapshots.
 */
export class Store<T extends object> {
  private state: Readonly<T>;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this.state = Object.freeze({ ...initialState });
  }

  public getState(): Readonly<T> {
    return this.state;
  }

  public setState(patch: Partial<T>): void {
    const prevState = this.state;
    this.state = Object.freeze({ ...this.state, ...patch });
    for (const listener of this.listeners) {
      listener(this.state, prevState);
    }
  }

  public subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
