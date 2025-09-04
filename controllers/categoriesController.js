const ApiError = require('../error/ApiError');

class CategoriesController {
  async getAllCategories(req, res, next) {}
  async getCategory(req, res, next) {}
  async getAllPostsForCategory(req, res, next) {}
  async createCategory(req, res, next) {}
  async updateCategory(req, res, next) {}
  async deleteCategory(req, res, next) {}
}

module.exports = new CategoriesController();
