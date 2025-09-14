const BaseModel = require('./baseModel');
const db = require('../db');

class CommentLike extends BaseModel {
  constructor() {
    super('comment_likes');
  }

  async findLikesWithUserInformation(comment_id) {
    const [rows] = await db.query(
      `SELECT l.userId, u.fullName, u.login, u.avatar
      FROM comment_likes l
      JOIN users u ON l.userId = u.id
      WHERE l.commentId = ?
      ORDER BY l.createdAt DESC`,
      [comment_id]
    );
    return rows;
  }
}

module.exports = new CommentLike();
