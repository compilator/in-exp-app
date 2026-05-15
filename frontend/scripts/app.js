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

    if (e.target.closest('#addCategorySubmitBtn')) {
      e.preventDefault();
      submitAddCategoryModal();
    }

    if (e.target.closest('#confirmDeleteBtn')) {
      e.preventDefault();
      if (deleteModalState.operationId) {
        confirmDeleteOperation();
      } else {
        confirmDeleteCategory();
      }
    }
  });

  document.body.addEventListener('submit', (e) => {
    if (e.target.id === 'addCategoryForm') {
      e.preventDefault();
      submitAddCategoryModal();
    }
  });

  document.body.addEventListener('input', (e) => {
    if (e.target.id === 'addCategoryTitle') {
      e.target.classList.remove('is-invalid');
    }
  });

  document.body.addEventListener('hidden.bs.modal', (e) => {
    if (e.target && e.target.id === 'addCategoryModal') {
      document.getElementById('addCategoryTitle')?.classList.remove('is-invalid');
    }
    if (e.target && e.target.id === 'deleteModal') {
      deleteModalState.type = null;
      deleteModalState.id = null;
      deleteModalState.operationId = null;
    }
  });

  document.body.addEventListener('show.bs.modal', (e) => {
    if (e.target?.id !== 'deleteModal') return;
    const trigger = e.relatedTarget;
    if (!trigger) return;
    deleteModalState.operationId = trigger.getAttribute('data-operation-id');
    deleteModalState.type = trigger.getAttribute('data-category-type');
    deleteModalState.id = trigger.getAttribute('data-category-id');
  });

  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-period-btn');
      if (!btn) return;
      e.preventDefault();
      const container = btn.closest('.js-period-filters');
      setOperationsFilterPeriod(btn.dataset.period, container);
    });

    mainContent.addEventListener('change', (e) => {
      if (!e.target.matches('.js-date-from, .js-date-to')) return;
      const container = e.target.closest('.js-period-filters');
      if (!container || window.operationsFilter.period !== 'interval') return;

      const dateFrom = container.querySelector('.js-date-from')?.value || '';
      const dateTo = container.querySelector('.js-date-to')?.value || '';
      window.operationsFilter.dateFrom = dateFrom;
      window.operationsFilter.dateTo = dateTo;

      if (dateFrom && dateTo && dateFrom <= dateTo) {
        applyOperationsFilter();
      }
    });
  }

  router.init();
}

const deleteModalState = { type: null, id: null, operationId: null };

window.operationsFilter = { period: 'today', dateFrom: '', dateTo: '' };

function formatDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getOperationsFilterParams() {
  const { period, dateFrom, dateTo } = window.operationsFilter;
  const params = { period };
  if (period === 'interval' && dateFrom && dateTo) {
    params.dateFrom = dateFrom;
    params.dateTo = dateTo;
  }
  return params;
}

window.getOperationsFilterParams = getOperationsFilterParams;

function syncPeriodFilterUI(container) {
  if (!container) {
    container = document.querySelector('#main-content .js-period-filters');
  }
  if (!container) return;

  const { period } = window.operationsFilter;
  container.querySelectorAll('.js-period-btn').forEach((btn) => {
    const active = btn.dataset.period === period;
    btn.classList.toggle('btn-secondary', active);
    btn.classList.toggle('btn-outline-secondary', !active);
  });

  const intervalDates = container.querySelector('.js-interval-dates');
  if (intervalDates) {
    intervalDates.classList.toggle('d-none', period !== 'interval');
  }

  const from = container.querySelector('.js-date-from');
  const to = container.querySelector('.js-date-to');
  if (from && window.operationsFilter.dateFrom) from.value = window.operationsFilter.dateFrom;
  if (to && window.operationsFilter.dateTo) to.value = window.operationsFilter.dateTo;
}

function initPeriodFilterDates(container) {
  if (!container) return;
  const from = container.querySelector('.js-date-from');
  const to = container.querySelector('.js-date-to');
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (from && !from.value) {
    from.value = formatDateInputValue(monthStart);
  }
  if (to && !to.value) {
    to.value = formatDateInputValue(now);
  }
  window.operationsFilter.dateFrom = from?.value || '';
  window.operationsFilter.dateTo = to?.value || '';
}

function setOperationsFilterPeriod(period, container) {
  window.operationsFilter.period = period;
  if (period === 'interval') {
    initPeriodFilterDates(container);
  }
  syncPeriodFilterUI(container);
  applyOperationsFilter();
}

async function applyOperationsFilter() {
  const params = getOperationsFilterParams();
  if (document.querySelector('.operations-table')) {
    await loadOperations(params);
  }
  if (document.getElementById('incomeChart') && typeof window.initDashboard === 'function') {
    await window.initDashboard();
  }
}

function initPeriodFiltersOnPage() {
  const container = document.querySelector('#main-content .js-period-filters');
  if (!container) return;
  if (window.operationsFilter.period === 'interval') {
    initPeriodFilterDates(container);
  }
  syncPeriodFilterUI(container);
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
  router.addRoute('/income/categories/:id/edit', loadIncomeCategoryEditPage);
  router.addRoute('/expense/add', loadExpenseAddPage);
  router.addRoute('/expense/edit/:id', loadExpenseEditPage);
  router.addRoute('/expense/categories/:id/edit', loadExpenseCategoryEditPage);
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
  await updateBalance();
  initPeriodFiltersOnPage();
  loadScript('scripts/dashboard.js', () => {
    if (typeof window.initDashboard === 'function') {
      window.initDashboard().catch(() => {});
    }
  });
}

async function loadIncomePage() {
  await loadPageWithLayout('in.html');
  await loadIncomeCategories();
}

async function loadExpensePage() {
  await loadPageWithLayout('exp.html');
  await loadExpenseCategories();
}

async function loadOperationsPage() {
  await loadPageWithLayout('in-exp.html');
  initPeriodFiltersOnPage();
  await loadOperations(getOperationsFilterParams());
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

async function loadIncomeCategoryEditPage(params) {
  const id = params?.[0];
  await loadPageWithLayout('category-edit.html');
  const h1 = document.querySelector('#category-edit-heading');
  if (h1) h1.textContent = 'Редактирование категории доходов';
  await initCategoryEditForm('income', id);
}

async function loadExpenseCategoryEditPage(params) {
  const id = params?.[0];
  await loadPageWithLayout('category-edit.html');
  const h1 = document.querySelector('#category-edit-heading');
  if (h1) h1.textContent = 'Редактирование категории расходов';
  await initCategoryEditForm('expense', id);
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
    if (!window.api?.isAuthorized?.()) return;

    const data = await window.api.getBalance();

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

function openAddCategoryModal(type) {
  const modalEl = document.getElementById('addCategoryModal');
  if (!modalEl || !window.bootstrap) return;

  modalEl.dataset.catType = type;
  const titleEl = modalEl.querySelector('.modal-title');
  if (titleEl) {
    titleEl.textContent = type === 'income' ? 'Новая категория дохода' : 'Новая категория расхода';
  }

  const input = document.getElementById('addCategoryTitle');
  if (input) {
    input.value = '';
    input.classList.remove('is-invalid');
  }

  const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
  modalEl.addEventListener(
    'shown.bs.modal',
    () => {
      input?.focus();
    },
    { once: true }
  );
}

async function submitAddCategoryModal() {
  const modalEl = document.getElementById('addCategoryModal');
  const type = modalEl?.dataset?.catType;
  const input = document.getElementById('addCategoryTitle');
  if (!type || !modalEl) return;

  const title = input?.value?.trim();
  if (!title) {
    input?.classList.add('is-invalid');
    return;
  }
  input?.classList.remove('is-invalid');

  try {
    await window.api.createCategory(type, title);
    window.bootstrap.Modal.getInstance(modalEl)?.hide();
    if (type === 'income') {
      await loadIncomeCategories();
    } else {
      await loadExpenseCategories();
    }
  } catch (e) {
    alert(e.message || 'Ошибка создания категории');
  }
}

function normalizeCategoriesList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.categories)) return data.categories;
  return [];
}

function showCategoriesLoading(type) {
  const container = document.querySelector('.categories-list');
  if (!container) return;
  const label = type === 'income' ? 'доходов' : 'расходов';
  container.innerHTML = `<p class="text-muted mb-0">Загрузка категорий ${label}…</p>`;
}

function showCategoriesError(type, message) {
  const container = document.querySelector('.categories-list');
  if (!container) return;
  container.innerHTML = `<p class="text-danger mb-0">${escapeHtml(message)}</p>`;
}

async function fetchCategoriesFromBackend(type) {
  const data = await window.api.getCategories(type);
  return normalizeCategoriesList(data);
}

async function loadIncomeCategories() {
  showCategoriesLoading('income');
  try {
    const categories = await fetchCategoriesFromBackend('income');
    renderCategories(categories, 'income');
  } catch (e) {
    showCategoriesError('income', e.message || 'Не удалось загрузить категории доходов');
  }
}

async function loadExpenseCategories() {
  showCategoriesLoading('expense');
  try {
    const categories = await fetchCategoriesFromBackend('expense');
    renderCategories(categories, 'expense');
  } catch (e) {
    showCategoriesError('expense', e.message || 'Не удалось загрузить категории расходов');
  }
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function operationCategoryLabel(op) {
  if (op == null) return 'Без категории';
  const c = op.category;
  if (typeof c === 'string') return c || 'Без категории';
  return c?.title || 'Без категории';
}

function renderCategories(categories, type) {
  const container = document.querySelector('.categories-list');
  if (!container) return;

  const list = normalizeCategoriesList(categories);
  const categoryEditBase = type === 'income' ? '/income/categories' : '/expense/categories';

  const cards = list.map(cat => `
    <div class="category-card bg-white p-4" data-id="${cat.id}">
      <h3 class="category-title">${escapeHtml(cat.title)}</h3>
      <div class="d-flex gap-2 flex-wrap">
        <button type="button" class="btn-edit" onclick="router.navigate('${categoryEditBase}/${cat.id}/edit')">Редактировать</button>
        <button type="button" class="btn-delete"
          data-bs-toggle="modal"
          data-bs-target="#deleteModal"
          data-category-type="${type}"
          data-category-id="${cat.id}">Удалить</button>
      </div>
    </div>
  `).join('');

  const emptyCard = `
    <button type="button" class="empty-card-trigger no-dec border-0 bg-transparent p-0 d-inline-block" aria-label="Новая категория">
      <div class="empty-card">
        <span class="plus-icon">+</span>
      </div>
    </button>
  `;

  container.innerHTML = cards + emptyCard;

  container.querySelector('.empty-card-trigger')?.addEventListener('click', () => {
    openAddCategoryModal(type);
  });
}

async function confirmDeleteCategory() {
  const { type, id } = deleteModalState;
  if (!type || !id) return;

  try {
    await window.api.request(`/categories/${type}/${id}`, { method: 'DELETE' });
    const modalEl = document.getElementById('deleteModal');
    window.bootstrap?.Modal.getInstance(modalEl)?.hide();

    if (type === 'income') {
      await loadIncomeCategories();
    } else {
      await loadExpenseCategories();
    }
  } catch {
    alert('Ошибка удаления категории');
  }
}

async function loadOperations(filter) {
  try {
    const params = new URLSearchParams(filter ?? getOperationsFilterParams());
    const operations = await window.api.request(`/operations?${params}`);
    const list = Array.isArray(operations) ? operations : [];
    renderOperations(list);
  } catch {
    const tbody = document.querySelector('.operations-table tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Не удалось загрузить операции</td></tr>';
    }
  }
}

function renderOperations(operations) {
  const tbody = document.querySelector('.operations-table tbody');
  if (!tbody) return;

  if (!operations.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-muted py-3">Нет операций за выбранный период</td></tr>';
    return;
  }

  tbody.innerHTML = operations.map(op => `
    <tr>
      <td>${op.date || ''}</td>
      <td>${operationCategoryLabel(op)}</td>
      <td class="${op.type === 'income' ? 'income' : 'expense'}">
        ${op.type === 'income' ? '+' : '-'}${op.amount || 0} ₽
      </td>
      <td>${op.comment || ''}</td>
      <td>
        <button type="button" class="btn-edit" onclick="router.navigate('/${op.type}/edit/${op.id}')">
          <img src="images/pen.png" alt="Редактировать">
        </button>
        <button type="button" class="btn-delete"
          data-bs-toggle="modal"
          data-bs-target="#deleteModal"
          data-operation-id="${op.id}">
          <img src="images/trash.png" alt="Удалить">
        </button>
      </td>
    </tr>
  `).join('');
}

async function confirmDeleteOperation() {
  const id = deleteModalState.operationId;
  if (!id) return;

  try {
    await window.api.request(`/operations/${id}`, { method: 'DELETE' });
    const modalEl = document.getElementById('deleteModal');
    window.bootstrap?.Modal.getInstance(modalEl)?.hide();
    await loadOperations(getOperationsFilterParams());
    await updateBalance();
  } catch {
    alert('Ошибка удаления операции');
  }
}

async function initOperationForm(type) {
  try {
    const categories = await window.api.getCategories(type);

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

    const categories = await window.api.getCategories(operation.type);
    const categorySelect = document.querySelector('#category');
    if (categorySelect) {
      const selectedId = Number(operation.category_id);
      categorySelect.innerHTML = categories.map(cat =>
        `<option value="${cat.id}" ${Number(cat.id) === selectedId ? 'selected' : ''}>
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
        category_id: parseInt(document.querySelector('#category')?.value, 10),
        amount: parseFloat(document.querySelector('#amount')?.value),
        date: document.querySelector('#date')?.value,
        comment: document.querySelector('#comment')?.value || ''
      };

      try {
        await window.api.request(`/operations/${id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });

        router.navigate('/operations');
        updateBalance();
      } catch (err) {
        alert('Ошибка сохранения: ' + (err.message || 'неизвестная ошибка'));
      }
    });
  } catch {
    alert('Ошибка загрузки операции');
  }
}

async function initCategoryEditForm(type, id) {
  const cancelPath = type === 'income' ? '/income' : '/expense';

  try {
    const cat = await window.api.getCategory(type, id);

    const form = document.querySelector('.js-category-edit-form');
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    const titleInput = document.querySelector('#categoryTitle');
    if (titleInput) titleInput.value = cat.title || '';

    document.getElementById('categoryEditCancel')?.addEventListener('click', () => {
      router.navigate(cancelPath);
    });

    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.querySelector('#categoryTitle')?.value?.trim();
      if (!title) {
        alert('Введите название');
        return;
      }
      try {
        await window.api.updateCategory(type, id, title);
        router.navigate(cancelPath);
      } catch (err) {
        alert(err.message || 'Ошибка сохранения категории');
      }
    });
  } catch {
    alert('Не удалось загрузить категорию');
    router.navigate(cancelPath);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
