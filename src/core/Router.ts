import { transitionView } from './transitions';

export type RouteHandler = (params: Record<string, string>) => void | Promise<void>;

interface RouteRule {
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

/**
 * Zero-dependency client-side HashRouter with parameterized route matching,
 * browser back/forward history support, and View Transitions integration.
 */
export class HashRouter {
  private routes: RouteRule[] = [];
  private notFoundHandler: RouteHandler = () => {};
  private listener: (() => void) | null = null;
  private useTransitions = false;

  public on(path: string, handler: RouteHandler): this {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const paramNames: string[] = [];

    // Replace :paramName with regex capture group ([^/]+)
    const regexSource = normalized.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const pattern = new RegExp(`^${regexSource}$`);
    this.routes.push({ pattern, paramNames, handler });
    return this;
  }

  public notFound(handler: RouteHandler): this {
    this.notFoundHandler = handler;
    return this;
  }

  public navigate(hashOrPath: string): void {
    const formatted = hashOrPath.startsWith('#')
      ? hashOrPath
      : `#${hashOrPath.startsWith('/') ? hashOrPath : `/${hashOrPath}`}`;
    window.location.hash = formatted;
  }

  public start(useTransitions = false): void {
    this.useTransitions = useTransitions;

    const handler = () => {
      this.resolve(window.location.hash);
    };

    window.addEventListener('hashchange', handler);
    this.listener = () => {
      window.removeEventListener('hashchange', handler);
    };

    if (!window.location.hash || window.location.hash === '#') {
      this.navigate('/');
      this.resolve('#/');
    } else {
      this.resolve(window.location.hash);
    }
  }

  public stop(): void {
    if (this.listener) {
      this.listener();
      this.listener = null;
    }
  }

  public resolve(hash?: string): void {
    const currentHash = hash ?? window.location.hash;
    const rawPath = currentHash.replace(/^#/, '') || '/';
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

    const execute = async () => {
      for (const route of this.routes) {
        const match = cleanPath.match(route.pattern);
        if (match) {
          const params: Record<string, string> = {};
          route.paramNames.forEach((name, i) => {
            const rawVal = match[i + 1];
            try {
              params[name] = decodeURIComponent(rawVal);
            } catch {
              params[name] = rawVal;
            }
          });
          await route.handler(params);
          return;
        }
      }

      await this.notFoundHandler({ path: cleanPath });
    };

    if (this.useTransitions) {
      void transitionView(execute);
    } else {
      void execute();
    }
  }
}
