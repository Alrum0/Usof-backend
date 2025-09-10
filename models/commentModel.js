const BaseModel = require('./baseModel');

class Comment extends BaseModel {
  constructor() {
    super('comments');
  }
}

module.exports = new Comment();
