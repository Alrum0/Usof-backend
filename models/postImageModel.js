const BaseModel = require('./baseModel');

class PostImage extends BaseModel {
  constructor() {
    super('post_image');
  }
}

module.exports = new PostImage();
