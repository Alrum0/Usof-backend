const BaseModel = require('./baseModel');

class Categories extends BaseModel {
  constructor() {
    super('categories');
  }
}

module.exports = new Categories();
