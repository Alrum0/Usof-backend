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

  async deleteByPostId(postId) {
    await db.query('DELETE FROM post_categories WHERE postId = ?', [postId]);
  }

  async findCategoriesByPostId(postId) {
    const [rows] = await db.query(
      `SELECT c.id, c.title, c.description
    FROM post_categories pc
    INNER JOIN categories c ON pc.categoryId = c.id
    WHERE pc.postId = ? `,
      [postId]
    );
    return rows;
  }
}

module.exports = new PostCategories();
