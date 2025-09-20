const ApiError = require('../error/ApiError');
const Comment = require('../models/commentModel');
const CommentLike = require('../models/commentLikeModel');

class CommentController {
  async getComment(req, res, next) {
    try {
      const { comment_id } = req.params;

      const comment = await Comment.findById(comment_id);
      if (!comment) {
        return next(ApiError.badRequest('Comment not found'));
      }

      return res.json(comment);
    } catch (err) {
      console.error(err);
      return next(ApiError.badRequest('Failed to fetch comments'));
    }
  }
  async getAllLikesForComment(req, res, next) {
    try {
      const { comment_id } = req.params;

      const comment = await Comment.findById(comment_id);
      if (!comment) {
        return next(ApiError.badRequest('Comment not found'));
      }

      const likes = await CommentLike.findLikesWithUserInformation(comment_id);

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
  async createLikeForComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const userId = req.user.id;

      const comment = await Comment.findById(comment_id);
      if (!comment) {
        return next(ApiError.badRequest('Comment not found'));
      }

      const existing = await CommentLike.findOne(
        { userId },
        { commentId: comment_id }
      );

      if (existing) {
        return next(ApiError.badRequest('You already liked thi comment'));
      }

      await CommentLike.create({ userId, commentId: comment_id });
      return res.json({ message: 'Like added successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Failed to add like to comment'));
    }
  }
  async updateComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      let { content } = req.body;

      const comment = await Comment.findById(comment_id);
      if (!comment) {
        return next(ApiError.badRequest('Comment not found'));
      }

      if (comment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden('You do not have permission to edit this comment')
        );
      }

      if (content.trim() === '') {
        return next(ApiError.badRequest('Field "content" cannot be empty'));
      }

      await Comment.update(comment_id, { content });
      return res.json({ message: 'Comment updated successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.badRequest('Failed to update comment'));
    }
  }
  async deleteComment(req, res, next) {
    try {
      const { comment_id } = req.params;

      const comment = await Comment.findById(comment_id);
      if (!comment) {
        return next(ApiError.badRequest('Comment not found'));
      }

      if (comment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden(
            'You do not have permission to delete this comment'
          )
        );
      }

      Comment.delete(comment_id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.badRequest('Failed to delete comment'));
    }
  }
  async deleteLikeForComment(req, res, next) {
    try {
      const { comment_id } = req.params;
      const userId = req.user.id;

      const like = await CommentLike.findOne({ userId, commentId: comment_id });
      if (!like) {
        return next(ApiError.badRequest('Like not found for this comment'));
      }

      await CommentLike.delete(like.id);
      return res.json({ message: 'Like removed successfully' });
    } catch (err) {
      console.error(err);
      return next(ApiError.internal('Failed to delete like'));
    }
  }
}

module.exports = new CommentController();
