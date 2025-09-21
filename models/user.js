const ApiError = require('../error/ApiError');
const BaseModel = require('./baseModel');
const db = require('../db');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async getUserRating(userId) {
    const [rows] = await db.query(
      `SELECT COUNT(l.id) AS rating
       FROM posts p
       LEFT JOIN likes l ON p.id = l.postId
       WHERE p.authorId = ?`,
      [userId]
    );
    return rows[0].rating || 0;
  }

  async findByLoginOrName(search) {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tableName} WHERE login LIKE ? OR fullName LIKE ?`,
      [`%${search}%`, `%${search}%`]
    );
    return rows;
  }

  async updateStarsBalance(userId, delta) {
    const user = await this.findById(userId);
    if (!user) {
      throw ApiError.badRequest('User not found');
    }

    const newBalance = user.stars_balance + delta;
    if (newBalance < 0) {
      throw ApiError.badRequest('Not enough stars');
    }

    return this.update(userId, { stars_balance: newBalance });
  }
}

module.exports = new User();
