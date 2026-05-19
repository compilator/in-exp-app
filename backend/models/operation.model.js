const TAFFY = require('taffy');
const moment = require('moment');
const db = require('../utils/db.utils');

const COLLECTION = 'operations';
let operations = null;

function getStore() {
  if (!operations) {
    operations = TAFFY(db.get(COLLECTION));
  }
  return operations;
}

function persist() {
  db.set(COLLECTION, db.exportTaffy(getStore()));
}

class OperationModel {
  static findAll(userId, filter) {
    const { period, dateFrom, dateTo } = filter;
    let today = new Date();
    let dateFilterFrom = moment(today);
    let dateFilterTo = moment(today);

    switch (period) {
      case 'week':
        dateFilterFrom = dateFilterFrom.subtract(7, 'days');
        break;
      case 'month':
        dateFilterFrom = dateFilterFrom.subtract(1, 'month');
        break;
      case 'year':
        dateFilterFrom = dateFilterFrom.subtract(1, 'year');
        break;
      case 'all':
        dateFilterFrom = null;
        dateFilterTo = null;
        break;
      case 'interval':
        if (dateFrom && dateTo) {
          dateFilterFrom = moment(dateFrom);
          dateFilterTo = moment(dateTo);
        }
        break;
    }

    const operationModels = getStore()({ user_id: userId }).get();

    const filteredOperations =
      dateFilterTo && dateFilterFrom
        ? operationModels.filter((operationModel) => {
            const operationDate = moment(operationModel.date);
            return (
              dateFilterFrom.isSameOrBefore(operationDate, 'day') &&
              dateFilterTo.isSameOrAfter(operationDate, 'day')
            );
          })
        : operationModels;

    return filteredOperations.sort((a, b) => (moment(a.date).isBefore(b.date) ? 1 : -1));
  }

  static findOne(params) {
    return getStore()(params).first();
  }

  static create(data) {
    const result = getStore().insert(data);
    persist();
    return result;
  }

  static update(params, data) {
    const category = getStore()(params);
    if (category) {
      category.update(data);

      const updatedCategory = category.first();
      persist();
      return {
        id: updatedCategory.id,
        type: updatedCategory.category_expense_id ? 'expense' : 'income',
        amount: updatedCategory.amount,
        date: updatedCategory.date,
        comment: updatedCategory.comment,
      };
    }
    return null;
  }

  static delete(filter) {
    getStore()(filter).remove();
    persist();
  }
}

module.exports = OperationModel;
