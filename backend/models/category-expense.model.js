const TAFFY = require('taffy');
const db = require('../utils/db.utils');

const COLLECTION = 'categoriesExpense';
let categories = null;

function getStore() {
  if (!categories) {
    categories = TAFFY(db.get(COLLECTION));
  }
  return categories;
}

function persist() {
  db.set(COLLECTION, db.exportTaffy(getStore()));
}

class CategoryExpenseModel {
  static findAll(userId) {
    return getStore()({ user_id: userId }).get();
  }

  static findOne(params) {
    return getStore()(params).first();
  }

  static create(data) {
    const result = getStore().insert(data);
    persist();
    return result;
  }

  static update(params, title) {
    const category = getStore()(params);
    if (category) {
      category.update({ title: title });

      const updatedCategory = category.first();
      persist();
      return {
        id: updatedCategory.id,
        title: updatedCategory.title,
      };
    }
    return null;
  }

  static delete(filter) {
    getStore()(filter).remove();
    persist();
  }
}

module.exports = CategoryExpenseModel;
