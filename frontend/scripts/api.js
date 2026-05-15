/* global __API_BASE_URL__ */
const API_BASE_URL =
  typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : 'http://localhost:3000/api';

async function getErrorMessage(response) {
  try {
    const errorData = await response.json().catch(() => ({}));
    return errorData.message || errorData.error || errorData.detail || `Ошибка ${response.status}`;
  } catch {
    return `Ошибка ${response.status}: ${response.statusText}`;
  }
}

function unwrapTokens(payload) {
  if (payload && payload.tokens) {
    return {
      accessToken: payload.tokens.accessToken,
      refreshToken: payload.tokens.refreshToken,
    };
  }
  return payload;
}

const api = {
  async login(email, password, rememberMe = false) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw new Error(message);
    }
    return await response.json();
  },

  async signup(name, lastName, email, password, passwordRepeat) {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, lastName, email, password, passwordRepeat }),
    });

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw new Error(message);
    }
    return await response.json();
  },

  async logout(refreshToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async refresh(refreshToken) {
    if (!refreshToken) throw new Error('Refresh token отсутствует');

    let rememberMe = false;
    try {
      rememberMe = localStorage.getItem('rememberMe') === '1';
    } catch {
      /* ignore */
    }

    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, rememberMe }),
    });

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw new Error(message);
    }
    const data = await response.json();
    return unwrapTokens(data);
  },

  async getBalance() {
    return this.request('/balance', { method: 'GET' });
  },

  async updateBalance(newBalance) {
    return this.request('/balance', {
      method: 'PUT',
      body: JSON.stringify({ newBalance }),
    });
  },

  async getCategories(type) {
    return this.request(`/categories/${type}`, { method: 'GET' });
  },

  async createCategory(type, title) {
    return this.request(`/categories/${type}`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async getCategory(type, id) {
    return this.request(`/categories/${type}/${id}`, { method: 'GET' });
  },

  async updateCategory(type, id, title) {
    return this.request(`/categories/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  },

  async request(url, options = {}) {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Пользователь не авторизован');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        ...options.headers,
      },
    };

    let response = await fetch(`${API_BASE_URL}${url}`, config);

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        this.logoutUser();
        throw new Error('Сессия истекла');
      }
      try {
        const newTokens = await this.refresh(refreshToken);
        localStorage.setItem('accessToken', newTokens.accessToken);
        if (newTokens.refreshToken) {
          localStorage.setItem('refreshToken', newTokens.refreshToken);
        }
        config.headers['x-auth-token'] = newTokens.accessToken;
        response = await fetch(`${API_BASE_URL}${url}`, config);
      } catch {
        this.logoutUser();
        throw new Error('Сессия истекла');
      }
    }

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return await response.json();
  },

  performLogout() {
    const refreshToken = localStorage.getItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('redirectAfterLogin');

    if (refreshToken) {
      this.logout(refreshToken).catch(() => {});
    }

    const loginUrl = new URL('login.html', window.location.href).href;
    try {
      window.location.replace(loginUrl);
    } catch {
      window.location.href = 'login.html';
    }
  },

  logoutUser() {
    this.performLogout();
  },

  isAuthorized() {
    return !!localStorage.getItem('accessToken');
  },

  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch {
      /* ignore */
    }
  },
};

window.api = api;
