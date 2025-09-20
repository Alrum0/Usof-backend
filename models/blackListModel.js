const BaseModel = require('./baseModel');
const db = require('../db');

class BlackList extends BaseModel {
  constructor() {
    super('black_list');
  }
}

module.exports = new BlackList();
