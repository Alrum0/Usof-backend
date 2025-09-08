const BaseModel = require('./baseModel');
const db = require('../db');

class Posts extends BaseModel {
  constructor() {
    super('posts');
  }

  async findAllWithPagination(limit, offset) {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows;
  }

  async countAll() {
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
  }
}

module.exports = new Posts();
