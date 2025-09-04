const ApiError = require('../error/ApiError');

class PostControllers {
  async getAllPosts(req, res, next) {}
  async getPost(req, res, next) {}
  async getAllCommentsForPost(req, res, next) {}
  async createCommentForPost(req, res, next) {}
  async getAllCategories(req, res, next) {}
  async getAllLikesForPost(req, res, next) {}
  async createPost(req, res, next) {}
  async createLike(req, res, next) {}
  async updatePost(req, res, next) {}
  async deletePost(req, res, next) {}
  async deleteLike(req, res, next) {}
}

module.exports = new PostControllers();
