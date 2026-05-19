export const TEMPLATES_DIR = 'templates';

export function templateUrl(file: string): string {
  const name = String(file).replace(/^\/+/, '');
  return `${TEMPLATES_DIR}/${name}`;
}

export function extractTemplateMainContent(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const main =
    doc.querySelector('.layout .content.flex-grow-1') ||
    doc.querySelector('.layout > .content.flex-grow-1') ||
    doc.querySelector('.content.flex-grow-1');
  if (main) {
    let out = main.innerHTML.trim();
    const modals = [...doc.body.querySelectorAll('.modal')];
    if (modals.length) {
      out += '\n' + modals.map((m) => m.outerHTML).join('\n');
    }
    return out;
  }
  return doc.body.innerHTML.trim();
}

export function normalizeRoutePath(path: string | null | undefined): string {
  let p = String(path ?? '').trim();
  if (p.startsWith('#')) p = p.slice(1);
  if (!p || p === '/') return '/';
  if (!p.startsWith('/')) p = `/${p}`;
  return p.replace(/\/+/g, '/') || '/';
}

type RouteHandler = (params: string[]) => void | Promise<void>;

interface RouteDefinition {
  path: string;
  handler: RouteHandler;
  requiresAuth: boolean;
  regex: RegExp | null;
}

interface MatchedRoute extends RouteDefinition {
  params: string[];
}

export class Router {
  routes: RouteDefinition[] = [];
  private _handling = false;

  addRoute(path: string, handler: RouteHandler, requiresAuth = true): void {
    this.routes.push({
      path,
      handler,
      requiresAuth,
      regex: path.includes(':') ? new RegExp(`^${path.replace(/:\w+/g, '(\\d+)')}$`) : null,
    });
  }

  getPath(): string {
    const hash = window.location.hash.slice(1);
    return hash ? normalizeRoutePath(hash) : '/';
  }

  navigate(path: string): void {
    const targetPath = normalizeRoutePath(path);
    const hash = `#${targetPath}`;

    if (this.getPath() === targetPath) {
      void this.handleRoute();
    } else {
      window.location.hash = hash;
    }
  }

  matchRoute(path: string): MatchedRoute | null {
    const exact = this.routes.find((r) => r.path === path);
    if (exact) return { ...exact, params: [] };

    for (const route of this.routes) {
      if (route.regex) {
        const match = path.match(route.regex);
        if (match) {
          return { ...route, params: match.slice(1) };
        }
      }
    }
    return null;
  }

  async handleRoute(): Promise<void> {
    if (this._handling) return;
    this._handling = true;
    try {
      const path = this.getPath();
      const route = this.matchRoute(path);
      const isAuthorized = window.api?.isAuthorized?.() === true;

      if (!route) {
        this.navigate(isAuthorized ? '/' : '/login');
        return;
      }

      if (route.requiresAuth && !isAuthorized) {
        localStorage.setItem('redirectAfterLogin', path);
        this.navigate('/login');
        return;
      }

      if (isAuthorized && (path === '/login' || path === '/register')) {
        this.navigate('/');
        return;
      }

      try {
        await route.handler(route.params || []);
      } catch {
        if (path !== '/') this.navigate('/');
      }
    } finally {
      this._handling = false;
    }
  }

  init(): void {
    window.addEventListener('hashchange', () => void this.handleRoute());
    window.addEventListener('load', () => {
      setTimeout(() => void this.handleRoute(), 50);
    });
  }
}

export const router = new Router();

window.router = router;
