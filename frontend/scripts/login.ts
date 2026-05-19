import '../styles/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './api';
import type { AuthTokens, LoginResponse } from './types/models';

function navigateToAppAfterLogin(): void {
  let path = localStorage.getItem('redirectAfterLogin');
  localStorage.removeItem('redirectAfterLogin');
  if (!path || path === '/login' || path === '/register' || path === '/logout') {
    path = '/';
  }
  if (!path.startsWith('/')) path = `/${path}`;

  const entry = new URL('index.html', window.location.href);
  entry.hash = path;
  window.location.assign(entry.href);
}

function initLogin(): void {
  if (window.__loginInitialized) return;
  window.__loginInitialized = true;

  const loginForm = document.querySelector('form');
  const emailInput = document.querySelector('#floatingInput') as HTMLInputElement | null;
  const passwordInput = document.querySelector('#floatingPassword') as HTMLInputElement | null;
  const rememberMeCheckbox = document.querySelector('#checkDefault') as HTMLInputElement | null;

  if (!loginForm || !emailInput || !passwordInput) {
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const data = await window.api.login(
        emailInput.value.trim(),
        passwordInput.value,
        rememberMeCheckbox?.checked || false
      );

      const tokens: AuthTokens | LoginResponse = data.tokens ?? data;
      const accessToken = 'accessToken' in tokens ? tokens.accessToken : undefined;
      const refreshToken = 'refreshToken' in tokens ? tokens.refreshToken : undefined;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken || '');
        localStorage.setItem('rememberMe', rememberMeCheckbox?.checked ? '1' : '0');
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigateToAppAfterLogin();
      } else {
        throw new Error('Сервер не вернул accessToken');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа';
      alert('Ошибка: ' + message);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogin);
} else {
  initLogin();
}
