export interface ArcadeEmbedOptions {
  container: HTMLElement | string;
  game: 'safe-cracker' | 'brick-blitz' | 'sky-hopper' | 'crate-catch' | 'type-strike';
  baseUrl?: string;
  width?: string | number;
  height?: string | number;
  onScore?: (score: number, game: string) => void;
  onGameReady?: () => void;
  onSave?: (key: string, value: string) => void;
}

export class ArcadeEmbed {
  public readonly iframe: HTMLIFrameElement;
  private readonly container: HTMLElement;
  private readonly options: ArcadeEmbedOptions;
  private readonly messageHandler: (event: MessageEvent) => void;

  constructor(options: ArcadeEmbedOptions) {
    this.options = options;
    const target = typeof options.container === 'string'
      ? document.querySelector<HTMLElement>(options.container)
      : options.container;

    if (!target) {
      throw new Error(`[ArcadeEmbed] Container "${options.container}" not found in DOM.`);
    }
    this.container = target;

    const base = (options.baseUrl ?? '').replace(/\/$/, '');
    const gameUrl = `${base}/games/${options.game}/index.html`;

    this.iframe = document.createElement('iframe');
    this.iframe.src = gameUrl;
    this.iframe.style.border = 'none';
    this.iframe.style.width = typeof options.width === 'number' ? `${options.width}px` : (options.width ?? '100%');
    this.iframe.style.height = typeof options.height === 'number' ? `${options.height}px` : (options.height ?? '600px');
    this.iframe.style.display = 'block';
    this.iframe.style.borderRadius = '12px';
    this.iframe.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
    this.iframe.allow = 'autoplay';

    this.messageHandler = (event: MessageEvent) => {
      if (event.source !== this.iframe.contentWindow) {
        return;
      }
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'game-ready') {
        this.options.onGameReady?.();
      } else if (data.type === 'score' && typeof data.score === 'number') {
        this.options.onScore?.(data.score, this.options.game);
      } else if (data.type === 'save' && typeof data.key === 'string' && typeof data.value === 'string') {
        this.options.onSave?.(data.key, data.value);
      }
    };

    window.addEventListener('message', this.messageHandler);
    this.container.appendChild(this.iframe);
  }

  public pause(): void {
    this.iframe.contentWindow?.postMessage({ type: 'pause' }, '*');
  }

  public resume(): void {
    this.iframe.contentWindow?.postMessage({ type: 'resume' }, '*');
  }

  public sendSavedData(data: Record<string, string>): void {
    this.iframe.contentWindow?.postMessage({ type: 'load', data }, '*');
  }

  public destroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.iframe.remove();
  }
}

// Web Component for HTML usage: <arcade-game game="brick-blitz"></arcade-game>
export class ArcadeGameElement extends (typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as any)) {
  private embed: ArcadeEmbed | null = null;

  static get observedAttributes(): string[] {
    return ['game', 'base-url', 'width', 'height'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if ((this as any).isConnected) {
      this.render();
    }
  }

  disconnectedCallback(): void {
    this.embed?.destroy();
    this.embed = null;
  }

  private render(): void {
    this.embed?.destroy();
    const game = ((this as any).getAttribute('game') || 'safe-cracker') as ArcadeEmbedOptions['game'];
    const baseUrl = (this as any).getAttribute('base-url') || '';
    const width = (this as any).getAttribute('width') || '100%';
    const height = (this as any).getAttribute('height') || '600px';

    this.embed = new ArcadeEmbed({
      container: this as any,
      game,
      baseUrl,
      width,
      height,
      onScore: (score, gameName) => {
        (this as any).dispatchEvent(new CustomEvent('score', { detail: { score, game: gameName }, bubbles: true }));
      },
      onGameReady: () => {
        (this as any).dispatchEvent(new CustomEvent('ready', { bubbles: true }));
      },
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('arcade-game')) {
  customElements.define('arcade-game', ArcadeGameElement as any);
}
