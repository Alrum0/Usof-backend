const BaseModel = require('./baseModel');

class Posts extends BaseModel {
  constructor() {
    super('posts');
  }
}

module.exports = new Posts();
