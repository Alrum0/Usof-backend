const ApiError = require('../error/ApiError');
const Post = require('../models/postModel');
const Categories = require('../models/categoriesModel');
const PostCategories = require('../models/postCategoriesModel');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class PostControllers {
  async getAllPosts(req, res, next) {
    try {
      let { limit, page } = req.query;

      page = page || 1;
      limit = limit || 10;
      let offset = page * limit - limit;

      const posts = await Post.findAllWithPagination(limit, offset);
      const total = await Post.countAll();

      return res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: posts,
      });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Failed to fetch posts'));
    }
  }
  async getPost(req, res, next) {
    try {
      const { post_id } = req.params;

      const post = await Post.findById(post_id);
      if (!post) {
        return next(ApiError.badRequest('Post not found'));
      }

      return res.json(post);
    } catch (err) {
      console.error(err);
    }
  }
  async getAllCommentsForPost(req, res, next) {}
  async createCommentForPost(req, res, next) {}
  async getAllCategories(req, res, next) {}
  async getAllLikesForPost(req, res, next) {}
  async createPost(req, res, next) {
    try {
      const { title, content } = req.body;
      const authorId = req.user.id;

      let categories = req.body.categories;
      if (!Array.isArray(categories)) {
        categories = [categories];
      }

      if (!title || !content) {
        return next(ApiError.badRequest('Ttile and content are required'));
      }

      if (!req.files || !req.files.image) {
        return next(ApiError.badRequest('No file uploaded'));
      }
      const { image } = req.files;

      const fileName = uuid.v4() + '.webp';
      const filepath = path.resolve(__dirname, '..', 'static', fileName);

      await sharp(image.data).webp({ quality: 80 }).toFile(filepath);

      const post = await Post.create({
        title,
        content,
        authorId,
        image: fileName,
      });

      if (!Array.isArray(categories) || categories.length === 0) {
        return next(
          ApiError.badRequest('Post must have at least one category')
        );
      }

      if (Array.isArray(categories) && categories.length > 0) {
        const validCategories = await Categories.checkCategories(categories);
        if (validCategories.length !== categories.length) {
          return next(
            ApiError.badRequest('One or more categories do not exists')
          );
        }
        await PostCategories.addCategories(post.id, categories);
      }

      res.json({ message: 'Post created successfully' });
    } catch (err) {
      console.error(err);
    }
  }
  async createLike(req, res, next) {}
  async updatePost(req, res, next) {}
  async deletePost(req, res, next) {
    try {
      const { post_id } = req.params;

      const post = await Post.findById(post_id);
      if (!post) {
        return next(ApiError.badRequest('Post not found'));
      }

      if (post.image) {
        const img = path.resolve(__dirname, '..', 'static', post.image);
        if (fs.existsSync(img)) {
          fs.unlinkSync(img);
        }
      }

      await Post.delete(post_id);
      return res.json('Post deleted successfully');
    } catch (err) {
      console.error(err);
      next(ApiError.internal('Failed to delete post'));
    }
  }
  async deleteLike(req, res, next) {}
}

module.exports = new PostControllers();
