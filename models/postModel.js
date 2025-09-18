const BaseModel = require('./baseModel');
const db = require('../db');

class Posts extends BaseModel {
  constructor() {
    super('posts');
  }

  async findAllWithPaginationAndSorting(limit, offset, sort) {
    let orderBySql;

    switch (sort) {
      case 'likes_desc':
        orderBySql = 'ORDER BY likes_count DESC';
        break;
      case 'likes_asc':
        orderBySql = 'ORDER BY likes_count ASC';
        break;
      case 'date_asc':
        orderBySql = 'ORDER BY p.publishDate ASC';
        break;
      case 'date_desc':
      default:
        orderBySql = 'ORDER BY p.publishDate DESC';
        break;
    }

    const [rows] = await db.query(
      `
      SELECT 
        p.id,
        p.title,
        p.content,
        p.publishDate,
        u.fullName AS authorName,
        u.avatar AS authorAvatar,
        COALESCE(JSON_ARRAYAGG(pi.fileName), JSON_ARRAY()) AS images,
        COUNT(DISTINCT l.id) AS likes_count,
        COALESCE(SUM(ps.stars), 0) AS stars
      FROM posts p
      JOIN users u ON p.authorId = u.id
      LEFT JOIN post_image pi ON pi.postId = p.id
      LEFT JOIN likes l ON l.postId = p.id
      LEFT JOIN post_stars ps ON ps.postId = p.id
      GROUP BY p.id
      ${orderBySql}
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    return rows;
  }

  async findAllWithPagination(limit, offset) {
    const [rows] = await db.query(
      `SELECT 
        p.*,
        COALESCE(JSON_ARRAYAGG(pi.fileName), JSON_ARRAY()) AS images,
        COALESCE(SUM(ps.stars), 0) AS stars
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

  async findFollowingPosts(userId) {
    const [rows] = await db.query(
      `SELECT p.* 
       FROM posts p
       INNER JOIN subscriptions s ON p.authorId = s.followingId
       WHERE s.followerId = ?
       ORDER BY p.publishDate DESC`,
      [userId]
    );
    return rows;
  }

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
