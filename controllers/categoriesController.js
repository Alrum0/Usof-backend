const ApiError = require('../error/ApiError');
const categoriesModel = require('../models/categoriesModel');

class CategoriesController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoriesModel.findAll();
      return res.json(categories);
    } catch (err) {
      console.error(err);
    }
  }
  async getCategory(req, res, next) {
    try {
      const { category_id } = req.params;

      const category = await categoriesModel.findById(category_id);
      if (!category) {
        return next(ApiError.badRequest('Category not found'));
      }

      return res.json(category);
    } catch (err) {
      console.error(err);
    }
  }
  async getAllPostsForCategory(req, res, next) {
    try {
      let { category_id, page, limit } = req.params;
      page = page | 1;
      limit = limit | 10;
      let offset = page * limit - limit;

      const posts = await categoriesModel.findByCategoryPaginated(
        category_id,
        limit,
        offset
      );

      if (!posts || posts.length === 0) {
        return next(ApiError.badRequest('No posts found for this category'));
      }

      return res.json({
        page,
        limit,
        count: posts.length,
        posts,
      });
    } catch (err) {
      console.error(err);
    }
  }
  async createCategory(req, res, next) {
    try {
      const { title, description } = req.body;

      if (req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden(
            'You do not have permission to access this resource'
          )
        );
      }

      if (!title) {
        return next(ApiError.badRequest('Title is required'));
      }

      await categoriesModel.create({
        title,
        description,
      });

      return res.json({ message: 'Category created successfully' });
    } catch (err) {
      console.error(err);
    }
  }
  async updateCategory(req, res, next) {
    try {
      const { category_id } = req.params;
      let { title, description } = req.body;

      if (req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden(
            'You do not have permission to access this resource'
          )
        );
      }

      const categories = await categoriesModel.findById(category_id);
      if (!categories) {
        return next(ApiError.badRequest('Category not found'));
      }

      if (title.trim() === '') {
        return next(ApiError.badRequest('Field "title" cannot be empty'));
      }

      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      if (
        Object.keys(updateData).length < 0 ||
        Object.keys(updateData).length === 0
      ) {
        return next(ApiError.badRequest('No fields to update'));
      }

      await categoriesModel.update(category_id, updateData);
      return res.json({ message: 'Categrory updated successfully' });
    } catch (err) {
      console.error(err);
    }
  }
  async deleteCategory(req, res, next) {
    try {
      const { category_id } = req.params;

      if (req.user.role !== 'ADMIN') {
        return next(
          ApiError.forbidden(
            'You do not have permission to access this resource'
          )
        );
      }

      const categories = await categoriesModel.findById(category_id);
      if (!categories) {
        return next(ApiError.badRequest('Category not found'));
      }

      await categoriesModel.delete(category_id);
      return res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new CategoriesController();
