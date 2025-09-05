const BaseModel = require('./baseModel');

class User extends BaseModel {
  constructor() {
    super('users');
  }
}

module.exports = new User();
