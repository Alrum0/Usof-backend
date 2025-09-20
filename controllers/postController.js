const ApiError = require('../error/ApiError');

const Post = require('../models/postModel');
const Categories = require('../models/categoriesModel');
const PostCategories = require('../models/postCategoriesModel');
const PostImage = require('../models/postImageModel');
const Comment = require('../models/commentModel');
const Like = require('../models/likeModel');

const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class PostControllers {
  async getAllPosts(req, res, next) {
    try {
      let { limit, page, sort = 'date_desc' } = req.query;

      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      let offset = page * limit - limit;

      // const posts = await Post.findAllWithPagination(limit, offset);
      const posts = await Post.findAllWithPaginationAndSorting(
        limit,
        offset,
        sort
      );
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

      const post = await Post.findPostWithImagesAndStars(post_id);
      if (!post) {
        return next(ApiError.badRequest('Post not found'));
      }

      return res.json(post);
    } catch (err) {
      console.error(err);
    }
  }
  async getAllCommentsForPost(req, res, next) {
    try {
      const { post_id } = req.params;

      const comments = await Comment.findAll({ postId: post_id });
      return res.json(comments);
    } catch (err) {
      console.error(err);
      next(ApiError.internal('Failed to fetch comments'));
    }
  }
  async createCommentForPost(req, res, next) {
    try {
      const { post_id } = req.params;
      const { content } = req.body;
      const authorId = req.user.id;

      const post = await Post.findById(post_id);
      if (!post) {
        return next(ApiError.badRequest('Post not found'));
      }

      if (post.status === 'INACTIVE') {
        return next(ApiError.badRequest('Cannot comment on inactive post'));
      }

      if (!content) {
        next(ApiError.badRequest('Content is required'));
      }

      await Comment.create({
        postId: post_id,
        authorId,
        content,
      });

      res.json({ message: 'Comment created successfully' });
    } catch (err) {
      console.error(err);
      next(ApiError.badRequest('Failed to create comment'));
    }
  }
  async getAllCategories(req, res, next) {
    try {
      const { post_id } = req.params;

      const post = await Post.findById(post_id);
      if (!post) {
        return next(ApiError.badRequest('Post not found'));
      }

      const categories = await PostCategories.findCategoriesByPostId(post_id);
      return res.json(categories);
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Failed to fetch categories'));
    }
  }
  async getAllLikesForPost(req, res, next) {
    try {
      const { post_id } = req.params;

      const post = await Post.findById(post_id);
      if (!post) {
        return next(ApiError.badRequest('Post not found'));
      }

      const likes = await Post.findLikesWithUserInformation(post_id);

      const result = {
        count: likes.length,
        users: likes,
      };

      return res.json(result);
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Failed to fetch likes'));
    }
  }
  async createPost(req, res, next) {
    try {
      const { title, content } = req.body;
      const authorId = req.user.id;

      let categories = Array.isArray(req.body.categories)
        ? req.body.categories
        : [req.body.categories];

      if (!title || !content) {
        return next(ApiError.badRequest('Ttile and content are required'));
      }

      if (!req.files || !req.files.image) {
        return next(ApiError.badRequest('No file uploaded'));
      }

      let images = Array.isArray(req.files.image)
        ? req.files.image
        : [req.files.image];

      const post = await Post.create({
        title,
        content,
        authorId,
      });

      await Promise.all(
        images.map(async (img) => {
          const fileName = uuid.v4() + '.webp';
          const filePath = path.resolve(__dirname, '..', 'static', fileName);

          await sharp(img.data).webp({ quality: 80 }).toFile(filePath);
          await PostImage.create({ postId: post.id, fileName });
        })
      );

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
  async createLike(req, res, next) {
    try {
      const { post_id } = req.params;
      const userId = req.user.id;

      const post = await Post.findById(post_id);
      if (!post) {
        return next(ApiError.badRequest('Posts not found'));
      }

      const existing = await Like.findOne({ userId, postId: post_id });
      if (existing) {
        return next(ApiError.badRequest('You already liked this post'));
      }

      await Like.create({ userId, postId: post_id });
      return res.json({ message: 'Like added successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Failed to add like'));
    }
  }
  async updatePost(req, res, next) {
    try {
      const { post_id } = req.params;
      let { title, content, status } = req.body;

      const post = await Post.findById(post_id);
      if (!post) {
        return next(ApiError.badRequest('Post not found'));
      }

      if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden('You do not have permission to edit this post')
        );
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (status !== undefined) updateData.status = status;

      if (status !== 'ACTIVE' && status !== 'INACTIVE') {
        return next(ApiError.badRequest('Invalid role (ACTIVE or INACTIVE)'));
      }

      if (Object.keys(updateData).length > 0) {
        await Post.update(post_id, updateData);
      }

      let categories = Array.isArray(req.body.categories)
        ? req.body.categories
        : [req.body.categories];

      if (categories) {
        const validCategories = await Categories.checkCategories(categories);
        if (validCategories.length !== categories.length) {
          return next(
            ApiError.badRequest('One or more categories do not exist')
          );
        }

        await PostCategories.deleteByPostId(post_id);
        await PostCategories.addCategories(post_id, categories);
      }

      if (req.files && req.files.image) {
        let images = Array.isArray(req.files.image)
          ? req.files.image
          : [req.files.image];

        const oldImages = await PostImage.findAll({ postId: post_id });

        try {
          await Promise.all(
            images.map(async (img) => {
              const fileName = uuid.v4() + '.webp';
              const filePath = path.resolve(
                __dirname,
                '..',
                'static',
                fileName
              );

              await sharp(img.data).webp({ quality: 80 }).toFile(filePath);
              await PostImage.create({ postId: post_id, fileName });
            })
          );

          await Promise.all(
            oldImages.map(async (img) => {
              const filePath = path.resolve(
                __dirname,
                '..',
                'static',
                img.fileName
              );
              try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                await PostImage.delete(img.id);
              } catch (err) {
                console.error(`Failed to delete image ${img.fileName}:`, err);
              }
            })
          );
        } catch (err) {
          console.error('Failed to save new images', err);
          return next(ApiError.internal('Failed to update post images'));
        }
      }

      return res.json({ message: 'Post updated successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Failed to update post'));
    }
  }
  async deletePost(req, res, next) {
    try {
      const { post_id } = req.params;

      const post = await Post.findById(post_id);
      if (!post) {
        return next(ApiError.badRequest('Post not found'));
      }

      if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden('You do not have permission to delete this post')
        );
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
      return next(ApiError.internal('Failed to delete post'));
    }
  }
  async deleteLike(req, res, next) {
    try {
      const { post_id } = req.params;
      const userId = req.user.id;

      const like = await Like.findOne({ userId, postId: post_id });
      if (!like) {
        return next(
          ApiError.badRequest('Like not found for this post by this user')
        );
      }

      await Like.delete(like.id);
      return res.json({ message: 'Like removed successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.badRequest('Failed to remove like'));
    }
  }

  async findFollowingPosts(req, res, next) {
    try {
      const userId = req.user.id;

      const posts = await Post.findFollowingPosts(userId);
      return res.json(posts);
    } catch (err) {
      console.error(err);
      return next(
        ApiError.internal('Failed to fetch posts from followed users')
      );
    }
  }
}

module.exports = new PostControllers();
