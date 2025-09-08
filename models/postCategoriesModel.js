const BaseModel = require('./baseModel');
const db = require('../db');

class PostCategories extends BaseModel {
  constructor() {
    super('post_categories');
  }

  async addCategories(postId, categories) {
    const values = categories.map((catId) => [postId, catId]);
    await db.query(
      `INSERT INTO ${this.tableName} (postId, categoryId) VALUES ?`,
      [values]
    );
  }
}

module.exports = new PostCategories();
