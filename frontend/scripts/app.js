import '../styles/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;
import './api.js';
import { router, templateUrl, extractTemplateMainContent } from './router.js';

async function initApp() {
  registerRoutes();

  document.body.addEventListener('click', (e) => {
    const menu = document.getElementById('mobileMenu');
    const inst = menu && bootstrap.Offcanvas.getInstance(menu);

    if (e.target.closest('.js-logout')) {
      e.preventDefault();
      e.stopPropagation();
      if (inst) inst.hide();
      window.api?.logoutUser?.();
      return;
    }

    if (e.target.closest('a[data-spa-link]') && inst) {
      inst.hide();
    }
  });

  router.init();
}

function registerRoutes() {
  router.addRoute('/login', loadLoginPage, false);
  router.addRoute('/register', loadRegisterPage, false);
  router.addRoute('/logout', handleLogoutRoute, false);

  router.addRoute('/', loadMainPage);
  router.addRoute('/income', loadIncomePage);
  router.addRoute('/expense', loadExpensePage);
  router.addRoute('/operations', loadOperationsPage);
  router.addRoute('/income/add', loadIncomeAddPage);
  router.addRoute('/income/edit/:id', loadIncomeEditPage);
  router.addRoute('/expense/add', loadExpenseAddPage);
  router.addRoute('/expense/edit/:id', loadExpenseEditPage);
}

function handleLogoutRoute() {
  window.api?.performLogout?.();
}

function mergeHeadAssetsFromDoc(doc) {
  doc.querySelectorAll('head link[rel="stylesheet"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const exists = [...document.head.querySelectorAll('link[rel="stylesheet"]')].some(
      (l) => l.getAttribute('href') === href
    );
    if (!exists) document.head.appendChild(link.cloneNode(true));
  });
}

function loadScript(src, onLoad) {
  document.querySelectorAll('script[data-spa-chunk]').forEach((el) => el.remove());

  const script = document.createElement('script');
  script.dataset.spaChunk = '1';
  script.src = `${src}?v=${Date.now()}`;
  script.onload = () => {
    if (onLoad) onLoad();
  };
  script.onerror = () => {};
  document.body.appendChild(script);
}

async function loadLoginPage() {
  await loadPage('login.html');
  loadScript('scripts/login.js');
}

async function loadRegisterPage() {
  await loadPage('registration.html');
  loadScript('scripts/reg.js');
}

async function loadMainPage() {
  await loadPageWithLayout('index.html');
  updateBalance();
  loadScript('scripts/dashboard.js');
}

async function loadIncomePage() {
  await loadPageWithLayout('in.html');
  loadIncomeCategories();
}

async function loadExpensePage() {
  await loadPageWithLayout('exp.html');
  loadExpenseCategories();
}

async function loadOperationsPage() {
  await loadPageWithLayout('in-exp.html');
  await loadOperations();
}

async function loadIncomeAddPage() {
  await loadPageWithLayout('in-add.html');
  initOperationForm('income');
}

async function loadIncomeEditPage(params) {
  const id = params?.[0];
  await loadPageWithLayout('in-edit.html');
  initOperationEditForm('income', id);
}

async function loadExpenseAddPage() {
  await loadPageWithLayout('exp-add.html');
  initOperationForm('expense');
}

async function loadExpenseEditPage(params) {
  const id = params?.[0];
  await loadPageWithLayout('exp-edit.html');
  initOperationEditForm('expense', id);
}

async function loadPageWithLayout(contentPage) {
  try {
    const url = templateUrl(contentPage);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const fragment = extractTemplateMainContent(html);

    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.innerHTML = fragment;
    } else {
      document.body.innerHTML = fragment;
    }

    await updateLayoutUI();
  } catch {
    router.navigate('/');
  }
}

async function loadPage(page) {
  try {
    const response = await fetch(page);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    mergeHeadAssetsFromDoc(doc);

    const title = doc.querySelector('head title')?.textContent?.trim();
    if (title) document.title = title;

    document.body.innerHTML = doc.body.innerHTML;
  } catch {
    router.navigate('/login');
  }
}

function updateActiveNav() {
  const path = router.getPath();

  document.querySelectorAll('a[data-spa-link][href^="#"]').forEach((link) => {
    const routePath = link.getAttribute('href').slice(1);
    let active = false;
    if (routePath === '/') {
      active = path === '/' || path === '';
    } else if (routePath === '/operations') {
      active = path === '/operations';
    } else if (routePath === '/income') {
      active = path === '/income' || path.startsWith('/income/');
    } else if (routePath === '/expense') {
      active = path === '/expense' || path.startsWith('/expense/');
    } else {
      active = path === routePath;
    }

    link.classList.toggle('active', active);
    if (link.classList.contains('nav-link')) {
      link.classList.toggle('link-dark', !active);
    }
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

async function updateLayoutUI() {
  await updateBalance();

  const user = window.api?.getUser?.();
  if (user) {
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
      userNameElement.textContent = `${user.lastName || ''} ${user.name || ''}`.trim() || '—';
    }
  }

  updateActiveNav();

  document.querySelectorAll('.logout-btn').forEach((logoutBtn) => {
    const newBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.api?.logoutUser?.();
    });
  });
}

async function updateBalance() {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const data = await window.api.getBalance(token);

    const balanceElement = document.querySelector('.balance .text-primary');
    if (balanceElement) {
      balanceElement.textContent = String(data.balance ?? 0);
    } else {
      const wrap = document.querySelector('.balance');
      if (wrap) wrap.textContent = `${data.balance || 0} ₽`;
    }
  } catch {
    /* ignore */
  }
}

async function loadIncomeCategories() {
  try {
    const categories = await window.api.request('/categories/income');
    renderCategories(categories, 'income');
  } catch {
    /* ignore */
  }
}

async function loadExpenseCategories() {
  try {
    const categories = await window.api.request('/categories/expense');
    renderCategories(categories, 'expense');
  } catch {
    /* ignore */
  }
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function renderCategories(categories, type) {
  const container = document.querySelector('.categories-list');
  if (!container) return;

  const addHash = type === 'income' ? '#/income/add' : '#/expense/add';

  const cards = categories.map(cat => `
    <div class="category-card bg-white p-4" data-id="${cat.id}">
      <h3 class="category-title">${escapeHtml(cat.title)}</h3>
      <div class="d-flex gap-2 flex-wrap">
        <button type="button" class="btn-edit" onclick="router.navigate('/${type}/edit/${cat.id}')">Редактировать</button>
        <button type="button" class="btn-delete" onclick="deleteCategory('${type}', ${cat.id})">Удалить</button>
      </div>
    </div>
  `).join('');

  const emptyCard = `
    <a href="${addHash}" class="no-dec" data-spa-link>
      <div class="empty-card">
        <span class="plus-icon">+</span>
      </div>
    </a>
  `;

  container.innerHTML = cards + emptyCard;
}

async function deleteCategory(type, id) {
  if (!confirm('Вы уверены, что хотите удалить категорию?')) return;

  try {
    await window.api.request(`/categories/${type}/${id}`, { method: 'DELETE' });

    if (type === 'income') {
      loadIncomeCategories();
    } else {
      loadExpenseCategories();
    }
  } catch {
    alert('Ошибка удаления категории');
  }
}

async function loadOperations(filter = {}) {
  try {
    const params = new URLSearchParams(filter);
    const operations = await window.api.request(`/operations?${params}`);
    renderOperations(operations);
  } catch {
    /* ignore */
  }
}

function renderOperations(operations) {
  const tbody = document.querySelector('.operations-table tbody');
  if (!tbody) return;

  tbody.innerHTML = operations.map(op => `
    <tr>
      <td>${op.date || ''}</td>
      <td>${op.category?.title || 'Без категории'}</td>
      <td class="${op.type === 'income' ? 'income' : 'expense'}">
        ${op.type === 'income' ? '+' : '-'}${op.amount || 0} ₽
      </td>
      <td>${op.comment || ''}</td>
      <td>
        <button type="button" class="btn-edit" onclick="router.navigate('/${op.type}/edit/${op.id}')">
          <img src="images/pen.png" alt="Редактировать">
        </button>
        <button type="button" class="btn-delete" onclick="deleteOperation(${op.id})">
          <img src="images/trash.png" alt="Удалить">
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteOperation(id) {
  if (!confirm('Вы уверены, что хотите удалить операцию?')) return;

  try {
    await window.api.request(`/operations/${id}`, { method: 'DELETE' });
    loadOperations();
    updateBalance();
  } catch {
    alert('Ошибка удаления операции');
  }
}

async function initOperationForm(type) {
  try {
    const categories = await window.api.request(`/categories/${type}`);

    const categorySelect = document.querySelector('#category');
    if (categorySelect) {
      categorySelect.innerHTML = categories.map(cat =>
        `<option value="${cat.id}">${cat.title}</option>`
      ).join('');
    }

    const typeSelect = document.querySelector('#type');
    if (typeSelect) {
      typeSelect.value = type;
    }

    const form = document.querySelector('.operation-form');
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        type: document.querySelector('#type')?.value,
        category_id: parseInt(document.querySelector('#category')?.value),
        amount: parseFloat(document.querySelector('#amount')?.value),
        date: document.querySelector('#date')?.value,
        comment: document.querySelector('#comment')?.value || ''
      };

      try {
        await window.api.request('/operations', {
          method: 'POST',
          body: JSON.stringify(formData)
        });

        router.navigate('/operations');
        updateBalance();
      } catch (error) {
        alert('Ошибка создания операции: ' + error.message);
      }
    });
  } catch {
    /* ignore */
  }
}

async function initOperationEditForm(type, id) {
  try {
    const operation = await window.api.request(`/operations/${id}`);

    const typeSelect = document.querySelector('#type');
    if (typeSelect) {
      typeSelect.value = operation.type;
      typeSelect.disabled = true;
    }

    const categories = await window.api.request(`/categories/${operation.type}`);
    const categorySelect = document.querySelector('#category');
    if (categorySelect) {
      categorySelect.innerHTML = categories.map(cat =>
        `<option value="${cat.id}" ${cat.id === operation.category_id ? 'selected' : ''}>
          ${cat.title}
        </option>`
      ).join('');
    }

    const amountInput = document.querySelector('#amount');
    const dateInput = document.querySelector('#date');
    const commentInput = document.querySelector('#comment');

    if (amountInput) amountInput.value = operation.amount || '';
    if (dateInput) dateInput.value = operation.date || '';
    if (commentInput) commentInput.value = operation.comment || '';

    const form = document.querySelector('.operation-form');
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        type: operation.type,
        category_id: parseInt(document.querySelector('#category')?.value),
        amount: parseFloat(document.querySelector('#amount')?.value),
        date: document.querySelector('#date')?.value,
        comment: document.querySelector('#comment')?.value || ''
      };

      await window.api.request(`/operations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      router.navigate('/operations');
      updateBalance();
    });
  } catch {
    alert('Ошибка загрузки операции');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
