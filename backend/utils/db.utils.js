const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/db.json');

let data = null;

function loadInitialData() {
  return {
    users: require('../data/users-initial.json'),
    categoriesIncome: require('../data/categories-income-initial.json'),
    categoriesExpense: require('../data/categories-expense-initial.json'),
    operations: require('../data/operations-initial.json'),
    balances: require('../data/balances-initial.json'),
  };
}

function mergeWithInitial(stored) {
  const initial = loadInitialData();
  const merged = { ...initial, ...stored };
  for (const key of Object.keys(initial)) {
    if (!Array.isArray(merged[key]) || merged[key].length === 0) {
      merged[key] = initial[key];
    }
  }
  return merged;
}

function init() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const stored = JSON.parse(raw);
      const merged = mergeWithInitial(stored);
      data = merged;
      // Сохраняем только если данные реально изменились (не при каждом старте)
      if (JSON.stringify(stored) !== JSON.stringify(merged)) {
        save();
      }
      return;
    } catch (err) {
      console.warn('Не удалось прочитать db.json, используются начальные данные:', err.message);
    }
  }
  data = loadInitialData();
  save();
}

/** Экспорт всех записей из Taffy (вызов: exportTaffy(store), не store.get). */
function exportTaffy(store) {
  return store().get().map((record) => {
    const { ___id, ___s, ...clean } = record;
    return clean;
  });
}

function save() {
  if (!data) return;
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function get(key) {
  if (!data) init();
  if (!Array.isArray(data[key])) {
    data[key] = [];
    save();
  }
  return data[key];
}

function set(key, records) {
  if (!data) init();
  data[key] = records;
  save();
}

module.exports = {
  init,
  save,
  get,
  set,
  exportTaffy,
};
