const BaseModel = require('./baseModel');
const db = require('../db');

class Subscription extends BaseModel {
  constructor() {
    super('subscriptions');
  }

  async getFollowers(userId) {
    const [rows] = await db.query(
      `SELECT u.id, u.fullName, u.login, u.avatar
       FROM subscriptions s
       JOIN users u ON s.followerId = u.id
       WHERE s.followingId = ?`,
      [userId]
    );
    return rows;
  }
  async getFollowing(userId) {
    const [rows] = await db.query(
      `SELECT u.id, u.fullName, u.login, u.avatar
       FROM subscriptions s
       JOIN users u ON s.followingId = u.id
       WHERE s.followerId = ?`,
      [userId]
    );
    return rows;
  }
}

module.exports = new Subscription();
