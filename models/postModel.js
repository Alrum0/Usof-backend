const BaseModel = require('./baseModel');
const db = require('../db');

class Posts extends BaseModel {
  constructor() {
    super('posts');
  }

  // async findAllWithPagination(limit, offset) {
  //   const [rows] = await db.query(
  //     `SELECT p.*,
  //           COALESCE(JSON_ARRAYAGG(pi.fileName), JSON_ARRAY()) AS images
  //    FROM posts p
  //    LEFT JOIN post_image pi ON p.id = pi.postId
  //    GROUP BY p.id
  //    ORDER BY p.publishDate DESC
  //    LIMIT ? OFFSET ?`,
  //     [limit, offset]
  //   );

  //   return rows;
  // }

  async findAllWithPagination(limit, offset) {
    const [rows] = await db.query(
      `SELECT 
        p.*,
        COALESCE(JSON_ARRAYAGG(pi.fileName), JSON_ARRAY()) AS images,
        COALESCE(SUM(ps.amount), 0) AS stars
     FROM posts p
     LEFT JOIN post_image pi ON p.id = pi.postId
     LEFT JOIN post_stars ps ON p.id = ps.postId
     GROUP BY p.id
     ORDER BY p.publishDate DESC
     LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows;
  }

  async countAll() {
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
  }

  async findLikesWithUserInformation(post_id) {
    const [rows] = await db.query(
      `SELECT l.userId, u.fullName, u.login, u.avatar
      FROM likes l
      JOIN users u ON l.userId = u.id
      WHERE l.postId = ?
      ORDER BY l.createdAt DESC`,
      [post_id]
    );
    return rows;
  }

  // async findPostWithImages(postId) {
  //   const [rows] = await db.query(
  //     `SELECT p.*,
  //           COALESCE(JSON_ARRAYAGG(pi.fileName), JSON_ARRAY()) AS images
  //    FROM posts p
  //    LEFT JOIN post_image pi ON p.id = pi.postId
  //    WHERE p.id = ?
  //    GROUP BY p.id`,
  //     [postId]
  //   );

  //   return rows[0] || null;
  // }

  async findPostWithImagesAndStars(postId) {
    const [rows] = await db.query(
      `SELECT 
        p.*,
        COALESCE(JSON_ARRAYAGG(pi.fileName), JSON_ARRAY()) AS images,
        COALESCE(SUM(ps.stars), 0) AS stars
     FROM posts p
     LEFT JOIN post_image pi ON p.id = pi.postId
     LEFT JOIN post_stars ps ON p.id = ps.postId
     WHERE p.id = ?
     GROUP BY p.id`,
      [postId]
    );

    return rows[0] || null;
  }
}

module.exports = new Posts();
