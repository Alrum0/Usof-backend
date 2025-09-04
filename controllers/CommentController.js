const ApiError = require('../error/ApiError');

class CommentController {
  async getComment(req, res, next) {}
  async getAllLikesForComment(req, res, next) {}
  async createLikeForComment(req, res, next) {}
  async updateComment(req, res, next) {}
  async deleteComment(req, res, next) {}
  async deleteLikeForComment(req, res, next) {}
}

module.exports = new CommentController();
