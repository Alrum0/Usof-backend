const BaseModel = require('./baseModel');

class PostStars extends BaseModel {
  constructor() {
    super('post_stars');
  }
}

module.exports = new PostStars();
