import '../styles/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './api.js';

function navigateToAppAfterLogin() {
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

function initLogin() {
  if (window.__loginInitialized) return;
  window.__loginInitialized = true;

  const loginForm = document.querySelector('form');
  const emailInput = document.querySelector('#floatingInput');
  const passwordInput = document.querySelector('#floatingPassword');
  const rememberMeCheckbox = document.querySelector('#checkDefault');

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

      const tokens = data.tokens || data;
      const accessToken = tokens.accessToken;
      const refreshToken = tokens.refreshToken;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken || '');
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigateToAppAfterLogin();
      } else {
        throw new Error('Сервер не вернул accessToken');
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogin);
} else {
  initLogin();
}
