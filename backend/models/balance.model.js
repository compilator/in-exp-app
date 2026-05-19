const TAFFY = require('taffy');
const db = require('../utils/db.utils');

const COLLECTION = 'balances';
let balances = null;

function getStore() {
  if (!balances) {
    balances = TAFFY(db.get(COLLECTION));
  }
  return balances;
}

function persist() {
  db.set(COLLECTION, db.exportTaffy(getStore()));
}

class BalanceModel {
  static findOne(userId) {
    userId = parseInt(userId);
    let balance = getStore()({ user_id: userId }).first();
    if (!balance) {
      balance = this.create(userId);
    }
    return balance;
  }

  static create(userId) {
    const record = { user_id: parseInt(userId), balance: 0 };
    getStore().insert(record);
    persist();
    return record;
  }

  static update(userId, newBalance) {
    userId = parseInt(userId);
    const balance = this.findOne(userId);
    if (balance) {
      getStore()({ user_id: userId }).update({ balance: parseFloat(newBalance) });
      persist();
    }

    return newBalance;
  }
}

module.exports = BalanceModel;
