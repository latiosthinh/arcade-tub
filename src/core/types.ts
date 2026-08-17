/**
 * Core type definitions for Arcade Carnival architecture.
 */

export interface RouteInfo {
  path: string;
  params: Record<string, string>;
}

export interface AppState {
  route: RouteInfo;
  activeFilter: string;
  searchQuery: string;
  isMuted: boolean;
  isTheaterMode: boolean;
  highScores: Record<string, number>;
}

export interface Component<P = void, S = void> {
  element: HTMLElement;
  mount(parent: HTMLElement): HTMLElement;
  update(props: P, state?: S): void;
  destroy(): void;
}
