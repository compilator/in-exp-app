export const TEMPLATES_DIR = 'templates';

export function templateUrl(file) {
  const name = String(file).replace(/^\/+/, '');
  return `${TEMPLATES_DIR}/${name}`;
}

export function extractTemplateMainContent(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const main =
    doc.querySelector('.layout .content.flex-grow-1') ||
    doc.querySelector('.layout > .content.flex-grow-1') ||
    doc.querySelector('.content.flex-grow-1');
  if (main) return main.innerHTML.trim();
  return doc.body.innerHTML.trim();
}

export function normalizeRoutePath(path) {
  let p = String(path ?? '').trim();
  if (p.startsWith('#')) p = p.slice(1);
  if (!p || p === '/') return '/';
  if (!p.startsWith('/')) p = `/${p}`;
  return p.replace(/\/+/g, '/') || '/';
}

export class Router {
  constructor() {
    this.routes = [];
    this._handling = false;
  }

  addRoute(path, handler, requiresAuth = true) {
    this.routes.push({
      path,
      handler,
      requiresAuth,
      regex: path.includes(':')
        ? new RegExp(`^${path.replace(/:\w+/g, '(\\d+)')}$`)
        : null,
    });
  }

  getPath() {
    const hash = window.location.hash.slice(1);
    return hash ? normalizeRoutePath(hash) : '/';
  }

  navigate(path) {
    const targetPath = normalizeRoutePath(path);
    const hash = `#${targetPath}`;

    if (this.getPath() === targetPath) {
      this.handleRoute();
    } else {
      window.location.hash = hash;
    }
  }

  matchRoute(path) {
    let route = this.routes.find((r) => r.path === path);
    if (route) return { ...route, params: [] };

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

  async handleRoute() {
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

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => {
      setTimeout(() => this.handleRoute(), 50);
    });
  }
}

export const router = new Router();

window.router = router;
