const TAFFY = require('taffy');
const db = require('../utils/db.utils');

const COLLECTION = 'users';
let users = null;

function getStore() {
  if (!users) {
    users = TAFFY(db.get(COLLECTION));
  }
  return users;
}

function persist() {
  db.set(COLLECTION, db.exportTaffy(getStore()));
}

class UserModel {
  static findOne(params) {
    return getStore()(params).first();
  }

  static create(data) {
    const result = getStore().insert(data);
    persist();
    return result;
  }

  static clearToken(email) {
    getStore()({ email: email }).update({ refreshToken: null });
    persist();
  }

  static setToken(email, token) {
    getStore()({ email: email }).update({ refreshToken: token });
    persist();
  }
}

module.exports = UserModel;
