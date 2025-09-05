const BaseModel = require('./baseModel');

class Token extends BaseModel {
  constructor() {
    super('tokens');
  }
}

module.exports = new Token();
